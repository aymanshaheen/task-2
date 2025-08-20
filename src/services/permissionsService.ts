import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

export const permissionsService = {
  async ensureMediaPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === "granted";
  },

  async ensureCameraPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === "granted";
  },

  async ensureLocationPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  },
};
