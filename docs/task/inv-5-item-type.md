# Task 5: Inventory Management - Item Type Field

## Objective
Add Item Type classification to inventory items

## Requirements
- Add "Item Type" column to inventory management table
- Support four item types:
  - **Normal**: Standard individual items
  - **Pack**: Pre-packaged sets (e.g., 6-pack, 12-pack)
  - **Weight**: Items sold by weight (kg, lb, etc.)
  - **Pack Weight**: Combination of pack and weight (e.g., 5kg pack)
- Add Item Type filter in the filtering section
- Display appropriate icon or badge for each type
- Add Item Type to inventory detail page
- Add Item Type to add/edit inventory forms
- Implement validation based on item type:
  - Normal: Standard quantity rules
  - Pack: Pack size and unit quantity
  - Weight: Minimum/maximum weight ranges
  - Pack Weight: Both pack and weight validation
- Update API calls to include item_type parameter
- Add sorting capability by item type

## Data Structure
```typescript
type ItemType = 'normal' | 'pack' | 'weight' | 'pack_weight'

interface InventoryItem {
  // ... existing fields
  item_type: ItemType
  pack_size?: number // For 'pack' and 'pack_weight' types
  weight_unit?: 'kg' | 'lb' | 'g' | 'oz' // For 'weight' and 'pack_weight' types
}
```

## Visual Indicators
- Normal: Default styling or 📦 icon
- Pack: 📦📦 icon or badge
- Weight: ⚖️ icon or badge
- Pack Weight: 📦⚖️ icon or badge

## UI Components Needed
- Item Type column in table
- Item Type filter (multi-select or dropdown)
- Item Type badges/icons
- Item Type selector in forms (radio or select)
- Conditional validation fields based on type
- Sort functionality for Item Type column

## Success Criteria
- [ ] Item Type column visible in table
- [ ] Four item types supported
- [ ] Appropriate icons/badges display
- [ ] Item Type filter works correctly
- [ ] Detail page shows Item Type
- [ ] Forms include Item Type selector
- [ ] Type-specific validation works
- [ ] Sorting by Item Type functional
- [ ] Mobile responsive display
- [ ] No console errors

## ADW Execution
```bash
./adws/adw_chore_implement.py "Add 'Item Type' field to Inventory Management page with four types: Normal, Pack, Weight, Pack Weight. Include Item Type column in table with appropriate icons/badges (📦 for Normal, 📦📦 for Pack, ⚖️ for Weight, 📦⚖️ for Pack Weight). Add Item Type filter, display on detail page, include in add/edit forms, implement type-specific validation (pack size for Pack, weight ranges for Weight, both for Pack Weight), and add sorting capability." --model opus
```
