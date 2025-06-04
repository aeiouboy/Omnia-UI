-- ตรวจสอบว่าตาราง products มีอยู่หรือไม่
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
    -- สร้างตาราง products
    CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      barcode VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(255),
      category_id VARCHAR(255),
      subcategory VARCHAR(255),
      subcategory_id VARCHAR(255),
      price DECIMAL(10, 2) NOT NULL,
      photo TEXT[] DEFAULT '{}',
      weight_value DECIMAL(10, 2),
      weight_unit VARCHAR(10),
      available_status VARCHAR(50) DEFAULT 'AVAILABLE',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- เพิ่มข้อมูลตัวอย่างในตาราง products
    INSERT INTO products (barcode, name, description, category, category_id, subcategory, subcategory_id, price, photo, weight_value, weight_unit)
    VALUES
      ('TOPS-DAIRY-001', 'นมสดออร์แกนิค โลตัส', 'Organic Fresh Milk 1L', 'Dairy', 'DAIRY', 'Milk', 'MILK', 120.00, ARRAY['https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0218852000004_01.jpg'], 1.0, 'L'),
      ('0218244000001', 'มายช้อยส์ฝรั่งกิมจู 1000กรัม', 'My Chioce Gimju Guava 1000g', 'Fresh Produce ผักและผลไม้', 'THITEDP20200707052000016649', 'ผลไม้ Fruits', 'THITEDP20200707102846014313', 89.00, ARRAY['https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0218244000001_01.jpg'], 1000, 'g'),
      ('0218317000006', 'มายช้อยส์แตงกวาญี่ปุ่นเกรดพิเศษ 1000กรัม', 'My Choice Japanese Cucumber Special 1000g', 'Fresh Produce ผักและผลไม้', 'THITEDP20200707052000016649', 'ผัก Vegetables', 'THITEDP20200707102841015625', 139.00, ARRAY['https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0218317000006_01.jpg'], 1000, 'g');
  END IF;
END $$;

-- ตรวจสอบว่าตาราง locations มีอยู่หรือไม่
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'locations') THEN
    -- สร้างตาราง locations
    CREATE TABLE locations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50) UNIQUE NOT NULL,
      address TEXT,
      type VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- เพิ่มข้อมูลตัวอย่างในตาราง locations
    INSERT INTO locations (name, code, type)
    VALUES
      ('Tops Central World', 'topscentralworld', 'Store'),
      ('Tops Sukhumvit', 'topssukhumvit', 'Store'),
      ('Central Warehouse', 'centralwarehouse', 'Warehouse');
  END IF;
END $$;

-- ตรวจสอบว่าตาราง inventory มีอยู่หรือไม่
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inventory') THEN
    -- สร้างตาราง inventory
    CREATE TABLE inventory (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
      available_quantity INTEGER NOT NULL DEFAULT 0,
      reserved_quantity INTEGER NOT NULL DEFAULT 0,
      safety_stock INTEGER NOT NULL DEFAULT 0,
      reorder_point INTEGER NOT NULL DEFAULT 10,
      last_restock_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(product_id, location_id)
    );
  END IF;
END $$;

-- ตรวจสอบว่าตาราง inventory_movements มีอยู่หรือไม่
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inventory_movements') THEN
    -- สร้างตาราง inventory_movements
    CREATE TABLE inventory_movements (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
      movement_type VARCHAR(50) NOT NULL,
      quantity INTEGER NOT NULL,
      reference VARCHAR(255),
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_by VARCHAR(255),
      notes TEXT
    );
  END IF;
END $$;

-- เพิ่มข้อมูลตัวอย่างในตาราง inventory
DO $$
DECLARE
  product_id_1 INTEGER;
  product_id_2 INTEGER;
  product_id_3 INTEGER;
  location_id_1 INTEGER;
  location_id_2 INTEGER;
  location_id_3 INTEGER;
BEGIN
  -- ดึง ID ของสินค้า
  SELECT id INTO product_id_1 FROM products WHERE barcode = 'TOPS-DAIRY-001';
  SELECT id INTO product_id_2 FROM products WHERE barcode = '0218244000001';
  SELECT id INTO product_id_3 FROM products WHERE barcode = '0218317000006';
  
  -- ดึง ID ของสถานที่
  SELECT id INTO location_id_1 FROM locations WHERE code = 'topscentralworld';
  SELECT id INTO location_id_2 FROM locations WHERE code = 'topssukhumvit';
  SELECT id INTO location_id_3 FROM locations WHERE code = 'centralwarehouse';
  
  -- เพิ่มข้อมูลสินค้าคงคลัง
  IF product_id_1 IS NOT NULL AND location_id_1 IS NOT NULL THEN
    INSERT INTO inventory (product_id, location_id, available_quantity, reserved_quantity, safety_stock, reorder_point)
    VALUES
      (product_id_1, location_id_1, 35, 10, 20, 30),
      (product_id_1, location_id_2, 45, 5, 15, 25),
      (product_id_1, location_id_3, 40, 10, 15, 30)
    ON CONFLICT (product_id, location_id) DO UPDATE SET
      available_quantity = EXCLUDED.available_quantity,
      reserved_quantity = EXCLUDED.reserved_quantity,
      safety_stock = EXCLUDED.safety_stock,
      reorder_point = EXCLUDED.reorder_point;
  END IF;
  
  IF product_id_2 IS NOT NULL AND location_id_1 IS NOT NULL THEN
    INSERT INTO inventory (product_id, location_id, available_quantity, reserved_quantity, safety_stock, reorder_point)
    VALUES
      (product_id_2, location_id_1, 20, 5, 10, 15),
      (product_id_2, location_id_2, 30, 8, 10, 20)
    ON CONFLICT (product_id, location_id) DO UPDATE SET
      available_quantity = EXCLUDED.available_quantity,
      reserved_quantity = EXCLUDED.reserved_quantity,
      safety_stock = EXCLUDED.safety_stock,
      reorder_point = EXCLUDED.reorder_point;
  END IF;
  
  IF product_id_3 IS NOT NULL AND location_id_1 IS NOT NULL THEN
    INSERT INTO inventory (product_id, location_id, available_quantity, reserved_quantity, safety_stock, reorder_point)
    VALUES
      (product_id_3, location_id_1, 15, 3, 5, 10),
      (product_id_3, location_id_3, 25, 5, 10, 15)
    ON CONFLICT (product_id, location_id) DO UPDATE SET
      available_quantity = EXCLUDED.available_quantity,
      reserved_quantity = EXCLUDED.reserved_quantity,
      safety_stock = EXCLUDED.safety_stock,
      reorder_point = EXCLUDED.reorder_point;
  END IF;
END $$;

-- สร้างฟังก์ชัน execute_sql สำหรับรันคำสั่ง SQL แบบไดนามิก
CREATE OR REPLACE FUNCTION execute_sql(sql text)
RETURNS SETOF json AS $$
BEGIN
  RETURN QUERY EXECUTE sql;
END;
$$ LANGUAGE plpgsql;

-- สร้างฟังก์ชันสำหรับคำนวณสินค้าคงคลังรวม
CREATE OR REPLACE FUNCTION get_total_inventory(product_id_param INTEGER)
RETURNS TABLE (
  total_available INTEGER,
  total_reserved INTEGER,
  safety_stock INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(available_quantity), 0)::INTEGER AS total_available,
    COALESCE(SUM(reserved_quantity), 0)::INTEGER AS total_reserved,
    COALESCE(MAX(safety_stock), 0)::INTEGER AS safety_stock
  FROM
    inventory
  WHERE
    product_id = product_id_param;
END;
$$ LANGUAGE plpgsql;

-- สร้างฟังก์ชันสำหรับดึงข้อมูลสินค้าคงคลังตามสถานที่
CREATE OR REPLACE FUNCTION get_inventory_by_location(product_id_param INTEGER)
RETURNS TABLE (
  location_id INTEGER,
  location_name VARCHAR(255),
  location_code VARCHAR(50),
  available_quantity INTEGER,
  reserved_quantity INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id AS location_id,
    l.name AS location_name,
    l.code AS location_code,
    i.available_quantity,
    i.reserved_quantity
  FROM
    inventory i
  JOIN
    locations l ON i.location_id = l.id
  WHERE
    i.product_id = product_id_param
  ORDER BY
    l.name;
END;
$$ LANGUAGE plpgsql;
