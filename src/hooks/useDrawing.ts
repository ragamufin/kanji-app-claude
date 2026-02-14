import { useReducer, useCallback, useRef, MutableRefObject } from 'react';
import { Point, StrokeMode, pointsToPath } from '../utils/strokeUtils';

export interface Stroke {
  id: number;
  path: string;
  color: string;
  strokeWidth: number;
  isFilled: boolean;
}

interface DrawingState {
  strokes: Stroke[];
  currentPath: string;
  currentIsFilled: boolean;
  nextId: number;
}

type DrawingAction =
  | { type: 'STROKE_START'; path: string; isFilled: boolean }
  | { type: 'STROKE_MOVE'; path: string; isFilled: boolean }
  | { type: 'STROKE_END'; stroke: Omit<Stroke, 'id'> }
  | { type: 'UNDO' }
  | { type: 'CLEAR' };

function drawingReducer(state: DrawingState, action: DrawingAction): DrawingState {
  switch (action.type) {
    case 'STROKE_START':
    case 'STROKE_MOVE':
      return { ...state, currentPath: action.path, currentIsFilled: action.isFilled };
    case 'STROKE_END':
      return {
        ...state,
        strokes: [...state.strokes, { ...action.stroke, id: state.nextId }],
        currentPath: '',
        currentIsFilled: false,
        nextId: state.nextId + 1,
      };
    case 'UNDO':
      return { ...state, strokes: state.strokes.slice(0, -1) };
    case 'CLEAR':
      return { ...state, strokes: [], currentPath: '', currentIsFilled: false };
  }
}

const initialState: DrawingState = {
  strokes: [],
  currentPath: '',
  currentIsFilled: false,
  nextId: 0,
};

export interface UseDrawingResult {
  strokes: Stroke[];
  currentPath: string;
  currentIsFilled: boolean;
  pointsHistoryRef: MutableRefObject<Point[][]>;
  onTouchStart: (x: number, y: number) => void;
  onTouchMove: (x: number, y: number) => void;
  onTouchEnd: () => void;
  undo: () => void;
  clear: () => void;
}

export function useDrawing(
  strokeColor: string,
  strokeWidth: number,
  strokeMode: StrokeMode
): UseDrawingResult {
  const [state, dispatch] = useReducer(drawingReducer, initialState);

  const pointsRef = useRef<Point[]>([]);
  const pointsHistoryRef = useRef<Point[][]>([]);
  const rafRef = useRef<number | null>(null);

  // Store latest values in refs so callbacks always read current state
  const strokeColorRef = useRef(strokeColor);
  const strokeWidthRef = useRef(strokeWidth);
  const strokeModeRef = useRef(strokeMode);
  strokeColorRef.current = strokeColor;
  strokeWidthRef.current = strokeWidth;
  strokeModeRef.current = strokeMode;

  const schedulePathUpdate = useCallback((actionType: 'STROKE_START' | 'STROKE_MOVE') => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const { path, isFilled } = pointsToPath(
        pointsRef.current,
        strokeModeRef.current,
        strokeWidthRef.current
      );
      dispatch({ type: actionType, path, isFilled });
    });
  }, []);

  const onTouchStart = useCallback((x: number, y: number) => {
    pointsRef.current = [{ x, y, timestamp: Date.now() }];
    // Flush immediately on start for responsiveness
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const { path, isFilled } = pointsToPath(
      pointsRef.current,
      strokeModeRef.current,
      strokeWidthRef.current
    );
    dispatch({ type: 'STROKE_START', path, isFilled });
  }, []);

  const onTouchMove = useCallback(
    (x: number, y: number) => {
      pointsRef.current.push({ x, y, timestamp: Date.now() });
      schedulePathUpdate('STROKE_MOVE');
    },
    [schedulePathUpdate]
  );

  const onTouchEnd = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (pointsRef.current.length > 0) {
      const { path, isFilled } = pointsToPath(
        pointsRef.current,
        strokeModeRef.current,
        strokeWidthRef.current
      );
      dispatch({
        type: 'STROKE_END',
        stroke: {
          path,
          color: strokeColorRef.current,
          strokeWidth: strokeWidthRef.current,
          isFilled,
        },
      });
      pointsHistoryRef.current.push([...pointsRef.current]);
      pointsRef.current = [];
    }
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
    pointsHistoryRef.current = pointsHistoryRef.current.slice(0, -1);
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' });
    pointsRef.current = [];
    pointsHistoryRef.current = [];
  }, []);

  return {
    strokes: state.strokes,
    currentPath: state.currentPath,
    currentIsFilled: state.currentIsFilled,
    pointsHistoryRef,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    undo,
    clear,
  };
}
