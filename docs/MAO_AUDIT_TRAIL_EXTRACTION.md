# MAO Audit Trail Extraction Guide

## Objective
Extract all 439 audit trail events for order W1156251121946800 from the MAO system at https://crcpp.omni.manh.com/omnifacade/#/order

## Current Status
- Current mock data in `/src/lib/mock-data.ts` has only 67 events (AUDIT-W115625-001 to AUDIT-W115625-067)
- Need to extract complete 439 events from MAO system

## Challenge
The MAO system requires manual authentication (username/password), so full automation is not possible without credentials.

## Solution Options

### Option 1: Semi-Automated Browser Script (RECOMMENDED)
Run a script that:
1. Opens browser and navigates to MAO login page
2. Waits for you to manually log in
3. Automatically navigates to order W1156251121946800
4. Opens Audit Trail tab
5. Extracts all 22 pages of audit trail (439 events total)
6. Saves formatted data to TypeScript file

**Steps:**
```bash
cd /Users/naruechon/Omnia-UI
node scripts/extract-audit-trail-interactive.js
```

**When prompted:**
1. Log into MAO system manually in the opened browser
2. Click "Central Group Users" button if applicable
3. Enter credentials
4. Script will automatically continue after detecting successful login

### Option 2: Manual Export (If Available)
Check if MAO has export functionality:
1. Navigate to order W1156251121946800
2. Open Audit Trail tab
3. Look for "Export" or "Download" button
4. Export to CSV/Excel
5. Run conversion script to format as TypeScript

### Option 3: Developer Tools Console Extraction
Open browser DevTools and run extraction script in console:

```javascript
// Paste this in browser console when on Audit Trail page
const extractAuditTrail = async () => {
  const allEvents = [];
  let page = 1;

  while (true) {
    // Get current page events
    const rows = document.querySelectorAll('table tbody tr');
    const eventsOnPage = Array.from(rows).map(row => {
      const cells = row.querySelectorAll('td');
      return {
        updatedBy: cells[0]?.innerText?.trim(),
        updatedOn: cells[1]?.innerText?.trim(),
        entityName: cells[2]?.innerText?.trim(),
        entityId: cells[3]?.innerText?.trim(),
        changedParameter: cells[4]?.innerText?.trim(),
        oldValue: cells[5]?.innerText?.trim(),
        newValue: cells[6]?.innerText?.trim()
      };
    });

    allEvents.push(...eventsOnPage);
    console.log(`Page ${page}: ${eventsOnPage.length} events`);

    // Check if next button exists
    const nextBtn = document.querySelector('button[aria-label*="next" i], button:has-text(">"), .pagination-next:not(.disabled)');
    if (!nextBtn || nextBtn.disabled) break;

    nextBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    page++;
  }

  // Format and download
  const formatted = allEvents.map((e, i) => ({
    id: `AUDIT-W115625-${String(i+1).padStart(3, '0')}`,
    orderId: 'W1156251121946800',
    ...e
  }));

  const blob = new Blob([JSON.stringify(formatted, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'audit-trail-439-events.json';
  a.click();

  console.log(`Extracted ${allEvents.length} events`);
  return formatted;
};

extractAuditTrail();
```

## Expected Data Format

Each event should have:
```typescript
{
  id: 'AUDIT-W115625-XXX',        // Sequential: 001 to 439
  orderId: 'W1156251121946800',
  updatedBy: 'username',          // From "UPDATED BY" column
  updatedOn: 'DD/MM/YYYY HH:mm',  // From "UPDATED ON" column
  entityName: 'EntityName',       // From "ENTITY NAME" column
  entityId: 'entity_id',          // From "ENTITY ID" column
  changedParameter: 'description',// From "CHANGED PARAMETER" column
  oldValue: 'old value',          // From "OLD VALUE" column
  newValue: 'new value'           // From "NEW VALUE" column
}
```

## Audit Trail Structure
- Total events: 439
- Pages: 22 (20 events per page)
- Page 1: Events 1-20
- Page 2: Events 21-40
- ...
- Page 22: Events 421-439

## Verification
After extraction, verify:
1. Total count is exactly 439 events
2. All events have sequential IDs (001-439)
3. All required fields are populated
4. Date/time format is consistent
5. No duplicate events

## Next Steps
1. Extract complete 439 events using one of the methods above
2. Save formatted data to `/src/lib/audit-trail-429-events.ts`
3. Update `/src/lib/mock-data.ts` to use complete dataset
4. Test audit trail display in order details
