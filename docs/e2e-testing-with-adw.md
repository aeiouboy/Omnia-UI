# E2E Testing with ADW and Playwright MCP

This guide demonstrates how to use the ADW E2E testing workflow to automate browser testing using Playwright MCP.

## Overview

The `adw_e2e_test.py` workflow combines:
- **Claude Code** for intelligent test generation and execution
- **Playwright MCP** for browser automation
- **ADW orchestration** for structured test execution and reporting

## Quick Start

### 1. Basic E2E Test

Test that the executive dashboard loads correctly:

```bash
./adws/adw_e2e_test.py "Test that the executive dashboard loads and displays key metrics"
```

This will:
1. Navigate to `http://localhost:3000` (default)
2. Use Playwright MCP to interact with the page
3. Verify the dashboard components are visible
4. Generate a comprehensive test report

### 2. Test Specific Page

Test the order management hub with custom URL:

```bash
./adws/adw_e2e_test.py "Test order search and filtering functionality" \
  --url http://localhost:3000/orders
```

### 3. Create Persistent Test File

Generate a reusable Playwright test spec file:

```bash
./adws/adw_e2e_test.py "Test order creation flow from start to finish" \
  --create-spec
```

This creates a `.spec.ts` file in the `tests/` directory that can be run with standard Playwright commands.

### 4. Advanced Testing with Opus

Use the Opus model for complex, comprehensive testing:

```bash
./adws/adw_e2e_test.py "Comprehensive regression test for executive dashboard" \
  --model opus \
  --create-spec
```

## Example Test Scenarios

### Navigation Testing

```bash
./adws/adw_e2e_test.py "Navigate from executive dashboard to order details and back"
```

**What it tests:**
- Page navigation flow
- URL routing
- Back button functionality
- Breadcrumb navigation

### Form Interaction

```bash
./adws/adw_e2e_test.py "Fill out and submit escalation form with validation" \
  --url http://localhost:3000/escalations
```

**What it tests:**
- Form field input
- Validation messages
- Submit button state
- Success confirmation

### Responsive Design

```bash
./adws/adw_e2e_test.py "Test mobile menu navigation on small screens"
```

**What it tests:**
- Mobile viewport behavior
- Hamburger menu interaction
- Responsive layout
- Touch targets

### Search and Filter

```bash
./adws/adw_e2e_test.py "Test order search with multiple filter combinations" \
  --url http://localhost:3000/orders
```

**What it tests:**
- Search input functionality
- Filter application
- Result updates
- Clear filters

### Data Display

```bash
./adws/adw_e2e_test.py "Verify order list displays correctly with pagination"
```

**What it tests:**
- Data rendering
- Pagination controls
- Page size changes
- Loading states

### Accessibility

```bash
./adws/adw_e2e_test.py "Test keyboard navigation and screen reader support" \
  --model opus
```

**What it tests:**
- Keyboard navigation
- ARIA attributes
- Focus management
- Accessible labels

## Understanding Test Output

After execution, the ADW generates structured output in `./agents/{adw_id}/e2e_tester/`:

### Output Files

```
agents/abc12345/e2e_tester/
├── cc_raw_output.jsonl          # Raw streaming output
├── cc_raw_output.json           # Parsed JSON array
├── cc_final_object.json         # Final test result
└── custom_summary_output.json   # Test execution summary
```

### Test Report Format

The `custom_summary_output.json` contains:

```json
{
  "adw_id": "abc12345",
  "workflow": "adw_e2e_test",
  "timestamp": "20250124_143022",
  "test_scenario": "Test executive dashboard loads correctly",
  "target_url": "http://localhost:3000",
  "model": "sonnet",
  "success": true,
  "output": "E2E Test Report\n===============\n\nScenario: Test executive dashboard loads correctly\nStatus: ✅ PASSED\n\nTest Steps:\n1. Navigate to http://localhost:3000 - ✅\n2. Wait for page load - ✅\n3. Verify dashboard heading visible - ✅\n4. Check KPI cards present - ✅\n\nScreenshots:\n- screenshot-1.png - Initial page load\n- screenshot-2.png - Dashboard with data\n\nConsole Messages:\n- No errors found\n\nAccessibility Issues:\n- None found"
}
```

## Advanced Usage

### Custom Working Directory

Run tests from a different project directory:

```bash
./adws/adw_e2e_test.py "Test homepage loads" \
  --working-dir /path/to/other/project
```

### Custom Output Directory

Save test artifacts to a specific location:

```bash
./adws/adw_e2e_test.py "Test checkout flow" \
  --output-dir ./test-results/checkout-$(date +%Y%m%d)
```

### Chaining Multiple Tests

Create a test suite by running multiple tests:

```bash
#!/bin/bash
# test-suite.sh

echo "Running E2E test suite..."

./adws/adw_e2e_test.py "Test homepage loads" || exit 1
./adws/adw_e2e_test.py "Test dashboard loads" || exit 1
./adws/adw_e2e_test.py "Test orders page loads" || exit 1

echo "All tests passed!"
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Start dev server
        run: pnpm dev &

      - name: Wait for server
        run: npx wait-on http://localhost:3000

      - name: Run E2E tests
        run: |
          ./adws/adw_e2e_test.py "Test executive dashboard" --create-spec
          ./adws/adw_e2e_test.py "Test order management hub" --create-spec
```

## Playwright MCP Tools Reference

The E2E workflow has access to these Playwright MCP tools:

### Navigation
- `browser_navigate(url)` - Navigate to URL
- `browser_navigate_back()` - Go back to previous page

### Interaction
- `browser_click(element, ref)` - Click element
- `browser_type(element, ref, text)` - Type text
- `browser_fill_form(fields)` - Fill multiple form fields
- `browser_select_option(element, ref, values)` - Select dropdown option

### Inspection
- `browser_snapshot()` - Capture accessibility snapshot
- `browser_take_screenshot(filename)` - Capture screenshot
- `browser_console_messages()` - Get console logs
- `browser_network_requests()` - Get network activity

### Waiting
- `browser_wait_for(text)` - Wait for text to appear
- `browser_wait_for(time)` - Wait for specific time

### Page Management
- `browser_tabs(action)` - Manage browser tabs
- `browser_resize(width, height)` - Resize viewport

## Best Practices

### 1. Use Descriptive Test Scenarios

❌ **Bad:**
```bash
./adws/adw_e2e_test.py "Test page"
```

✅ **Good:**
```bash
./adws/adw_e2e_test.py "Test executive dashboard displays SLA breach alerts correctly"
```

### 2. Test User Journeys, Not Pages

❌ **Bad:**
```bash
./adws/adw_e2e_test.py "Test button exists"
```

✅ **Good:**
```bash
./adws/adw_e2e_test.py "Test user can create order, view confirmation, and navigate to order details"
```

### 3. Use Accessibility Selectors

The Playwright MCP uses accessibility-based selectors by default. Reference elements by:
- Role (button, heading, textbox)
- Label (visible text)
- Accessible name

### 4. Validate Expected Outcomes

Be specific about what should happen:

```bash
./adws/adw_e2e_test.py "Test clicking 'Create Order' button navigates to order form page with title 'New Order'"
```

### 5. Test Error States

```bash
./adws/adw_e2e_test.py "Test form validation displays error messages when required fields are empty"
```

### 6. Create Spec Files for Regression Tests

Use `--create-spec` for tests you want to run repeatedly:

```bash
./adws/adw_e2e_test.py "Critical user journey: complete order workflow" --create-spec
```

Then run with Playwright:
```bash
npx playwright test tests/critical-user-journey.spec.ts
```

## Troubleshooting

### Server Not Running

Ensure the development server is running before testing:

```bash
pnpm dev  # Start server
# In another terminal:
./adws/adw_e2e_test.py "Test homepage"
```

### Wrong URL

Specify the correct URL with `--url`:

```bash
./adws/adw_e2e_test.py "Test page" --url http://localhost:3003
```

### Test Flakiness

Use Opus model for more robust test execution:

```bash
./adws/adw_e2e_test.py "Test complex interaction" --model opus
```

### Element Not Found

Provide more context in the test scenario:

```bash
./adws/adw_e2e_test.py "Test clicking the 'Submit' button in the order creation form (labeled 'Create New Order')"
```

## Real-World Examples

### Complete Order Workflow Test

```bash
./adws/adw_e2e_test.py \
  "Test complete order workflow: navigate to orders page, click create new order, \
   fill form with customer name 'John Doe' and items 'Apple x5', submit, \
   verify success message, and confirm order appears in order list" \
  --model opus \
  --create-spec
```

### Accessibility Audit

```bash
./adws/adw_e2e_test.py \
  "Perform comprehensive accessibility audit of executive dashboard: \
   check ARIA labels, keyboard navigation, color contrast, and screen reader support" \
  --model opus
```

### Mobile Responsive Test

```bash
./adws/adw_e2e_test.py \
  "Test mobile responsive behavior: resize to 375px width, verify mobile menu appears, \
   click hamburger icon, verify navigation items visible, test navigation" \
  --create-spec
```

### Performance Test

```bash
./adws/adw_e2e_test.py \
  "Test page load performance: navigate to dashboard, monitor network requests, \
   check for failed requests, verify initial render under 3 seconds, \
   check console for errors or warnings"
```

## Next Steps

1. **Run your first test:**
   ```bash
   ./adws/adw_e2e_test.py "Test your application's main page loads successfully"
   ```

2. **Review the output** in `./agents/{adw_id}/e2e_tester/custom_summary_output.json`

3. **Create persistent test files** with `--create-spec`

4. **Integrate with CI/CD** pipeline

5. **Build a comprehensive test suite** covering critical user journeys

## Additional Resources

- [Playwright MCP Documentation](https://github.com/anthropics/mcp-server-playwright)
- [ADW System Overview](../adws/README.md)
- [Playwright Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Existing Playwright Tests](../tests/)
