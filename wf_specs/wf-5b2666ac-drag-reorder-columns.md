# Wireframe: Drag-to-Reorder Table Columns

**ADW ID**: 5b2666ac
**Feature**: Column Reordering via Drag and Drop
**Status**: ✅ Implemented
**Component**: `src/components/order-management-hub.tsx`

---

## Implementation Summary

### UI Controls

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Table Settings Bar                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Toggle] Sticky Header    [Reorder Columns]    [Reset]* (* only in mode)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Two Independent Controls

| Control | Type | Function |
|---------|------|----------|
| **Sticky Header** | Toggle Switch | ON = header fixed on scroll, OFF = header scrolls with content |
| **Reorder Columns** | Button Toggle | Click to enter/exit drag mode |
| **Reset** | Button | Restore default column order (only visible in reorder mode) |

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Navigate to /orders                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Click "Reorder Columns" button                               │
│    → Button turns blue, shows "Done Reordering"                 │
│    → Grip handles (⋮⋮) appear on column headers                 │
│    → Reset button appears                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Drag columns to new positions                                │
│    → Dragged column: opacity 50%, blue background               │
│    → Drop on target column to swap positions                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Click "Done Reordering" to exit mode                         │
│    OR click "Reset" to restore default order                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Visual States

### Normal Mode (Reorder OFF)

```
┌─────────────────────────────────────────────────────────────────┐
│  [•] Sticky Header              [Reorder Columns] (outline)     │
├─────────────────────────────────────────────────────────────────┤
│ Order Number │ Customer Name │ Email │ Phone │ Order Total │    │
├──────────────┼───────────────┼───────┼───────┼─────────────┤    │
│ W115625...   │ John Doe      │ j@... │ 081.. │ ฿1,234.00   │    │
└─────────────────────────────────────────────────────────────────┘
```

### Reorder Mode (Reorder ON)

```
┌─────────────────────────────────────────────────────────────────┐
│  [•] Sticky Header    [Done Reordering] (blue)   [Reset]        │
├─────────────────────────────────────────────────────────────────┤
│ ⋮⋮ Order Number │ ⋮⋮ Customer Name │ ⋮⋮ Email │ ⋮⋮ Phone │     │
│   cursor:grab   │    cursor:grab   │ cursor:grab │ cursor:grab │
├─────────────────┼──────────────────┼─────────────┼─────────────┤
│ W115625...      │ John Doe         │ j@...       │ 081..       │
└─────────────────────────────────────────────────────────────────┘

Legend: ⋮⋮ = GripVertical icon (drag handle)
```

### Dragging State

```
┌─────────────────────────────────────────────────────────────────┐
│ ⋮⋮ Order Number │ ⋮⋮ Customer Name │ ⋮⋮ Email │ ⋮⋮ Phone │     │
│                 │   [DRAGGING]     │           │           │     │
│                 │   opacity: 50%   │           │           │     │
│                 │   bg: blue-50    │           │           │     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Code Implementation

### State (lines 769-772)

```typescript
const [columnOrder, setColumnOrder] = useState<ColumnConfig[]>(DEFAULT_COLUMNS)
const [draggedColumn, setDraggedColumn] = useState<string | null>(null)
const [stickyHeader, setStickyHeader] = useState(true)
const [isReorderMode, setIsReorderMode] = useState(false)
```

### UI Controls (lines 1883-1918)

```typescript
{/* Table Settings Controls */}
<div className="flex items-center justify-end gap-4 mb-3 px-1">
  {/* Sticky Header Toggle */}
  <div className="flex items-center gap-2">
    <Switch id="sticky-header" checked={stickyHeader} onCheckedChange={setStickyHeader} />
    <Label htmlFor="sticky-header">Sticky Header</Label>
  </div>

  {/* Reorder Columns Button */}
  <Button
    variant={isReorderMode ? "default" : "outline"}
    onClick={() => setIsReorderMode(!isReorderMode)}
    className={cn(isReorderMode && "bg-blue-600 hover:bg-blue-700 text-white")}
  >
    <GripVertical className="h-4 w-4" />
    {isReorderMode ? "Done Reordering" : "Reorder Columns"}
  </Button>

  {/* Reset Button (only in reorder mode) */}
  {isReorderMode && (
    <Button variant="ghost" onClick={handleResetColumns}>
      <RotateCcw className="h-4 w-4" /> Reset
    </Button>
  )}
</div>
```

### Table Header (lines 1930-1945)

```typescript
<TableHead
  draggable={isReorderMode}
  onDragStart={isReorderMode ? (e) => handleDragStart(e, column.id) : undefined}
  onDragOver={isReorderMode ? handleDragOver : undefined}
  onDrop={isReorderMode ? (e) => handleDrop(e, column.id) : undefined}
  onDragEnd={isReorderMode ? handleDragEnd : undefined}
  className={cn(
    isReorderMode && "cursor-grab",
    draggedColumn === column.id && "opacity-50 bg-blue-50"
  )}
>
  {isReorderMode && <GripVertical className="h-3.5 w-3.5" />}
  <span>{column.label}</span>
</TableHead>
```

---

## Column Configuration

14 columns available for reordering:

| ID | Label | Min Width | Align |
|----|-------|-----------|-------|
| orderNumber | Order Number | 160px | left |
| customerName | Customer Name | 150px | left |
| email | Email | 200px | left |
| phone | Phone Number | 130px | left |
| total | Order Total | 110px | right |
| storeNo | Store No | 100px | center |
| status | Order Status | 130px | left |
| returnStatus | Return Status | 120px | left |
| onHold | On Hold | 80px | left |
| orderType | Order Type | 120px | left |
| paymentStatus | Payment Status | 130px | left |
| channel | Channel | 110px | left |
| allowSubstitution | Allow Substitution | 140px | left |
| createdDate | Created Date | 160px | left |

---

## Technical Details

| Aspect | Implementation |
|--------|----------------|
| **Drag API** | Native HTML5 Drag and Drop |
| **Library** | None (zero dependencies) |
| **State** | React useState |
| **Persistence** | None (resets on refresh) |
| **Mobile** | Limited (touch drag not optimized) |

---

## Future Enhancements

1. **localStorage Persistence** - Save column order across sessions
2. **Column Visibility** - Show/hide columns via settings popover
3. **Mobile Touch Support** - Add touch drag for mobile devices
4. **ARIA Accessibility** - Add proper ARIA labels for screen readers
