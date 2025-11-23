import { test, expect } from '@playwright/test';

test.describe('Style Guide Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3003/style-guide');
  });

  test('should load style guide page successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Style Guide/);

    // Check main heading exists
    const heading = page.getByRole('heading', { name: /Style Guide/i });
    await expect(heading).toBeVisible();
  });

  test('should have all navigation tabs', async ({ page }) => {
    // Check for tab buttons
    const tabs = ['Components', 'Colors', 'Typography', 'Spacing', 'Breakpoints'];

    for (const tabName of tabs) {
      const tab = page.getByRole('tab', { name: tabName });
      await expect(tab).toBeVisible();
    }
  });

  test('should switch between tabs', async ({ page }) => {
    // Click on Colors tab
    await page.getByRole('tab', { name: 'Colors' }).click();

    // Wait for content to load
    await page.waitForTimeout(500);

    // Check if color swatches are visible
    const colorSection = page.locator('text=/Enterprise Colors|Color Palette/i');
    await expect(colorSection.first()).toBeVisible();
  });

  test('should display component examples in Components tab', async ({ page }) => {
    // Ensure we're on Components tab (default)
    await page.getByRole('tab', { name: 'Components' }).click();

    // Check for button examples
    const buttonSection = page.locator('text=/Button/i');
    await expect(buttonSection.first()).toBeVisible();

    // Check for badge examples
    const badgeSection = page.locator('text=/Badge/i');
    await expect(badgeSection.first()).toBeVisible();
  });

  test('should display typography examples', async ({ page }) => {
    // Click Typography tab
    await page.getByRole('tab', { name: 'Typography' }).click();

    // Check for font family section
    const fontSection = page.locator('text=/Font Families|Inter|Poppins/i');
    await expect(fontSection.first()).toBeVisible();
  });

  test('should display spacing examples', async ({ page }) => {
    // Click Spacing tab
    await page.getByRole('tab', { name: 'Spacing' }).click();

    // Check for spacing scale
    const spacingSection = page.locator('text=/Spacing Scale|Margin|Padding/i');
    await expect(spacingSection.first()).toBeVisible();
  });

  test('should display breakpoint information', async ({ page }) => {
    // Click Breakpoints tab
    await page.getByRole('tab', { name: 'Breakpoints' }).click();

    // Check for breakpoint documentation
    const breakpointSection = page.locator('text=/Breakpoints|Responsive/i');
    await expect(breakpointSection.first()).toBeVisible();
  });

  test('should have copy-to-clipboard functionality', async ({ page }) => {
    // Click on Colors tab where we know there are copy buttons
    await page.getByRole('tab', { name: 'Colors' }).click();

    // Wait for content to load
    await page.waitForTimeout(500);

    // Check if copy buttons exist
    const copyButtons = page.getByRole('button', { name: /copy/i });
    const count = await copyButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should be mobile responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if page still loads
    const heading = page.getByRole('heading', { name: /Style Guide/i });
    await expect(heading).toBeVisible();

    // Tabs should still be visible
    const componentsTab = page.getByRole('tab', { name: 'Components' });
    await expect(componentsTab).toBeVisible();
  });

  test('should navigate from sidebar menu', async ({ page }) => {
    // Go to home page first
    await page.goto('http://localhost:3003/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Look for Style Guide link in navigation
    const styleGuideLink = page.locator('a[href="/style-guide"]');

    // Click the link if it exists
    if (await styleGuideLink.count() > 0) {
      await styleGuideLink.first().click();

      // Verify we're on the style guide page
      await expect(page).toHaveURL(/\/style-guide/);
    }
  });

  test('should have accessible navigation elements', async ({ page }) => {
    // Check for accessible tab role
    const tablist = page.getByRole('tablist');
    await expect(tablist).toBeVisible();

    // Check tabs have proper ARIA attributes
    const componentsTab = page.getByRole('tab', { name: 'Components' });
    await expect(componentsTab).toHaveAttribute('aria-selected');
  });
});
