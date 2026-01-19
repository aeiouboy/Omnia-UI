# Chore: Update MAO Order W1156251121946800 Mock Data to Match Production

## Metadata
adw_id: `6bed9a8a`
prompt: `Update mock data for order W1156251121946800 in src/lib/mock-data.ts to match exact MAO production data. ITEMS: 1) Bon Aroma Coffee (SKU:5904277114444) 3 lines ฿115 each - BOGO promo + AUTOAPPLY coupon, bundle:false, giftWithPurchase:false. 2) Betagro Egg Tofu (SKU:8852043003485) 2 lines ฿11 each - BOGO promo + AUTOAPPLY coupon, bundle:false, giftWithPurchase:false. 3) Smarter Dental Floss (SKU:8853474057764) 1 line ฿45 - BOGO promo + AUTOAPPLY coupon. 4) Tops Frozen Salmon (SKU:8853474080366) 4 lines ฿159 each - 15FRESH coupon only. 5) N&P Banana (SKU:8858738405534) 1 line ฿28 - no promo/coupon. 6) Thammachart Salmon (SKU:8858781403990) 4 lines ฿159 each - AUTOAPPLY coupon. 7) Cubic Wheat Loaf (SKU:8858894100014) 2 lines ฿69 each - AUTOAPPLY coupon. PROMOTIONS: BOGO (ID:5200060159) total ฿647. COUPONS: AUTOAPPLY (CPN9) ฿170 on 7 items, 15FRESH (CPN2) ฿100 on 4 items. CRITICAL: Remove fake BUNDLE-COFFEE-001 and fake giftWithPurchase values - all items have bundle:false, giftWithPurchase:false per MAO.`

## Chore Description
This chore corrects the mock data for MAO order W1156251121946800 to exactly match the production MAO system data. The current mock data contains incorrect values that were added for testing purposes but do not reflect actual production data:

1. **Incorrect bundle flags**: Bon Aroma Coffee items incorrectly have `bundle: true` and `bundleRef: 'BUNDLE-COFFEE-001'`
2. **Incorrect gift values**: Betagro Egg Tofu incorrectly has `giftWithPurchase: 'Free Reusable Chopsticks'`
3. **Incorrect promotion assignments**: Several items have wrong promotions/coupons applied

### Correct MAO Production Data Summary

| Product | SKU | Lines | Unit Price | Promotions/Coupons |
|---------|-----|-------|------------|-------------------|
| Bon Aroma Coffee | 5904277114444 | 3 | ฿115 | BOGO (5200060159) + AUTOAPPLY (CPN9) |
| Betagro Egg Tofu | 8852043003485 | 2 | ฿11 | BOGO (5200060159) + AUTOAPPLY (CPN9) |
| Smarter Dental Floss | 8853474057764 | 1 | ฿45 | BOGO (5200060159) + AUTOAPPLY (CPN9) |
| Tops Frozen Salmon | 8853474080366 | 4 | ฿159 | 15FRESH (CPN2) only |
| N&P Banana | 8858738405534 | 1 | ฿28 | None |
| Thammachart Salmon | 8858781403990 | 4 | ฿159 | AUTOAPPLY (CPN9) only |
| Cubic Wheat Loaf | 8858894100014 | 2 | ฿69 | AUTOAPPLY (CPN9) only |

### Promotion/Coupon Totals
- **BOGO (5200060159)**: Total ฿647 discount across 6 items (3 coffee + 2 tofu + 1 floss)
- **AUTOAPPLY (CPN9)**: Total ฿170 discount across 7 items (3 coffee + 2 tofu + 1 floss + 1 item unclear - verify)
- **15FRESH (CPN2)**: Total ฿100 discount across 4 salmon items

## Relevant Files
Use these files to complete the chore:

- **`src/lib/mock-data.ts`** (lines 2618-3620): Contains the `maoOrderW1156251121946800Items` array with all 17 order line items that need correction. This is the primary file to modify.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Fix Bon Aroma Coffee Items (3 lines: LINE-W115625-001-0, 001-1, 001-2)
- Change `bundle: true` to `bundle: false` on all 3 items (lines ~2636, ~2686, ~2736)
- Remove `bundleRef: 'BUNDLE-COFFEE-001'` from all 3 items (lines ~2637, ~2687, ~2737)
- Add BOGO + AUTOAPPLY promotions to all 3 items (currently `promotions: []`)
- Each item should have:
  ```typescript
  promotions: [
    {
      promotionId: '5200060159',
      promotionType: 'BOGO',
      discountAmount: -38.33  // ~115/3 of total per item
    },
    {
      promotionId: 'CPN-AUTOAPPLY',
      promotionType: 'Coupon',
      discountAmount: -8.10,  // Distributed across 7 items
      secretCode: 'AUTOAPPLY',
      couponType: 'CPN9'
    }
  ]
  ```

### 2. Fix Betagro Egg Tofu Items (2 lines: LINE-W115625-002-0, 002-1)
- Change `giftWithPurchase: 'Free Reusable Chopsticks'` to `giftWithPurchase: false` on first item (line ~2795)
- Verify second item already has `giftWithPurchase: false` (line ~2856)
- Keep existing BOGO + AUTOAPPLY promotions (already correct)
- Ensure `bundle: false` remains on both items

### 3. Fix Smarter Dental Floss Item (1 line: LINE-W115625-003)
- Ensure `bundle: false` and `giftWithPurchase: false` (already correct)
- Add BOGO + AUTOAPPLY promotions (currently `promotions: []`)
- Item should have:
  ```typescript
  promotions: [
    {
      promotionId: '5200060159',
      promotionType: 'BOGO',
      discountAmount: -22.50  // Part of BOGO total
    },
    {
      promotionId: 'CPN-AUTOAPPLY',
      promotionType: 'Coupon',
      discountAmount: -3.18,
      secretCode: 'AUTOAPPLY',
      couponType: 'CPN9'
    }
  ]
  ```

### 4. Fix Tops Frozen Salmon Items (4 lines: LINE-W115625-004-0 through 004-3)
- Remove BOGO promotion (promotionId: '9400006629') from all 4 items
- Remove AUTOAPPLY coupon from all 4 items
- Keep ONLY 15FRESH coupon on all 4 items
- Each item should have:
  ```typescript
  promotions: [
    {
      promotionId: 'CPN-15FRESH',
      promotionType: 'Coupon',
      discountAmount: -25.00,  // ฿100 / 4 items
      secretCode: '15FRESH',
      couponType: 'CPN2'
    }
  ]
  ```

### 5. Fix N&P Banana Item (1 line: LINE-W115625-005)
- Remove ALL promotions (currently has AUTOAPPLY + 15FRESH)
- Set `promotions: []` (no promotions per MAO production)
- Update priceBreakdown.discount to 0
- Verify `bundle: false` and `giftWithPurchase: false`

### 6. Fix Thammachart Salmon Items (4 lines: LINE-W115625-006-0 through 006-3)
- Remove BOGO promotion (promotionId: '9400006629') from all 4 items
- Remove 15FRESH coupon from all 4 items
- Keep ONLY AUTOAPPLY coupon on all 4 items
- Each item should have:
  ```typescript
  promotions: [
    {
      promotionId: 'CPN-AUTOAPPLY',
      promotionType: 'Coupon',
      discountAmount: -11.22,  // Distributed across items
      secretCode: 'AUTOAPPLY',
      couponType: 'CPN9'
    }
  ]
  ```

### 7. Fix Cubic Wheat Loaf Items (2 lines: LINE-W115625-007-0, 007-1)
- Remove 15FRESH coupon from both items
- Add AUTOAPPLY coupon to both items
- Each item should have:
  ```typescript
  promotions: [
    {
      promotionId: 'CPN-AUTOAPPLY',
      promotionType: 'Coupon',
      discountAmount: -4.87,  // Distributed across items
      secretCode: 'AUTOAPPLY',
      couponType: 'CPN9'
    }
  ]
  ```

### 8. Validate Changes
- Run the development server to verify no TypeScript errors
- Check that all 17 line items have correct `bundle: false` values
- Check that all items have `giftWithPurchase: false`
- Verify promotion totals roughly match:
  - BOGO total: ~฿647
  - AUTOAPPLY total: ~฿170
  - 15FRESH total: ~฿100

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify no TypeScript compilation errors
- `pnpm lint` - Verify no linting errors
- `grep -n "bundle: true" src/lib/mock-data.ts` - Should return NO results for order W1156251121946800 items
- `grep -n "BUNDLE-COFFEE" src/lib/mock-data.ts` - Should return NO results
- `grep -n "Free Reusable Chopsticks" src/lib/mock-data.ts` - Should return NO results

## Notes

### Discount Distribution Calculations
The exact discount amounts per line item should be calculated by dividing totals:
- BOGO ฿647 / 6 items = ~฿107.83 per item (adjust for rounding)
- AUTOAPPLY ฿170 / 7 items = ~฿24.29 per item (adjust for rounding)
- 15FRESH ฿100 / 4 items = ฿25.00 per item

However, the exact per-item amounts may need adjustment based on how MAO calculates and rounds the discounts. The key requirement is removing incorrect data (fake bundle/gift values) and ensuring correct promotion assignments.

### Coupon Type Codes
- `CPN9` = AUTOAPPLY auto-apply coupon
- `CPN2` = 15FRESH promotional coupon

### Items Requiring Promotion Updates Summary
| Line IDs | Product | Current Promotions | Correct Promotions |
|----------|---------|-------------------|-------------------|
| 001-0,1,2 | Bon Aroma | Empty | BOGO + AUTOAPPLY |
| 002-0,1 | Betagro Tofu | BOGO + AUTOAPPLY | BOGO + AUTOAPPLY (correct) |
| 003 | Dental Floss | Empty | BOGO + AUTOAPPLY |
| 004-0,1,2,3 | Tops Salmon | BOGO + AUTOAPPLY + 15FRESH | 15FRESH only |
| 005 | N&P Banana | AUTOAPPLY + 15FRESH | None |
| 006-0,1,2,3 | Thammachart | BOGO + 15FRESH | AUTOAPPLY only |
| 007-0,1 | Cubic Bread | 15FRESH | AUTOAPPLY only |
