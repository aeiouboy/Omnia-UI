# UI/UX Analysis - Omnia-UI Application

## Overview

This document contains a comprehensive UI/UX analysis of all pages in the Omnia-UI application with recommended ADW prompts for improvements.

**Pages Analyzed:**
1. Executive Dashboard
2. Order Dashboard
3. Order Management
4. Inventory Availability
5. Stock Card
6. Stock Config

**Screenshots captured:** `/docs/ui/01-06*.png`

---

## 1. Executive Dashboard

**Screenshot:** `01-executive-dashboard.png`

### Current State
- KPI cards showing Orders Processing (24), SLA Breaches (17), Revenue (114,483), Fulfillment Rate (16%)
- Channel Performance Analytics bar chart with rotated x-axis labels
- Order Alerts section with SLA breach details
- Approaching SLA section listing orders with time remaining

### UI/UX Issues Identified
1. **Chart X-axis Labels**: Channel names are rotated/angled, making them harder to read
2. **Truncated Store Names**: Store names like "Tops Central Plaza ลาด..." are cut off
3. **Order Alerts Vertical Space**: The alerts section consumes significant vertical space
4. **Alert Card Information Density**: Breach details could be more compact
5. **Color Contrast**: Red "3m over" text could have better contrast for accessibility

### ADW Prompt
```bash
uv run adws/adw_chore_implement.py "Improve Executive Dashboard UI in components/executive-dashboard.tsx: (1) Rotate chart x-axis labels to horizontal or 45-degree angle for better readability, (2) Truncate store names with ellipsis and show full name on hover tooltip, (3) Make Order Alerts section more compact by reducing card padding and using a scrollable container with max-height, (4) Improve SLA breach text color contrast for accessibility (use darker red bg with white text), (5) Add consistent spacing between KPI cards and chart sections"
```

---

## 2. Order Dashboard

**Screenshot:** `02-order-dashboard.png`

### Current State
- Header with Orders/Revenue/Both toggle and date range picker
- Total Orders and Total Revenue summary cards
- Order Summary Per Day stacked bar chart
- Revenue Summary Per Day stacked bar chart
- Channel legend (TOL, MKP, QC, Grab, Line Man, Gokoo)

### UI/UX Issues Identified
1. **Empty State Handling**: Charts show empty grid lines when no data - should show "No data" message
2. **Summary Cards Position**: Cards are between header and charts, could be more prominent
3. **Chart Headers**: "Order Summary Per Day" titles could be more visually distinct
4. **Legend Position**: Bottom legend works but could be inline with chart header for space efficiency
5. **Date Picker**: Current placement is functional but could be more visually grouped

### ADW Prompt
```bash
uv run adws/adw_chore_implement.py "Improve Order Dashboard UI at app/order-analysis/page.tsx: (1) Add empty state overlay for charts when Total Orders or Total Revenue is 0 showing 'No data available for selected period' message, (2) Make summary cards (Total Orders, Total Revenue) more prominent with larger font size for values and subtle shadow, (3) Move chart legend inline next to chart title for better space utilization, (4) Add visual grouping for date picker and export button with subtle border or background, (5) Increase chart title font weight from regular to semibold for better hierarchy"
```

---

## 3. Order Management

**Screenshot:** `03-order-management.png`

### Current State
- Main Filters section with search, status dropdowns, date pickers
- Advanced Filters toggle
- 16-column table with order data
- Pagination at bottom

### UI/UX Issues Identified
1. **Email Column Truncation**: Email values like "customer3@exam..." are truncated without tooltip
2. **Table Horizontal Scroll**: 16 columns require horizontal scrolling, scroll indicator not visible
3. **Row Highlight Colors**: SLA breach rows have yellow/red backgrounds - ensure consistent contrast
4. **Filter Layout**: Main filters row could use better visual grouping
5. **Store No Column**: Values like "STR-6019" are vertically split (STR- on one line, number below)

### ADW Prompt
```bash
uv run adws/adw_chore_implement.py "Improve Order Management table UI in src/components/order-management-hub.tsx: (1) Add title attribute/tooltip to Email column cells to show full email on hover, (2) Add horizontal scroll indicator (shadow or gradient) on table edges when content overflows, (3) Ensure SLA breach row backgrounds have sufficient contrast with text (minimum WCAG AA), (4) Prevent Store No values from word-wrapping - use white-space: nowrap or min-width, (5) Add visual grouping to Main Filters with subtle background or border-bottom separator before Advanced Filters toggle"
```

---

## 4. Inventory Availability

**Screenshot:** `04-inventory-availability.png`

### Current State
- Four search fields: Store ID, Store Name, Product ID (truncated), Product Name (truncated)
- Two dropdowns: All Supply Types, All View Types
- Clear All button
- Empty state with icon and instructional message

### UI/UX Issues Identified
1. **Search Field Truncation**: "Search Product I" and "Search Product Na" are truncated
2. **Filter Row Layout**: Search fields could have consistent widths
3. **Empty State**: Good design, but icon could be slightly larger
4. **Dropdown Alignment**: Supply Types and View Types dropdowns could be better aligned
5. **Visual Grouping**: Store fields and Product fields could have subtle grouping

### ADW Prompt
```bash
uv run adws/adw_chore_implement.py "Improve Inventory Availability UI at app/inventory/page.tsx: (1) Increase search field widths to show full placeholder text (Search Store ID, Search Store Name, Search Product ID, Search Product Name) - use min-width: 180px, (2) Add subtle visual grouping between Store fields and Product fields using a vertical divider or spacing, (3) Make empty state icon 20% larger for better visual balance, (4) Ensure dropdowns have consistent width with search fields, (5) Add placeholder fade animation when field is focused"
```

---

## 5. Stock Card

**Screenshot:** `05-stock-card.png`

### Current State
- View type dropdown (All Views) followed by Store ID and Store Name search fields
- Clear All button
- Empty state with icon and two-line instructional message

### UI/UX Issues Identified
1. **View Type Dropdown Position**: First position in filter row, could be visually distinct as primary filter
2. **Search Fields Width**: Could be wider for better touch targets on tablet
3. **Empty State Message**: Two lines of text could be condensed
4. **Filter Row Consistency**: Layout differs slightly from Inventory Availability page
5. **Clear All Button**: Uses text style, could be more visible

### ADW Prompt
```bash
uv run adws/adw_chore_implement.py "Improve Stock Card UI at app/inventory-new/stores/page.tsx or app/inventory/stores/page.tsx: (1) Make View Type dropdown visually distinct with subtle background or different border color as it's the primary filter, (2) Increase search field min-width to 160px for better touch targets, (3) Condense empty state message to single line: 'Select a view type or search for a store to display data', (4) Align filter layout to match Inventory Availability page for consistency, (5) Add subtle hover effect to Clear All button for better affordance"
```

---

## 6. Stock Config

**Screenshot:** `06-stock-config.png`

### Current State
- Summary cards: Total Configurations (5), Daily Configs (2), One-time Configs (3), Upload Status with counts
- All Stock Configurations table with filters and tabs
- Upload History table with status indicators and actions

### UI/UX Issues Identified
1. **Filter Truncation**: "Filter by Loca" and "Filter by Item" placeholders are truncated
2. **Table Row Density**: Good spacing but could be slightly more compact for data-heavy views
3. **Upload Status Card**: Clickable appearance but interaction not immediately obvious
4. **Tab Styling**: All Configs/PreOrder/OnHand tabs could have better selected state indication
5. **Records Column**: "X valid / Y invalid" format is good but color coding could be stronger

### ADW Prompt
```bash
uv run adws/adw_chore_implement.py "Improve Stock Config UI at app/stock-config/page.tsx: (1) Increase filter input widths to show full placeholder text (Filter by Location ID, Filter by Item ID) - use min-width: 160px, (2) Add hover effect to Upload Status card to indicate clickability, (3) Enhance tab selected state with thicker bottom border and bolder font weight, (4) Make valid/invalid counts more distinct with green background for valid and red background for invalid badges, (5) Add subtle row hover effect to both tables for better scanability"
```

---

## Cross-Page Consistency Improvements

### ADW Prompt for Global Improvements
```bash
uv run adws/adw_chore_implement.py "Standardize UI patterns across all pages: (1) Ensure all search/filter input fields have minimum width of 160px to prevent placeholder truncation, (2) Standardize empty state icons to consistent 64px size across Inventory Availability, Stock Card, and Order Management, (3) Add consistent horizontal scroll indicators to all data tables that overflow, (4) Standardize Clear All button styling with hover:bg-gray-100 effect across all filter sections, (5) Ensure all dropdown filters have consistent width and alignment across pages"
```

---

## Summary

| Page | Priority Issues | ADW Prompt File |
|------|-----------------|-----------------|
| Executive Dashboard | Chart labels, truncated names, alert density | `prompt-01-executive-dashboard.txt` |
| Order Dashboard | Empty states, chart headers, legend position | `prompt-02-order-dashboard.txt` |
| Order Management | Email tooltips, scroll indicator, row contrast | `prompt-03-order-management.txt` |
| Inventory Availability | Field widths, visual grouping, empty state | `prompt-04-inventory-availability.txt` |
| Stock Card | View dropdown styling, field widths, consistency | `prompt-05-stock-card.txt` |
| Stock Config | Filter widths, tab styling, clickable hints | `prompt-06-stock-config.txt` |

---

*Generated: 2026-01-18*
*Tool: Playwright MCP + Claude Analysis*
