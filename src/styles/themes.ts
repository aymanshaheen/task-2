import { semanticColors } from "./colors";

export const themes = {
  light: {
    background: { backgroundColor: semanticColors.light.background },
    text: { color: semanticColors.light.text },
    card: { backgroundColor: semanticColors.light.surface },
    colors: semanticColors.light,
  },
  dark: {
    background: { backgroundColor: semanticColors.dark.background },
    text: { color: semanticColors.dark.text },
    card: {
      backgroundColor: semanticColors.dark.surface,
      // add subtle border for contrast against background in dark mode
      borderColor: semanticColors.dark.border,
      borderWidth: 1,
    },
    colors: semanticColors.dark,
  },
} as const;
