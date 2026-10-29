"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

type ThemeContextType = { dark: boolean; toggle: () => void };
const ThemeContext = createContext<ThemeContextType>({ dark: false, toggle: () => {} });
export const useThemeMode = () => useContext(ThemeContext);

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") setDark(true);
  }, []);

  const toggle = () => {
    setDark((d) => {
      const next = !d;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  const theme = createTheme({
    palette: {
      mode: dark ? "dark" : "light",
      primary: { main: "#2C4A3E" },
      secondary: { main: "#B8943F" },
      background: dark ? { default: "#1B2B24", paper: "#2a231c" } : { default: "#F7F5F0", paper: "#ffffff" },
      text: dark ? { primary: "#F7F5F0", secondary: "#B8943F" } : { primary: "#1B3B2B", secondary: "#555" },
    },
  });

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
