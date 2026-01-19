# Chore: Analyze Inventory Supply Page Filter Logic

## Metadata
adw_id: `0c4c43fd`
prompt: `Analyze and document the search/filter logic on the Inventory Supply page (app/inventory-new/supply/page.tsx). Understand how data is displayed when users search: (1) By Store ID or Store Name - should display all products under that store matching the selected View Type, (2) By Item ID or Product Name - should display that product across all stores that have it. Document the current filtering implementation, identify any gaps between expected vs actual behavior, and propose improvements if the current logic doesn't match these requirements.`

## Chore Description
This chore involves a detailed analysis of the Inventory Supply page's search and filter functionality. The page allows users to filter inventory data using multiple criteria including Store ID, Store Name, Item ID, Product Name, Supply Type, and View Type.

The expected filtering behavior is:
1. **Store-based search** (Store ID or Store Name): Display all products available at that store location, filtered by the selected View Type
2. **Product-based search** (Item ID or Product Name): Display that specific product across all stores that carry it

The analysis will document the current implementation, identify any gaps between expected and actual behavior, and propose improvements if needed.

## Relevant Files
Use these files to complete the chore:

- **`app/inventory-new/supply/page.tsx`** - Primary file containing the Inventory Supply page implementation with all filter logic in the `filteredData` useMemo hook (lines 92-148)
- **`src/lib/inventory-service.ts`** - Service layer that fetches inventory data with `fetchInventoryData()` function
- **`src/types/inventory.ts`** - TypeScript type definitions for `InventoryItem`, `InventoryFilters`, and related types
- **`src/lib/mock-inventory-data.ts`** - Mock data source containing sample inventory items with store and product information

## Current Implementation Analysis

### Filter State Variables (lines 47-53)
```typescript
const [storeId, setStoreId] = useState("")
const [storeName, setStoreName] = useState("")
const [itemId, setItemId] = useState("")
const [productName, setProductName] = useState("")
const [supplyType, setSupplyType] = useState<string>("all")
const [viewType, setViewType] = useState<string>("all")
```

### Filter Logic (lines 92-148)
The current implementation uses a `useMemo` hook with an **AND-based filter chain**:

```typescript
const filteredData = useMemo(() => {
    let filtered = data.filter(item => {
        // Store ID (Location ID) Filter - substring match
        if (storeId && (!item.storeId || !item.storeId.toLowerCase().includes(storeId.toLowerCase()))) {
            return false
        }

        // Store Name Filter - substring match
        if (storeName && (!item.storeName || !item.storeName.toLowerCase().includes(storeName.toLowerCase()))) {
            return false
        }

        // Item ID Filter - substring match
        if (itemId && !item.productId.toLowerCase().includes(itemId.toLowerCase())) {
            return false
        }

        // Product Name Filter - substring match
        if (productName && (!item.productName || !item.productName.toLowerCase().includes(productName.toLowerCase()))) {
            return false
        }

        // Supply Type Filter - exact match
        if (supplyType !== "all" && item.supplyType !== supplyType) {
            return false
        }

        // View Type Filter (Strict) - exact match
        if (viewType !== "all" && item.view !== viewType) {
            return false
        }

        return true
    })
    // ... sorting logic follows
}, [data, storeId, storeName, itemId, productName, supplyType, viewType, sortField, sortOrder])
```

### Current Behavior Analysis

**Scenario 1: Store-based Search**
- User enters Store ID "CDS" or Store Name "Chidlom"
- **Current behavior**: Shows all products that match the store criteria AND the View Type (if selected)
- **Expected behavior**: Same - show all products under that store matching the View Type
- **Status**: MATCHES REQUIREMENTS

**Scenario 2: Product-based Search**
- User enters Item ID "SKU-001" or Product Name "Nintendo"
- **Current behavior**: Shows all inventory records that match the product criteria across all stores
- **Expected behavior**: Same - show that product across all stores that have it
- **Status**: MATCHES REQUIREMENTS

**Scenario 3: Combined Store + Product Search**
- User enters both Store Name "Tops" AND Product Name "Switch"
- **Current behavior**: Shows only items that match BOTH criteria (intersection/AND logic)
- **Expected behavior**: This is ambiguous in requirements but AND logic is reasonable
- **Status**: WORKING AS DESIGNED (AND logic is standard behavior)

### Findings Summary

The current filter implementation **correctly handles both scenarios** described in the requirements:

1. **Store-based filtering** correctly displays all products at a store when users search by Store ID or Store Name
2. **Product-based filtering** correctly displays a product across all stores when users search by Item ID or Product Name
3. **View Type filter** is applied as an additional AND condition in both scenarios

### Identified Considerations (Not Gaps)

| Aspect | Current Behavior | Notes |
|--------|------------------|-------|
| Filter Combination | AND logic | All filters must match. This is standard UX. |
| Case Sensitivity | Case-insensitive | Uses `.toLowerCase()` for all text comparisons |
| Match Type | Substring (contains) | Uses `.includes()` - partial matches work |
| View Type | Strict match | Only shows items with exact `view` field match |
| Empty Fields | Handled | Checks for null/undefined before comparison |

### Potential Enhancements (Optional)

1. **Filter Indicator UI**: Add visual feedback showing which filters are active
2. **Quick Filter Presets**: Add preset buttons for common filter combinations
3. **Filter Persistence**: Save filter state to URL params for shareable links
4. **Search Debouncing**: Add debounce to text inputs to reduce filtering frequency

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Review Current Filter Implementation
- Read `app/inventory-new/supply/page.tsx` to understand current filter logic
- Document filter state variables and their types
- Trace the filtering flow in the `filteredData` useMemo hook

### 2. Test Store-Based Search Scenario
- Verify that searching by Store ID shows all products at that store
- Verify that searching by Store Name shows all products at that store
- Confirm View Type filter works in combination with store filters

### 3. Test Product-Based Search Scenario
- Verify that searching by Item ID shows that product across all stores
- Verify that searching by Product Name shows that product across all stores
- Confirm View Type filter works in combination with product filters

### 4. Document Filter Behavior Matrix
- Create a table documenting all filter combinations and their behavior
- Identify any edge cases or unexpected behaviors

### 5. Validate Implementation Against Requirements
- Compare current behavior with expected behavior from requirements
- Document any gaps or discrepancies found
- Propose improvements if gaps exist

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the project builds without errors
- `pnpm dev` - Start dev server and manually test filter scenarios at http://localhost:3000/inventory-new/supply

## Notes

### Filter Logic Confirmation

The current implementation in `app/inventory-new/supply/page.tsx` **correctly implements the required behavior**:

1. **Store ID/Name Search** - When a user enters a store identifier, the filter shows all products at that store. The View Type filter further narrows results to products matching the selected view configuration.

2. **Item ID/Product Name Search** - When a user enters a product identifier, the filter shows all inventory records for that product across all stores that carry it.

3. **Combined Filters** - All filters work together using AND logic, which is the expected standard behavior for multi-filter interfaces.

### No Code Changes Required

After thorough analysis, the current filter implementation matches the requirements. The filtering logic correctly handles both store-based and product-based searches, and the View Type filter integrates properly with all other filters.

### Data Model Note

The filter works correctly because each `InventoryItem` contains:
- `storeId` - Store/location identifier
- `storeName` - Human-readable store name
- `productId` - Product/SKU identifier (mapped to "Item ID" in UI)
- `productName` - Human-readable product name
- `supplyType` - "On Hand Available" or "Pre-Order"
- `view` - View type configuration code (e.g., "ECOM-TH-CFR-LOCD-STD")

This structure allows independent filtering by store and by product, with each inventory record representing a unique store-product combination.
