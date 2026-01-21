# Chore: Stock Card UI Redesign - Layout Efficiency and Wording Improvements

## Metadata
adw_id: `800e4268`
prompt: `Stock Card UI Redesign - Improve layout efficiency and wording for both By Product and By Store views in app/inventory-new/stores/page.tsx`

## Chore Description
Redesign the Stock Card interface to improve layout efficiency, wording, and field sizing for both the "By Product" and "By Store" views. The changes focus on:
- Consolidating filter rows to reduce vertical space usage
- Shortening placeholder text for better density
- Reducing input field widths for a more compact layout
- Grouping action buttons consistently on the right side
- Applying common styling improvements across both views
- Ensuring consistent design patterns between both views

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/stores/page.tsx** - Main Stock Card page component containing both By Product and By Store views. This is the primary file to modify. Currently has ~1330 lines with filter components, tables, and action buttons.

### New Files
No new files needed - all changes are modifications to the existing page component.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. By Product View - Consolidate Filter Rows (lines 877-1002 → 2 rows)
**Current structure (3 rows):**
- Row 1: Date Range + Product Search Group
- Row 2: Store Search Group (separate row)
- Row 3: Transaction Type + Notes Search + Action Buttons

**Target structure (2 rows):**
- Row 1: Date Range + Store Search Group (move Store filters up)
- Row 2: Product Search Group + Transaction Type + Notes Search + Action Buttons (right-aligned)

**Changes:**
- Move the Store Search Group from its current location (lines 974-1001) to Row 1 after Date Range
- Move Product Search Group to Row 2
- Keep Transaction Type and Notes Search on Row 2
- Group all action buttons (Refresh, Clear All, Export CSV) together on right side of Row 2

### 2. By Product View - Shorten Placeholder Text
Update all placeholder text in By Product filters:
- Line 952: `"Search Product ID..."` → `"Product ID"`
- Line 964: `"Search Product Name..."` → `"Product Name"`
- Line 984: `"Search Store ID..."` → `"Store ID"`
- Line 996: `"Search Store Name..."` → `"Store Name"`
- Line 1028: `"Search in notes..."` → `"Notes"`

### 3. By Product View - Reduce Input Field Widths
Update input field minimum widths for compact density:
- Line 955: `min-w-[160px]` → `min-w-[140px]` (Product ID)
- Line 966: `min-w-[160px]` → `min-w-[140px]` (Product Name)
- Line 987: `min-w-[160px]` → `min-w-[140px]` (Store ID)
- Line 998: `min-w-[160px]` → `min-w-[140px]` (Store Name)
- Line 1030: `min-w-[250px]` → `min-w-[200px]` (Notes search)

### 4. By Product View - Transaction Type Dropdown Width
- Line 1011: `w-[180px]` → `w-[140px]` (Transaction Type dropdown)

### 5. By Store View - Consolidate to Single Filter Row (lines 629-744)
**Current structure:**
- View Type dropdown
- Vertical divider
- Store Search Group
- Spacer
- Clear All button
- Refresh button

**Target structure (single row, same layout but more compact):**
- View Type dropdown
- Vertical divider
- Store Search Group
- Spacer (flex-1)
- Action buttons grouped: Clear All + Refresh

### 6. By Store View - Shorten Placeholder Text
- Line 700: `"Search Store ID..."` → `"Store ID"`
- Line 712: `"Search Store Name..."` → `"Store Name"`

### 7. By Store View - Reduce Input Field Widths
- Line 703: `min-w-[160px]` → `min-w-[140px]` (Store ID)
- Line 714: `min-w-[160px]` → `min-w-[140px]` (Store Name)

### 8. Common - Reduce Filter Group Padding and Gaps
Apply to both views:
- Change filter group padding from `p-2` to `p-1.5` for more compact look
- Change gap between filter elements from `gap-2` to `gap-1.5`

**By Store view locations:**
- Line 691: Store Search Group `p-2` → `p-1.5`, `gap-2` → `gap-1.5`

**By Product view locations:**
- Line 879: Date Range group `p-2` → `p-1.5`, `gap-2` → `gap-1.5`
- Line 943: Product Search Group `p-2` → `p-1.5`, `gap-2` → `gap-1.5`
- Line 975: Store Search Group `p-2` → `p-1.5`, `gap-2` → `gap-1.5`

### 9. Update Empty State Messages
Make empty state messages more concise:

**By Store view (lines 748-751):**
- Current: `"Select a View Type and search for a store to display data"`
- New: `"Select View Type and enter store search (2+ chars)"`
- Subtitle: `"Both View Type and Store search (ID or Name with 2+ characters) are required. Orange borders indicate incomplete filters."` → `"Complete all filters with orange borders to load data."`

**By Product view (lines 1072-1084):**
- Current message: `"Select a Product and Store to View Stock Card"`
- New: `"Select filters to view stock card"`
- Current subtitle: `"Please select Date Range, Product (ID or Name), and Store (ID or Name) to view transaction history."`
- New subtitle: `"Complete Date Range, Product, and Store filters to load data."`

### 10. Verify Responsive Behavior
After all changes, verify:
- Filter rows wrap properly on smaller screens (flex-wrap is already in place)
- Input fields don't truncate text at min-w-[140px]
- Action buttons remain accessible on mobile
- Orange border validation still displays correctly

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify no TypeScript errors
- `pnpm lint` - Ensure no linting errors
- `pnpm dev` - Start development server and manually test:
  1. Navigate to /inventory-new/stores
  2. Verify By Product view has 2 filter rows (Date Range + Store in Row 1, Product + Transaction Type + Notes + Buttons in Row 2)
  3. Verify By Store view has all filters in single row
  4. Verify placeholder text is shortened in all inputs
  5. Verify action buttons are grouped on right side
  6. Verify orange borders still appear for incomplete mandatory filters
  7. Test responsive behavior by resizing browser window
  8. Test filter functionality still works correctly

## Notes

### Layout Consolidation Strategy
The By Product view currently uses 3 rows of filters which consumes excessive vertical space. By consolidating to 2 rows:
- Row 1: Date Range (mandatory) + Store filters (mandatory) - these are related context filters
- Row 2: Product filters (mandatory) + optional filters (Transaction Type, Notes) + action buttons

This grouping is logical because Date Range and Store provide the "where/when" context, while Product and Transaction Type provide the "what" filtering.

### Placeholder Text Rationale
The shorter placeholders work because:
- The filter group labels ("Date Range", "Product", "Store") already provide context
- Full action words like "Search" are redundant when there's a search icon
- Users understand input fields are for searching/filtering

### Width Reduction Impact
Reducing from 160px to 140px minimum width:
- Still accommodates typical store IDs (e.g., "CFR0001") and short names
- Saves ~80px total across 4 input fields per view
- Combined with shorter placeholders, prevents text truncation

### Action Button Grouping
Grouping Refresh, Clear All, and Export CSV together:
- Creates consistent UX pattern across both views
- Right-alignment is standard for action buttons in filter bars
- Makes scanning filter options vs actions easier
