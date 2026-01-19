# Chore: Improve Order Management Filter Responsiveness at Tablet Width

## Metadata
adw_id: `47484d67`
prompt: `Improve Order Management filter responsiveness at tablet width - change the main filters row from horizontal scroll (overflow-x-auto) to flex-wrap so filter groups stack vertically on screens narrower than 1280px. This improves discoverability as users won't need to scroll horizontally to access the Order Date filter. Keep overflow-x-auto only as a fallback for very narrow screens below 768px.`

## Chore Description
Currently, the Order Management page uses `overflow-x-auto` on the main filters row, which requires horizontal scrolling on tablet-sized screens (768px-1280px) to access the Order Date filter group. This creates poor discoverability as users may not realize they need to scroll horizontally to access all filters.

This chore improves the responsive behavior by:
1. **Changing layout strategy from horizontal scroll to vertical stacking** - Use `flex-wrap` to allow filter groups to stack naturally on screens narrower than 1280px (xl breakpoint)
2. **Maintaining horizontal layout on wide screens** - Keep single-row layout on xl+ screens (1280px+) using `xl:flex-nowrap`
3. **Keeping horizontal scroll as fallback** - Maintain `overflow-x-auto` only for very narrow mobile screens below 768px (md breakpoint) using `md:overflow-visible`

This approach follows the project's mobile-first design philosophy and Tailwind breakpoint conventions:
- Mobile: Base styles
- sm: 640px+ (small phones)
- md: 768px+ (tablets)
- lg: 1024px+ (small desktops)
- xl: 1280px+ (wide desktops)

## Relevant Files
Use these files to complete the chore:

- **src/components/order-management-hub.tsx** (line ~1966) - Main filters container that needs responsive class changes. This is the only file requiring modification.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Main Filters Container Responsive Classes
Modify the filter groups container div at line ~1966 to implement the new responsive strategy:

**Current implementation:**
```tsx
<div className="flex flex-wrap gap-3 items-center lg:flex-nowrap overflow-x-auto">
```

**New implementation:**
```tsx
<div className="flex flex-wrap gap-3 items-center xl:flex-nowrap overflow-x-auto md:overflow-visible">
```

**Changes explained:**
- `flex flex-wrap` - Base: Allow wrapping on mobile and tablet (default behavior)
- `gap-3` - Maintain existing spacing between filter groups
- `items-center` - Maintain vertical alignment
- `xl:flex-nowrap` - NEW: Single row only on xl+ screens (1280px+) instead of lg+ (1024px)
- `overflow-x-auto` - Base: Horizontal scroll for very narrow mobile screens
- `md:overflow-visible` - NEW: Remove horizontal scroll on md+ screens (768px+) to show wrapped filters

### 2. Test Responsive Behavior at Different Breakpoints
Validate the layout at key viewport widths:

**Mobile (< 768px):**
- Filter groups should wrap vertically
- Horizontal scroll available as fallback if needed for very narrow screens

**Tablet (768px - 1279px):**
- Filter groups should stack vertically (wrap) naturally
- NO horizontal scroll - all filters visible without scrolling
- Order Date filter group visible without horizontal scrolling

**Desktop (1280px+):**
- All filter groups in single horizontal row
- No wrapping, no horizontal scroll
- Optimal use of horizontal space

### 3. Verify No TypeScript or Build Errors
Run build command to ensure changes don't introduce errors:
- Check for any TypeScript errors
- Verify production build succeeds
- Confirm no runtime errors in console

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript or build errors after changes
- `pnpm dev` - Start development server
- Use Playwright MCP or browser DevTools to test at these exact viewport widths:
  1. **320px width (mobile)** - Filters should wrap, horizontal scroll available as fallback
  2. **768px width (tablet portrait)** - Filters should wrap vertically, NO horizontal scroll, all filters visible
  3. **1024px width (tablet landscape/small desktop)** - Filters should wrap vertically, NO horizontal scroll
  4. **1280px width (desktop)** - Filters should be in single horizontal row, no wrapping
  5. **1920px width (wide desktop)** - Filters should be in single horizontal row with good spacing

**Navigation path for testing:**
- Start dev server: `pnpm dev`
- Navigate to: http://localhost:3000/orders
- Open browser DevTools responsive design mode
- Test at each breakpoint listed above
- Verify Order Date filter is always visible without horizontal scrolling on 768px+ screens

## Notes
- This change builds on the previous filter layout improvements from chore 5ae25818 (which fixed dropdown widths and visual hierarchy)
- The xl breakpoint (1280px) is chosen because it matches the project's "Extra Large" breakpoint definition in CLAUDE.md
- The md breakpoint (768px) is standard Tailwind for tablet devices
- Existing `flex-shrink-0` classes on individual filter groups remain unchanged to prevent compression
- The change is minimal (one line modification) but significantly improves UX on tablet devices
- No changes to filter functionality or data handling - purely a responsive layout improvement
