export const typography = {
  family: {
    regular: undefined as string | undefined,
    medium: undefined as string | undefined,
    bold: undefined as string | undefined,
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
  weight: {
    regular: "400" as const,
    medium: "600" as const,
    bold: "700" as const,
  },
  lineHeight: {
    tight: 18,
    normal: 22,
    relaxed: 26,
  },
  letterSpacing: {
    tight: -0.2,
    normal: 0,
    wide: 0.2,
  },
} as const;

export type Typography = typeof typography;
