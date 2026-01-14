# Prompt 8: Order Analysis - Summary Views & Export

Implement Order Analysis page with stacked bar chart summary views and CSV export:

## Overview
Display total order and revenue summary per day analysis with **STACKED bar charts**.

## Chart Layout - Two Stacked Views

### Chart 1: Order/Day (Top Chart)
- **Stacked bar chart** showing order count by date
- X-axis: Dates (e.g., 14-Jan, 15-Jan, 16-Jan, 17-Jan)
- Y-axis: Order count (0 to 4000)
- Stacked by channel with these colors:
  - Grab (Dark Blue)
  - Line Man (Orange)
  - Gokoo (Dark Green)
  - TOL (Light Blue) - largest segment
  - MKP (Purple)

### Chart 2: Revenue/Day (Bottom Chart)
- **Stacked bar chart** showing revenue by date
- X-axis: Dates (same as Order/Day)
- Y-axis: Revenue in Thai Baht (0 to 2,000,000)
- Stacked by channel with same color scheme:
  - Grab (Dark Blue)
  - Line Man (Orange)
  - Gokoo (Dark Green)
  - TOL (Light Blue) - largest segment
  - MKP (Purple)

## Channel Legend
Both charts share the same legend showing all 5 channels:
- Grab
- Line Man
- Gokoo
- TOL
- MKP

## View Toggle
- Toggle between 'Order Summary Per Day' and 'Revenue Summary Per Day' views
- Or display both charts stacked vertically (as shown in reference image)

## Export Functionality
- Single **Export Button** (not a full panel)
- Export to CSV with these columns:
  - Date
  - Total Amount (Total Revenue)
  - Order Count by Channel:
    - TOL Order Count
    - MKP Order Count
    - QC Order Count
- UTF-8 encoding with BOM for Excel compatibility
- Save exports to: `/Users/naruechon/Omnia-UI/docs/CFR/`
- Filename format: `order_analysis_export_{YYYY-MM-DD}.csv`

## Export CSV Format Example
```csv
Date,Total Amount,TOL Orders,MKP Orders,QC Orders
2026-01-14,1750000,3000,400,200
2026-01-15,850000,1500,200,100
2026-01-16,750000,1200,300,100
2026-01-17,650000,900,300,100
```

## Files to investigate:
- src/components/order-analysis/ - Existing order analysis components
- src/hooks/use-order-summary.ts - Order summary hooks
- src/lib/export-utils.ts - Export utilities
- src/types/sale-summary.ts - Type definitions
- app/api/orders/summary/ - API endpoints

## Technical Notes
- Use Recharts StackedBarChart or ComposedChart
- Channel colors should be consistent across both charts
- Currency format: Thai Baht with thousand separators
- Date format: DD-MMM (e.g., 14-Jan)
