import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { permissionsService } from "./permissionsService";
import { storageService } from "./storageService";

type OptimizerOptions = {
  maxDimension?: number;
  compressQuality?: number;
  generateThumbnail?: boolean;
  thumbnailSize?: number;
};

export type CachedImage = {
  cacheKey: string;
  uri: string;
  width: number;
  height: number;
  sizeBytes?: number;
  thumbnailUri?: string;
};

type PickerCommon = {
  allowsEditing?: boolean;
  aspect?: [number, number];
} & OptimizerOptions;

const IMAGES_DIR = FileSystem.documentDirectory + "images/";
const DEFAULT_MAX_DIMENSION = 1600;
const DEFAULT_THUMBNAIL_SIZE = 256;
const DEFAULT_COMPRESS = 0.75;
const MAX_CACHE_ITEMS = 100;

type ImagesManifest = Record<
  string,
  {
    uri: string;
    thumbnailUri?: string;
    width: number;
    height: number;
    sizeBytes?: number;
    lastAccessed: number;
  }
>;

async function ensureImagesDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(IMAGES_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
  }
}

async function loadManifest(): Promise<ImagesManifest> {
  const existing = await storageService.getItem<ImagesManifest>(
    "CACHE",
    "images_manifest",
    {} as ImagesManifest
  );
  return existing || {};
}

async function saveManifest(manifest: ImagesManifest): Promise<void> {
  await storageService.setItem("CACHE", "images_manifest", manifest);
}

function buildCacheFileName(prefix: string): string {
  const ext = Platform.OS === "android" ? "jpg" : "jpg";
  const stamp =
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return `${prefix}_${stamp}.${ext}`;
}

async function optimizeImage(
  uri: string,
  options?: OptimizerOptions
): Promise<{
  uri: string;
  width: number;
  height: number;
}> {
  const maxDim = options?.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const compressQ = options?.compressQuality ?? DEFAULT_COMPRESS;

  let targetWidth = maxDim;
  let targetHeight = maxDim;
  try {
    const { width, height } = await ImageManipulator.manipulateAsync(
      uri,
      [],
      {}
    );
    if (width && height) {
      if (width > height && width > maxDim) {
        targetWidth = maxDim;
        targetHeight = Math.round((height / width) * maxDim);
      } else if (height >= width && height > maxDim) {
        targetHeight = maxDim;
        targetWidth = Math.round((width / height) * maxDim);
      } else {
        targetWidth = width;
        targetHeight = height;
      }
    }
  } catch {}

  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: targetWidth, height: targetHeight } }],
    {
      compress: compressQ,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  return {
    uri: result.uri,
    width: result.width ?? targetWidth,
    height: result.height ?? targetHeight,
  };
}

async function createThumbnail(uri: string, size: number): Promise<string> {
  const out = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: size, height: size } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return out.uri;
}

async function saveToCacheFolder(
  tempUri: string,
  prefix: string
): Promise<{ uri: string; sizeBytes?: number }> {
  await ensureImagesDir();
  const filename = buildCacheFileName(prefix);
  const destUri = IMAGES_DIR + filename;
  await FileSystem.copyAsync({ from: tempUri, to: destUri });
  const info = await FileSystem.getInfoAsync(destUri);
  return { uri: destUri, sizeBytes: info.exists ? info.size : undefined };
}

async function cleanupIfNeeded(manifest: ImagesManifest): Promise<void> {
  const keys = Object.keys(manifest);
  if (keys.length <= MAX_CACHE_ITEMS) return;

  const sortedByAccess = keys
    .map((k) => ({ k, t: manifest[k].lastAccessed }))
    .sort((a, b) => a.t - b.t);

  const toRemove = sortedByAccess.slice(0, keys.length - MAX_CACHE_ITEMS);
  for (const r of toRemove) {
    const entry = manifest[r.k];
    try {
      if (entry?.uri)
        await FileSystem.deleteAsync(entry.uri, { idempotent: true });
      if (entry?.thumbnailUri)
        await FileSystem.deleteAsync(entry.thumbnailUri, { idempotent: true });
    } catch {}
    delete manifest[r.k];
  }
  await saveManifest(manifest);
}

export const cameraService = {
  async pickImage(options?: PickerCommon): Promise<CachedImage | null> {
    const ok = await permissionsService.ensureMediaPermissions();
    if (!ok) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: options?.allowsEditing ?? true,
      aspect: options?.aspect ?? [1, 1],
      quality: 1,
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
    });
    if (result.canceled) return null;
    const asset = result.assets?.[0];
    if (!asset) return null;

    const optimized = await optimizeImage(asset.uri, options);
    const saved = await saveToCacheFolder(optimized.uri, "img");

    const manifest = await loadManifest();
    const cacheKey = buildCacheFileName("key");
    let thumbnailUri: string | undefined;
    if (options?.generateThumbnail ?? true) {
      const thumbTemp = await createThumbnail(
        optimized.uri,
        options?.thumbnailSize ?? DEFAULT_THUMBNAIL_SIZE
      );
      const thumbSaved = await saveToCacheFolder(thumbTemp, "thumb");
      thumbnailUri = thumbSaved.uri;
    }

    manifest[cacheKey] = {
      uri: saved.uri,
      thumbnailUri,
      width: optimized.width,
      height: optimized.height,
      sizeBytes: saved.sizeBytes,
      lastAccessed: Date.now(),
    };
    await saveManifest(manifest);
    await cleanupIfNeeded(manifest);

    return {
      cacheKey,
      uri: saved.uri,
      width: optimized.width,
      height: optimized.height,
      sizeBytes: saved.sizeBytes,
      thumbnailUri,
    };
  },

  async pickImages(
    options?: PickerCommon & { max?: number }
  ): Promise<CachedImage[]> {
    const ok = await permissionsService.ensureMediaPermissions();
    if (!ok) return [];

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: options?.allowsEditing ?? false,
      quality: 1,
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: options?.max ?? 10,
    } as any);
    if (result.canceled) return [];

    const assets = (result.assets || []).slice(0, options?.max ?? 10);
    const out: CachedImage[] = [];
    let manifest = await loadManifest();

    for (const a of assets) {
      const optimized = await optimizeImage(a.uri, options);
      const saved = await saveToCacheFolder(optimized.uri, "img");
      const cacheKey = buildCacheFileName("key");
      let thumbnailUri: string | undefined;
      if (options?.generateThumbnail ?? true) {
        const thumbTemp = await createThumbnail(
          optimized.uri,
          options?.thumbnailSize ?? DEFAULT_THUMBNAIL_SIZE
        );
        const thumbSaved = await saveToCacheFolder(thumbTemp, "thumb");
        thumbnailUri = thumbSaved.uri;
      }

      manifest[cacheKey] = {
        uri: saved.uri,
        thumbnailUri,
        width: optimized.width,
        height: optimized.height,
        sizeBytes: saved.sizeBytes,
        lastAccessed: Date.now(),
      };

      out.push({
        cacheKey,
        uri: saved.uri,
        width: optimized.width,
        height: optimized.height,
        sizeBytes: saved.sizeBytes,
        thumbnailUri,
      });
    }

    await saveManifest(manifest);
    await cleanupIfNeeded(manifest);
    return out;
  },

  async takePhoto(options?: PickerCommon): Promise<CachedImage | null> {
    const ok = await permissionsService.ensureCameraPermissions();
    if (!ok) return null;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: options?.allowsEditing ?? true,
      aspect: options?.aspect ?? [1, 1],
      quality: 1,
      mediaTypes: ["images"],
    });
    if (result.canceled) return null;
    const asset = result.assets?.[0];
    if (!asset) return null;

    const optimized = await optimizeImage(asset.uri, options);
    const saved = await saveToCacheFolder(optimized.uri, "img");

    const manifest = await loadManifest();
    const cacheKey = buildCacheFileName("key");
    let thumbnailUri: string | undefined;
    if (options?.generateThumbnail ?? true) {
      const thumbTemp = await createThumbnail(
        optimized.uri,
        options?.thumbnailSize ?? DEFAULT_THUMBNAIL_SIZE
      );
      const thumbSaved = await saveToCacheFolder(thumbTemp, "thumb");
      thumbnailUri = thumbSaved.uri;
    }

    manifest[cacheKey] = {
      uri: saved.uri,
      thumbnailUri,
      width: optimized.width,
      height: optimized.height,
      sizeBytes: saved.sizeBytes,
      lastAccessed: Date.now(),
    };
    await saveManifest(manifest);
    await cleanupIfNeeded(manifest);

    return {
      cacheKey,
      uri: saved.uri,
      width: optimized.width,
      height: optimized.height,
      sizeBytes: saved.sizeBytes,
      thumbnailUri,
    };
  },

  async getCachedImage(cacheKey: string): Promise<CachedImage | null> {
    const manifest = await loadManifest();
    const entry = manifest[cacheKey];
    if (!entry) return null;
    const info = await FileSystem.getInfoAsync(entry.uri);
    if (!info.exists) {
      delete manifest[cacheKey];
      await saveManifest(manifest);
      return null;
    }
    entry.lastAccessed = Date.now();
    await saveManifest(manifest);
    return {
      cacheKey,
      uri: entry.uri,
      width: entry.width,
      height: entry.height,
      sizeBytes: entry.sizeBytes,
      thumbnailUri: entry.thumbnailUri,
    };
  },

  async clearCache(): Promise<void> {
    const manifest = await loadManifest();
    for (const key of Object.keys(manifest)) {
      const e = manifest[key];
      try {
        if (e?.uri) await FileSystem.deleteAsync(e.uri, { idempotent: true });
        if (e?.thumbnailUri)
          await FileSystem.deleteAsync(e.thumbnailUri, { idempotent: true });
      } catch {}
      delete manifest[key];
    }
    await saveManifest(manifest);
  },

  async pickImageFromLibrary(options?: {
    allowsEditing?: boolean;
    aspect?: [number, number];
  }): Promise<{ uri: string; width: number; height: number } | null> {
    const picked = await this.pickImage(options);
    return picked
      ? { uri: picked.uri, width: picked.width, height: picked.height }
      : null;
  },

  async pickImagesFromLibrary(options?: {
    allowsEditing?: boolean;
    max?: number;
    compressQuality?: number;
    maxDimension?: number;
  }): Promise<string[]> {
    const picked = await this.pickImages(options);
    return picked.map((p) => p.uri);
  },
};
