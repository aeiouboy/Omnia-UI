# Chore: Validate Inventory Management Terminology

## Metadata
adw_id: `8ad29590`
prompt: `Analyze and validate all wording, labels, and terminology used in the inventory management section of the application against industry-standard inventory management and order management conventions. Review: 1) app/inventory/page.tsx and app/inventory/stores/page.tsx for page-level labels, 2) src/components/inventory-detail-view.tsx for detail page terminology, 3) src/components/side-nav.tsx for navigation menu labels, 4) src/components/recent-transactions-table.tsx for transaction terminology, 5) src/types/inventory.ts for field naming conventions. Compare against standard terms like: SKU, Stock Keeping Unit, Available Stock, Reserved Stock, Safety Stock, Reorder Point, Lead Time, Stock on Hand, In Transit, Allocated, Back Order, etc. Identify any inconsistent, non-standard, or confusing terminology and propose standardized alternatives. Focus on user-facing labels, table headers, form fields, tooltips, and navigation items.`

## Chore Description
Review all inventory management terminology throughout the application and validate against industry-standard conventions. The goal is to ensure consistency, clarity, and alignment with widely-recognized inventory management terminology to improve user understanding and reduce confusion. This includes:

1. **User-facing labels** - Button text, card titles, section headers
2. **Table headers** - Column names in data tables
3. **Form fields** - Input labels and placeholders
4. **Tooltips** - Explanatory text for technical terms
5. **Navigation items** - Menu labels in sidebar
6. **Type definitions** - Field names in TypeScript interfaces
7. **Status labels** - Inventory status badges and indicators

The review will focus on terminology alignment with standard inventory management concepts like SKU, Available Stock, Reserved Stock (Allocated), Safety Stock, Reorder Point, Stock on Hand, In Transit, Back Order, Lead Time, etc.

## Relevant Files
Use these files to complete the chore:

- **app/inventory/page.tsx** - Main inventory list page with KPI cards, filter tabs, and product table headers. Contains user-facing labels for "Total Products", "Low Stock Items", "Out of Stock Items", table columns for "Stock Available / Total", "Status" badges.

- **app/inventory/stores/page.tsx** - Store-level inventory overview page with store cards showing "Total Products", "Low Stock", "Critical Stock" labels and navigation elements.

- **src/components/inventory-detail-view.tsx** - Detailed product view showing stock breakdown cards with labels like "Available Stock", "Reserved Stock", "Safety Stock", "Total Stock", "Stock by Location" section headers, and tooltip descriptions.

- **src/components/side-nav.tsx** - Navigation menu with "Inventory" label (line 27-29).

- **src/components/recent-transactions-table.tsx** - Transaction history table with column headers "Date & Time", "Type", "Channel", "Quantity", "Available", "Location", "Notes" and transaction type labels "Stock In", "Stock Out", "Adjustment", "Return".

- **src/types/inventory.ts** - TypeScript type definitions containing field names and JSDoc comments for:
  - `InventoryStatus` type
  - `StockStatus` type (stock, in_process, sold, on_hold, pending)
  - `StockLocation` interface with field names (stockAvailable, stockInProcess, stockSold, stockOnHold, stockPending)
  - `InventoryItem` interface with field names (currentStock, availableStock, reservedStock, safetyStock, reorderPoint)
  - `TransactionType` type (stock_in, stock_out, adjustment, return)
  - `StockTransaction` interface with field names

### New Files
None - this is a terminology validation and correction exercise on existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Audit Current Terminology
- Review all user-facing labels in `app/inventory/page.tsx`
- Review all user-facing labels in `app/inventory/stores/page.tsx`
- Review stock breakdown terminology in `src/components/inventory-detail-view.tsx`
- Review transaction terminology in `src/components/recent-transactions-table.tsx`
- Review navigation labels in `src/components/side-nav.tsx`
- Document all current terminology in a comparison table

### 2. Compare Against Industry Standards
- Map current terminology to standard inventory management terms:
  - SKU (Stock Keeping Unit) → `productId`?
  - Available Stock → `availableStock` ✓
  - Reserved/Allocated Stock → `reservedStock` ✓
  - Safety Stock → `safetyStock` ✓
  - Reorder Point → `reorderPoint` ✓
  - Stock on Hand → `currentStock`?
  - In Transit → (not present)
  - Back Order → (not present)
  - Lead Time → (not present)
- Identify gaps, inconsistencies, or non-standard usage
- Check if technical internal names (e.g., `stockInProcess`, `stockSold`) are exposed to users

### 3. Identify Terminology Issues
- Flag any confusing or non-standard labels
- Flag any inconsistency between UI labels and type definitions
- Flag any missing standard inventory terms
- Identify where internal field names are exposed instead of user-friendly labels
- Check for consistency across pages (inventory list vs detail view vs store view)

### 4. Propose Standardized Alternatives
- Create a terminology mapping document showing:
  - Current term → Recommended term → Rationale
- Ensure consistency across all components
- Align tooltip descriptions with industry-standard definitions
- Ensure table headers use clear, standard terminology
- Consider localization readiness (avoid jargon where simpler terms work)

### 5. Create Terminology Standards Document
- Document recommended terminology in a new file `docs/inventory-terminology-standards.md`
- Include:
  - Standard term definitions
  - UI label recommendations
  - When to use technical vs user-friendly terms
  - Consistency guidelines
  - Examples of correct usage
  - Glossary of inventory management terms

### 6. Update Type Definitions Documentation
- Review and update JSDoc comments in `src/types/inventory.ts`
- Ensure field names align with industry standards
- Add clear descriptions using standard terminology
- Document any custom terms and their relationship to standard terms

### 7. Document Findings and Recommendations
- Create a summary report of:
  - Current terminology audit results
  - Identified issues and inconsistencies
  - Recommended changes with priority (critical, high, medium, low)
  - Implementation impact analysis
  - Migration plan if changes are significant

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# Verify all files are accessible and unchanged (we're only documenting)
git status

# Search for key terminology usage across the codebase
grep -r "Available Stock" app/ src/components/
grep -r "Reserved Stock" app/ src/components/
grep -r "Safety Stock" app/ src/components/
grep -r "currentStock" src/types/
grep -r "availableStock" src/types/
grep -r "reservedStock" src/types/

# Verify the new documentation exists
ls -la docs/inventory-terminology-standards.md

# Count instances of key terms to ensure consistency
grep -r "Total Stock" app/ src/components/ | wc -l
grep -r "Total Products" app/ src/components/ | wc -l
grep -r "Low Stock" app/ src/components/ | wc -l
```

## Notes

### Current Terminology Analysis (Preliminary)

**Positive findings (already standard):**
- ✓ "Available Stock" - industry standard term
- ✓ "Reserved Stock" - industry standard (also called "Allocated")
- ✓ "Safety Stock" - industry standard term
- ✓ "Reorder Point" - industry standard term
- ✓ "Stock In" / "Stock Out" - standard transaction terminology

**Potential issues to investigate:**
- "Total Stock" vs "Stock on Hand" - which is clearer?
- "Out of Stock" vs "Critical Stock" - consistency between pages
- "Low Stock Items" vs "Low Stock" - redundant "Items"?
- "Stock by Location" vs "Stock by Warehouse" - is "Location" clear?
- `stockInProcess` exposed in UI vs "In Process" - should be "In Picking" or "Allocated"?
- "Barcode" vs "SKU" - are these used interchangeably?
- Missing "Lead Time" concept in data model
- Missing "In Transit" status for incoming stock
- Missing "Back Order" status for customer orders

**Status terminology consistency:**
- Page-level: "In Stock", "Low Stock", "Out of Stock"
- Store-level: uses counts rather than statuses
- Detail-level: "Available", "Reserved", "Safety Stock", "Total Stock"
- Need to ensure consistent language across all levels

**Type definition field names:**
- Most field names follow camelCase convention ✓
- Field names are descriptive and clear ✓
- JSDoc comments need enhancement for standard term definitions
- Consider if `currentStock` should be `stockOnHand` for clarity

This is a **documentation and analysis** chore - no code changes should be made, only analysis and recommendations documented.
