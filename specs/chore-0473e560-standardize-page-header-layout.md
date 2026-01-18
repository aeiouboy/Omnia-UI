# Chore: Standardize Page Header Layout Across All Pages

## Metadata
adw_id: `0473e560`
prompt: `Standardize page header layout across all pages: 1. Ensure page title and description have consistent spacing from top 2. Align Refresh button position consistently (top-right of content area) 3. Standardize description text length and wrapping behavior 4. Add consistent margin between header and filter section`

## Chore Description
This chore standardizes the page header layout across four key pages to ensure visual consistency throughout the application. The goal is to establish a common header pattern that includes:
- Consistent vertical spacing from the top of the content area
- Unified positioning of the Refresh button (top-right)
- Standardized description text styling and max-width for proper wrapping
- Consistent gap between the header section and the filter/content section below

### Current State Analysis

| Page | Title Style | Description | Refresh Button | Header-to-Filter Gap |
|------|-------------|-------------|----------------|---------------------|
| Order Analysis | Uses `DashboardHeader` component | Short, single line | No Refresh button | N/A (no filters) |
| Order Management Hub | `CardHeader` with CardTitle | No description | Icon button (top-right) | `mt-3` in filters section |
| Inventory Supply | Inline h1 with `text-2xl font-semibold` | 1-line description | Button with text (top-right) | `space-y-4` wrapper |
| Stock Card | Inline h1 with `text-2xl font-semibold` | 1-line description | Button with text (top-right) | `space-y-6` wrapper |

### Target State
All pages will use a consistent header pattern:
- **Title**: `text-2xl font-semibold tracking-tight` (h1)
- **Description**: `text-muted-foreground text-sm max-w-2xl` with single-line truncation or 2-line max
- **Refresh Button**: Consistent `Button variant="outline" size="sm"` positioned absolutely top-right
- **Header-to-Filter Gap**: Consistent `mb-6` after header section

## Relevant Files
Use these files to complete the chore:

### Reference Files
- **src/components/dashboard-header.tsx** - Current shared header component (reference for existing pattern)
- **src/components/dashboard-shell.tsx** - Parent shell providing `p-6` padding to main content area

### Files to Modify
- **app/orders/analysis/page.tsx** - Order Analysis page using DashboardHeader component
  - Currently uses DashboardHeader with heading and text props
  - Needs Refresh button added to header area (pass as children)

- **src/components/order-management-hub.tsx** (lines 1791-1828) - Order Management page header
  - Uses CardHeader with different styling (font-bold instead of font-semibold)
  - Has Export and Refresh buttons but no description text
  - Needs description text added for consistency

- **app/inventory-new/supply/page.tsx** (lines 291-313) - Inventory Supply page header
  - Inline header implementation
  - Good pattern for title/description but inconsistent spacing

- **app/inventory-new/stores/page.tsx** (lines 333-364) - Stock Card page header
  - Similar to supply page but uses `space-y-6` instead of `space-y-4`
  - Has commented-out back button that affects layout

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update DashboardHeader Component to Support Right-Side Actions
- Add optional `actions` prop to DashboardHeader for right-side buttons
- Update the flex layout to position actions on the right
- Ensure the description has `max-w-2xl` to prevent overly long lines
- File: `src/components/dashboard-header.tsx`

### 2. Update Order Analysis Page to Include Refresh Button
- Import RefreshCw icon and Button component
- Add a Refresh button as children to DashboardHeader
- Add a wrapper div with consistent spacing (`space-y-6`)
- File: `app/orders/analysis/page.tsx`

### 3. Standardize Order Management Hub Header
- Change `font-bold` to `font-semibold` in CardTitle for consistency
- Add description text below the title: "Search, filter, and manage orders across all channels"
- Ensure the header section has consistent spacing
- File: `src/components/order-management-hub.tsx` (around line 1796)

### 4. Standardize Inventory Supply Page Header
- Change wrapper from `space-y-4` to `space-y-6` for consistent gap
- Update description to use `text-sm` instead of implicit text-base
- Add `max-w-2xl` to description paragraph for text wrapping consistency
- File: `app/inventory-new/supply/page.tsx`

### 5. Standardize Stock Card Page Header
- Verify `space-y-6` is already set (it is)
- Update description to use `text-sm` instead of `text-base`
- Add `max-w-2xl` to description paragraph for text wrapping consistency
- Ensure `mt-1` on description matches other pages
- File: `app/inventory-new/stores/page.tsx`

### 6. Validate All Changes
- Run TypeScript compilation to check for errors
- Run linter to ensure code quality
- Visually verify consistency across all four pages

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds with no errors
- `pnpm lint` - Ensure no linting errors are introduced
- Manual verification: Navigate to each page and compare header layouts:
  1. `/orders/analysis` - Order Analysis page
  2. `/orders` - Order Management Hub
  3. `/inventory-new/supply` - Inventory Supply page
  4. `/inventory-new/stores` - Stock Card page

## Notes

### Design Token Reference
The standard header pattern should follow these specifications:
```tsx
// Title
<h1 className="text-2xl font-semibold tracking-tight">Page Title</h1>

// Description
<p className="text-sm text-muted-foreground mt-1 max-w-2xl">
  Description text goes here...
</p>

// Refresh Button
<Button variant="outline" size="sm">
  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
  Refresh
</Button>

// Wrapper spacing
<div className="space-y-6">
  {/* Header section */}
  {/* Filter section */}
  {/* Content section */}
</div>
```

### Responsive Considerations
- On mobile (`sm:` breakpoint), the header should stack vertically with title/description above the Refresh button
- Current implementations already handle this with `flex-col sm:flex-row` patterns

### Order Management Hub Special Case
- This page uses a Card wrapper with CardHeader, which adds its own padding (`p-6`)
- The header changes should maintain visual consistency while respecting the Card structure
- The description should be added below the CardTitle within the same flex container
