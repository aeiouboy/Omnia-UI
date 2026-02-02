# User Story Template: Stock Card Menu (By Product & By Store)

## Overview
Template for creating user stories for Stock Card menu features. Stock Card has two main views: **By Product** (transaction history) and **By Store** (store performance).

**Location**: `http://localhost:3000/inventory-new/stores`

---

## User Roles & Permissions

| Role | Store Visibility | Menu Visibility | Stock Card Permissions |
|------|-----------------|-----------------|----------------------|
| **BU Admin & Support** | All stores | All menus | View, Upload, Export |
| **Buyer** | All stores | Stock Config menu | View, Upload, Export |
| **Operation / O2O / CS** | All stores | All menus | View only |
| **Manager & Staff** | All stores | Order & Inventory only | ❌ No access to Stock Card |

### Permission Implementation Notes
- **View Permission**: Access to both By Product and By Store views
- **Upload Permission**: Can upload stock card data/configurations
- **Export Permission**: Can download CSV exports from both views
- **Manager & Staff**: Stock Card menu should be hidden from navigation

---

## User Stories by View Type

### 1. Stock Card - By Product View

#### Primary User Story - Buyer
**As a** Buyer  
**I want to** view transaction history for a specific product across a selected store  
**So that** I can track stock movements, validate inventory changes, and export records for reconciliation

**Acceptance Criteria:**
- [ ] I can select a date range (mandatory filter with orange border validation)
- [ ] I can search by Product ID or Product Name (mandatory, minimum 2 characters)
- [ ] I can search by Store ID or Store Name (mandatory, minimum 2 characters)
- [ ] I can filter transactions by type (Receipt IN, Issue OUT, Transfer, Adjustment, Return)
- [ ] I can search transaction notes
- [ ] I can view product info card with current balance and summary statistics
- [ ] I can view paginated transaction table with date, type, quantity, balance, and notes
- [ ] I can toggle between Product ID and Merchant SKU display
- [ ] I can export transaction history to CSV with proper formatting
- [ ] Export button is enabled for my role (Buyer)
- [ ] Transaction types are color-coded (green IN, red OUT, blue Transfer, orange Adjustment, purple Return)

#### Secondary User Story - BU Admin & Support
**As a** BU Admin  
**I want to** access and export product transaction history to support operations  
**So that** I can investigate inventory discrepancies and assist with troubleshooting

**Acceptance Criteria:**
- [ ] All features from Buyer story are available
- [ ] I can export CSV files
- [ ] I can view all transactions without restrictions

#### View-Only User Story - Operation / O2O / CS
**As an** Operations team member  
**I want to** view product transaction history without modification capabilities  
**So that** I can check stock movements when assisting customers

**Acceptance Criteria:**
- [ ] I can view all transaction data and filters
- [ ] Export button is hidden or disabled for my role
- [ ] UI shows clear read-only indicators where applicable
- [ ] I cannot upload or modify stock card data

---

### 2. Stock Card - By Store View

#### Primary User Story - Buyer
**As a** Buyer  
**I want to** view inventory performance across all stores filtered by View Type  
**So that** I can identify stores with low stock, critical stock issues, and overall inventory health

**Acceptance Criteria:**
- [ ] I can select View Type from dropdown (mandatory filter with orange border)
- [ ] I can optionally filter by Store ID (minimum 2 characters, cross-search both ID and Name)
- [ ] I can optionally filter by Store Name (minimum 2 characters, cross-search both ID and Name)
- [ ] I can view summary cards showing: Total Stores, Total Products, Low Stock Stores, Out of Stock Stores
- [ ] I can view store performance table with columns: Store Name, Store ID, Total Products, Low Stock Items, Critical Stock Items, Health Score, Store Status
- [ ] I can sort by any column (ascending/descending)
- [ ] I can filter by stock status (All, Critical, Low)
- [ ] I can click a store to navigate to inventory detail page filtered by that store
- [ ] Export functionality is available for my role
- [ ] Health scores are color-coded (green ≥80, yellow 60-79, red <60)

#### Secondary User Story - BU Admin & Support
**As a** BU Admin  
**I want to** monitor store performance and export reports  
**So that** I can support inventory management and identify issues proactively

**Acceptance Criteria:**
- [ ] All features from Buyer story are available
- [ ] I can export store performance data to CSV
- [ ] I can refresh data to get latest inventory status

#### View-Only User Story - Operation / O2O / CS
**As an** Operations team member  
**I want to** view store inventory performance to understand stock availability  
**So that** I can provide accurate information to customers about product availability

**Acceptance Criteria:**
- [ ] I can view all store performance data and filters
- [ ] Export functionality is hidden or disabled
- [ ] I can use filters and sorting
- [ ] Read-only mode is clearly indicated

---

## Common User Stories (Both Views)

### Tab Switching
**As a** user with Stock Card access  
**I want to** switch between By Product and By Store views using tabs  
**So that** I can access different types of stock information without leaving the page

**Acceptance Criteria:**
- [ ] Tab toggle is visible at the top of the page
- [ ] By Product tab shows product transaction history view
- [ ] By Store tab shows store performance table view
- [ ] Switching tabs preserves filter context when appropriate
- [ ] Active tab is visually highlighted

### Empty States
**As a** user  
**I want to** see clear empty state messages when filters are incomplete or no data is found  
**So that** I understand what action to take next

**Acceptance Criteria:**
- [ ] By Product view shows "Select a Product to View Stock Card" when mandatory filters are incomplete
- [ ] By Product view shows "No Transactions Found" when filters are complete but no data exists
- [ ] By Store view shows "Select View Type to Load Data" when View Type is not selected
- [ ] By Store view shows "No Stores Found" when filters complete but no matching stores
- [ ] All empty states include appropriate icons and descriptive text

### Responsive Design
**As a** mobile user  
**I want to** use Stock Card on tablet and mobile devices  
**So that** I can access inventory data on the go

**Acceptance Criteria:**
- [ ] Desktop (≥1024px): Full table layout, single-row filters
- [ ] Tablet (768-1023px): Horizontal scroll for tables, two-row filters
- [ ] Mobile (<768px): Card-based layout instead of tables, stacked filters
- [ ] All interactive elements are touch-friendly
- [ ] No horizontal overflow on any screen size

---

## Permission-Based UI Elements

### Action Button Visibility Matrix
```typescript
const canUploadStockCard = ['BU_ADMIN', 'SUPPORT', 'BUYER'].includes(userRole);
const canExportStockCard = ['BU_ADMIN', 'SUPPORT', 'BUYER'].includes(userRole);
const canViewStockCard = ['BU_ADMIN', 'SUPPORT', 'OPERATION', 'O2O', 'CS', 'BUYER'].includes(userRole);
const canAccessStockCard = !['MANAGER', 'STAFF'].includes(userRole);
```

### UI Variations by Role
- **Buyer / BU Admin**: Full toolbar with [Refresh] [Clear All] [Export CSV] buttons
- **Operations / CS**: Toolbar without Export button, or Export button disabled
- **Manager / Staff**: Stock Card menu item hidden in sidebar navigation

---

## Filter Validation Patterns

### By Product View - Mandatory Filters
All three filter groups must be completed before data loads:
1. **Date Range** (orange border when incomplete)
   - Start Date AND End Date required
2. **Product Search** (orange border when incomplete)
   - Product ID OR Product Name (minimum 2 characters)
3. **Store Search** (orange border when incomplete)
   - Store ID OR Store Name (minimum 2 characters)

### By Store View - Mandatory Filters
One filter is mandatory:
1. **View Type** (orange border when "All View Types" or not selected)
   - Must select specific view type (e.g., "ECOM-TH-CFR-LOCD-STD")

Optional filters:
- Store ID search (cross-searches both ID and Name)
- Store Name search (cross-searches both Name and ID)

---

## Data Requirements

### By Product View - Transaction Fields
| Field | Type | Description | Display Format |
|-------|------|-------------|----------------|
| timestamp | string (ISO) | Transaction date/time | "Jan 25, 26 10:30 AM" (GMT+7) |
| transactionType | ProductTransactionType | Type of transaction | Badge with icon and color |
| quantity | number | Amount moved (+/-) | "+50" (green), "-30" (red) |
| balance | number | Balance after transaction | "150" (right-aligned) |
| notes | string | Transaction notes | Truncated with tooltip |
| referenceId | string | Related document reference | "PO-12345", "SO-67890" |

### By Store View - Store Performance Fields
| Field | Type | Description | Display Format |
|-------|------|-------------|----------------|
| storeName | string | Store display name | Text link to inventory detail |
| storeId | string | Store identifier | Muted text |
| totalProducts | number | Total SKUs in store | Number |
| lowStockItems | number | Items below safety stock | Number with warning icon |
| criticalStockItems | number | Out of stock items | Number with alert icon |
| healthScore | number | Inventory health (0-100) | Colored badge and progress bar |
| storeStatus | string | Store operational status | Badge (Active/Inactive) |

---

## Files to Reference

### Existing Files
- **`app/inventory-new/stores/page.tsx`** - Main Stock Card page with both views implemented
- **`lib/stock-card-mock-data.ts`** - Mock data generator for By Product transactions
- **`lib/stock-card-export.ts`** - CSV export utility
- **`components/inventory/product-info-card.tsx`** - Product summary card for By Product view
- **`lib/inventory-service.ts`** - API service for fetching store performance data
- **`types/inventory.ts`** - TypeScript interfaces for inventory data

### Permission Implementation Files (to be created/modified)
- **`lib/permissions.ts`** - Define role constants and permission checks
- **`hooks/useUserPermissions.ts`** - Hook to check user permissions
- **`contexts/auth-context.tsx`** - User authentication and role context
- **`components/layout/sidebar.tsx`** - Conditionally show/hide menu items by role

---

## Testing Checklist

### By Product View Tests
- [ ] **Buyer**: Can view, filter, and export product transactions
- [ ] **BU Admin**: Full access to all features
- [ ] **Operations**: Can view but Export button is hidden/disabled
- [ ] **Manager**: Cannot access Stock Card (menu hidden)
- [ ] Date range filter shows orange border when incomplete
- [ ] Product search filter shows orange border until minimum 2 chars
- [ ] Store search filter shows orange border until minimum 2 chars
- [ ] Refresh button disabled until all mandatory filters complete
- [ ] Product info card displays when data loads
- [ ] Transaction table shows correct color coding
- [ ] Pagination works correctly
- [ ] CSV export downloads with proper format and headers
- [ ] Merchant SKU toggle persists in localStorage

### By Store View Tests
- [ ] **Buyer**: Can view, filter, sort, and export store performance
- [ ] **BU Admin**: Full access to all features
- [ ] **Operations**: Can view but Export button is hidden/disabled
- [ ] **Manager**: Cannot access Stock Card (menu hidden)
- [ ] View Type filter shows orange border until selected
- [ ] Store search filters are optional (no orange border)
- [ ] Cross-search works (Store ID searches both ID and Name)
- [ ] Data loads only when View Type is selected
- [ ] Summary cards show correct aggregated statistics
- [ ] Table sorting works for all columns
- [ ] Health score colors are correct (green/yellow/red)
- [ ] Clicking store navigates to inventory detail page

### Common Tests
- [ ] Tab switching works without errors
- [ ] Empty states display correctly
- [ ] Responsive layout works on mobile, tablet, desktop
- [ ] Permission checks prevent unauthorized actions
- [ ] TypeScript compilation passes
- [ ] Production build succeeds

---

## Example: How to Use This Template

When creating a new user story for Stock Card, follow these steps:

1. **Identify the specific feature** (e.g., "Add barcode scanning to Product search")
2. **Choose the view** (By Product or By Store)
3. **Copy relevant user story sections** from this template
4. **Customize acceptance criteria** for your specific feature
5. **Add technical implementation details**
6. **Define testing scenarios** including role-based permissions
7. **Create specification file** in appropriate format (wireframe or chore)

### Example User Story: Add Barcode Scanner to By Product View

**As a** Buyer  
**I want to** scan product barcodes to quickly populate the Product ID search field  
**So that** I can access transaction history faster without manually typing product codes

**Acceptance Criteria:**
- [ ] Barcode scanner icon appears next to Product ID input field
- [ ] Clicking scanner activates device camera (if available)
- [ ] Scanning a barcode auto-populates Product ID field
- [ ] Invalid/unreadable barcodes show error message
- [ ] Scanner button is only visible on supported devices
- [ ] Feature works on both desktop (webcam) and mobile (camera)
- [ ] Respects role permissions (same as Product ID search)

---

## Notes

### Design Consistency
- Follow existing patterns from `app/inventory-new/stores/page.tsx`
- Use orange border validation pattern for mandatory filters
- Maintain color coding standards (green/red/blue/orange/purple for transaction types)
- Use GMT+7 timezone for all date/time displays

### Performance Considerations
- Implement debouncing for search inputs (400ms)
- Use `useMemo` for filtered/sorted data lists
- Paginate large transaction lists
- Consider virtualization for >100 rows

### Future API Integration
- Mock data structure should match expected API responses
- Filter parameters should align with backend API query params
- Export utilities should work with both mock and real data
- Role/permission checks should integrate with authentication system
