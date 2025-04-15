import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { AppProvider } from "@/components/AppProvider";
import { useThemeStore } from "@/store/themeStore";
import { auth } from "@/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useAuthStore } from "@/store/authStore";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

export default function RootLayout() {
  const { colors, initializeTheme } = useThemeStore();
  const { user, isAuthenticated } = useAuthStore();
  
  // Initialize theme on component mount
  useEffect(() => {
    initializeTheme();
  }, []);

  // Set up Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser ? "User logged in" : "User logged out");
      
      // This will be handled by the auth store
      // We're just setting up the listener here
      if (firebaseUser) {
        // You could fetch additional user data here if needed
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            console.log("User document exists in Firestore");
          } else {
            console.log("User document does not exist in Firestore");
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
        }
      }
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <AppProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(auth)/login"
          options={{
            headerShown: false,
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="(auth)/register"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="(auth)/reset-password"
          options={{
            title: "Reset Password",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="list/[id]"
          options={{
            title: "Word List",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="list/create"
          options={{
            title: "Create List",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="word/add"
          options={{
            title: "Add Word",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="learning/[id]"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="quiz/[id]"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </AppProvider>
  );
}