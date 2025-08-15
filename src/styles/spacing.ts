export const spacing = {
  s2: 2,
  s4: 4,
  s6: 6,
  s8: 8,
  s10: 10,
  s12: 12,
  s16: 16,
  s20: 20,
  s24: 24,
  s28: 28,
  s32: 32,
  s36: 36,
  s40: 40,
  s56: 56,
  s64: 64,
  s92: 92,
} as const;

export type SpacingToken = keyof typeof spacing;
