-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_no VARCHAR(255) NOT NULL UNIQUE,
  customer VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  channel VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  business_unit VARCHAR(50) NOT NULL,
  order_type VARCHAR(50) NOT NULL,
  items INTEGER NOT NULL,
  total VARCHAR(50) NOT NULL,
  date VARCHAR(100) NOT NULL,
  sla_target_minutes INTEGER NOT NULL,
  elapsed_minutes INTEGER NOT NULL,
  sla_status VARCHAR(20) NOT NULL,
  store_name VARCHAR(255) NOT NULL,
  selling_location_id VARCHAR(255) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  billing_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(20) NOT NULL,
  fulfillment_location_id VARCHAR(255),
  items_list JSONB NOT NULL,
  order_date DATE NOT NULL,
  return_status VARCHAR(50),
  on_hold BOOLEAN DEFAULT FALSE,
  confirmed BOOLEAN DEFAULT TRUE,
  allow_substitution BOOLEAN DEFAULT FALSE,
  created_date VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create escalation_history table
CREATE TABLE IF NOT EXISTS escalation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id VARCHAR(255) NOT NULL,
  alert_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL,
  timestamp VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  escalated_by VARCHAR(255) NOT NULL,
  escalated_to VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_channel ON orders(channel);
CREATE INDEX IF NOT EXISTS idx_orders_sla_status ON orders(sla_status);
CREATE INDEX IF NOT EXISTS idx_orders_business_unit ON orders(business_unit);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);

CREATE INDEX IF NOT EXISTS idx_escalation_status ON escalation_history(status);
CREATE INDEX IF NOT EXISTS idx_escalation_alert_type ON escalation_history(alert_type);
CREATE INDEX IF NOT EXISTS idx_escalation_created_at ON escalation_history(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Enable read access for all users" ON orders FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON orders FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON orders FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON escalation_history FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON escalation_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON escalation_history FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON escalation_history FOR DELETE USING (true);
