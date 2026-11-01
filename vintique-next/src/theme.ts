"use client";

import { createTheme, type Theme } from "@mui/material/styles";

const serif = "var(--font-serif), Garamond, Georgia, serif";
const sans = "var(--font-sans), system-ui, sans-serif";

// Vintage palette: aged parchment, oxblood, antique brass, olive and espresso.
export const palette = {
  parchment: "#F3EBDD",
  cream: "#FBF7F0",
  oxblood: "#6E2C24",
  brass: "#865C1C",
  olive: "#5B6B2E",
  espresso: "#2B211B",
  taupe: "#6E5F52",
};

// Frosted-glass surface with a warm tint. Spread into `sx` or component overrides.
export const glass = (theme: Theme) => ({
  backgroundColor: "rgba(251, 247, 240, 0.62)",
  backdropFilter: "blur(20px) saturate(140%)",
  WebkitBackdropFilter: "blur(20px) saturate(140%)",
  border: "1px solid rgba(255, 250, 240, 0.75)",
  boxShadow: "0 12px 40px -14px rgba(74, 44, 28, 0.22)",
  ...theme.applyStyles("dark", {
    backgroundColor: "rgba(36, 28, 22, 0.58)",
    border: "1px solid rgba(242, 232, 216, 0.08)",
    boxShadow: "0 12px 40px -14px rgba(0, 0, 0, 0.65)",
  }),
});

const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: palette.oxblood },
        secondary: { main: palette.brass, contrastText: palette.cream },
        success: { main: palette.olive },
        error: { main: "#A33A2C" },
        background: { default: palette.parchment, paper: palette.cream },
        text: { primary: palette.espresso, secondary: palette.taupe },
        divider: "rgba(43, 33, 27, 0.14)",
      },
    },
    dark: {
      palette: {
        primary: { main: "#E3A994" },
        secondary: { main: "#D9AE5F" },
        success: { main: "#A7B56A" },
        error: { main: "#E08A7A" },
        background: { default: "#15100C", paper: "#211A15" },
        text: { primary: "#F2E8D8", secondary: "#B5A592" },
        divider: "rgba(242, 232, 216, 0.1)",
      },
    },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: sans,
    h1: { fontFamily: serif, fontWeight: 500, letterSpacing: "-0.01em" },
    h2: { fontFamily: serif, fontWeight: 500, letterSpacing: "-0.01em" },
    h3: { fontFamily: serif, fontWeight: 500 },
    h4: { fontFamily: serif, fontWeight: 600 },
    h5: { fontFamily: serif, fontWeight: 600 },
    h6: { fontWeight: 600 },
    overline: { fontWeight: 600, letterSpacing: "0.2em" },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: "0.02em" },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 999, paddingInline: 20 }, sizeLarge: { paddingBlock: 12, paddingInline: 28 } },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: ({ theme }) => ({ ...glass(theme), borderRadius: 20, overflow: "hidden" }) },
    },
    MuiDialog: {
      styleOverrides: { paper: ({ theme }) => ({ ...glass(theme), borderRadius: 24, backgroundImage: "none" }) },
    },
    MuiDrawer: {
      styleOverrides: { paper: ({ theme }) => ({ ...glass(theme), backgroundImage: "none" }) },
    },
    MuiMenu: {
      styleOverrides: { paper: ({ theme }) => ({ ...glass(theme), marginTop: 8, borderRadius: 14, backgroundImage: "none" }) },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 12,
          backgroundColor: "rgba(251, 247, 240, 0.55)",
          ...theme.applyStyles("dark", { backgroundColor: "rgba(242, 232, 216, 0.04)" }),
        }),
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 500 } } },
  },
});

export default theme;
