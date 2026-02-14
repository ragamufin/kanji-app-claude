/**
 * AsyncStorage persistence for custom kanji lists.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KANJI_LISTS_KEY = '@kanji_lists';

export interface KanjiList {
  id: string;
  name: string;
  characters: string[]; // ordered array of kanji characters
  createdAt: number;
  updatedAt: number;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

/** Load all lists */
export async function getLists(): Promise<KanjiList[]> {
  const raw = await AsyncStorage.getItem(KANJI_LISTS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as KanjiList[];
}

/** Save all lists */
async function saveLists(lists: KanjiList[]): Promise<void> {
  await AsyncStorage.setItem(KANJI_LISTS_KEY, JSON.stringify(lists));
}

/** Create a new list */
export async function createList(name: string): Promise<KanjiList> {
  const lists = await getLists();
  const now = Date.now();
  const newList: KanjiList = {
    id: generateId(),
    name,
    characters: [],
    createdAt: now,
    updatedAt: now,
  };
  lists.push(newList);
  await saveLists(lists);
  return newList;
}

/** Delete a list by ID */
export async function deleteList(listId: string): Promise<void> {
  const lists = await getLists();
  await saveLists(lists.filter((l) => l.id !== listId));
}

/** Rename a list */
export async function renameList(listId: string, name: string): Promise<void> {
  const lists = await getLists();
  const list = lists.find((l) => l.id === listId);
  if (!list) return;
  list.name = name;
  list.updatedAt = Date.now();
  await saveLists(lists);
}

/** Add a kanji to a list (no-op if already present) */
export async function addKanjiToList(listId: string, character: string): Promise<void> {
  const lists = await getLists();
  const list = lists.find((l) => l.id === listId);
  if (!list) return;
  if (list.characters.includes(character)) return;
  list.characters.push(character);
  list.updatedAt = Date.now();
  await saveLists(lists);
}

/** Remove a kanji from a list */
export async function removeKanjiFromList(listId: string, character: string): Promise<void> {
  const lists = await getLists();
  const list = lists.find((l) => l.id === listId);
  if (!list) return;
  list.characters = list.characters.filter((c) => c !== character);
  list.updatedAt = Date.now();
  await saveLists(lists);
}

/** Reorder kanji within a list */
export async function reorderKanji(listId: string, characters: string[]): Promise<void> {
  const lists = await getLists();
  const list = lists.find((l) => l.id === listId);
  if (!list) return;
  list.characters = characters;
  list.updatedAt = Date.now();
  await saveLists(lists);
}

/**
 * Add kanji to a list, auto-creating "Main" list if no lists exist.
 * Returns the list the kanji was added to.
 */
export async function addKanjiAutoCreate(character: string, listId?: string): Promise<KanjiList> {
  const lists = await getLists();

  // If a specific list is provided, use it
  if (listId) {
    const list = lists.find((l) => l.id === listId);
    if (list) {
      await addKanjiToList(listId, character);
      return { ...list, characters: [...list.characters, character] };
    }
  }

  // Auto-create "Main" list if none exist
  if (lists.length === 0) {
    const mainList = await createList('Main');
    await addKanjiToList(mainList.id, character);
    return { ...mainList, characters: [character] };
  }

  // If lists exist but no specific one chosen, use the first
  const firstList = lists[0];
  await addKanjiToList(firstList.id, character);
  return { ...firstList, characters: [...firstList.characters, character] };
}

/** Get a single list by ID */
export async function getList(listId: string): Promise<KanjiList | undefined> {
  const lists = await getLists();
  return lists.find((l) => l.id === listId);
}

/** Clear all lists */
export async function clearListData(): Promise<void> {
  await AsyncStorage.removeItem(KANJI_LISTS_KEY);
}
