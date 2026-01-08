# Chore: Move Upload History Filter Tabs to Right Side

## Metadata
adw_id: `a1003046`
prompt: `Move the Upload History filter tabs to the right side of the section header in Stock Configuration page (app/stock-config/page.tsx). Requirements: 1) Change the layout so the filter tabs (All, Pending, Processed, Error) appear on the right side of the 'Upload History (X)' title instead of below it 2) Use flexbox with justify-between to position title on left and tabs on right 3) Keep the tabs and title vertically centered with items-center 4) Maintain responsive design - on mobile (below md breakpoint) stack them vertically with tabs below the title 5) Keep all existing filtering functionality unchanged`

## Chore Description
This chore updates the Upload History section in the Stock Configuration page to improve the visual layout by moving the filter tabs (All, Pending, Processed, Error) from their current position below the title to the right side of the section header. The layout will use flexbox with justify-between to create a horizontal arrangement on desktop, while maintaining responsive behavior on mobile devices where the tabs will stack vertically below the title. All existing filtering functionality must remain unchanged.

## Relevant Files
Use these files to complete the chore:

- **app/stock-config/page.tsx** (lines 629-652)
  - Contains the Upload History Card component with CardHeader and CardContent
  - Currently has the title in CardHeader and the filter tabs (TabsList) in CardContent
  - Need to restructure the CardHeader to include both title and tabs in a flexbox layout
  - The filter state and functionality logic is already implemented and working

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Read the Current Implementation
- Review the Upload History section structure (lines 629-652)
- Identify the CardHeader with title and CardDescription
- Identify the TabsList component with filter tabs in CardContent
- Understand the current responsive behavior

### 2. Restructure CardHeader Layout
- Modify the CardHeader to use a flex container with justify-between
- Move the title and description into a left-aligned div
- Add items-center to vertically center content
- Implement responsive classes: flex-col md:flex-row for mobile stacking

### 3. Move TabsList to CardHeader
- Extract the TabsList component from CardContent
- Place it on the right side of the CardHeader flex container
- Ensure it's positioned in the same flex row as the title on desktop
- Maintain vertical centering with the title

### 4. Add Mobile Responsiveness
- Add md:flex-row to ensure horizontal layout on desktop (md breakpoint: 768px+)
- Use flex-col as base for mobile vertical stacking
- Add appropriate spacing classes (gap-4) between title and tabs
- Test that tabs appear below title on mobile and to the right on desktop

### 5. Verify Functionality and Styling
- Ensure all existing filtering functionality remains unchanged
- Verify the TabsContent still displays correctly below the header
- Check that the UploadHistoryTable receives the correct filtered data
- Test responsive behavior at different screen sizes
- Confirm no visual regressions or layout issues

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run dev` - Start the development server and verify the page loads without errors
- Navigate to `/stock-config` in the browser and verify:
  - Upload History filter tabs appear on the right side of the section header on desktop
  - Title "Upload History (X)" appears on the left side
  - Both title and tabs are vertically centered
  - On mobile (resize browser below 768px), tabs stack below the title
  - All filter tabs (All, Pending, Processed, Error) work correctly
  - The filtered table data updates when switching tabs
- `npm run build` - Ensure the production build completes without TypeScript errors

## Notes
- The md: breakpoint in Tailwind CSS is 768px, which is appropriate for this tablet/desktop transition
- The existing TabsContent wrapper should remain in CardContent to maintain proper spacing
- Keep the CardDescription visible on all screen sizes for context
- No changes to filtering logic or state management are required
- The gap-4 class provides appropriate spacing between elements in both mobile and desktop layouts
