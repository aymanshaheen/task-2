## Component Props

Concise reference for UI components in `src/components/` with minimal usage examples.

### BottomTabs

- **activeTab**: "home" | "favorites" (required)
- **onChange**: (tab: "home" | "favorites") => void (required)

```tsx
<BottomTabs activeTab={activeTab} onChange={setActiveTab} />
```

### ComposerSheet

- **title**: string (required)
- **children**: React.ReactNode (required)

```tsx
<ComposerSheet title="Add Message">
  {/* form elements */}
  {children}
  {/* ... */}
</ComposerSheet>
```

### EmptyState

- **message**: string (required)

```tsx
<EmptyState message="No results found" />
```

### ErrorBanner

- **message**: string | null | undefined (optional)

```tsx
<ErrorBanner message={error?.message} />
```

### ExportToolbar

- **getJson**: () => string (required)
- **getText**: () => string (required)
- **onImport**: () => void (required)

```tsx
<ExportToolbar
  getJson={exportJson}
  getText={exportText}
  onImport={handleImport}
/>
```

### FloatingActionButton

- **onPress**: () => void (required)
- **accessibilityLabel**: string (optional, default: "Add")

```tsx
<FloatingActionButton
  accessibilityLabel="Add note"
  onPress={() => setOpen(true)}
/>
```

### HeaderBar

- **query**: string (required)
- **onChangeQuery**: (text: string) => void (required)
- **onPressFilter**: () => void (required)

```tsx
<HeaderBar
  query={query}
  onChangeQuery={setQuery}
  onPressFilter={() => setShowSort((v) => !v)}
/>
```

### NoteCard

- **note**: Note (required)
- **onUpdate**: (noteId: string, updates: Partial<Note>) => void (required)
- **onDelete**: (noteId: string) => void (required)
- **onTogglePin**: (noteId: string) => void (required)
- **onToggleFavorite**: (noteId: string) => void (required)

Note shape:

```ts
type Note = {
  id: string;
  title: string;
  content: string; // HTML
  author?: string;
  tags: string[];
  pinned: boolean;
  favorite: boolean;
  updatedAt: number;
  createdAt: number;
};
```

```tsx
<NoteCard
  note={note}
  onUpdate={updateNote}
  onDelete={deleteNote}
  onTogglePin={togglePin}
  onToggleFavorite={toggleFavorite}
/>
```

### NoteEditor

- **onSave**: (note: { title: string; content: string; tags: string[]; author?: string }) => void (required)
- **visible**: boolean (optional, default: true)
- **onClose**: () => void (optional)
- **showAuthor**: boolean (optional, default: true)
- **showTags**: boolean (optional, default: true)

```tsx
<NoteEditor
  visible
  showTags
  showAuthor={false}
  onSave={(payload) => createNote(payload)}
  onClose={() => setOpen(false)}
/>
```

### NotesList

- **notes**: Note[] (required)
- **onUpdate**: (noteId: string, updates: Partial<Note>) => void (required)
- **onDelete**: (noteId: string) => void (required)
- **onTogglePin**: (noteId: string) => void (required)
- **onToggleFavorite**: (noteId: string) => void (required)

```tsx
<NotesList
  notes={notes}
  onUpdate={updateNote}
  onDelete={deleteNote}
  onTogglePin={togglePin}
  onToggleFavorite={toggleFavorite}
/>
```

### SearchBar

- **value**: string (required)
- **onChangeText**: (text: string) => void (required)
- **onPressFilter**: () => void (optional)

```tsx
<SearchBar
  value={query}
  onChangeText={setQuery}
  onPressFilter={() => setShowSort(true)}
/>
```

### SortBar

- **sortKey**: "date" | "title" | "favorites" (required)
- **onChangeSortKey**: (key: "date" | "title" | "favorites") => void (required)

```tsx
<SortBar sortKey={sortKey} onChangeSortKey={setSortKey} />
```

### TagSelector

- **availableTags**: string[] (required)
- **selectedTags**: string[] (required)
- **onChangeSelected**: (tags: string[]) => void (required)

```tsx
<TagSelector
  availableTags={tags}
  selectedTags={selectedTags}
  onChangeSelected={setSelectedTags}
/>
```

### ThemeToggle

- (no props)

```tsx
<ThemeToggle />
```
