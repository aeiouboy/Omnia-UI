-- ATC Configuration Advanced Features Migration
-- Creates tables for test cases, conflicts, and impact analyses
-- Extends existing tables with additional fields for Phase 2 & 3 features

-- Add new columns to atc_configuration_history for enhanced version tracking
ALTER TABLE atc_configuration_history
  ADD COLUMN IF NOT EXISTS changes_summary JSONB,
  ADD COLUMN IF NOT EXISTS restored_from UUID REFERENCES atc_configuration_history(id);

COMMENT ON COLUMN atc_configuration_history.changes_summary IS 'JSON object containing summary of changes: {added: [], modified: [], removed: []}';
COMMENT ON COLUMN atc_configuration_history.restored_from IS 'References the history record this version was restored from, if applicable';

-- ATC Test Cases table
-- Stores test cases for validating rule configurations
CREATE TABLE IF NOT EXISTS atc_test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES atc_configurations(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  test_data JSONB NOT NULL,
  expected_result JSONB NOT NULL,
  last_run_result JSONB,
  last_run_at TIMESTAMP WITH TIME ZONE,
  created_by UUID, -- References auth.users(id) if auth is enabled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT atc_test_case_name_unique UNIQUE (config_id, test_name)
);

COMMENT ON TABLE atc_test_cases IS 'Stores test cases for validating ATC rule configurations';
COMMENT ON COLUMN atc_test_cases.test_data IS 'Test input data: {product: {...}, location: {...}, inventory: {...}, context: {...}}';
COMMENT ON COLUMN atc_test_cases.expected_result IS 'Expected test outcome: {should_match: true, matched_rules: [...], availability: {...}}';
COMMENT ON COLUMN atc_test_cases.last_run_result IS 'Last test execution result: {passed: true, actual_result: {...}, timestamp: ...}';

-- ATC Configuration Conflicts table
-- Stores detected conflicts between rules
CREATE TABLE IF NOT EXISTS atc_configuration_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES atc_configurations(id) ON DELETE CASCADE,
  conflict_type TEXT NOT NULL CHECK (conflict_type IN ('overlap', 'contradiction', 'ambiguity', 'unreachable')),
  severity TEXT NOT NULL CHECK (severity IN ('error', 'warning', 'info')),
  conflict_data JSONB NOT NULL,
  resolved BOOLEAN DEFAULT false NOT NULL,
  resolved_by UUID, -- References auth.users(id) if auth is enabled
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE atc_configuration_conflicts IS 'Stores detected conflicts between ATC rules';
COMMENT ON COLUMN atc_configuration_conflicts.conflict_type IS 'Type of conflict: overlap (same item multiple rules), contradiction (conflicting settings), ambiguity (unclear priority), unreachable (shadowed rule)';
COMMENT ON COLUMN atc_configuration_conflicts.severity IS 'Conflict severity: error (blocks publish), warning (review recommended), info (informational)';
COMMENT ON COLUMN atc_configuration_conflicts.conflict_data IS 'Detailed conflict information: {rules_involved: [...], affected_items: [...], description: ..., suggested_resolution: ...}';

-- ATC Impact Analyses table
-- Stores impact analysis results for configuration changes
CREATE TABLE IF NOT EXISTS atc_impact_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES atc_configurations(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('pre_publish', 'simulation', 'historical')),
  analysis_data JSONB NOT NULL,
  analyzed_by UUID, -- References auth.users(id) if auth is enabled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE atc_impact_analyses IS 'Stores impact analysis results for ATC configuration changes';
COMMENT ON COLUMN atc_impact_analyses.analysis_type IS 'Type of analysis: pre_publish (before activation), simulation (what-if), historical (post-change review)';
COMMENT ON COLUMN atc_impact_analyses.analysis_data IS 'Analysis results: {affected_items: {...}, affected_locations: {...}, channel_impact: {...}, revenue_impact: {...}}';

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_atc_test_cases_config_id ON atc_test_cases(config_id);
CREATE INDEX IF NOT EXISTS idx_atc_test_cases_created_at ON atc_test_cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_atc_conflicts_config_id ON atc_configuration_conflicts(config_id);
CREATE INDEX IF NOT EXISTS idx_atc_conflicts_resolved ON atc_configuration_conflicts(resolved, severity);
CREATE INDEX IF NOT EXISTS idx_atc_conflicts_created_at ON atc_configuration_conflicts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_atc_impact_config_id ON atc_impact_analyses(config_id);
CREATE INDEX IF NOT EXISTS idx_atc_impact_created_at ON atc_impact_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_atc_history_restored_from ON atc_configuration_history(restored_from) WHERE restored_from IS NOT NULL;

-- Function to automatically update updated_at timestamp for test cases
CREATE OR REPLACE FUNCTION update_atc_test_case_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on test case updates
DROP TRIGGER IF EXISTS trigger_update_atc_test_case_updated_at ON atc_test_cases;
CREATE TRIGGER trigger_update_atc_test_case_updated_at
  BEFORE UPDATE ON atc_test_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_atc_test_case_updated_at();

-- Function to automatically update updated_at timestamp for conflicts
CREATE OR REPLACE FUNCTION update_atc_conflict_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on conflict updates
DROP TRIGGER IF EXISTS trigger_update_atc_conflict_updated_at ON atc_configuration_conflicts;
CREATE TRIGGER trigger_update_atc_conflict_updated_at
  BEFORE UPDATE ON atc_configuration_conflicts
  FOR EACH ROW
  EXECUTE FUNCTION update_atc_conflict_updated_at();

-- Row Level Security (RLS) policies
-- Note: Uncomment these if you have auth.users table and want to enable RLS

-- ALTER TABLE atc_test_cases ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE atc_configuration_conflicts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE atc_impact_analyses ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage test cases
-- CREATE POLICY "Allow authenticated users to manage test cases"
--   ON atc_test_cases FOR ALL
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);

-- Allow authenticated users to read conflicts
-- CREATE POLICY "Allow authenticated users to read conflicts"
--   ON atc_configuration_conflicts FOR SELECT
--   TO authenticated
--   USING (true);

-- Allow authenticated users to resolve conflicts
-- CREATE POLICY "Allow authenticated users to resolve conflicts"
--   ON atc_configuration_conflicts FOR UPDATE
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);

-- Allow authenticated users to read impact analyses
-- CREATE POLICY "Allow authenticated users to read impact analyses"
--   ON atc_impact_analyses FOR ALL
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);
