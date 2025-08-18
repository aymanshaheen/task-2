## Component Props

Concise reference for UI components in `src/components/` with minimal usage examples.

### AuthTextInput

- **invalid**: boolean (optional)
- **errorText**: string (optional)
- **style**: StyleProp<TextStyle> (optional)
- Plus all standard TextInput props

```tsx
<AuthTextInput
  placeholder="Email"
  value={email}
  onChangeText={setEmail}
  invalid={!!emailError}
  errorText={emailError}
/>
```

### AuthTitle

- **children**: React.ReactNode (required)

```tsx
<AuthTitle>Welcome Back</AuthTitle>
```

### BottomTabs

- **activeTab**: "home" | "favorites" (required)
- **onChange**: (tab: "home" | "favorites") => void (required)

```tsx
<BottomTabs activeTab={activeTab} onChange={setActiveTab} />
```

### Card

- **children**: React.ReactNode (required)
- **style**: any (optional)

```tsx
<Card style={{ margin: 16 }}>
  <Text>Card content</Text>
</Card>
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

### ErrorText

- **message**: string (required)

```tsx
<ErrorText message="Invalid email address" />
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

### KeyValueRow

- **label**: string (required)
- **value**: string (required)

```tsx
<KeyValueRow label="Total Notes" value="25" />
```

### LoadingState

- **message**: string (optional, default: "Loading…")

```tsx
<LoadingState message="Loading notes..." />
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

### NoteDetailsCard

- **note**: object (required) with properties:
  - **title**: string
  - **content**: string (HTML)
  - **author**: string (optional)
  - **tags**: string[]
  - **createdAt**: number
  - **updatedAt**: number

```tsx
<NoteDetailsCard note={selectedNote} />
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

### SavingToast

- **visible**: boolean (required)

```tsx
<SavingToast visible={saving} />
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

### SectionTitle

- **children**: React.ReactNode (required)

```tsx
<SectionTitle>Settings</SectionTitle>
```

### SettingsToggleCard

- **title**: string (required)
- **subtitle**: string (required)
- **value**: boolean (required)
- **onValueChange**: (value: boolean) => void (required)

```tsx
<SettingsToggleCard
  title="Dark Mode"
  subtitle="Switch between light and dark themes"
  value={theme === "dark"}
  onValueChange={toggleTheme}
/>
```

### SortBar

- **sortKey**: "date" | "title" | "favorites" (required)
- **onChangeSortKey**: (key: "date" | "title" | "favorites") => void (required)

```tsx
<SortBar sortKey={sortKey} onChangeSortKey={setSortKey} />
```

### SwipeActions

Note: Check actual implementation for SwipeActions component props (component exists but needs props documentation)

### TagFilterChips

- **tags**: string[] (required)
- **activeTag**: string | null (required)
- **onToggle**: (tag: string) => void (required)

```tsx
<TagFilterChips
  tags={availableTags}
  activeTag={selectedTag}
  onToggle={setSelectedTag}
/>
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
