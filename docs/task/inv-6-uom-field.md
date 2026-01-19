# Task 6: Inventory Management - UOM (Unit of Measurement) Field

## Objective
Add Unit of Measurement field to inventory items

## Requirements
- Add "UOM" column to inventory management table
- Support common UOM types:
  - **Piece/Each** (EA, PC, PCS)
  - **Box** (BOX, CTN - Carton)
  - **Weight**: KG, LB, G, OZ, TON
  - **Volume**: L, ML, GAL
  - **Length**: M, CM, FT, IN
  - **Custom**: User-defined UOMs
- Add UOM filter/search in filtering section
- Display UOM next to quantity fields
- Add UOM to inventory detail page
- Add UOM to add/edit inventory forms
- Support UOM conversion rules (if applicable):
  - Base UOM and conversion factors
  - Example: 1 BOX = 12 PCS
- Update quantity displays to include UOM:
  - "100 PCS" instead of just "100"
  - "50.5 KG" instead of just "50.5"
- Validate quantity input based on UOM type:
  - Integer only for pieces/boxes
  - Decimal allowed for weight/volume
- Add UOM to export functionality

## Data Structure
```typescript
interface UOM {
  code: string // 'EA', 'KG', 'BOX', etc.
  name: string // 'Each', 'Kilogram', 'Box', etc.
  type: 'piece' | 'weight' | 'volume' | 'length' | 'custom'
  allow_decimal: boolean
  base_uom?: string // For conversions
  conversion_factor?: number // How many base units in this UOM
}

interface InventoryItem {
  // ... existing fields
  uom_code: string
  uom_name: string
  quantity: number
  // Display as: `${quantity} ${uom_code}`
}
```

## Example Display
- Stock: 1,234 PCS
- Available: 856 KG
- Reserved: 120 BOX

## UI Components Needed
- UOM column in table
- UOM selector in forms (searchable dropdown)
- UOM filter (multi-select)
- Quantity + UOM display format
- UOM-specific quantity validation
- Conversion calculator (if implementing conversions)

## Success Criteria
- [ ] UOM column visible in table
- [ ] Common UOM types supported
- [ ] Quantities display with UOM (e.g., "100 PCS")
- [ ] UOM filter works correctly
- [ ] Detail page shows UOM
- [ ] Forms include UOM selector
- [ ] Integer validation for piece/box UOMs
- [ ] Decimal validation for weight/volume UOMs
- [ ] Export includes UOM
- [ ] Mobile responsive display
- [ ] No console errors

## ADW Execution
```bash
./adws/adw_chore_implement.py "Add 'UOM' (Unit of Measurement) field to Inventory Management page. Support common UOM types: Piece/Each (EA, PC, PCS), Box (BOX, CTN), Weight (KG, LB, G, OZ, TON), Volume (L, ML, GAL), Length (M, CM, FT, IN), and Custom UOMs. Add UOM column to table, display quantities with UOM (e.g., '100 PCS', '50.5 KG'), add UOM filter, include in detail page and forms, implement UOM-specific validation (integer for pieces/boxes, decimal for weight/volume), and add UOM to export functionality." --model opus
```
