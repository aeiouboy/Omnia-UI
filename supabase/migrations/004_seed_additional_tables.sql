-- เพิ่มข้อมูลตัวอย่างในตาราง products
INSERT INTO products (sku, name, description, price, stock_quantity, business_unit, category)
VALUES
  ('PRD-5678', 'Organic Bananas', 'Fresh organic bananas from local farms', 50.00, 500, 'TOPS', 'Fruits'),
  ('PRD-3456', 'Premium Jasmine Rice 5kg', 'High-quality jasmine rice', 150.00, 200, 'TOPS', 'Grocery'),
  ('PRD-7890', 'Thai Milk Tea', 'Traditional Thai milk tea', 30.00, 300, 'TOPS', 'Beverages'),
  ('PRD-1234', 'Men''s Cotton T-Shirt', 'Comfortable cotton t-shirt for men', 350.00, 100, 'CENTRAL', 'Apparel'),
  ('PRD-2345', 'Women''s Casual Dress', 'Stylish casual dress for women', 890.00, 80, 'CENTRAL', 'Apparel'),
  ('PRD-4567', 'Running Shoes', 'Professional running shoes', 1950.00, 50, 'SUPERSPORTS', 'Footwear'),
  ('PRD-6789', 'Yoga Mat', 'Premium quality yoga mat', 450.00, 120, 'SUPERSPORTS', 'Fitness'),
  ('PRD-8901', 'Smartphone', 'Latest model smartphone', 15000.00, 30, 'CENTRAL', 'Electronics'),
  ('PRD-9012', 'Bluetooth Speaker', 'Portable bluetooth speaker', 1200.00, 75, 'CENTRAL', 'Electronics'),
  ('PRD-0123', 'Fresh Milk 1L', 'Fresh pasteurized milk', 55.00, 150, 'TOPS', 'Dairy')
ON CONFLICT (sku) DO NOTHING;

-- เพิ่มข้อมูลตัวอย่างในตาราง order_items
-- ก่อนอื่นเราต้องมี order_id และ product_id ที่มีอยู่จริง
DO $$
DECLARE
  order_record RECORD;
  product_record RECORD;
  quantity INTEGER;
  unit_price DECIMAL(10, 2);
  total_price DECIMAL(10, 2);
BEGIN
  -- วนลูปผ่านทุก order
  FOR order_record IN SELECT id FROM orders LIMIT 50
  LOOP
    -- สุ่มจำนวนรายการสินค้าในแต่ละออเดอร์ (1-3 รายการ)
    FOR i IN 1..floor(random() * 3 + 1)::int
    LOOP
      -- สุ่มเลือกสินค้า
      SELECT id, price INTO product_record FROM products ORDER BY random() LIMIT 1;
      
      -- สุ่มจำนวนสินค้า (1-5 ชิ้น)
      quantity := floor(random() * 5 + 1)::int;
      unit_price := product_record.price;
      total_price := unit_price * quantity;
      
      -- เพิ่มข้อมูลใน order_items
      INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
      VALUES (order_record.id, product_record.id, quantity, unit_price, total_price);
    END LOOP;
  END LOOP;
END $$;

-- เพิ่มข้อมูลตัวอย่างในตาราง daily_stats
INSERT INTO daily_stats (date, orders_count, revenue, sla_compliance)
VALUES
  (CURRENT_DATE - INTERVAL '6 days', 120, 45000, 95),
  (CURRENT_DATE - INTERVAL '5 days', 145, 52000, 94),
  (CURRENT_DATE - INTERVAL '4 days', 132, 48500, 96),
  (CURRENT_DATE - INTERVAL '3 days', 148, 53200, 93),
  (CURRENT_DATE - INTERVAL '2 days', 160, 58000, 92),
  (CURRENT_DATE - INTERVAL '1 day', 175, 62500, 91),
  (CURRENT_DATE, 190, 68000, 90)
ON CONFLICT (date) DO NOTHING;

-- เพิ่มข้อมูลตัวอย่างในตาราง weekly_stats
INSERT INTO weekly_stats (week_start, week_end, orders_count, revenue)
VALUES
  (CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, 1070, 387200),
  (CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE - INTERVAL '7 days', 980, 352000),
  (CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '14 days', 920, 331000),
  (CURRENT_DATE - INTERVAL '27 days', CURRENT_DATE - INTERVAL '21 days', 890, 320000)
ON CONFLICT (week_start) DO NOTHING;
