# Chore: Remove Filter Summary Header from Transaction History

## Metadata
adw_id: `c0436418`
prompt: `Remove the filter summary header from Transaction History section in Stock Card By Product view (app/inventory-new/stores/page.tsx):

Remove the card/section that displays:
- 'Product: {id} - {name}'
- 'Store: {id} - {name}'
- 'Period: {startDate} - {endDate}'

Keep only:
- '167 transactions found' count text
- The Transaction History table itself

This header is redundant since the filter values are already visible in the filter section above.`

## Chore Description
Remove the redundant filter context header from the Transaction History section in the Stock Card By Product view. This header currently displays the selected Product, Store, and Period information, which is already visible in the filter controls above the table. The removal will reduce visual clutter and improve the user experience by eliminating duplicate information.

The filter context header is located within the CardHeader of the Transaction History card (lines 1131-1151) and includes:
- Product information (ID and name)
- Store information (ID and name)
- Period (date range)

After removal, only the CardTitle ("Transaction History") and CardDescription ("{count} transactions found") should remain in the header.

## Relevant Files
- **app/inventory-new/stores/page.tsx** (lines 1131-1151) - Contains the filter context header section to be removed from the Transaction History CardHeader

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Read the Current Implementation
- Read app/inventory-new/stores/page.tsx to understand the current structure
- Identify the exact location of the filter context header section (lines 1131-1151)
- Verify the surrounding code structure to ensure clean removal

### 2. Remove the Filter Context Header
- Locate the CardHeader section within the Transaction History card (starting around line 1122)
- Remove the entire filter context header div block (lines 1131-1151)
- This includes the div with className "mt-4 p-3 bg-muted/50 rounded-md border border-border/40 space-y-1" and all its child elements
- Ensure the CardTitle and CardDescription remain intact
- Preserve the closing CardHeader tag

### 3. Verify Code Structure
- Confirm that the CardHeader now only contains:
  - The flex container with CardTitle and CardDescription
  - No filter context information
- Ensure proper JSX structure and closing tags
- Check for any formatting or indentation issues

### 4. Test the Changes
- Run the development server to verify the page renders correctly
- Check that no TypeScript or ESLint errors are introduced
- Visually verify that the Transaction History section displays correctly without the filter summary
- Ensure the transaction count and table still display as expected

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start the development server and verify the page loads without errors
- `pnpm build` - Build the application to check for TypeScript compilation errors
- Navigate to the Stock Card page in the browser and verify the By Product view displays correctly without the filter summary header

## Notes
This is a straightforward UI cleanup task that removes redundant information from the interface. The filter values are already visible in the filter controls above the table, so displaying them again in a summary box creates visual clutter without adding value. The transaction count ("167 transactions found") provides sufficient context along with the visible filter controls.
