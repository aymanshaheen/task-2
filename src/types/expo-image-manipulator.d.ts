declare module "expo-image-manipulator" {
  export type SaveFormat = "jpeg" | "png" | "webp";
  export const SaveFormat: {
    JPEG: SaveFormat;
    PNG: SaveFormat;
    WEBP: SaveFormat;
  };

  export type Action = { resize?: { width?: number; height?: number } };
  export type Options = { compress?: number; format?: SaveFormat };
  export function manipulateAsync(
    uri: string,
    actions: Action[],
    options?: Options
  ): Promise<{ uri: string; width?: number; height?: number; base64?: string }>;
}
