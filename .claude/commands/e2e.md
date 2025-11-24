# E2E Test with Playwright MCP

Create and execute end-to-end tests using Playwright MCP for browser automation.

## Variables
adw_id: $1
test_scenario: $2
page_url: $3 (optional - defaults to http://localhost:3000)

## Instructions

You are tasked with creating and executing E2E tests using Playwright MCP tools. Follow these steps:

1. **Understand Test Scenario**: Parse the test scenario description provided
2. **Setup Browser**: Use Playwright MCP tools to navigate to the application
3. **Execute Test Steps**: Perform the test actions using MCP browser automation
4. **Verify Results**: Assert expected outcomes using snapshots and screenshots
5. **Generate Report**: Create a comprehensive test report with results
6. **Optional: Create Test File**: Optionally generate a Playwright test spec file

## Available Playwright MCP Tools

Use these MCP tools for browser automation:
- `mcp__playwright__browser_navigate`: Navigate to URLs
- `mcp__playwright__browser_snapshot`: Capture accessibility snapshots
- `mcp__playwright__browser_click`: Click elements
- `mcp__playwright__browser_type`: Type text into inputs
- `mcp__playwright__browser_fill_form`: Fill form fields
- `mcp__playwright__browser_take_screenshot`: Capture screenshots
- `mcp__playwright__browser_wait_for`: Wait for elements/conditions
- `mcp__playwright__browser_console_messages`: Check console logs
- `mcp__playwright__browser_network_requests`: Monitor network traffic

## Test Execution Workflow

### 1. Initialize Browser
- Navigate to the target page URL (default: http://localhost:3000)
- Wait for page to load
- Capture initial snapshot for reference

### 2. Execute Test Steps
Based on the test scenario, perform actions such as:
- Navigate to specific pages
- Click buttons and links
- Fill out forms
- Verify UI elements exist and are visible
- Check for specific text content
- Validate navigation flows
- Test responsive behavior

### 3. Assertions and Validations
- Use snapshots to verify page structure
- Take screenshots for visual verification
- Check console for errors
- Validate network requests
- Verify accessibility compliance

### 4. Generate Test Report
Create a comprehensive report including:
- Test scenario description
- Steps executed
- Screenshots taken
- Pass/fail status for each assertion
- Console errors (if any)
- Network requests analyzed
- Accessibility issues found

### 5. Optional: Create Playwright Test File
If the test should be persisted for future runs, generate a `.spec.ts` file in the `tests/` directory following Playwright best practices.

## Test Scenario

test_scenario

## Page URL

page_url

## Testing Guidelines

- **Accessibility First**: Always use accessibility-based selectors (roles, labels)
- **Wait Appropriately**: Use proper wait strategies to avoid flaky tests
- **Clear Assertions**: Make assertions explicit and meaningful
- **Error Handling**: Capture and report all errors and console warnings
- **Screenshots**: Take screenshots at key points for visual validation
- **Network Monitoring**: Check for failed requests or unexpected API calls

## Output Format

Provide a structured report:

```
E2E Test Report
===============

Scenario: [test scenario name]
URL: [page url]
Status: ✅ PASSED / ❌ FAILED
Duration: [execution time]

Test Steps:
1. [Step description] - [Status]
2. [Step description] - [Status]
...

Screenshots:
- [path/to/screenshot1.png] - [description]
- [path/to/screenshot2.png] - [description]

Console Messages:
- [No errors] / [List of errors]

Network Requests:
- [Summary of key requests]

Accessibility Issues:
- [None found] / [List of issues]

Generated Test File:
- [path/to/test.spec.ts] (if created)
```

## Example Test Scenarios

**Basic Navigation:**
"Test that the executive dashboard loads successfully and displays key metrics"

**Form Submission:**
"Test order creation flow: fill form, submit, verify confirmation"

**Responsive Design:**
"Test mobile navigation menu opens and closes correctly on small screens"

**Data Display:**
"Test that order list loads, displays data, and pagination works"

**Search Functionality:**
"Test order search with various filters and verify results"

## Expected Actions

1. **Navigate**: Use `browser_navigate` to go to the target URL
2. **Snapshot**: Use `browser_snapshot` to capture page structure
3. **Interact**: Use `browser_click`, `browser_type`, `browser_fill_form` for user actions
4. **Verify**: Use snapshots and screenshots to validate expected state
5. **Report**: Generate comprehensive test report with all findings
6. **Persist**: Optionally create a `.spec.ts` file in `tests/` directory

## Success Criteria

- Browser successfully navigates to target URL
- All test steps execute without errors
- Assertions pass for expected outcomes
- Screenshots captured at key points
- Comprehensive report generated
- Test file created (if requested)
- No console errors or accessibility violations (unless expected)
