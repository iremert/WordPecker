import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightColors, darkColors } from "@/constants/colors";

interface ThemeState {
  isDarkMode: boolean;
  colors: {
    primary: string;
    primaryLight: string;
    secondary: string;
    secondaryLight: string;
    accent: string;
    accentLight: string;
    success: string;
    successLight: string;
    error: string;
    errorLight: string;
    warning: string;
    warningLight: string;
    info: string;
    infoLight: string;
    pink: string;
    pinkLight: string;
    purple: string;
    purpleLight: string;
    orange: string;
    orangeLight: string;
    teal: string;
    tealLight: string;
    lime: string;
    limeLight: string;
    background: string;
    backgroundLight: string;
    card: string;
    cardLight: string;
    text: string;
    textLight: string;
    border: string;
    shadow: string;
  };
  isInitialized: boolean;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: false,
      colors: lightColors,
      isInitialized: false,
      toggleTheme: () =>
        set((state) => ({
          isDarkMode: !state.isDarkMode,
          colors: state.isDarkMode ? lightColors : darkColors,
        })),
      initializeTheme: () => {
        if (!get().isInitialized) {
          set((state) => ({
            colors: state.isDarkMode ? darkColors : lightColors,
            isInitialized: true,
          }));
        }
      },
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);