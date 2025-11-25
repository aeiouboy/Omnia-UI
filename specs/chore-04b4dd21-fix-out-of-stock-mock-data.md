# Chore: Fix Mock Inventory Data for Out of Stock Items

## Metadata
adw_id: `04b4dd21`
prompt: `Fix mock inventory data to accurately reflect out of stock items. The issue is that items marked as 'Out of Stock' status are showing misleading Available/Quantity numbers (like 50/100) when they should show 0/0. Find all inventory items in mock data with status 'Out of Stock' or 'Critical' and update their stock values to be accurate: currentStock should be 0 or very low (1-5), availableStock should be 0, reservedStock should be 0 or match what's allocated. Ensure the mock data accurately represents real inventory scenarios - out of stock means no stock available. Also fix any other inconsistencies where stock numbers don't match the status label.`

## Chore Description

The inventory system displays items with "critical" status as "Out of Stock" in the UI (`app/inventory/page.tsx` line 71), but the mock data in `src/lib/mock-inventory-data.ts` contains items with "critical" status that have misleadingly high stock values:

**Current Issues:**
- INV-007 (Whole Wheat Bread): status "critical" but currentStock: 45, availableStock: 32
- INV-011 (Beef Sirloin): status "critical" but currentStock: 38, availableStock: 25
- INV-021 (Mixed Nuts): status "critical" but currentStock: 43, availableStock: 28

These items are labeled "Out of Stock" in the UI but show substantial stock quantities (45/100, 38/150, 43/150), which is misleading and inaccurate.

**Expected Behavior:**
For items with "critical" status (displayed as "Out of Stock"):
- `currentStock` should be 0 or very low (1-5 units)
- `availableStock` should be 0
- `reservedStock` should be 0 or match allocated quantities
- Stock calculations should be consistent: `reservedStock = currentStock - availableStock`

## Relevant Files

- **`src/lib/mock-inventory-data.ts`** (lines 37-585) - Contains the `mockInventoryItems` array with 24 inventory items. This is the primary file to fix. Items with "critical" status need stock values updated to accurately reflect out-of-stock scenarios.

- **`app/inventory/page.tsx`** (lines 64-75) - Contains the `getStatusLabel` function that maps "critical" status to "Out of Stock" label. This file does NOT need changes, it's just for understanding the UI labeling.

- **`src/types/inventory.ts`** (lines 42-67) - Defines the `InventoryItem` interface with stock field relationships. Used for validation of our changes.

- **`src/lib/inventory-service.ts`** (lines 48-78) - Contains the `convertDBItemToInventoryItem` function that calculates `reservedStock` and `safetyStock`. Useful for understanding the calculation logic.

## Step by Step Tasks

### 1. Analyze Current Critical Stock Items
- Review all items with `status: "critical"` in `mockInventoryItems`
- Document current stock values vs. expected values for out-of-stock items
- Identify all inconsistencies where stock numbers don't match status

### 2. Update INV-007 (Whole Wheat Bread)
- Change `currentStock` from 45 to 2 (almost out of stock)
- Change `availableStock` from 32 to 0 (none available for sale)
- Change `reservedStock` from 13 to 2 (2 units allocated, matching currentStock - availableStock)
- Keep `minStockLevel: 30` (unchanged - this is the target minimum)
- Keep `maxStockLevel: 100` (unchanged)
- Keep `reorderPoint: 40` (unchanged)
- Verify calculations: reservedStock (2) = currentStock (2) - availableStock (0) ✓

### 3. Update INV-011 (Beef Sirloin)
- Change `currentStock` from 38 to 3 (almost out of stock)
- Change `availableStock` from 25 to 0 (none available for sale)
- Change `reservedStock` from 13 to 3 (3 units allocated, matching currentStock - availableStock)
- Keep `minStockLevel: 40` (unchanged)
- Keep `maxStockLevel: 150` (unchanged)
- Keep `reorderPoint: 50` (unchanged)
- Verify calculations: reservedStock (3) = currentStock (3) - availableStock (0) ✓

### 4. Update INV-021 (Mixed Nuts)
- Change `currentStock` from 43 to 1 (almost out of stock)
- Change `availableStock` from 28 to 0 (none available for sale)
- Change `reservedStock` from 15 to 1 (1 unit allocated, matching currentStock - availableStock)
- Keep `minStockLevel: 40` (unchanged)
- Keep `maxStockLevel: 150` (unchanged)
- Keep `reorderPoint: 50` (unchanged)
- Verify calculations: reservedStock (1) = currentStock (1) - availableStock (0) ✓

### 5. Verify Low Stock Items Are Accurate
- Review all items with `status: "low"` to ensure stock values are above critical but below reorder point
- Check that "low" status items have stock values that make sense:
  - INV-003 (Fresh Tomatoes): currentStock: 67, minStockLevel: 50, reorderPoint: 80 ✓ (below reorder point but above min)
  - INV-004 (Organic Milk): currentStock: 78, minStockLevel: 50, reorderPoint: 80 ✓ (just below reorder point)
  - INV-012 (Fresh Salmon): currentStock: 67, minStockLevel: 50, reorderPoint: 60 ✓ (slightly above reorder point but still low)
  - INV-017 (Ice Cream): currentStock: 56, minStockLevel: 40, reorderPoint: 60 ✓ (just below reorder point)
  - INV-024 (Toilet Paper): currentStock: 62, minStockLevel: 60, reorderPoint: 80 ✓ (just above min, well below reorder)
- Ensure no changes needed for "low" status items

### 6. Validate Stock Calculation Consistency
- For ALL 24 items in `mockInventoryItems`, verify:
  - `reservedStock = currentStock - availableStock` (must be exact)
  - `availableStock <= currentStock` (available can't exceed total)
  - `reservedStock >= 0` (can't have negative reservations)
  - `safetyStock = Math.round(maxStockLevel * 0.15)` (15% of max, as per comment)
- Document any inconsistencies found beyond the critical items

### 7. Test Data Integrity
- Read the updated file to verify all changes are correct
- Ensure no syntax errors introduced
- Verify TypeScript types are satisfied
- Confirm all comments and documentation remain accurate

### 8. Validate in UI
- Start the development server with `pnpm dev`
- Navigate to the Inventory page (`http://localhost:3000/inventory`)
- Filter by "Critical" status items
- Verify "Out of Stock" items show 0 available stock (Available/Quantity like 0/2, 0/3, 0/1)
- Verify stock values accurately represent out-of-stock scenarios
- Check that "Low Stock" items still show appropriate values

## Validation Commands

Execute these commands to validate the chore is complete:

```bash
# 1. Verify TypeScript compilation
pnpm run build

# 2. Check for linting errors
pnpm run lint

# 3. Start development server and manually test
pnpm dev
# Then navigate to http://localhost:3000/inventory
# Filter by "Critical" status and verify stock values

# 4. Verify file syntax (read the file)
cat src/lib/mock-inventory-data.ts | head -n 600
```

## Notes

### Stock Status Logic
Based on the code analysis, here's how stock status should be interpreted:
- **"healthy"**: Stock is above reorder point and sufficient
- **"low"**: Stock is below reorder point but above minimum level (needs restocking soon)
- **"critical"**: Stock is at or near minimum level (displayed as "Out of Stock" in UI)

### Real-World Scenarios for Critical Stock
Critical stock items should represent realistic scenarios:
- **0 units**: Completely out of stock, no inventory
- **1-5 units**: Almost depleted, critical reorder needed
- **Reserved Stock**: May have small quantities reserved for existing orders even when out of stock

### Key Calculation Rules
From `inventory-service.ts` line 63:
```typescript
reservedStock = currentStock - availableStock
```

From `inventory-service.ts` line 65:
```typescript
safetyStock = Math.round(maxStockLevel * 0.15)  // 15% of max
```

### Items to Update Summary
| Item ID | Product Name | Old Current | New Current | Old Available | New Available | Old Reserved | New Reserved |
|---------|--------------|-------------|-------------|---------------|---------------|--------------|--------------|
| INV-007 | Whole Wheat Bread | 45 | 2 | 32 | 0 | 13 | 2 |
| INV-011 | Beef Sirloin | 38 | 3 | 25 | 0 | 13 | 3 |
| INV-021 | Mixed Nuts | 43 | 1 | 28 | 0 | 15 | 1 |

This ensures "Out of Stock" items truly reflect critical inventory levels with minimal or no available stock.
