import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserStats, QuizResult, LearningSession, Achievement } from "@/types";
import { 
  doc, 
  collection, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuthStore } from "./authStore";

// Mock achievements data
const initialAchievements: Achievement[] = [
  {
    id: "1",
    title: "Fast Learner",
    description: "Learn 10 words in a day",
    icon: "Zap",
    color: "#10B981", // success
    progress: 7,
    maxProgress: 10,
    isUnlocked: false
  },
  {
    id: "2",
    title: "Perfect Quiz",
    description: "Score 100% on a quiz",
    icon: "Star",
    color: "#F59E0B", // warning
    progress: 90,
    maxProgress: 100,
    isUnlocked: false
  },
  {
    id: "3",
    title: "Week Streak",
    description: "Learn 7 days in a row",
    icon: "Calendar",
    color: "#6366F1", // primary
    progress: 5,
    maxProgress: 7,
    isUnlocked: false
  },
  {
    id: "4",
    title: "Vocabulary Builder",
    description: "Create 5 word lists",
    icon: "BookOpen",
    color: "#0EA5E9", // info
    progress: 3,
    maxProgress: 5,
    isUnlocked: false
  },
  {
    id: "5",
    title: "Pronunciation Master",
    description: "Practice pronunciation 20 times",
    icon: "Mic",
    color: "#EC4899", // pink
    progress: 12,
    maxProgress: 20,
    isUnlocked: false
  },
  {
    id: "6",
    title: "Word Explorer",
    description: "Learn words from 3 different categories",
    icon: "Compass",
    color: "#8B5CF6", // purple
    progress: 2,
    maxProgress: 3,
    isUnlocked: false
  },
  {
    id: "7",
    title: "Dedicated Learner",
    description: "Study for 30 days total",
    icon: "Award",
    color: "#F97316", // orange
    progress: 18,
    maxProgress: 30,
    isUnlocked: false
  },
  {
    id: "8",
    title: "Quiz Champion",
    description: "Complete 10 quizzes",
    icon: "Trophy",
    color: "#EAB308", // yellow
    progress: 6,
    maxProgress: 10,
    isUnlocked: false
  }
];

// Initial stats
const initialStats: UserStats = {
  totalWordsMastered: 42,
  totalWordsLearned: 120,
  totalLists: 5,
  streakDays: 3,
  lastStreak: "2023-05-15",
  quizResults: [
    {
      listId: "list1",
      date: "2023-05-15",
      score: 8,
      totalQuestions: 10,
      timeSpent: 300,
      wrongAnswers: ["word3", "word7"]
    },
    {
      listId: "list2",
      date: "2023-05-14",
      score: 9,
      totalQuestions: 10,
      timeSpent: 270,
      wrongAnswers: ["word5"]
    }
  ],
  learningSessions: [
    {
      listId: "list1",
      date: "2023-05-15",
      wordsReviewed: 20,
      wordsMastered: 15,
      timeSpent: 600
    },
    {
      listId: "list2",
      date: "2023-05-14",
      wordsReviewed: 15,
      wordsMastered: 10,
      timeSpent: 450
    }
  ],
  achievements: initialAchievements
};

interface StatsState {
  stats: UserStats;
  fetchStats: () => Promise<void>;
  addQuizResult: (result: QuizResult) => Promise<void>;
  addLearningSession: (session: LearningSession) => Promise<void>;
  updateStreak: (date: string) => Promise<void>;
  updateAchievement: (id: string, progress: number) => Promise<void>;
  unlockAchievement: (id: string) => Promise<void>;
  exportData: () => string;
  importData: (data: string) => boolean;
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      stats: initialStats,
      
      fetchStats: async () => {
        try {
          const user = useAuthStore.getState().user;
          
          if (!user) {
            // If not authenticated, use mock data
            set((state) => {
              if (!state.stats || !state.stats.achievements) {
                return { stats: initialStats };
              }
              return state;
            });
            return;
          }
          
          // Get stats from Firestore
          const statsRef = doc(db, "users", user.uid, "stats", "userStats");
          const statsSnapshot = await getDoc(statsRef);
          
          if (statsSnapshot.exists()) {
            const statsData = statsSnapshot.data() as Partial<UserStats>;
            
            // Get quiz results
            const quizResultsRef = collection(db, "users", user.uid, "quizResults");
            const quizQuery = query(quizResultsRef, orderBy("date", "desc"), limit(20));
            const quizSnapshot = await getDocs(quizQuery);
            
            const quizResults: QuizResult[] = [];
            quizSnapshot.forEach(doc => {
              quizResults.push(doc.data() as QuizResult);
            });
            
            // Get learning sessions
            const sessionsRef = collection(db, "users", user.uid, "learningSessions");
            const sessionsQuery = query(sessionsRef, orderBy("date", "desc"), limit(20));
            const sessionsSnapshot = await getDocs(sessionsQuery);
            
            const learningSessions: LearningSession[] = [];
            sessionsSnapshot.forEach(doc => {
              learningSessions.push(doc.data() as LearningSession);
            });
            
            // Get achievements
            const achievementsRef = collection(db, "users", user.uid, "achievements");
            const achievementsSnapshot = await getDocs(achievementsRef);
            
            let achievements: Achievement[] = [...initialAchievements];
            if (achievementsSnapshot.size > 0) {
              achievements = [];
              achievementsSnapshot.forEach(doc => {
                achievements.push({
                  id: doc.id,
                  ...doc.data() as Omit<Achievement, "id">
                });
              });
            }
            
            set({
              stats: {
                ...initialStats,
                ...statsData,
                quizResults,
                learningSessions,
                achievements
              }
            });
          } else {
            // Create initial stats in Firestore
            await updateDoc(statsRef, {
              totalWordsMastered: 0,
              totalWordsLearned: 0,
              totalLists: 0,
              streakDays: 0,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            
            // Create initial achievements
            const achievementsBatch = db.batch();
            for (const achievement of initialAchievements) {
              const achievementRef = doc(collection(db, "users", user.uid, "achievements"), achievement.id);
              achievementsBatch.set(achievementRef, {
                title: achievement.title,
                description: achievement.description,
                icon: achievement.icon,
                color: achievement.color,
                progress: 0,
                maxProgress: achievement.maxProgress,
                isUnlocked: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }
            await achievementsBatch.commit();
            
            set({ stats: initialStats });
          }
        } catch (error) {
          console.error("Error fetching stats:", error);
          // Ensure stats has achievements
          set((state) => {
            if (!state.stats || !state.stats.achievements) {
              return { stats: initialStats };
            }
            return state;
          });
        }
      },
      
      addQuizResult: async (result) => {
        try {
          const user = useAuthStore.getState().user;
          
          // Update local state
          set((state) => {
            // Ensure stats is initialized
            if (!state.stats) {
              return { stats: { ...initialStats, quizResults: [result] } };
            }

            const newStats = { ...state.stats };
            newStats.quizResults = [result, ...(newStats.quizResults || [])];
            
            // Ensure achievements array exists
            if (!newStats.achievements) {
              newStats.achievements = [...initialAchievements];
            }
            
            // Update achievements based on quiz result
            const perfectQuizAchievement = newStats.achievements.find(a => a.id === "2");
            if (perfectQuizAchievement && result.score === result.totalQuestions) {
              perfectQuizAchievement.progress = 100;
              perfectQuizAchievement.isUnlocked = true;
            }
            
            // Update Quiz Champion achievement
            const quizChampionAchievement = newStats.achievements.find(a => a.id === "8");
            if (quizChampionAchievement) {
              quizChampionAchievement.progress = Math.min(newStats.quizResults.length, quizChampionAchievement.maxProgress);
              if (quizChampionAchievement.progress >= quizChampionAchievement.maxProgress) {
                quizChampionAchievement.isUnlocked = true;
              }
            }
            
            return { stats: newStats };
          });
          
          if (!user) return;
          
          // Add quiz result to Firestore
          const quizResultsRef = collection(db, "users", user.uid, "quizResults");
          await addDoc(quizResultsRef, {
            ...result,
            createdAt: serverTimestamp(),
          });
          
          // Update stats in Firestore
          const statsRef = doc(db, "users", user.uid, "stats", "userStats");
          const statsSnapshot = await getDoc(statsRef);
          
          if (statsSnapshot.exists()) {
            const statsData = statsSnapshot.data();
            await updateDoc(statsRef, {
              totalQuizzes: (statsData.totalQuizzes || 0) + 1,
              updatedAt: serverTimestamp(),
            });
          }
          
          // Update achievements
          const stats = get().stats;
          if (!stats || !stats.achievements) return;
          
          const perfectQuizAchievement = stats.achievements.find(a => a.id === "2");
          if (perfectQuizAchievement && result.score === result.totalQuestions) {
            const achievementRef = doc(db, "users", user.uid, "achievements", "2");
            await updateDoc(achievementRef, {
              progress: 100,
              isUnlocked: true,
              unlockedAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
          
          const quizChampionAchievement = stats.achievements.find(a => a.id === "8");
          if (quizChampionAchievement) {
            const achievementRef = doc(db, "users", user.uid, "achievements", "8");
            await updateDoc(achievementRef, {
              progress: Math.min(stats.quizResults.length, quizChampionAchievement.maxProgress),
              isUnlocked: quizChampionAchievement.progress >= quizChampionAchievement.maxProgress,
              updatedAt: serverTimestamp(),
              ...(quizChampionAchievement.progress >= quizChampionAchievement.maxProgress ? { unlockedAt: serverTimestamp() } : {}),
            });
          }
        } catch (error) {
          console.error("Error adding quiz result:", error);
        }
      },
      
      addLearningSession: async (session) => {
        try {
          const user = useAuthStore.getState().user;
          
          // Update local state
          set((state) => {
            // Ensure stats is initialized
            if (!state.stats) {
              return { 
                stats: { 
                  ...initialStats, 
                  learningSessions: [session],
                  totalWordsLearned: session.wordsReviewed,
                  totalWordsMastered: session.wordsMastered
                } 
              };
            }

            const newStats = { ...state.stats };
            newStats.learningSessions = [session, ...(newStats.learningSessions || [])];
            newStats.totalWordsLearned = (newStats.totalWordsLearned || 0) + session.wordsReviewed;
            newStats.totalWordsMastered = (newStats.totalWordsMastered || 0) + session.wordsMastered;
            
            // Ensure achievements array exists
            if (!newStats.achievements) {
              newStats.achievements = [...initialAchievements];
            }
            
            // Update achievements based on learning session
            const fastLearnerAchievement = newStats.achievements.find(a => a.id === "1");
            if (fastLearnerAchievement && !fastLearnerAchievement.isUnlocked) {
              // Safely handle date comparison
              const todaySessions = newStats.learningSessions.filter(s => {
                if (!s.date || !session.date) return false;
                
                // Extract date part safely
                let sessionDate = "";
                let currentDate = "";
                
                try {
                  // Handle both date string formats
                  sessionDate = typeof s.date === 'string' ? 
                    (s.date.includes('T') ? s.date.split('T')[0] : s.date) : '';
                    
                  currentDate = typeof session.date === 'string' ? 
                    (session.date.includes('T') ? session.date.split('T')[0] : session.date) : '';
                } catch (e) {
                  console.error("Error parsing date:", e);
                  return false;
                }
                
                return sessionDate === currentDate;
              });
              
              const todayWordsLearned = todaySessions.reduce(
                (sum, s) => sum + s.wordsReviewed, 0
              );
              
              fastLearnerAchievement.progress = Math.min(todayWordsLearned, fastLearnerAchievement.maxProgress);
              if (fastLearnerAchievement.progress >= fastLearnerAchievement.maxProgress) {
                fastLearnerAchievement.isUnlocked = true;
              }
            }
            
            // Update Dedicated Learner achievement
            const dedicatedLearnerAchievement = newStats.achievements.find(a => a.id === "7");
            if (dedicatedLearnerAchievement) {
              // Count unique days of learning - safely handle date extraction
              const uniqueDays = new Set(
                newStats.learningSessions
                  .map(s => {
                    if (!s.date) return '';
                    
                    try {
                      // Handle both date string formats
                      return typeof s.date === 'string' ? 
                        (s.date.includes('T') ? s.date.split('T')[0] : s.date) : '';
                    } catch (e) {
                      console.error("Error extracting date:", e);
                      return '';
                    }
                  })
                  .filter(date => date !== '') // Remove empty strings
              ).size;
              
              dedicatedLearnerAchievement.progress = Math.min(uniqueDays, dedicatedLearnerAchievement.maxProgress);
              if (dedicatedLearnerAchievement.progress >= dedicatedLearnerAchievement.maxProgress) {
                dedicatedLearnerAchievement.isUnlocked = true;
              }
            }
            
            return { stats: newStats };
          });
          
          if (!user) return;
          
          // Add learning session to Firestore
          const sessionsRef = collection(db, "users", user.uid, "learningSessions");
          await addDoc(sessionsRef, {
            ...session,
            createdAt: serverTimestamp(),
          });
          
          // Update stats in Firestore
          const statsRef = doc(db, "users", user.uid, "stats", "userStats");
          const statsSnapshot = await getDoc(statsRef);
          
          if (statsSnapshot.exists()) {
            const statsData = statsSnapshot.data();
            await updateDoc(statsRef, {
              totalWordsLearned: (statsData.totalWordsLearned || 0) + session.wordsReviewed,
              totalWordsMastered: (statsData.totalWordsMastered || 0) + session.wordsMastered,
              updatedAt: serverTimestamp(),
            });
          }
          
          // Update achievements
          const stats = get().stats;
          if (!stats || !stats.achievements) return;
          
          // Update Fast Learner achievement
          const fastLearnerAchievement = stats.achievements.find(a => a.id === "1");
          if (fastLearnerAchievement && !fastLearnerAchievement.isUnlocked) {
            // Calculate today's words learned
            const todaySessions = stats.learningSessions.filter(s => {
              if (!s.date || !session.date) return false;
              
              // Extract date part safely
              let sessionDate = "";
              let currentDate = "";
              
              try {
                // Handle both date string formats
                sessionDate = typeof s.date === 'string' ? 
                  (s.date.includes('T') ? s.date.split('T')[0] : s.date) : '';
                  
                currentDate = typeof session.date === 'string' ? 
                  (session.date.includes('T') ? session.date.split('T')[0] : session.date) : '';
              } catch (e) {
                console.error("Error parsing date:", e);
                return false;
              }
              
              return sessionDate === currentDate;
            });
            
            const todayWordsLearned = todaySessions.reduce(
              (sum, s) => sum + s.wordsReviewed, 0
            );
            
            const achievementRef = doc(db, "users", user.uid, "achievements", "1");
            await updateDoc(achievementRef, {
              progress: Math.min(todayWordsLearned, fastLearnerAchievement.maxProgress),
              isUnlocked: todayWordsLearned >= fastLearnerAchievement.maxProgress,
              updatedAt: serverTimestamp(),
              ...(todayWordsLearned >= fastLearnerAchievement.maxProgress ? { unlockedAt: serverTimestamp() } : {}),
            });
          }
          
          // Update Dedicated Learner achievement
          const dedicatedLearnerAchievement = stats.achievements.find(a => a.id === "7");
          if (dedicatedLearnerAchievement) {
            // Count unique days of learning
            const uniqueDays = new Set(
              stats.learningSessions
                .map(s => {
                  if (!s.date) return '';
                  
                  try {
                    // Handle both date string formats
                    return typeof s.date === 'string' ? 
                      (s.date.includes('T') ? s.date.split('T')[0] : s.date) : '';
                  } catch (e) {
                    console.error("Error extracting date:", e);
                    return '';
                  }
                })
                .filter(date => date !== '') // Remove empty strings
            ).size;
            
            const achievementRef = doc(db, "users", user.uid, "achievements", "7");
            await updateDoc(achievementRef, {
              progress: Math.min(uniqueDays, dedicatedLearnerAchievement.maxProgress),
              isUnlocked: uniqueDays >= dedicatedLearnerAchievement.maxProgress,
              updatedAt: serverTimestamp(),
              ...(uniqueDays >= dedicatedLearnerAchievement.maxProgress ? { unlockedAt: serverTimestamp() } : {}),
            });
          }
        } catch (error) {
          console.error("Error adding learning session:", error);
        }
      },
      
      updateStreak: async (date: string) => {
        try {
          const user = useAuthStore.getState().user;
          
          // Update local state
          set((state) => {
            // Ensure stats is initialized
            if (!state.stats) {
              return { 
                stats: { 
                  ...initialStats, 
                  lastStreak: date,
                  streakDays: 1
                } 
              };
            }

            const newStats = { ...state.stats };
            
            if (!newStats.lastStreak) {
              newStats.lastStreak = date;
              newStats.streakDays = 1;
            } else {
              const lastDate = new Date(newStats.lastStreak);
              const currentDate = new Date(date);
              
              // Calculate the difference in days
              const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays === 1) {
                // Consecutive day, increment streak
                newStats.streakDays = (newStats.streakDays || 0) + 1;
              } else if (diffDays > 1) {
                // Streak broken, reset to 1
                newStats.streakDays = 1;
              }
              // If diffDays is 0, it's the same day, so don't change the streak
              
              newStats.lastStreak = date;
            }
            
            // Ensure achievements array exists
            if (!newStats.achievements) {
              newStats.achievements = [...initialAchievements];
            }
            
            // Update streak achievement
            const weekStreakAchievement = newStats.achievements.find(a => a.id === "3");
            if (weekStreakAchievement) {
              weekStreakAchievement.progress = Math.min(newStats.streakDays, weekStreakAchievement.maxProgress);
              if (newStats.streakDays >= 7 && !weekStreakAchievement.isUnlocked) {
                weekStreakAchievement.isUnlocked = true;
              }
            }
            
            return { stats: newStats };
          });
          
          if (!user) return;
          
          // Update streak in Firestore
          const statsRef = doc(db, "users", user.uid, "stats", "userStats");
          const statsSnapshot = await getDoc(statsRef);
          
          if (statsSnapshot.exists()) {
            const statsData = statsSnapshot.data();
            let streakDays = 1;
            
            if (statsData.lastStreak) {
              const lastDate = new Date(statsData.lastStreak);
              const currentDate = new Date(date);
              
              // Calculate the difference in days
              const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays === 1) {
                // Consecutive day, increment streak
                streakDays = (statsData.streakDays || 0) + 1;
              } else if (diffDays > 1) {
                // Streak broken, reset to 1
                streakDays = 1;
              } else {
                // Same day, keep current streak
                streakDays = statsData.streakDays || 1;
              }
            }
            
            await updateDoc(statsRef, {
              lastStreak: date,
              streakDays,
              updatedAt: serverTimestamp(),
            });
            
            // Update Week Streak achievement
            const weekStreakAchievement = get().stats?.achievements?.find(a => a.id === "3");
            if (weekStreakAchievement) {
              const achievementRef = doc(db, "users", user.uid, "achievements", "3");
              await updateDoc(achievementRef, {
                progress: Math.min(streakDays, weekStreakAchievement.maxProgress),
                isUnlocked: streakDays >= 7,
                updatedAt: serverTimestamp(),
                ...(streakDays >= 7 && !weekStreakAchievement.isUnlocked ? { unlockedAt: serverTimestamp() } : {}),
              });
            }
          }
        } catch (error) {
          console.error("Error updating streak:", error);
        }
      },
      
      updateAchievement: async (id: string, progress: number) => {
        try {
          const user = useAuthStore.getState().user;
          
          // Update local state
          set((state) => {
            // Ensure stats is initialized
            if (!state.stats) {
              return { stats: initialStats };
            }

            const newStats = { ...state.stats };
            
            // Ensure achievements array exists
            if (!newStats.achievements) {
              newStats.achievements = [...initialAchievements];
            }
            
            const achievement = newStats.achievements.find(a => a.id === id);
            
            if (achievement) {
              achievement.progress = Math.min(progress, achievement.maxProgress);
              if (achievement.progress >= achievement.maxProgress) {
                achievement.isUnlocked = true;
              }
            }
            
            return { stats: newStats };
          });
          
          if (!user) return;
          
          // Update achievement in Firestore
          const achievementRef = doc(db, "users", user.uid, "achievements", id);
          const achievementSnapshot = await getDoc(achievementRef);
          
          if (achievementSnapshot.exists()) {
            const achievementData = achievementSnapshot.data();
            const maxProgress = achievementData.maxProgress || 100;
            const newProgress = Math.min(progress, maxProgress);
            const isUnlocked = newProgress >= maxProgress;
            
            await updateDoc(achievementRef, {
              progress: newProgress,
              isUnlocked,
              updatedAt: serverTimestamp(),
              ...(isUnlocked && !achievementData.isUnlocked ? { unlockedAt: serverTimestamp() } : {}),
            });
          }
        } catch (error) {
          console.error("Error updating achievement:", error);
        }
      },
      
      unlockAchievement: async (id: string) => {
        try {
          const user = useAuthStore.getState().user;
          
          // Update local state
          set((state) => {
            // Ensure stats is initialized
            if (!state.stats) {
              return { stats: initialStats };
            }

            const newStats = { ...state.stats };
            
            // Ensure achievements array exists
            if (!newStats.achievements) {
              newStats.achievements = [...initialAchievements];
            }
            
            const achievement = newStats.achievements.find(a => a.id === id);
            
            if (achievement) {
              achievement.progress = achievement.maxProgress;
              achievement.isUnlocked = true;
              achievement.unlockedAt = new Date().toISOString();
            }
            
            return { stats: newStats };
          });
          
          if (!user) return;
          
          // Unlock achievement in Firestore
          const achievementRef = doc(db, "users", user.uid, "achievements", id);
          const achievementSnapshot = await getDoc(achievementRef);
          
          if (achievementSnapshot.exists()) {
            const achievementData = achievementSnapshot.data();
            
            await updateDoc(achievementRef, {
              progress: achievementData.maxProgress,
              isUnlocked: true,
              unlockedAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        } catch (error) {
          console.error("Error unlocking achievement:", error);
        }
      },
      
      exportData: () => {
        const { stats } = get();
        return JSON.stringify(stats || initialStats);
      },
      
      importData: (data: string) => {
        try {
          const importedStats = JSON.parse(data) as UserStats;
          
          // Validate the imported data has the required structure
          if (!importedStats.achievements || 
              !importedStats.learningSessions || 
              !importedStats.quizResults) {
            return false;
          }
          
          set({ stats: importedStats });
          
          // If user is authenticated, sync with Firestore
          const user = useAuthStore.getState().user;
          if (user) {
            // This would be implemented to sync the imported data with Firestore
            // For now, we'll just update the local state
          }
          
          return true;
        } catch (error) {
          console.error("Failed to import data:", error);
          return false;
        }
      }
    }),
    {
      name: "stats-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);