# Wireframe: Extended Product Detail Fields in Items Tab

## Overview
Add additional product attribute fields to the **Product Details** section within the expanded item view on the Order Detail → Items tab.

**Location**: `http://localhost:3000/orders` → Click Order → Items Tab → Expand Item → Product Details Section

**Target File**: `src/components/order-detail-view.tsx` (Lines 831-883)

## Requested New Fields
User wants to add the following fields to the Product Details section:
1. **Secret Code** - Product secret/internal code
2. **Style** - Product style variant
3. **Color** - Product color
4. **Size** - Product size
5. **Reason** - Order/item reason (e.g., return reason, special handling)
6. **Temperature** - Temperature requirement (e.g., Frozen, Chilled, Ambient)
7. **Expiry** - Product expiry date

## Current Product Details Fields
The existing Product Details section (Column 1 of 3-column layout) currently displays:
- UOM
- Supply Type ID
- Substitution
- Bundle
- Bundle Ref Id
- Packed Ordered Qty
- Gift Wrapped
- Gift Message

---

## Version 1: Inline Addition (Minimal Change)

### Description
Add all 7 new fields directly below the existing fields in the Product Details column. Simple vertical list extension.

### Visual Layout
```
┌─────────────────────────────────────────────────────────────┐
│  PRODUCT DETAILS                                            │
├─────────────────────────────────────────────────────────────┤
│  UOM                              SBTL                      │
│  Supply Type ID                   On Hand Available         │
│  Substitution                     No                        │
│  Bundle                           No                        │
│  Bundle Ref Id                    N/A                       │
│  Packed Ordered Qty               1                         │
│  Gift Wrapped                     No                        │
│  Gift Message                     -                         │
│  ─────────────────────────────────────────────────────────  │
│  Secret Code                      SC-12345                  │
│  Style                            Classic                   │
│  Color                            Navy Blue                 │
│  Size                             M                         │
│  Reason                           Standard                  │
│  Temperature                      Ambient                   │
│  Expiry                           2026-12-31                │
└─────────────────────────────────────────────────────────────┘
```

### Pros
- Minimal code changes
- Maintains existing layout structure
- Quick implementation
- Low risk of breaking existing functionality

### Cons
- Column may become too long on desktop
- May cause scrolling on mobile
- All fields mixed together without logical grouping

### Implementation Notes
- Add fields directly after line 877 in the existing `<div className="space-y-3 text-sm">` block
- Use same styling pattern: `<div className="flex justify-between">` with gray-500/gray-900 text colors

---

## Version 2: Grouped Sub-Sections (Organized)

### Description
Organize fields into logical sub-sections within the Product Details column using subtle dividers and sub-headers.

### Visual Layout
```
┌─────────────────────────────────────────────────────────────┐
│  PRODUCT DETAILS                                            │
├─────────────────────────────────────────────────────────────┤
│  ◆ Basic Information                                        │
│  UOM                              SBTL                      │
│  Supply Type ID                   On Hand Available         │
│  Packed Ordered Qty               1                         │
│                                                             │
│  ◆ Variants & Attributes                                    │
│  Secret Code                      SC-12345                  │
│  Style                            Classic                   │
│  Color                            Navy Blue                 │
│  Size                             M                         │
│                                                             │
│  ◆ Handling & Storage                                       │
│  Temperature                      🌡️ Chilled (2-8°C)        │
│  Expiry                           📅 Dec 31, 2026           │
│  Reason                           Standard Order            │
│                                                             │
│  ◆ Options                                                  │
│  Substitution                     No                        │
│  Bundle                           No                        │
│  Bundle Ref Id                    N/A                       │
│  Gift Wrapped                     No                        │
│  Gift Message                     -                         │
└─────────────────────────────────────────────────────────────┘
```

### Pros
- Better organization and scanability
- Logical grouping of related fields
- Easier to find specific information
- Professional appearance

### Cons
- More code changes required
- Requires reorganizing existing fields
- Slightly more complex implementation

### Implementation Notes
- Add sub-headers with `<p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mt-3 mb-2">`
- Use `<Separator />` or border-t classes between sections
- Temperature field should include visual indicator (emoji or colored badge for Frozen/Chilled/Ambient)
- Expiry date should be formatted nicely with date icon

---

## Version 3: Two-Column Grid with Visual Badges (Enhanced UX)

### Description
Restructure Product Details into a 2-column grid layout with visual badges for key attributes like Temperature and Color. Most comprehensive redesign.

### Visual Layout
```
┌─────────────────────────────────────────────────────────────┐
│  PRODUCT DETAILS                                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ UOM           SBTL  │  │ Supply Type  On Hand│          │
│  └─────────────────────┘  └─────────────────────┘          │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ Secret Code         │  │ Style      Classic  │          │
│  │ SC-12345            │  │                     │          │
│  └─────────────────────┘  └─────────────────────┘          │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ Color               │  │ Size                │          │
│  │ ███ Navy Blue       │  │ [M] Medium          │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │  🧊 CHILLED        📅 Expires: Dec 31, 2026  │          │
│  │  Store at 2-8°C    Reason: Standard Order    │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Options:  ☐ Substitution  ☐ Bundle  ☐ Gift Wrap    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Temperature Badge Variants
```
🧊 FROZEN      - bg-blue-100 text-blue-800 border-blue-300
🌡️ CHILLED     - bg-cyan-100 text-cyan-800 border-cyan-300
🌤️ AMBIENT     - bg-gray-100 text-gray-800 border-gray-300
🔥 HOT         - bg-red-100 text-red-800 border-red-300
```

### Color Display
- Show actual color swatch (small colored square) next to color name
- Use CSS background color based on color value mapping

### Size Badge
```
[XS] Extra Small  - text-xs
[S]  Small        - text-sm
[M]  Medium       - font-medium
[L]  Large        - font-semibold
[XL] Extra Large  - font-bold
```

### Pros
- Most visually appealing
- Better use of horizontal space
- Temperature requirements highly visible (food safety critical)
- Color swatch provides quick visual reference
- Options condensed into single row

### Cons
- Most complex implementation
- Requires more testing across screen sizes
- May need responsive adjustments for mobile
- Higher risk of layout issues

### Implementation Notes
- Use `<div className="grid grid-cols-2 gap-3">` for 2-column layout
- Create `TemperatureBadge` component with color mapping
- Create `ColorSwatch` component that renders small colored square
- Create `SizeBadge` component with size indicator
- Use flexbox for the options row with checkbox-style indicators
- Consider collapsible behavior for mobile screens

---

## Data Type Definitions

Add these fields to `ApiOrderItem` interface in `order-management-hub.tsx`:

```typescript
interface ApiOrderItem {
  // ... existing fields ...

  // New fields for extended product details
  secretCode?: string;          // Internal/secret product code
  style?: string;               // Product style variant
  color?: string;               // Product color
  size?: string;                // Product size (XS, S, M, L, XL, etc.)
  reason?: string;              // Order/item reason
  temperature?: 'FROZEN' | 'CHILLED' | 'AMBIENT' | 'HOT' | string;  // Temperature requirement
  expiry?: string;              // ISO date string for expiry date
}
```

---

## Recommendation

**Recommended: Version 2 (Grouped Sub-Sections)**

Rationale:
- Balances organization with implementation effort
- Maintains existing visual consistency
- Provides clear logical grouping without major layout changes
- Temperature and Expiry fields are food-safety critical and benefit from visibility
- Can be upgraded to Version 3 in future iteration

---

## Files to Modify

1. **`src/components/order-detail-view.tsx`**
   - Add new fields to Product Details section (lines 831-883)
   - Add Temperature badge styling
   - Add Expiry date formatting

2. **`src/components/order-management-hub.tsx`**
   - Extend `ApiOrderItem` interface with new fields

3. **`src/lib/mock-data.ts`** (if applicable)
   - Add mock data for new fields

---

## Testing Checklist

- [ ] Fields display correctly with data present
- [ ] Fields show appropriate fallback (N/A or -) when data missing
- [ ] Temperature badge shows correct color based on value
- [ ] Expiry date formatted consistently
- [ ] Mobile responsive layout works correctly
- [ ] Expand/Collapse all functionality still works
- [ ] Search filtering doesn't break with new fields
- [ ] TypeScript compilation passes
- [ ] Production build succeeds
