## Task 2 – Notes App (Expo + React Native)

Small notes app built with Expo, React Native, and TypeScript.

## Prerequisites

- **Node.js**: v18 or newer
- **npm**: v9+ (or use yarn/pnpm if you prefer)
- Optional (for device simulators):
  - **Xcode** (for iOS)
  - **Android Studio** (for Android)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the Expo development server:

```bash
npm run start
```

3. Run on a target:

```bash
# iOS simulator (macOS only)
npm run ios

# Android emulator (or connected device)
npm run android

# Web
npm run web
```

If you use the Expo app on a physical device, scan the QR code from the terminal/Expo DevTools after `npm run start`.

## Scripts

- `npm run start`: Start the Expo dev server
- `npm run ios`: Open iOS simulator and run the app
- `npm run android`: Open Android emulator and run the app
- `npm run web`: Run the web version

## Screenshots

### Authentication

<table>
  <tr>
    <td><img src="screenshots/login-screen.png" alt="Login Screen" width="260" /></td>
    <td><img src="screenshots/signup-screen.png" alt="Signup Screen" width="260" /></td>
    <td><img src="screenshots/profile-screen.png" alt="Profile Screen" width="260" /></td>
  </tr>
</table>

### Notes Management

<table>
  <tr>
    <td><img src="screenshots/home-screen.png" alt="Home Screen" width="260" /></td>
    <td><img src="screenshots/notes-list-screen.png" alt="Notes List Screen" width="260" /></td>
    <td><img src="screenshots/add-note-screen.png" alt="Add Note Screen" width="260" /></td>
  </tr>
  <tr>
    <td><img src="screenshots/edit-note-screen.png" alt="Edit Note Screen" width="260" /></td>
    <td><img src="screenshots/note-details-screen.png" alt="Note Details Screen" width="260" /></td>
    <td><img src="screenshots/favorites-screen.png" alt="Favorites Screen" width="260" /></td>
  </tr>
</table>

### Search & Organization

<table>
  <tr>
    <td><img src="screenshots/search-screen.png" alt="Search Screen" width="260" /></td>
    <td><img src="screenshots/tags-screen.png" alt="Tags Screen" width="260" /></td>
    <td><img src="screenshots/stats-screen.png" alt="Stats Screen" width="260" /></td>
  </tr>
</table>

### Features & Settings

<table>
  <tr>
    <td><img src="screenshots/settings-screen.png" alt="Settings Screen" width="260" /></td>
    <td><img src="screenshots/dark-theme-screen.png" alt="Dark Theme Screen" width="260" /></td>
    <td><img src="screenshots/offline-mode-screen.png" alt="Offline Mode Screen" width="260" /></td>
  </tr>
</table>
