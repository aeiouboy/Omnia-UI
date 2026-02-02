# Wireframe: Order Detail - Notes Icon with Badge & Cancel Button

**ADW ID:** notes-icon-with-badge-redesign
**Created:** 2026-02-01
**Status:** Draft
**Priority:** High

---

## 📋 User Requirements

1. **Hamburger/Icon Button**: User clicks a hamburger-like icon (notes icon) on order detail header
2. **Simple Note Input**: User types note text in blank text box
3. **Auto-Metadata on Save**: Created By and Created On auto-populate from logged-in user account and current time
4. **Note Count Badge**: When notes panel is closed, icon displays note count badge (e.g., "3")
5. **Cancel Button**: Use Version 4 pattern (bottom action bar)

---

## 🎨 Version 1: Header Icon with Slide-Out Panel (Right Side)

### **Layout Overview**
```
┌─────────────────────────────────────────────────────────────┐
│ Order Details                                   [📝³]   [X]│
│ Order #W1156251121946800                          ↑         │
│                                              Note badge     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┬─────────┬──────────┬──────────────┐            │
│ │ Status  │ Channel │ Total    │              │            │
│ └─────────┴─────────┴──────────┴──────────────┘            │
├─────────────────────────────────────────────────────────────┤
│ [Overview] [Items] [Payments] [Tracking] [Audit Trail]     │
│                                                             │
│ (Tab Content)                                               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                     [⚠️ Cancel Order]                       │ <- Sticky Bottom
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────────────────────────────────────────┐
                    │ 📝 Order Notes                               [X] │
                    ├────┬──────────────────────┬───────────┬───────────┬─┤
                    │ No.│ NOTE                 │ CREATED BY│CREATED ON │+│
                    ├────┼──────────────────────┼───────────┼───────────┼─┤
                    │    │ ┌──────────────────┐ │           │           │ │
                    │    │ │ Thai text        │ │           │           │ │
                    │    │ │ content...       │ │           │           │X│
                    │    │ └──────────────────┘ │           │           │ │
                    ├────┼──────────────────────┼───────────┼───────────┼─┤
                    │ 1  │ Customer requested   │buabsupattra│01/13/2026│X│
                    │    │ gift wrapping        │@central.th│ 13:13 +07│ │
                    ├────┼──────────────────────┼───────────┼───────────┼─┤
                    │ 2  │ Address verified     │jane.smith@│01/13/2026│X│
                    │    │ with customer        │central.th │ 10:15 +07│ │
                    └────┴──────────────────────┴───────────┴───────────┴─┘
                                                        [CANCEL] [SAVE]
                                            ↑
                                    Slides from right
```

### **Key Features**

#### **1. Notes Icon Button in Header**
```
Order Details                      [📝³] [X]
                                     ↑
                                Note count badge
```

**Icon Properties:**
- **Position**: Header, before close button (no settings icon)
- **Icon**: `StickyNote` or `MessageSquare`
- **Badge**: Shows note count (e.g., "3")
  - Visible when count > 0
  - Small badge on top-right of icon
  - Updates in real-time
- **Click**: Opens slide-out panel from right
- **Size**: Icon button, 40px × 40px
- **States**:
  - Default: Neutral color
  - With notes: Badge appears
  - Active: Panel open, icon highlighted

#### **2. Slide-Out Notes Panel (Right Side) - Table Layout**

**Panel Properties:**
- **Width**: 500-600px (mobile: 95% screen)
- **Height**: Full viewport height
- **Position**: Fixed right, slides in from right edge
- **Animation**: Smooth slide transition (300ms)
- **Backdrop**: Semi-transparent overlay (optional)
- **Close**: X button in header

**Table Structure:**

```
┌────┬──────────────────────┬───────────────┬───────────────┬──┐
│ No.│ NOTE                 │ CREATED BY    │ CREATED ON    │+ │
├────┼──────────────────────┼───────────────┼───────────────┼──┤
│    │ [Textarea]           │               │               │X │ <- Add Form
├────┼──────────────────────┼───────────────┼───────────────┼──┤
│ 1  │ Note content...      │ user@email.th │ 01/13/2026... │X │ <- Saved Note
└────┴──────────────────────┴───────────────┴───────────────┴──┘
                                                [CANCEL] [SAVE]
```

**Column Details:**

1. **No.** (50px)
   - Empty in add form row
   - Shows sequential number in saved notes (1, 2, 3, ...)
   - Auto-increments for each new note

2. **NOTE** (flexible, largest column)
   - Textarea in add form row (multi-line, 60px height)
   - Plain text in saved notes (wraps if long)
   - Supports Thai/Unicode characters

3. **CREATED BY** (180px)
   - Empty in add form row
   - Shows user email in saved notes

4. **CREATED ON** (140px)
   - Empty in add form row
   - Shows timestamp in saved notes (format: "01/13/2026 13:13 +07")

5. **+** column (40px)
   - X button in add form (clear/cancel)
   - X button in saved notes (delete)

**Footer:**
- **CANCEL button**: Light gray, resets form
- **SAVE button**: Blue/primary, saves note (disabled if empty)

#### **3. Bottom Action Bar (Cancel Order)**
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
  - Left/Center: Cancel Order button (destructive variant)
  - Right: Save button (if form is dirty, for order edits)
- **Shadow**: Elevation for separation from content

---

## 🎨 Version 2: Floating Notes Button (Bottom-Right) with Modal

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
│                                                   ┌───────┐ │
│                                                   │  📝³  │ │ <- FAB
│                                                   └───────┘ │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                     [⚠️ Cancel Order]                       │
└─────────────────────────────────────────────────────────────┘

                    ┌────────────────────────────────────┐
                    │ Order Notes                    [X] │
                    ├────────────────────────────────────┤
                    │ 📝 Notes (3)                       │
                    │                                    │
                    │ ┌────────────────────────────────┐ │
                    │ │ Order Remark                   │ │
                    │ │ Customer requested gift wrap   │ │
                    │ │ john.doe@central.th            │ │
                    │ │ 2026-01-30T15:10           [X] │ │
                    │ └────────────────────────────────┘ │
                    │                                    │
                    │ ┌────────────────────────────────┐ │
                    │ │ Customer Request               │ │
                    │ │ Address verified               │ │
                    │ │ jane.doe@central.th            │ │
                    │ │ 2026-01-30T10:15           [X] │ │
                    │ └────────────────────────────────┘ │
                    │                                    │
                    │ ──────────────────────────────     │
                    │ Add New Note                       │
                    │                                    │
                    │ Type: [Order Remark ▼]             │
                    │                                    │
                    │ ┌────────────────────────────────┐ │
                    │ │ Type your note here...         │ │
                    │ │                                 │ │
                    │ │                                 │ │
                    │ └────────────────────────────────┘ │
                    │ 0/500 characters                   │
                    │                                    │
                    │            [Cancel]  [Save]        │
                    └────────────────────────────────────┘
                                    ↑
                            Center modal overlay
```

### **Key Features**

#### **1. Floating Action Button (FAB)**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                                                   ┌───────┐ │
│                                                   │ 📝 ³  │ │ <- FAB with badge
│                                                   └───────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**FAB Properties:**
- **Position**: Fixed bottom-right (24px from bottom, 24px from right)
- **Icon**: `StickyNote` or `MessageSquarePlus`
- **Size**: 56px × 56px (standard FAB size)
- **Badge**: Note count on top-right corner (small, red/blue)
- **Color**: Primary brand color with shadow
- **Behavior**:
  - Floats above content
  - Sticky positioning (follows scroll)
  - Opens center modal on click
  - Badge updates in real-time
- **Z-index**: High (z-50) to float above bottom bar

**Badge Indicator:**
```
┌─────┐
│ 📝 ³│ <- Shows count of notes
└─────┘
```

#### **2. Center Modal Dialog**

**Modal Properties:**
- **Width**: 600px (mobile: 95% screen)
- **Height**: Auto, max 80vh
- **Position**: Center of screen
- **Backdrop**: Semi-transparent dark overlay
- **Animation**: Fade + scale in
- **Close**: X button, click backdrop, or ESC key

**Modal Structure:**
Same as Version 1 panel, but:
- Center-aligned instead of right-aligned
- Wider (600px vs 360px)
- More comfortable for reading/writing longer notes

---

## 🎨 Version 3: Compact Icon in Quick Info Cards Area

### **Layout Overview**
```
┌─────────────────────────────────────────────────────────────┐
│ Order Details                                            [X]│
│ Order #W1156251121946800                                    │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┬─────────┬──────────┬──────────────┬──────────┐ │
│ │ Status  │ Channel │ Total    │              │ 📝 Notes │ │ <- Notes Card
│ │         │         │          │              │    (3)   │ │
│ └─────────┴─────────┴──────────┴──────────────┴──────────┘ │
├─────────────────────────────────────────────────────────────┤
│ [Overview] [Items] [Payments] [Tracking] [Audit Trail]     │
│                                                             │
│ (Tab Content)                                               │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                     [⚠️ Cancel Order]                       │
└─────────────────────────────────────────────────────────────┘

                    ┌────────────────────────────────────┐
                    │ Order Notes                    [X] │
                    ├────────────────────────────────────┤
                    │ Recent Notes (3)                   │
                    │                                    │
                    │ ┌────────────────────────────────┐ │
                    │ │ Order Remark                   │ │
                    │ │ Customer requested...          │ │
                    │ │ john@central.th  2026-01-30... │ │
                    │ │                            [X] │ │
                    │ └────────────────────────────────┘ │
                    │                                    │
                    │ [View All 3 Notes]                 │
                    │                                    │
                    │ ──────────────────────────────     │
                    │ Add New Note                       │
                    │                                    │
                    │ Type: [Order Remark ▼]             │
                    │                                    │
                    │ ┌────────────────────────────────┐ │
                    │ │ Type your note here...         │ │
                    │ │                                 │ │
                    │ └────────────────────────────────┘ │
                    │ 0/500 characters                   │
                    │                                    │
                    │            [Cancel]  [Save]        │
                    └────────────────────────────────────┘
```

### **Key Features**

#### **1. Notes Card in Quick Info Section**
```
┌─────────┬─────────┬──────────┬──────────────┬──────────┐
│ Status  │ Channel │ Total    │              │ 📝 Notes │
│         │         │          │              │    (3)   │
└─────────┴─────────┴──────────┴──────────────┴──────────┘
```

**Card Properties:**
- **Position**: Part of quick info cards grid (4th or 5th card)
- **Icon**: `StickyNote` icon
- **Label**: "Notes"
- **Count**: Displayed as large number (e.g., "(3)")
- **Behavior**: Click anywhere on card to open notes modal
- **Style**: Same card style as Status, Channel, Total cards
- **Responsive**: Stacks on mobile with other cards

**Benefits:**
- Always visible (no need to hunt for icon)
- Consistent with existing quick info pattern
- Clear visual hierarchy

#### **2. Notes Modal**
- Same structure as Version 2
- Opens as center modal
- Shows recent notes (2-3) + "View All" button
- Add note form at bottom

---

## 📊 Comparison Matrix

| Feature | Version 1 | Version 2 | Version 3 |
|---------|-----------|-----------|-----------|
| **Notes Trigger** | Header icon | FAB (bottom-right) | Quick info card |
| **Badge Location** | On header icon | On FAB | On card |
| **Panel Type** | Slide-out (right) | Center modal | Center modal |
| **Screen Space** | Side panel (360px) | Modal (600px) | Modal (600px) |
| **Always Visible** | Header (top) | FAB (bottom-right) | Quick info (top) |
| **Mobile Friendly** | ✅ Good | ✅✅ Excellent | ✅ Good |
| **Discovery** | Medium (header) | High (FAB prominent) | High (part of cards) |
| **Distraction** | Low | Medium (FAB floats) | Low (integrated) |
| **Best For** | Desktop + Mobile | Mobile-first | Existing card layout |

---

## 💡 Recommendations

### **Choose Version 1 if:**
- ✅ Want clean header integration
- ✅ Prefer slide-out panels (less intrusive)
- ✅ Desktop-focused application
- ✅ Users familiar with right-side panels
- ✅ Need to view notes while browsing tabs

### **Choose Version 2 if:**
- ✅ Mobile-first application
- ✅ Want maximum visibility (FAB pattern)
- ✅ Users frequently add/check notes
- ✅ Modern, app-like UX preferred
- ✅ Notes are primary feature

### **Choose Version 3 if:**
- ✅ Already have quick info cards layout
- ✅ Want consistent visual pattern
- ✅ Notes are important status indicator
- ✅ Desktop-first but mobile-friendly needed
- ✅ Minimal UI changes to existing design

---

## 🎯 Implementation Details

### **Universal Components (All Versions)**

#### **State Management**
```tsx
const [showNotesPanel, setShowNotesPanel] = useState(false)
const [notes, setNotes] = useState<Note[]>([])
const [newNote, setNewNote] = useState("")
const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null)

// Fetch notes and user on mount
useEffect(() => {
  fetchNotes()
  fetchCurrentUser()
}, [order?.id])

// Compute note count for badge
const noteCount = notes.length
```

#### **Data Model**
```tsx
interface Note {
  id: string
  orderId: string
  content: string
  createdBy: string // Auto-populated from currentUser.email (e.g., "buabsupattra@central.co.th")
  createdAt: string // Auto-populated: "01/13/2026 13:13 +07" format
}

// Helper function to format timestamp like "01/13/2026 13:13 +07"
const formatGMT7Timestamp = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }

  const formatter = new Intl.DateTimeFormat('en-US', options)
  const parts = formatter.formatToParts(date)

  const month = parts.find(p => p.type === 'month')?.value
  const day = parts.find(p => p.type === 'day')?.value
  const year = parts.find(p => p.type === 'year')?.value
  const hour = parts.find(p => p.type === 'hour')?.value
  const minute = parts.find(p => p.type === 'minute')?.value

  return `${month}/${day}/${year} ${hour}:${minute} +07`
}
```

#### **Save Note Function**
```tsx
const handleSaveNote = async () => {
  if (!newNote.trim()) return

  try {
    const noteData = {
      orderId: order.id,
      content: newNote.trim(),
      createdBy: currentUser?.email || 'system@central.co.th', // Auto-populated
      createdAt: formatGMT7Timestamp(new Date()), // Auto-populated: "01/13/2026 13:13 +07"
    }

    const response = await fetch(`/api/orders/${order.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData),
    })

    if (!response.ok) throw new Error('Failed to save note')

    const savedNote = await response.json()

    // Update local state (add to beginning - newest first)
    setNotes([savedNote, ...notes])

    // Reset form
    setNewNote("")

    toast.success('Note saved successfully')
  } catch (error) {
    toast.error('Failed to save note')
    console.error(error)
  }
}
```

---

### **Version 1 - Header Icon with Slide-Out Panel**

**File:** `src/components/order-detail-view.tsx`

```tsx
// Header - Notes Icon with Badge (NO settings icon)
<div className="flex items-center gap-2">
  <Button
    variant="ghost"
    size="icon"
    className="relative"
    onClick={() => setShowNotesPanel(true)}
  >
    <StickyNote className="h-5 w-5" />
    {noteCount > 0 && (
      <Badge
        variant="destructive"
        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
      >
        {noteCount}
      </Badge>
    )}
  </Button>

  <Button variant="ghost" size="icon" onClick={onClose}>
    <X className="h-5 w-5" />
  </Button>
</div>

// Slide-Out Panel with Table Layout
<Sheet open={showNotesPanel} onOpenChange={setShowNotesPanel}>
  <SheetContent side="right" className="w-[600px] sm:max-w-[95vw] flex flex-col p-0">
    <SheetHeader className="px-6 py-4 border-b">
      <SheetTitle className="flex items-center gap-2">
        <StickyNote className="h-5 w-5" />
        Order Notes
      </SheetTitle>
    </SheetHeader>

    {/* Notes Table */}
    <div className="flex-1 overflow-auto px-6 py-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">No.</TableHead>
            <TableHead>NOTE</TableHead>
            <TableHead className="w-[180px]">CREATED BY</TableHead>
            <TableHead className="w-[140px]">CREATED ON</TableHead>
            <TableHead className="w-[40px]">+</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Add Form Row - ALWAYS AT TOP */}
          <TableRow className="bg-muted/30">
            <TableCell className="text-center text-muted-foreground align-top">
              {/* Empty - auto-numbered after save */}
            </TableCell>
            <TableCell className="align-top pt-3">
              <Textarea
                placeholder="Type your note here..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[60px] resize-none text-sm"
                maxLength={500}
              />
            </TableCell>
            <TableCell className="text-muted-foreground text-sm align-top">
              {/* Empty - auto-populated on save */}
            </TableCell>
            <TableCell className="text-muted-foreground text-sm align-top">
              {/* Empty - auto-populated on save */}
            </TableCell>
            <TableCell className="align-top pt-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNewNote("")}
                className="h-8 w-8"
                title="Clear form"
              >
                <X className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>

          {/* Existing Notes */}
          {notes.map((note, index) => (
            <TableRow key={note.id}>
              <TableCell className="text-center text-sm font-medium align-top">
                {index + 1}
              </TableCell>
              <TableCell className="align-top">
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground align-top">
                {note.createdBy}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground align-top">
                {note.createdAt}
              </TableCell>
              <TableCell className="align-top">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteNote(note.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  title="Delete note"
                >
                  <X className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {/* Empty State */}
          {notes.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                No notes yet. Add your first note above.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>

    {/* Footer with CANCEL and SAVE buttons */}
    <div className="border-t px-6 py-4 flex justify-end gap-3">
      <Button
        variant="outline"
        onClick={() => setNewNote("")}
      >
        CANCEL
      </Button>
      <Button
        onClick={handleSaveNote}
        disabled={!newNote.trim()}
      >
        SAVE
      </Button>
    </div>
  </SheetContent>
</Sheet>

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
  </div>
</div>
```

---

### **Version 2 - FAB with Center Modal**

**File:** `src/components/order-detail-view.tsx`

```tsx
// Floating Action Button
<div className="fixed bottom-24 right-6 z-50">
  <Button
    onClick={() => setShowNotesPanel(true)}
    className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
    size="icon"
  >
    <StickyNote className="h-6 w-6" />
    {noteCount > 0 && (
      <Badge
        variant="destructive"
        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
      >
        {noteCount}
      </Badge>
    )}
  </Button>
</div>

// Center Modal Dialog
<Dialog open={showNotesPanel} onOpenChange={setShowNotesPanel}>
  <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <StickyNote className="h-5 w-5" />
        Order Notes
      </DialogTitle>
      <DialogDescription>
        Notes ({noteCount})
      </DialogDescription>
    </DialogHeader>

    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
      {/* Notes List - Same as Version 1 */}
      {/* Add Note Form - Same as Version 1 */}
    </div>
  </DialogContent>
</Dialog>

// Bottom Action Bar - Same as Version 1
```

---

### **Version 3 - Quick Info Card**

**File:** `src/components/order-detail-view.tsx`

```tsx
// Quick Info Cards - Add Notes Card
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
  {/* Existing cards: Status, Channel, Total, etc. */}

  {/* Notes Card */}
  <Card
    className="cursor-pointer hover:shadow-md transition-shadow"
    onClick={() => setShowNotesPanel(true)}
  >
    <CardContent className="p-3 sm:p-4">
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <StickyNote className="h-5 w-5 text-muted-foreground" />
          <p className="text-xs sm:text-sm text-enterprise-text-light">Notes</p>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-enterprise-primary">
          {noteCount}
        </div>
      </div>
    </CardContent>
  </Card>
</div>

// Modal Dialog - Same as Version 2
```

---

## ✅ Acceptance Criteria

### **All Versions Must:**

**Notes Icon/Button:**
- [ ] Notes trigger (icon/FAB/card) is clearly visible
- [ ] Note count badge displays when noteCount > 0
- [ ] Badge updates in real-time when notes added/deleted
- [ ] Click opens notes panel/modal smoothly

**Notes Panel (Table Layout):**
- [ ] **Table structure** with 5 columns: No. | NOTE | CREATED BY | CREATED ON | +
- [ ] **Add form row at TOP** of table (always visible)
- [ ] Shows all existing notes below add form (newest first)
- [ ] Each note row displays: Sequential number, Content, Created By, Created On, Delete button
- [ ] Delete button (X) on each saved note with confirmation
- [ ] Scrollable table body if many notes exist

**Add Note Form (First Row):**
- [ ] **No Note Type dropdown** (single order note type only)
- [ ] Multi-line textarea in NOTE column
- [ ] No. column is empty (auto-numbered after save: 1, 2, 3, ...)
- [ ] CREATED BY and CREATED ON columns are empty (auto-populated on save)
- [ ] X button in + column clears form
- [ ] **CANCEL button in footer** resets form
- [ ] **SAVE button in footer** saves note (disabled when textarea is empty)

**Auto-Metadata on Save:**
- [ ] **Created By** auto-populates from logged-in user's email
- [ ] **Created On** auto-populates with current timestamp (format: "01/13/2026 13:13 +07")
- [ ] User does NOT manually enter Created By or Created On
- [ ] Metadata displays only AFTER note is saved (empty during add form)

**Note Count Badge:**
- [ ] Badge shows current count of notes
- [ ] Badge updates immediately after save
- [ ] Badge updates immediately after delete
- [ ] Badge visible on closed panel (icon/FAB/card)

**Cancel Order Button:**
- [ ] Located in sticky bottom action bar
- [ ] Far from close (X) button (no accidental clicks)
- [ ] Maintains all existing functionality
- [ ] Disabled state works correctly

**Persistence:**
- [ ] Notes saved to database
- [ ] Notes persist across page refreshes
- [ ] Notes associated with correct order

---

## 🚀 Final Recommendation

### **Best Choice: Version 1 (Header Icon with Slide-Out Panel)**

**Why:**
1. ✅ **Professional & Familiar**: Header icons are standard pattern
2. ✅ **Non-Intrusive**: Slide-out doesn't block main content
3. ✅ **Multi-tasking**: Can view notes while browsing tabs
4. ✅ **Clean UI**: Doesn't add extra cards or floating buttons
5. ✅ **Badge Visible**: Note count always visible in header
6. ✅ **Desktop + Mobile**: Works well on all screen sizes

**Implementation Priority:**
1. **Phase 1**: Implement Version 1 (2-3 hours)
2. **Phase 2**: Add bottom action bar for Cancel Order (1 hour)
3. **Phase 3**: Add auto-metadata logic (already in code)
4. **Phase 4**: Add note count badge with real-time updates (30 min)

**Total Effort:** ~4-5 hours for complete implementation

---

## 📝 Notes

- All versions use **slide-out panel or modal** (not inline table)
- All versions have **Note Type dropdown** (user selects before typing)
- All versions **auto-populate Created By and Created On** on save
- All versions show **note count badge** on trigger element
- Cancel Order button uses **Version 4 bottom action bar pattern**

This design provides the smoothest user journey:
1. User clicks notes icon (sees badge count)
2. Panel/modal opens showing existing notes
3. User selects Note Type from dropdown
4. User types note in textarea
5. User clicks Save
6. Created By and Created On auto-populate
7. Panel closes, badge updates to new count
