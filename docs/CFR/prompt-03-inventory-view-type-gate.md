# Prompt 3: Inventory Management - View Type Selection Gate

Implement View Type selection gate for Inventory Management page:

## Requirement
User MUST select View Type first before accessing other Inventory Management menus.

## View Type Configuration Table
| View Type | BU | Channel |
|-----------|-----|---------|
| ECOM-TH-CFR-LOCD-STD | CFR | TOL |
| ECOM-TH-CFR-LOCD-STD | CFR | MKP |
| MKP-TH-CFR-LOCD-STD | CFR | QC |
| ECOM-TH-DSS-NW-STD | DS | STD (Standard Delivery and Standard Pickup) |
| ECOM-TH-DSS-LOCD-EXP | DS | EXP (3H delivery and 1H pickup) |

## Implementation
- Add View Type dropdown/selector at top of Inventory Management page
- Disable/lock other menu items until View Type is selected
- Store selected View Type in state/context for use across inventory pages
- When View Type selected, automatically apply BU and Channel filters

## Remove Channel Filter
- Remove 'Channel' filtering dropdown from Inventory Management page
- Channel is determined by View Type selection (from table above)
- Inventory data automatically filtered based on View Type → BU → Channel mapping

## Files to investigate:
- app/inventory/ - Inventory page
- src/components/inventory/ - Inventory components
- src/contexts/ - Context providers for state
