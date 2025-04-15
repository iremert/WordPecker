import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

interface ThemeContextType {
  toggleTheme: () => void;
  isDarkMode: boolean;
  colors: any;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { toggleTheme, isDarkMode, colors, initializeTheme } = useThemeStore();
  
  // Initialize theme on component mount
  useEffect(() => {
    initializeTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ toggleTheme, isDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};