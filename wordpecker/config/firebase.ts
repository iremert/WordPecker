import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGH3sMVy_KLFAKFBB05BBsq2GFgxGqJzY",
  authDomain: "wordpecker-fed50.firebaseapp.com",
  projectId: "wordpecker-fed50",
  storageBucket: "wordpecker-fed50.firebasestorage.app",
  messagingSenderId: "440722238751",
  appId: "1:440722238751:web:a5fc35392d56f73935d42a",
  measurementId: "G-R37Q9Q3YSQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics only on web platform
let analytics = null;
if (Platform.OS === "web") {
  import("firebase/analytics").then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  });
}

export { analytics };
export default app;