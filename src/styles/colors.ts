// Base color palette and semantic roles
export const palette = {
  white: "#FFFFFF",
  black: "#000000",

  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#374151",
  gray700: "#1F2937",
  gray800: "#111827",

  blue500: "#2563EB",
  blue400: "#3366FF",

  red400: "#FCA5A5",
  red500: "#D12C2C",
  red700: "#7F1D1D",

  yellow400: "#FBBF24",
  yellow500: "#F59E0B",
} as const;

export type Palette = typeof palette;

export const semanticColors = {
  light: {
    background: palette.gray50,
    surface: palette.white,
    text: palette.gray800,
    inverseText: palette.white,
    muted: palette.gray500,
    border: palette.gray200,
    borderStrong: palette.gray600,
    chipBg: palette.white,
    chipBorder: palette.gray300,
    primary: palette.blue500,
    primaryAlt: palette.blue400,
    danger: palette.red500,
    dangerBg: "#FEE2E2",
    dangerBorder: palette.red400,
    dangerText: palette.red700,
    warning: palette.yellow500,
    tabActiveBg: palette.gray100,
    placeholder: palette.gray500,
    black: palette.black,
    white: palette.white,
    overlay: "rgba(0,0,0,0.35)",
  },
  dark: {
    background: palette.gray800,
    surface: palette.gray700,
    text: palette.white,
    inverseText: palette.black,
    muted: palette.gray400,
    border: palette.gray600,
    borderStrong: palette.gray700,
    chipBg: palette.gray700,
    chipBorder: palette.gray600,
    primary: palette.blue500,
    primaryAlt: palette.blue400,
    danger: palette.red500,
    dangerBg: palette.gray700,
    dangerBorder: palette.gray600,
    dangerText: palette.white,
    warning: palette.yellow400,
    tabActiveBg: palette.gray600,
    placeholder: palette.gray400,
    black: palette.black,
    white: palette.white,
    overlay: "rgba(0,0,0,0.35)",
  },
} as const;

export type SemanticColors = typeof semanticColors;
