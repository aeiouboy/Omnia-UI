# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
pnpm dev              # Start development server on http://localhost:3000
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Package Management
pnpm install          # Install dependencies
pnpm add <package>    # Add new dependency
```

## Core Architecture

### System Overview
RIS OMS (Retail Intelligence System - Order Management System) is a Next.js 15 enterprise application built for Central Group's order management operations. The system integrates with external APIs and provides real-time dashboards for order processing, SLA monitoring, and escalation management.

### Data Flow Architecture

**External API Integration**:
- **Currently working API**: `https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1/merchant/orders` ✅
- **Future API (not yet available)**: `https://service-api-nonprd.central.co.th/dev/pmprevamp/grabmart/v1/merchant/orders` ❌ (404 errors)
- **Authentication**: `/auth/poc-orderlist/login` with partner credentials: `testpocorderlist` / `xitgmLwmp` ✅
- **Token format**: JWT with `access_token` field, 1800 seconds expiry
- Server-side proxy at `/api/orders/external/route.ts` handles CORS and auth
- Fallback to local Supabase when external API unavailable

**Dual Database Strategy**:
- **External API**: Real-time order data (primary source)
- **Supabase**: Local data storage, escalation history, user management
- Mock client automatically used when Supabase credentials missing

### Key Components Architecture

**Executive Dashboard** (`components/executive-dashboard.tsx`):
- Real-time KPI monitoring with 4 parallel data fetching functions
- SLA breach/approaching detection with 20% threshold logic
- Escalation system with MS Teams webhook integration
- Channel performance analytics with dual y-axis charts
- TODO: Check API endpoint pagination and fix hardcoded page size of 5000

**Order Management Hub** (`components/order-management-hub.tsx`):
- Advanced filtering system with URL parameter support
- SLA filter logic must match executive dashboard exactly
- Pagination with configurable page sizes (default: 25)
- Complex search across multiple order fields

**API Response Structure**:
```typescript
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
```

### Critical SLA Logic Standards

**IMPORTANT**: SLA calculations must be consistent across all components:

```typescript
// API returns values in seconds, despite field names suggesting minutes
const targetSeconds = order.sla_info.target_minutes || 300  // Default 5 minutes
const elapsedSeconds = order.sla_info.elapsed_minutes || 0

// Breach condition
const isBreach = elapsedSeconds > targetSeconds || order.sla_info.status === "BREACH"

// Near-breach condition (20% threshold)
const remainingSeconds = targetSeconds - elapsedSeconds
const criticalThreshold = targetSeconds * 0.2
const isNearBreach = remainingSeconds <= criticalThreshold && remainingSeconds > 0
```

### Timezone Handling

**GMT+7 (Asia/Bangkok) Standard**:
- All display times use `formatGMT7TimeString()` from `lib/utils.ts`
- Hour-based analytics filter for "today" using GMT+7
- Consistent timezone handling across all components

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

### Environment Configuration

**Required Variables**:
```bash
# External API
API_BASE_URL=https://service-api-nonprd.central.co.th/dev/pmprevamp/grabmart/v1
# Legacy fallback: https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1
PARTNER_CLIENT_ID=testpocorderlist
PARTNER_CLIENT_SECRET=xitgmLwmp
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key

# MS Teams Integration
NEXT_PUBLIC_MS_TEAMS_WEBHOOK_URL=your-teams-webhook-url
NEXT_PUBLIC_APP_URL=your-app-domain
```

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
- Authentication uses multi-endpoint discovery for compatibility
- Required date parameters: dateFrom and dateTo (YYYY-MM-DD format)

### Escalation System

**Workflow**:
1. SLA breach/warning detection in executive dashboard
2. Database record creation via `lib/escalation-service.ts`
3. MS Teams notification with adaptive card format
4. Status tracking (PENDING → SENT → RESOLVED/FAILED)
5. Retry logic with exponential backoff

### Testing Approach

The system includes comprehensive todo tracking in `todo.md` for mobile optimization and feature development. When implementing new features, always update the todo list to track progress.

## Quick Update Shortcuts

**API Endpoint Updates**:
- Current primary API: `https://service-api-nonprd.central.co.th/dev/pmprevamp/grabmart/v1`
- Legacy fallback API: `https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1`
- Update files: `/app/api/*/route.ts`, `/lib/auth-client.ts`, `/docs/*.md`, `CLAUDE.md`
- Use environment variable `API_BASE_URL` to switch between APIs

**Authentication Configuration**:
- Authentication endpoint: `/auth/poc-orderlist/login` (POST method)
- Partner credentials: `partnerClientId: "testpocorderlist"`, `partnerClientSecret: "xitgmLwmp"`
- Token caching with automatic refresh logic
- Check `/lib/auth-client.ts` for implementation details

**API Documentation Updates**:
- Update `/docs/merchant-orders-api.md` with new parameter specifications
- Ensure all mandatory/optional parameters are documented correctly

**Add New Instructions**: 
- Edit this `CLAUDE.md` file and add to appropriate section