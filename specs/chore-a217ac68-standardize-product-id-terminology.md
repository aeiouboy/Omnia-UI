# Chore: Standardize 'Item ID' to 'Product ID' across all pages

## Metadata
adw_id: `a217ac68`
prompt: `Standardize 'Item ID' to 'Product ID' across all pages. In Inventory Availability page (app/inventory-new/supply/page.tsx), change 'Item ID' search placeholder and table header to 'Product ID'. Update variable names from 'itemId' to 'productId' where appropriate for consistency.`

## Chore Description
This chore standardizes terminology across the application by replacing 'Item ID' with 'Product ID' for consistency with the data model and industry standards. The primary focus is on the Inventory Availability page (app/inventory-new/supply/page.tsx), but the change should be applied consistently across all user-facing UI components.

**Key Context:**
- The underlying data model uses `productId` (as seen in `src/types/inventory.ts` line 230)
- The term "Item ID" is used inconsistently in UI labels and placeholders
- Stock Config pages use `itemId` for a different purpose (stock configuration items)
- Need to distinguish between inventory products (`productId`) and stock config items (`itemId`)

**Scope:**
- **Inventory pages**: Change 'Item ID' to 'Product ID' in UI labels, placeholders, and comments
- **Stock Config pages**: Keep 'Item ID' terminology (refers to different domain concept)
- **Variable names**: Update `itemId` to `productId` ONLY in inventory-related files
- **Do NOT change**: Stock config files where `itemId` refers to stock configuration items

## Relevant Files
Use these files to complete the chore:

**Primary Target:**
- `app/inventory-new/supply/page.tsx` - Inventory Availability page with search filters and table headers using "Item ID"

**Other Inventory UI Files:**
- `src/components/order-management-hub.tsx` - Order management with "Item ID / SKU" search filter (line 2018)
- `app/inventory-new/page.tsx` - Main inventory page (verify if "Item ID" is used)
- `app/inventory/page.tsx` - Legacy inventory page (verify if "Item ID" is used)
- `src/components/inventory-detail-view.tsx` - Product detail view (verify terminology)
- `src/components/inventory/transaction-history-section.tsx` - Transaction history (verify terminology)

**Documentation:**
- `docs/wording/01-item-vs-product-terminology.txt` - Contains the exact prompt for this chore
- `docs/wording/README.md` - Wording standards documentation (check for related guidelines)
- `docs/inventory-terminology-standards.md` - Inventory terminology standards (update if needed)

**Files to EXCLUDE (Stock Config Domain):**
- `src/types/stock-config.ts` - Keep `itemId` (refers to stock config items, not products)
- `src/components/stock-config/stock-config-table.tsx` - Keep "Item ID" (stock config context)
- `src/components/stock-config/stock-config-form-modal.tsx` - Keep `itemId` (stock config context)
- `src/components/stock-config/validation-results-table.tsx` - Keep "Item ID" (stock config context)
- `src/components/stock-config/post-processing-report.tsx` - Keep "Item ID" (stock config context)
- `app/stock-config/page.tsx` - Keep `itemIdFilter` (stock config context)
- `src/lib/stock-config-service.ts` - Keep `itemId` (stock config context)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Inventory Supply Page UI Labels and Placeholders
- Change line 342 comment: `{/* Item ID Search */}` → `{/* Product ID Search */}`
- Change line 346 placeholder: `"Search Item ID..."` → `"Search Product ID..."`
- Change line 423 empty state message: `"Item ID"` → `"Product ID"`
- Change line 454 table header: `"Item ID"` → `"Product ID"`

### 2. Update Inventory Supply Page Variable Names and Logic
- Rename state variable `itemId` to `productId` (line 52)
- Update all references to `itemId` throughout the file:
  - Line 72, 75: `itemId` in `hasValidSearchCriteria` dependency array
  - Line 88, 89: `itemId` in `loadData` function check
  - Line 140: `itemId` in `useEffect` dependency array
  - Line 174-175: `itemId` in filter comment and condition
  - Line 220: `itemId` in `filteredData` dependency array
  - Line 225: `setItemId("")` in `handleClear`
  - Line 347: `value={itemId}` in Input component
  - Line 348: `onChange={(e) => setItemId(e.target.value)}` in Input component
  - Line 409: `!itemId` in disabled condition

### 3. Update Inventory Supply Page Filter Logic Comments
- Update line 150 comment: `// When doing item-only search (Item ID or Product Name)` → `// When doing item-only search (Product ID or Product Name)`
- Update line 174 comment: `// Item ID Filter` → `// Product ID Filter`

### 4. Update Order Management Hub Search Filter Label
- Change line 2016 comment: `{/* Item ID / SKU Search */}` → `{/* Product ID / SKU Search */}`
- Change line 2018 label: `"Item ID / SKU"` → `"Product ID / SKU"`

### 5. Verify and Update Other Inventory Files
- Read and check `app/inventory-new/page.tsx` for any "Item ID" references
- Read and check `app/inventory/page.tsx` for any "Item ID" references
- Read and check `src/components/inventory-detail-view.tsx` for any "Item ID" references
- Read and check `src/components/inventory/transaction-history-section.tsx` for any "Item ID" references
- Update any found instances to use "Product ID" instead

### 6. Update Documentation if Needed
- Check `docs/inventory-terminology-standards.md` for terminology guidelines
- Add or update entry to clarify:
  - "Product ID" is the standard term for inventory product identifiers (`productId` field)
  - "Item ID" is reserved for stock configuration domain (`itemId` in stock-config types)
- Update any examples or references to use "Product ID" for inventory

### 7. Build and Test for TypeScript Errors
- Run `pnpm build` to ensure no TypeScript errors
- Verify no compilation issues from variable renames
- Check for any linting warnings related to the changes

### 8. Visual Validation
- Start dev server with `pnpm dev`
- Navigate to Inventory Supply page (`/inventory-new/supply`)
- Verify all labels show "Product ID" instead of "Item ID"
- Test search functionality still works with renamed variables
- Navigate to Order Management Hub and verify "Product ID / SKU" label
- Check other inventory pages for consistent terminology

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# 1. Build check - ensure no TypeScript errors
pnpm build

# 2. Grep check - verify no "Item ID" remains in inventory files (excluding stock-config)
grep -r "Item ID" app/inventory-new/ app/inventory/ src/components/inventory/ src/components/order-management-hub.tsx

# 3. Grep check - verify itemId variable renamed in inventory supply page
grep "itemId" app/inventory-new/supply/page.tsx

# 4. Grep check - confirm stock-config files still use "Item ID" (should find matches)
grep "Item ID" src/components/stock-config/ app/stock-config/

# 5. Manual visual test - start dev server and check UI
pnpm dev
# Navigate to http://localhost:3000/inventory-new/supply
# Verify "Product ID" appears in search placeholder and table header
# Navigate to order management hub and verify "Product ID / SKU" label
```

## Notes
- **Domain Separation**: This change applies ONLY to inventory domain. Stock configuration domain intentionally uses "Item ID" because it refers to stock config items, not product inventory.
- **Variable Naming Convention**: Use `productId` for inventory product identifiers, `itemId` for stock config item identifiers.
- **Backward Compatibility**: No API or database changes needed - this is purely a UI/frontend terminology standardization.
- **Related Documentation**: See `docs/wording/01-item-vs-product-terminology.txt` for the original requirement.
