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

async function transcodeToJpegIfNeeded(
  uri: string,
  meta?: { mimeType?: string; fileName?: string },
  compress: number = 0.9
): Promise<string> {
  if (Platform.OS !== "ios") return uri;
  if (!isHdrOrHeicOrUndetectableOnIOS(uri, meta?.mimeType, meta?.fileName)) {
    return uri;
  }
  try {
    const ImageManipulator = await import("expo-image-manipulator");
    const out = await ImageManipulator.manipulateAsync(uri, [], {
      compress,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return out.uri || uri;
  } catch {
    return uri;
  }
}

function isHdrOrHeicOrUndetectableOnIOS(
  uri: string,
  mimeType?: string,
  fileName?: string
): boolean {
  const value = uri || "";
  const lower = value.toLowerCase();
  const hasKnownRasterExt = /\.(jpe?g|png|webp)$/.test(lower);
  const looksLikeHeic = lower.endsWith(".heic") || lower.endsWith(".heif");
  const looksLikeHdr = lower.includes("hdr");
  const isPHAsset = lower.startsWith("ph://");
  const mime = (mimeType || "").toLowerCase();
  const fileLower = (fileName || "").toLowerCase();
  const fileLooksHeic =
    fileLower.endsWith(".heic") || fileLower.endsWith(".heif");
  const mimeLooksHeic = mime.includes("heic") || mime.includes("heif");
  const mimeIsRaster =
    mime.includes("jpeg") || mime.includes("jpg") || mime.includes("png");

  if (Platform.OS === "ios") {
    if (
      looksLikeHeic ||
      looksLikeHdr ||
      isPHAsset ||
      fileLooksHeic ||
      mimeLooksHeic
    )
      return true;
    if (mimeType && !mimeIsRaster) return true;
    if (!hasKnownRasterExt && !mimeIsRaster) return true;
  }
  return looksLikeHeic || looksLikeHdr || fileLooksHeic || mimeLooksHeic;
}

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
  options?: OptimizerOptions,
  meta?: {
    width?: number;
    height?: number;
    mimeType?: string;
    fileName?: string;
  }
): Promise<{
  uri: string;
  width: number;
  height: number;
}> {
  if (isHdrOrHeicOrUndetectableOnIOS(uri, meta?.mimeType, meta?.fileName)) {
    return {
      uri,
      width: meta?.width ?? DEFAULT_MAX_DIMENSION,
      height: meta?.height ?? DEFAULT_MAX_DIMENSION,
    };
  }
  const maxDim = options?.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const compressQ = options?.compressQuality ?? DEFAULT_COMPRESS;

  let targetWidth = maxDim;
  let targetHeight = maxDim;
  const sourceWidth = meta?.width;
  const sourceHeight = meta?.height;
  if (sourceWidth && sourceHeight) {
    if (sourceWidth > sourceHeight && sourceWidth > maxDim) {
      targetWidth = maxDim;
      targetHeight = Math.round((sourceHeight / sourceWidth) * maxDim);
    } else if (sourceHeight >= sourceWidth && sourceHeight > maxDim) {
      targetHeight = maxDim;
      targetWidth = Math.round((sourceWidth / sourceHeight) * maxDim);
    } else {
      targetWidth = sourceWidth;
      targetHeight = sourceHeight;
    }
  } else if (Platform.OS === "ios") {
    return { uri, width: maxDim, height: maxDim };
  } else {
    const ImageManipulator = await import("expo-image-manipulator");
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
  }

  if (Platform.OS === "ios") {
    return { uri, width: targetWidth, height: targetHeight };
  }

  try {
    const ImageManipulator = await import("expo-image-manipulator");
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
  } catch (e) {
    return { uri, width: targetWidth, height: targetHeight };
  }
}

async function createThumbnail(
  uri: string,
  size: number,
  mimeType?: string,
  fileName?: string
): Promise<string> {
  if (isHdrOrHeicOrUndetectableOnIOS(uri, mimeType, fileName)) return uri;
  try {
    const ImageManipulator = await import("expo-image-manipulator");
    const out = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: size, height: size } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return out.uri;
  } catch (e) {
    return uri;
  }
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

    const ImagePicker = await import("expo-image-picker");
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing:
        Platform.OS === "ios" ? false : options?.allowsEditing ?? true,
      aspect: options?.aspect ?? [1, 1],
      quality: Platform.OS === "ios" ? 0.9 : 1,
      exif: false,
      mediaTypes: (ImagePicker as any).MediaType?.Images
        ? [(ImagePicker as any).MediaType.Images]
        : ["images"],
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
      allowsMultipleSelection: false,
    });
    if (result.canceled) return null;
    const asset = result.assets?.[0];
    if (!asset) return null;

    const maybeJpegUri = await transcodeToJpegIfNeeded(asset.uri, {
      mimeType: (asset as any)?.mimeType,
      fileName: (asset as any)?.fileName,
    });
    const optimized = await optimizeImage(maybeJpegUri, options, {
      width: (asset as any)?.width,
      height: (asset as any)?.height,
      mimeType: (asset as any)?.mimeType,
      fileName: (asset as any)?.fileName,
    });
    const saved = await saveToCacheFolder(optimized.uri, "img");

    const manifest = await loadManifest();
    const cacheKey = buildCacheFileName("key");
    let thumbnailUri: string | undefined;
    if (options?.generateThumbnail ?? true) {
      const thumbTemp = await createThumbnail(
        optimized.uri,
        options?.thumbnailSize ?? DEFAULT_THUMBNAIL_SIZE,
        (asset as any)?.mimeType,
        (asset as any)?.fileName
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

    const ImagePicker = await import("expo-image-picker");
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing:
        Platform.OS === "ios" ? false : options?.allowsEditing ?? false,
      quality: Platform.OS === "ios" ? 0.9 : 1,
      exif: false,
      mediaTypes: (ImagePicker as any).MediaType?.Images
        ? [(ImagePicker as any).MediaType.Images]
        : ["images"],
      allowsMultipleSelection: true,
      selectionLimit: options?.max ?? 10,
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    } as any);
    if (result.canceled) return [];

    const assets = (result.assets || []).slice(0, options?.max ?? 10);
    const out: CachedImage[] = [];
    const manifest = await loadManifest();

    for (const a of assets) {
      const maybeJpegUri = await transcodeToJpegIfNeeded(a.uri, {
        mimeType: (a as any)?.mimeType,
        fileName: (a as any)?.fileName,
      });
      const optimized = await optimizeImage(maybeJpegUri, options, {
        width: (a as any)?.width,
        height: (a as any)?.height,
        mimeType: (a as any)?.mimeType,
        fileName: (a as any)?.fileName,
      });
      const saved = await saveToCacheFolder(optimized.uri, "img");
      const cacheKey = buildCacheFileName("key");
      let thumbnailUri: string | undefined;
      if (options?.generateThumbnail ?? true) {
        const thumbTemp = await createThumbnail(
          optimized.uri,
          options?.thumbnailSize ?? DEFAULT_THUMBNAIL_SIZE,
          (a as any)?.mimeType,
          (a as any)?.fileName
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

    const ImagePicker = await import("expo-image-picker");
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing:
        Platform.OS === "ios" ? false : options?.allowsEditing ?? true,
      aspect: options?.aspect ?? [1, 1],
      quality: Platform.OS === "ios" ? 0.9 : 1,
      exif: false,
      mediaTypes: (ImagePicker as any).MediaType?.Images
        ? [(ImagePicker as any).MediaType.Images]
        : ["images"],
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    });
    if (result.canceled) return null;
    const asset = result.assets?.[0];
    if (!asset) return null;

    const maybeJpegUri = await transcodeToJpegIfNeeded(asset.uri, {
      mimeType: (asset as any)?.mimeType,
      fileName: (asset as any)?.fileName,
    });
    const optimized = await optimizeImage(maybeJpegUri, options, {
      width: (asset as any)?.width,
      height: (asset as any)?.height,
      mimeType: (asset as any)?.mimeType,
      fileName: (asset as any)?.fileName,
    });
    const saved = await saveToCacheFolder(optimized.uri, "img");

    const manifest = await loadManifest();
    const cacheKey = buildCacheFileName("key");
    let thumbnailUri: string | undefined;
    if (options?.generateThumbnail ?? true) {
      const thumbTemp = await createThumbnail(
        optimized.uri,
        options?.thumbnailSize ?? DEFAULT_THUMBNAIL_SIZE,
        (asset as any)?.mimeType,
        (asset as any)?.fileName
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
