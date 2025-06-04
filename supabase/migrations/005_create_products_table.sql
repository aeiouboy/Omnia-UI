-- สร้างตาราง products
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  format VARCHAR(100) DEFAULT 'Tops Fine Food',
  store_id VARCHAR(50),
  merchant_id VARCHAR(50),
  category VARCHAR(200) NOT NULL,
  category_id VARCHAR(50) NOT NULL,
  subcategory VARCHAR(200) NOT NULL,
  subcategory_id VARCHAR(50) NOT NULL,
  barcode VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  photo TEXT[],
  special_type VARCHAR(50),
  sold_by_weight BOOLEAN DEFAULT true,
  max_count INTEGER DEFAULT 3,
  weight_count INTEGER DEFAULT 1,
  weight_value INTEGER NOT NULL,
  weight_unit VARCHAR(10) DEFAULT 'g',
  available_status VARCHAR(20) DEFAULT 'AVAILABLE',
  price DECIMAL(10,2) NOT NULL,
  non_stock_sync_item BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง index สำหรับการค้นหา
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_subcategory ON products(subcategory_id);
CREATE INDEX idx_products_available_status ON products(available_status);

-- สร้างตาราง inventory_levels
CREATE TABLE IF NOT EXISTS inventory_levels (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  location_id VARCHAR(50) DEFAULT 'MAIN',
  quantity INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 10,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, location_id)
);

-- สร้างตาราง inventory_movements
CREATE TABLE IF NOT EXISTS inventory_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('Inbound', 'Outbound', 'Adjustment')),
  quantity INTEGER NOT NULL,
  reference VARCHAR(100),
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
