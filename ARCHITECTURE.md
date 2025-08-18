## Architecture & Decisions

High-level overview of structure, data flow, and trade‑offs.

### Tech Stack

- Expo (React Native 0.79.5) + TypeScript + React 19.0.0
- Navigation via React Navigation v7 (Stack, Drawer, Tab navigators)
- State via React hooks with Context providers; persistence via AsyncStorage
- Rich text editing with react-native-pell-rich-editor (HTML storage)
- Gesture handling with react-native-gesture-handler and reanimated
- Semantic tokens and theme system with dark mode support

### Structure

- `src/App.tsx`: App composition with ThemeProvider and AuthProvider wrappers
- `src/navigation/`: Multi-level navigation structure (App → Auth/Drawer → Tab)
- `src/screens/`: Organized screens by domain (auth, notes, settings)
- `src/components/`: Specialized UI components (25+ components for different use cases)
- `src/hooks/`: Domain logic and state hooks (auth, storage, notes, search, theme)
- `src/styles/`: Comprehensive theming system (colors, typography, spacing, global styles)
- `src/utils/`: Small utilities (date formatting, storage helpers)

### State Management

- **Context Providers**: `ThemeProvider` and `AuthProvider` manage global application state via React Context.
- **Local-first**: Hooks encapsulate domain logic instead of global stores. Simpler mental model and easier testability for this scope.
- **Persistence**: `useAsyncStorage` provides debounced writes to avoid excessive I/O on rapid updates while keeping UI responsive (`loading`, `saving` flags provided).
- **Authentication**: `useAuth` manages user sessions, login/signup flow, and authentication state with AsyncStorage persistence.
- **Notes domain**: `useNotes` composes on top of storage, exposing a comprehensive CRUD API and derived data (`tags`, sorted notes with pinning support).
- **Search**: `useSearch` is a pure derived-state hook from an input `notes` array. Keeps filtering logic isolated and easily swappable.

### Theming

- **ThemeProvider** stores `theme` in AsyncStorage for persistence and exposes `themeStyles` computed from semantic tokens (`styles/themes.ts`).
- **Semantic colors**: `styles/colors.ts` defines a palette and maps to roles (background, surface, text, muted, border, primary, danger, etc.). Components reference roles, not raw palette values. This reduces coupling and improves dark‑mode support.

### Navigation Architecture

- **Multi-level routing**: AppNavigator (Stack) → AuthNavigator/DrawerNavigator → TabNavigator
- **Authentication-based flow**: Conditional navigation renders AuthNavigator for unauthenticated users, DrawerNavigator for authenticated users
- **Screen organization**: Screens organized by domain (auth/, notes/, settings/) for better maintainability
- **Theme integration**: Navigation components inherit theme colors and styling from the global theme system

### UI Components

- **Specialized components**: 25+ components covering authentication, notes management, settings, and common UI patterns
- **Domain-specific**: Components like `AuthTextInput`, `NoteEditor`, `SettingsToggleCard` are tailored for specific use cases
- **Dumb by default**: Components accept data + callbacks; they avoid owning domain logic. This keeps rendering predictable and facilitates reuse.
- **Rich text editing**: `NoteEditor` uses react-native-pell-rich-editor for HTML content creation with formatting toolbar
- **Performance**: Heavily used items (`NotesList`, `NoteCard`, toolbars) are `memo`ized and leverage `FlatList` with reasonable windowing defaults.
- **Accessibility**: Key actions have `accessibilityLabel`s where applicable.

### Data Model

- **User**: `{ id, email }` - Simple authentication model
- **AuthSession**: `{ user: AuthUser | null }` - Session state persisted to AsyncStorage
- **Note**: `{ id, title, content(HTML), author?, tags[], pinned, favorite, createdAt, updatedAt }`
- IDs are generated locally using `Math.random().toString(36).slice(2)` for both users and notes
- Notes ordering: pinned notes first, then by creation time (newest first)

### Error Handling

- Storage operations capture errors into `error` state; UI surfaces an `ErrorBanner` when `message` exists.
- Import uses a tolerant sanitizer to avoid hard crashes on malformed JSON.

### Trade‑offs & Rationale

- **Context + hooks over global store**: For a medium-complexity app, React Context providers combined with custom hooks provide the right balance. Global stores (Redux/Zustand) would be overkill, but can be introduced later since domain boundaries are already modular.
- **React Navigation v7**: Mature navigation solution with excellent TypeScript support, theme integration, and comprehensive screen management (stack, drawer, tabs).
- **Mock authentication**: Simple in-memory auth system for demo purposes. Any email/password combination is accepted. Ready to be replaced with real API integration.
- **AsyncStorage JSON** over DB: Still adequate for current dataset size; faster to build. If requirements grow (sync, multi-user), migrate to SQLite/WatermelonDB or a backend—the domain API (`useNotes`, `useAuth`) isolates persistence details.
- **Rich text via `react-native-pell-rich-editor`**: Provides solid WYSIWYG editing with minimal integration complexity. HTML storage is pragmatic; content is stripped to plain text where needed for counts/preview.
- **Semantic tokens**: Extra indirection vs direct colors, but greatly simplifies dark mode support and future theming extensibility.

### Extensibility

- **New data fields**: Add new fields to `Note` or `AuthUser` by extending the types and updating the relevant hooks.
- **Storage layer**: Swap persistence by reimplementing `useAsyncStorage` (or creating `useStorage`) without affecting the UI or domain logic.
- **Authentication backend**: Replace mock auth in `useAuth` with real API calls; the context interface remains unchanged.
- **New screens**: Add new screens by extending the navigation param lists and registering them in the appropriate navigator.
- **Theme system**: Extend the semantic color palette or add new themes by updating `styles/colors.ts` and `styles/themes.ts`.
- **Component library**: All components are designed for reuse and can be easily extracted into a shared design system.
