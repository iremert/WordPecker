import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MOCK_USER } from "@/constants/mockData";
import { User } from "@/types";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/config/firebase";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
  updateUser: (updatedUser: Partial<User>) => Promise<void>;
}

// Helper function to convert Firebase user to app User
const createUserProfile = async (firebaseUser: FirebaseUser, name?: string): Promise<User> => {
  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    // User exists, return data
    const userData = userSnap.data();
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      name: userData.name || firebaseUser.displayName || "",
      photoURL: userData.photoURL || firebaseUser.photoURL || "",
      createdAt: userData.createdAt || new Date().toISOString(),
      preferences: userData.preferences || {},
    };
  } else {
    // Create new user document
    const newUser: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      name: name || firebaseUser.displayName || "",
      photoURL: firebaseUser.photoURL || "",
      createdAt: new Date().toISOString(),
      preferences: {},
    };
    
    await setDoc(userRef, {
      ...newUser,
      createdAt: serverTimestamp(),
    });
    
    return newUser;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simple validation
          if (email.trim() === "" || password.trim() === "") {
            throw new Error("Email and password are required");
          }
          
          // Accept demo credentials for testing
          if (email === "demo@example.com" && password === "password123") {
            set({
              user: MOCK_USER,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
          
          // Firebase authentication
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = await createUserProfile(userCredential.user);
          
          console.log("User logged in successfully:", user.email);
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          console.error("Login error:", error);
          let errorMessage = "Login failed";
          
          // Handle Firebase auth errors
          if (error.code === "auth/user-not-found") {
            errorMessage = "No user found with this email address";
          } else if (error.code === "auth/wrong-password") {
            errorMessage = "Incorrect password";
          } else if (error.code === "auth/invalid-email") {
            errorMessage = "Invalid email address";
          } else if (error.code === "auth/too-many-requests") {
            errorMessage = "Too many failed login attempts. Please try again later";
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simple validation
          if (name.trim() === "" || email.trim() === "" || password.trim() === "") {
            throw new Error("All fields are required");
          }
          
          if (!email.includes("@")) {
            throw new Error("Invalid email address");
          }
          
          if (password.length < 6) {
            throw new Error("Password must be at least 6 characters");
          }
          
          // Firebase authentication
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          
          // Update profile with name
          await updateProfile(userCredential.user, {
            displayName: name,
          });
          
          // Create user profile in Firestore
          const user = await createUserProfile(userCredential.user, name);
          
          console.log("User registered successfully:", user.email);
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          console.error("Registration error:", error);
          let errorMessage = "Registration failed";
          
          // Handle Firebase auth errors
          if (error.code === "auth/email-already-in-use") {
            errorMessage = "Email address is already in use";
          } else if (error.code === "auth/invalid-email") {
            errorMessage = "Invalid email address";
          } else if (error.code === "auth/weak-password") {
            errorMessage = "Password is too weak";
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await signOut(auth);
          console.log("User logged out successfully");
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error: any) {
          console.error("Logout error:", error);
          set({ isLoading: false });
        }
      },

      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        
        try {
          if (!email.includes("@")) {
            throw new Error("Invalid email address");
          }
          
          await sendPasswordResetEmail(auth, email);
          console.log("Password reset email sent to:", email);
          
          set({ isLoading: false });
          return Promise.resolve();
        } catch (error: any) {
          console.error("Password reset error:", error);
          let errorMessage = "Password reset failed";
          
          // Handle Firebase auth errors
          if (error.code === "auth/user-not-found") {
            errorMessage = "No user found with this email address";
          } else if (error.code === "auth/invalid-email") {
            errorMessage = "Invalid email address";
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({
            error: errorMessage,
            isLoading: false,
          });
          return Promise.reject(error);
        }
      },

      clearError: () => {
        set({ error: null });
      },

      updateUser: async (updatedUser) => {
        const { user } = get();
        
        if (!user || !user.uid) {
          throw new Error("User not authenticated");
        }
        
        set({ isLoading: true, error: null });
        
        try {
          // Update Firestore document
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            ...updatedUser,
            updatedAt: serverTimestamp(),
          });
          
          // Update profile if name is changed
          if (updatedUser.name && auth.currentUser) {
            await updateProfile(auth.currentUser, {
              displayName: updatedUser.name,
            });
          }
          
          console.log("User profile updated successfully");
          
          // Update local state
          set({
            user: { ...user, ...updatedUser },
            isLoading: false,
          });
        } catch (error: any) {
          console.error("Update user error:", error);
          set({
            error: error.message || "Failed to update user profile",
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);