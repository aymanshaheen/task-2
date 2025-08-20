import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import { useTheme } from "../../hooks/useTheme";
import { locationService } from "../../services/locationService";
import { MapConfirmBar } from "../../components/map/MapConfirmBar";
import { MapTipBanner } from "../../components/map/MapTipBanner";

type Coordinates = { latitude: number; longitude: number };

type MapPickerParams = {
  initialLocation?: Coordinates | null;
  targetRouteName: string;
};

export function MapPickerScreen({ navigation, route }: any) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;

  const params: MapPickerParams = route?.params || {};
  const [selected, setSelected] = useState<Coordinates | null>(
    params.initialLocation || null
  );
  const [addressText, setAddressText] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const initial = useMemo(
    () => selected || { latitude: 25.2854, longitude: 51.531 },
    [selected]
  );

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Pick Location",
    });
  }, [navigation]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!selected) {
        setAddressText(null);
        return;
      }
      setLoadingAddress(true);
      const addr = await locationService.reverseGeocode(
        selected.latitude,
        selected.longitude
      );
      if (!cancelled) {
        const pretty = addr
          ? [addr.city, addr.region, addr.country].filter(Boolean).join(", ")
          : null;
        setAddressText(pretty && pretty.length > 0 ? pretty : null);
        setLoadingAddress(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const onConfirm = useCallback(async () => {
    if (!selected) return;
    let pretty = addressText || undefined;
    if (!pretty) {
      const addr = await locationService.reverseGeocode(
        selected.latitude,
        selected.longitude
      );
      if (addr) {
        const formatted = [addr.city, addr.region, addr.country]
          .filter(Boolean)
          .join(", ");
        pretty = formatted || undefined;
      }
    }
    const payload = {
      selectedLocation: {
        latitude: selected.latitude,
        longitude: selected.longitude,
        address:
          pretty ||
          `${selected.latitude.toFixed(4)}, ${selected.longitude.toFixed(4)}`,
      },
    };
    const target = params?.targetRouteName || "AddNote";
    navigation.navigate({ name: target, params: payload, merge: true } as any);
  }, [selected, addressText, navigation, params?.targetRouteName]);

  const leafletHtml = useMemo(
    () => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="initial-scale=1, maximum-scale=1" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; }
          .leaflet-container { background: #f0f0f0; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          const initial = { lat: ${initial.latitude}, lng: ${
      initial.longitude
    } };
          const map = L.map('map').setView([initial.lat, initial.lng], 12);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);
          let marker = ${
            selected
              ? "L.marker([initial.lat, initial.lng], { draggable: true }).addTo(map);"
              : "null"
          }

          function postSelection(lat, lng) {
            const msg = JSON.stringify({ type: 'select', latitude: lat, longitude: lng });
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(msg);
            }
          }

          if (marker) {
            marker.on('dragend', (e) => {
              const { lat, lng } = e.target.getLatLng();
              postSelection(lat, lng);
            });
          }

          map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            if (!marker) {
              marker = L.marker([lat, lng], { draggable: true }).addTo(map);
              marker.on('dragend', (ev) => {
                const { lat, lng } = ev.target.getLatLng();
                postSelection(lat, lng);
              });
            } else {
              marker.setLatLng([lat, lng]);
            }
            postSelection(lat, lng);
          });
        </script>
      </body>
    </html>
  `,
    [initial.latitude, initial.longitude, selected]
  );

  const onWebMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event?.nativeEvent?.data || "{}");
      if (
        data?.type === "select" &&
        typeof data.latitude === "number" &&
        typeof data.longitude === "number"
      ) {
        setSelected({ latitude: data.latitude, longitude: data.longitude });
      }
    } catch {}
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <WebView
        originWhitelist={["*"]}
        style={{ flex: 1 }}
        source={{ html: leafletHtml }}
        onMessage={onWebMessage}
      />

      <MapConfirmBar
        selectedLabel={
          selected
            ? `Coordinates: ${selected.latitude.toFixed(
                4
              )}, ${selected.longitude.toFixed(4)}`
            : null
        }
        addressLabel={addressText}
        loadingAddress={loadingAddress}
        onCancel={() => navigation.goBack()}
        onConfirm={onConfirm}
        confirmEnabled={!!selected}
      />

      <MapTipBanner visible={!selected} />
    </View>
  );
}
