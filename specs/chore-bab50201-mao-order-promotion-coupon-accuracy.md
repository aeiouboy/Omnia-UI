# Chore: MAO Order W1156251121946800 Promotion and Coupon Data Accuracy

## Metadata
adw_id: `bab50201`
prompt: `Update Omnia-UI order W1156251121946800 mock data in src/lib/mock-data.ts to match MAO production data with correct per-line calculations. KEEP existing split logic (1 qty per line). MAO DATA: Total Discounts ฿917.00 = Promotions ฿647.00 + Coupons ฿270.00. PROMOTIONS (BOGO ฿647 total): Betagro Tofu (2 lines, ID:5200060159) ฿11.00 total -> ฿5.50/line, Tops Salmon (4 lines, ID:9400006629) ฿318.00 total -> ฿79.50/line, Thammachart Salmon (4 lines, ID:9400006713) ฿318.00 total -> ฿79.50/line. NO BOGO on: Bon Aroma Coffee (has Red Hot 1700015040 but ฿0 discount), Smarter Dental Floss (has TOPS SALE 4300035710 but ฿0 discount), N&P Banana, Cubic Loaf. COUPONS: AUTOAPPLY (CPN9, ฿170 total) on 7 items - Betagro ฿1.73/2lines=฿0.865/line, Tops Salmon ฿71.09/4lines=฿17.77/line, N&P Banana ฿4.40/1line. 15FRESH (CPN2, ฿100 total) on 4 products - Tops Salmon ฿38.96/4lines=฿9.74/line, N&P Banana ฿3.72/1line, Thammachart ฿38.97/4lines=฿9.74/line, Cubic Loaf ฿18.35/2lines=฿9.175/line. DISCOUNT TOTALS per item: Bon Aroma ฿0, Betagro ฿12.73 (฿6.365/line), Smarter Floss ฿0, Tops Salmon ฿428.05 (฿107.01/line), N&P Banana ฿8.12, Thammachart ฿428.05 (฿107.01/line), Cubic Loaf ฿40.05 (฿20.025/line). Update each line item promotions array with correct promotionId, promotionType, discountAmount, secretCode, couponType matching MAO.`

## Chore Description
Update the mock data for MAO order W1156251121946800 to accurately reflect the production MAO system's promotion and coupon calculations. The current mock data contains incorrect promotion IDs, discount amounts, and coupon allocations. This chore corrects each line item's `promotions` array to match the exact values from the MAO production system.

### Key Corrections Required:
1. **Remove incorrect BOGO promotions** from Bon Aroma Coffee, Smarter Dental Floss
2. **Add correct BOGO promotions** with proper IDs (9400006629, 9400006713) and amounts
3. **Add Red Hot/TOPS SALE promotions** with ฿0 discount where applicable
4. **Update AUTOAPPLY coupon** amounts to match per-line calculations
5. **Add 15FRESH coupon** to applicable items
6. **Update priceBreakdown.discount** values to match total per-line discounts

### MAO Production Data Summary:
| Product | Lines | BOGO ID | BOGO/line | AUTOAPPLY/line | 15FRESH/line | Total/line |
|---------|-------|---------|-----------|----------------|--------------|------------|
| Bon Aroma Coffee | 3 | 1700015040 | ฿0 | - | - | ฿0 |
| Betagro Tofu | 2 | 5200060159 | ฿5.50 | ฿0.865 | - | ฿6.365 |
| Smarter Dental Floss | 1 | 4300035710 | ฿0 | - | - | ฿0 |
| Tops Salmon | 4 | 9400006629 | ฿79.50 | ฿17.77 | ฿9.74 | ฿107.01 |
| N&P Banana | 1 | - | - | ฿4.40 | ฿3.72 | ฿8.12 |
| Thammachart Salmon | 4 | 9400006713 | ฿79.50 | - | ฿9.74 | ฿89.24 |
| Cubic Loaf | 2 | - | - | - | ฿9.175 | ฿9.175 |

## Relevant Files
Use these files to complete the chore:

- **src/lib/mock-data.ts** (lines 2618-3600) - Contains `maoOrderW1156251121946800Items` array with 17 line items that need promotion/coupon corrections
  - Lines 2620-2804: Bon Aroma Coffee (3 split lines) - Remove BOGO, add Red Hot 1700015040 with ฿0 discount, remove AUTOAPPLY
  - Lines 2805-2928: Betagro Tofu (2 split lines) - Keep BOGO 5200060159 at ฿5.50/line, update AUTOAPPLY to ฿0.865/line
  - Lines 2929-2987: Smarter Dental Floss (1 line) - Remove BOGO, add TOPS SALE 4300035710 with ฿0 discount, remove AUTOAPPLY
  - Lines 2988-3215: Tops Salmon (4 split lines) - Add BOGO 9400006629 at ฿79.50/line, add AUTOAPPLY at ฿17.77/line, update 15FRESH to ฿9.74/line
  - Lines 3216-3261: N&P Banana (1 line) - Add AUTOAPPLY at ฿4.40, add 15FRESH at ฿3.72
  - Lines 3262-3489: Thammachart Salmon (4 split lines) - Add BOGO 9400006713 at ฿79.50/line, remove AUTOAPPLY, add 15FRESH at ฿9.74/line
  - Lines 3490-3600: Cubic Loaf (2 split lines) - Remove AUTOAPPLY, add 15FRESH at ฿9.175/line

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Bon Aroma Coffee Lines (3 lines: LINE-W115625-001-0, 001-1, 001-2)
- Change promotions array to contain only Red Hot promotion with ฿0 discount:
  ```javascript
  promotions: [
    {
      promotionId: '1700015040',
      promotionType: 'Red Hot',
      discountAmount: 0
    }
  ]
  ```
- Update priceBreakdown.discount to 0 for all 3 lines
- Recalculate priceBreakdown fields: total = subtotal (฿115 each)

### 2. Update Betagro Tofu Lines (2 lines: LINE-W115625-002-0, 002-1)
- Update BOGO discountAmount to -5.50 per line
- Update AUTOAPPLY coupon discountAmount to -0.865 per line (round to -0.87 for display)
- Update priceBreakdown.discount to 6.37 (5.50 + 0.87) per line
- Keep existing promotionId 5200060159 for BOGO

### 3. Update Smarter Dental Floss Line (1 line: LINE-W115625-003)
- Change promotions array to contain only TOPS SALE promotion with ฿0 discount:
  ```javascript
  promotions: [
    {
      promotionId: '4300035710',
      promotionType: 'TOPS SALE',
      discountAmount: 0
    }
  ]
  ```
- Update priceBreakdown.discount to 0
- Recalculate priceBreakdown.total = ฿45

### 4. Update Tops Salmon Lines (4 lines: LINE-W115625-004-0 through 004-3)
- Add BOGO promotion with ID 9400006629 and discountAmount -79.50 per line
- Add AUTOAPPLY coupon with discountAmount -17.77 per line
- Update 15FRESH coupon discountAmount to -9.74 per line
- Update priceBreakdown.discount to 107.01 (79.50 + 17.77 + 9.74) per line
- Promotions array structure:
  ```javascript
  promotions: [
    {
      promotionId: '9400006629',
      promotionType: 'BOGO',
      discountAmount: -79.50
    },
    {
      promotionId: 'CPN-AUTOAPPLY',
      promotionType: 'Coupon',
      discountAmount: -17.77,
      secretCode: 'AUTOAPPLY',
      couponType: 'CPN9'
    },
    {
      promotionId: 'CPN-15FRESH',
      promotionType: 'Coupon',
      discountAmount: -9.74,
      secretCode: '15FRESH',
      couponType: 'CPN2'
    }
  ]
  ```

### 5. Update N&P Banana Line (1 line: LINE-W115625-005)
- Add AUTOAPPLY coupon with discountAmount -4.40
- Add 15FRESH coupon with discountAmount -3.72
- Update priceBreakdown.discount to 8.12 (4.40 + 3.72)
- Promotions array structure:
  ```javascript
  promotions: [
    {
      promotionId: 'CPN-AUTOAPPLY',
      promotionType: 'Coupon',
      discountAmount: -4.40,
      secretCode: 'AUTOAPPLY',
      couponType: 'CPN9'
    },
    {
      promotionId: 'CPN-15FRESH',
      promotionType: 'Coupon',
      discountAmount: -3.72,
      secretCode: '15FRESH',
      couponType: 'CPN2'
    }
  ]
  ```

### 6. Update Thammachart Salmon Lines (4 lines: LINE-W115625-006-0 through 006-3)
- Add BOGO promotion with ID 9400006713 and discountAmount -79.50 per line
- Remove existing AUTOAPPLY coupon (Thammachart doesn't have AUTOAPPLY per MAO data)
- Add 15FRESH coupon with discountAmount -9.74 per line
- Update priceBreakdown.discount to 89.24 (79.50 + 9.74) per line
- Promotions array structure:
  ```javascript
  promotions: [
    {
      promotionId: '9400006713',
      promotionType: 'BOGO',
      discountAmount: -79.50
    },
    {
      promotionId: 'CPN-15FRESH',
      promotionType: 'Coupon',
      discountAmount: -9.74,
      secretCode: '15FRESH',
      couponType: 'CPN2'
    }
  ]
  ```

### 7. Update Cubic Loaf Lines (2 lines: LINE-W115625-007-0, 007-1)
- Remove existing AUTOAPPLY coupon (Cubic doesn't have AUTOAPPLY per MAO data)
- Add 15FRESH coupon with discountAmount -9.175 per line (round to -9.18 for display)
- Update priceBreakdown.discount to 9.18 per line
- Promotions array structure:
  ```javascript
  promotions: [
    {
      promotionId: 'CPN-15FRESH',
      promotionType: 'Coupon',
      discountAmount: -9.18,
      secretCode: '15FRESH',
      couponType: 'CPN2'
    }
  ]
  ```

### 8. Validate Total Discount Calculations
- Verify order header comment reflects correct totals:
  - Total Promotions: ฿647.00 (11.00 + 318.00 + 318.00)
  - Total Coupons: ฿270.00 (170.00 AUTOAPPLY + 100.00 15FRESH)
  - Grand Total Discounts: ฿917.00
- Run TypeScript compilation to ensure no syntax errors
- Run development server to verify UI displays correctly

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds without errors
- `pnpm dev` - Start development server and navigate to order W1156251121946800 detail view
- Verify in browser: Navigate to `/orders` → Search for "W1156251121946800" → Click to view details → Check Items tab for correct promotion/coupon display
- Manual calculation check: Sum all line item discounts to verify total matches ฿917.00

## Notes
- The existing split logic (1 qty per line) must be preserved - only update promotion/coupon data
- Discount amounts in promotions array use negative values (e.g., -79.50)
- Discount amounts in priceBreakdown use positive values (e.g., 79.50)
- When dividing totals across lines, small rounding differences are acceptable (e.g., ฿9.175 → ฿9.18)
- The MAO production system uses these specific promotion IDs:
  - 1700015040: Red Hot (Bon Aroma)
  - 4300035710: TOPS SALE (Dental Floss)
  - 5200060159: BOGO (Betagro Tofu)
  - 9400006629: BOGO (Tops Salmon)
  - 9400006713: BOGO (Thammachart Salmon)
- Coupon types: CPN9 = AUTOAPPLY, CPN2 = 15FRESH
