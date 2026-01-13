# Chore: Implement Mandatory View Filtering on Inventory Management Page

## Metadata
adw_id: `d848eedc`
prompt: `Implement mandatory view filtering on Inventory Management page. User must select a view (All Inventory, Available Stock Only, Low Stock, Out of Stock, Reserved Stock, Damaged/Quarantine, By Warehouse, By Channel) before inventory data displays. Show empty state with 'Please select a view to display inventory' message initially. Persist view selection in URL parameters, add visual indicator for active view, and enable dynamic view switching without page reload. Follow requirements from docs/task/inv-4-view-filtering.md`

## Chore Description
Transform the Inventory Management page to require mandatory view selection before displaying inventory data. Currently, the page loads all inventory data immediately. After this change:

1. **Initial State**: Page loads with an empty state showing "Please select a view to display inventory"
2. **View Selection Required**: User MUST select a view before data is fetched and displayed
3. **View Options** (8 views):
   - All Inventory - Shows all products
   - Available Stock Only - Products with availableStock > 0
   - Low Stock Items - Products with status = "low"
   - Out of Stock Items - Products with status = "critical" (availableStock = 0)
   - Reserved Stock - Products with reservedStock > 0
   - Damaged/Quarantine Stock - Products with stockUnusable > 0 or stockOnHold > 0
   - By Warehouse - Filter by specific warehouse code (sub-selection required)
   - By Channel - Filter by sales channel (sub-selection required)

4. **URL Persistence**: View selection stored in URL as `?view=<view-id>`
5. **Visual Indicator**: Active view shown as badge in header
6. **Dynamic Switching**: View changes without page reload using React state

## Relevant Files
Use these files to complete the chore:

- **`app/inventory/page.tsx`** - Main inventory page component. Core changes: add mandatory view state, empty state component, view selector UI, URL parameter sync, and conditional data loading.
- **`src/types/inventory.ts`** - Contains `InventoryFilters` interface (line 280-299). Add new `inventoryView` field for the mandatory view filter.
- **`src/lib/inventory-service.ts`** - Contains `applyFilters()` function (line 85-222). Add filtering logic for new view types (reserved stock, damaged/quarantine).
- **`src/components/ui/select.tsx`** - shadcn/ui Select component used for view selector dropdown.
- **`src/components/ui/badge.tsx`** - Badge component for active view indicator.
- **`src/components/ui/card.tsx`** - Card component for empty state container.

### New Files
- **`src/components/inventory/inventory-view-selector.tsx`** - New reusable component for the mandatory view selector with all 8 view options.
- **`src/components/inventory/inventory-empty-state.tsx`** - New empty state component showing message "Please select a view to display inventory".

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Define View Types in inventory.ts
- Open `src/types/inventory.ts`
- Add new type for inventory views after line 52 (after StockConfigStatus):
  ```typescript
  /**
   * Inventory view types for mandatory view filtering
   * User must select a view before inventory data is displayed
   */
  export type InventoryViewType =
    | "all-inventory"
    | "available-stock"
    | "low-stock"
    | "out-of-stock"
    | "reserved-stock"
    | "damaged-quarantine"
    | "by-warehouse"
    | "by-channel"
  ```
- Update `InventoryFilters` interface to add `inventoryView` field:
  ```typescript
  /** Mandatory inventory view selection */
  inventoryView?: InventoryViewType
  ```

### 2. Create Empty State Component
- Create new file `src/components/inventory/inventory-empty-state.tsx`:
  ```tsx
  import { Package } from "lucide-react"
  import { Card, CardContent } from "@/components/ui/card"

  interface InventoryEmptyStateProps {
    message?: string
  }

  export function InventoryEmptyState({
    message = "Please select a view to display inventory"
  }: InventoryEmptyStateProps) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            {message}
          </p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            Select a view from the dropdown above to see inventory data
          </p>
        </CardContent>
      </Card>
    )
  }
  ```

### 3. Create View Selector Component
- Create new file `src/components/inventory/inventory-view-selector.tsx`:
  ```tsx
  import { Eye, Package, AlertTriangle, XCircle, Lock, AlertOctagon, Warehouse, Globe } from "lucide-react"
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
  import type { InventoryViewType } from "@/types/inventory"

  interface InventoryViewSelectorProps {
    value: InventoryViewType | undefined
    onValueChange: (value: InventoryViewType) => void
    warehouseOptions?: string[]
    channelOptions?: string[]
    selectedWarehouse?: string
    selectedChannel?: string
    onWarehouseChange?: (value: string) => void
    onChannelChange?: (value: string) => void
  }

  const VIEW_OPTIONS = [
    { value: "all-inventory", label: "All Inventory", icon: Package },
    { value: "available-stock", label: "Available Stock Only", icon: Eye },
    { value: "low-stock", label: "Low Stock Items", icon: AlertTriangle },
    { value: "out-of-stock", label: "Out of Stock Items", icon: XCircle },
    { value: "reserved-stock", label: "Reserved Stock", icon: Lock },
    { value: "damaged-quarantine", label: "Damaged/Quarantine", icon: AlertOctagon },
    { value: "by-warehouse", label: "By Warehouse", icon: Warehouse },
    { value: "by-channel", label: "By Channel", icon: Globe },
  ] as const

  export function InventoryViewSelector({
    value,
    onValueChange,
    warehouseOptions = [],
    channelOptions = [],
    selectedWarehouse,
    selectedChannel,
    onWarehouseChange,
    onChannelChange,
  }: InventoryViewSelectorProps) {
    return (
      <div className="flex items-center gap-2">
        <Select value={value || ""} onValueChange={(v) => onValueChange(v as InventoryViewType)}>
          <SelectTrigger className="w-[200px] h-10 bg-primary/5 border-primary/20 font-medium">
            <SelectValue placeholder="Select a view..." />
          </SelectTrigger>
          <SelectContent>
            {VIEW_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sub-selector for warehouse */}
        {value === "by-warehouse" && warehouseOptions.length > 0 && (
          <Select value={selectedWarehouse || ""} onValueChange={onWarehouseChange}>
            <SelectTrigger className="w-[150px] h-10">
              <SelectValue placeholder="Select warehouse..." />
            </SelectTrigger>
            <SelectContent>
              {warehouseOptions.map((wh) => (
                <SelectItem key={wh} value={wh}>{wh}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Sub-selector for channel */}
        {value === "by-channel" && channelOptions.length > 0 && (
          <Select value={selectedChannel || ""} onValueChange={onChannelChange}>
            <SelectTrigger className="w-[150px] h-10">
              <SelectValue placeholder="Select channel..." />
            </SelectTrigger>
            <SelectContent>
              {channelOptions.map((ch) => (
                <SelectItem key={ch} value={ch}>{ch}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    )
  }
  ```

### 4. Update applyFilters in inventory-service.ts
- Open `src/lib/inventory-service.ts`
- Add filtering logic for new view types after existing filters (around line 144):
  ```typescript
  // Filter by inventory view (mandatory view filtering)
  if (filters.inventoryView && filters.inventoryView !== "all-inventory") {
    switch (filters.inventoryView) {
      case "available-stock":
        filtered = filtered.filter((item) => item.availableStock > 0)
        break
      case "low-stock":
        filtered = filtered.filter((item) => item.status === "low")
        break
      case "out-of-stock":
        filtered = filtered.filter((item) => item.status === "critical")
        break
      case "reserved-stock":
        filtered = filtered.filter((item) => item.reservedStock > 0)
        break
      case "damaged-quarantine":
        filtered = filtered.filter((item) =>
          item.warehouseLocations?.some(
            (loc) => (loc.stockUnusable || 0) > 0 || (loc.stockOnHold || 0) > 0
          )
        )
        break
      // by-warehouse and by-channel use existing warehouseCode and channels filters
    }
  }
  ```

### 5. Update Inventory Page with Mandatory View Logic
- Open `app/inventory/page.tsx`
- Import new components and types:
  ```typescript
  import { InventoryViewSelector } from "@/components/inventory/inventory-view-selector"
  import { InventoryEmptyState } from "@/components/inventory/inventory-empty-state"
  import type { InventoryViewType } from "@/types/inventory"
  ```
- Add state for mandatory view (after line 151):
  ```typescript
  const [selectedView, setSelectedView] = useState<InventoryViewType | undefined>(undefined)
  const [viewWarehouse, setViewWarehouse] = useState<string>("")
  const [viewChannel, setViewChannel] = useState<string>("")
  ```

### 6. Add URL Parameter Sync for View
- Update useEffect for reading URL params (after line 170):
  ```typescript
  // Read view filter from URL
  useEffect(() => {
    const viewParam = searchParams.get("view")
    if (viewParam) {
      setSelectedView(viewParam as InventoryViewType)
    }
    const warehouseParam = searchParams.get("warehouse_id")
    if (warehouseParam) {
      setViewWarehouse(warehouseParam)
    }
    const channelParam = searchParams.get("channel")
    if (channelParam) {
      setViewChannel(channelParam)
    }
  }, [searchParams])
  ```
- Add function to update URL when view changes:
  ```typescript
  const updateViewUrl = useCallback((view: InventoryViewType, warehouse?: string, channel?: string) => {
    const params = new URLSearchParams()
    params.set("view", view)
    if (view === "by-warehouse" && warehouse) {
      params.set("warehouse_id", warehouse)
    }
    if (view === "by-channel" && channel) {
      params.set("channel", channel)
    }
    // Preserve store filter if present
    const storeParam = searchParams.get("store")
    if (storeParam) {
      params.set("store", storeParam)
    }
    router.push(`/inventory?${params.toString()}`)
  }, [router, searchParams])
  ```

### 7. Update filters useMemo to Include View
- Update the filters useMemo (around line 186):
  ```typescript
  const filters: InventoryFilters = useMemo(() => ({
    status: activeTab === "all" ? "all" : activeTab,
    searchQuery,
    page,
    pageSize,
    sortBy: sortField as any,
    sortOrder,
    storeName: activeStoreFilter || "all",
    warehouseCode: selectedView === "by-warehouse" ? viewWarehouse : warehouseFilter,
    category: categoryFilter,
    itemType: itemTypeFilter,
    brand: brandFilter,
    view: viewFilter,
    businessUnit: selectedOrganization !== 'ALL' ? selectedOrganization : undefined,
    inventoryView: selectedView,
    channels: selectedView === "by-channel" && viewChannel ? [viewChannel as any] : undefined,
  }), [activeTab, searchQuery, page, pageSize, sortField, sortOrder, activeStoreFilter, warehouseFilter, categoryFilter, itemTypeFilter, brandFilter, viewFilter, selectedOrganization, selectedView, viewWarehouse, viewChannel])
  ```

### 8. Add Conditional Data Loading
- Modify loadData to check if view is selected (around line 203):
  ```typescript
  const loadData = useCallback(async (showLoadingState = true) => {
    // Don't fetch if no view selected (mandatory view filtering)
    if (!selectedView) {
      setLoading(false)
      setInventoryItems([])
      return
    }
    // ... rest of existing loadData logic
  }, [filters, selectedView])
  ```
- Update useEffect dependency array to include selectedView

### 9. Add View Change Handler
- Add handler function for view changes:
  ```typescript
  const handleViewSelect = useCallback((view: InventoryViewType) => {
    setSelectedView(view)
    setPage(1)
    // Reset sub-selectors when changing view
    if (view !== "by-warehouse") setViewWarehouse("")
    if (view !== "by-channel") setViewChannel("")
    updateViewUrl(view)
  }, [updateViewUrl])

  const handleViewWarehouseChange = useCallback((warehouse: string) => {
    setViewWarehouse(warehouse)
    setPage(1)
    updateViewUrl(selectedView!, warehouse)
  }, [selectedView, updateViewUrl])

  const handleViewChannelChange = useCallback((channel: string) => {
    setViewChannel(channel)
    setPage(1)
    updateViewUrl(selectedView!, undefined, channel)
  }, [selectedView, updateViewUrl])
  ```

### 10. Update UI Layout - Add View Selector as First Element
- Locate header section (around line 366)
- Add view selector prominently BEFORE the KPI cards:
  ```tsx
  {/* Mandatory View Selector - First Element */}
  <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">View:</span>
        <InventoryViewSelector
          value={selectedView}
          onValueChange={handleViewSelect}
          warehouseOptions={WAREHOUSE_CODES}
          channelOptions={["store", "website", "Grab", "LINE MAN", "Gokoo"]}
          selectedWarehouse={viewWarehouse}
          selectedChannel={viewChannel}
          onWarehouseChange={handleViewWarehouseChange}
          onChannelChange={handleViewChannelChange}
        />
      </div>
      {/* Active view badge indicator */}
      {selectedView && (
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {selectedView.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
        </Badge>
      )}
    </div>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        setSelectedView(undefined)
        router.push("/inventory")
      }}
      className={selectedView ? "" : "invisible"}
    >
      Clear View
    </Button>
  </div>
  ```

### 11. Conditionally Render Content Based on View Selection
- Wrap KPI cards and table in conditional render:
  ```tsx
  {!selectedView ? (
    <InventoryEmptyState />
  ) : (
    <>
      {/* KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* ... existing KPI cards ... */}
      </div>

      {/* Products Table */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        {/* ... existing table content ... */}
      </Tabs>
    </>
  )}
  ```

### 12. Add Loading State for Sub-Selectors
- For "By Warehouse" and "By Channel" views, require sub-selection:
  ```tsx
  {selectedView === "by-warehouse" && !viewWarehouse ? (
    <InventoryEmptyState message="Please select a warehouse to view inventory" />
  ) : selectedView === "by-channel" && !viewChannel ? (
    <InventoryEmptyState message="Please select a channel to view inventory" />
  ) : (
    // ... render table content
  )}
  ```

### 13. Validate and Test
- Run `pnpm dev` to start development server
- Navigate to /inventory page
- Verify empty state appears on initial load
- Test each view option:
  - All Inventory
  - Available Stock Only
  - Low Stock Items
  - Out of Stock Items
  - Reserved Stock
  - Damaged/Quarantine
  - By Warehouse (with sub-selection)
  - By Channel (with sub-selection)
- Verify URL updates with view parameter
- Test direct URL access (e.g., /inventory?view=low-stock)
- Test view switching without page reload
- Verify active view badge indicator
- Test Clear View button

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `pnpm lint` - Ensure no ESLint errors
- `pnpm dev` - Start dev server and manually test:
  1. Open http://localhost:3000/inventory
  2. Verify empty state shows "Please select a view to display inventory"
  3. Select "All Inventory" - verify data loads
  4. Select "Low Stock Items" - verify filtered data
  5. Select "By Warehouse" - verify warehouse sub-selector appears
  6. Select a warehouse - verify filtered data
  7. Check URL contains `?view=by-warehouse&warehouse_id=XXX`
  8. Copy URL, open in new tab - verify view persists
  9. Click "Clear View" - verify empty state returns
  10. Test on mobile viewport for responsive behavior

## Notes
- The existing `viewFilter` state (for ECOM/MKP views) is separate from the new mandatory `selectedView` - they serve different purposes
- The existing status tabs (All Products, Low Stock, Out of Stock) should remain and work as additional filters on top of the mandatory view
- URL structure follows the spec: `/inventory?view=available-stock` or `/inventory?view=warehouse&warehouse_id=WH001`
- Empty state component is reusable for other pages that may need similar functionality
- For "By Warehouse" and "By Channel" views, data is only fetched after sub-selection is made
- The view selector should have visual prominence (background color, larger size) to indicate its importance
