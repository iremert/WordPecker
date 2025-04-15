import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MOCK_WORD_LISTS } from "@/constants/mockData";
import { Word, WordList } from "@/types";
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuthStore } from "./authStore";

interface WordListState {
  lists: WordList[];
  currentList: WordList | null;
  isLoading: boolean;
  error: string | null;
  
  fetchLists: () => Promise<void>;
  getListById: (id: string) => Promise<WordList | undefined>;
  createList: (list: Omit<WordList, "id" | "createdAt" | "updatedAt" | "totalWords" | "learnedWords" | "words">) => Promise<WordList>;
  updateList: (id: string, updates: Partial<WordList>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  
  addWord: (listId: string, word: Omit<Word, "id" | "listId" | "reviewCount" | "mastered">) => Promise<void>;
  updateWord: (listId: string, wordId: string, updates: Partial<Word>) => Promise<void>;
  deleteWord: (listId: string, wordId: string) => Promise<void>;
  markWordAsMastered: (listId: string, wordId: string, mastered: boolean) => Promise<void>;
  
  setCurrentList: (list: WordList | null) => void;
  clearError: () => void;
}

export const useWordListStore = create<WordListState>()(
  persist(
    (set, get) => ({
      lists: MOCK_WORD_LISTS,
      currentList: null,
      isLoading: false,
      error: null,
      
      fetchLists: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const user = useAuthStore.getState().user;
          
          if (!user) {
            // If not authenticated, use mock data
            set({ 
              lists: MOCK_WORD_LISTS,
              isLoading: false 
            });
            return;
          }
          
          // Get lists from Firestore
          const listsRef = collection(db, "users", user.uid, "lists");
          const q = query(listsRef, orderBy("updatedAt", "desc"));
          const querySnapshot = await getDocs(q);
          
          const lists: WordList[] = [];
          
          for (const docSnapshot of querySnapshot.docs) {
            const listData = docSnapshot.data() as Omit<WordList, "id" | "words">;
            
            // Get words for this list
            const wordsRef = collection(db, "users", user.uid, "lists", docSnapshot.id, "words");
            const wordsSnapshot = await getDocs(wordsRef);
            
            const words: Word[] = [];
            wordsSnapshot.forEach(wordDoc => {
              words.push({
                id: wordDoc.id,
                listId: docSnapshot.id,
                ...wordDoc.data() as Omit<Word, "id" | "listId">
              });
            });
            
            lists.push({
              id: docSnapshot.id,
              ...listData,
              words,
            });
          }
          
          set({ 
            lists,
            isLoading: false 
          });
        } catch (error: any) {
          console.error("Error fetching lists:", error);
          set({
            error: error.message || "Failed to fetch lists",
            isLoading: false,
          });
        }
      },
      
      getListById: async (id) => {
        try {
          const user = useAuthStore.getState().user;
          
          // First check if it's in the current state
          const cachedList = get().lists.find(list => list.id === id);
          if (cachedList) return cachedList;
          
          if (!user) {
            // If not authenticated, check mock data
            const mockList = MOCK_WORD_LISTS.find(list => list.id === id);
            if (mockList) {
              return mockList;
            }
            throw new Error("List not found in mock data");
          }
          
          // Get list from Firestore
          const listRef = doc(db, "users", user.uid, "lists", id);
          const listSnapshot = await getDoc(listRef);
          
          if (!listSnapshot.exists()) {
            throw new Error("List not found");
          }
          
          const listData = listSnapshot.data() as Omit<WordList, "id" | "words">;
          
          // Get words for this list
          const wordsRef = collection(db, "users", user.uid, "lists", id, "words");
          const wordsSnapshot = await getDocs(wordsRef);
          
          const words: Word[] = [];
          wordsSnapshot.forEach(wordDoc => {
            words.push({
              id: wordDoc.id,
              listId: id,
              ...wordDoc.data() as Omit<Word, "id" | "listId">
            });
          });
          
          const list: WordList = {
            id,
            ...listData,
            words,
          };
          
          return list;
        } catch (error: any) {
          console.error("Error getting list:", error);
          return undefined;
        }
      },
      
      createList: async (listData) => {
        set({ isLoading: true, error: null });
        
        try {
          const user = useAuthStore.getState().user;
          
          if (!user) {
            // If not authenticated, create a mock list
            const newList: WordList = {
              ...listData,
              id: `list${Date.now()}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              totalWords: 0,
              learnedWords: 0,
              words: [],
            };
            
            set(state => ({
              lists: [...state.lists, newList],
              isLoading: false,
            }));
            
            return newList;
          }
          
          // Create list in Firestore
          const listsRef = collection(db, "users", user.uid, "lists");
          const docRef = await addDoc(listsRef, {
            ...listData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            totalWords: 0,
            learnedWords: 0,
          });
          
          const newList: WordList = {
            ...listData,
            id: docRef.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            totalWords: 0,
            learnedWords: 0,
            words: [],
          };
          
          set(state => ({
            lists: [...state.lists, newList],
            isLoading: false,
          }));
          
          return newList;
        } catch (error: any) {
          console.error("Error creating list:", error);
          set({
            error: error.message || "Failed to create list",
            isLoading: false,
          });
          throw error;
        }
      },
      
      updateList: async (id, updates) => {
        set({ isLoading: true, error: null });
        
        try {
          const user = useAuthStore.getState().user;
          
          if (!user) {
            // If not authenticated, update mock data
            set(state => ({
              lists: state.lists.map(list => 
                list.id === id 
                  ? { 
                      ...list, 
                      ...updates, 
                      updatedAt: new Date().toISOString() 
                    } 
                  : list
              ),
              currentList: state.currentList?.id === id 
                ? { ...state.currentList, ...updates, updatedAt: new Date().toISOString() } 
                : state.currentList,
              isLoading: false,
            }));
            return;
          }
          
          // Update list in Firestore
          const listRef = doc(db, "users", user.uid, "lists", id);
          await updateDoc(listRef, {
            ...updates,
            updatedAt: serverTimestamp(),
          });
          
          set(state => ({
            lists: state.lists.map(list => 
              list.id === id 
                ? { 
                    ...list, 
                    ...updates, 
                    updatedAt: new Date().toISOString() 
                  } 
                : list
            ),
            currentList: state.currentList?.id === id 
              ? { ...state.currentList, ...updates, updatedAt: new Date().toISOString() } 
              : state.currentList,
            isLoading: false,
          }));
        } catch (error: any) {
          console.error("Error updating list:", error);
          set({
            error: error.message || "Failed to update list",
            isLoading: false,
          });
        }
      },
      
      deleteList: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          const user = useAuthStore.getState().user;
          
          if (!user) {
            // If not authenticated, delete from mock data
            set(state => ({
              lists: state.lists.filter(list => list.id !== id),
              currentList: state.currentList?.id === id ? null : state.currentList,
              isLoading: false,
            }));
            return;
          }
          
          // Delete list from Firestore
          const listRef = doc(db, "users", user.uid, "lists", id);
          
          // First, delete all words in the list
          const wordsRef = collection(db, "users", user.uid, "lists", id, "words");
          const wordsSnapshot = await getDocs(wordsRef);
          
          const batch = db.batch();
          wordsSnapshot.forEach(wordDoc => {
            batch.delete(wordDoc.ref);
          });
          
          // Then delete the list itself
          batch.delete(listRef);
          
          await batch.commit();
          
          set(state => ({
            lists: state.lists.filter(list => list.id !== id),
            currentList: state.currentList?.id === id ? null : state.currentList,
            isLoading: false,
          }));
        } catch (error: any) {
          console.error("Error deleting list:", error);
          set({
            error: error.message || "Failed to delete list",
            isLoading: false,
          });
        }
      },
      
      addWord: async (listId, wordData) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log("Adding word to list:", listId, wordData);
          const user = useAuthStore.getState().user;
          
          if (!user) {
            // If not authenticated, add to mock data
            const newWord: Word = {
              ...wordData,
              id: `word${Date.now()}`,
              listId,
              reviewCount: 0,
              mastered: false,
            };
            
            set(state => {
              // Find the list to update
              const listToUpdate = state.lists.find(list => list.id === listId);
              
              if (!listToUpdate) {
                console.error("List not found:", listId);
                throw new Error("List not found");
              }
              
              // Create updated lists array
              const updatedLists = state.lists.map(list => {
                if (list.id === listId) {
                  // Make sure words array exists
                  const currentWords = list.words || [];
                  
                  return {
                    ...list,
                    words: [...currentWords, newWord],
                    totalWords: (list.totalWords || 0) + 1,
                    updatedAt: new Date().toISOString(),
                  };
                }
                return list;
              });
              
              // Update current list if it's the one being modified
              const updatedCurrentList = state.currentList?.id === listId
                ? {
                    ...state.currentList,
                    words: [...(state.currentList.words || []), newWord],
                    totalWords: (state.currentList.totalWords || 0) + 1,
                    updatedAt: new Date().toISOString(),
                  }
                : state.currentList;
              
              return {
                lists: updatedLists,
                currentList: updatedCurrentList,
                isLoading: false,
              };
            });
            return;
          }
          
          // Add word to Firestore
          const wordRef = collection(db, "users", user.uid, "lists", listId, "words");
          const docRef = await addDoc(wordRef, {
            ...wordData,
            reviewCount: 0,
            mastered: false,
            createdAt: serverTimestamp(),
          });
          
          // Update list's word count
          const listRef = doc(db, "users", user.uid, "lists", listId);
          const listSnapshot = await getDoc(listRef);
          
          if (listSnapshot.exists()) {
            const listData = listSnapshot.data();
            await updateDoc(listRef, {
              totalWords: (listData.totalWords || 0) + 1,
              updatedAt: serverTimestamp(),
            });
          }
          
          const newWord: Word = {
            ...wordData,
            id: docRef.id,
            listId,
            reviewCount: 0,
            mastered: false,
          };
          
          set(state => {
            // Find the list to update
            const listToUpdate = state.lists.find(list => list.id === listId);
            
            if (!listToUpdate) {
              console.error("List not found:", listId);
              return { ...state, isLoading: false };
            }
            
            // Create updated lists array
            const updatedLists = state.lists.map(list => {
              if (list.id === listId) {
                // Make sure words array exists
                const currentWords = list.words || [];
                
                return {
                  ...list,
                  words: [...currentWords, newWord],
                  totalWords: (list.totalWords || 0) + 1,
                  updatedAt: new Date().toISOString(),
                };
              }
              return list;
            });
            
            // Update current list if it's the one being modified
            const updatedCurrentList = state.currentList?.id === listId
              ? {
                  ...state.currentList,
                  words: [...(state.currentList.words || []), newWord],
                  totalWords: (state.currentList.totalWords || 0) + 1,
                  updatedAt: new Date().toISOString(),
                }
              : state.currentList;
            
            return {
              lists: updatedLists,
              currentList: updatedCurrentList,
              isLoading: false,
            };
          });
        } catch (error: any) {
          console.error("Error adding word:", error);
          set({
            error: error.message || "Failed to add word",
            isLoading: false,
          });
          throw error;
        }
      },
      
      updateWord: async (listId, wordId, updates) => {
        set({ isLoading: true, error: null });
        
        try {
          const user = useAuthStore.getState().user;
          
          if (!user) {
            // If not authenticated, update mock data
            set(state => {
              const updatedLists = state.lists.map(list => {
                if (list.id === listId) {
                  return {
                    ...list,
                    words: list.words.map(word => 
                      word.id === wordId ? { ...word, ...updates } : word
                    ),
                    updatedAt: new Date().toISOString(),
                  };
                }
                return list;
              });
              
              const updatedCurrentList = state.currentList?.id === listId
                ? {
                    ...state.currentList,
                    words: state.currentList.words.map(word => 
                      word.id === wordId ? { ...word, ...updates } : word
                    ),
                    updatedAt: new Date().toISOString(),
                  }
                : state.currentList;
              
              return {
                lists: updatedLists,
                currentList: updatedCurrentList,
                isLoading: false,
              };
            });
            return;
          }
          
          // Update word in Firestore
          const wordRef = doc(db, "users", user.uid, "lists", listId, "words", wordId);
          await updateDoc(wordRef, {
            ...updates,
            updatedAt: serverTimestamp(),
          });
          
          set(state => {
            const updatedLists = state.lists.map(list => {
              if (list.id === listId) {
                return {
                  ...list,
                  words: list.words.map(word => 
                    word.id === wordId ? { ...word, ...updates } : word
                  ),
                  updatedAt: new Date().toISOString(),
                };
              }
              return list;
            });
            
            const updatedCurrentList = state.currentList?.id === listId
              ? {
                  ...state.currentList,
                  words: state.currentList.words.map(word => 
                    word.id === wordId ? { ...word, ...updates } : word
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : state.currentList;
            
            return {
              lists: updatedLists,
              currentList: updatedCurrentList,
              isLoading: false,
            };
          });
        } catch (error: any) {
          console.error("Error updating word:", error);
          set({
            error: error.message || "Failed to update word",
            isLoading: false,
          });
        }
      },
      
      deleteWord: async (listId, wordId) => {
        set({ isLoading: true, error: null });
        
        try {
          const user = useAuthStore.getState().user;
          
          // Find the word to check if it was mastered
          const list = get().lists.find(l => l.id === listId);
          if (!list) throw new Error("List not found");
          
          const word = list.words.find(w => w.id === wordId);
          if (!word) throw new Error("Word not found");
          
          const wasMastered = word.mastered;
          
          if (!user) {
            // If not authenticated, delete from mock data
            set(state => {
              const updatedLists = state.lists.map(list => {
                if (list.id === listId) {
                  return {
                    ...list,
                    words: list.words.filter(word => word.id !== wordId),
                    totalWords: list.totalWords - 1,
                    learnedWords: wasMastered ? list.learnedWords - 1 : list.learnedWords,
                    updatedAt: new Date().toISOString(),
                  };
                }
                return list;
              });
              
              const updatedCurrentList = state.currentList?.id === listId
                ? {
                    ...state.currentList,
                    words: state.currentList.words.filter(word => word.id !== wordId),
                    totalWords: state.currentList.totalWords - 1,
                    learnedWords: wasMastered ? state.currentList.learnedWords - 1 : state.currentList.learnedWords,
                    updatedAt: new Date().toISOString(),
                  }
                : state.currentList;
              
              return {
                lists: updatedLists,
                currentList: updatedCurrentList,
                isLoading: false,
              };
            });
            return;
          }
          
          // Delete word from Firestore
          const wordRef = doc(db, "users", user.uid, "lists", listId, "words", wordId);
          await deleteDoc(wordRef);
          
          // Update list's word count
          const listRef = doc(db, "users", user.uid, "lists", listId);
          const listSnapshot = await getDoc(listRef);
          
          if (listSnapshot.exists()) {
            const listData = listSnapshot.data();
            await updateDoc(listRef, {
              totalWords: Math.max(0, (listData.totalWords || 0) - 1),
              learnedWords: wasMastered ? Math.max(0, (listData.learnedWords || 0) - 1) : (listData.learnedWords || 0),
              updatedAt: serverTimestamp(),
            });
          }
          
          set(state => {
            const updatedLists = state.lists.map(list => {
              if (list.id === listId) {
                return {
                  ...list,
                  words: list.words.filter(word => word.id !== wordId),
                  totalWords: list.totalWords - 1,
                  learnedWords: wasMastered ? list.learnedWords - 1 : list.learnedWords,
                  updatedAt: new Date().toISOString(),
                };
              }
              return list;
            });
            
            const updatedCurrentList = state.currentList?.id === listId
              ? {
                  ...state.currentList,
                  words: state.currentList.words.filter(word => word.id !== wordId),
                  totalWords: state.currentList.totalWords - 1,
                  learnedWords: wasMastered ? state.currentList.learnedWords - 1 : state.currentList.learnedWords,
                  updatedAt: new Date().toISOString(),
                }
              : state.currentList;
            
            return {
              lists: updatedLists,
              currentList: updatedCurrentList,
              isLoading: false,
            };
          });
        } catch (error: any) {
          console.error("Error deleting word:", error);
          set({
            error: error.message || "Failed to delete word",
            isLoading: false,
          });
        }
      },
      
      markWordAsMastered: async (listId, wordId, mastered) => {
        set({ isLoading: true, error: null });
        
        try {
          const user = useAuthStore.getState().user;
          
          // Find the word to check its current mastery status
          const list = get().lists.find(l => l.id === listId);
          if (!list) throw new Error("List not found");
          
          const word = list.words.find(w => w.id === wordId);
          if (!word) throw new Error("Word not found");
          
          const wasMasteredBefore = word.mastered;
          const learnedDelta = mastered && !wasMasteredBefore ? 1 : !mastered && wasMasteredBefore ? -1 : 0;
          
          if (!user) {
            // If not authenticated, update mock data
            set(state => {
              const updatedLists = state.lists.map(list => {
                if (list.id === listId) {
                  return {
                    ...list,
                    words: list.words.map(word => 
                      word.id === wordId 
                        ? { 
                            ...word, 
                            mastered, 
                            reviewCount: word.reviewCount + 1,
                            lastReviewed: new Date().toISOString(),
                          } 
                        : word
                    ),
                    learnedWords: list.learnedWords + learnedDelta,
                    updatedAt: new Date().toISOString(),
                  };
                }
                return list;
              });
              
              const updatedCurrentList = state.currentList?.id === listId
                ? {
                    ...state.currentList,
                    words: state.currentList.words.map(word => 
                      word.id === wordId 
                        ? { 
                            ...word, 
                            mastered, 
                            reviewCount: word.reviewCount + 1,
                            lastReviewed: new Date().toISOString(),
                          } 
                        : word
                    ),
                    learnedWords: state.currentList.learnedWords + learnedDelta,
                    updatedAt: new Date().toISOString(),
                  }
                : state.currentList;
              
              return {
                lists: updatedLists,
                currentList: updatedCurrentList,
                isLoading: false,
              };
            });
            return;
          }
          
          // Update word in Firestore
          const wordRef = doc(db, "users", user.uid, "lists", listId, "words", wordId);
          await updateDoc(wordRef, {
            mastered,
            reviewCount: (word.reviewCount || 0) + 1,
            lastReviewed: serverTimestamp(),
          });
          
          // Update list's learned words count
          const listRef = doc(db, "users", user.uid, "lists", listId);
          const listSnapshot = await getDoc(listRef);
          
          if (listSnapshot.exists()) {
            const listData = listSnapshot.data();
            await updateDoc(listRef, {
              learnedWords: Math.max(0, (listData.learnedWords || 0) + learnedDelta),
              updatedAt: serverTimestamp(),
            });
          }
          
          set(state => {
            const updatedLists = state.lists.map(list => {
              if (list.id === listId) {
                return {
                  ...list,
                  words: list.words.map(word => 
                    word.id === wordId 
                      ? { 
                          ...word, 
                          mastered, 
                          reviewCount: word.reviewCount + 1,
                          lastReviewed: new Date().toISOString(),
                        } 
                      : word
                  ),
                  learnedWords: list.learnedWords + learnedDelta,
                  updatedAt: new Date().toISOString(),
                };
              }
              return list;
            });
            
            const updatedCurrentList = state.currentList?.id === listId
              ? {
                  ...state.currentList,
                  words: state.currentList.words.map(word => 
                    word.id === wordId 
                      ? { 
                          ...word, 
                          mastered, 
                          reviewCount: word.reviewCount + 1,
                          lastReviewed: new Date().toISOString(),
                        } 
                      : word
                  ),
                  learnedWords: state.currentList.learnedWords + learnedDelta,
                  updatedAt: new Date().toISOString(),
                }
              : state.currentList;
            
            return {
              lists: updatedLists,
              currentList: updatedCurrentList,
              isLoading: false,
            };
          });
        } catch (error: any) {
          console.error("Error updating word mastery:", error);
          set({
            error: error.message || "Failed to update word mastery",
            isLoading: false,
          });
        }
      },
      
      setCurrentList: (list) => {
        set({ currentList: list });
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "word-list-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);