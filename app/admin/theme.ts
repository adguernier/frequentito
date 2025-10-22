import { defaultTheme } from "react-admin";
import { createTheme } from "@mui/material/styles";

export const darkTheme = createTheme({
  ...defaultTheme,
  palette: {
    mode: "dark",
    primary: {
      main: "#006FEE", // NextUI primary blue
    },
    secondary: {
      main: "#7828C8", // NextUI secondary purple
    },
    background: {
      default: "#000000", // Match your app's dark background
      paper: "#18181b", // Slightly lighter for cards/panels (zinc-900)
    },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255, 255, 255, 0.7)",
    },
  },
  components: {
    ...defaultTheme.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#18181b",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none", // Remove MUI's default gradient
        },
      },
    },
  },
});

export const lightTheme = createTheme({
  ...defaultTheme,
  palette: {
    mode: "light",
    primary: {
      main: "#006FEE",
    },
    secondary: {
      main: "#7828C8",
    },
    background: {
      default: "#ffffff",
      paper: "#f4f4f5", // zinc-100
    },
  },
  components: {
    ...defaultTheme.components,
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});
