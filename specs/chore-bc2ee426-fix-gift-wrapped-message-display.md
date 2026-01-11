# Chore: Fix Gift Wrapped Message Field Display

## Metadata
adw_id: `bc2ee426`
prompt: `Fix Gift Wrapped Message field display in Items tab to show dash when Gift Wrapped is No.`

## Chore Description
The Gift Wrapped Message field in the Items tab's expanded details section is currently conditionally rendered - it only appears when `giftWrapped` is `Yes` AND a message exists. This creates an inconsistent UI where the field disappears entirely when there's no gift wrapping.

The expected behavior is for the Gift Wrapped Message field to ALWAYS be visible for consistency:
- Gift Wrapped = 'Yes' with message → Display the gift message
- Gift Wrapped = 'Yes' without message → Display '-'
- Gift Wrapped = 'No' → Display '-'

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail-view.tsx** (lines 756-760) - Contains the Gift Wrapped Message field with conditional rendering that needs to be fixed. This is the only file requiring changes.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Gift Wrapped Message Field Rendering
- Navigate to `src/components/order-detail-view.tsx`
- Locate lines 756-760 which contain the conditional Gift Wrapped Message rendering:
  ```tsx
  {item.giftWrapped && item.giftWrappedMessage && (
    <div className="flex justify-between">
      <span className="text-gray-500">Gift Message</span>
      <span className="text-gray-900 font-medium italic">{item.giftWrappedMessage}</span>
    </div>
  )}
  ```
- Remove the conditional wrapper `{item.giftWrapped && item.giftWrappedMessage && ( ... )}`
- Change to always render the field with a fallback value:
  ```tsx
  <div className="flex justify-between">
    <span className="text-gray-500">Gift Message</span>
    <span className="text-gray-900 font-medium italic">
      {item.giftWrapped && item.giftWrappedMessage ? item.giftWrappedMessage : '-'}
    </span>
  </div>
  ```

### 2. Validate the Changes
- Run `pnpm build` to ensure no TypeScript or build errors
- Run `pnpm dev` to start the development server
- Navigate to an order detail view with the Items tab
- Expand an item and verify the Gift Wrapped Message field:
  - Appears for all items regardless of gift wrapping status
  - Shows the message when Gift Wrapped is Yes and message exists
  - Shows '-' when Gift Wrapped is Yes but no message
  - Shows '-' when Gift Wrapped is No

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the project builds without errors
- `pnpm lint` - Verify no linting errors were introduced

## Notes
- The field label is "Gift Message" in the UI (not "Gift Wrapped Message")
- The change is minimal - only removing the conditional wrapper and adding a ternary for the value
- This maintains consistency with other fields in the Product Details column that always display with '-' fallback
