import React, { ReactNode, useEffect } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { LanguageProvider } from "./LanguageProvider";
import { useAuthStore } from "@/store/authStore";
import { useWordListStore } from "@/store/wordListStore";
import { useStatsStore } from "@/store/statsStore";
import { auth } from "@/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useLanguageStore } from "@/store/languageStore";

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const { fetchLists } = useWordListStore();
  const { fetchStats } = useStatsStore();
  const { setLanguage } = useLanguageStore();

  // Set default language to Turkish
  useEffect(() => {
    setLanguage("tr");
  }, []);

  // Set up Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed in AppProvider:", firebaseUser ? "User logged in" : "User logged out");
      
      if (firebaseUser) {
        // User is signed in
        try {
          // Check if user document exists in Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          
          if (userDoc.exists()) {
            console.log("User document exists in Firestore, fetching data");
            
            // Fetch user data if authenticated
            if (isAuthenticated) {
              fetchLists();
              fetchStats();
            }
          } else {
            console.log("User document does not exist in Firestore");
          }
        } catch (error) {
          console.error("Error checking user document:", error);
        }
      }
    });
    
    return () => unsubscribe();
  }, [isAuthenticated]);

  return (
    <ThemeProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
};