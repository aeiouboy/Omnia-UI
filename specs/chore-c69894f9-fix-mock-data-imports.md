# Chore: Fix TypeScript Import Error in mock-data.ts

## Metadata
adw_id: `c69894f9`
prompt: `Fix the TypeScript error in src/lib/mock-data.ts line 4. The error is: Module './dashboard-service' has no exported member 'ApiOrder'. The ApiOrder type needs to be imported from the correct location. Search the codebase to find where ApiOrder is actually defined (likely in src/components/executive-dashboard/types.ts) and update the import statement to use the correct path. Also check if ExecutiveKPIs, OrderMetrics, and PerformanceMetrics are correctly exported from dashboard-service or if they also need import path updates.`

## Chore Description
Fix the TypeScript build error in `src/lib/mock-data.ts` caused by an incorrect import statement. The file is attempting to import `ApiOrder` from `./dashboard-service`, but this type is not exported from that module. Based on codebase analysis:

1. **ApiOrder** is actually defined and exported in `src/components/executive-dashboard/types.ts` (line 54-70)
2. **ExecutiveKPIs, OrderMetrics, PerformanceMetrics** do not exist as exported types anywhere in the codebase
3. The `src/lib/dashboard-service.ts` file does not export any of these types

The mock-data.ts file currently has no imports but uses `any[]` types for mock data. The file needs to be checked for any actual import statements that may be causing the error, and if needed, proper type imports should be added.

## Relevant Files
Files relevant to this chore:

- **src/lib/mock-data.ts** - The file with the TypeScript error on line 4. Currently has no visible imports in the first 20 lines, but the error indicates an incorrect import exists somewhere.
- **src/components/executive-dashboard/types.ts** - Contains the correct definition of `ApiOrder` interface (lines 54-70) along with other related types like `ApiSLAInfo`, `ApiCustomer`, `ApiOrderItem`, etc.
- **src/lib/dashboard-service.ts** - Currently does NOT export `ApiOrder`, `ExecutiveKPIs`, `OrderMetrics`, or `PerformanceMetrics`. Only exports service-specific types like `BusinessUnitRevenue`, `ChannelDistribution`, `DailyTrend`, etc.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Identify the Problematic Import Statement
- Read the entire `src/lib/mock-data.ts` file to locate the import statement causing the error
- Confirm which types are being incorrectly imported from `./dashboard-service`
- Document the exact line number and import statement

### 2. Remove or Comment Out Invalid Import
- Remove the invalid import statement that attempts to import `ApiOrder` (and potentially other types) from `./dashboard-service`
- Add a comment explaining why the import was removed

### 3. Verify Type Usage in mock-data.ts
- Analyze the file to determine if explicit type imports are actually needed
- Check if the file uses `any[]` types or requires proper TypeScript types
- Determine if adding proper type imports would improve type safety

### 4. Add Correct Type Imports (If Needed)
- If types are needed, add import statement for `ApiOrder` from the correct path:
  ```typescript
  import type { ApiOrder } from '@/components/executive-dashboard/types'
  ```
- Only import types that are actually used in the file
- Use type-only imports (`import type`) for better tree-shaking

### 5. Verify Build Success
- Run TypeScript compiler to ensure the error is resolved
- Check that no new TypeScript errors are introduced
- Confirm the file compiles successfully

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# Check for TypeScript errors in the specific file
npx tsc --noEmit src/lib/mock-data.ts

# Run full TypeScript build to ensure no errors
npx tsc --noEmit

# Verify the build succeeds
npm run build

# Optional: Run development server to test runtime behavior
npm run dev
```

## Notes
- The error message mentions line 4, but the file analysis shows no imports in the first 20 lines. The import may be further down in the file or the error may be reported at a usage location rather than the import location.
- ExecutiveKPIs, OrderMetrics, and PerformanceMetrics types do not exist in the codebase, so any references to these types should be removed or the types should use inline definitions or `any` if strict typing isn't required.
- The mock-data.ts file currently exports mock data using `any[]` types, which is acceptable for mock data but could be improved with proper typing for better IDE support and type safety.
