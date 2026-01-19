# Chore: Enhance Customer Type display in Order Detail View

## Metadata
adw_id: `5281d902`
prompt: `Enhance Customer Type display in Order Detail View (src/components/order-detail-view.tsx): Currently there are duplicate fields - 'Customer Type' in Customer Information section and 'Customer Type ID' in Order Information section on the Overview tab. Make these changes: 1) Remove the 'Customer Type ID' field from Order Information section (keep only 'Customer Type' in Customer Information section). 2) Update the 'Customer Type' field display value to show both the ID and descriptive label in format 'cluster_3 - Prime' where the ID comes from order.customerTypeId or customer.customerTypeId and the label is derived from mapping (cluster_1: 'Standard', cluster_2: 'Premium', cluster_3: 'Prime', cluster_4: 'VIP'). 3) If customerTypeId is missing, display '-' as fallback. Search for 'Customer Type' and 'customerTypeId' in the file to locate both fields.`

## Chore Description
The Order Detail View currently has duplicate customer type information displayed across two sections:
1. **Customer Information section** (line 394-396): Shows "Customer Type" field using `order?.customer?.customerType`
2. **Order Information section** (line 479-481): Shows "Customer Type ID" field using `order?.customerTypeId`

This creates redundancy and inconsistent display. The enhancement consolidates these into a single, more informative display that shows both the cluster ID and its human-readable label.

**Current State:**
- Customer Type in Customer Information: Shows values like "INDIVIDUAL", "Guest", "Tops Prime", etc.
- Customer Type ID in Order Information: Shows values like "cluster_3 - Prime", "CT-IND", etc.

**Desired State:**
- Single "Customer Type" field in Customer Information section
- Display format: `{customerTypeId} - {label}` (e.g., "cluster_3 - Prime")
- Label mapping:
  - `cluster_1` → "Standard"
  - `cluster_2` → "Premium"
  - `cluster_3` → "Prime"
  - `cluster_4` → "VIP"
- Fallback to `-` if customerTypeId is missing

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail-view.tsx** - Main file to modify. Contains both the Customer Information section (line 394-396) and Order Information section (line 479-481) that need changes.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Customer Type Label Mapping Function
- Add a helper function at the top of the component (inside the component function, before the return statement) to map customerTypeId to descriptive labels:
```typescript
const getCustomerTypeLabel = (customerTypeId: string | undefined | null): string => {
  if (!customerTypeId) return '-';

  const clusterMapping: Record<string, string> = {
    'cluster_1': 'Standard',
    'cluster_2': 'Premium',
    'cluster_3': 'Prime',
    'cluster_4': 'VIP',
  };

  // Check if the ID is a cluster_X format
  const clusterId = customerTypeId.toLowerCase().split(' ')[0]; // Handle "cluster_3 - Prime" format
  if (clusterMapping[clusterId]) {
    return `${clusterId} - ${clusterMapping[clusterId]}`;
  }

  // For non-cluster IDs, return as-is
  return customerTypeId;
};
```

### 2. Update Customer Type Field in Customer Information Section
- Locate the "Customer Type" field in Customer Information section (lines 393-396)
- Update the display value from `{order?.customer?.customerType || '-'}` to use the new helper function:
```tsx
<div>
  <p className="text-sm text-enterprise-text-light">Customer Type</p>
  <p className="text-sm">{getCustomerTypeLabel(order?.customerTypeId || order?.customer?.customerTypeId)}</p>
</div>
```

### 3. Remove Customer Type ID Field from Order Information Section
- Locate the "Customer Type ID" field in Order Information section (lines 478-481)
- Delete the entire `<div>` block containing "Customer Type ID":
```tsx
// DELETE THIS BLOCK:
<div>
  <p className="text-sm text-enterprise-text-light">Customer Type ID</p>
  <p className="font-mono text-sm">{order?.customerTypeId || '-'}</p>
</div>
```

### 4. Validate the Changes
- Run the development server and navigate to an order detail page
- Verify Customer Type displays in format "cluster_3 - Prime" in Customer Information section
- Verify Customer Type ID field is removed from Order Information section
- Test with MAO order W1156251121946800 which has `customerTypeId: 'cluster_3 - Prime'`

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript compilation errors
- `pnpm dev` - Start development server and manually verify:
  1. Navigate to Order Management Hub
  2. Click on any order to open Order Detail View
  3. Check Overview tab → Customer Information section shows "Customer Type" with format "cluster_X - Label"
  4. Check Overview tab → Order Information section NO LONGER shows "Customer Type ID" field

## Notes
- The customerTypeId field exists at `order.customerTypeId` (root level) based on mock data analysis
- Some mock data already has the combined format "cluster_3 - Prime" - the helper function handles this by extracting the cluster ID
- The helper function falls back to displaying the raw customerTypeId for non-cluster formats (e.g., "CT-IND") to maintain backwards compatibility
- Priority order for getting customerTypeId: `order?.customerTypeId` first, then `order?.customer?.customerTypeId` as fallback
