
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

type Theme = "light" | "dark" | "cyberpunk" | "dracula" | "nord" | "purple" | "green" | "ocean" | "sunset" | "forest" | "coffee" | "pastel" | "neon" | "vintage" | "midnight" | "royal" | "super-hacker";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
  isUpdating: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: async () => { /* void return instead of null */ },
  isUpdating: false,
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || "light"
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Load user's theme preference from Supabase when signed in
  useEffect(() => {
    const loadUserTheme = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('active_theme')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error("Error loading user theme:", error);
            return;
          }
          
          if (data && data.active_theme) {
            const userTheme = data.active_theme as Theme;
            setThemeState(userTheme);
            localStorage.setItem("theme", userTheme);
            console.log("Loaded user theme:", userTheme);
          }
        } catch (error) {
          console.error("Error loading user theme:", error);
        }
      }
    };

    loadUserTheme();
  }, [user]);

  // Apply theme to document with proper CSS custom properties
  const applyThemeToDocument = useCallback((themeName: Theme) => {
    // Remove all existing theme attributes and classes
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove(
      "light", "dark", "cyberpunk", "dracula", "nord", "purple", 
      "green", "ocean", "sunset", "forest", "coffee", "pastel", 
      "neon", "vintage", "midnight", "royal", "super-hacker"
    );
    
    // Set the new theme
    document.documentElement.setAttribute("data-theme", themeName);
    document.documentElement.classList.add(themeName);
    
    // Special handling for dark mode compatibility
    if (themeName === "dark" || themeName === "dracula" || themeName === "midnight" || themeName === "super-hacker") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    console.log("Applied theme:", themeName);
  }, []);

  // Update both localStorage and state
  const setTheme = useCallback(async (newTheme: Theme) => {
    setIsUpdating(true);
    
    try {
      console.log("Setting theme to:", newTheme);
      
      setThemeState(newTheme);
      localStorage.setItem("theme", newTheme);
      
      // Apply theme immediately to document
      applyThemeToDocument(newTheme);
      
      // If user is authenticated, save their preference to their profile
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ active_theme: newTheme })
          .eq('id', user.id);
          
        if (error) {
          console.error("Error saving theme preference:", error);
        } else {
          console.log("Theme preference saved to database");
        }
      }
    } catch (error) {
      console.error("Error saving theme preference:", error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [user, applyThemeToDocument]);

  // Apply theme on component mount and theme changes
  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme, applyThemeToDocument]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isUpdating }}>
      {children}
    </ThemeContext.Provider>
  );
};
