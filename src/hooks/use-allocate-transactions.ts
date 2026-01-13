import { useState, useEffect, useCallback } from "react"
import type { AllocateByOrderTransaction } from "@/types/inventory"

interface UseAllocateTransactionsResult {
  data: AllocateByOrderTransaction[]
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Custom hook for fetching allocate-by-order transactions for an inventory item
 *
 * @param itemId - The inventory item ID to fetch transactions for
 * @returns Object containing data, loading state, error, and refetch function
 */
export function useAllocateTransactions(itemId: string): UseAllocateTransactionsResult {
  const [data, setData] = useState<AllocateByOrderTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    if (!itemId) {
      setData([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/inventory/${itemId}/allocate-transactions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      setData(result.data || [])
    } catch (err) {
      console.error("Failed to fetch allocate transactions:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch transactions")
      setData([])
    } finally {
      setLoading(false)
    }
  }, [itemId])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return {
    data,
    loading,
    error,
    refetch: fetchTransactions,
  }
}
