import React from "react";
import { SafeAreaView, View, Text, StyleSheet, Image } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { globalStyles } from "../../styles/globalStyles";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { Card } from "../../components/common/Card";
import { KeyValueRow } from "../../components/common/KeyValueRow";

export function ProfileScreen() {
  const { user } = useAuth();
  const { themeStyles } = useTheme();
  return (
    <SafeAreaView
      style={[
        globalStyles.flex1,
        themeStyles.background,
        { paddingHorizontal: spacing.s16, marginTop: spacing.s16 },
      ]}
    >
      <View style={{ height: spacing.s20 }} />
      {user ? (
        <Card>
          <View style={{ alignItems: "center", marginBottom: spacing.s16 }}>
            <Image
              source={{
                uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.email
                )}&background=random&size=160`,
              }}
              style={{
                width: spacing.s80,
                height: spacing.s80,
                borderRadius: spacing.s40 as unknown as number,
                backgroundColor: themeStyles.colors.chipBg,
              }}
            />
            <Text
              style={{
                color: themeStyles.colors.text,
                fontSize: typography.size.lg,
                fontWeight: typography.weight.medium,
                marginTop: spacing.s8,
              }}
            >
              {user.email.split("@")[0]}
            </Text>
            <Text
              style={{
                color: themeStyles.colors.muted,
                fontSize: typography.size.sm,
              }}
            >
              {user.email}
            </Text>
          </View>

          <View style={{ rowGap: spacing.s8 }}>
            <KeyValueRow label="User ID" value={user.id} />
            <KeyValueRow label="Member since" value="—" />
            <KeyValueRow label="Plan" value="Free" />
          </View>
        </Card>
      ) : (
        <Card>
          <Text style={{ color: themeStyles.colors.text }}>Not logged in</Text>
        </Card>
      )}
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: { text: string; muted: string } & Record<string, any>;
}) {
  return (
    <View style={styles.row}>
      <Text style={{ color: color.muted, fontSize: typography.size.sm }}>
        {label}
      </Text>
      <Text style={{ color: color.text, fontWeight: typography.weight.medium }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: spacing.s12,
    padding: spacing.s16,
    ...globalStyles.shadowSmall,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
