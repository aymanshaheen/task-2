import React, { useMemo, useCallback, createContext, useContext } from "react";

import { themes } from "../styles/themes";

import { useAsyncStorage } from "./useAsyncStorage";

export type ThemeName = "light" | "dark";
export type ThemeStyles = (typeof themes)[keyof typeof themes];

type ThemeContextValue = {
  theme: ThemeName;
  toggleTheme: () => void;
  themeStyles: ThemeStyles;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { value: theme, setValue } = useAsyncStorage<ThemeName>(
    "theme",
    "light"
  );

  const toggleTheme = useCallback(() => {
    setValue(theme === "dark" ? "light" : "dark");
  }, [theme, setValue]);

  const themeStyles: ThemeStyles = useMemo(() => themes[theme], [theme]);

  const contextValue = useMemo(
    () => ({ theme, toggleTheme, themeStyles }),
    [theme, toggleTheme, themeStyles]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    const theme: ThemeName = "light";
    return {
      theme,
      toggleTheme: () => {},
      themeStyles: themes[theme],
    } as const;
  }
  return ctx;
}
