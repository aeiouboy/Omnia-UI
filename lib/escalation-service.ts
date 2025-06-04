import { supabase, type EscalationRecord } from "./supabase"

export class EscalationService {
  static async getAllEscalations(): Promise<EscalationRecord[]> {
    try {
      const { data, error } = await supabase
        .from("escalation_history")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching escalations:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("EscalationService.getAllEscalations error:", error)
      throw error
    }
  }

  static async createEscalation(
    escalation: Omit<EscalationRecord, "id" | "created_at" | "updated_at">,
  ): Promise<EscalationRecord | null> {
    try {
      const { data, error } = await supabase.from("escalation_history").insert([escalation]).select().single()

      if (error) {
        console.error("Error creating escalation:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("EscalationService.createEscalation error:", error)
      throw error
    }
  }

  static async updateEscalationStatus(
    id: string,
    status: EscalationRecord["status"],
  ): Promise<EscalationRecord | null> {
    try {
      const { data, error } = await supabase
        .from("escalation_history")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error updating escalation status:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("EscalationService.updateEscalationStatus error:", error)
      throw error
    }
  }

  static async getEscalationsByStatus(status: EscalationRecord["status"]): Promise<EscalationRecord[]> {
    try {
      const { data, error } = await supabase
        .from("escalation_history")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching escalations by status:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("EscalationService.getEscalationsByStatus error:", error)
      throw error
    }
  }
}
