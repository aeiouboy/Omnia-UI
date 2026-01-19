# Task 1: Header Component Cleanup

## Objective
Remove unnecessary terminology from the header component

## Requirements
- Remove the word 'Organization' from all header displays
- Remove the word 'Profile' from all header displays
- Maintain header functionality and layout
- Ensure responsive design is preserved

## Files Likely Affected
- Header component files in `src/components/` or `components/`
- Layout components that include the header
- Any navigation or user menu components

## Technical Guidelines
- Follow existing component structure
- Maintain TypeScript strict mode
- Test on mobile and desktop
- Verify no layout breaks after changes

## Success Criteria
- [ ] No 'Organization' text in header
- [ ] No 'Profile' text in header
- [ ] All header functionality still works
- [ ] Mobile responsive layout maintained
- [ ] No console errors

## ADW Execution
```bash
./adws/adw_chore_implement.py "Remove 'Organization' and 'Profile' words from header component while maintaining all functionality and responsive design" --model sonnet
```
