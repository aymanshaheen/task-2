import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

type Props = {
  selectedLabel: string | null;
  addressLabel: string | null;
  loadingAddress: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmEnabled: boolean;
};

export function MapConfirmBar({
  selectedLabel,
  addressLabel,
  loadingAddress,
  onCancel,
  onConfirm,
  confirmEnabled,
}: Props) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  return (
    <View
      style={{
        position: "absolute",
        left: spacing.s12,
        right: spacing.s12,
        bottom: spacing.s16,
        backgroundColor: c.surface,
        borderRadius: spacing.s12,
        padding: spacing.s12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
      }}
    >
      <Text style={{ color: c.text, marginBottom: spacing.s8 }}>
        {selectedLabel || "Long-press on the map to drop a pin"}
      </Text>
      {!!selectedLabel && (
        <Text style={{ color: c.muted, marginBottom: spacing.s8 }}>
          {loadingAddress ? "Resolving address..." : addressLabel || ""}
        </Text>
      )}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={onCancel}
          style={{
            paddingVertical: spacing.s10,
            paddingHorizontal: spacing.s12,
          }}
        >
          <Text style={{ color: c.muted, fontSize: typography.size.md }}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!confirmEnabled}
          onPress={onConfirm}
          style={{
            backgroundColor: confirmEnabled ? c.primary : c.border,
            paddingVertical: spacing.s10,
            paddingHorizontal: spacing.s16,
            borderRadius: spacing.s10,
            marginLeft: spacing.s8,
          }}
          activeOpacity={0.85}
        >
          <Text
            style={{
              color: confirmEnabled ? c.white : c.muted,
              fontWeight: typography.weight.medium,
            }}
          >
            Confirm
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
