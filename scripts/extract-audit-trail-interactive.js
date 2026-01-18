#!/usr/bin/env node

/**
 * MAO Audit Trail Extractor - Interactive Mode
 *
 * This script helps extract all 439 audit trail events from MAO system.
 * It requires manual authentication but automates the rest.
 *
 * Usage:
 *   node scripts/extract-audit-trail-interactive.js
 *
 * The script will:
 * 1. Open browser and navigate to MAO login page
 * 2. Wait for you to log in manually
 * 3. Navigate to order W1156251121946800
 * 4. Open Audit Trail tab
 * 5. Extract all 22 pages (439 events)
 * 6. Save formatted data to TypeScript file
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('  MAO Audit Trail Extractor - Order W1156251121946800');
  console.log('  Target: 439 events across 22 pages');
  console.log('='.repeat(70) + '\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Step 1: Navigate to MAO
  console.log('📂 Step 1: Navigating to MAO system...');
  await page.goto('https://crcpp.omni.manh.com/omnifacade/#/order', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'mao-01-login.png' });
  console.log('   ✅ Login page loaded\n');

  // Step 2: Wait for manual login
  console.log('🔐 Step 2: MANUAL ACTION REQUIRED');
  console.log('   Please log in to the MAO system in the browser window.');
  console.log('   - Click "Central Group Users" button if needed');
  console.log('   - Enter your credentials');
  console.log('   - Wait for successful login\n');

  console.log('   Waiting for login (checking every 2 seconds)...');

  let loggedIn = false;
  let attempts = 0;
  const maxAttempts = 120; // 2 minutes

  while (!loggedIn && attempts < maxAttempts) {
    await page.waitForTimeout(2000);
    attempts++;

    try {
      // Check for login success indicators
      const isLoggedIn = await page.evaluate(() => {
        const url = window.location.href;
        const hasLogout = document.body.innerText.includes('Logout') ||
                         document.body.innerText.includes('Sign out');
        const hasOrderContent = document.body.innerText.includes('Order') ||
                               document.querySelector('[class*="order"]');
        const noPasswordInput = !document.querySelector('input[type="password"]');

        return !url.includes('login') && (hasLogout || hasOrderContent) && noPasswordInput;
      });

      if (isLoggedIn) {
        loggedIn = true;
        console.log('   ✅ Login detected!\n');
      } else if (attempts % 10 === 0) {
        console.log(`   Still waiting... (${attempts * 2}s elapsed)`);
      }
    } catch (e) {
      // Continue waiting
    }
  }

  if (!loggedIn) {
    console.log('\n   ⚠️  Login timeout. Continuing anyway...\n');
  }

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'mao-02-logged-in.png' });

  // Step 3: Navigate to order
  console.log('📦 Step 3: Navigating to order W1156251121946800...');

  // Try direct URL first
  console.log('   Trying direct URL navigation...');
  await page.goto('https://crcpp.omni.manh.com/omnifacade/#/order/W1156251121946800', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'mao-03-order-page.png' });

  // Verify order page loaded
  const orderPageLoaded = await page.evaluate(() => {
    return document.body.innerText.includes('W1156251121946800') ||
           document.body.innerText.includes('Order Details');
  });

  if (!orderPageLoaded) {
    console.log('   ⚠️  Order page may not have loaded correctly.');
    console.log('   Please navigate to order W1156251121946800 manually.');
    console.log('   Press Enter in the terminal when ready...');
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
  } else {
    console.log('   ✅ Order page loaded\n');
  }

  // Step 4: Open Audit Trail tab
  console.log('📋 Step 4: Opening Audit Trail tab...');

  const auditTabClicked = await page.evaluate(() => {
    const selectors = [
      'button:has-text("Audit Trail")',
      'a:has-text("Audit Trail")',
      '[role="tab"]:has-text("Audit")',
      'li:has-text("Audit Trail")',
      '[data-testid*="audit" i]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        element.click();
        return true;
      }
    }
    return false;
  });

  if (!auditTabClicked) {
    console.log('   ⚠️  Could not find Audit Trail tab automatically.');
    console.log('   Please click on the "Audit Trail" tab manually.');
    console.log('   Press Enter in the terminal when ready...');
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
  } else {
    console.log('   ✅ Audit Trail tab opened\n');
  }

  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'mao-04-audit-trail.png', fullPage: true });

  // Step 5: Extract all pages
  console.log('📊 Step 5: Extracting audit trail data...\n');
  console.log('   This will take a few moments as we navigate through all pages.\n');

  const allEvents = [];
  let currentPage = 1;
  let maxPages = 25; // Safety limit
  let hasNextPage = true;

  while (hasNextPage && currentPage <= maxPages) {
    console.log(`   📄 Processing page ${currentPage}...`);

    // Screenshot for reference
    await page.screenshot({
      path: `mao-audit-page-${String(currentPage).padStart(2, '0')}.png`,
      fullPage: true
    });

    // Wait for content to load
    await page.waitForTimeout(500);

    // Extract events from current page
    const eventsOnPage = await page.evaluate(() => {
      const events = [];

      // Find the table
      const table = document.querySelector('table');
      if (!table) return events;

      // Get all rows
      const rows = table.querySelectorAll('tbody tr, tr');

      rows.forEach((row) => {
        // Skip header rows
        if (row.querySelector('th')) return;

        const cells = row.querySelectorAll('td');
        if (cells.length >= 5) {
          const event = {
            updatedBy: cells[0]?.innerText?.trim() || '',
            updatedOn: cells[1]?.innerText?.trim() || '',
            entityName: cells[2]?.innerText?.trim() || '',
            entityId: cells[3]?.innerText?.trim() || '',
            changedParameter: cells[4]?.innerText?.trim() || '',
            oldValue: cells[5]?.innerText?.trim() || null,
            newValue: cells[6]?.innerText?.trim() || null
          };

          // Only add if we have meaningful data
          if (event.changedParameter || event.updatedBy) {
            events.push(event);
          }
        }
      });

      return events;
    });

    if (eventsOnPage.length > 0) {
      console.log(`      ✓ Extracted ${eventsOnPage.length} events`);
      allEvents.push(...eventsOnPage);

      // Show sample of first event
      if (eventsOnPage.length > 0) {
        const first = eventsOnPage[0];
        console.log(`      Sample: ${first.updatedBy} - ${first.changedParameter}`);
      }
    } else {
      console.log(`      ⚠️  No events found on this page`);
    }

    // Try to go to next page
    const wentToNextPage = await page.evaluate(() => {
      const selectors = [
        'button[aria-label*="next" i]',
        'button:has-text(">")',
        'button:has-text("Next")',
        '.pagination-next:not(.disabled)',
        '[data-testid*="next" i]'
      ];

      for (const selector of selectors) {
        const btn = document.querySelector(selector);
        if (btn && !btn.disabled && !btn.classList.contains('disabled')) {
          btn.click();
          return true;
        }
      }
      return false;
    });

    if (wentToNextPage) {
      await page.waitForTimeout(1500);
      currentPage++;
    } else {
      hasNextPage = false;
    }
  }

  // Step 6: Format and save data
  console.log('\n' + '='.repeat(70));
  console.log('  EXTRACTION COMPLETE');
  console.log('='.repeat(70));
  console.log(`\n   Pages processed: ${currentPage}`);
  console.log(`   Total events extracted: ${allEvents.length}`);
  console.log(`   Expected events: 439`);

  if (allEvents.length !== 439) {
    console.log(`   ⚠️  WARNING: Event count mismatch!`);
    console.log(`   Expected 439 but got ${allEvents.length}`);
  }

  // Format events
  const formattedEvents = allEvents.map((event, index) => ({
    id: `AUDIT-W115625-${String(index + 1).padStart(3, '0')}`,
    orderId: 'W1156251121946800',
    updatedBy: event.updatedBy,
    updatedOn: event.updatedOn,
    entityName: event.entityName,
    entityId: event.entityId,
    changedParameter: event.changedParameter,
    oldValue: event.oldValue,
    newValue: event.newValue
  }));

  // Save to multiple formats
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // JSON format
  const jsonPath = path.join(__dirname, `audit-trail-439-events-${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(formattedEvents, null, 2));
  console.log(`\n   ✅ JSON saved: ${jsonPath}`);

  // TypeScript format
  const tsPath = path.join(__dirname, `audit-trail-439-events-${timestamp}.ts`);
  const tsContent = `// Auto-generated audit trail data for order W1156251121946800
// Total events: ${formattedEvents.length}
// Generated: ${new Date().toISOString()}
// Source: MAO system manual extraction

export const auditTrail439Events = ${JSON.stringify(formattedEvents, null, 2)} as const;

export type AuditTrailEvent = typeof auditTrail439Events[number];
`;
  fs.writeFileSync(tsPath, tsContent);
  console.log(`   ✅ TypeScript saved: ${tsPath}`);

  // Summary
  const summaryPath = path.join(__dirname, `audit-trail-summary-${timestamp}.txt`);
  const summary = `
MAO Audit Trail Extraction Summary
===================================
Date: ${new Date().toISOString()}
Order ID: W1156251121946800

Expected Events: 439
Extracted Events: ${formattedEvents.length}
Pages Processed: ${currentPage}

Status: ${formattedEvents.length === 439 ? '✅ COMPLETE' : '⚠️ INCOMPLETE'}

Files Generated:
- JSON: ${jsonPath}
- TypeScript: ${tsPath}
- Screenshots: mao-*.png

Next Steps:
1. Verify the extracted data
2. Copy TypeScript content to /src/lib/mock-data.ts
3. Test audit trail display
`;
  fs.writeFileSync(summaryPath, summary);
  console.log(`   ✅ Summary saved: ${summaryPath}\n`);

  console.log('='.repeat(70));
  console.log('\n   Browser will remain open for manual verification.');
  console.log('   Press Ctrl+C to close browser and exit.\n');

  // Wait indefinitely
  await new Promise(() => {});

  await browser.close();
}

// Error handling
main().catch(error => {
  console.error('\n❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
