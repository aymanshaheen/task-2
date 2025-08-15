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

### useNotes

- **purpose**: CRUD for notes stored in AsyncStorage + helpers
- **returns**:
  - **notes**: `Note[]` (sorted pinned first, then by createdAt desc)
  - **createNote(note)**: create new note
  - **updateNote(id, updates)**, **deleteNote(id)**
  - **togglePin(id)**, **toggleFavorite(id)**
  - **exportJson()** → string, **exportText()** → string
  - **restoreFromJson(json)** → boolean
  - **tags**: `string[]`
  - **loading/saving/error**

```tsx
import { useNotes } from "./src/hooks/useNotes";

export function NotesScreen() {
  const { notes, createNote, updateNote, deleteNote, toggleFavorite, tags } =
    useNotes();

  const add = () =>
    createNote({
      title: "Hello",
      content: "<p>World</p>",
      tags: ["demo"],
      author: "",
    });

  return null;
}
```

### useSearch

- **purpose**: Query + tag filtering for a notes array
- **signature**: `useSearch(notes: Note[])`
- **returns**: `{ query, setQuery, filteredNotes, selectedTags, setSelectedTags }`
- **behavior**:
  - query: case-insensitive match against `title` or `content`
  - tags: note must include all `selectedTags` (AND)

```tsx
const { notes } = useNotes();
const { query, setQuery, filteredNotes, selectedTags, setSelectedTags } =
  useSearch(notes);
```

### ThemeProvider / useTheme

- **purpose**: App-wide light/dark theme with persistence
- **usage**: Wrap the app with `ThemeProvider`, read via `useTheme()`
- **useTheme returns**: `{ theme: "light" | "dark", toggleTheme, themeStyles }`

```tsx
// App root
import { ThemeProvider, useTheme } from "./src/hooks/useTheme";

export default function App() {
  return (
    <ThemeProvider>
      <Main />
    </ThemeProvider>
  );
}

function Main() {
  const { theme, toggleTheme, themeStyles } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: themeStyles.colors.background }}>
      <Button title={`Switch (${theme})`} onPress={toggleTheme} />
    </View>
  );
}
```
