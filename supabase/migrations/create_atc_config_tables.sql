-- ATC Configuration Tables Migration
-- Creates tables for storing ATC (Availability to Commerce) configuration data
-- and configuration history for versioning

-- ATC Configurations table
-- Stores the current configuration data for ATC rules and inventory supply settings
CREATE TABLE IF NOT EXISTS atc_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  version INTEGER DEFAULT 1 NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
  config_data JSONB NOT NULL,
  created_by UUID, -- References auth.users(id) if auth is enabled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT atc_config_name_unique UNIQUE (name, version)
);

-- ATC Configuration History table
-- Stores historical versions of configurations for audit trail and rollback
CREATE TABLE IF NOT EXISTS atc_configuration_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES atc_configurations(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  config_data JSONB NOT NULL,
  changed_by UUID, -- References auth.users(id) if auth is enabled
  change_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT atc_history_config_version UNIQUE (config_id, version)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_atc_config_status ON atc_configurations(status);
CREATE INDEX IF NOT EXISTS idx_atc_config_created_at ON atc_configurations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_atc_config_updated_at ON atc_configurations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_atc_config_history_config_id ON atc_configuration_history(config_id);
CREATE INDEX IF NOT EXISTS idx_atc_config_history_created_at ON atc_configuration_history(created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_atc_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row updates
DROP TRIGGER IF EXISTS trigger_update_atc_config_updated_at ON atc_configurations;
CREATE TRIGGER trigger_update_atc_config_updated_at
  BEFORE UPDATE ON atc_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_atc_config_updated_at();

-- Row Level Security (RLS) policies
-- Note: Uncomment these if you have auth.users table and want to enable RLS

-- ALTER TABLE atc_configurations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE atc_configuration_history ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all configurations
-- CREATE POLICY "Allow authenticated users to read configurations"
--   ON atc_configurations FOR SELECT
--   TO authenticated
--   USING (true);

-- Allow authenticated users to insert configurations
-- CREATE POLICY "Allow authenticated users to insert configurations"
--   ON atc_configurations FOR INSERT
--   TO authenticated
--   WITH CHECK (true);

-- Allow users to update their own configurations or admins to update all
-- CREATE POLICY "Allow users to update configurations"
--   ON atc_configurations FOR UPDATE
--   TO authenticated
--   USING (created_by = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
--   WITH CHECK (created_by = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Allow users to delete their own configurations or admins to delete all
-- CREATE POLICY "Allow users to delete configurations"
--   ON atc_configurations FOR DELETE
--   TO authenticated
--   USING (created_by = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Allow authenticated users to read history
-- CREATE POLICY "Allow authenticated users to read history"
--   ON atc_configuration_history FOR SELECT
--   TO authenticated
--   USING (true);

-- Comment on tables and columns for documentation
COMMENT ON TABLE atc_configurations IS 'Stores ATC (Availability to Commerce) configuration data for inventory supply rules and availability rules';
COMMENT ON COLUMN atc_configurations.config_data IS 'JSONB field storing the complete configuration object including inventory_supply and atc_rules';
COMMENT ON COLUMN atc_configurations.status IS 'Configuration status: draft (editing), active (published), archived (deprecated)';
COMMENT ON TABLE atc_configuration_history IS 'Version history for ATC configurations, enabling audit trail and rollback functionality';
