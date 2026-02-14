import { useState, useCallback } from 'react';
import { Point } from '../utils/strokeUtils';
import { KanjiVGData } from '../data/kanjiVGTypes';
import { validateKanji, ValidationResult } from '../utils/validationUtils';

export interface UseStrokeValidationResult {
  validationResult: ValidationResult | null;
  checkStrokes: (pointsHistory: Point[][]) => void;
  clearValidation: () => void;
}

export function useStrokeValidation(
  expectedKanji: KanjiVGData | undefined,
  canvasSize: number
): UseStrokeValidationResult {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const checkStrokes = useCallback(
    (pointsHistory: Point[][]) => {
      if (!expectedKanji) return;
      const result = validateKanji(pointsHistory, expectedKanji, canvasSize);
      setValidationResult(result);
    },
    [expectedKanji, canvasSize]
  );

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  return { validationResult, checkStrokes, clearValidation };
}
