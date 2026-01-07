# Chore: Add Back to Inventory Management Button on Stock by Store Page

## Metadata
adw_id: `8af111aa`
prompt: `Add Back to Inventory Management button on Stock by Store page: 1) In app/inventory/stores/page.tsx, add a "Back to Inventory" button in the header section next to the Refresh button. 2) Use the same styling as the "Back to Store Overview" button on the filtered inventory page - outline variant with ArrowLeft icon. 3) Button should navigate to /inventory using router.push. 4) Position the button on the left side of the header, before the page title "Stock by Store". 5) Button text should be "Back to Inventory" with ArrowLeft icon from lucide-react. Purpose: Provide easy navigation back to main Inventory Management page from Stock by Store view.`

## Chore Description
Add a navigation button to the Stock by Store page (`app/inventory/stores/page.tsx`) that allows users to easily navigate back to the main Inventory Management page. The button should:
- Be positioned on the left side of the header, before the page title
- Use the same styling as the existing "Back to Store Overview" button (outline variant with ArrowLeft icon)
- Navigate to `/inventory` when clicked
- Display "Back to Inventory" text with an ArrowLeft icon from lucide-react

This improves navigation consistency across inventory pages and provides a clear return path for users.

## Relevant Files
- **app/inventory/stores/page.tsx** (lines 164-176) - The Stock by Store page header section where the button will be added. Currently has a header with title, description, and a Refresh button on the right. We need to add the Back button on the left side.
- **app/inventory/page.tsx** (lines 282-290) - Reference implementation showing the "Back to Store Overview" button styling. This uses `variant="ghost"`, `size="sm"`, ArrowLeft icon, and router.push navigation - we'll follow this pattern but use `variant="outline"` as specified.

## Step by Step Tasks

### 1. Import ArrowLeft Icon
- Verify that `ArrowLeft` is already imported from `lucide-react` in the imports section (line 10-18)
- ArrowLeft is already imported (line 36 in inventory/page.tsx shows it's available)

### 2. Update Header Layout Structure
- Modify the header section (lines 164-176) to support a left-side button
- Change the flex layout to accommodate both left button and right refresh button
- Wrap the title and description in a flex container to position the back button before them

### 3. Add Back to Inventory Button
- Position the button on the left side of the header, before the page title
- Use Button component with the following props:
  - `variant="outline"` (as specified in requirements)
  - `size="sm"` (matching the reference implementation)
  - `onClick={() => router.push("/inventory")}` (navigate to main inventory page)
  - `className="hover:bg-muted"` (for hover effect, matching reference)
- Add ArrowLeft icon with `className="h-4 w-4 mr-1"` (matching reference implementation)
- Button text: "Back to Inventory"

### 4. Verify Visual Layout
- Ensure the back button appears on the left side
- Verify the title and description remain properly aligned
- Confirm the Refresh button stays on the right side
- Check responsive behavior matches the existing design

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm run build` - Verify TypeScript compilation succeeds with no errors
- `pnpm run lint` - Ensure ESLint passes with no new warnings
- Manual test: Navigate to http://localhost:3000/inventory/stores and verify:
  - "Back to Inventory" button appears on the left side of the header
  - Button has ArrowLeft icon before the text
  - Button uses outline variant styling
  - Clicking the button navigates to /inventory page
  - Layout remains responsive and properly aligned

## Notes
- The button should match the styling pattern from `app/inventory/page.tsx` line 282-290, but use `variant="outline"` instead of `variant="ghost"` as specified in the requirements
- ArrowLeft icon is already available in the lucide-react imports
- The router is already imported and available via `useRouter()` hook
- Position the button BEFORE the title section to maintain left-to-right reading flow
