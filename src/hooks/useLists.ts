/**
 * Hook for managing custom kanji lists.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  KanjiList,
  getLists as getListsFromStorage,
  createList as createListInStorage,
  deleteList as deleteListInStorage,
  addKanjiToList,
  removeKanjiFromList,
  reorderKanji,
  addKanjiAutoCreate,
} from '../data/listStorage';

interface UseListsResult {
  /** All lists */
  lists: KanjiList[];
  /** Whether data is loading */
  loading: boolean;
  /** Create a new list */
  createList: (name: string) => Promise<KanjiList>;
  /** Delete a list */
  deleteList: (listId: string) => Promise<void>;
  /** Add kanji to a specific list */
  addKanji: (listId: string, character: string) => Promise<void>;
  /** Add kanji, auto-creating Main list if needed */
  addKanjiAuto: (character: string, listId?: string) => Promise<KanjiList>;
  /** Remove kanji from a list */
  removeKanji: (listId: string, character: string) => Promise<void>;
  /** Reorder kanji within a list */
  reorder: (listId: string, characters: string[]) => Promise<void>;
  /** Refresh lists from storage */
  refresh: () => Promise<void>;
}

export function useLists(): UseListsResult {
  const [lists, setLists] = useState<KanjiList[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLists = useCallback(async () => {
    const loaded = await getListsFromStorage();
    setLists(loaded);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    getListsFromStorage().then((loaded) => {
      if (active) {
        setLists(loaded);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const createList = useCallback(
    async (name: string) => {
      const newList = await createListInStorage(name);
      await loadLists();
      return newList;
    },
    [loadLists]
  );

  const deleteList = useCallback(
    async (listId: string) => {
      await deleteListInStorage(listId);
      await loadLists();
    },
    [loadLists]
  );

  const addKanji = useCallback(
    async (listId: string, character: string) => {
      await addKanjiToList(listId, character);
      await loadLists();
    },
    [loadLists]
  );

  const addKanjiAuto = useCallback(
    async (character: string, listId?: string) => {
      const list = await addKanjiAutoCreate(character, listId);
      await loadLists();
      return list;
    },
    [loadLists]
  );

  const removeKanji = useCallback(
    async (listId: string, character: string) => {
      await removeKanjiFromList(listId, character);
      await loadLists();
    },
    [loadLists]
  );

  const reorder = useCallback(
    async (listId: string, characters: string[]) => {
      await reorderKanji(listId, characters);
      await loadLists();
    },
    [loadLists]
  );

  return {
    lists,
    loading,
    createList,
    deleteList,
    addKanji,
    addKanjiAuto,
    removeKanji,
    reorder,
    refresh: loadLists,
  };
}
