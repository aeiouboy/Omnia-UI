# Chore: Improve Stock Card Page UX/UI

## Metadata
adw_id: `1d29b974`
prompt: `Improve Stock Card page UX/UI at app/inventory-new/stores/page.tsx following Omnia-UI design system. Focus on user-friendliness, ease of use, and understanding. Current issues: (1) Steep learning curve - 3 mandatory filters (Date Range + Product + Store) with orange border validation, users don't know where to start. (2) Cognitive overload - 8+ input fields visible at once with unclear hierarchy. (3) Poor discoverability - subtle tab toggle between By Product and By Store views. (4) Cryptic View Type codes like ECOM-TH-CFR-LOCD-STD. (5) No inline guidance for 2-character minimum requirement. SOLUTIONS: Progressive disclosure filter wizard with step-by-step UI, filter grouping (mandatory vs optional) using existing Card components with status-warning/success colors, enhanced View Type Select with human-readable labels and icons, inline validation feedback using Alert components with character counters, improved empty states using InventoryEmptyState pattern, transaction table enhancements with sticky legend bar using existing Badge patterns, mobile bottom Sheet for filters. MUST USE existing Omnia-UI components: Card, Badge, Button, Input, Select, Table, Tabs, Skeleton, Alert, Sheet, Collapsible. MUST USE existing colors: status-success (#10b981), status-warning (#f59e0b), status-critical (#ef4444), status-info (#3b82f6). MUST USE existing fonts: font-sans (Inter), font-heading (Poppins), font-mono (JetBrains Mono). Create specification document first, then provide implementation plan only - DO NOT implement code yet.`

## Chore Description

This chore addresses critical UX/UI issues in the Stock Card page (`app/inventory-new/stores/page.tsx`) that create friction for users attempting to view inventory transaction history. The current implementation suffers from:

### Current Problems

1. **Steep Learning Curve**: Three mandatory filters (Date Range, Product, Store) with orange border validation provide no guidance on where to start. Users see all requirements at once without a clear path forward.

2. **Cognitive Overload**: 8+ input fields visible simultaneously with unclear hierarchy between mandatory and optional filters. Users cannot distinguish "must fill" from "nice to have" fields.

3. **Poor Discoverability**: The tab toggle between "By Product" and "By Store" views is subtle and easily missed. Users may not realize two distinct modes exist.

4. **Cryptic View Type Codes**: Technical codes like `ECOM-TH-CFR-LOCD-STD` are displayed without human-readable explanations, requiring users to memorize system terminology.

5. **No Inline Guidance**: The 2-character minimum search requirement has no visual feedback until the user wonders why nothing is happening.

### Solution Overview

Transform the filter experience using progressive disclosure, clear visual hierarchy, and guided workflow patterns:

- **Progressive Disclosure Wizard**: Step-by-step filter completion with numbered steps and visual progress indicators
- **Filter Grouping**: Mandatory filters in a highlighted Card with validation states; optional filters in a collapsible secondary section
- **Enhanced View Type Select**: Human-readable labels with icons, showing the technical code in muted text
- **Inline Validation**: Real-time character counters, validation messages using Alert components
- **Improved Empty States**: Context-aware guidance based on what filters are missing
- **Transaction Legend Bar**: Sticky horizontal bar explaining transaction type badges
- **Mobile Sheet**: Bottom drawer for filters on mobile devices

## Relevant Files

### Primary File (To Be Modified)
- **`app/inventory-new/stores/page.tsx`** (1382 lines) - Main Stock Card page containing:
  - Tab toggle (lines 669-674)
  - By Store view filters (lines 681-786)
  - By Product view filters (lines 919-1108)
  - Transaction table (lines 1134-1374)
  - Current empty states (lines 789-794, 1111-1123)

### UI Components (To Be Used)
- **`src/components/ui/card.tsx`** - Card, CardContent, CardHeader, CardTitle, CardDescription for filter grouping
- **`src/components/ui/alert.tsx`** - Alert, AlertTitle, AlertDescription for validation messages
- **`src/components/ui/sheet.tsx`** - Sheet, SheetContent, SheetHeader, SheetTitle for mobile filter drawer
- **`src/components/ui/collapsible.tsx`** - Collapsible, CollapsibleTrigger, CollapsibleContent for optional filters
- **`src/components/ui/skeleton.tsx`** - Skeleton for loading states
- **`src/components/ui/badge.tsx`** - Badge for step indicators and transaction type legend

### Inventory Components (Reference)
- **`src/components/inventory/inventory-empty-state.tsx`** - Existing empty state pattern to extend
- **`src/components/inventory/product-info-card.tsx`** - Reference for Card styling patterns

### Design System References
- **`tailwind.config.ts`** - Status colors: status-success, status-warning, status-critical, status-info
- **`app/globals.css`** - Typography utilities and color variables

### New Files

#### `src/components/inventory/stock-card-filter-wizard.tsx`
New component encapsulating the progressive filter wizard with step indicators.

#### `src/components/inventory/transaction-type-legend.tsx`
Reusable sticky legend bar showing transaction type badge meanings.

#### `src/components/inventory/stock-card-mobile-filters.tsx`
Mobile-optimized filter Sheet component with bottom drawer pattern.

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Transaction Type Legend Component
Create a reusable legend bar for transaction types that can be displayed above the table.

- Create file `src/components/inventory/transaction-type-legend.tsx`
- Export `TransactionTypeLegend` component
- Display horizontal bar with 3 transaction type badges:
  - Stock In: Green badge with ArrowUp icon
  - Stock Out: Red badge with ArrowDown icon
  - Adjustment: Cyan badge with RefreshCw icon
- Use existing `simplifiedTypeConfig` pattern from the page
- Style with `sticky top-0 bg-white/95 backdrop-blur-sm py-2 px-4 border-b z-10`
- Add "Legend:" label prefix in muted text

### 2. Create Filter Step Indicator Component
Build a reusable step indicator showing progress through mandatory filters.

- Create inline component or helper in the page (not a separate file for simplicity)
- `FilterStepIndicator` props: `{ steps: Array<{ label: string; completed: boolean }> }`
- Display numbered circles (1, 2, 3) with connecting lines
- Completed steps: `bg-status-success` with CheckCircle icon
- Current step: `border-status-warning` with pulsing animation
- Future steps: `bg-muted` with number
- Labels below each step in `text-xs font-medium`

### 3. Enhance View Type Select with Human-Readable Labels
Update STOCK_CARD_VIEW_TYPES configuration and Select rendering.

- Modify `STOCK_CARD_VIEW_TYPES` array (lines 82-88) to add icons and better descriptions:
  ```typescript
  {
    value: "ECOM-TH-CFR-LOCD-STD",
    label: "E-Commerce Standard (CFR)",
    shortLabel: "TOL",
    description: "Central Food Retail - Local Distribution",
    icon: Store  // Lucide icon
  }
  ```
- Update Select rendering to show:
  - Icon on the left
  - Human-readable label as primary text
  - Technical code in `font-mono text-xs text-muted-foreground`
- Increase SelectTrigger width to `w-[320px]` to accommodate longer labels

### 4. Add Inline Validation with Character Counter
Implement real-time validation feedback for search inputs.

- Create helper component `InputWithValidation`:
  ```typescript
  interface InputWithValidationProps {
    value: string
    minChars: number
    label: string
    placeholder: string
    onChange: (value: string) => void
    isRequired: boolean
  }
  ```
- Show character counter below input: `"${value.length}/${minChars} characters"`
- Color states:
  - Empty + required: `text-status-warning`
  - Partial (1 char): `text-status-warning`
  - Valid (2+ chars): `text-status-success`
- Display validation message only when partially filled: "Enter at least 2 characters"

### 5. Redesign By Product View Filter Layout - Mandatory Section
Restructure the filter area with clear mandatory vs optional grouping.

- Wrap mandatory filters in Card with conditional styling:
  ```jsx
  <Card className={cn(
    "border-2 transition-colors",
    hasAllMandatoryFilters
      ? "border-status-success bg-green-50/30"
      : "border-status-warning bg-amber-50/30"
  )}>
  ```
- Add CardHeader with step progress indicator
- CardContent contains 3 grouped sections with visual connectors:
  - **Step 1: Date Range** - Existing date pickers with validation highlight
  - **Step 2: Store** - Store ID/Name inputs with character counters
  - **Step 3: Product** - Product ID/Name inputs with character counters
- Add completion badge in CardHeader showing "X of 3 required filters complete"

### 6. Redesign By Product View Filter Layout - Optional Section
Move Transaction Type and Notes search into collapsible optional section.

- Import `Collapsible, CollapsibleTrigger, CollapsibleContent` from UI components
- Wrap optional filters in Collapsible:
  ```jsx
  <Collapsible defaultOpen={false}>
    <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
      <ChevronDown className="h-4 w-4" />
      Optional Filters
    </CollapsibleTrigger>
    <CollapsibleContent className="pt-4">
      {/* Transaction Type and Notes filters */}
    </CollapsibleContent>
  </Collapsible>
  ```
- Include Transaction Type dropdown and Notes search inside
- Auto-expand if user has already set optional filters

### 7. Enhance Empty State for By Product View
Create context-aware empty state showing which filters are missing.

- Replace generic empty state (lines 1111-1123) with checklist:
  ```jsx
  <Card className="border-dashed">
    <CardContent className="py-12">
      <div className="flex flex-col items-center">
        <ClipboardList className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <p className="text-lg font-medium mb-4">Complete required filters to view stock card</p>
        <div className="space-y-2">
          {!hasValidDateRange && (
            <div className="flex items-center gap-2 text-status-warning">
              <XCircle className="h-4 w-4" />
              <span>Select date range</span>
            </div>
          )}
          {!hasValidByProductStoreCriteria && (
            <div className="flex items-center gap-2 text-status-warning">
              <XCircle className="h-4 w-4" />
              <span>Enter store ID or name (min. 2 characters)</span>
            </div>
          )}
          {!hasValidProductCriteria && (
            <div className="flex items-center gap-2 text-status-warning">
              <XCircle className="h-4 w-4" />
              <span>Enter product ID or name (min. 2 characters)</span>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
  ```
- Show checkmarks for completed criteria instead of X

### 8. Add Transaction Type Legend Bar to Table
Insert sticky legend above transaction table.

- Add legend bar between CardHeader and table content
- Display inside the Card but before `<CardContent className="p-0">`
- Legend content:
  ```jsx
  <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b px-4 py-2.5 flex items-center gap-6">
    <span className="text-xs font-medium text-muted-foreground">Legend:</span>
    <div className="flex items-center gap-4">
      <Badge className="bg-green-100 text-green-700 border-green-200">
        <ArrowUp className="h-3 w-3 mr-1" /> Stock In
      </Badge>
      <Badge className="bg-red-100 text-red-700 border-red-200">
        <ArrowDown className="h-3 w-3 mr-1" /> Stock Out
      </Badge>
      <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200">
        <RefreshCw className="h-3 w-3 mr-1" /> Adjustment
      </Badge>
    </div>
  </div>
  ```

### 9. Enhance Tab Toggle Visibility
Make the By Product / By Store toggle more prominent.

- Move Tabs component to a more prominent position (below page title, above filters)
- Increase visual weight:
  ```jsx
  <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as ViewTab)}>
    <TabsList className="grid w-full max-w-md grid-cols-2 h-12 p-1 bg-muted">
      <TabsTrigger
        value="by-product"
        className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-base font-medium"
      >
        <Package className="h-4 w-4 mr-2" />
        By Product
      </TabsTrigger>
      <TabsTrigger
        value="by-store"
        className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-base font-medium"
      >
        <Store className="h-4 w-4 mr-2" />
        By Store
      </TabsTrigger>
    </TabsList>
  </Tabs>
  ```
- Add icons to each tab for better visual identification

### 10. Implement Skeleton Loading States
Add proper loading skeletons for filters and table.

- Create skeleton layout matching filter structure:
  ```jsx
  {isLoading && (
    <div className="space-y-4">
      <Skeleton className="h-10 w-[320px]" /> {/* View Type */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-[140px]" />
        <Skeleton className="h-10 w-[140px]" />
      </div>
    </div>
  )}
  ```
- Table skeleton: 5 rows with badge-shaped skeletons for type column
- Use consistent `animate-pulse` timing

### 11. Create Mobile Filter Sheet
Implement bottom Sheet drawer for mobile filter experience.

- Import Sheet components
- Add state `const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)`
- Add floating filter button visible only on mobile (`md:hidden`):
  ```jsx
  <Button
    variant="outline"
    size="lg"
    className="fixed bottom-4 right-4 shadow-lg md:hidden"
    onClick={() => setMobileFiltersOpen(true)}
  >
    <Filter className="h-4 w-4 mr-2" />
    Filters
    {hasAllMandatoryFilters && <CheckCircle className="h-4 w-4 ml-2 text-status-success" />}
  </Button>
  ```
- Sheet content mirrors desktop filters with vertical stacking
- Apply Filter and Clear All buttons in SheetFooter

### 12. Update By Store View Filter Consistency
Apply same improvements to By Store view.

- Enhanced View Type Select (same as Step 3)
- Optional filters (Store search) in muted Card section without mandatory styling
- Improved empty state showing "Select View Type" with icon
- Skeleton loading states

### 13. Add ARIA Labels and Accessibility Improvements
Ensure all new components meet WCAG 2.1 AA requirements.

- Add `aria-label` to step indicators
- Add `role="status"` to validation messages
- Add `aria-live="polite"` to character counters
- Ensure 44px minimum touch targets on mobile
- Add `sr-only` labels for icon-only buttons

### 14. Validate Build and Test
Ensure no regressions and all features work correctly.

- Run `pnpm build` to check TypeScript compilation
- Test By Product view flow:
  - Step indicators show correct state
  - Character counters update in real-time
  - Empty state shows missing filter checklist
  - Transaction legend displays correctly
  - Mobile sheet works on narrow viewport
- Test By Store view:
  - Enhanced View Type dropdown displays correctly
  - Empty state is context-appropriate
- Test tab switching preserves filter state

## Validation Commands

Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compiles without errors
- `pnpm lint` - Check for linting issues
- `pnpm dev` - Start development server and manually verify at http://localhost:3000/inventory-new/stores:

### By Product View Validation
1. Initial state shows step indicators (1-2-3 with all pending)
2. Date Range picker has orange border, selecting dates marks step 1 complete
3. Store inputs show "0/2 characters" counter, typing shows "1/2 characters", "2/2 characters" turns green
4. Product inputs have same character counter behavior
5. As steps complete, Card border transitions from orange to green
6. Empty state shows checklist of incomplete filters with X icons
7. All filters complete: data loads, legend bar visible above table
8. Optional filters section is collapsed by default
9. Expanding optional filters shows Transaction Type and Notes

### By Store View Validation
1. View Type dropdown shows human-readable labels with icons
2. Technical code visible in muted text
3. Empty state shows "Select View Type to view stock card"
4. After selecting View Type, store search filters are optional (no orange border)

### Mobile Validation
1. At viewport < 768px, floating "Filters" button appears
2. Tapping button opens bottom Sheet with all filters
3. Apply Filters button closes sheet and loads data
4. Filter completion badge shows on floating button

### Accessibility Validation
1. Tab through all interactive elements - focus visible and logical order
2. Screen reader announces step completion status
3. Touch targets are at least 44x44px on mobile

## Notes

### Design System Compliance
- All colors use existing Tailwind classes: `status-success`, `status-warning`, `status-critical`, `status-info`
- All fonts use CSS variables: `font-sans` (Inter), `font-heading` (Poppins), `font-mono` (JetBrains Mono)
- All components use existing shadcn/ui primitives
- No new external dependencies required

### Component Reusability
- `TransactionTypeLegend` can be reused in other inventory pages
- `InputWithValidation` pattern can be extracted to shared component if needed elsewhere
- Mobile Sheet pattern aligns with Order Management Hub mobile design

### Backward Compatibility
- Existing URL parameter handling unchanged
- Filter state management unchanged
- Data fetching logic unchanged
- Export CSV functionality unchanged

### Performance Considerations
- Skeleton loading prevents layout shift
- Character counter uses local state (no debounce needed)
- Legend bar uses `backdrop-blur-sm` for subtle glassmorphism without heavy rendering

### Future Enhancements (Out of Scope)
- Saved filter presets
- Recent searches history
- Keyboard shortcuts for filter navigation
- Voice input for search fields
