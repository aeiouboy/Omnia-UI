# Chore: Validate and Standardize Currency Comma Formatting

## Metadata
adw_id: `validate-currency-comma-formatting`
prompt: `Validate and fix all accounting/monetary values in the codebase to ensure they use comma formatting (e.g., "1,000" instead of "1000"). Check all currency displays, revenue figures, order totals, payment amounts, and financial metrics across all components and ensure consistent comma formatting using toLocaleString() or similar utilities.`

## Chore Description
Audit and standardize all monetary value displays across the codebase to ensure consistent comma formatting using Thai locale ('th-TH'). The codebase currently has three centralized currency utilities in `src/lib/currency-utils.ts`:
- `formatCurrencyInt()` - Whole numbers with commas (฿400,000)
- `formatCurrency()` - With decimals and commas (฿400.00)
- `formatCurrencyShort()` - Abbreviated with suffixes (฿0.4M, ฿400K)

However, many components bypass these utilities and use direct `.toLocaleString()` calls, `.toFixed()`, or manual string interpolation, leading to inconsistent formatting patterns. This chore will identify all monetary displays and standardize them to use the centralized utilities.

## Relevant Files

### Utility Files (Already Correct)
- **`src/lib/currency-utils.ts`** - Contains the three currency formatting utilities that should be used consistently
  - `formatCurrencyInt()` - For whole number amounts
  - `formatCurrency()` - For amounts with decimals
  - `formatCurrencyShort()` - For abbreviated chart displays

### Components Already Using Utilities Correctly ✅
- **`src/components/order-detail/payments-tab.tsx`** - Uses `formatCurrency()` for payment amounts
- **`src/components/order-detail/settled-items-table.tsx`** - Uses `formatCurrency()` for item amounts and totals
- **`src/components/executive-dashboard/kpi-cards.tsx`** - Uses `formatCurrencyInt()` for revenue KPIs

### High Priority Files (10+ Monetary Displays)
- **`src/components/executive-dashboard.tsx`** - Contains 10+ inconsistent currency displays with mixed `.toLocaleString()`, `.toFixed()`, and manual calculations
- **`src/components/analytics-tab.tsx`** - Legacy analytics tab with 7 mixed formatting patterns
- **`src/components/interactive-chart.tsx`** - 6 direct `.toLocaleString()` calls in drill-down charts

### Medium Priority Files (Chart Components)
- **`src/components/order-analysis/stacked-revenue-chart.tsx`** - 3 displays using `.toLocaleString()` and `.toFixed()` for Y-axis and tooltips
- **`src/components/order-analysis/stacked-order-chart.tsx`** - 2 displays with direct `.toLocaleString()` without locale specification
- **`src/components/executive-dashboard/orders-tab.tsx`** - Mixed patterns in chart Y-axis and recent orders table
- **`src/components/executive-dashboard/fulfillment-tab.tsx`** - Manual division calculations with `.toLocaleString()`
- **`src/components/executive-dashboard/analytics-tab.tsx`** - Chart tooltips and product cards with direct formatting

### Supporting Files
- **`src/components/kpi-card.tsx`** - Generic KPI display using `.toLocaleString()` for numeric values
- **`src/components/executive-dashboard/utils.ts`** - Utility functions with logging that use direct `.toLocaleString()`

### New Files
None - all changes will be updates to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Audit Current State
- Run comprehensive grep searches to identify all monetary value displays
- Document current formatting patterns in each file
- Categorize files by priority (high/medium/low) based on number of displays
- Create a baseline inventory of all currency formatting instances

### 2. Update High Priority Components
- **`src/components/executive-dashboard.tsx`**
  - Replace all direct `.toLocaleString()` calls with `formatCurrencyInt()` for whole numbers
  - Replace manual division calculations like `(value / 1000000).toFixed(1)M` with `formatCurrencyShort()`
  - Add import statement: `import { formatCurrencyInt, formatCurrencyShort } from '@/lib/currency-utils'`
  - Update all revenue displays, order totals, and summary cards

- **`src/components/analytics-tab.tsx`**
  - Standardize all 7 mixed formatting patterns to use appropriate currency utilities
  - Replace `.toFixed()` for revenue with `formatCurrency()`
  - Replace `.toLocaleString()` with `formatCurrencyInt()` where decimals aren't needed
  - Add currency utility imports

- **`src/components/interactive-chart.tsx`**
  - Update 6 direct `.toLocaleString()` calls in drill-down data point displays
  - Use `formatCurrencyInt()` for whole number displays
  - Ensure consistent formatting across all chart interactions
  - Add currency utility imports

### 3. Update Chart Components
- **`src/components/order-analysis/stacked-revenue-chart.tsx`**
  - Update Y-axis `tickFormatter` to use `formatCurrencyShort()` for abbreviated values
  - Update tooltip custom component to use `formatCurrencyInt()` instead of direct `.toLocaleString()`
  - Ensure locale is always specified as 'th-TH'
  - Add currency utility imports

- **`src/components/order-analysis/stacked-order-chart.tsx`**
  - Add locale specification to existing `.toLocaleString()` calls or replace with `formatCurrencyInt()`
  - Update tooltip displays for consistency
  - Add currency utility imports

- **`src/components/executive-dashboard/orders-tab.tsx`**
  - Update Y-axis formatter: Replace `value.toLocaleString('th-TH')` with `formatCurrencyInt(value, false)`
  - Update recent orders table: Replace `(order.total_amount || 0).toLocaleString('th-TH')` with `formatCurrencyInt(order.total_amount)`
  - Add currency utility imports

- **`src/components/executive-dashboard/fulfillment-tab.tsx`**
  - Replace manual calculation `(Number(value) / 1000000).toLocaleString('th-TH', {...})M` with `formatCurrencyShort(value)`
  - Update tooltip formatters to use currency utilities
  - Add currency utility imports

- **`src/components/executive-dashboard/analytics-tab.tsx`**
  - Update chart tooltip: Replace `Number(value).toLocaleString()` with `formatCurrencyInt(value)`
  - Update product cards: Replace `product.revenue.toLocaleString('th-TH')` with `formatCurrencyInt(product.revenue)`
  - Add currency utility imports

### 4. Update Supporting Components
- **`src/components/kpi-card.tsx`**
  - Review current `.toLocaleString()` usage for numeric displays
  - If used for monetary values, replace with appropriate currency utility
  - Add currency utility imports if needed

- **`src/components/executive-dashboard/utils.ts`**
  - Update logging statements with direct `.toLocaleString()` to use currency utilities for consistency
  - Ensure calculations maintain Thai locale formatting
  - Add currency utility imports

### 5. Create Custom Chart Formatter Utility (Optional Enhancement)
- Create `src/lib/chart-formatters.ts` with reusable chart value formatters
- Export functions like:
  - `formatChartCurrency(value)` - For Y-axis labels using `formatCurrencyInt()`
  - `formatChartCurrencyShort(value)` - For abbreviated Y-axis using `formatCurrencyShort()`
  - `formatChartTooltipCurrency(value)` - For tooltip displays
- Update chart components to use these shared formatters for consistency

### 6. Validate All Changes
- Build the application to ensure no TypeScript errors: `pnpm build`
- Start development server and manually test each updated component: `pnpm dev`
- Verify currency displays show proper comma formatting (e.g., ฿400,000 not ฿400000)
- Test chart tooltips and axis labels for correct formatting
- Check KPI cards, order tables, and analytics displays
- Verify Thai locale is consistently applied ('th-TH')
- Test abbreviated formats (K, M, B) display correctly

### 7. Documentation Update
- Update `CLAUDE.md` with new currency formatting standards section
- Document the three currency utilities and their use cases
- Add examples of correct vs incorrect formatting patterns
- Document the optional chart formatter utilities if created

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `pnpm lint` - Run ESLint to catch any code quality issues
- `pnpm dev` - Start development server and manually verify:
  - Executive Dashboard KPI cards show comma-formatted revenue
  - Order Analysis charts display formatted currency on Y-axis and tooltips
  - Order Management Hub shows formatted order totals
  - Order Detail View displays formatted payment amounts
  - All monetary values use Thai locale comma separators (1,000 not 1000)
- `grep -r "toLocaleString()" src/components/ --include="*.tsx"` - Verify remaining `.toLocaleString()` calls are for non-monetary values (dates, percentages, etc.)
- `grep -r "\.toFixed(" src/components/ --include="*.tsx"` - Verify `.toFixed()` is only used for percentages or specific decimal formatting, not currency

## Notes

### Current State Summary
- **30+ components** have monetary value displays
- **3 centralized utilities** exist but are underutilized
- **Inconsistent patterns** include:
  - Direct `.toLocaleString()` without locale (8+ locations)
  - `.toLocaleString('th-TH')` inline (5+ locations)
  - Manual division with `.toFixed()` for abbreviations (6+ locations)
  - Mixed approaches within single files

### Key Benefits
- **Consistency**: All monetary values formatted the same way
- **Maintainability**: Single source of truth for currency formatting logic
- **Localization**: Proper Thai locale support across all displays
- **Readability**: Easier to understand code with semantic function names
- **Future-proofing**: Easy to update currency formatting rules globally

### Edge Cases to Consider
- **Chart libraries**: Some Recharts formatters may need wrapper functions
- **Export utilities**: CSV exports may need raw numbers without formatting
- **API responses**: Ensure formatting is applied at display layer, not data layer
- **Null/undefined values**: All currency utilities handle null/undefined gracefully
- **Negative values**: Test display of refunds or negative amounts

### Testing Checklist
- [ ] KPI cards show ฿400,000 format (with commas)
- [ ] Chart Y-axis shows abbreviated format (฿0.4M or ฿400K)
- [ ] Chart tooltips show full format (฿400,000)
- [ ] Order tables show comma-formatted totals
- [ ] Payment detail displays use consistent formatting
- [ ] Analytics cards show comma-formatted revenue
- [ ] No console errors related to formatting functions
- [ ] Build completes successfully with no warnings
