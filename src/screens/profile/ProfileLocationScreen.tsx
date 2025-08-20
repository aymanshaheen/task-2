import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { useAuth } from "../../hooks/useAuth";
import { locationService } from "../../services/locationService";
import { permissionsService } from "../../services/permissionsService";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LocationActionButtons } from "../../components/profile/LocationActionButtons";
import { LocationSummary } from "../../components/profile/LocationSummary";
import { PrimaryBottomButton } from "../../components/profile/PrimaryBottomButton";

export function ProfileLocationScreen({ navigation }: any) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  const { updateUser } = useAuth();
  const [locationText, setLocationText] = useState<string | null>(null);
  const [addressText, setAddressText] = useState<string | null>(null);
  const route = useRoute();
  const selectedLocationFromPicker = (route.params as any)?.selectedLocation as
    | { latitude: number; longitude: number; address?: string }
    | undefined;

  useEffect(() => {
    if (selectedLocationFromPicker) {
      setLocationText(
        `${selectedLocationFromPicker.latitude.toFixed(
          4
        )}, ${selectedLocationFromPicker.longitude.toFixed(4)}`
      );
      setAddressText(selectedLocationFromPicker.address || null);
      (navigation as any)?.setParams?.({ selectedLocation: undefined });
    }
  }, [selectedLocationFromPicker]);

  const pickLocation = async () => {
    const granted = await permissionsService.ensureLocationPermissions();
    if (!granted) return;
    const loc = await locationService.getCurrentLocationWithAddress();
    if (loc) {
      setLocationText(
        `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`
      );
      const addr = loc.address;
      if (addr) {
        const pretty = [addr.city, addr.region, addr.country]
          .filter(Boolean)
          .join(", ");
        setAddressText(pretty.length > 0 ? pretty : null);
      }
    }
  };

  const onNext = async () => {
    await updateUser({ location: locationText || undefined } as any);
    navigation.navigate("ProfilePreferences");
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text
        style={{
          color: c.text,
          fontSize: typography.size.lg,
          marginBottom: spacing.s12,
        }}
      >
        Choose your location
      </Text>

      <LocationActionButtons
        onUseCurrent={pickLocation}
        onPickOnMap={() =>
          navigation.navigate("MapPicker", {
            initialLocation: undefined,
            targetRouteName: "ProfileLocation",
          })
        }
      />

      <LocationSummary locationText={locationText} addressText={addressText} />

      <PrimaryBottomButton label="Next" onPress={onNext} />
    </View>
  );
}
