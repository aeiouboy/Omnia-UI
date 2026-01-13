# Task 4: Inventory Management - Mandatory View Filtering

## Objective
Implement mandatory view selection before displaying inventory data

## Requirements
- Add view filter as the FIRST filter element at the top of the page
- User MUST select a view before inventory data is displayed
- Default state: Show empty state with message "Please select a view to display inventory"
- View filter options (define based on business logic):
  - All Inventory
  - Available Stock Only
  - Low Stock Items
  - Out of Stock Items
  - Reserved Stock
  - Damaged/Quarantine Stock
  - By Warehouse (with sub-selection)
  - By Channel (if applicable)
- Once view is selected, load and display inventory matching the view criteria
- Persist view selection in URL parameters for shareability
- Add visual indicator showing which view is currently active
- Allow view change without page reload (dynamic filtering)

## UI Flow
1. Page loads → Show view selector prominently
2. User selects view → Fetch data for that view
3. Display inventory table with selected view data
4. Show active view indicator in header/breadcrumb
5. Allow quick view switching via dropdown or tabs

## URL Structure
```
/inventory?view=available-stock
/inventory?view=low-stock
/inventory?view=warehouse&warehouse_id=WH001
```

## UI Components Needed
- Prominent view selector (dropdown or tabs)
- Empty state component with instruction message
- Active view indicator badge/label
- Loading state during view switch
- URL parameter management

## Technical Implementation
- Use URL search params for view state
- Implement dynamic data fetching based on view
- Add proper TypeScript types for view options
- Use existing filter components if available
- Ensure proper error handling

## Success Criteria
- [ ] View selector is first element on page
- [ ] Empty state shows when no view selected
- [ ] Data loads after view selection
- [ ] View parameter persists in URL
- [ ] Active view clearly indicated
- [ ] View switching works without reload
- [ ] Mobile responsive selector
- [ ] No console errors

## ADW Execution
```bash
./adws/adw_chore_implement.py "Implement mandatory view filtering on Inventory Management page. User must select a view (All Inventory, Available Stock Only, Low Stock, Out of Stock, Reserved Stock, Damaged/Quarantine, By Warehouse, By Channel) before inventory data displays. Show empty state with 'Please select a view to display inventory' message initially. Persist view selection in URL parameters, add visual indicator for active view, and enable dynamic view switching without page reload." --model opus
```
