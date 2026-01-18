# Chore: Standardize to 'Channel' Terminology

## Metadata
adw_id: `b2edd88a`
prompt: `Standardize to 'Channel' terminology. In Order Management (src/components/order-management-hub.tsx), replace all references to 'sellingChannel' with 'channel' for consistency. Ensure filter labels and dropdown options use 'Channel' not 'Selling Channel'.`

## Chore Description
This chore standardizes the terminology across the Order Management system from 'sellingChannel' to 'channel' for consistency. The application already uses `channel` as the primary field in the API response structure (`ApiOrder.channel`), but there are legacy references to `sellingChannel` scattered throughout the codebase in filters, interfaces, and display labels. This creates confusion and inconsistency.

The standardization includes:
1. Updating interface properties from `sellingChannel` to `channel`
2. Changing filter field names from `sellingChannel` to `channel`
3. Updating all display labels from "Selling Channel" to "Channel"
4. Ensuring mock data uses `channel` consistently
5. Maintaining backward compatibility where `sellingChannel` is used as a fallback

## Relevant Files
Use these files to complete the chore:

- **src/components/order-management-hub.tsx** - Primary file containing Order Management Hub component with:
  - `OrderFilters` interface with `sellingChannel` property (line 236)
  - `AdvancedFilters` interface with `sellingChannel` property (line 284)
  - Mock data generation using `sellingChannel` (lines 420-423)
  - Filter initialization with `sellingChannel: "all-channels"` (line 675)
  - Filter logic checking `advancedFilters.sellingChannel` (lines 1433-1434)
  - Display labels showing "Selling Channel" (lines 1685, 1912)

- **src/components/order-detail-view.tsx** - Order detail view component showing:
  - Display label "Selling Channel" (line 572)
  - Fallback logic `order?.sellingChannel || order?.channel` (line 573)

- **src/components/advanced-filter-panel.tsx** - Advanced filter panel component with:
  - `AdvancedFilters` interface with `sellingChannel` property (line 26)
  - Filter state initialization (line 56)
  - Filter reset logic (line 125)
  - Active filter display (line 158)
  - Label and select component for `sellingChannel` (lines 334-337)

- **src/components/enhanced-filter-panel.tsx** - Enhanced filter panel component with:
  - `EnhancedFilters` interface with `sellingChannel` property (line 42)
  - Filter state initialization (line 84)
  - Filter check logic (line 174)
  - Filter reset logic (line 215)
  - Active filter display (line 248)

- **src/lib/mock-data.ts** - Mock data generation using:
  - `sellingChannel` property in generated orders (lines 506, 2823, 2863, 3183, 4714)

### New Files
None. This is a refactoring task updating existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Interface Definitions in Order Management Hub
- Open `src/components/order-management-hub.tsx`
- Locate `OrderFilters` interface (around line 236)
- Change `sellingChannel?: string` to `channel?: string`
- Locate `AdvancedFilters` interface (around line 284)
- Change `sellingChannel: string` to `channel: string`

### 2. Update Filter Logic in Order Management Hub
- In `src/components/order-management-hub.tsx`:
- Update mock data generation (around lines 420-423):
  - Remove `demoOrder.sellingChannel = demoOrder.channel` line
  - Update comment from "Mock Selling Channel" to "Mock Channel"
- Update filter initialization (around line 675):
  - Change `sellingChannel: "all-channels"` to `channel: "all-channels"`
- Update filter logic (around lines 1433-1434):
  - Change `advancedFilters.sellingChannel` to `advancedFilters.channel`
  - Change variable references throughout the condition

### 3. Update Display Labels in Order Management Hub
- In `src/components/order-management-hub.tsx`:
- Find all instances of "Selling Channel" text (lines 1685, 1912)
- Replace with "Channel"

### 4. Update Order Detail View Component
- Open `src/components/order-detail-view.tsx`
- Locate the "Selling Channel" label (around line 572)
- Change "Selling Channel" to "Channel"
- Update the fallback logic (line 573) to prioritize `order?.channel` first:
  - Change from `order?.sellingChannel || order?.channel` to `order?.channel`
  - Remove `sellingChannel` reference since we're standardizing on `channel`

### 5. Update Advanced Filter Panel Component
- Open `src/components/advanced-filter-panel.tsx`
- Update `AdvancedFilters` interface (around line 26):
  - Change `sellingChannel: string` to `channel: string`
- Update all filter state references:
  - Line 56: `sellingChannel: initialValues.sellingChannel` → `channel: initialValues.channel`
  - Line 75: `filters.sellingChannel !== "all-channels"` → `filters.channel !== "all-channels"`
  - Line 125: `sellingChannel: "all-channels"` → `channel: "all-channels"`
  - Line 158: `filters.sellingChannel` → `filters.channel`
- Update Label and Select component (around lines 334-337):
  - Change `htmlFor="sellingChannel"` to `htmlFor="channel"`
  - Change `filters.sellingChannel` to `filters.channel`
  - Change `onValueChange` handler to use "channel" instead of "sellingChannel"

### 6. Update Enhanced Filter Panel Component
- Open `src/components/enhanced-filter-panel.tsx`
- Update `EnhancedFilters` interface (around line 42):
  - Change `sellingChannel: string` to `channel: string`
- Update all filter state references:
  - Line 84: `sellingChannel: initialValues.sellingChannel` → `channel: initialValues.channel`
  - Line 174: `filters.sellingChannel !== "all-channels"` → `filters.channel !== "all-channels"`
  - Line 215: `sellingChannel: "all-channels"` → `channel: "all-channels"`
  - Line 248: `filters.sellingChannel` → `filters.channel`

### 7. Update Mock Data Generation
- Open `src/lib/mock-data.ts`
- Find all instances of `sellingChannel` property (lines 506, 2823, 2863, 3183, 4714)
- Change all `sellingChannel:` to `channel:`
- Verify that the values remain unchanged (only the property name changes)

### 8. Validation and Testing
- Run TypeScript compilation to ensure no type errors
- Build the project to verify all changes compile successfully
- Visually inspect the Order Management Hub to ensure:
  - Filter labels show "Channel" instead of "Selling Channel"
  - Dropdown options work correctly
  - Order details display "Channel" label
  - Filter functionality still works as expected

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run build` - Verify TypeScript compilation succeeds with no errors
- `grep -r "sellingChannel" src/components/ src/lib/` - Should return no matches (all changed to 'channel')
- `grep -r "Selling Channel" src/components/` - Should return no matches (all changed to 'Channel')
- Visual verification in browser:
  - Navigate to Order Management Hub
  - Open advanced filters panel
  - Verify "Channel" label appears (not "Selling Channel")
  - Click on an order to view details
  - Verify order detail shows "Channel" label

## Notes

**Backward Compatibility Considerations:**
- The primary API field is already `channel` in the `ApiOrder` interface
- Previous code used `sellingChannel` as a secondary property for compatibility
- After this change, only `channel` will be used throughout the application
- The channel mapping utilities in `src/lib/channel-utils.ts` already work with the `channel` field and don't need changes

**Related Standards:**
- The application uses a three-channel standard: 'web', 'lazada', 'shopee'
- Channel mapping utilities normalize legacy values to this standard
- This chore only addresses property naming, not the channel values themselves

**Scope Limitation:**
- This chore focuses specifically on the Order Management domain
- Other parts of the application may still use different terminology
- Future chores may extend this standardization to other modules if needed
