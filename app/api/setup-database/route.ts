import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST() {
  try {
    console.log("Setting up escalation_history table...")

    // Check if table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'escalation_history')

    if (tablesError) {
      console.error("Error checking for existing tables:", tablesError)
      throw new Error(`Failed to check existing tables: ${tablesError.message}`)
    }

    if (tables && tables.length > 0) {
      return NextResponse.json({
        success: true,
        message: "escalation_history table already exists",
        tableExists: true
      })
    }

    // Create the table using raw SQL
    const createTableSQL = `
      -- Create escalation_history table
      CREATE TABLE IF NOT EXISTS escalation_history (
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

      -- Create policies for public access
      CREATE POLICY "Enable read access for all users" ON escalation_history FOR SELECT USING (true);
      CREATE POLICY "Enable insert access for all users" ON escalation_history FOR INSERT WITH CHECK (true);
      CREATE POLICY "Enable update access for all users" ON escalation_history FOR UPDATE USING (true);
      CREATE POLICY "Enable delete access for all users" ON escalation_history FOR DELETE USING (true);
    `

    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    })

    if (error) {
      console.error("Error creating escalation_history table:", error)
      throw new Error(`Failed to create table: ${error.message}`)
    }

    // Insert sample data
    const sampleData = [
      {
        alert_id: 'ALERT-2025060901',
        alert_type: 'SLA_BREACH',
        message: 'SLA breach for order ORD-2025060901',
        severity: 'HIGH',
        timestamp: '2025-06-09 08:30:00',
        status: 'SENT',
        escalated_by: 'Executive Dashboard',
        escalated_to: 'Tops Central World'
      },
      {
        alert_id: 'ALERT-2025060902',
        alert_type: 'INVENTORY',
        message: 'Inventory issue affecting order ORD-2025060902',
        severity: 'MEDIUM',
        timestamp: '2025-06-09 09:15:00',
        status: 'SENT',
        escalated_by: 'Executive Dashboard',
        escalated_to: 'Inventory Management Team'
      },
      {
        alert_id: 'ALERT-2025060903',
        alert_type: 'API_LATENCY',
        message: 'API latency issue affecting order ORD-2025060903',
        severity: 'LOW',
        timestamp: '2025-06-09 10:45:00',
        status: 'RESOLVED',
        escalated_by: 'Executive Dashboard',
        escalated_to: 'IT Support Team'
      }
    ]

    const { data: insertData, error: insertError } = await supabase
      .from('escalation_history')
      .insert(sampleData)

    if (insertError) {
      console.warn("Warning: Could not insert sample data:", insertError.message)
    }

    return NextResponse.json({
      success: true,
      message: "escalation_history table created successfully",
      sampleDataInserted: !insertError
    })

  } catch (error) {
    console.error("Error setting up database:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Database setup failed: ${error instanceof Error ? error.message : "Unknown error"}` 
      },
      { status: 500 }
    )
  }
}