# Chore: Order Page Filter Validation & Cleanup

## Metadata
adw_id: `CFR01`
prompt: `Disable ALL Quick Filters on order page. Validate basic + advanced filtering. Enforce 6-month export date restriction.`

## Chore Description
Clean up the Order Management Hub by removing the "Quick Filter" logic (Urgent, Due Soon, etc.) and ensuring only standard and advanced filters remain. Verify the 6-month export limit which appears to be already implemented.

## Relevant Files
*   `src/components/order-management-hub.tsx`

## Step by Step Tasks

### 1. Remove Quick Filters Logic
*   In `src/components/order-management-hub.tsx`, remove `quickFilter` state.
*   Remove logic in `filteredOrders` that uses `quickFilter`.
*   Remove `activeSlaFilter` interaction if it's solely driven by Quick Filters (or keep if there's a standalone dropdown—I didn't see one).
*   Remove `quickFilter` from `removeFilter` and `generateActiveFilters`.
*   Remove the "Urgency Legend" if it's no longer relevant or misleading without the filters (Prompt doesn't explicitly say remove legend, but "Disable Quick Filters" implies removing the interactive elements). I'll keep the legend as it explains the row colors.

### 2. Verify Export Restriction
*   The code already has `isDateDisabledForExport` using `sixMonthsAgo`.
*   Ensure the `dateFromFilter` in the Export Dialog uses this. (Verified in analysis, but good to double check).

### 3. Verification
*   Build the project to ensure no unused variables remain.
*   (Manual) Verify filters work.

## Validation Commands
*   `npm run build`
