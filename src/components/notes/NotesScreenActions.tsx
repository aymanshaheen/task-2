import React from "react";
import { View, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FloatingActionButton } from "../common/FloatingActionButton";
import { NetworkSnackbar } from "../common/NetworkSnackbar";
import { SavingToast } from "../common/SavingToast";

interface NotesScreenActionsProps {
  saving?: boolean;
  loading: boolean;
  isOffline: boolean;
  hasPendingOperations: boolean;
  syncStatus: {
    pendingOperations: number;
  };
}

export function NotesScreenActions({
  saving,
  loading,
  isOffline,
  hasPendingOperations,
  syncStatus,
}: NotesScreenActionsProps) {
  const navigation = useNavigation();

  const handleNetworkPress = () => {
    if (isOffline && hasPendingOperations) {
      Alert.alert(
        "Offline Mode",
        `You have ${syncStatus.pendingOperations} pending operations that will sync when you're back online.`
      );
    }
  };

  return (
    <View>
      <SavingToast visible={!!saving && !loading} />
      <FloatingActionButton
        accessibilityLabel="Add note"
        onPress={() => navigation.navigate("AddNote" as never)}
      />
      <NetworkSnackbar onPress={handleNetworkPress} />
    </View>
  );
}
