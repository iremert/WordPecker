import { useEffect } from "react";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { auth } from "@/config/firebase";

export default function Index() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check if user is already authenticated with Firebase
    const currentUser = auth.currentUser;
    console.log("Index screen - Current Firebase user:", currentUser ? currentUser.email : "No user");
    console.log("Index screen - isAuthenticated:", isAuthenticated);
  }, []);

  return  (
    <Redirect href="/(auth)/login" />
  );
}