# ✅ Chore: Add Department Retail Inventory Mockup for DS View Types (COMPLETED)

## Metadata
adw_id: `DS-retail`
prompt: `mockup data for view type : ECOM-TH-DSS-NW-STD and ECOM-TH-DSS-LOCD-EXP that it should mockup inventory about department retail`

## Chore Description
Add new mock inventory data specifically for the DS (Department Store) business unit view types:
- **ECOM-TH-DSS-NW-STD** (STD channel - Standard Delivery & Pickup)
- **ECOM-TH-DSS-LOCD-EXP** (EXP channel - 3H Delivery & 1H Pickup)

The mock data should include department retail products typical of a department store:
- Electronics (TVs, Phones, Tablets, Laptops)
- Home Appliances (Air Conditioners, Refrigerators, Washing Machines)
- Fashion & Accessories
- Home & Living (Furniture, Bedding)
- Beauty & Cosmetics
- Sports & Fitness

## Relevant Files
Use these files to complete the chore:

- `/Users/naruechon/Omnia-UI/src/lib/mock-inventory-data.ts` - Main mock data file where inventory items are defined. Add new department retail items here.
- `/Users/naruechon/Omnia-UI/src/types/inventory.ts` - Inventory type definitions. May need to add new ProductCategory types for retail.
- `/Users/naruechon/Omnia-UI/src/types/view-type-config.ts` - View type configuration. Already has DS view types defined.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add New Product Categories for Department Retail
- Add new ProductCategory types in `src/types/inventory.ts`: "Electronics", "Appliances", "Fashion", "HomeLiving", "Beauty", "Sports"
- Update any category-related mappings in mock-inventory-data.ts

### 2. Update Brand Mappings for Retail Categories
- In `src/lib/mock-inventory-data.ts`, update the `getBrandForProduct` function to include retail brands:
  - Electronics: Samsung, LG, Sony, Apple, Panasonic
  - Appliances: Haier, Hitachi, Mitsubishi, Daikin, Toshiba
  - Fashion: Uniqlo, H&M, Zara, Nike, Adidas
  - HomeLiving: IKEA, Index Living Mall, SB Furniture
  - Beauty: L'Oreal, Maybelline, MAC, Shiseido, Clinique
  - Sports: Nike, Adidas, Under Armour, Puma

### 3. Add Mock Inventory Items for DS Business Unit
- Add 20+ new inventory items in `mockInventoryItemsBase` array with:
  - `businessUnit: "DS"` explicitly set
  - `view: "ECOM-TH-DSS-NW-STD"` or `view: "ECOM-TH-DSS-LOCD-EXP"`
  - Categories from the new retail categories
  - Realistic product names, prices, and stock levels for retail items
  - Store names using existing Tops stores
  
### 4. Update getViewForProduct Function
- Modify `getViewForProduct` to assign DS view types to retail categories:
  - Electronics, Appliances → "ECOM-TH-DSS-LOCD-EXP" (express delivery for high-value items)
  - Fashion, Beauty, Sports → "ECOM-TH-DSS-NW-STD" (standard delivery)
  - HomeLiving → "ECOM-TH-DSS-NW-STD" (standard for furniture)

### 5. Validate Data Filtering
- Verify that selecting "ECOM-TH-DSS-NW-STD" in the inventory page shows only STD channel items
- Verify that selecting "ECOM-TH-DSS-LOCD-EXP" shows only EXP channel items
- Ensure proper businessUnit filtering works

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd /Users/naruechon/Omnia-UI && npm run build` - Ensure the code compiles without errors
- Navigate to `http://localhost:3000/inventory` and select "ECOM-TH-DSS-NW-STD" view type - verify retail products appear
- Navigate to `http://localhost:3000/inventory` and select "ECOM-TH-DSS-LOCD-EXP" view type - verify retail products appear

## Notes
- Department store retail products typically have higher unit prices compared to grocery items
- Express delivery (EXP) is appropriate for high-value electronics/appliances that need quick delivery
- Standard delivery (STD) is appropriate for fashion, beauty, and home living items
- Ensure a good mix of stock statuses: healthy, low, and critical
