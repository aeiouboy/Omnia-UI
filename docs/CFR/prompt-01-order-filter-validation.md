# Prompt 1: Order Page Filter Validation & Export Date Restriction

Implement order page filtering validation and export date restriction:

## Order Filter Validation (ALL Filters)

### Basic Filters
- Status filter
- Date range filter (Order Date From/To)
- Search functionality
- Channel filter
- Store filter

### Advanced Filtering
- Validate ALL advanced filtering options work correctly
- Multi-select filters
- Combined filter scenarios
- Filter persistence across page navigation

### Quick Filters - DISABLE ALL
- **DISABLE all Quick Filters on order page**
- Remove Quick Filter buttons/chips
- Keep only standard filtering dropdowns and advanced filters

## Export Date Restriction (6-Month Backward Limit)
- When user exports orders, limit 'Order Date From' to maximum 6 months backward
- Disable dates beyond 6 months in the date picker
- Show tooltip or message explaining the 6-month limitation
- Apply this restriction only to export functionality, not general filtering

## Files to investigate:
- app/orders/ - Order page components
- src/components/ - Order-related components
- Export functionality components
- Quick filter components (to disable)
