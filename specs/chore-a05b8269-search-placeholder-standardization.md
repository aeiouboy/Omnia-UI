# Chore: Standardize Search Field Placeholders

## Metadata
adw_id: `a05b8269`
prompt: `Standardize search field placeholders to use 'Search [FieldName]...' pattern. Update all search input placeholders across pages to follow consistent format: 'Search Product ID...', 'Search Product Name...', 'Search Store ID...', 'Search Store Name...', 'Search Barcode...' in files: app/inventory-new/supply/page.tsx, app/inventory-new/stores/page.tsx, app/inventory-new/page.tsx.`
status: `completed`
completed_date: `2026-01-17`

## Chore Description
This chore establishes a consistent placeholder pattern for all search input fields across the inventory management pages. Currently, search field placeholders use inconsistent formats like "Search Store ID...", "Search Product ID...", "Search Barcode...", etc. The goal is to standardize ALL search placeholders to follow the exact pattern: "Search [FieldName]..." where the field name is always formatted consistently.

**Standardized Patterns:**
- Product ID → "Search Product ID..."
- Product Name → "Search Product Name..."
- Store ID → "Search Store ID..."
- Store Name → "Search Store Name..."
- Barcode → "Search Barcode..."

This standardization improves user experience through consistency and makes the codebase more maintainable.

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/supply/page.tsx** (lines 324, 336, 347, 360)
  - Contains 4 search input fields: Store ID, Store Name, Product ID, Product Name
  - Already uses correct format, need to verify consistency

- **app/inventory-new/stores/page.tsx** (lines 434, 445)
  - Contains 2 search input fields: Store ID, Store Name
  - Already uses correct format, need to verify consistency

- **app/inventory-new/page.tsx** (lines 604, 615)
  - Contains 2 search input fields: Product Name, Barcode
  - Already uses "Search Product Name..." and "Search Barcode..."
  - Need to verify consistency

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Audit Current Placeholder Values
- Read all three target files and extract current placeholder text from each search Input component
- Document current values for comparison:
  - app/inventory-new/supply/page.tsx: Store ID, Store Name, Product ID, Product Name placeholders
  - app/inventory-new/stores/page.tsx: Store ID, Store Name placeholders
  - app/inventory-new/page.tsx: Product Name, Barcode placeholders
- Create a comparison table to identify any deviations from the standard pattern

### 2. Update Inventory Supply Page (app/inventory-new/supply/page.tsx)
- Verify line 324: Store ID search placeholder is "Search Store ID..."
- Verify line 336: Store Name search placeholder is "Search Store Name..."
- Verify line 347: Product ID search placeholder is "Search Product ID..."
- Verify line 360: Product Name search placeholder is "Search Product Name..."
- Update any placeholders that don't match the standard format

### 3. Update Stock Card Page (app/inventory-new/stores/page.tsx)
- Verify line 434: Store ID search placeholder is "Search Store ID..."
- Verify line 445: Store Name search placeholder is "Search Store Name..."
- Update any placeholders that don't match the standard format

### 4. Update Inventory Management Page (app/inventory-new/page.tsx)
- Verify line 604: Product Name search placeholder is "Search Product Name..."
- Verify line 615: Barcode search placeholder is "Search Barcode..."
- Update any placeholders that don't match the standard format

### 5. Verify Changes
- Use grep to search for all placeholder occurrences in the three files
- Confirm all search placeholders now follow the "Search [FieldName]..." pattern
- Ensure no search fields were missed

### 6. Build and Test
- Run `pnpm build` to verify TypeScript compilation succeeds
- Check for any build errors or warnings related to the changes
- Verify the application builds successfully with all standardized placeholders

## Validation Commands
Execute these commands to validate the chore is complete:

- `grep -n 'placeholder="Search' app/inventory-new/supply/page.tsx` - Verify all 4 search placeholders follow standard format
- `grep -n 'placeholder="Search' app/inventory-new/stores/page.tsx` - Verify all 2 search placeholders follow standard format
- `grep -n 'placeholder="Search' app/inventory-new/page.tsx` - Verify all 2 search placeholders follow standard format
- `pnpm build` - Ensure the application builds without errors
- Visual inspection: All search field placeholders should display as "Search [FieldName]..." with consistent capitalization and ellipsis

## Expected Outcome
After completion:
1. All 8 search input placeholders across 3 pages follow the exact pattern "Search [FieldName]..."
2. Field names are consistently capitalized (e.g., "Product ID" not "product id")
3. All placeholders end with three dots (...)
4. No TypeScript or build errors
5. Improved consistency and user experience across inventory pages

## Notes
- This is a UI/UX standardization chore focused on placeholder text consistency
- No functional logic changes are required
- The pattern "Search [FieldName]..." is already in use across most fields
- This chore ensures 100% consistency and catches any edge cases
- Search functionality itself remains unchanged - only placeholder text is updated
