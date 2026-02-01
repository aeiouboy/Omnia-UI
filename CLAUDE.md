# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

\`\`\`bash
# Development
pnpm dev              # Start development server on http://localhost:3000
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Package Management
pnpm install          # Install dependencies
pnpm add <package>    # Add new dependency
\`\`\`
## Core Architecture

### System Overview
RIS OMS (Retail Intelligence System - Order Management System) is a Next.js 15 enterprise application built for Central Group's order management operations. The system integrates with external APIs and provides real-time dashboards for order processing, SLA monitoring, and escalation management.

### Data Flow Architecture

**External API Integration**:
- **API Base URL**: `https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1` ✅
- **Authentication**: `POST /auth/poc-orderlist/login` with partner credentials from environment variables ✅
- **Order List**: `GET /merchant/orders` with Bearer Token authentication ✅
- **Order Details**: `GET /merchant/orders/:orderid` with Bearer Token authentication ✅
- **Token format**: JWT with `access_token` field, 1800 seconds expiry
- Server-side proxy at `/api/orders/external/route.ts` handles CORS and auth
- Simplified single-endpoint configuration for better reliability

**Real-Time Breach Counts** (Task 21 - COMPLETED):
- **Requirement**: Display accurate breach counts not limited by pagination
- **Implementation**: Created dedicated `/api/orders/counts` endpoint
- **Update Frequency**: Every 10 seconds via background polling
- **Caching**: 5-second server-side TTL, client-side stale-while-revalidate
- **UI Display**: Show counts in parentheses on quick filter buttons:
  - Urgent Orders (breach count)
  - Due Soon (near breach count)
  - Ready to Process (submitted count)
  - On Hold (on-hold count)
- **Performance**: Background polling does not impact main dashboard data fetching
- **Files Created**: 
  - `/app/api/orders/counts/route.ts` - API endpoint for real-time counts
  - `/hooks/use-order-counts.ts` - React hook for fetching counts

**Dual Database Strategy**:
- **External API**: Real-time order data (primary source)
- **Supabase**: Local data storage, escalation history, user management
- Mock client automatically used when Supabase credentials missing

### 🏪 **CRITICAL: Store Fulfillment Performance Requirements**
**MANDATORY**: Store Fulfillment Performance section MUST display Tops store branches only.

**Required Tops Store Branches for Store Fulfillment Performance:**
```javascript
const topsStores = [
  'Tops Central Plaza ลาดพร้าว',
  'Tops Central World', 
  'Tops สุขุมวิท 39',
  'Tops ทองหล่อ',
  'Tops สีลม คอมเพล็กซ์',
  'Tops เอกมัย',
  'Tops พร้อมพงษ์',
  'Tops จตุจักร'
]
```

**Implementation Location**: 
- File: `/components/executive-dashboard.tsx`
- Function: `generateRealisticApiData()` - Line ~686
- Used in: Store Fulfillment Performance chart via `calculateFulfillmentByBranch()`
- Alert locations: Must use Tops store names in order alerts

**DO NOT USE**: Grab restaurant names or other store types for Store Fulfillment Performance.

### Key Components Architecture

**Executive Dashboard** (`components/executive-dashboard/`):
- Real-time KPI monitoring with 4 parallel data fetching functions
- SLA breach/approaching detection with 20% threshold logic
- Escalation system with MS Teams webhook integration
- Channel performance analytics with dual y-axis charts
- **NO FILTERS**: Executive Dashboard must NOT have any filters (no date range, no search, no status filters)
- Always shows full 7-day data for complete overview
- TODO: Check API endpoint pagination and fix hardcoded page size of 5000

**Order Management Hub** (`components/order-management-hub.tsx`):
- Advanced filtering system with URL parameter support
- SLA filter logic must match executive dashboard exactly
- Pagination with configurable page sizes (default: 25)
- Complex search across multiple order fields

**API Response Structure**:
\`\`\`typescript
interface ApiOrder {
  id: string
  order_no: string
  customer: ApiCustomer
  sla_info: {
    target_minutes: number    // Values in seconds (not minutes)
    elapsed_minutes: number   // Values in seconds (not minutes)
    status: "BREACH" | "NEAR_BREACH" | "COMPLIANT"
  }
  // ... other fields
}
\`\`\`

### Order Type System

**UNIFIED ORDER TYPE** - Single taxonomy for order classification (chore-ae72224b):

The system uses a single Order Type field (FMSOrderType) with 7 values:

| Order Type | Description | Badge Color | Icon | Usage |
|------------|-------------|-------------|------|-------|
| Return Order | Return/refund orders | Red/Pink | Undo2 | ~10% of orders |
| MKP-HD-STD | Marketplace Home Delivery Standard | Purple | ShoppingBag | Third-party marketplace |
| RT-HD-EXP | Retail Home Delivery Express | Orange | Zap | Urgent home delivery |
| RT-CC-STD | Retail Click & Collect Standard | Green | Store | Store pickup |
| RT-MIX-STD | Retail Mixed Delivery Standard | Teal | Settings | Hybrid delivery |
| RT-HD-STD | Retail Home Delivery Standard | Blue | Truck | Standard home delivery |
| RT-CC-EXP | Retail Click & Collect Express | Amber | Store | Urgent store pickup |

**Code Format**: `{Platform}-{Method}-{Speed}` or special type
- Platform: RT (Retail), MKP (Marketplace)
- Method: HD (Home Delivery), CC (Click & Collect), MIX (Mixed)
- Speed: STD (Standard), EXP (Express)

**DEPRECATED**: DeliveryTypeCode has been merged into FMSOrderType (chore-ae72224b)
- `DeliveryTypeCodeBadge` component kept for backward compatibility
- `deliveryTypeCode` field aliased to `orderType`

**Mock Data Distribution** (Demo Orders):
- Return orders: ~10% of total orders (index % 10 === 0)
- Other types: Rotates through remaining 6 types via modulo rotation

**Related Files**:
- Type definition: `src/components/order-management-hub.tsx` (line 173)
- Badge component: `src/components/order-badges.tsx` (OrderTypeBadge)
- Filter dropdown: `src/components/order-management-hub.tsx` (lines 2260-2275)
- Demo data generator: `src/components/order-management-hub.tsx` (lines 446-451)

### Critical SLA Logic Standards

**IMPORTANT**: SLA calculations must be consistent across all components:

\`\`\`typescript
// API returns values in seconds, despite field names suggesting minutes
const targetSeconds = order.sla_info.target_minutes || 300  // Default 5 minutes
const elapsedSeconds = order.sla_info.elapsed_minutes || 0

// Breach condition
const isBreach = elapsedSeconds > targetSeconds || order.sla_info.status === "BREACH"

// Near-breach condition (20% threshold)
const remainingSeconds = targetSeconds - elapsedSeconds
const criticalThreshold = targetSeconds * 0.2
const isNearBreach = remainingSeconds <= criticalThreshold && remainingSeconds > 0
\`\`\`

### Timezone Handling

**GMT+7 (Asia/Bangkok) Standard**:
- All display times use `formatGMT7TimeString()` from `lib/utils.ts`
- Hour-based analytics filter for "today" using GMT+7
- Consistent timezone handling across all components

### Date/Time Format Standard (chore-7d3a2f05)

**Official Format**: `MM/DD/YYYY HH:mm:ss` (e.g., `11/21/2025 10:42:00`)

**Core Formatting Functions** (from `src/lib/utils.ts`):
- `formatStandardDateTime(date)` - Returns MM/DD/YYYY HH:mm:ss (full format)
- `formatStandardDate(date)` - Returns MM/DD/YYYY (date only)
- `formatStandardTime(date)` - Returns HH:mm:ss (time only)
- `formatGMT7DateTime(date)` - Legacy alias, same format

**Usage Guidelines**:
- All user-facing date/time displays must use MM/DD/YYYY HH:mm:ss format
- All times displayed in GMT+7 (Asia/Bangkok) timezone
- API/database operations use ISO 8601 format internally
- CSV exports use the same MM/DD/YYYY HH:mm:ss format

**Files Updated**:
- `src/lib/utils.ts` - Core utility functions
- `src/lib/timezone-utils.ts` - Bangkok timezone utilities
- `src/lib/export-utils.ts` - CSV export formatting
- Component-specific formatters standardized across all files

### Mobile-First Design

**Responsive Breakpoints**:
- Mobile: `grid-cols-1` 
- Small: `sm:grid-cols-2` (640px+)
- Large: `lg:grid-cols-3` (1024px+)
- Extra Large: `xl:grid-cols-6` (1280px+)

**Touch Interaction Standards**:
- Minimum 44px touch targets
- Swipeable components using custom hooks in `hooks/`
- Pull-to-refresh functionality where applicable

### UI Consistency Standards

**Search/Filter Input Widths**:
- All search and filter input fields use `min-w-[160px]` minimum width
- Prevents placeholder text truncation across all pages
- Ensures consistent visual alignment in filter sections

**Empty State Icon Sizes**:
- Card-level empty states: `h-16 w-16` (64px) icons
- Inline/table empty states: `h-12 w-12` (48px) icons
- Consistent Package/BarChart3 icons with `text-muted-foreground/50` color

**Clear All Button Styling**:
- All "Clear All" buttons use `hover:bg-gray-100` hover effect
- Provides subtle, consistent feedback for secondary actions
- Applies across inventory, order management, and stock card pages

**Dropdown Filter Widths**:
- Short dropdowns (single field): `min-w-[160px]`
- Medium dropdowns (e.g., Supply Types): `min-w-[160px]`
- Long dropdowns with descriptions (View Types): `w-[280px]` (fixed width prevents layout shift)

**Horizontal Scroll Indicators** (future enhancement):
- Data tables with overflow should show visual scroll indicators
- Helps users discover horizontal scrolling capability
- Not yet fully implemented across all tables

**Reference**: See `specs/chore-f5c2c63c-standardize-ui-patterns-global-consistency.md` for detailed implementation.

### Environment Configuration

**Required Variables**:
\`\`\`bash
# External API Configuration
API_BASE_URL=https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1
PARTNER_CLIENT_ID=testpocorderlist
PARTNER_CLIENT_SECRET=xitgmLwmp

# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key

# MS Teams Integration
NEXT_PUBLIC_MS_TEAMS_WEBHOOK_URL=your-teams-webhook-url
NEXT_PUBLIC_APP_URL=your-app-domain
\`\`\`

### Component Dependencies

**UI Foundation**:
- Radix UI primitives with custom styling
- Tailwind CSS with enterprise color palette
- Recharts for data visualization
- Lucide React for icons

**State Management Pattern**:
- React hooks for local state
- URL parameters for shareable filter states
- Context providers for global state (sidebar, theme)

### Error Handling Strategy

**API Failure Cascade**:
1. Try server-side proxy first (bypasses CORS)
2. Retry with fresh token on 401 errors  
3. Fall back to direct client fetch
4. Return empty data with proper pagination structure

**User Feedback**:
- Toast notifications for user actions
- Loading skeletons during data fetch
- Error alerts with retry options
- Graceful degradation when services unavailable

### Development Guidelines

**Code Style**:
- TypeScript strict mode enabled
- No ESLint/TypeScript errors in production builds
- Mobile-first responsive design approach
- Consistent error boundaries and loading states

**Performance Optimization**:
- Image optimization disabled (`unoptimized: true`)
- Lazy loading for large datasets
- Memoized computations for expensive operations
- Parallel data fetching where possible

**API Integration**:
- Always include CORS headers in API routes
- Implement proper timeout handling (15-30s)
- Use AbortController for request cancellation
- Provide fallback data structures for failed requests
- Single-endpoint authentication with `/auth/poc-orderlist/login`
- Required date parameters: dateFrom and dateTo (YYYY-MM-DD format)
- Bearer Token authentication for all order API calls

### Escalation System

**Workflow**:
1. SLA breach/warning detection in executive dashboard
2. Database record creation via `lib/escalation-service.ts`
3. MS Teams notification with adaptive card format
4. Status tracking (PENDING → SENT → RESOLVED/FAILED)
5. Retry logic with exponential backoff

### Task Management Approach

**CRITICAL: Session Start Protocol**:
**EVERY TIME Claude starts, FIRST check task-master status and next task:**
1. Read `.taskmaster/docs/prd.txt` for current status and completed tasks
2. Review `.taskmaster/reports/task-complexity-report.json` for priority analysis
3. Identify next highest-priority incomplete task
4. Update current TodoWrite list with task-master priorities
5. Begin implementation following task-master methodology

**CRITICAL: Task-Master Commands Protocol**:
**When user uses task-master commands, respond with structured task management:**

**Task-Master Commands:**
- `task-master next task` - Start/continue task-master session
- `task-master next task [number]` - Work on specific task (e.g., `task-master next task 9`)
- `task-master set status [done|completed|in-progress|pending]` - Set overall status
- `task-master set-status` - Update current task status in all files

**Task-Master Response Protocol:**
1. Check `.taskmaster/` directory for current status and priorities
2. Follow the task-master roadmap in `.taskmaster/docs/prd.txt`
3. Update status in ALL relevant files:
   - `.taskmaster/tasks/task_XXX.txt`
   - `.taskmaster/tasks/tasks.json`
   - `.taskmaster/docs/prd.txt`
4. Focus on roadmap implementation rather than ad-hoc fixes
5. Ensure structured, prioritized development following complexity-scored roadmap

**CRITICAL: NEVER USE MOCK DATA FOR ALERTS**:
**ABSOLUTELY FORBIDDEN - Mock data must NEVER be used for:**
- Critical Alerts (SLA breaches, approaching deadlines)
- Security alerts or warnings
- Financial transactions or revenue alerts
- System status alerts
- Any alert that could trigger business decisions
**Rule: Always check API status first - if mock data detected, return EMPTY alerts instead**

**Task-Master Workflow** (PRIMARY WORKFLOW):
- Use `.taskmaster/` directory for ALL task management
- Follow PRD-based development approach documented in `.taskmaster/docs/prd.txt`
- Task complexity analysis available in `.taskmaster/reports/task-complexity-report.json`
- Configuration managed via `.taskmaster/config.json`
- Individual tasks in `.taskmaster/tasks/task_XXX.txt`
- Task summary in `.taskmaster/tasks/tasks.json`

**CRITICAL: Task Completion Workflow**:
When completing a task, ALWAYS update status in ALL locations:
1. **Individual task file**: Update `Status: pending` to `Status: completed` in `.taskmaster/tasks/task_XXX.txt`
2. **Tasks JSON file**: Update task status in `.taskmaster/tasks/tasks.json` from `"status": "pending"` to `"status": "completed"`
3. **Update metadata**: Update the `"updated"` timestamp in tasks.json metadata
4. **Use MCP tool when available**: Try `mcp__task-master-ai__set_task_status` first, but if it fails, update files manually
5. **Verify updates**: Always confirm both files are updated before moving to next task

**Development Workflow**:
1. **ALWAYS START**: Run `task-master next task` to get current task
2. Check `.taskmaster/docs/prd.txt` for project status
3. Review `.taskmaster/reports/task-complexity-report.json` for priorities
4. Work on tasks in priority order based on complexity analysis
5. Update task status in both individual task file and tasks.json
6. NO LONGER USE todo.md - archived at `.taskmaster/archive/original-todo.md`

**Task-Master Priority Order** (Based on Complexity Analysis):
1. Task 007 - Define Partner KPI API Contract (foundation)
2. Task 004 - Implement Lazy Loading (quick win)
3. Task 006 - Optimize Render Performance (low risk)
4. Task 008 - Implement KPI Service Layer (complex but critical)
5. Task 005 - Add Memory Optimization (medium risk)

**CRITICAL Task-Master Rules**:
- When creating sub-tasks, ALWAYS include ALL required fields:
  - Task ID, Title, Status, Priority, Phase, Dependencies, Category, Parent, Complexity
- Never create incomplete task files - all metadata fields are mandatory
- Sub-tasks inherit Priority and Phase from parent task unless specified otherwise
- Complexity scores for sub-tasks should be calculated based on effort and risk

**Task Prioritization (by complexity score)**:
- **High Priority (7-8)**: Authentication Module, Memory Management, Performance Optimization
- **Medium Priority (5-6)**: Pagination Logic, Error Handling, Caching Strategy, Data Validation
- **Low Priority (2-4)**: Page Size Updates, Loading States, UI Reorganization

## Quick Update Shortcuts

**API Endpoint Configuration**:
- Single API endpoint: `https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1`
- Authentication endpoint: `/auth/poc-orderlist/login`
- Orders endpoint: `/merchant/orders`
- Update files: `/app/api/*/route.ts`, `/lib/auth-client.ts`, `/docs/*.md`, `CLAUDE.md`
- Use environment variable `API_BASE_URL` for configuration

**Executive Dashboard Filter Rules**:
- **ABSOLUTELY NO FILTERS** in Executive Dashboard
- No date range picker, no search box, no status filters
- Always displays full 7-day data for complete business overview
- All filtering functionality must be in Order Management Hub only

**Authentication Configuration**:
- Authentication endpoint: `/auth/poc-orderlist/login` (POST method)
- Partner credentials: Use environment variables `PARTNER_CLIENT_ID` and `PARTNER_CLIENT_SECRET`
- Token caching with automatic refresh logic
- Check `/lib/auth-client.ts` for implementation details

**API Documentation Updates**:
- Update `/docs/merchant-orders-api.md` with new parameter specifications
- Ensure all mandatory/optional parameters are documented correctly

**Git Commit Rules**:
- **ALWAYS** use `git add .` before committing to ensure no files are missed
- Review `git status` output carefully before staging files
- Never commit partially - all related changes must be included in the commit
- **ALWAYS TEST BEFORE COMMITTING** - Run `npm run dev` or `npm run build` to verify no errors
- Example workflow:
  ```bash
  git status          # Review all changes
  npm run dev         # Test for errors (Ctrl+C after confirming it starts)
  git add .           # Stage ALL changes
  git status          # Verify all files are staged
  git commit -m "..."  # Commit with clear message
  ```

**Add New Instructions**: 
- Edit this `CLAUDE.md` file and add to appropriate section

## Recent Fixes

### Alert System 7-Day Window Fix (2025-11-24)
- **CRITICAL FIX**: Removed today-only filtering in `processOrderAlerts()` function
- Alerts now display for ANY order in the 7-day window with SLA issues (not just today's orders)
- Enhanced alert pipeline logging with 4 stages: Orders received → SLA filtering → Alert mapping → UI display
- Improved mock data detection logging with test query context notes
- Added AlertsSection component render logging for debugging
- All SLA breaches and approaching deadlines from the entire 7-day window now visible
- No performance impact - same data fetching strategy, just broader alert coverage

**Alert System Behavior:**
- **7-Day Alert Window**: Alerts display for ANY order in the 7-day window with SLA issues
- **No Today-Only Filtering**: Breaches from any day in the window trigger alerts
- **GMT+7 Timezone**: All date/time calculations use Asia/Bangkok timezone
- **Mock Data Protection**: Alerts NEVER display if API returns mock data flag
- **SLA Thresholds**: Breach when elapsed > target, Approaching when remaining <= 20% of target
- **Pipeline Logging**: Console shows all 4 stages of alert processing for debugging

### Currency Format Changes (2025-06-23)
- Created formatCurrencyInt utility function for consistent integer display
- Updated all monetary amounts to show as whole numbers (฿400,000 instead of ฿0.4M)
- Fixed revenue calculations to use actual order data instead of random values
- Fixed SLA status display in recent orders table (shows for all orders with sla_info)
- Added missing useMemo import in virtualized table component
- No performance impact - maintains 25,000 order limit optimization

### Vercel Deployment Configuration (2025-06-23)
- Created vercel.json for deployment settings
- Added deployment scripts for automated deployment
- Created environment variable configuration scripts
- Documented deployment process in docs/vercel-deployment.md

### Order Management Hub UX/UI Improvements (2026-02-01)
- **Smart Filter Bar**: 7 most-used filters always visible in responsive grid (grid-cols-2 md:grid-cols-3 lg:grid-cols-4)
  - Primary filters: Order ID, Order Status, Store No, Channel, Payment Status, Payment Method, Order Date Range
  - Clear All and Apply Filters action buttons added
  - Advanced filters (SKU, Item Name, Customer details) moved to collapsible "More Filters" section
  - All inputs use min-w-[160px] for consistent readability
- **Status Badges with Icons**: Added semantic icons to OrderStatusBadge, PaymentStatusBadge, OnHoldBadge
  - CheckCircle for completed/paid, Clock for pending, AlertTriangle for on-hold, Truck for shipped, Package for processing
  - Improves accessibility for colorblind users (WCAG 2.1 AA compliance)
- **Table Optimizations**:
  - Sticky headers (sticky top-0 bg-gray-50) remain visible during scrolling
  - Defined minimum widths for all columns with proper text truncation and tooltips
  - Improved typography: text-sm (14px) for headers and cells, proper padding (py-3 px-4)
  - Order number styled as clickable blue link (text-blue-600)
- **Mobile Card View**: Responsive card layout for screens < 768px with 44px touch targets
  - Cards replace table on mobile with stacked vertical layout
  - Shows Order #, Status, Customer info, Store No, Total, Payment Status, Channel, Date
  - Proper spacing (gap-3, p-4) for comfortable mobile reading
- **Enhanced Empty State**: Package icon (h-16 w-16), helpful messaging, Clear Filters and Refresh actions
  - Suggestion text: "Try adjusting your filters or search terms..."
- **Skeleton Loading**: Professional loading skeletons for perceived performance improvement
  - 5 skeleton rows for desktop table, 5 skeleton cards for mobile
  - Matches exact layout structure with badge-shaped skeletons for status fields
- **Accessibility**: Full WCAG 2.1 AA compliance
  - ARIA labels on all icon-only buttons and inputs
  - role="status" and aria-live="polite" for loading states
  - Minimum 44x44px touch targets on mobile
  - Proper form labels with htmlFor attributes
