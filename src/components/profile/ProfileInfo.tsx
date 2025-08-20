import React from "react";
import { View } from "react-native";
import { KeyValueRow } from "../common/KeyValueRow";
import { spacing } from "../../styles/spacing";

type Props = {
  userId: string;
  memberSince?: string | null;
  plan?: string;
  location?: string | null;
};

export function ProfileInfo({
  userId,
  memberSince,
  plan = "Free",
  location,
}: Props) {
  return (
    <View style={{ rowGap: spacing.s8 }}>
      <KeyValueRow label="User ID" value={userId} />
      <KeyValueRow label="Member since" value={memberSince || "—"} />
      <KeyValueRow label="Plan" value={plan} />
      {location ? (
        <KeyValueRow label="Location" value={location} />
      ) : (
        <KeyValueRow label="Location" value="Not set" />
      )}
    </View>
  );
}
