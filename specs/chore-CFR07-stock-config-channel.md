# Chore: Stock Config Channel Addition

## Metadata
adw_id: `CFR07`
prompt: `Add Channel field (TOL, MKP, QC) to Stock Configuration. Implements multi-channel support where multiple selected channels create multiple config rows. Add Channel selector to Create/Edit UI.`

## Chore Description
Implement channel support in Stock Configuration. While the backend types and parsing logic largely support 'channel', the frontend UI for creating and editing configurations is missing or needs updating. This chore involves adding a "Create Configuration" feature with a form that includes a Channel multi-selector.

## Relevant Files
*   `app/stock-config/page.tsx` - Main page to add "Create Config" button and modal integration.
*   `src/components/stock-config/stock-config-form-modal.tsx` - NEW component for Create/Edit form.
*   `src/components/stock-config/stock-config-table.tsx` - Ensure Channel column is correctly displayed (Done).
*   `src/lib/stock-config-service.ts` - Ensure save logic handles multiple items.
*   `src/types/stock-config.ts` - Ensure types support channel (Done).

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create StockConfigFormModal Component
*   Create `src/components/stock-config/stock-config-form-modal.tsx`.
*   Implement a form using `react-hook-form` and `zod`.
*   Fields: Location ID, Item ID, Supply Type, Frequency, Quantity, Start Date, End Date.
*   **Channel Field**: Add a multi-select component for Channels (TOL, MKP, QC).
*   Validation: Ensure required fields and business rules (e.g., Supply Type/Frequency pairing).

### 2. Update Stock Config Page
*   Modify `app/stock-config/page.tsx`.
*   Add state for `createModalOpen`.
*   Add "Create Configuration" button next to "Upload Config".
*   Integrate `StockConfigFormModal` for creating new configs.
*   Implement `handleCreate` to call `saveStockConfig`.
*   **Multi-row Logic**: If multiple channels selected, `handleCreate` should map them to multiple `StockConfigItem` objects (one per channel).

### 3. Implement Edit Functionality
*   Update `handleViewConfig` (or rename to `handleEditConfig`) in `app/stock-config/page.tsx`.
*   Pass the selected item to `StockConfigFormModal`.
*   Ensure the form pre-fills correctly.
*   Note: Editing a row with a specific channel should lock/pre-fill that channel.

### 4. Verify Channel UI
*   Verify the "Channel" column in the table displays correctly (TOL, MKP, QC badges).

## Validation Commands
*   `npm run lint`
*   `npm run build`
