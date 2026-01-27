export type StrokeDirection =
  | 'horizontal'
  | 'vertical'
  | 'diagonal-down'
  | 'diagonal-up'
  | 'curved';

export type Quadrant = 1 | 2 | 3 | 4; // 1=top-left, 2=top-right, 3=bottom-left, 4=bottom-right

export interface KanjiStroke {
  direction: StrokeDirection;
  startQuadrant: Quadrant;
  endQuadrant: Quadrant;
}

export interface KanjiData {
  character: string;
  meaning: string;
  strokeCount: number;
  strokes: KanjiStroke[];
}

export const kanjiList: KanjiData[] = [
  {
    character: '一',
    meaning: 'one',
    strokeCount: 1,
    strokes: [{ direction: 'horizontal', startQuadrant: 1, endQuadrant: 2 }],
  },
  {
    character: '二',
    meaning: 'two',
    strokeCount: 2,
    strokes: [
      { direction: 'horizontal', startQuadrant: 1, endQuadrant: 2 },
      { direction: 'horizontal', startQuadrant: 3, endQuadrant: 4 },
    ],
  },
  {
    character: '三',
    meaning: 'three',
    strokeCount: 3,
    strokes: [
      { direction: 'horizontal', startQuadrant: 1, endQuadrant: 2 },
      { direction: 'horizontal', startQuadrant: 1, endQuadrant: 2 },
      { direction: 'horizontal', startQuadrant: 3, endQuadrant: 4 },
    ],
  },
  {
    character: '山',
    meaning: 'mountain',
    strokeCount: 3,
    strokes: [
      { direction: 'vertical', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'vertical', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'vertical', startQuadrant: 2, endQuadrant: 4 },
    ],
  },
  {
    character: '川',
    meaning: 'river',
    strokeCount: 3,
    strokes: [
      { direction: 'vertical', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'vertical', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'vertical', startQuadrant: 2, endQuadrant: 4 },
    ],
  },
  {
    character: '日',
    meaning: 'sun/day',
    strokeCount: 4,
    strokes: [
      { direction: 'vertical', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'horizontal', startQuadrant: 1, endQuadrant: 2 },
      { direction: 'horizontal', startQuadrant: 1, endQuadrant: 2 },
      { direction: 'vertical', startQuadrant: 2, endQuadrant: 4 },
    ],
  },
  {
    character: '月',
    meaning: 'moon',
    strokeCount: 4,
    strokes: [
      { direction: 'vertical', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'horizontal', startQuadrant: 1, endQuadrant: 2 },
      { direction: 'horizontal', startQuadrant: 1, endQuadrant: 2 },
      { direction: 'vertical', startQuadrant: 2, endQuadrant: 4 },
    ],
  },
  {
    character: '木',
    meaning: 'tree',
    strokeCount: 4,
    strokes: [
      { direction: 'horizontal', startQuadrant: 1, endQuadrant: 2 },
      { direction: 'vertical', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'diagonal-down', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'diagonal-up', startQuadrant: 1, endQuadrant: 4 },
    ],
  },
  {
    character: '火',
    meaning: 'fire',
    strokeCount: 4,
    strokes: [
      { direction: 'diagonal-down', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'diagonal-up', startQuadrant: 1, endQuadrant: 4 },
      { direction: 'diagonal-down', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'diagonal-up', startQuadrant: 2, endQuadrant: 4 },
    ],
  },
  {
    character: '水',
    meaning: 'water',
    strokeCount: 4,
    strokes: [
      { direction: 'vertical', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'diagonal-down', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'diagonal-up', startQuadrant: 1, endQuadrant: 4 },
      { direction: 'diagonal-down', startQuadrant: 2, endQuadrant: 4 },
    ],
  },
  {
    character: '金',
    meaning: 'gold',
    strokeCount: 8,
    strokes: [
      { direction: 'diagonal-down', startQuadrant: 1, endQuadrant: 1 },
      { direction: 'horizontal', startQuadrant: 1, endQuadrant: 2 },
      { direction: 'diagonal-down', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'diagonal-up', startQuadrant: 2, endQuadrant: 4 },
      { direction: 'horizontal', startQuadrant: 1, endQuadrant: 2 },
      { direction: 'vertical', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'horizontal', startQuadrant: 3, endQuadrant: 4 },
      { direction: 'diagonal-down', startQuadrant: 3, endQuadrant: 4 },
    ],
  },
  {
    character: '土',
    meaning: 'earth',
    strokeCount: 3,
    strokes: [
      { direction: 'horizontal', startQuadrant: 1, endQuadrant: 2 },
      { direction: 'vertical', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'horizontal', startQuadrant: 3, endQuadrant: 4 },
    ],
  },
  {
    character: '人',
    meaning: 'person',
    strokeCount: 2,
    strokes: [
      { direction: 'diagonal-down', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'diagonal-up', startQuadrant: 1, endQuadrant: 4 },
    ],
  },
  {
    character: '大',
    meaning: 'big',
    strokeCount: 3,
    strokes: [
      { direction: 'horizontal', startQuadrant: 1, endQuadrant: 2 },
      { direction: 'diagonal-down', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'diagonal-up', startQuadrant: 1, endQuadrant: 4 },
    ],
  },
  {
    character: '小',
    meaning: 'small',
    strokeCount: 3,
    strokes: [
      { direction: 'vertical', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'diagonal-down', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'diagonal-up', startQuadrant: 2, endQuadrant: 4 },
    ],
  },
  {
    character: '中',
    meaning: 'middle',
    strokeCount: 4,
    strokes: [
      { direction: 'vertical', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'horizontal', startQuadrant: 1, endQuadrant: 2 },
      { direction: 'vertical', startQuadrant: 2, endQuadrant: 4 },
      { direction: 'horizontal', startQuadrant: 3, endQuadrant: 4 },
    ],
  },
  {
    character: '上',
    meaning: 'up',
    strokeCount: 3,
    strokes: [
      { direction: 'vertical', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'horizontal', startQuadrant: 1, endQuadrant: 2 },
      { direction: 'horizontal', startQuadrant: 3, endQuadrant: 4 },
    ],
  },
  {
    character: '下',
    meaning: 'down',
    strokeCount: 3,
    strokes: [
      { direction: 'horizontal', startQuadrant: 1, endQuadrant: 2 },
      { direction: 'vertical', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'diagonal-down', startQuadrant: 1, endQuadrant: 3 },
    ],
  },
  {
    character: '口',
    meaning: 'mouth',
    strokeCount: 3,
    strokes: [
      { direction: 'vertical', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'horizontal', startQuadrant: 1, endQuadrant: 2 },
      { direction: 'vertical', startQuadrant: 2, endQuadrant: 4 },
    ],
  },
  {
    character: '目',
    meaning: 'eye',
    strokeCount: 5,
    strokes: [
      { direction: 'vertical', startQuadrant: 1, endQuadrant: 3 },
      { direction: 'horizontal', startQuadrant: 1, endQuadrant: 2 },
      { direction: 'horizontal', startQuadrant: 1, endQuadrant: 2 },
      { direction: 'horizontal', startQuadrant: 3, endQuadrant: 4 },
      { direction: 'vertical', startQuadrant: 2, endQuadrant: 4 },
    ],
  },
];
