// Dynamic imports to keep heavy Expo modules out of the initial bundle

export const permissionsService = {
  async ensureMediaPermissions(): Promise<boolean> {
    const ImagePicker = await import("expo-image-picker");
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === "granted";
  },

  async ensureCameraPermissions(): Promise<boolean> {
    const ImagePicker = await import("expo-image-picker");
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === "granted";
  },

  async ensureLocationPermissions(): Promise<boolean> {
    const Location = await import("expo-location");
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  },
};
