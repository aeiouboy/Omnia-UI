# Chore: Redesign Stock Configuration Summary Cards

## Metadata
adw_id: `a92ecafa`
prompt: `Redesign Stock Configuration page summary cards to show product configuration groupings instead of file status. Update app/stock-config/page.tsx with the following changes: 1) Replace the 4 summary cards with new groupings - Card 1: 'Total Configurations' showing count of all active stock configs with Package icon - Card 2: 'Daily Configs' showing count of On Hand Available/Daily frequency configs with CalendarDays icon (blue color) - Card 3: 'One-time Configs' showing count of PreOrder/One-time frequency configs with Clock icon (purple color) - Card 4: 'Upload Status' showing combined file status as 'X pending, Y processed, Z errors' with FileSpreadsheet icon 2) Update summaryStats useMemo to calculate: totalConfigs (all), dailyConfigs (frequency=Daily), oneTimeConfigs (frequency=One-time or Onetime), and file counts 3) Make the Upload Status card clickable - when clicked, scroll to Upload History section smoothly 4) Add subtitle text under each config count: 'On Hand Available' for Daily, 'PreOrder' for One-time 5) Keep the same card styling and grid layout (md:grid-cols-2 lg:grid-cols-4) 6) Import CalendarDays icon from lucide-react`

## Chore Description
The current Stock Configuration page displays 4 summary cards focused on file processing status (Total Configurations, Pending Files, Processed Files, Error Files). This chore redesigns the summary cards to show product configuration groupings that are more meaningful to the business:

1. **Total Configurations** - All active stock configs (unchanged)
2. **Daily Configs** - Count of On Hand Available/Daily frequency configs (blue color)
3. **One-time Configs** - Count of PreOrder/One-time frequency configs (purple color)
4. **Upload Status** - Combined file status summary (clickable to scroll to Upload History)

This provides better visibility into the types of configurations active in the system, while still maintaining file status information in a consolidated card.

## Relevant Files

- **app/stock-config/page.tsx** (lines 1-602)
  - Main page component containing the summary cards section (lines 418-463)
  - Contains summaryStats useMemo (lines 388-393) that needs updating
  - Contains icon imports from lucide-react (lines 10-21)
  - Contains state and data loading logic for stockConfigs and fileHistory

- **src/types/stock-config.ts** (lines 1-207)
  - Contains SupplyTypeID type definition (line 15): "PreOrder" | "On Hand Available" | "Preorder" | "OnHand"
  - Contains Frequency type definition (line 24): "One-time" | "Daily" | "Onetime"
  - Provides type information for filtering configurations

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Icon Imports
- Add `CalendarDays` to the existing lucide-react import statement
- Current imports at lines 10-21 include: Upload, Search, RefreshCw, ChevronLeft, ChevronRight, FileSpreadsheet, Package, Clock, FolderArchive, FileX
- Add CalendarDays to this list

### 2. Update summaryStats useMemo
- Locate the summaryStats useMemo at lines 388-393
- Replace the calculation logic to include:
  - `totalConfigs`: Count of all stockConfigs (unchanged, use totalItems)
  - `dailyConfigs`: Count of stockConfigs where frequency === "Daily"
  - `oneTimeConfigs`: Count of stockConfigs where frequency === "One-time" OR frequency === "Onetime"
  - Keep file status counts: `pending`, `processed`, `errors` (for Upload Status card)
- Return object: `{ totalConfigs, dailyConfigs, oneTimeConfigs, pending, processed, errors }`

### 3. Redesign Card 1: Total Configurations
- Locate Card 1 at lines 420-429
- Keep the same structure and Package icon
- Update subtitle to "Active stock configs"
- Display: `{summaryStats.totalConfigs}` or `{totalItems}`

### 4. Redesign Card 2: Daily Configs
- Locate Card 2 at lines 431-440 (currently "Pending Files")
- Change CardTitle to "Daily Configs"
- Replace Clock icon with CalendarDays icon
- Add blue color to icon: `className="h-4 w-4 text-blue-600"`
- Change number color to blue: `className="text-2xl font-bold text-blue-600"`
- Display: `{summaryStats.dailyConfigs}`
- Add subtitle: "On Hand Available"

### 5. Redesign Card 3: One-time Configs
- Locate Card 3 at lines 442-451 (currently "Processed Files")
- Change CardTitle to "One-time Configs"
- Replace FolderArchive icon with Clock icon
- Add purple color to icon: `className="h-4 w-4 text-purple-600"`
- Change number color to purple: `className="text-2xl font-bold text-purple-600"`
- Display: `{summaryStats.oneTimeConfigs}`
- Add subtitle: "PreOrder"

### 6. Redesign Card 4: Upload Status (Clickable)
- Locate Card 4 at lines 453-462 (currently "Error Files")
- Change CardTitle to "Upload Status"
- Keep FileSpreadsheet icon (already using FileX, replace with FileSpreadsheet)
- Update icon color to neutral: `className="h-4 w-4 text-muted-foreground"`
- Display combined status text: `{summaryStats.pending} pending, {summaryStats.processed} processed, {summaryStats.errors} errors`
- Change font size to text-sm for the combined status (instead of text-2xl for single number)
- Add subtitle: "Click to view details"
- Make the entire Card clickable by wrapping in a button or adding onClick handler
- Add cursor-pointer and hover effect to indicate clickability

### 7. Implement Scroll to Upload History
- Add a ref to the Upload History section (File History Section at line 546)
- Create a useRef hook: `const uploadHistorySectionRef = useRef<HTMLDivElement>(null)`
- Add ref to the Card component at line 547
- Create click handler: `handleScrollToUploadHistory`
- Use `uploadHistorySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })`
- Attach onClick to Card 4

### 8. Verify Layout and Styling
- Ensure grid layout remains: `className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"`
- Verify all cards have consistent padding and spacing
- Confirm color classes are applied correctly (blue for Daily, purple for One-time)
- Check that Upload Status card has visual indication of clickability

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run dev` - Start development server and verify page loads without errors
- Navigate to http://localhost:3000/stock-config
- Verify 4 summary cards display:
  - Card 1: Total Configurations with Package icon
  - Card 2: Daily Configs with CalendarDays icon (blue)
  - Card 3: One-time Configs with Clock icon (purple)
  - Card 4: Upload Status with FileSpreadsheet icon and combined status text
- Click on Upload Status card and verify it scrolls smoothly to Upload History section
- Check browser console for any TypeScript or React errors
- `npm run build` - Ensure production build completes successfully without type errors

## Notes

- The summaryStats calculation should handle backward compatibility with legacy frequency values ("Onetime" in addition to "One-time")
- The Upload Status card should gracefully handle 0 values (e.g., "0 pending, 0 processed, 0 errors")
- Consider adding transition effects to the scroll behavior for better UX
- Ensure the clickable Upload Status card has proper accessibility attributes (role, aria-label if needed)
- The blue and purple colors should match the existing Tailwind color palette (blue-600, purple-600)
