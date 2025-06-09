-- Create escalation_history table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'escalation_history') THEN
    -- Create escalation_history table
    CREATE TABLE escalation_history (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      alert_id VARCHAR(255) NOT NULL,
      alert_type VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      severity VARCHAR(20) NOT NULL CHECK (severity IN ('HIGH', 'MEDIUM', 'LOW')),
      timestamp VARCHAR(100) NOT NULL,
      status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'RESOLVED')),
      escalated_by VARCHAR(255) NOT NULL,
      escalated_to VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_escalation_status ON escalation_history(status);
    CREATE INDEX IF NOT EXISTS idx_escalation_alert_type ON escalation_history(alert_type);
    CREATE INDEX IF NOT EXISTS idx_escalation_severity ON escalation_history(severity);
    CREATE INDEX IF NOT EXISTS idx_escalation_created_at ON escalation_history(created_at);
    CREATE INDEX IF NOT EXISTS idx_escalation_alert_id ON escalation_history(alert_id);
    CREATE INDEX IF NOT EXISTS idx_escalation_escalated_to ON escalation_history(escalated_to);

    -- Enable Row Level Security (RLS)
    ALTER TABLE escalation_history ENABLE ROW LEVEL SECURITY;

    -- Create policies for public access (adjust as needed for your security requirements)
    CREATE POLICY "Enable read access for all users" ON escalation_history FOR SELECT USING (true);
    CREATE POLICY "Enable insert access for all users" ON escalation_history FOR INSERT WITH CHECK (true);
    CREATE POLICY "Enable update access for all users" ON escalation_history FOR UPDATE USING (true);
    CREATE POLICY "Enable delete access for all users" ON escalation_history FOR DELETE USING (true);

    RAISE NOTICE 'escalation_history table created successfully';
  ELSE
    RAISE NOTICE 'escalation_history table already exists';
  END IF;
END $$;

-- Insert some sample escalation data for testing
DO $$
BEGIN
  -- Check if sample data already exists
  IF NOT EXISTS (SELECT 1 FROM escalation_history LIMIT 1) THEN
    INSERT INTO escalation_history (
      alert_id, 
      alert_type, 
      message, 
      severity, 
      timestamp, 
      status, 
      escalated_by, 
      escalated_to
    ) VALUES 
    (
      'ALERT-2025060901',
      'SLA_BREACH',
      'SLA breach for order ORD-2025060901',
      'HIGH',
      '2025-06-09 08:30:00',
      'SENT',
      'Executive Dashboard',
      'Tops Central World'
    ),
    (
      'ALERT-2025060902',
      'INVENTORY',
      'Inventory issue affecting order ORD-2025060902',
      'MEDIUM',
      '2025-06-09 09:15:00',
      'SENT',
      'Executive Dashboard',
      'Inventory Management Team'
    ),
    (
      'ALERT-2025060903',
      'API_LATENCY',
      'API latency issue affecting order ORD-2025060903',
      'LOW',
      '2025-06-09 10:45:00',
      'RESOLVED',
      'Executive Dashboard',
      'IT Support Team'
    ),
    (
      'ALERT-2025060904',
      'SLA_BREACH',
      'SLA breach for order ORD-2025060904',
      'HIGH',
      '2025-06-09 11:20:00',
      'FAILED',
      'Executive Dashboard',
      'Tops Sukhumvit'
    ),
    (
      'ALERT-2025060905',
      'SYSTEM',
      'System issue affecting order ORD-2025060905',
      'MEDIUM',
      '2025-06-09 12:00:00',
      'PENDING',
      'Executive Dashboard',
      'Central Warehouse'
    );

    RAISE NOTICE 'Sample escalation data inserted successfully';
  ELSE
    RAISE NOTICE 'Sample escalation data already exists';
  END IF;
END $$;