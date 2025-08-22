// Defer heavy module load to calls
let Location: any;
async function getLocationModule() {
  if (!Location) {
    Location = await import("expo-location");
  }
  return Location;
}

export type SimpleLocation = {
  latitude: number;
  longitude: number;
};

function formatAddressLine(
  addr?: {
    country?: string;
    region?: string;
    city?: string;
  } | null
): string | undefined {
  if (!addr) return undefined;
  const pretty = [addr.city, addr.region, addr.country]
    .filter(Boolean)
    .join(", ");
  return pretty || undefined;
}

export const locationService = {
  async getCurrentLocation(): Promise<SimpleLocation | null> {
    try {
      const L = await getLocationModule();
      const { coords } = await L.getCurrentPositionAsync({});
      return { latitude: coords.latitude, longitude: coords.longitude };
    } catch (e) {
      return null;
    }
  },

  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<{
    country?: string;
    region?: string; // governorate/state/province
    city?: string;
  } | null> {
    try {
      const L = await getLocationModule();
      const results = await L.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      const first = results?.[0];
      if (!first) return null;
      return {
        country: first.country || undefined,
        region: first.subregion || first.region || undefined,
        city: first.city || first.district || undefined,
      };
    } catch (e) {
      return null;
    }
  },

  async getCurrentLocationWithAddress(): Promise<{
    latitude: number;
    longitude: number;
    address?: { country?: string; region?: string; city?: string } | null;
  } | null> {
    const loc = await this.getCurrentLocation();
    if (!loc) return null;
    const address = await this.reverseGeocode(loc.latitude, loc.longitude);
    return { ...loc, address };
  },
  async searchAddress(query: string): Promise<
    Array<{
      latitude: number;
      longitude: number;
      label: string;
      address?: { country?: string; region?: string; city?: string } | null;
    }>
  > {
    if (!query || query.trim().length < 3) return [];
    try {
      const trimmed = query.trim();

      const coordMatch = trimmed.match(
        /^\s*(-?\d+(?:\.\d+)?)\s*[,\s]\s*(-?\d+(?:\.\d+)?)\s*$/
      );
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lon = parseFloat(coordMatch[2]);
        if (
          Number.isFinite(lat) &&
          Number.isFinite(lon) &&
          lat >= -90 &&
          lat <= 90 &&
          lon >= -180 &&
          lon <= 180
        ) {
          const addr = await this.reverseGeocode(lat, lon);
          return [
            {
              latitude: lat,
              longitude: lon,
              label: formatAddressLine(addr) || `${lat}, ${lon}`,
              address: addr,
            },
          ];
        }
      }

      const L = await getLocationModule();
      const results = await L.geocodeAsync(trimmed);
      const limited = results.slice(0, 5);
      const enriched: Array<{
        latitude: number;
        longitude: number;
        label: string;
        address?: { country?: string; region?: string; city?: string } | null;
      }> = [];
      for (const r of limited) {
        const addr = await this.reverseGeocode(r.latitude, r.longitude);
        const pretty = formatAddressLine(addr) || trimmed;
        enriched.push({
          latitude: r.latitude,
          longitude: r.longitude,
          label: pretty || query.trim(),
          address: addr,
        });
      }
      return enriched;
    } catch (e) {
      return [];
    }
  },
};
