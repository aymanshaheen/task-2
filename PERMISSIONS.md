## Permissions

Concise guide to runtime permissions used by the app and how to request them.

### Overview

- Camera and Photo Library: `expo-image-picker`
- Location (foreground): `expo-location`
- Push Notifications: `expo-notifications`

These are requested on-demand via the services below. Expo config (app.json) already contains iOS descriptions for camera, photo library, and location.

### Services and APIs

#### permissionsService

- `ensureMediaPermissions(): Promise<boolean>`
- `ensureCameraPermissions(): Promise<boolean>`
- `ensureLocationPermissions(): Promise<boolean>`

Usage:

```ts
import { permissionsService } from "./src/services/permissionsService";

const ok = await permissionsService.ensureCameraPermissions();
if (!ok) {
  // Show guidance to enable permissions in Settings
}
```

#### cameraService (uses permissionsService under the hood)

- `pickImage(options?)`
- `pickImages(options?)`
- `takePhoto(options?)`

Usage:

```ts
import { cameraService } from "./src/services/cameraService";

const image = await cameraService.pickImage({ generateThumbnail: true });
if (image) {
  console.log(image.uri);
}
```

#### locationService (requires foreground location permission)

- `getCurrentLocation()`
- `reverseGeocode(lat, lon)`
- `getCurrentLocationWithAddress()`

Usage:

```ts
import { permissionsService } from "./src/services/permissionsService";
import { locationService } from "./src/services/locationService";

if (await permissionsService.ensureLocationPermissions()) {
  const loc = await locationService.getCurrentLocationWithAddress();
}
```

#### Notifications (via useNotificationCenter)

- Requests notification permission when notifications are enabled by the user.
- Registers an Expo push token and listens for incoming notifications.

Usage:

```tsx
import {
  NotificationCenterProvider,
  useNotificationCenter,
} from "./src/hooks/useNotificationCenter";

// In app root
<NotificationCenterProvider>{children}</NotificationCenterProvider>;

// In a component
const { registerIfEnabled, unreadCount } = useNotificationCenter();
await registerIfEnabled();
```

### Platform Configuration

#### iOS (app.json → ios.infoPlist)

- `NSCameraUsageDescription`: "We use your camera so you can set a profile photo."
- `NSPhotoLibraryUsageDescription`: "We access your photo library so you can choose a profile image."
- `NSLocationWhenInUseUsageDescription`: "We use your location to personalize your experience."
- `UIBackgroundModes`: `["remote-notification"]` for background push handling.

Note: Notifications require user consent at runtime; no Info.plist string is strictly required for that, but you should clearly inform the user in-app.

#### Android (managed by Expo)

- Camera, media, and location permissions are auto-configured by Expo modules.
- Android 13+ requires runtime consent for notifications; `useNotificationCenter` handles requesting it via `expo-notifications`.

### UX Guidelines

- Request permissions contextually (right before the action).
- If denied, show a brief explanation and a path to Settings.
- Avoid repeated prompts after a hard denial; provide a manual retry entry point.

### Troubleshooting

- iOS: If permissions are stuck, delete the app from the device/simulator and reinstall.
- Android: Ensure the device/AVD is on Android 13+ for notification prompts.
- Simulator: Camera/Photos may be limited; test on a real device for full flows.
