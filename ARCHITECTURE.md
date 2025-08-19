## Architecture & Decisions

High-level overview of structure, data flow, and trade‑offs.

### Tech Stack

- Expo (React Native 0.79.5) + TypeScript + React 19.0.0
- Navigation via React Navigation v7 (Stack, Drawer, Tab navigators)
- State via React hooks with Context providers; persistence via AsyncStorage
- Rich text editing with react-native-pell-rich-editor (HTML storage)
- Gesture handling with react-native-gesture-handler and reanimated
- Network status monitoring via @react-native-community/netinfo
- Offline-first architecture with automatic sync and conflict resolution
- Semantic tokens and theme system with dark mode support

### Structure

- `src/App.tsx`: App composition with ThemeProvider and AuthProvider wrappers
- `src/navigation/`: Multi-level navigation structure (App → Auth/Drawer → Tab)
- `src/screens/`: Organized screens by domain (auth, notes, settings)
- `src/components/`: Specialized UI components (35+ components organized by domain)
- `src/hooks/`: Domain logic and state hooks (auth, storage, notes, search, theme, network, offline)
- `src/services/`: Business logic layer (auth, notes, storage, sync, offline queue)
- `src/models/`: TypeScript type definitions organized by domain
- `src/enums/`: Enumerated constants and status types
- `src/styles/`: Comprehensive theming system (colors, typography, spacing, global styles)
- `src/utils/`: Small utilities (date formatting, storage helpers)

### State Management

- **Context Providers**: `ThemeProvider` and `AuthProvider` manage global application state via React Context.
- **Local-first**: Hooks encapsulate domain logic instead of global stores. Simpler mental model and easier testability for this scope.
- **Persistence**: `useAsyncStorage` provides debounced writes to avoid excessive I/O on rapid updates while keeping UI responsive (`loading`, `saving` flags provided).
- **Authentication**: `useAuth` manages user sessions, login/signup flow, and authentication state with AsyncStorage persistence.
- **Notes domain**: `useNotes` composes on top of storage, exposing a comprehensive CRUD API and derived data (`tags`, sorted notes with pinning support).
- **Search**: `useSearch` is a pure derived-state hook from an input `notes` array. Keeps filtering logic isolated and easily swappable.

### Offline-First Architecture

- **Network Monitoring**: `useNetworkStatus` provides real-time network state with connection quality detection and throttled updates to prevent performance issues.
- **Offline Queue**: Operations are queued when offline and automatically sync when connectivity is restored via `offlineQueueService`.
- **Sync Management**: `syncManager` handles bidirectional sync with conflict resolution, retry logic, and progress tracking.
- **Error Handling**: `useOfflineErrorHandler` provides context-aware error messages and retry mechanisms based on network status.
- **Offline Integration**: `useOfflineIntegration` combines network awareness, sync management, and error handling into a unified interface.
- **Local-first**: All operations work offline first, with sync happening transparently in the background.

### Services Layer

- **authService**: Handles authentication operations and session management
- **notesService**: CRUD operations for notes with offline support and caching
- **storageService**: Enhanced AsyncStorage wrapper with error handling and typed operations
- **syncManager**: Manages data synchronization between local and remote state
- **offlineQueueService**: Queues and processes operations when offline, with automatic retry logic

### Theming

- **ThemeProvider** stores `theme` in AsyncStorage for persistence and exposes `themeStyles` computed from semantic tokens (`styles/themes.ts`).
- **Semantic colors**: `styles/colors.ts` defines a palette and maps to roles (background, surface, text, muted, border, primary, danger, etc.). Components reference roles, not raw palette values. This reduces coupling and improves dark‑mode support.

### Navigation Architecture

- **Multi-level routing**: AppNavigator (Stack) → AuthNavigator/DrawerNavigator → TabNavigator
- **Authentication-based flow**: Conditional navigation renders AuthNavigator for unauthenticated users, DrawerNavigator for authenticated users
- **Screen organization**: Screens organized by domain (auth/, notes/, settings/) for better maintainability
- **Theme integration**: Navigation components inherit theme colors and styling from the global theme system

### Type System Organization

- **models/**: Domain-specific TypeScript interfaces organized by feature (auth, notes, storage)
- **enums/**: Centralized constants and enumerated values for status codes, types, and configurations
- **Type safety**: Strong typing throughout with discriminated unions for error states and operation types
- **Domain boundaries**: Types are colocated with their respective domains to improve maintainability

### UI Components

- **Component organization**: 35+ components organized by domain (forms/, notes/) and common UI patterns
- **Form components**: Dedicated form components (`FormField`, `FormActions`, `NoteForm`) with validation integration
- **Network components**: `NetworkSnackbar` and `OfflineIndicator` for network status feedback
- **Screen composition**: Screen-specific components (`NotesScreenHeader`, `NotesScreenContent`) for better organization
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

- **Offline-aware errors**: `useOfflineErrorHandler` provides contextual error messages based on network status
- **Error categorization**: Different error types (NETWORK_ERROR, AUTHENTICATION_ERROR, VALIDATION_ERROR) with appropriate handling
- **Graceful degradation**: Operations continue offline with user feedback about sync status
- **Retry mechanisms**: Automatic retry for network operations with exponential backoff
- **Storage operations**: Capture errors into `error` state; UI surfaces an `ErrorBanner` when `message` exists
- **Import safety**: Tolerant sanitizer to avoid hard crashes on malformed JSON
- **Network transition handling**: Special handling for online/offline transitions with user notifications

### Trade‑offs & Rationale

- **Context + hooks over global store**: For a medium-complexity app, React Context providers combined with custom hooks provide the right balance. Global stores (Redux/Zustand) would be overkill, but can be introduced later since domain boundaries are already modular.
- **React Navigation v7**: Mature navigation solution with excellent TypeScript support, theme integration, and comprehensive screen management (stack, drawer, tabs).
- **Mock authentication**: Simple in-memory auth system for demo purposes. Any email/password combination is accepted. Ready to be replaced with real API integration.
- **Offline-first approach**: Prioritizes user experience by ensuring app functionality even without network connectivity. Added complexity is justified by improved reliability and user satisfaction.
- **Services layer**: Introduces separation between UI logic and business logic, making the codebase more maintainable and testable at the cost of additional abstraction.
- **@react-native-community/netinfo**: Reliable network monitoring with quality detection. Throttled updates prevent performance issues while maintaining responsiveness.
- **AsyncStorage JSON**: Still adequate for current dataset size with enhanced error handling; faster to build. Migration path to SQLite/WatermelonDB is preserved through service abstraction.
- **Rich text via `react-native-pell-rich-editor`**: Provides solid WYSIWYG editing with minimal integration complexity. HTML storage is pragmatic; content is stripped to plain text where needed for counts/preview.
- **Semantic tokens**: Extra indirection vs direct colors, but greatly simplifies dark mode support and future theming extensibility.
- **Type organization**: Centralized models and enums improve maintainability and reduce circular dependencies at the cost of additional file structure complexity.

### Extensibility

- **Offline capabilities**: Extend offline functionality by adding new operation types to the offline queue service and implementing corresponding sync handlers.
- **Services layer**: Add new business logic services by following the established pattern in `src/services/` with typed interfaces and error handling.
- **Network handling**: Extend network monitoring with custom network quality algorithms or additional connection types.
- **Error handling**: Add new error types by extending the error handler with domain-specific error categories and recovery strategies.
- **Form validation**: Create new validation rules by extending `useNoteFormValidation` pattern for other form types.
- **Type system**: Add new domains by creating corresponding files in `src/models/` and `src/enums/` directories.
- **Component organization**: Extend component organization by creating new domain-specific directories under `src/components/`.
- **New data fields**: Add new fields to `Note` or `AuthUser` by extending the types in `src/models/` and updating the relevant services.
- **Storage layer**: Swap persistence by reimplementing services without affecting the UI or domain logic.
- **Authentication backend**: Replace mock auth in `authService` with real API calls; the hook interfaces remain unchanged.
- **Sync strategies**: Implement different sync strategies (real-time, manual, scheduled) by extending the sync manager.
- **New screens**: Add new screens by extending the navigation param lists and registering them in the appropriate navigator.
- **Theme system**: Extend the semantic color palette or add new themes by updating `styles/colors.ts` and `styles/themes.ts`.
- **Component library**: All components are designed for reuse and can be easily extracted into a shared design system.
