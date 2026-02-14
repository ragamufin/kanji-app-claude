/**
 * AsyncStorage persistence for FSRS card states.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FSRSCardState, createNewCardState } from '../utils/spacedRepetition';

const FSRS_CARDS_KEY = '@kanji_fsrs_cards';

/** Load all FSRS card states */
export async function getFSRSCards(): Promise<Record<string, FSRSCardState>> {
  const raw = await AsyncStorage.getItem(FSRS_CARDS_KEY);
  if (!raw) return {};
  return JSON.parse(raw) as Record<string, FSRSCardState>;
}

/** Save all FSRS card states */
export async function saveFSRSCards(cards: Record<string, FSRSCardState>): Promise<void> {
  await AsyncStorage.setItem(FSRS_CARDS_KEY, JSON.stringify(cards));
}

/** Get or create a single card state */
export async function getOrCreateCardState(character: string): Promise<FSRSCardState> {
  const cards = await getFSRSCards();
  if (cards[character]) return cards[character];

  const newState = createNewCardState(character);
  cards[character] = newState;
  await saveFSRSCards(cards);
  return newState;
}

/** Update a single card state */
export async function updateCardState(state: FSRSCardState): Promise<void> {
  const cards = await getFSRSCards();
  cards[state.character] = state;
  await saveFSRSCards(cards);
}

/** Get all card states as array */
export async function getAllCardStates(): Promise<FSRSCardState[]> {
  const cards = await getFSRSCards();
  return Object.values(cards);
}

/** Ensure card states exist for a list of characters */
export async function ensureCardStates(characters: string[]): Promise<FSRSCardState[]> {
  const cards = await getFSRSCards();
  let modified = false;

  for (const char of characters) {
    if (!cards[char]) {
      cards[char] = createNewCardState(char);
      modified = true;
    }
  }

  if (modified) {
    await saveFSRSCards(cards);
  }

  return characters.map((c) => cards[c]);
}

/** Clear all FSRS data */
export async function clearFSRSData(): Promise<void> {
  await AsyncStorage.removeItem(FSRS_CARDS_KEY);
}
