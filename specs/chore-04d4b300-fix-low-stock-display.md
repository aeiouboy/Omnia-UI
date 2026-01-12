# Chore: Fix Low Stock Data Display Issue

## Metadata
adw_id: `04d4b300`
prompt: `Fix the Low Stock data display issue on the Inventory Management page. Current problem: Low Stock items show high available stock values like 54/67, 52/67, 44/56 which is confusing - low stock items should have LOW available stock. Issues to fix: 1) In src/lib/mock-inventory-data.ts, update the mock data generation for 'low' status items to have realistically LOW availableStock values (e.g., 5-15% of maxStockLevel, not 70-80%). For example, a low stock item should show 8/100 or 12/150, not 54/67. 2) Ensure safetyStock is set to a realistic threshold (typically 15-20% of maxStockLevel). 3) In app/inventory/page.tsx, fix the stock indicator icon to show amber/yellow warning icon for Low Stock items instead of green 'In stock' icon. The icon in the 'Stock Available / Total' column should match the Status column - if status is 'Low Stock', the icon should also indicate low/warning state, not 'In stock'. Reference src/types/inventory.ts for status determination rules: low status means 0 < availableStock <= safetyStock.`

## Chore Description
Fix the Low Stock data display issue on the Inventory Management page where Low Stock items incorrectly show high available stock values (like 54/67, 52/67, 44/56) instead of realistically low values that properly reflect the low stock status. The issue involves three main problems:

1. **Mock data inconsistency**: Low stock items in mock data have unrealistically high available stock values (70-80% of max capacity) instead of truly low values (5-15% of max capacity)
2. **Safety stock thresholds**: Safety stock levels need to be set to realistic industry-standard values (15-20% of max stock level)
3. **Visual indicator mismatch**: The stock availability indicator shows green "In stock" icon for Low Stock items instead of amber/yellow warning icon that matches the status

This creates confusing UX where items marked as "Low Stock" appear to have abundant inventory, contradicting the status label.

## Relevant Files
Use these files to complete the chore:

- **src/lib/mock-inventory-data.ts** - Contains mock inventory data generation logic that needs updating for low stock items to have realistically low availableStock values and proper safetyStock thresholds
- **src/types/inventory.ts** - Contains status determination rules (low status = 0 < availableStock <= safetyStock) that need to be verified and referenced for proper implementation
- **src/components/inventory/stock-availability-indicator.tsx** - Stock indicator component that needs modification to show warning state for low stock items
- **app/inventory/page.tsx** - Main inventory page that uses the StockAvailabilityIndicator component and displays stock status information

### New Files
No new files need to be created for this chore.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Fix Mock Data Generation Logic for Low Stock Items
- Open `src/lib/mock-inventory-data.ts`
- Identify low stock items in `mockInventoryItemsBase` array (items with `status: "low"`)
- Update each low stock item's `availableStock` to be realistically low (5-15% of `maxStockLevel`)
- Update `safetyStock` to be 15-20% of `maxStockLevel` for consistency
- Ensure `currentStock` is correctly calculated as `availableStock + reservedStock`
- Verify the status determination logic aligns with rules in `src/types/inventory.ts`

### 2. Update Stock Availability Indicator Component
- Open `src/components/inventory/stock-availability-indicator.tsx`
- Modify the component to accept a new prop for stock status or low stock threshold
- Add logic to display amber/yellow warning icon when stock is low but not critical
- Update the existing logic that shows green for "in stock" and red for "out of stock" to include yellow/amber for "low stock"
- Ensure proper accessibility labels for the warning state

### 3. Update Inventory Page to Pass Status Information
- Open `app/inventory/page.tsx`
- Locate where `StockAvailabilityIndicator` is used (around line 586)
- Pass additional props to the indicator component to determine if item is in low stock state
- Ensure the visual indicator matches the status badge shown in the Status column

### 4. Validate Status Determination Logic
- Open `src/types/inventory.ts`
- Review the status determination rules documented in comments (lines 17-21)
- Ensure all updated mock data follows the rule: low status means `0 < availableStock <= safetyStock`
- Verify that safety stock thresholds are properly set to industry standards (15-20% of max stock)

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run dev` - Start development server to test the inventory page visually
- `npm run build` - Build the application to ensure no TypeScript errors
- `npm run lint` - Run linting to ensure code quality standards
- Navigate to `http://localhost:3000/inventory` in browser and verify:
  - Low Stock items show truly low available stock values (e.g., 8/100, 12/150)
  - Low Stock items display amber/yellow warning icon in the "Stock Available / Total" column
  - Status badges and stock indicators are visually consistent
  - Safety stock levels follow 15-20% of max stock level guideline

## Notes
- The inventory status determination follows the rule: `low status = 0 < availableStock <= safetyStock`
- Industry standard for safety stock is typically 15-20% of maximum stock level
- Current mock data has items like "Fresh Tomatoes" (INV-003), "Organic Milk 1L" (INV-004), "Fresh Salmon Fillet 500g" (INV-012), "Ice Cream Variety Pack" (INV-017), and "Toilet Paper 12 Pack" (INV-024) marked as low stock but with unrealistically high available stock values
- The visual indicator should provide immediate visual feedback that matches the textual status to avoid user confusion