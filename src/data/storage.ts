/**
 * Persistence layer using AsyncStorage.
 * Stores practice records and user preferences.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StrokeMode } from '../utils/strokeUtils';

const KEYS = {
  PRACTICE_RECORDS: '@kanji_practice_records',
  USER_PREFERENCES: '@kanji_user_preferences',
};

export interface PracticeRecord {
  character: string;
  timestamp: number;
  score: number;
  strokeOrderCorrect: boolean;
  strokeCount: number;
  expectedStrokes: number;
}

export interface UserPreferences {
  strokeMode: StrokeMode;
  themeMode: 'light' | 'dark' | 'system';
}

const DEFAULT_PREFERENCES: UserPreferences = {
  strokeMode: 'basic',
  themeMode: 'system',
};

// Practice Records

export async function savePracticeRecord(record: PracticeRecord): Promise<void> {
  const records = await getPracticeRecords();
  records.push(record);
  await AsyncStorage.setItem(KEYS.PRACTICE_RECORDS, JSON.stringify(records));
}

export async function getPracticeRecords(): Promise<PracticeRecord[]> {
  const raw = await AsyncStorage.getItem(KEYS.PRACTICE_RECORDS);
  if (!raw) return [];
  return JSON.parse(raw) as PracticeRecord[];
}

export async function getPracticeRecordsForKanji(character: string): Promise<PracticeRecord[]> {
  const records = await getPracticeRecords();
  return records.filter((r) => r.character === character);
}

export async function getKanjiStats(): Promise<
  Map<string, { bestScore: number; attempts: number; lastPracticed: number }>
> {
  const records = await getPracticeRecords();
  const stats = new Map<string, { bestScore: number; attempts: number; lastPracticed: number }>();

  for (const record of records) {
    const existing = stats.get(record.character);
    if (existing) {
      existing.bestScore = Math.max(existing.bestScore, record.score);
      existing.attempts += 1;
      existing.lastPracticed = Math.max(existing.lastPracticed, record.timestamp);
    } else {
      stats.set(record.character, {
        bestScore: record.score,
        attempts: 1,
        lastPracticed: record.timestamp,
      });
    }
  }

  return stats;
}

// User Preferences

export async function savePreferences(prefs: Partial<UserPreferences>): Promise<void> {
  const current = await getPreferences();
  const merged = { ...current, ...prefs };
  await AsyncStorage.setItem(KEYS.USER_PREFERENCES, JSON.stringify(merged));
}

export async function getPreferences(): Promise<UserPreferences> {
  const raw = await AsyncStorage.getItem(KEYS.USER_PREFERENCES);
  if (!raw) return DEFAULT_PREFERENCES;
  return { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<UserPreferences>) };
}

// Clear all data (for debugging)
export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}
