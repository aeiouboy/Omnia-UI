-- ลบข้อมูลเดิมก่อน (ถ้ามี)
TRUNCATE TABLE inventory_movements CASCADE;
TRUNCATE TABLE inventory_levels CASCADE;
TRUNCATE TABLE products CASCADE;

-- เพิ่มข้อมูลสินค้าตามที่ได้รับ
INSERT INTO products (
  format, store_id, merchant_id, category, category_id, subcategory, subcategory_id,
  barcode, name, description, photo, special_type, sold_by_weight, max_count,
  weight_count, weight_value, weight_unit, available_status, price, non_stock_sync_item
) VALUES
  ('Tops Fine Food', '', '', 'Fresh Produce ผักและผลไม้', 'THITEDP20200707052000016649', 'ผลไม้ Fruits', 'THITEDP20200707102846014313',
   '0218852000004', 'องุ่นเขียวไม่มีเมล็ดออสเตรเลีย500กรัม 500กรัม', 'AUS Green Seedless Grape 500 g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด',
   ARRAY['https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0218852000004_01.jpg'], '', true, 3, 1, 500, 'g', 'AVAILABLE', 499, false),
  
  ('Tops Fine Food', '', '', 'Fresh Produce ผักและผลไม้', 'THITEDP20200707052000016649', 'ผลไม้ Fruits', 'THITEDP20200707102846014313',
   '0218244000001', 'มายช้อยส์ฝรั่งกิมจู 1000กรัม', 'My Chioce Gimju Guava 1000g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด',
   ARRAY['https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0218244000001_01.jpg'], '', true, 3, 1, 1000, 'g', 'AVAILABLE', 89, false),
  
  ('Tops Fine Food', '', '', 'Fresh Produce ผักและผลไม้', 'THITEDP20200707052000016649', 'ผัก Vegetables', 'THITEDP20200707102841015625',
   '0218317000006', 'มายช้อยส์แตงกวาญี่ปุ่นเกรดพิเศษ 1000กรัม', 'My Choice Japanese Cucumber Special 1000g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด',
   ARRAY['https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0218317000006_01.jpg'], '', true, 3, 1, 1000, 'g', 'AVAILABLE', 139, false),
  
  ('Tops Fine Food', '', '', 'Fresh Produce ผักและผลไม้', 'THITEDP20200707052000016649', 'ผลไม้ Fruits', 'THITEDP20200707102846014313',
   '0219873000004', 'มายช้อยส์ฝรั่งแป้นสีทอง 1000กรัม', 'My Choice Pansithong Guava 1000g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด',
   ARRAY['https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0219873000004_01.jpg'], '', true, 3, 1, 1000, 'g', 'AVAILABLE', 95, false),
  
  ('Tops Fine Food', '', '', 'Fresh Produce ผักและผลไม้', 'THITEDP20200707052000016649', 'ผลไม้ Fruits', 'THITEDP20200707102846014313',
   '0218716000003', 'สาลี่หอม 1000กรัม', 'Fragrant Pear 1000g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด',
   ARRAY['https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0218716000003_01.jpg'], '', true, 3, 1, 1000, 'g', 'AVAILABLE', 199, false),
  
  ('Tops Fine Food', '', '', 'Fresh Produce ผักและผลไม้', 'THITEDP20200707052000016649', 'ผลไม้ Fruits', 'THITEDP20200707102846014313',
   '0218752000005', 'สาลี่จีนน้ำผึ้ง 1000กรัม', 'Honey Pear 1000g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด',
   ARRAY['https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0218752000005_01.jpg'], '', true, 3, 1, 1000, 'g', 'AVAILABLE', 98, false),
  
  ('Tops Fine Food', '', '', 'Fresh Produce ผักและผลไม้', 'THITEDP20200707052000016649', 'ผลไม้ Fruits', 'THITEDP20200707102846014313',
   '0218527000001', 'มายช้อยส์ฝรั่งสาลี่ 1000กรัม', 'My Choice Salee Guava 1000g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด',
   ARRAY['https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0218527000001_01.jpg'], '', true, 3, 1, 1000, 'g', 'AVAILABLE', 89, false),
  
  ('Tops Fine Food', '', '', 'Fresh Produce ผักและผลไม้', 'THITEDP20200707052000016649', 'ผัก Vegetables', 'THITEDP20200707102841015625',
   '0219446000004', 'มายช้อยส์มันฝรั่งขาว 1000กรัม', 'My Choice White Potato 1000g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด',
   ARRAY['https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0219446000004_01.jpg'], '', true, 3, 1, 1000, 'g', 'AVAILABLE', 199, false),
  
  ('Tops Fine Food', '', '', 'Fresh Produce ผักและผลไม้', 'THITEDP20200707052000016649', 'ผัก Vegetables', 'THITEDP20200707102841015625',
   '0219724000009', 'มายช้อยส์มันฝรั่งสีชมพู 1000กรัม', 'My Choice Pink Potato 1000g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด',
   ARRAY['https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0219724000009_01.jpg'], '', true, 3, 1, 1000, 'g', 'AVAILABLE', 229, false);

-- เพิ่มข้อมูล inventory levels สำหรับสินค้าที่เพิ่งเพิ่ม
INSERT INTO inventory_levels (product_id, location_id, quantity, reorder_point)
SELECT id, 'MAIN', 
  CASE 
    WHEN RANDOM() < 0.1 THEN 0  -- 10% out of stock
    WHEN RANDOM() < 0.3 THEN FLOOR(RANDOM() * 10) + 1  -- 20% low stock
    ELSE FLOOR(RANDOM() * 100) + 20  -- 70% in stock
  END,
  10
FROM products;

-- เพิ่มข้อมูล inventory movements ตัวอย่าง
INSERT INTO inventory_movements (product_id, movement_type, quantity, reference, notes)
SELECT 
  id,
  CASE 
    WHEN RANDOM() < 0.5 THEN 'Inbound'
    WHEN RANDOM() < 0.8 THEN 'Outbound'
    ELSE 'Adjustment'
  END,
  FLOOR(RANDOM() * 50) + 1,
  'REF-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 5, '0'),
  'Initial stock movement'
FROM products;
