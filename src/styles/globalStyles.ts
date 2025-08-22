import { StyleSheet } from "react-native";

import { palette } from "./colors";
import { spacing } from "./spacing";

export const globalStyles = StyleSheet.create({
  flex1: { flex: 1 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: spacing.s12,
    paddingTop: spacing.s8,
  },
  shadowSmall: {
    elevation: 1,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});
