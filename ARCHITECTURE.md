## Architecture & Decisions

High-level overview of structure, data flow, and trade‑offs.

### Tech Stack

- Expo (React Native) + TypeScript
- State via React hooks; persistence via AsyncStorage
- Minimal UI system with semantic tokens and themes

### Structure

- `src/App.tsx`: App composition and screen orchestration
- `src/components/`: Pure/presentational components with small internal states
- `src/hooks/`: App logic and state hooks (storage, notes, search, theme)
- `src/styles/`: Theme, typography, spacing, global styles, and semantic colors
- `src/utils/`: Small utilities (date formatting, storage helpers)

### State Management

- **Local-first**: Hooks encapsulate logic instead of global stores. Simpler mental model and easier testability for this scope.
- **Persistence**: `useAsyncStorage` provides debounced writes to avoid excessive I/O on rapid updates while keeping UI responsive (`loading`, `saving` flags provided).
- **Notes domain**: `useNotes` composes on top of storage, exposing a small CRUD API and derived data (`tags`, sorted notes, export/import helpers).
- **Search**: `useSearch` is a pure derived-state hook from an input `notes` array. Keeps filtering logic isolated and easily swappable.

### Theming

- **ThemeProvider** stores `theme` in AsyncStorage for persistence and exposes `themeStyles` computed from semantic tokens (`styles/themes.ts`).
- **Semantic colors**: `styles/colors.ts` defines a palette and maps to roles (background, surface, text, muted, border, primary, danger, etc.). Components reference roles, not raw palette values. This reduces coupling and improves dark‑mode support.

### UI Components

- **Dumb by default**: Components accept data + callbacks; they avoid owning domain logic. This keeps rendering predictable and facilitates reuse.
- **Performance**: Heavily used items (`NotesList`, `NoteCard`, toolbars) are `memo`ized and leverage `FlatList` with reasonable windowing defaults.
- **Accessibility**: Key actions have `accessibilityLabel`s where applicable.

### Data Model

- `Note`: `{ id, title, content(HTML), author?, tags[], pinned, favorite, createdAt, updatedAt }`
- IDs are generated locally; ordering is stable with pinned first and by time afterwards.

### Error Handling

- Storage operations capture errors into `error` state; UI surfaces an `ErrorBanner` when `message` exists.
- Import uses a tolerant sanitizer to avoid hard crashes on malformed JSON.

### Trade‑offs & Rationale

- **Hooks over global store**: For a single‑screen app, hooks keep complexity low. A global store (Redux/Zustand) would be overkill now, but can be introduced without churn since boundaries are already modular.
- **AsyncStorage JSON** over DB: Adequate for small datasets; faster to build. If requirements grow (sync, multi‑user), migrate to SQLite/WatermelonDB or a backend—the domain API (`useNotes`) isolates persistence details.
- **Rich text via `react-native-pell-rich-editor`**: Provides solid editing with minimal integration. HTML storage is pragmatic; content is stripped to text where needed for counts/preview.
- **Semantic tokens**: Extra indirection vs direct colors, but greatly simplifies dark mode and future theming.

### Extensibility

- Add new fields to `Note` by extending the type and `restoreFromJson` sanitizer.
- Swap persistence by reimplementing `useAsyncStorage` (or creating `useStorage`) without affecting UI.
- Introduce navigation/screens by moving current `AppInner` UI into distinct screens; existing components remain reusable.
