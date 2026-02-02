# Chore: Redesign Order Detail Header Action Buttons

## Metadata
adw_id: `8d2113de`
prompt: `Redesign order-detail-view.tsx header action buttons to match new pattern while keeping existing title structure: (1) Keep 'Order Details' h1 title and 'Order #{order_no}' subtitle as-is, (2) Add 'Back to Orders' button on left side (uncomment lines 465-469, add ArrowLeft icon, link to /orders), (3) Replace X close button with action button group on right side containing: Refresh button (outline variant with RefreshCw icon), Cancel Order button (red destructive variant with Ban icon, move from sticky footer at lines 1517-1532), and Actions dropdown (DropdownMenu with MoreVertical 3-dot icon containing placeholder items: Print, Export, Duplicate), (4) Remove sticky bottom footer section entirely after moving Cancel to header, (5) Ensure mobile responsive: on small screens show icon-only buttons, on larger screens show icon+text labels`

## Chore Description
This chore redesigns the order detail page header to consolidate action buttons into a modern, responsive header pattern. The current design has the Cancel Order button isolated in a sticky footer and uses only an X close button in the header. The new design:

1. **Preserves the title structure**: The "Order Details" h1 title and "Order #{order_no}" subtitle remain unchanged
2. **Adds navigation**: Uncomments and enables the "Back to Orders" button on the left with ArrowLeft icon
3. **Creates action button group**: Replaces the X close button with a right-aligned action group containing:
   - Refresh button (outline variant, RefreshCw icon)
   - Cancel Order button (destructive variant, Ban icon) - moved from sticky footer
   - Actions dropdown (MoreVertical icon) with Print, Export, Duplicate placeholder items
4. **Removes redundant sticky footer**: The sticky bottom footer is removed since Cancel Order moves to header
5. **Mobile-first responsive design**: Icon-only on small screens, icon+text on larger screens (sm: breakpoint)

## Relevant Files
Use these files to complete the chore:

- **`src/components/order-detail-view.tsx`** - Main component file containing the header, sticky footer, and all action logic. This is the primary file to modify.
  - Lines 11-39: Icon imports from lucide-react (already includes ArrowLeft, Ban, RefreshCw, X)
  - Lines 40-58: UI component imports (need to add DropdownMenu components)
  - Lines 459-505: Header section with title and X close button
  - Lines 1517-1532: Sticky bottom footer with Cancel Order button (to be removed)
  - Lines 1534-1540: CancelOrderDialog component usage (keep as-is)

- **`src/components/ui/dropdown-menu.tsx`** - Radix UI dropdown menu component - provides DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem

- **`src/components/ui/button.tsx`** - Button component with variants (outline, destructive, ghost) and sizes (sm, icon)

- **`src/components/user-nav.tsx`** - Reference implementation for DropdownMenu usage pattern

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add MoreVertical Icon Import
- Locate the lucide-react import block at lines 11-39
- Add `MoreVertical` to the import list (alphabetically between `MessageSquare` and `Package`)
- Also add `Printer`, `FileDown`, `Copy` icons for dropdown menu items

### 2. Add DropdownMenu Component Imports
- Locate the UI component imports around line 41-58
- Add import for DropdownMenu components from `@/components/ui/dropdown-menu`:
  ```tsx
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  ```

### 3. Add Refresh Handler Function
- Add a `handleRefresh` function near other handler functions (around line 418)
- The function should show a toast notification and trigger any data refresh logic
- For now, implement as a placeholder that shows a toast

### 4. Uncomment and Modify Back to Orders Button
- Locate the commented "Back to Orders" button at lines 465-469
- Uncomment the button
- Modify to use `router.push('/orders')` instead of `onClose`
- Add responsive text: show "Back" on mobile, "Back to Orders" on desktop

### 5. Redesign Header Right Section - Replace X with Action Group
- Remove the existing X close button at lines 475-479
- Create a new action button group with flex layout
- Add three action buttons in order:
  1. **Refresh Button**: `variant="outline"`, `size="sm"`, RefreshCw icon, responsive text "Refresh"
  2. **Cancel Order Button**: `variant="destructive"`, `size="sm"`, Ban icon, responsive text "Cancel Order"
     - Copy the disabled/enabled logic from sticky footer (`!canCancelOrder || isCancelling`)
     - Copy the title tooltip from sticky footer
  3. **Actions Dropdown**: Button trigger with MoreVertical icon, dropdown with Print/Export/Duplicate items

### 6. Implement Responsive Button Pattern
- All action buttons should use this responsive pattern:
  ```tsx
  <Button variant="..." size="sm" className="...">
    <Icon className="h-4 w-4" />
    <span className="hidden sm:inline">Label Text</span>
  </Button>
  ```
- On mobile (< 640px): Show icon only
- On desktop (>= 640px): Show icon + text label
- Ensure minimum 44px touch targets for mobile accessibility

### 7. Remove Sticky Bottom Footer Section
- Delete the entire sticky footer section at lines 1517-1532:
  ```tsx
  {/* Sticky Bottom Cancel Button */}
  <div className="sticky bottom-0 ...">
    ...
  </div>
  ```
- The CancelOrderDialog component (lines 1534-1540) remains unchanged

### 8. Validate Build and TypeScript
- Run `pnpm build` to verify no compilation errors
- Ensure all imports are resolved
- Verify no TypeScript errors

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure production build succeeds with no errors
- `pnpm dev` - Start dev server and manually verify:
  - Navigate to any order detail page (e.g., `/orders/[id]`)
  - Verify "Back to Orders" button appears on left
  - Verify action button group appears on right (Refresh, Cancel Order, Actions dropdown)
  - Verify Actions dropdown opens with Print, Export, Duplicate items
  - Verify responsive behavior: resize browser to see icon-only vs icon+text
  - Verify sticky footer is removed (no Cancel button at bottom)
  - Verify Cancel Order button is disabled for non-cancellable orders

## Notes
- The CancelOrderDialog component and all its logic (showCancelDialog, handleCancelOrder, isCancelling) remain unchanged - only the button triggering it moves to the header
- The `canCancelOrder` and `getCancelDisabledReason` logic is already implemented and should be reused
- The `onClose` prop may become unused after this change - consider removing it from props if not needed elsewhere
- Print, Export, Duplicate dropdown items are placeholders - they can be connected to actual functionality in future tasks
- The MoreVertical icon is commonly used for "more actions" menus in modern UI patterns
