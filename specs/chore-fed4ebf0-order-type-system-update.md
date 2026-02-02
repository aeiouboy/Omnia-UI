# Chore: Order Type System Update

## Metadata
adw_id: `fed4ebf0`
prompt: `Analyze and update Order Type system across the codebase to support these order types: Return Order, MKP-HD-STD (Marketplace Home Delivery Standard), RT-HD-EXP (Retail Home Delivery Express), RT-CC-STD (Retail Click & Collect Standard), RT-MIX-STD (Retail Mixed Delivery Standard), RT-HD-STD (Retail Home Delivery Standard), RT-CC-EXP (Retail Click & Collect Express)`

## Chore Description

The current codebase has **two separate order type systems** that serve different purposes:

1. **FMSOrderType** - Business category types (currently: 'Large format', 'Tops daily CFR', 'Tops daily CFM', 'Subscription', 'Retail')
2. **DeliveryTypeCode** - Delivery method codes (currently: 'RT-HD-EXP', 'RT-CC-STD', 'MKP-HD-STD', 'RT-HD-STD', 'RT-CC-EXP')

Additionally, there's a basic `order_type` field in mock data that uses simple values like 'DELIVERY' and 'PICKUP'.

**This chore will:**
- Add "Return Order" as a new value to the FMSOrderType system (business category)
- Add "RT-MIX-STD" (Retail Mixed Delivery Standard) to the DeliveryTypeCode system
- Verify the remaining delivery type codes are already present (they are)
- Ensure consistent UI display with appropriate labels, colors, and icons
- Update mock data generators to include all values
- Update filter components and logic to support the new values

**Key Finding:** The request mixes two different taxonomies. We need to clarify:
- FMSOrderType = Business category (Retail, Subscription, etc.)
- DeliveryTypeCode = Delivery method (RT-HD-EXP, RT-CC-STD, etc.)
- "Return Order" is a business category, so it belongs in FMSOrderType
- RT-MIX-STD is a delivery method code, so it belongs in DeliveryTypeCode

## Relevant Files

### Type Definitions
- **src/components/order-management-hub.tsx** (lines 172-181) - Contains FMSOrderType and DeliveryTypeCode type definitions. Need to add "Return Order" to FMSOrderType and "RT-MIX-STD" to DeliveryTypeCode.

### Badge Components (UI Display)
- **src/components/order-badges.tsx** - Contains badge components for visual display:
  - Lines 344-365: `OrderTypeBadge` - Displays FMSOrderType values with color mapping
  - Lines 226-277: `DeliveryTypeCodeBadge` - Displays DeliveryTypeCode values with icons and colors
  - Lines 280-289: `getDeliveryTypeCodeLabel` - Helper function for friendly labels

### Mock Data Generators
- **src/lib/mock-data.ts** - Mock data generation:
  - Line 452: Basic `order_type` field uses 'DELIVERY' or 'PICKUP'
  - Lines 3685, 9443, 9804, 10842, 11172, 11594: Individual MAO order definitions with various order_type values
  - Line 444: DeliveryTypeCode array used for generating random values - needs RT-MIX-STD added

### Filter Components
- **src/components/order-management-hub.tsx** (line 444) - DeliveryTypeCode array used in filter demo generation
- Advanced filter panels (if they filter by order type)

### Database Types
- **src/lib/database.types.ts** - Database type definitions with order_type field
- **src/types/atc-config.ts** (line 145) - ATC config with order_types array

### Executive Dashboard
- **src/components/executive-dashboard.tsx** (line 135) - Order interface with order_type field
- **src/components/executive-dashboard/types.ts** (line 73) - Order type definition
- **src/components/executive-dashboard/utils.ts** (lines 38-40) - Order type classification logic

### New Files
None - all changes will be to existing files.

## Step by Step Tasks

### 1. Update Type Definitions
- Update `FMSOrderType` in `src/components/order-management-hub.tsx` (line 172) to include 'Return Order'
- Update `DeliveryTypeCode` in `src/components/order-management-hub.tsx` (line 181) to include 'RT-MIX-STD'
- Verify all other requested delivery codes are already present (RT-HD-EXP, RT-CC-STD, MKP-HD-STD, RT-HD-STD, RT-CC-EXP)

### 2. Update OrderTypeBadge Component
- Add color styling for 'Return Order' in the `typeStyles` mapping in `src/components/order-badges.tsx` (line 350-356)
- Choose appropriate color: red/pink theme to indicate return status (e.g., `"bg-red-100 text-red-800 border-red-200"`)

### 3. Update DeliveryTypeCodeBadge Component
- Add 'RT-MIX-STD' entry to the `deliveryTypeConfig` mapping in `src/components/order-badges.tsx` (line 232-258)
- Define label: "Retail Mixed Delivery Standard"
- Choose appropriate icon and color theme: Mixed icon (could use Settings or Package) with green/teal theme
- Update `getDeliveryTypeCodeLabel` helper function to include 'RT-MIX-STD' (line 281-288)

### 4. Update Mock Data Generators
- Update `deliveryTypeCodes` array in `src/lib/mock-data.ts` (line 444) to include 'RT-MIX-STD'
- Add test orders with 'Return Order' FMSOrderType value in mock data examples
- Add test orders with 'RT-MIX-STD' deliveryTypeCode in mock data examples
- Ensure mock data generator includes new values in rotation

### 5. Update Filter Arrays
- Verify filter components have updated DeliveryTypeCode arrays to include 'RT-MIX-STD'
- If there are order type filters (FMSOrderType), add 'Return Order' option

### 6. Update Documentation
- Update `CLAUDE.md` to document the new order type values
- Add notes about the distinction between FMSOrderType (business category) and DeliveryTypeCode (delivery method)
- Document the color and icon choices for new values

### 7. Validate Implementation
- Search codebase for any hardcoded order type arrays that might need updating
- Check for any order type validation logic that needs to include new values
- Verify TypeScript compilation with new type values
- Test badge component rendering with new values

## Validation Commands

Execute these commands to validate the work:

```bash
# TypeScript compilation check
pnpm run build

# Search for any remaining hardcoded order type arrays
grep -r "RT-HD-EXP.*RT-CC-STD.*MKP-HD-STD" src/ --include="*.ts" --include="*.tsx"

# Search for FMSOrderType usage
grep -r "FMSOrderType" src/ --include="*.ts" --include="*.tsx"

# Search for DeliveryTypeCode usage
grep -r "DeliveryTypeCode" src/ --include="*.ts" --include="*.tsx"

# Verify badge component exports
grep "export.*Badge" src/components/order-badges.tsx

# Check for any order type filters
grep -r "orderType.*filter" src/ --include="*.ts" --include="*.tsx" -i
```

## Notes

**Important Distinction:**
- **FMSOrderType** = Business category/fulfillment type (e.g., Retail, Subscription, Return Order)
  - Used for: Order classification, business logic, reporting
  - Display: OrderTypeBadge component

- **DeliveryTypeCode** = Delivery method code (e.g., RT-HD-EXP, RT-MIX-STD, MKP-HD-STD)
  - Used for: Delivery routing, logistics, SLA calculations
  - Display: DeliveryTypeCodeBadge component
  - Format: `{Platform}-{Method}-{Speed}` where:
    - Platform: RT (Retail), MKP (Marketplace)
    - Method: HD (Home Delivery), CC (Click & Collect), MIX (Mixed)
    - Speed: STD (Standard), EXP (Express)

**Color Scheme Guidelines:**
- Return Order: Red/pink theme (indicates return/refund status)
- RT-MIX-STD: Green/teal theme (indicates mixed/hybrid delivery)
- Maintain consistency with existing color patterns:
  - Express: Orange theme (urgency)
  - Standard: Blue theme (normal)
  - Click & Collect: Green theme (store pickup)
  - Marketplace: Purple theme (third-party)

**Mock Data Strategy:**
- Maintain realistic distribution: Most orders should be standard delivery types
- Return orders should be ~5-10% of total orders
- Mixed delivery should be ~15-20% of total orders
- Ensure proper correlation between order type and delivery type (e.g., Return Orders might have specific delivery codes)
