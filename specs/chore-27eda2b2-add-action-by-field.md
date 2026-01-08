# Chore: Add 'Action By' Field to Upload History

## Metadata
adw_id: `27eda2b2`
prompt: `Add 'Action By' field to Upload History on Stock Configuration page for tracking who uploaded each file. Requirements: 1) Add 'uploadedBy' field (string) to StockConfigFile interface in src/types/stock-config.ts 2) Update mock file history data in src/lib/stock-config-service.ts to include sample user names 3) Display the 'Action By' column in the Upload History section at app/stock-config/page.tsx between the upload date and record count 4) When creating a new file record in handleStartProcessing, set uploadedBy to 'Current User' as placeholder (actual user integration can be added later) 5) Show the user name with a subtle icon (User icon from lucide-react) in the history list`

## Chore Description
Add user tracking to the Stock Configuration Upload History feature by introducing an 'Action By' field that displays who uploaded each file. This enhancement improves audit trails and accountability for stock configuration uploads. The implementation includes:
- Adding a new `uploadedBy` field to the StockConfigFile TypeScript interface
- Updating mock data with sample user names for development/testing
- Displaying the user information in the Upload History table with a User icon
- Setting a placeholder "Current User" value when processing files (ready for future authentication integration)

## Relevant Files
Use these files to complete the chore:

- **src/types/stock-config.ts** (line 106-124) - Contains the `StockConfigFile` interface definition that needs the new `uploadedBy` field
- **src/lib/stock-config-service.ts** (line 106-148) - Contains `mockFileHistory` array that needs sample user names added
- **app/stock-config/page.tsx** (line 217-233) - Contains `handleStartProcessing` function where new file records are created with the uploadedBy field
- **app/stock-config/page.tsx** (line 663-739) - Contains the Upload History section UI where the 'Action By' column should be displayed between upload date and record count

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add uploadedBy Field to TypeScript Interface
- Open `src/types/stock-config.ts`
- Locate the `StockConfigFile` interface (around line 106)
- Add `uploadedBy?: string` field to the interface after the `errorMessage` field
- Add JSDoc comment: `// User who uploaded the file (optional for backward compatibility)`

### 2. Update Mock File History Data
- Open `src/lib/stock-config-service.ts`
- Locate the `mockFileHistory` array (around line 106)
- Add `uploadedBy` field to each mock file record:
  - FILE001: `uploadedBy: "Sarah Johnson"`
  - FILE002: `uploadedBy: "Mike Chen"`
  - FILE003: `uploadedBy: "Alex Rodriguez"`
  - FILE004: `uploadedBy: "Current User"`

### 3. Update createFileRecord Function
- Open `src/lib/stock-config-service.ts`
- Locate the `createFileRecord` function (around line 637)
- Add an optional `uploadedBy?: string` parameter to the function signature
- Add the `uploadedBy` field to the returned `StockConfigFile` object with the provided value or undefined

### 4. Set uploadedBy in handleStartProcessing
- Open `app/stock-config/page.tsx`
- Import `User` icon from `lucide-react` at the top (add to existing imports around line 10-26)
- Locate the `handleStartProcessing` function (around line 217)
- In the file record creation (around line 219-232), add `uploadedBy: "Current User"` field

### 5. Display Action By Column in Upload History UI
- Open `app/stock-config/page.tsx`
- Locate the Upload History section file list mapping (around line 663)
- In the file item div structure (around line 670-689), add a new text element after the upload date display
- Create a flex container with User icon and uploadedBy text:
  - Use `User` icon from lucide-react with className `h-3 w-3 text-muted-foreground`
  - Display `file.uploadedBy` or fallback to "Unknown" if not present
  - Apply subtle styling with `text-xs text-muted-foreground` classes
  - Position between the date/time display and the record count

### 6. Validate the Changes
- Verify TypeScript compilation with no errors
- Check that all file history items display user names correctly
- Confirm new uploads show "Current User" as the uploader
- Ensure the User icon displays properly with appropriate sizing and color

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm run build` - Verify TypeScript compilation and build succeeds with no errors
- Visually inspect the Upload History section in the browser at `http://localhost:3000/stock-config` to confirm:
  - User icon appears next to each file entry
  - User names are displayed correctly
  - Layout is clean and aligned properly
  - New uploads show "Current User"

## Notes
- The `uploadedBy` field is optional (`uploadedBy?: string`) to maintain backward compatibility with existing file records that may not have this field
- Using "Current User" as a placeholder allows for easy integration with authentication systems later
- The User icon should be subtle and not distract from the main information
- Consider adding this field to the `createFileRecord` function signature for flexibility in future implementations
