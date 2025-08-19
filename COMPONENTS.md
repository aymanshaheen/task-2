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

### NetworkSnackbar

- **onPress**: () => void (optional) - Handler for tap events on the snackbar

```tsx
<NetworkSnackbar
  onPress={() => Alert.alert("Network Status", "Check your settings")}
/>
```

### OfflineIndicator

- **visible**: boolean (optional) - Force visibility regardless of network status
- **showConnectionQuality**: boolean (optional, default: false) - Show detailed connection info
- **onPress**: () => void (optional) - Handler for tap events

```tsx
<OfflineIndicator
  visible={isOffline}
  showConnectionQuality={true}
  onPress={() => handleNetworkInfo()}
/>
```

## Form Components

### FavoriteToggle

- **value**: boolean (required) - Current favorite state
- **onValueChange**: (value: boolean) => void (required) - Handler for value changes
- **disabled**: boolean (optional, default: false) - Disable the toggle

```tsx
<FavoriteToggle
  value={isFavorite}
  onValueChange={setIsFavorite}
  disabled={loading}
/>
```

### FormActions

- **onCancel**: () => void (required) - Handler for cancel button
- **onSave**: () => void (required) - Handler for save button
- **disabled**: boolean (optional, default: false) - Disable both buttons
- **saveText**: string (optional, default: "Save") - Text for save button
- **cancelText**: string (optional, default: "Cancel") - Text for cancel button

```tsx
<FormActions
  onCancel={() => navigation.goBack()}
  onSave={handleSave}
  disabled={loading}
  saveText="Update"
  cancelText="Discard"
/>
```

### FormField

- **label**: string (required) - Field label
- **value**: string (required) - Input value
- **onChangeText**: (text: string) => void (required) - Handler for text changes
- **placeholder**: string (required) - Input placeholder
- **error**: string (optional) - Error message to display
- **maxLength**: number (optional, default: 100) - Maximum input length
- **multiline**: boolean (optional, default: false) - Enable multiline input
- **disabled**: boolean (optional, default: false) - Disable the input
- **required**: boolean (optional, default: false) - Show required asterisk
- **showCharCount**: boolean (optional, default: false) - Show character counter
- **minHeight**: number (optional) - Minimum height for multiline inputs

```tsx
<FormField
  label="Title"
  value={title}
  onChangeText={setTitle}
  placeholder="Enter note title..."
  error={titleError}
  maxLength={100}
  required
  showCharCount
/>
```

### FormLoadingState

- **isLoadingNote**: boolean (optional, default: false) - Show loading for note data
- **isSubmitting**: boolean (optional, default: false) - Show loading for form submission
- **isEditMode**: boolean (optional, default: false) - Affects loading message text

```tsx
<FormLoadingState
  isLoadingNote={loading}
  isSubmitting={submitting}
  isEditMode={!!noteId}
/>
```

### NoteForm

- **title**: string (required) - Note title value
- **content**: string (required) - Note content value
- **isFavorite**: boolean (required) - Favorite status
- **onTitleChange**: (title: string) => void (required) - Title change handler
- **onContentChange**: (content: string) => void (required) - Content change handler
- **onFavoriteChange**: (isFavorite: boolean) => void (required) - Favorite change handler
- **onCancel**: () => void (required) - Cancel action handler
- **onSave**: () => void (required) - Save action handler
- **titleError**: string (optional) - Title validation error
- **contentError**: string (optional) - Content validation error
- **generalError**: string (optional) - General form error
- **disabled**: boolean (optional, default: false) - Disable entire form
- **isEditMode**: boolean (optional, default: false) - Edit mode flag

```tsx
<NoteForm
  title={title}
  content={content}
  isFavorite={isFavorite}
  onTitleChange={setTitle}
  onContentChange={setContent}
  onFavoriteChange={setIsFavorite}
  onCancel={() => navigation.goBack()}
  onSave={handleSave}
  titleError={errors.title}
  contentError={errors.content}
  disabled={loading}
  isEditMode={!!noteId}
/>
```

## Notes Screen Components

### NotesScreenActions

- **saving**: boolean (optional) - Show saving indicator
- **loading**: boolean (required) - Loading state
- **isOffline**: boolean (required) - Offline status
- **hasPendingOperations**: boolean (required) - Pending sync operations exist
- **syncStatus**: object (required) - Sync status with pendingOperations count

```tsx
<NotesScreenActions
  saving={saving}
  loading={loading}
  isOffline={isOffline}
  hasPendingOperations={hasPendingOperations}
  syncStatus={syncStatus}
/>
```

### NotesScreenContent

- **loading**: boolean (required) - Loading state
- **error**: NotesError | null (required) - Error state
- **notes**: Note[] (required) - Filtered/displayed notes
- **allNotes**: Note[] (required) - All notes for empty state detection
- **refreshing**: boolean (required) - Pull-to-refresh state
- **onRefresh**: () => void (required) - Refresh handler
- **onUpdate**: (noteId: string, updates: Partial<Note>) => Promise<void> (required) - Update note handler
- **onDelete**: (noteId: string) => Promise<void> (required) - Delete note handler
- **onTogglePin**: (noteId: string) => Promise<void> (required) - Toggle pin handler
- **onToggleFavorite**: (noteId: string) => Promise<void> (required) - Toggle favorite handler
- **tintColor**: string (required) - Theme tint color

```tsx
<NotesScreenContent
  loading={loading}
  error={error}
  notes={filteredNotes}
  allNotes={allNotes}
  refreshing={refreshing}
  onRefresh={handleRefresh}
  onUpdate={updateNote}
  onDelete={deleteNote}
  onTogglePin={togglePin}
  onToggleFavorite={toggleFavorite}
  tintColor={colors.primary}
/>
```

### NotesScreenHeader

- **query**: string (required) - Search query value
- **onChangeQuery**: (query: string) => void (required) - Search query change handler
- **showSortOptions**: boolean (required) - Whether sort options are visible
- **onToggleSortOptions**: () => void (required) - Toggle sort options visibility
- **sortKey**: "date" | "title" | "favorites" (required) - Current sort key
- **onChangeSortKey**: (key: "date" | "title" | "favorites") => void (required) - Sort key change handler
- **availableTags**: string[] (required) - All available tags
- **selectedTags**: string[] (required) - Currently selected tags
- **onChangeSelectedTags**: (tags: string[]) => void (required) - Selected tags change handler

```tsx
<NotesScreenHeader
  query={query}
  onChangeQuery={setQuery}
  showSortOptions={showSort}
  onToggleSortOptions={toggleSort}
  sortKey={sortKey}
  onChangeSortKey={setSortKey}
  availableTags={tags}
  selectedTags={selectedTags}
  onChangeSelectedTags={setSelectedTags}
/>
```
