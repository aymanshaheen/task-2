import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { FormField } from "./FormField";
import { FavoriteToggle } from "./FavoriteToggle";
import { PublicToggle } from "./PublicToggle";
import { FormActions } from "./FormActions";
import { ErrorText } from "../common/ErrorText";
import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { locationService } from "../../services/locationService";
import { useNavigation } from "@react-navigation/native";

interface NoteFormProps {
  title: string;
  content: string;
  isFavorite: boolean;
  isPublic?: boolean;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onFavoriteChange: (isFavorite: boolean) => void;
  onPublicChange?: (isPublic: boolean) => void;
  onCancel: () => void;
  onSave: () => void;
  titleError?: string;
  contentError?: string;
  generalError?: string;
  disabled?: boolean;
  isEditMode?: boolean;
  photos?: string[];
  onPickPhotos?: () => void;
  onRemovePhoto?: (uri: string) => void;
  location?: { latitude: number; longitude: number; address?: string };
  onLocationChange?: (
    loc: { latitude: number; longitude: number; address?: string } | null
  ) => void;
  onUseCurrentLocation?: () => void;
}

export function NoteForm({
  title,
  content,
  isFavorite,
  isPublic = false,
  onTitleChange,
  onContentChange,
  onFavoriteChange,
  onPublicChange,
  onCancel,
  onSave,
  titleError,
  contentError,
  generalError,
  disabled = false,
  isEditMode = false,
  photos = [],
  onPickPhotos,
  onRemovePhoto,
  location,
  onLocationChange,
  onUseCurrentLocation,
}: NoteFormProps) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  const navigation: any = useNavigation();
  const [locationQuery, setLocationQuery] = useState<string>(
    location?.address || ""
  );
  const [suggestions, setSuggestions] = useState<
    Array<{ latitude: number; longitude: number; label: string; address?: any }>
  >([]);

  useEffect(() => {
    setLocationQuery(location?.address || "");
    // Clear any open suggestions when a location is selected externally
    setSuggestions([]);
  }, [location?.address, location?.latitude, location?.longitude]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!locationQuery || locationQuery.trim().length < 3) {
        setSuggestions([]);
        return;
      }
      const res = await locationService.searchAddress(locationQuery.trim());
      if (!cancelled) setSuggestions(res);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [locationQuery]);

  return (
    <View>
      <FormField
        label="Title"
        value={title}
        onChangeText={onTitleChange}
        placeholder="Enter note title..."
        error={titleError}
        maxLength={100}
        disabled={disabled}
        required
        showCharCount
      />

      <FavoriteToggle
        value={isFavorite}
        onValueChange={onFavoriteChange}
        disabled={disabled}
      />

      {onPublicChange && (
        <PublicToggle
          value={isPublic}
          onValueChange={onPublicChange}
          disabled={disabled}
        />
      )}

      {/* Photos */}
      <View style={{ marginTop: spacing.s8 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: spacing.s6,
          }}
        >
          <Text style={{ color: c.text, fontWeight: typography.weight.medium }}>
            Photos
          </Text>
          <TouchableOpacity
            disabled={disabled}
            onPress={onPickPhotos}
            activeOpacity={0.8}
          >
            <Text style={{ color: disabled ? c.muted : c.primary }}>
              Add from Gallery
            </Text>
          </TouchableOpacity>
        </View>
        {photos?.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: spacing.s4 }}
          >
            {photos.map((uri) => (
              <View key={uri} style={{ marginRight: spacing.s8 }}>
                <Image
                  source={{ uri }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: spacing.s6,
                    backgroundColor: c.surface,
                  }}
                />
                {onRemovePhoto && (
                  <TouchableOpacity
                    onPress={() => onRemovePhoto(uri)}
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      backgroundColor: c.surface,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 10,
                    }}
                    activeOpacity={0.9}
                  >
                    <Text style={{ color: c.text }}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={{ color: c.muted }}>No photos added</Text>
        )}
      </View>

      <FormField
        label="Content"
        value={content}
        onChangeText={onContentChange}
        placeholder="Write your note content here..."
        error={contentError}
        maxLength={5000}
        disabled={disabled}
        required
        showCharCount
        multiline
        minHeight={200}
      />

      {/* Location */}
      <View style={{ marginTop: spacing.s8 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: spacing.s6,
          }}
        >
          <Text style={{ color: c.text, fontWeight: typography.weight.medium }}>
            Location
          </Text>
          <View style={{ flexDirection: "row" }}>
            {onUseCurrentLocation && (
              <TouchableOpacity
                disabled={disabled}
                onPress={onUseCurrentLocation}
                activeOpacity={0.8}
                style={{ marginRight: spacing.s12 }}
              >
                <Text style={{ color: disabled ? c.muted : c.primary }}>
                  Use Current
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              disabled={disabled}
              onPress={() => {
                const initial = location
                  ? {
                      latitude: location.latitude,
                      longitude: location.longitude,
                    }
                  : undefined;
                navigation.navigate("MapPicker", {
                  initialLocation: initial,
                  targetRouteName: "AddNote",
                });
              }}
              activeOpacity={0.8}
            >
              <Text style={{ color: disabled ? c.muted : c.primary }}>
                Pick on Map
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <FormField
          label="Address"
          value={locationQuery}
          onChangeText={(t) => {
            setLocationQuery(t);
            if (onLocationChange) onLocationChange(null);
          }}
          placeholder="Search address or enter 'lat, lon'..."
          disabled={disabled}
          onEndEditing={async () => {
            const q = (locationQuery || "").trim();
            if (!q || q.length < 3) return;
            const results = await locationService.searchAddress(q);
            if (results && results.length > 0) {
              const best = results[0];
              const pretty = best.label;
              setLocationQuery(pretty);
              onLocationChange?.({
                latitude: best.latitude,
                longitude: best.longitude,
                address: pretty,
              });
              setSuggestions([]);
            }
          }}
          onSubmitEditing={async () => {
            const q = (locationQuery || "").trim();
            if (!q || q.length < 3) return;
            const results = await locationService.searchAddress(q);
            if (results && results.length > 0) {
              const best = results[0];
              const pretty = best.label;
              setLocationQuery(pretty);
              onLocationChange?.({
                latitude: best.latitude,
                longitude: best.longitude,
                address: pretty,
              });
              setSuggestions([]);
            }
          }}
        />
        {suggestions.length > 0 && !disabled && (
          <View style={{ marginTop: spacing.s4 }}>
            {suggestions.map((s) => (
              <TouchableOpacity
                key={`${s.latitude}_${s.longitude}_${s.label}`}
                onPress={() => {
                  const pretty = s.label;
                  setLocationQuery(pretty);
                  onLocationChange?.({
                    latitude: s.latitude,
                    longitude: s.longitude,
                    address: pretty,
                  });
                  setSuggestions([]);
                }}
                style={{ paddingVertical: spacing.s8 }}
                activeOpacity={0.8}
              >
                <Text style={{ color: c.text }}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {!!location && (
          <>
            {!!location.address && (
              <Text style={{ marginTop: spacing.s4, color: c.muted }}>
                Selected: {location.address}
              </Text>
            )}
            <Text style={{ marginTop: spacing.s2, color: c.muted }}>
              Coordinates: {location.latitude.toFixed(4)},{" "}
              {location.longitude.toFixed(4)}
            </Text>
          </>
        )}
      </View>

      {generalError && <ErrorText message={generalError} />}

      <FormActions
        onCancel={onCancel}
        onSave={onSave}
        disabled={disabled}
        saveText={isEditMode ? "Update" : "Save"}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
