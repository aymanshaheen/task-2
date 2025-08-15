import { StyleSheet } from "react-native";
import { spacing } from "./spacing";
import { palette } from "./colors";

export const globalStyles = StyleSheet.create({
  flex1: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.s12,
    paddingTop: spacing.s8,
  },
  shadowSmall: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
});
