# Chore: Fix Inventory Terminology Inconsistencies

## Metadata
adw_id: `df75b9e8`
prompt: `Fix inventory terminology inconsistencies identified during UI validation: 1) In app/inventory/stores/page.tsx - change 'Critical Stock' to 'Out of Stock' in all KPI cards and filter buttons to match main inventory page terminology, 2) In src/components/inventory-detail-view.tsx Stock by Location cards - change abbreviated 'Available' to 'Available Stock' and 'Reserved' to 'Reserved Stock' for consistency with Stock Breakdown section, 3) In app/inventory/page.tsx KPI cards - remove redundant 'Items' suffix from 'Low Stock Items' and 'Out of Stock Items' labels, 4) Update table column header 'Type' to 'Item Type' in app/inventory/page.tsx for clarity, 5) Create docs/inventory-terminology-standards.md documenting the standardized terminology including: status labels (In Stock, Low Stock, Out of Stock), stock types (Available Stock, Reserved Stock, Safety Stock, Total Stock), transaction types (Stock In, Stock Out, Adjustment, Return), and usage guidelines for consistent implementation across all inventory components.`

## Chore Description

This chore standardizes inventory terminology across all inventory-related components to ensure consistent user experience and reduce confusion. The changes address inconsistencies identified during UI validation testing where the same concepts were labeled differently in different parts of the application.

### Key Issues to Fix:
1. **Store-level page inconsistency**: "Critical Stock" terminology on stores page doesn't match "Out of Stock" used on main inventory page
2. **Location-level abbreviations**: Stock by Location cards use abbreviated labels ("Available", "Reserved") while Stock Breakdown section uses full labels ("Available Stock", "Reserved Stock")
3. **Redundant suffixes**: KPI cards include unnecessary "Items" suffix in labels
4. **Ambiguous column header**: Table header "Type" is unclear and should be "Item Type"
5. **Missing documentation**: No central source of truth for terminology standards

### Standards to Establish:
- **Status Labels**: In Stock, Low Stock, Out of Stock
- **Stock Types**: Available Stock, Reserved Stock, Safety Stock, Total Stock
- **Transaction Types**: Stock In, Stock Out, Adjustment, Return
- **Usage Guidelines**: Clear rules for when to use abbreviated vs. full labels

## Relevant Files

### Files to Modify:

- **app/inventory/stores/page.tsx** (lines 69-70, 229-235, 272)
  - Update "Critical Stock" to "Out of Stock" in summary state variables
  - Update KPI card title "Stores with Critical Stock" to "Stores with Out of Stock"
  - Update filter button label from "Critical Stock" to "Out of Stock"

- **app/inventory/page.tsx** (lines 344-363, 442)
  - Remove "Items" suffix from "Low Stock Items" to "Low Stock" in KPI card title (line 344)
  - Remove "Items" suffix from "Out of Stock Items" to "Out of Stock" in KPI card title (line 355)
  - Update table column header "Type" to "Item Type" (line 442)

- **src/components/inventory-detail-view.tsx** (lines 648-655)
  - Update Stock by Location card labels from "Available" to "Available Stock"
  - Update Stock by Location card labels from "Reserved" to "Reserved Stock"
  - Ensure consistency with Stock Breakdown section terminology (lines 329, 359)

### New Files:

#### docs/inventory-terminology-standards.md
A comprehensive reference document that:
- Defines all standardized inventory terminology
- Provides usage guidelines and examples
- Establishes rules for abbreviated vs. full labels
- Documents status labels, stock types, and transaction types
- Serves as single source of truth for future development
- Includes cross-references to implementation locations

## Step by Step Tasks

### 1. Fix Store Page Terminology (app/inventory/stores/page.tsx)

- Update state variable `totalCriticalStock` to `totalOutOfStock` on line 69
- Update the calculation filter from `criticalStockItems` to `outOfStockItems` on line 69
- Update KPI card title from "Stores with Critical Stock" to "Stores with Out of Stock" on line 229
- Update KPI card value reference from `summary.totalCriticalStock` to `summary.totalOutOfStock` on line 233
- Update filter button label from "Critical Stock" to "Out of Stock" on line 272
- Ensure filter logic correctly filters stores with `criticalStockItems > 0` (internal model can remain as is)

### 2. Fix Main Inventory Page KPI Labels (app/inventory/page.tsx)

- Remove "Items" suffix from KPI card title "Low Stock Items" → "Low Stock" on line 344
- Remove "Items" suffix from KPI card title "Out of Stock Items" → "Out of Stock" on line 355
- Update table column header from "Type" to "Item Type" on line 442
- Verify all label changes maintain alignment with the card layout

### 3. Fix Inventory Detail View Stock Labels (src/components/inventory-detail-view.tsx)

- Update Stock by Location card label from "Available" to "Available Stock" on line 648
- Update Stock by Location card label from "Reserved" to "Reserved Stock" on line 653
- Ensure labels match the Stock Breakdown section terminology:
  - Stock Breakdown uses "Available Stock" (line 329)
  - Stock Breakdown uses "Reserved Stock" (line 359)
  - Stock Breakdown uses "Safety Stock" (line 389)
  - Stock Breakdown uses "Total Stock" (line 419)
- Verify visual consistency and alignment after label changes

### 4. Create Inventory Terminology Standards Documentation

Create `docs/inventory-terminology-standards.md` with the following sections:

- **Introduction**: Purpose and scope of the terminology standards
- **Status Labels**:
  - In Stock (healthy status)
  - Low Stock (low status)
  - Out of Stock (critical status)
- **Stock Type Labels**:
  - Available Stock: Stock ready for sale to customers
  - Reserved Stock: Stock allocated to pending orders
  - Safety Stock: Minimum buffer quantity to prevent stockouts
  - Total Stock: Combined available and reserved stock
- **Location Labels**:
  - When to use full labels vs. abbreviated labels
  - Rules: Use full labels in detail views and primary sections; abbreviated labels acceptable in compact card layouts only with clear context
- **Transaction Type Labels**:
  - Stock In: Incoming inventory
  - Stock Out: Outgoing inventory
  - Adjustment: Manual stock corrections
  - Return: Customer returns
- **Usage Guidelines**:
  - Consistency rules across components
  - When abbreviations are acceptable
  - Color coding standards for different stock types
- **Implementation References**:
  - List all files using these terms with line references
  - Note where exceptions exist and why
- **Future Considerations**:
  - How to maintain consistency in new features
  - Review process for terminology changes

### 5. Validate Changes Across All Inventory Components

- Load the Store by Store page (`/inventory/stores`) and verify:
  - KPI card shows "Stores with Out of Stock" instead of "Stores with Critical Stock"
  - Filter button shows "Out of Stock" instead of "Critical Stock"
  - All terminology is consistent with main inventory page
- Load the main Inventory page (`/inventory`) and verify:
  - KPI cards show "Low Stock" and "Out of Stock" without "Items" suffix
  - Table column header shows "Item Type" instead of "Type"
  - Tab labels use "Out of Stock" terminology
- Load an Inventory Detail page (`/inventory/[id]`) and verify:
  - Stock Breakdown section uses full labels (Available Stock, Reserved Stock, Safety Stock, Total Stock)
  - Stock by Location cards use full labels matching Stock Breakdown
  - All tooltip descriptions align with terminology standards
- Review the new documentation file and verify:
  - All terminology is clearly defined
  - Usage guidelines are comprehensive
  - Implementation references are accurate

### 6. Final Cross-Component Consistency Check

- Search codebase for any remaining instances of old terminology:
  - Search for "Critical Stock" (should only exist as internal model property `criticalStockItems`)
  - Search for standalone "Available" and "Reserved" in inventory context (should be "Available Stock" and "Reserved Stock")
  - Search for "Low Stock Items" and "Out of Stock Items" with suffix (should be removed from UI labels)
- Verify internal variable names remain unchanged (only UI labels should change)
- Confirm documentation accurately reflects all implemented changes
- Test responsive layouts to ensure longer labels don't break UI on mobile/tablet

## Validation Commands

Execute these commands to validate the chore is complete:

- `grep -n "Critical Stock" app/inventory/stores/page.tsx` - Should only appear in comments or be replaced with "Out of Stock"
- `grep -n "Low Stock Items" app/inventory/page.tsx` - Should be replaced with "Low Stock" in KPI card title
- `grep -n "Out of Stock Items" app/inventory/page.tsx` - Should be replaced with "Out of Stock" in KPI card title
- `grep -n '"Type"' app/inventory/page.tsx` - Should be replaced with "Item Type" in table header
- `grep -n '"Available"' src/components/inventory-detail-view.tsx` - Should be "Available Stock" in Stock by Location cards
- `grep -n '"Reserved"' src/components/inventory-detail-view.tsx` - Should be "Reserved Stock" in Stock by Location cards
- `test -f docs/inventory-terminology-standards.md && echo "Documentation exists"` - Should confirm file exists
- `npm run dev` - Start development server and manually test all three inventory pages
- `npm run build` - Build should complete without errors or warnings related to changed labels

## Notes

### Important Considerations:

1. **Internal vs. Display Names**: Internal variable names like `criticalStockItems` should remain unchanged to avoid breaking logic. Only UI-facing labels should be updated.

2. **Backward Compatibility**: These are purely UI label changes and should not affect any API contracts, database schemas, or business logic.

3. **Documentation as Source of Truth**: The new `docs/inventory-terminology-standards.md` should be referenced in `CLAUDE.md` as the canonical reference for inventory terminology.

4. **Responsive Design**: Longer labels like "Available Stock" vs. "Available" may affect compact layouts. Verify cards still look good on mobile (375px), tablet (768px), and desktop (1024px+) viewports.

5. **Accessibility**: Ensure full labels improve clarity for screen readers and users with cognitive disabilities.

6. **Future Enforcement**: Consider adding ESLint rules or code review checklists to catch terminology inconsistencies in future PRs.

### Related Files (Read Only):

- `src/types/inventory.ts` - Type definitions (internal property names remain unchanged)
- `src/lib/inventory-service.ts` - Service layer (no changes needed)
- `src/lib/mock-inventory-data.ts` - Mock data (internal properties unchanged)
- `docs/inventory-terminology-audit-summary.md` - Original audit findings (reference only)
