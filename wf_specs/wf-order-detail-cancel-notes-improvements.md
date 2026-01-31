# Wireframe: Order Detail - Cancel Button & Notes Feature

**ADW ID:** order-detail-cancel-notes-improvements
**Created:** 2026-02-01
**Status:** Draft
**Priority:** High

---

## 📋 User Requirements

1. **Move Cancel Button**: Relocate cancel button away from close (X) icon to prevent accidental clicks
2. **Add Notes Feature**: Add order-level notes button with text input session

---

## 🎨 Version 1: Action Bar with Separated Cancel & Notes Modal

### **Layout Overview**
```
┌─────────────────────────────────────────────────────────────┐
│ Order Details                                            [X]│
│ Order #W1156251121946800                                    │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┬─────────┬──────────┬──────────────┐            │
│ │ Status  │ Channel │ Total    │              │            │
│ └─────────┴─────────┴──────────┴──────────────┘            │
├─────────────────────────────────────────────────────────────┤
│ [📝 Add Note]           [⚠️ Cancel Order]                   │ <- Action Bar
├─────────────────────────────────────────────────────────────┤
│ [Overview] [Items] [Payments] [Tracking] [Audit Trail]     │
│                                                             │
│ (Tab Content)                                               │
└─────────────────────────────────────────────────────────────┘
```

### **Key Features**

#### **1. Header Section**
- **Title**: "Order Details" with order number subtitle
- **Close Button**: Top-right corner (X icon only, ghost variant)
- **No Cancel Button**: Removed from header to prevent accidental clicks

#### **2. Action Bar** (NEW - Below Quick Info Cards)
```
┌─────────────────────────────────────────────────────────────┐
│ [📝 Add Note]           [⚠️ Cancel Order]                   │
└─────────────────────────────────────────────────────────────┘
```

**Left Side - Add Note Button:**
- **Icon**: `StickyNote` or `FileText`
- **Text**: "Add Note"
- **Variant**: `outline` (secondary action)
- **Size**: `sm`
- **Behavior**: Opens notes modal/dialog

**Right Side - Cancel Order Button:**
- **Icon**: `Ban` or `XCircle`
- **Text**: "Cancel Order"
- **Variant**: `destructive` (red/danger)
- **Size**: `sm`
- **Position**: Far right, separated from Add Note
- **States**:
  - Disabled when order can't be cancelled
  - Tooltip on hover explaining why disabled

**Spacing**: `justify-between` to maximize distance between buttons

#### **3. Notes Modal**
```
┌────────────────────────────────────────────────────────┐
│ Order Notes                                        [X] │
├────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │ Add your notes here...                             │ │
│ │                                                     │ │
│ │                                                     │ │
│ │                                                     │ │
│ │                                                     │ │
│ └────────────────────────────────────────────────────┘ │
│ 125/500 characters                                     │
│                                                        │
│                            [Cancel]  [Save Note]       │
└────────────────────────────────────────────────────────┘
```

**Modal Features:**
- **Title**: "Order Notes" or "Add Note for Order #XXX"
- **Textarea**:
  - Min height: 150px
  - Max length: 500-1000 characters
  - Placeholder: "Add your notes here..."
  - Auto-resize optional
- **Character Counter**: "245/500 characters"
- **Actions**:
  - Cancel button (closes modal without saving)
  - Save Note button (primary, saves and closes)
- **Auto-save**: Optional - save draft as user types
- **Note**: Created By and Created On metadata will display only on saved notes in the notes list

---

## 🎨 Version 2: Inline Notes Section Below Header

### **Layout Overview**
```
┌─────────────────────────────────────────────────────────────┐
│ Order Details                        [⚠️ Cancel]        [X]│
│ Order #W1156251121946800                                    │
├─────────────────────────────────────────────────────────────┤
│ 📝 Notes: [Click to add notes...]                          │ <- Inline
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┬─────────┬──────────┬──────────────┐            │
│ │ Status  │ Channel │ Total    │              │            │
│ └─────────┴─────────┴──────────┴──────────────┘            │
├─────────────────────────────────────────────────────────────┤
│ [Overview] [Items] [Payments] [Tracking] [Audit Trail]     │
└─────────────────────────────────────────────────────────────┘
```

### **Key Features**

#### **1. Header Section (Modified)**
- **Left**: Title and order number
- **Center**: Cancel Order button (moved away from X)
- **Right**: Close button (X icon)

**Button Layout:**
```
Order Details               [⚠️ Cancel Order]     [X]
```

**Spacing**: Gap between Cancel and Close to prevent mis-clicks

#### **2. Inline Notes Section**
```
┌─────────────────────────────────────────────────────────────┐
│ 📝 Notes: [Click to add notes or view existing notes...]   │
└─────────────────────────────────────────────────────────────┘
```

**States:**

**Empty State:**
```
📝 Notes: [Click to add notes...]
```

**With Content (Collapsed):**
```
📝 Notes: "This order requires special handling for..." [Edit]
```

**Expanded/Editing:**
```
┌─────────────────────────────────────────────────────────────┐
│ 📝 Order Notes                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ This order requires special handling for fragile items  │ │
│ │                                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│ 125/500 characters               [Cancel]  [Save]          │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- **Click anywhere**: Expands to editable textarea
- **Compact**: Only 1-2 lines when collapsed
- **Always visible**: Don't need to open modal
- **Quick access**: Edit/view without extra clicks

---

## 🎨 Version 3: Tab-Based Notes + Action Menu

### **Layout Overview**
```
┌─────────────────────────────────────────────────────────────┐
│ Order Details                           [⋮ Actions]     [X]│
│ Order #W1156251121946800                                    │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┬─────────┬──────────┬──────────────┐            │
│ │ Status  │ Channel │ Total    │              │            │
│ └─────────┴─────────┴──────────┴──────────────┘            │
├─────────────────────────────────────────────────────────────┤
│ [Overview] [Items] [Payments] [Notes] [Tracking] [Audit]   │ <- Notes Tab
│                                                             │
│ (Tab Content)                                               │
└─────────────────────────────────────────────────────────────┘
```

### **Key Features**

#### **1. Header with Actions Menu**
```
Order Details                  [⋮ Actions]  [X]
                                  ↓
                        ┌─────────────────┐
                        │ 📋 Export       │
                        │ 📝 Edit         │
                        │ ⚠️ Cancel Order │
                        │ 🗑️ Delete       │
                        └─────────────────┘
```

**Actions Dropdown Menu:**
- **Icon**: Three dots (⋮) or hamburger menu
- **Label**: "Actions"
- **Menu Items**:
  - Export PDF/CSV
  - Edit Order
  - **Cancel Order** (destructive, moved here)
  - Other actions
- **Benefits**:
  - Cancel is hidden in menu (harder to accidentally click)
  - Cleaner header
  - Scalable for more actions

#### **2. Notes as Dedicated Tab**
```
[Overview] [Items] [Payments] [Notes (2)] [Tracking] [Audit Trail]
                                    ↑
                            Badge shows note count
```

**Notes Tab Content:**
```
┌────────────────────────────────────────────────────────────────────────────────┐
│ Order Notes                                                                    │
├────────────────────────────────────────────┬───────────────────┬───────────────┤
│ NOTE                                       │ CREATED BY        │ CREATED ON    │
├────────────────────────────────────────────┼───────────────────┼───────────────┤
│ Customer requested gift wrapping           │ john.doe@         │2026-01-30T    │[X]
│ for all items                              │ central.co.th     │15:10:00       │
├────────────────────────────────────────────┼───────────────────┼───────────────┤
│ Delivery address verified with             │ jane.smith@       │2026-01-30T    │[X]
│ customer via phone                         │ central.co.th     │10:15:00       │
├────────────────────────────────────────────┴───────────────────┴───────────────┤
│ [+ Add New Note]                                                               │
│                                                                                │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ Add new note...                                                           │ │
│ │                                                                            │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│ 0/500 characters                                                              │
│                                                             [Cancel] [Add Note]│
└────────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- **Table Layout**: Clean 3-column display
- **Note Column**: Main note content (left-aligned, wraps text)
- **Created By Column**: User email who created the note
- **Created On Column**: ISO 8601 timestamp (YYYY-MM-DDTHH:mm:ss)
- **Delete Button**: X button on right to delete each note
- **Timeline view**: Notes sorted by timestamp (newest first)
- **Inline Add**: Add new note form at bottom of table
- **Badge indicator**: Tab shows count of notes
- **History**: All notes preserved with creation metadata
- **No Note Type**: Single note type (Order Note) for simplicity

---

## 📊 Comparison Matrix

| Feature | Version 1 | Version 2 | Version 3 |
|---------|-----------|-----------|-----------|
| **Cancel Button Location** | Action bar (below cards) | Header (center) | Actions menu |
| **Accidental Click Risk** | Low (separated) | Medium (gap added) | Very Low (hidden in menu) |
| **Notes Visibility** | Modal (hidden) | Inline (always visible) | Tab (dedicated space) |
| **User Clicks to Add Note** | 1 click (button) | 1 click (inline) | 2 clicks (tab + add) |
| **Notes History** | Single note only | Single note only | Full timeline |
| **Screen Space** | Minimal (modal) | Compact (1-2 lines) | Dedicated tab space |
| **Best For** | Simple notes, clear separation | Quick access, minimal UI | Complex notes, multiple entries |

---

## 💡 Recommendations

### **Choose Version 1 if:**
- ✅ Simple note-taking is sufficient
- ✅ Want clear visual separation of actions
- ✅ Prefer modal dialogs for focused input
- ✅ Minimal screen real estate impact

### **Choose Version 2 if:**
- ✅ Notes should be immediately visible
- ✅ Want fastest access to notes
- ✅ Prefer inline editing
- ✅ Single note per order is sufficient

### **Choose Version 3 if:**
- ✅ Need multiple notes with history
- ✅ Want audit trail for notes
- ✅ Prefer organized, dedicated space
- ✅ Cancel should be extra protected from accidental clicks

---

## 🎯 Implementation Details

### **Version 1 - Action Bar Implementation**

**File:** `src/components/order-detail-view.tsx`

**Changes Required:**
1. Remove Cancel button from header (line 332-342)
2. Add new Action Bar section after Quick Info Cards
3. Create Notes Modal component
4. Add state management for notes

**Code Structure:**
```tsx
// After Quick Info Cards (after line 425)
<div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border">
  {/* Left - Add Note */}
  <Button
    variant="outline"
    size="sm"
    onClick={() => setShowNotesDialog(true)}
    className="flex items-center gap-2"
  >
    <StickyNote className="h-4 w-4" />
    Add Note
  </Button>

  {/* Right - Cancel Order */}
  <Button
    variant="destructive"
    size="sm"
    onClick={() => setShowCancelDialog(true)}
    disabled={!canCancelOrder}
    className="flex items-center gap-2"
  >
    <Ban className="h-4 w-4" />
    Cancel Order
  </Button>
</div>

{/* Notes Modal */}
<Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
  <DialogContent className="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Order Notes</DialogTitle>
      <DialogDescription>Add a note for order #{order?.order_no}</DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
      {/* Note Content */}
      <div className="space-y-2">
        <Label htmlFor="noteContent">Note</Label>
        <Textarea
          id="noteContent"
          placeholder="Add your notes here..."
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          className="min-h-[150px]"
          maxLength={500}
        />
        <p className="text-sm text-muted-foreground">
          {orderNotes.length}/500 characters
        </p>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
        Cancel
      </Button>
      <Button onClick={handleSaveNote} disabled={!orderNotes.trim()}>
        Save Note
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### **Version 2 - Inline Notes Implementation**

**File:** `src/components/order-detail-view.tsx`

**Changes Required:**
1. Move Cancel button to header center position
2. Add inline notes section between header and Quick Info Cards
3. Add expand/collapse state

**Code Structure:**
```tsx
// Header - Modified (line 320-346)
<div className="flex items-center justify-between">
  <div className="flex-1">
    <h1>Order Details</h1>
    <p>Order #{order?.order_no}</p>
  </div>

  {/* Center - Cancel Button */}
  <Button
    variant="destructive"
    size="sm"
    onClick={() => setShowCancelDialog(true)}
    disabled={!canCancelOrder}
    className="mx-4"
  >
    <Ban className="h-4 w-4 mr-2" />
    Cancel Order
  </Button>

  {/* Right - Close */}
  <Button variant="ghost" size="icon" onClick={onClose}>
    <X className="h-5 w-5" />
  </Button>
</div>

// Inline Notes Section (after header, before Quick Info Cards)
<div className="border rounded-lg p-3 bg-gray-50">
  <div className="flex items-start gap-2">
    <StickyNote className="h-4 w-4 mt-1 text-muted-foreground" />
    {!isEditingNotes ? (
      <div
        className="flex-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1"
        onClick={() => setIsEditingNotes(true)}
      >
        {orderNotes || (
          <span className="text-muted-foreground">
            Click to add notes...
          </span>
        )}
      </div>
    ) : (
      <div className="flex-1">
        <Textarea
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          className="mb-2"
          autoFocus
        />
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {orderNotes.length}/500
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingNotes(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveNote}>
              Save
            </Button>
          </div>
        </div>
      </div>
    )}
  </div>
</div>
```

---

### **Version 3 - Tab-Based Notes Implementation**

**File:** `src/components/order-detail-view.tsx`

**Changes Required:**
1. Replace Cancel button with Actions dropdown menu in header
2. Add "Notes" tab to TabsList
3. Create Notes tab content with timeline view
4. Add note count badge to Notes tab

**Code Structure:**
```tsx
// Header - Actions Menu (line 331-346)
<div className="flex items-center gap-2">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm">
        <MoreVertical className="h-4 w-4 mr-2" />
        Actions
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={handleExport}>
        <Download className="h-4 w-4 mr-2" />
        Export
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleEdit}>
        <Edit className="h-4 w-4 mr-2" />
        Edit Order
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={() => setShowCancelDialog(true)}
        disabled={!canCancelOrder}
        className="text-destructive"
      >
        <Ban className="h-4 w-4 mr-2" />
        Cancel Order
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <Button variant="ghost" size="icon" onClick={onClose}>
    <X className="h-5 w-5" />
  </Button>
</div>

// Add Notes Tab (line 430-442)
<TabsList>
  <TabsTrigger value="overview">Overview</TabsTrigger>
  <TabsTrigger value="items">Items ({order?.items?.length})</TabsTrigger>
  <TabsTrigger value="payments">Payments</TabsTrigger>
  <TabsTrigger value="notes" className="flex items-center gap-1">
    Notes
    {noteCount > 0 && (
      <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
        {noteCount}
      </Badge>
    )}
  </TabsTrigger>
  <TabsTrigger value="tracking">Tracking</TabsTrigger>
  <TabsTrigger value="audit">Audit Trail</TabsTrigger>
</TabsList>

// Notes Tab Content
<TabsContent value="notes" className="space-y-4">
  <Card>
    <CardHeader>
      <CardTitle>Order Notes</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Notes Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NOTE</TableHead>
            <TableHead className="w-[200px]">CREATED BY</TableHead>
            <TableHead className="w-[180px]">CREATED ON</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Existing Notes */}
          {notes.map((note) => (
            <TableRow key={note.id}>
              <TableCell>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm text-muted-foreground">{note.createdBy}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm text-muted-foreground">
                  {note.createdAt}
                </p>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteNote(note.id)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {/* Add New Note Row */}
          {isAddingNote && (
            <TableRow className="bg-muted/50">
              <TableCell colSpan={4} className="p-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="newNoteContent" className="text-xs">Note</Label>
                    <Textarea
                      id="newNoteContent"
                      placeholder="Add new note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="mt-1 min-h-[80px]"
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {newNote.length}/500 characters
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsAddingNote(false)
                        setNewNote("")
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                    >
                      Add Note
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Add Note Button */}
      {!isAddingNote && (
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => setIsAddingNote(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Note
        </Button>
      )}
    </CardContent>
  </Card>
</TabsContent>
```

---

## 🔧 Technical Considerations

### **State Management**
```tsx
// Add to component state
const [showNotesDialog, setShowNotesDialog] = useState(false)
const [orderNotes, setOrderNotes] = useState("")
const [isEditingNotes, setIsEditingNotes] = useState(false)
const [notes, setNotes] = useState<Note[]>([])
const [newNote, setNewNote] = useState("")
const [isAddingNote, setIsAddingNote] = useState(false) // For V3 inline add
const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null)

// Fetch current user on mount
useEffect(() => {
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/user')
      const userData = await response.json()
      setCurrentUser(userData)
    } catch (error) {
      console.error('Failed to fetch user', error)
    }
  }
  fetchCurrentUser()
}, [])

// Fetch existing notes for the order
useEffect(() => {
  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/orders/${order.id}/notes`)
      const notesData = await response.json()
      setNotes(notesData)
    } catch (error) {
      console.error('Failed to fetch notes', error)
    }
  }
  if (order?.id) fetchNotes()
}, [order?.id])
```

### **Data Model**
```tsx
interface Note {
  id: string
  orderId: string
  content: string
  createdBy: string // User email, e.g., "john.doe@central.co.th"
  createdAt: string // ISO 8601 timestamp: "2026-01-30T15:10:00"
  updatedAt?: string
  updatedBy?: string
}

interface Order {
  // ... existing fields
  notes?: string // Version 1 & 2 - single note (legacy)
  notesList?: Note[] // Version 3+ - multiple notes with metadata
}
```

### **API Integration**
```tsx
// Save note to database with metadata
const handleSaveNote = async () => {
  try {
    const noteData = {
      orderId: order.id,
      content: orderNotes,
      createdBy: currentUser?.email || 'system@central.co.th',
      createdAt: new Date().toISOString().slice(0, 19), // "2026-01-30T15:10:00"
    }

    const response = await fetch(`/api/orders/${order.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData),
    })

    if (!response.ok) throw new Error('Failed to save note')

    const savedNote = await response.json()

    // Update local state
    setNotes([savedNote, ...notes])

    toast.success('Note saved successfully')
    setShowNotesDialog(false)
    setOrderNotes("")
  } catch (error) {
    toast.error('Failed to save note')
    console.error(error)
  }
}

// Delete note from database
const handleDeleteNote = async (noteId: string) => {
  if (!confirm('Are you sure you want to delete this note?')) return

  try {
    const response = await fetch(`/api/orders/${order.id}/notes/${noteId}`, {
      method: 'DELETE',
    })

    if (!response.ok) throw new Error('Failed to delete note')

    // Update local state
    setNotes(notes.filter(n => n.id !== noteId))

    toast.success('Note deleted successfully')
  } catch (error) {
    toast.error('Failed to delete note')
    console.error(error)
  }
}

// Utility: Format ISO 8601 timestamp for display
const formatTimestamp = (isoString: string): string => {
  // Display as-is: "2026-01-30T15:10:00"
  return isoString
}
```

---

## ✅ Acceptance Criteria

### **Cancel Button**
- [ ] Cancel button is NOT adjacent to close (X) button
- [ ] Minimum 24px gap between Cancel and Close
- [ ] Cancel button maintains all existing functionality
- [ ] Disabled state still works correctly
- [ ] Tooltip explains why disabled

### **Notes Feature**
- [ ] User can add notes to orders
- [ ] **Created By and Created On** only display AFTER note is saved
- [ ] **Created By** shows user email who created the note
- [ ] **Created On** shows ISO 8601 timestamp: "YYYY-MM-DDTHH:mm:ss" (e.g., "2026-01-30T15:10:00")
- [ ] Notes are saved to database with metadata
- [ ] Notes persist across page refreshes
- [ ] Character limit enforced (500-1000 chars)
- [ ] Character counter displayed
- [ ] Notes are associated with correct order
- [ ] Empty state has clear call-to-action
- [ ] **Delete functionality** works with confirmation
- [ ] Delete button shows on right side of each note (X icon)
- [ ] No Note Type field (single note type only)

### **Version-Specific**
**V1:**
- [ ] Modal opens/closes smoothly
- [ ] Focus returns to trigger button on close

**V2:**
- [ ] Inline section expands on click
- [ ] Clicking outside collapses editor
- [ ] Save/Cancel buttons work correctly

**V3:**
- [ ] Notes tab shows correct count badge
- [ ] Timeline sorted by date (newest first)
- [ ] Edit existing notes works
- [ ] Actions menu contains all relevant actions

---

## 📝 Notes

- **Icons**: Use Lucide React icons (`StickyNote`, `Ban`, `X`, `MoreVertical`, `Plus`)
- **Components**: Leverage shadcn/ui components (Dialog, Dropdown, Textarea, Badge, Select, Table, Label)
- **Accessibility**: Ensure keyboard navigation works for all interactions
- **Mobile**: Test all versions on mobile devices for touch targets
- **Performance**: Notes should load async to not block main order data

### **Note Metadata Pattern**
This wireframe implements a simplified note structure with metadata tracking:
- **No Note Type**: Single note type (Order Note) for simplicity
- **Created By**: Auto-populated user email (e.g., "john.doe@central.co.th")
- **Created On**: ISO 8601 timestamp (e.g., "2026-01-30T15:10:00")
- **Table Layout**: Version 3 uses clean 3-column table structure
- **Delete Action**: X button on right side of each note row
- **Audit Trail**: All notes preserve creation metadata
- **Display After Save**: Metadata only shows on saved notes, not during creation

### **Database Schema Recommendation**
```sql
CREATE TABLE order_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(50) NOT NULL REFERENCES orders(id),
  content TEXT NOT NULL CHECK (char_length(content) <= 1000),
  created_by VARCHAR(255) NOT NULL, -- User email
  created_at VARCHAR(19) NOT NULL, -- ISO 8601 format: "YYYY-MM-DDTHH:mm:ss"
  updated_by VARCHAR(255),
  updated_at VARCHAR(19),
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
  INDEX idx_order_notes_order_id (order_id),
  INDEX idx_order_notes_created_at (created_at DESC)
);
```

---

## 🎨 Version 4: Floating Action Button (FAB) with Slide-Out Panel

### **Layout Overview**
```
┌─────────────────────────────────────────────────────────────┐
│ Order Details                                            [X]│
│ Order #W1156251121946800                                    │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┬─────────┬──────────┬──────────────┐            │
│ │ Status  │ Channel │ Total    │              │            │
│ └─────────┴─────────┴──────────┴──────────────┘            │
├─────────────────────────────────────────────────────────────┤
│ [Overview] [Items] [Payments] [Tracking] [Audit Trail]     │
│                                                             │
│ (Tab Content)                                               │
│                                                             │
│                                                             │
│                                                     [📝]    │ <- FAB
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                     [⚠️ Cancel Order]                       │ <- Bottom Bar
└─────────────────────────────────────────────────────────────┘

                                    ┌──────────────────────────┐
                                    │ 📝 Order Notes       [X]│
                                    ├──────────────────────────┤
                                    │ Recent Notes (2)         │
                                    │ ┌──────────────────────┐ │
                                    │ │ Customer requested   │ │
                                    │ │ gift wrapping...     │ │
                                    │ │                      │ │
                                    │ │ john.doe@central.th  │ │
                                    │ │ 2026-01-30T15:10  [X]│ │
                                    │ └──────────────────────┘ │
                                    │                          │
                                    │ Add New Note             │
                                    │ ┌──────────────────────┐ │
                                    │ │ Add note text...     │ │
                                    │ │                      │ │
                                    │ └──────────────────────┘ │
                                    │ 0/500 chars              │
                                    │                          │
                                    │   [Cancel]  [Save]       │
                                    └──────────────────────────┘
                                            ↑
                                    Slides from right
```

### **Key Features**

#### **1. Floating Action Button (FAB)**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                                                             │
│                                                     ┌─────┐ │
│                                                     │ 📝  │ │ <- FAB
│                                                     └─────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**FAB Properties:**
- **Position**: Fixed bottom-right (24px from bottom, 24px from right)
- **Icon**: `StickyNote` or `MessageSquarePlus`
- **Size**: 56px × 56px (standard FAB size)
- **Color**: Primary brand color with shadow
- **Behavior**:
  - Floats above content
  - Sticky positioning (follows scroll)
  - Opens slide-out panel on click
  - Shows unread note count badge
- **States**:
  - Default: Blue with white icon
  - Hover: Slight scale + shadow increase
  - Active: Panel open, FAB changes to X icon

**Badge Indicator:**
```
┌─────┐
│ 📝 ⓷│ <- Shows count of notes
└─────┘
```

#### **2. Bottom Action Bar**
```
┌─────────────────────────────────────────────────────────────┐
│          [⚠️ Cancel Order]          │          [💾 Save]   │
└─────────────────────────────────────────────────────────────┘
```

**Properties:**
- **Position**: Sticky bottom, always visible
- **Background**: White with subtle border-top
- **Height**: 64px
- **Content**:
  - Center: Cancel Order button (destructive variant)
  - Right: Save button (if form is dirty)
- **Shadow**: Elevation for separation from content
- **Mobile**: Adapts to full-width buttons

**Cancel Button Placement:**
- Far from close (X) at top
- Clear dedicated action area
- Consistent location across pages

#### **3. Slide-Out Notes Panel**
```
                                    ┌───────────────────────┐
                                    │ 📝 Order Notes    [X] │
                                    ├───────────────────────┤
                                    │                       │
                                    │ Recent Notes (3)      │
                                    │ ┌───────────────────┐ │
                                    │ │ 2026-02-01 14:30  │ │
                                    │ │ Customer req...    │ │
                                    │ └───────────────────┘ │
                                    │                       │
                                    │ ┌───────────────────┐ │
                                    │ │ 2026-02-01 10:15  │ │
                                    │ │ Address verified  │ │
                                    │ └───────────────────┘ │
                                    │                       │
                                    │ Add New Note          │
                                    │ ┌───────────────────┐ │
                                    │ │                   │ │
                                    │ │                   │ │
                                    │ └───────────────────┘ │
                                    │ 125/500 characters    │
                                    │                       │
                                    │   [Cancel]  [Save]    │
                                    └───────────────────────┘
```

**Panel Properties:**
- **Width**: 360px (mobile: 90% screen)
- **Height**: Full viewport height
- **Position**: Fixed right, slides in from right edge
- **Animation**: Smooth slide transition (300ms)
- **Backdrop**: Semi-transparent overlay (optional)
- **Scroll**: Independent scroll for note history
- **Close**: X button, click outside, or ESC key

**Features:**
- Quick access from anywhere via FAB
- Timeline view of all notes
- Inline editing
- Auto-save drafts
- Character counter
- Timestamp display

---

### **When to Use Version 4:**
- ✅ Modern, mobile-first design aesthetic
- ✅ Quick access to notes from anywhere on page
- ✅ Users frequently add/review notes
- ✅ Need to view notes while viewing other tabs
- ✅ Want to minimize main content disruption
- ✅ Mobile-friendly touch targets

---

### **Implementation Code - Version 4**

**File:** `src/components/order-detail-view.tsx`

```tsx
// Component State
const [showNotesPanel, setShowNotesPanel] = useState(false)
const [notesList, setNotesList] = useState<Note[]>([])
const [newNoteContent, setNewNoteContent] = useState("")

// FAB Component
<div className="fixed bottom-6 right-6 z-50">
  <Button
    onClick={() => setShowNotesPanel(true)}
    className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
    size="icon"
  >
    <StickyNote className="h-6 w-6" />
    {notesList.length > 0 && (
      <Badge
        variant="destructive"
        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
      >
        {notesList.length}
      </Badge>
    )}
  </Button>
</div>

// Bottom Action Bar
<div className="sticky bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
  <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-4">
    <Button
      variant="destructive"
      size="lg"
      onClick={() => setShowCancelDialog(true)}
      disabled={!canCancelOrder}
      className="min-w-[200px]"
    >
      <Ban className="h-4 w-4 mr-2" />
      Cancel Order
    </Button>

    {hasUnsavedChanges && (
      <Button size="lg" className="min-w-[200px]">
        <Save className="h-4 w-4 mr-2" />
        Save Changes
      </Button>
    )}
  </div>
</div>

// Slide-Out Notes Panel
<Sheet open={showNotesPanel} onOpenChange={setShowNotesPanel}>
  <SheetContent side="right" className="w-[400px] sm:w-[540px] sm:max-w-[90vw]">
    <SheetHeader>
      <SheetTitle className="flex items-center gap-2">
        <StickyNote className="h-5 w-5" />
        Order Notes
      </SheetTitle>
      <SheetDescription>
        Add or view notes for order #{order?.order_no}
      </SheetDescription>
    </SheetHeader>

    <div className="mt-6 space-y-4">
      {/* Recent Notes */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Recent Notes ({notesList.length})</h3>
        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {notesList.map((note) => (
            <Card key={note.id} className="p-3 relative">
              <div className="pr-6">
                <p className="text-sm mb-2">{note.content}</p>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <div>{note.createdBy}</div>
                  <div>{note.createdAt}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 text-destructive hover:text-destructive"
                onClick={() => handleDeleteNote(note.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Add New Note */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Add New Note</h3>

        {/* Note Content */}
        <Textarea
          placeholder="Type your note here..."
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          className="min-h-[120px]"
          maxLength={500}
        />
        <div className="text-xs text-muted-foreground">
          {newNoteContent.length}/500 characters
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setNewNoteContent("")
              setShowNotesPanel(false)
            }}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSaveNote}
            disabled={!newNoteContent.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Note
          </Button>
        </div>
      </div>
    </div>
  </SheetContent>
</Sheet>
```

---

## 🎨 Version 5: Card-Based Layout with Embedded Notes Widget

### **Layout Overview**
```
┌─────────────────────────────────────────────────────────────────────┐
│ Order Details                                                    [X]│
│ Order #W1156251121946800                                            │
├──────────────────────────────────────┬──────────────────────────────┤
│ ┌─────────┬─────────┬──────────┐    │  ┌────────────────────────┐  │
│ │ Status  │ Channel │ Total    │    │  │ 📝 Quick Notes         │  │
│ └─────────┴─────────┴──────────┘    │  │                        │  │
│                                      │  │ • Customer req...      │  │
│ [Overview] [Items] [Payments]       │  │ • Address verify...    │  │
│                                      │  │                        │  │
│ ┌────────────────────────────────┐  │  │ [+ Add Note]           │  │
│ │ Customer Information           │  │  └────────────────────────┘  │
│ │ ...                            │  │                              │
│ │                                │  │  ┌────────────────────────┐  │
│ │                                │  │  │ 📋 Recent Activity     │  │
│ └────────────────────────────────┘  │  │ ...                    │  │
│                                      │  └────────────────────────┘  │
└──────────────────────────────────────┴──────────────────────────────┘
│                     [⚠️ Cancel Order]                               │
└─────────────────────────────────────────────────────────────────────┘
```

### **Key Features**

#### **1. Two-Column Layout**
```
┌──────────────────────┬─────────────────┐
│ Main Content (70%)   │ Sidebar (30%)   │
│                      │                 │
│ • Quick Info Cards   │ • Notes Widget  │
│ • Tabs               │ • Activity Feed │
│ • Tab Content        │ • Quick Actions │
└──────────────────────┴─────────────────┘
```

**Responsive Behavior:**
- Desktop: 70/30 split
- Tablet: 60/40 split
- Mobile: Stack vertically (sidebar below main)

#### **2. Notes Widget Card**
```
┌────────────────────────────────────┐
│ 📝 Quick Notes              [⚙️]   │
├────────────────────────────────────┤
│                                    │
│ ┌────────────────────────────────┐ │
│ │ • Customer requested express   │ │
│ │   delivery (+2 more)           │ │
│ │                                │ │
│ │ [View All 3 Notes]             │ │
│ └────────────────────────────────┘ │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ Add quick note...              │ │
│ └────────────────────────────────┘ │
│                                    │
│ [+ Add Note]                       │
└────────────────────────────────────┘
```

**Widget Properties:**
- **Width**: 100% of sidebar (280-320px)
- **Position**: Sticky, follows scroll
- **States**:
  - Collapsed: Shows 1-2 recent notes
  - Expanded: Shows all notes with scroll
- **Quick Add**: Inline input field
- **Settings**: Gear icon for preferences

**Collapsed State:**
```
┌────────────────────────┐
│ 📝 Notes (3)      [▼]  │
├────────────────────────┤
│ • Latest note...       │
│                        │
│ [+ Quick Add]          │
└────────────────────────┘
```

**Expanded State:**
```
┌────────────────────────┐
│ 📝 Notes (3)      [▲]  │
├────────────────────────┤
│ ┌────────────────────┐ │
│ │ 02/01 14:30        │ │
│ │ Customer req...    │ │
│ │           [Edit]   │ │
│ └────────────────────┘ │
│ ┌────────────────────┐ │
│ │ 02/01 10:15        │ │
│ │ Address verify...  │ │
│ │           [Edit]   │ │
│ └────────────────────┘ │
│ ┌────────────────────┐ │
│ │ 01/31 16:45        │ │
│ │ Special wrap...    │ │
│ │           [Edit]   │ │
│ └────────────────────┘ │
│                        │
│ [+ Add Note]           │
└────────────────────────┘
```

#### **3. Footer Action Bar**
```
┌─────────────────────────────────────────────────────────────┐
│          [⚠️ Cancel Order]          │    [Export PDF]       │
└─────────────────────────────────────────────────────────────┘
```

**Footer Properties:**
- **Position**: Sticky bottom across full width
- **Layout**: Flex with space-between
- **Left**: Cancel Order (destructive)
- **Right**: Secondary actions (Export, Print)
- **Background**: Light gray with top border
- **Shadow**: Subtle elevation

---

### **When to Use Version 5:**
- ✅ Desktop-first application
- ✅ Users need quick glance at notes + other widgets
- ✅ Multi-tasking workflow (view multiple things at once)
- ✅ Space for additional sidebar widgets (activity, docs)
- ✅ Dashboard-style interface preference
- ✅ Users appreciate persistent notes visibility

---

### **Implementation Code - Version 5**

**File:** `src/components/order-detail-view.tsx`

```tsx
// Main Layout Structure
<div className="flex flex-col lg:flex-row gap-6">
  {/* Main Content - 70% */}
  <div className="flex-1 min-w-0">
    {/* Quick Info Cards */}
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
      {/* Cards */}
    </div>

    {/* Tabs */}
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        {/* Tab Triggers */}
      </TabsList>
      <TabsContent value="overview">
        {/* Content */}
      </TabsContent>
    </Tabs>
  </div>

  {/* Sidebar - 30% */}
  <div className="w-full lg:w-[320px] space-y-4">
    {/* Notes Widget */}
    <NotesWidget orderId={order?.id} />

    {/* Activity Feed Widget */}
    <ActivityFeedWidget orderId={order?.id} />
  </div>
</div>

// Notes Widget Component
function NotesWidget({ orderId }: { orderId: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [notes, setNotes] = useState<Note[]>([])
  const [quickNote, setQuickNote] = useState("")

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <StickyNote className="h-4 w-4" />
            Notes ({notes.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Collapsed View - Recent Note */}
        {!isExpanded && notes.length > 0 && (
          <div className="text-sm text-muted-foreground">
            • {notes[0].content.substring(0, 50)}...
            {notes.length > 1 && (
              <span className="ml-2 text-xs">
                (+{notes.length - 1} more)
              </span>
            )}
          </div>
        )}

        {/* Expanded View - All Notes */}
        {isExpanded && (
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {notes.map((note) => (
              <Card key={note.id} className="p-2">
                <div className="text-xs text-muted-foreground mb-1">
                  {format(new Date(note.createdAt), 'MM/dd HH:mm')}
                </div>
                <p className="text-sm">{note.content}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs mt-1"
                  onClick={() => handleEditNote(note.id)}
                >
                  Edit
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Add Input */}
        <div className="space-y-2">
          <Input
            placeholder="Add quick note..."
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && quickNote.trim()) {
                handleQuickSaveNote()
              }
            }}
            className="text-sm"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleQuickSaveNote}
            disabled={!quickNote.trim()}
            className="w-full"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Note
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Footer Action Bar
<div className="sticky bottom-0 left-0 right-0 bg-gray-50 border-t mt-8 z-40">
  <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
    <Button
      variant="destructive"
      size="lg"
      onClick={() => setShowCancelDialog(true)}
      disabled={!canCancelOrder}
    >
      <Ban className="h-4 w-4 mr-2" />
      Cancel Order
    </Button>

    <div className="flex gap-2">
      <Button variant="outline" size="lg">
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
      <Button variant="outline" size="lg">
        <Download className="h-4 w-4 mr-2" />
        Export PDF
      </Button>
    </div>
  </div>
</div>
```

---

## 🎨 Version 6: Context Menu with Smart Positioning

### **Layout Overview**
```
┌─────────────────────────────────────────────────────────────┐
│ Order Details                             [📝] [⚙️]     [X]│
│ Order #W1156251121946800                    ↓               │
│                                   ┌──────────────────┐      │
│                                   │ 📝 Notes (3)     │      │
│                                   ├──────────────────┤      │
│                                   │ • Latest note... │      │
│                                   │                  │      │
│                                   │ [View All]       │      │
│                                   │ [+ Add Note]     │      │
│                                   └──────────────────┘      │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┬─────────┬──────────┬──────────────┐            │
│ │ Status  │ Channel │ Total    │              │            │
│ └─────────┴─────────┴──────────┴──────────────┘            │
│                                                             │
│ [Overview] [Items] [Payments] [Tracking] [Audit Trail]     │
│                                                             │
│ Right-click anywhere for context menu:                     │
│                                                             │
│                     ┌──────────────────┐                    │
│                     │ 📝 Add Note      │                    │
│                     │ 📋 Copy Order ID │                    │
│                     │ 🖨️ Print         │                    │
│                     │ ───────────────  │                    │
│                     │ ⚠️ Cancel Order  │                    │
│                     └──────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### **Key Features**

#### **1. Header Notes Icon with Popover**
```
Order Details                    [📝] [⚙️] [X]
                                   ↓
                        ┌──────────────────────┐
                        │ 📝 Quick Notes       │
                        ├──────────────────────┤
                        │                      │
                        │ Recent:              │
                        │ • Customer req...    │
                        │ • Address verify...  │
                        │                      │
                        │ ─────────────────    │
                        │                      │
                        │ [View All (3)]       │
                        │ [+ Add Note]         │
                        │                      │
                        └──────────────────────┘
```

**Notes Icon Button:**
- **Position**: Header, between settings and close
- **Icon**: `StickyNote` or `MessageSquare`
- **Badge**: Shows unread/total count
- **Click**: Opens popover below icon
- **Size**: Icon button, 40px × 40px

**Popover Properties:**
- **Width**: 280px
- **Max Height**: 400px
- **Positioning**: Smart positioning (flips if near edge)
- **Arrow**: Points to trigger button
- **Backdrop**: Click outside to close
- **Content**:
  - Last 2-3 notes preview
  - "View All" button
  - "Add Note" button

#### **2. Right-Click Context Menu**
```
┌──────────────────────┐
│ 📝 Add Note          │
│ 📋 Copy Order #      │
│ 🔗 Copy Link         │
│ 🖨️ Print Order       │
│ 📥 Export PDF        │
│ ──────────────────   │
│ ⚠️ Cancel Order      │ <- Destructive section
│ 🗑️ Delete (Admin)    │
└──────────────────────┘
```

**Context Menu Properties:**
- **Trigger**: Right-click anywhere in order detail area
- **Position**: Cursor position with smart boundaries
- **Sections**:
  1. Common actions (top)
  2. Separator
  3. Destructive actions (bottom, red text)
- **Keyboard**: ESC to close
- **Mobile**: Long-press gesture

**Menu Items:**
- **Add Note**: Quick note dialog
- **Copy Order #**: Copies to clipboard
- **Copy Link**: Deep link to order
- **Print**: Print dialog
- **Export PDF**: Download PDF
- **Cancel Order**: Shows confirmation
- **Delete**: Admin only, shows warning

#### **3. Minimal Header Design**
```
┌─────────────────────────────────────────────────────────────┐
│ Order Details                             [📝²] [⚙️]    [X]│
│ Order #W1156251121946800                                    │
└─────────────────────────────────────────────────────────────┘
```

**Header Features:**
- **Clean**: Only essential buttons
- **Notes Badge**: Small superscript number
- **Settings**: Gear icon for preferences
- **Close**: Standard X button
- **No Cancel Button**: Moved to context menu

---

### **When to Use Version 6:**
- ✅ Power users who prefer keyboard/right-click workflows
- ✅ Minimal UI, maximum screen space for content
- ✅ Desktop-focused application
- ✅ Users comfortable with hidden/discoverable features
- ✅ Want to reduce visual clutter
- ✅ Advanced users who explore interfaces

---

### **Implementation Code - Version 6**

**File:** `src/components/order-detail-view.tsx`

```tsx
// Header Notes Icon with Popover
<div className="flex items-center gap-2">
  <Popover open={showNotesPopover} onOpenChange={setShowNotesPopover}>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="icon" className="relative">
        <StickyNote className="h-5 w-5" />
        {noteCount > 0 && (
          <Badge
            variant="secondary"
            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
          >
            {noteCount}
          </Badge>
        )}
      </Button>
    </PopoverTrigger>
    <PopoverContent align="end" className="w-80">
      <div className="space-y-3">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <StickyNote className="h-4 w-4" />
          Quick Notes
        </h4>

        {/* Recent Notes */}
        {notes.slice(0, 3).map((note) => (
          <div key={note.id} className="text-sm text-muted-foreground">
            • {note.content.substring(0, 60)}...
          </div>
        ))}

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setShowAllNotesDialog(true)}
          >
            View All ({noteCount})
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => setShowAddNoteDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Note
          </Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>

  <Button variant="ghost" size="icon">
    <Settings className="h-5 w-5" />
  </Button>

  <Button variant="ghost" size="icon" onClick={onClose}>
    <X className="h-5 w-5" />
  </Button>
</div>

// Context Menu Component
<ContextMenu>
  <ContextMenuTrigger asChild>
    <div className="flex-1 min-w-0">
      {/* Order detail content */}
      {children}
    </div>
  </ContextMenuTrigger>

  <ContextMenuContent className="w-56">
    {/* Quick Actions */}
    <ContextMenuItem onClick={() => setShowAddNoteDialog(true)}>
      <StickyNote className="h-4 w-4 mr-2" />
      Add Note
    </ContextMenuItem>

    <ContextMenuItem onClick={handleCopyOrderId}>
      <Clipboard className="h-4 w-4 mr-2" />
      Copy Order ID
    </ContextMenuItem>

    <ContextMenuItem onClick={handleCopyLink}>
      <Link className="h-4 w-4 mr-2" />
      Copy Link to Order
    </ContextMenuItem>

    <ContextMenuItem onClick={handlePrint}>
      <Printer className="h-4 w-4 mr-2" />
      Print Order
    </ContextMenuItem>

    <ContextMenuItem onClick={handleExportPDF}>
      <Download className="h-4 w-4 mr-2" />
      Export as PDF
    </ContextMenuItem>

    <ContextMenuSeparator />

    {/* Destructive Actions */}
    <ContextMenuItem
      onClick={() => setShowCancelDialog(true)}
      disabled={!canCancelOrder}
      className="text-destructive focus:text-destructive"
    >
      <Ban className="h-4 w-4 mr-2" />
      Cancel Order
    </ContextMenuItem>

    {isAdmin && (
      <ContextMenuItem
        onClick={() => setShowDeleteDialog(true)}
        className="text-destructive focus:text-destructive"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Order
      </ContextMenuItem>
    )}
  </ContextMenuContent>
</ContextMenu>

// Quick Add Note Dialog (triggered from context menu or popover)
<Dialog open={showAddNoteDialog} onOpenChange={setShowAddNoteDialog}>
  <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Add Note to Order</DialogTitle>
      <DialogDescription>
        Add a note for order #{order?.order_no}
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
      <Textarea
        placeholder="Type your note here..."
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        className="min-h-[120px]"
        maxLength={500}
        autoFocus
      />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{newNote.length}/500 characters</span>
        <div className="flex gap-2">
          <Checkbox id="important" />
          <label htmlFor="important" className="cursor-pointer">
            Mark as important
          </label>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setShowAddNoteDialog(false)}
      >
        Cancel
      </Button>
      <Button
        onClick={handleQuickSaveNote}
        disabled={!newNote.trim()}
      >
        <Save className="h-4 w-4 mr-2" />
        Save Note
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Mobile: Long-press handler for context menu
useEffect(() => {
  let pressTimer: NodeJS.Timeout

  const handleTouchStart = (e: TouchEvent) => {
    pressTimer = setTimeout(() => {
      // Show context menu at touch position
      showContextMenuAt(e.touches[0].clientX, e.touches[0].clientY)
    }, 500) // 500ms long press
  }

  const handleTouchEnd = () => {
    clearTimeout(pressTimer)
  }

  const element = document.getElementById('order-detail-content')
  element?.addEventListener('touchstart', handleTouchStart)
  element?.addEventListener('touchend', handleTouchEnd)

  return () => {
    element?.removeEventListener('touchstart', handleTouchStart)
    element?.removeEventListener('touchend', handleTouchEnd)
  }
}, [])
```

---

## 📊 Updated Comparison Matrix (All 6 Versions)

| Feature | V1 | V2 | V3 | V4 | V5 | V6 |
|---------|----|----|----|----|----|----|
| **Cancel Location** | Action bar | Header center | Menu | Bottom bar | Footer | Context menu |
| **Accidental Risk** | ⭐ Low | ⭐⭐ Med | ⭐⭐⭐ V.Low | ⭐ Low | ⭐ Low | ⭐⭐⭐ V.Low |
| **Notes Access** | Modal | Inline | Tab | FAB panel | Widget | Popover |
| **Clicks to Note** | 1 | 1 | 2 | 1 | 0-1 | 1-2 |
| **Screen Space** | Minimal | Compact | Dedicated | Minimal | Sidebar | Minimal |
| **Mobile Friendly** | ✅ Good | ✅ Good | ✅ Good | ✅✅ Excellent | ⚠️ OK | ⚠️ Limited |
| **Desktop UX** | ✅ Good | ✅ Good | ✅✅ Excellent | ✅ Good | ✅✅ Excellent | ✅✅ Excellent |
| **Learning Curve** | Easy | Easy | Easy | Medium | Medium | Hard |
| **Power User** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅✅ |
| **Visual Clutter** | Low | Low | Medium | Low | Medium | V.Low |
| **Best For** | Simple | Quick | History | Mobile | Dashboard | Advanced |

---

## 🚀 Updated Recommendations

### **Choose Version 1 if:**
- ✅ Need simple, straightforward solution
- ✅ Modal dialogs are acceptable
- ✅ Want clear action separation
- ✅ MVP/fastest implementation

### **Choose Version 2 if:**
- ✅ Notes should always be visible
- ✅ Want instant access without modals
- ✅ Single note per order sufficient
- ✅ Prefer inline editing

### **Choose Version 3 if:**
- ✅ Need full notes history with audit trail
- ✅ Multiple notes per order required
- ✅ Cancel should be very protected
- ✅ Organized tab structure preferred

### **Choose Version 4 if:**
- ✅ Building mobile-first application
- ✅ Modern FAB pattern resonates with users
- ✅ Users frequently add/check notes
- ✅ Want notes accessible from any tab

### **Choose Version 5 if:**
- ✅ Desktop-first dashboard application
- ✅ Have space for sidebar widgets
- ✅ Users multi-task across sections
- ✅ Want persistent notes visibility
- ✅ Planning additional sidebar content

### **Choose Version 6 if:**
- ✅ Target power users/advanced workflows
- ✅ Desktop-only or desktop-primary app
- ✅ Want absolutely minimal UI
- ✅ Users comfortable with right-click menus
- ✅ Maximum screen space for content needed

---

## 🎯 Implementation Complexity

**Easiest to Hardest:**
1. **Version 1** - Action Bar (Basic modal + button repositioning)
2. **Version 2** - Inline Notes (Expandable section + state management)
3. **Version 6** - Context Menu (Popover + right-click handling)
4. **Version 4** - FAB Pattern (Fixed positioning + slide panel)
5. **Version 5** - Card Layout (Layout restructure + sticky widgets)
6. **Version 3** - Tab-Based (Full timeline component + tab integration)

---

## 💡 Recommended Implementation Path

### **Phase 1: Start Simple**
Implement **Version 1** or **Version 2** for MVP
- Quickest to market
- Validates core functionality
- Gathers user feedback

### **Phase 2: Iterate Based on Usage**
If users love notes feature:
- **High mobile usage** → Migrate to Version 4 (FAB)
- **Desktop dashboard users** → Migrate to Version 5 (Widget)
- **Power users emerge** → Add Version 6 (Context menu) as option

### **Phase 3: Advanced Features**
Add **Version 3** capabilities if needed:
- Full notes timeline
- Edit history
- Note categories/tags
- Attachments support

---

## ✅ Universal Acceptance Criteria

**All Versions Must:**
- [ ] Cancel button NOT adjacent to close (X) icon
- [ ] Minimum 48px touch target for mobile
- [ ] Notes save successfully to database
- [ ] Notes persist across sessions
- [ ] Keyboard accessibility (Tab, Enter, ESC)
- [ ] Loading states for async operations
- [ ] Error handling with user feedback
- [ ] Responsive on mobile/tablet/desktop
- [ ] Works with screen readers
- [ ] Character limit enforced (500-1000)

---

## 🚀 Final Recommendation

**For Most Applications:** Start with **Version 1** or **Version 4**
- Both provide excellent separation of Cancel button
- Both offer clean notes experience
- V1: Traditional, reliable, easy to implement
- V4: Modern, mobile-friendly, engaging UX

**For Desktop Apps:** Consider **Version 5** or **Version 6**
- V5: Dashboard users who want persistent visibility
- V6: Power users who prefer minimal UI

**For Complex Needs:** Eventually upgrade to **Version 3**
- When notes become mission-critical
- When audit trail is required
- When multiple stakeholders add notes

The best approach: **Implement V1 now, plan migration path to V4 or V5 based on analytics.**
