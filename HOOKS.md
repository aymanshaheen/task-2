## Hooks

Brief API docs and examples for hooks in `src/hooks/`.

### useAsyncStorage

- **purpose**: Persist state to AsyncStorage with debounced writes
- **signature**: `useAsyncStorage<T>(key: string, initialValue: T)`
- **returns**: `{ value, setValue, clear, loading, saving, error }`

```ts
const { value, setValue, clear, loading, saving, error } =
  useAsyncStorage<number>("counter", 0);

setValue(value + 1);

clear();
```

### useAuth

- **purpose**: Manage authentication state with session persistence
- **provider**: Must wrap app with `AuthProvider`
- **returns**: `{ user, isAuthenticated, loading, login, signup, logout }`
- **types**:
  - **user**: `AuthUser | null` where `AuthUser = { id: string, email: string }`
  - **isAuthenticated**: boolean
  - **loading**: boolean
  - **login**: `(email: string, password: string) => Promise<void>`
  - **signup**: `(email: string, password: string) => Promise<void>`
  - **logout**: `() => Promise<void>`

```tsx
// App setup
import { AuthProvider } from "./src/hooks/useAuth";

export default function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}

// In components
import { useAuth } from "./src/hooks/useAuth";

function LoginScreen() {
  const { login, loading, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    try {
      await login("user@example.com", "password");
    } catch (error) {
      // Handle error
    }
  };

  if (isAuthenticated) {
    return <DashboardScreen />;
  }

  return (
    <View>
      <Button title="Login" onPress={handleLogin} disabled={loading} />
    </View>
  );
}
```

### useNotes

- **purpose**: CRUD for notes stored in AsyncStorage + helpers
- **returns**:

  - **notes**: `Note[]` (sorted pinned first, then by createdAt desc)
  - **createNote**: `(note: NewNote) => void` - create new note
  - **updateNote**: `(noteId: string, updates: Partial<Note>) => void`
  - **deleteNote**: `(noteId: string) => void`
  - **togglePin**: `(noteId: string) => void`
  - **toggleFavorite**: `(noteId: string) => void`
  - **tags**: `string[]` - all unique tags from all notes
  - **loading**: boolean
  - **saving**: boolean
  - **error**: Error | null

- **types**:
  - **Note**: `{ id, title, content(HTML), author?, tags[], pinned, favorite, createdAt, updatedAt }`
  - **NewNote**: `Pick<Note, "title" | "content" | "tags" | "author">`

```tsx
import { useNotes } from "./src/hooks/useNotes";

export function NotesScreen() {
  const {
    notes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleFavorite,
    tags,
    loading,
    saving,
  } = useNotes();

  const addNote = () =>
    createNote({
      title: "Hello",
      content: "<p>World</p>",
      tags: ["demo"],
      author: "John Doe",
    });

  const editNote = (id: string) => updateNote(id, { title: "Updated Title" });

  return (
    <View>
      {loading && <Text>Loading...</Text>}
      {saving && <Text>Saving...</Text>}
      <Button title="Add Note" onPress={addNote} />
    </View>
  );
}
```

### useSearch

- **purpose**: Query + tag filtering for a notes array
- **signature**: `useSearch(notes: Note[])`
- **returns**: `{ query, setQuery, filteredNotes, selectedTags, setSelectedTags }`
- **behavior**:
  - **query**: case-insensitive match against `title` or `content` (HTML stripped)
  - **tags**: note must include all `selectedTags` (AND operation)

```tsx
import { useNotes } from "./src/hooks/useNotes";
import { useSearch } from "./src/hooks/useSearch";

function SearchableNotesScreen() {
  const { notes } = useNotes();
  const { query, setQuery, filteredNotes, selectedTags, setSelectedTags } =
    useSearch(notes);

  return (
    <View>
      <TextInput
        placeholder="Search notes..."
        value={query}
        onChangeText={setQuery}
      />
      <TagSelector
        availableTags={allTags}
        selectedTags={selectedTags}
        onChangeSelected={setSelectedTags}
      />
      <NotesList notes={filteredNotes} />
    </View>
  );
}
```

### useTheme (ThemeProvider)

- **purpose**: App-wide light/dark theme with persistence
- **provider**: Must wrap app with `ThemeProvider`
- **returns**: `{ theme, toggleTheme, themeStyles }`
- **types**:
  - **theme**: `"light" | "dark"`
  - **toggleTheme**: `() => void`
  - **themeStyles**: `ThemeStyles` - computed styles including colors, background, text, card styles

```tsx
// App setup
import { ThemeProvider } from "./src/hooks/useTheme";

export default function App() {
  return (
    <ThemeProvider>
      <Main />
    </ThemeProvider>
  );
}

// In components
import { useTheme } from "./src/hooks/useTheme";

function ThemedComponent() {
  const { theme, toggleTheme, themeStyles } = useTheme();
  const c = themeStyles.colors;

  return (
    <View style={[{ flex: 1 }, themeStyles.background]}>
      <Text style={[{ fontSize: 18 }, themeStyles.text]}>
        Current theme: {theme}
      </Text>
      <Button title="Toggle Theme" onPress={toggleTheme} />
      <View style={[{ padding: 16 }, themeStyles.card]}>
        <Text style={{ color: c.muted }}>Card content</Text>
      </View>
    </View>
  );
}
```

### useNetworkStatus

- **purpose**: Monitor network connectivity and connection quality with throttled updates
- **signature**: `useNetworkStatus()`
- **returns**: `NetworkStatus & NetworkActions`
- **types**:
  - **NetworkStatus**: `{ isConnected, isInternetReachable, type, details, connectionQuality }`
  - **NetworkActions**: `{ refresh, checkReachability }`
  - **connectionQuality**: `"excellent" | "good" | "poor" | "offline"`

```tsx
import { useNetworkStatus } from "./src/hooks/useNetworkStatus";

function NetworkAwareComponent() {
  const {
    isConnected,
    isInternetReachable,
    connectionQuality,
    type,
    refresh,
    checkReachability,
  } = useNetworkStatus();

  const handleRefresh = async () => {
    await refresh();
  };

  const checkGoogle = async () => {
    const reachable = await checkReachability("https://www.google.com");
    console.log("Google reachable:", reachable);
  };

  return (
    <View>
      <Text>Connected: {isConnected ? "Yes" : "No"}</Text>
      <Text>Internet: {isInternetReachable ? "Yes" : "No"}</Text>
      <Text>Quality: {connectionQuality}</Text>
      <Text>Type: {type}</Text>
      <Button title="Refresh" onPress={handleRefresh} />
    </View>
  );
}
```

### useIsOnline / useIsOffline

- **purpose**: Simplified hooks for basic online/offline detection
- **signature**: `useIsOnline()` returns `boolean`, `useIsOffline()` returns `boolean`

```tsx
import { useIsOnline, useIsOffline } from "./src/hooks/useNetworkStatus";

function SimpleNetworkComponent() {
  const isOnline = useIsOnline();
  const isOffline = useIsOffline();

  return (
    <View>
      {isOffline && <Text>You are offline</Text>}
      {isOnline && <Text>You are online</Text>}
    </View>
  );
}
```

### useNetworkAware

- **purpose**: Enhanced network awareness with transition detection
- **signature**: `useNetworkAware()`
- **returns**: `NetworkStatus & { isOffline, wasOffline, justCameOnline, justWentOffline }`

```tsx
import { useNetworkAware } from "./src/hooks/useNetworkStatus";

function NetworkTransitionComponent() {
  const { isOffline, justCameOnline, justWentOffline, connectionQuality } =
    useNetworkAware();

  useEffect(() => {
    if (justCameOnline) {
      console.log("Network restored! Syncing data...");
    }
    if (justWentOffline) {
      console.log("Network lost! Entering offline mode...");
    }
  }, [justCameOnline, justWentOffline]);

  return (
    <View>
      {justCameOnline && <Text>🟢 Back online!</Text>}
      {justWentOffline && <Text>🔴 Gone offline!</Text>}
    </View>
  );
}
```

### useOfflineErrorHandler

- **purpose**: Handle different types of errors with offline awareness
- **signature**: `useOfflineErrorHandler()`
- **returns**: `{ handleError, handleAuthError, handleStorageError, getErrorMessage, isOffline }`

```tsx
import { useOfflineErrorHandler } from "./src/hooks/useOfflineErrorHandler";

function ErrorAwareComponent() {
  const { handleError, getErrorMessage, isOffline } = useOfflineErrorHandler();

  const performNetworkOperation = async () => {
    try {
      await someApiCall();
    } catch (error) {
      const isHandled = handleError(error, {
        title: "Operation Failed",
        retryAction: () => performNetworkOperation(),
      });

      if (!isHandled) {
        // Handle non-network errors
        console.log("Error:", getErrorMessage(error));
      }
    }
  };

  return (
    <Button
      title="Perform Operation"
      onPress={performNetworkOperation}
      disabled={isOffline}
    />
  );
}
```

### useOfflineIntegration

- **purpose**: Complete offline integration with sync management
- **signature**: `useOfflineIntegration()`
- **returns**: `{ isOnline, isOffline, connectionQuality, syncStatus, performSync, handleError, ... }`

```tsx
import { useOfflineIntegration } from "./src/hooks/useOfflineIntegration";

function OfflineIntegratedScreen() {
  const {
    isOnline,
    isOffline,
    syncStatus,
    hasPendingOperations,
    performSync,
    handleError,
  } = useOfflineIntegration();

  const handleManualSync = async () => {
    if (isOffline) {
      handleError({ type: "NETWORK_ERROR" });
      return;
    }

    try {
      await performSync();
    } catch (error) {
      handleError(error, { title: "Sync Failed" });
    }
  };

  return (
    <View>
      {isOffline && <Text>📵 Offline Mode</Text>}
      {hasPendingOperations && (
        <Text>Pending: {syncStatus.pendingOperations}</Text>
      )}
      <Button
        title="Sync Now"
        onPress={handleManualSync}
        disabled={isOffline}
      />
    </View>
  );
}
```

### useOfflineAware

- **purpose**: Lightweight offline awareness without sync features
- **signature**: `useOfflineAware()`
- **returns**: `{ isOnline, isOffline, connectionQuality, handleError, getErrorMessage }`

```tsx
import { useOfflineAware } from "./src/hooks/useOfflineIntegration";

function SimpleOfflineComponent() {
  const { isOffline, handleError } = useOfflineAware();

  const performAction = () => {
    if (isOffline) {
      handleError({ type: "OFFLINE_ERROR" });
      return;
    }
    // Perform online action
  };

  return (
    <Button
      title="Perform Action"
      onPress={performAction}
      disabled={isOffline}
    />
  );
}
```

### useNoteFormValidation

- **purpose**: Form validation for note creation/editing
- **signature**: `useNoteFormValidation()`
- **returns**: `{ errors, validateForm, clearError }`

```tsx
import { useNoteFormValidation } from "./src/hooks/useNoteFormValidation";

function NoteFormComponent() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { errors, validateForm, clearError } = useNoteFormValidation();

  const handleSave = () => {
    const isValid = validateForm({ title, content });
    if (isValid) {
      // Save the note
      console.log("Form is valid!");
    }
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    clearError("title");
  };

  return (
    <View>
      <TextInput
        value={title}
        onChangeText={handleTitleChange}
        placeholder="Note title"
      />
      {errors.title && <Text style={{ color: "red" }}>{errors.title}</Text>}

      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="Note content"
        multiline
      />
      {errors.content && <Text style={{ color: "red" }}>{errors.content}</Text>}

      <Button title="Save" onPress={handleSave} />
    </View>
  );
}
```
