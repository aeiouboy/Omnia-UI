# Chore: Fix Order Type System - CRITICAL CORRECTION

## Metadata
adw_id: `ae72224b`
prompt: `Fix Order Type system - CRITICAL CORRECTION: The Order Type field should ONLY contain these 7 values (nothing else): 1. Return Order, 2. MKP-HD-STD, 3. RT-HD-EXP, 4. RT-CC-STD, 5. RT-MIX-STD, 6. RT-HD-STD, 7. RT-CC-EXP. REMOVE incorrect values ('Large format', 'Tops daily CFR', 'Tops daily CFM', 'Subscription', 'Retail') from FMSOrderType. Merge DeliveryTypeCode into OrderType.`

## Chore Description

This is a **critical system correction** to consolidate the Order Type taxonomy. The current implementation incorrectly uses two separate type systems:

1. **FMSOrderType** (line 173 in order-management-hub.tsx): Contains incorrect legacy values like 'Large format', 'Tops daily CFR', 'Tops daily CFM', 'Subscription', 'Retail', 'Return Order'

2. **DeliveryTypeCode** (line 182 in order-management-hub.tsx): Contains the correct delivery type codes: 'RT-HD-EXP', 'RT-CC-STD', 'MKP-HD-STD', 'RT-HD-STD', 'RT-CC-EXP', 'RT-MIX-STD'

The correct Order Type values should be:
| Order Type | Description | Badge Color |
|------------|-------------|-------------|
| Return Order | Return/refund orders | Red/Pink |
| MKP-HD-STD | Marketplace Home Delivery Standard | Purple |
| RT-HD-EXP | Retail Home Delivery Express | Orange |
| RT-CC-STD | Retail Click & Collect Standard | Green |
| RT-MIX-STD | Retail Mixed Delivery Standard | Teal |
| RT-HD-STD | Retail Home Delivery Standard | Blue |
| RT-CC-EXP | Retail Click & Collect Express | Amber |

The task is to:
1. Replace FMSOrderType with the 7 correct values (removing legacy values)
2. Merge DeliveryTypeCode functionality into OrderType (single unified type system)
3. Update OrderTypeBadge to display all 7 values with correct colors
4. Update filter dropdowns to show the 7 correct values
5. Update mock data generator to use only these 7 types
6. Deprecate/remove DeliveryTypeCode as a separate system
7. Update CLAUDE.md documentation

## Relevant Files

### Files to Modify

- **`src/components/order-management-hub.tsx`** (lines 170-183, 444-451, 2260-2271, 1423-1426)
  - Contains FMSOrderType and DeliveryTypeCode type definitions
  - Contains Order interface with both orderType and deliveryTypeCode fields
  - Contains demo data generator assigning both types
  - Contains Order Type filter dropdown with incorrect values
  - Contains client-side filtering logic using deliveryTypeCode

- **`src/components/order-badges.tsx`** (lines 349-372, 225-295)
  - Contains OrderTypeBadge component with incorrect FMS type colors
  - Contains DeliveryTypeCodeBadge component (to be merged/deprecated)
  - Contains getDeliveryTypeCodeLabel helper function

- **`CLAUDE.md`** (Order Type System section)
  - Documentation showing the incorrect dual-type system
  - Needs to be updated to reflect the unified 7-value system

### Files to Verify (No Changes Expected)

- **`src/components/order-detail-view.tsx`** (line 50)
  - Imports DeliveryTypeCodeBadge - verify it still works after merge

- **`src/lib/mock-data.ts`**
  - Contains order_type field with various values - may need verification

## Step by Step Tasks

### 1. Update FMSOrderType Type Definition
- Open `src/components/order-management-hub.tsx`
- Replace line 173 FMSOrderType definition with:
  ```typescript
  export type FMSOrderType = 'Return Order' | 'MKP-HD-STD' | 'RT-HD-EXP' | 'RT-CC-STD' | 'RT-MIX-STD' | 'RT-HD-STD' | 'RT-CC-EXP'
  ```
- Remove lines 181-182 (DeliveryTypeCode type definition) - mark as deprecated comment
- Add deprecation comment above removed type:
  ```typescript
  // DEPRECATED: DeliveryTypeCode merged into FMSOrderType (chore-ae72224b)
  // export type DeliveryTypeCode = 'RT-HD-EXP' | 'RT-CC-STD' | 'MKP-HD-STD' | 'RT-HD-STD' | 'RT-CC-EXP' | 'RT-MIX-STD'
  ```

### 2. Update Order Interface
- In `src/components/order-management-hub.tsx`, locate the Order interface (around line 257-268)
- Keep orderType field as FMSOrderType
- Add deprecation comment for deliveryTypeCode field:
  ```typescript
  // DEPRECATED: Use orderType instead (chore-ae72224b)
  deliveryTypeCode?: string
  ```

### 3. Update OrderTypeBadge Component
- Open `src/components/order-badges.tsx`
- Replace the typeStyles mapping in OrderTypeBadge (lines 356-363) with:
  ```typescript
  const typeStyles: Record<string, string> = {
    "Return Order": "bg-red-100 text-red-800 border-red-200",
    "MKP-HD-STD": "bg-purple-100 text-purple-800 border-purple-200",
    "RT-HD-EXP": "bg-orange-100 text-orange-800 border-orange-200",
    "RT-CC-STD": "bg-green-100 text-green-800 border-green-200",
    "RT-MIX-STD": "bg-teal-100 text-teal-800 border-teal-200",
    "RT-HD-STD": "bg-blue-100 text-blue-800 border-blue-200",
    "RT-CC-EXP": "bg-amber-100 text-amber-800 border-amber-200",
  }
  ```
- Add semantic icons to match DeliveryTypeCodeBadge pattern
- Import required icons: Undo2 (for Return Order), Truck, Zap, Store, Settings

### 4. Update Mock Data Generator
- In `src/components/order-management-hub.tsx`, locate demo data generator (lines 444-451)
- Update the fmsOrderTypes array to use only the 7 correct values:
  ```typescript
  const fmsOrderTypes: FMSOrderType[] = ['Return Order', 'MKP-HD-STD', 'RT-HD-EXP', 'RT-CC-STD', 'RT-MIX-STD', 'RT-HD-STD', 'RT-CC-EXP']
  // Return orders should be ~10% of total
  demoOrder.orderType = index % 10 === 0 ? 'Return Order' : fmsOrderTypes[(index % 6) + 1]
  ```
- Remove or comment out deliveryTypeCode assignment (line 446)

### 5. Update Order Type Filter Dropdown
- In `src/components/order-management-hub.tsx`, locate the Order Type filter (lines 2260-2272)
- Add missing RT-MIX-STD and Return Order options:
  ```typescript
  <SelectItem value="all-order-type">All Types</SelectItem>
  <SelectItem value="Return Order">Return Order</SelectItem>
  <SelectItem value="MKP-HD-STD">MKP-HD-STD</SelectItem>
  <SelectItem value="RT-HD-EXP">RT-HD-EXP</SelectItem>
  <SelectItem value="RT-CC-STD">RT-CC-STD</SelectItem>
  <SelectItem value="RT-MIX-STD">RT-MIX-STD</SelectItem>
  <SelectItem value="RT-HD-STD">RT-HD-STD</SelectItem>
  <SelectItem value="RT-CC-EXP">RT-CC-EXP</SelectItem>
  ```

### 6. Update Client-Side Filter Logic
- In `src/components/order-management-hub.tsx`, locate filter logic (lines 1423-1426)
- Change filter to use orderType instead of deliveryTypeCode:
  ```typescript
  // Order Type filter
  if (orderTypeFilter && orderTypeFilter !== "all-order-type") {
    if (order.orderType !== orderTypeFilter) {
      return false
    }
  }
  ```

### 7. Deprecate DeliveryTypeCodeBadge Component
- In `src/components/order-badges.tsx`, add deprecation comment above DeliveryTypeCodeBadge:
  ```typescript
  /**
   * @deprecated Use OrderTypeBadge instead. DeliveryTypeCode merged into FMSOrderType (chore-ae72224b)
   */
  ```
- Keep the component for backward compatibility with order-detail-view.tsx

### 8. Update CLAUDE.md Documentation
- Locate the "Order Type System" section in CLAUDE.md
- Replace the entire dual-type documentation with unified system:
  ```markdown
  ### Order Type System

  **UNIFIED ORDER TYPE** - Single taxonomy for order classification:

  The system uses a single Order Type field (FMSOrderType) with 7 values:

  | Order Type | Description | Badge Color | Usage |
  |------------|-------------|-------------|-------|
  | Return Order | Return/refund orders | Red/Pink | ~10% of orders |
  | MKP-HD-STD | Marketplace Home Delivery Standard | Purple | Third-party marketplace |
  | RT-HD-EXP | Retail Home Delivery Express | Orange | Urgent home delivery |
  | RT-CC-STD | Retail Click & Collect Standard | Green | Store pickup |
  | RT-MIX-STD | Retail Mixed Delivery Standard | Teal | Hybrid delivery |
  | RT-HD-STD | Retail Home Delivery Standard | Blue | Standard home delivery |
  | RT-CC-EXP | Retail Click & Collect Express | Amber | Urgent store pickup |

  **Code Format**: `{Platform}-{Method}-{Speed}` or special type
  - Platform: RT (Retail), MKP (Marketplace)
  - Method: HD (Home Delivery), CC (Click & Collect), MIX (Mixed)
  - Speed: STD (Standard), EXP (Express)

  **DEPRECATED**: DeliveryTypeCode has been merged into FMSOrderType (chore-ae72224b)

  **Related Files**:
  - Type definition: `src/components/order-management-hub.tsx` (line 173)
  - Badge component: `src/components/order-badges.tsx` (OrderTypeBadge)
  - Filter dropdown: `src/components/order-management-hub.tsx` (lines 2260-2272)
  ```

### 9. Validate Changes
- Run TypeScript build to ensure no type errors
- Verify Order Type filter dropdown shows all 7 values
- Verify OrderTypeBadge displays correct colors for all 7 types
- Verify demo orders are generated with correct order types
- Verify client-side filtering works with new orderType field

## Validation Commands

Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `rg "FMSOrderType" src/` - Verify type definition is updated
- `rg "'Large format'" src/` - Should return 0 results (removed)
- `rg "'Tops daily CFR'" src/` - Should return 0 results (removed)
- `rg "DeliveryTypeCode" src/ --type ts` - Should only show deprecated comments
- `rg "RT-MIX-STD" src/components/order-badges.tsx` - Verify badge styling exists
- `rg "Return Order" src/components/order-management-hub.tsx` - Verify filter option exists

## Notes

- **Backward Compatibility**: DeliveryTypeCodeBadge component is kept but deprecated for use in order-detail-view.tsx. A follow-up task should migrate that component to use OrderTypeBadge.

- **API Mapping**: If the external API returns a separate deliveryTypeCode field, the mapping function should copy that value to orderType for consistency.

- **Color Consistency**: The amber color for RT-CC-EXP may need Tailwind config update if not already available (amber-100, amber-800, amber-200).

- **Testing Priority**: Focus on visual validation in browser as this is primarily a UI/UX consolidation task.
