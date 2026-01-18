# Navigation Menu Spacing

## ADW Command
```bash
uv run adws/adw_chore_implement.py 'Improve navigation sidebar spacing at src/components/side-nav.tsx:
1. Add more visual separation between active menu section (Inventory Management) and disabled items
2. Consider adding a subtle divider line before disabled menu items
3. Ensure disabled menu items have consistent opacity/styling
4. Add indentation consistency for submenu items (Inventory Availability, Stock Card, Stock Config)'
```

## Issue Description
The navigation sidebar needs better visual separation between active and disabled menu sections.

## Files to Modify
- `src/components/side-nav.tsx`

## Expected Outcome
- Clear visual separation between active and disabled sections
- Optional divider line
- Consistent disabled item styling
- Proper submenu indentation
