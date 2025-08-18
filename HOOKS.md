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
