# Task 7: Stock Config Menu - Stock Config by Channel

## Objective
Add channel-based stock configuration functionality

## Requirements
- Create new menu item or section: "Stock Config by Channel"
- Allow configuration of stock rules per sales channel:
  - Online Store
  - Physical Stores
  - Marketplace (Lazada, Shopee, etc.)
  - B2B/Wholesale
  - Mobile App
  - Partner Channels
- Configurable parameters per channel:
  - **Safety Stock Level**: Minimum stock to maintain
  - **Reorder Point**: When to trigger reorder
  - **Maximum Stock Level**: Maximum inventory cap
  - **Allocation Priority**: Order of allocation when stock is limited
  - **Reserved Stock %**: Percentage reserved for this channel
  - **Lead Time**: Expected replenishment lead time
  - **Enable/Disable Channel**: Turn channel on/off
- Support warehouse-channel mapping:
  - Configure which warehouses serve which channels
  - Multi-warehouse to single channel
  - Single warehouse to multiple channels
- Implement configuration interface:
  - Channel list with quick enable/disable toggle
  - Edit configuration form with validation
  - Preview impact of configuration changes
  - Save and apply changes with confirmation
  - Configuration history/audit trail
- Add API endpoints:
  - GET `/api/stock-config/channels` - List all channel configs
  - GET `/api/stock-config/channels/:channel_id` - Get specific config
  - POST `/api/stock-config/channels` - Create new config
  - PUT `/api/stock-config/channels/:channel_id` - Update config
  - DELETE `/api/stock-config/channels/:channel_id` - Remove config
- Validation rules:
  - Safety stock < Reorder point < Max stock
  - Reserved stock % ≤ 100%
  - At least one channel must be enabled
  - Warehouse must be active to be assigned

## Data Structure
```typescript
interface StockConfigByChannel {
  id: string
  channel_id: string
  channel_name: string
  channel_type: 'online' | 'retail' | 'marketplace' | 'b2b' | 'mobile' | 'partner'
  is_enabled: boolean

  // Stock thresholds
  safety_stock_level: number
  reorder_point: number
  maximum_stock_level: number

  // Allocation rules
  allocation_priority: number // 1 = highest priority
  reserved_stock_percentage: number // 0-100

  // Operations
  lead_time_days: number
  warehouse_ids: string[] // Associated warehouses

  // Metadata
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
}
```

## UI Components Needed
1. Channel configuration list (table/cards)
2. Add/Edit channel configuration modal/form
3. Warehouse assignment interface (multi-select)
4. Configuration impact preview
5. Enable/Disable toggle switches
6. Validation error displays
7. Success/Error notifications
8. Configuration history viewer

## Success Criteria
- [ ] Menu item/section for Stock Config by Channel exists
- [ ] Can view all channel configurations
- [ ] Can create new channel configuration
- [ ] Can edit existing configurations
- [ ] Can enable/disable channels
- [ ] Warehouse assignment works correctly
- [ ] All validation rules enforced
- [ ] Configuration saves successfully
- [ ] API endpoints functional
- [ ] Mobile responsive forms
- [ ] No console errors

## ADW Execution
```bash
./adws/adw_chore_implement.py "Add 'Stock Config by Channel' functionality to Stock Config menu. Create interface for configuring stock rules per sales channel (Online Store, Physical Stores, Marketplace, B2B/Wholesale, Mobile App, Partner Channels). Include configurable parameters: Safety Stock Level, Reorder Point, Maximum Stock Level, Allocation Priority, Reserved Stock %, Lead Time, and Enable/Disable toggle. Support warehouse-channel mapping with multi-select. Implement configuration list, add/edit forms, validation (safety stock < reorder point < max stock, reserved % ≤ 100%), save/apply with confirmation, and configuration history. Add API endpoints for CRUD operations." --model opus
```
