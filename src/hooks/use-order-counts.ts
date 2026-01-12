import { useState, useEffect, useCallback } from 'react'

interface OrderCounts {
  breach: number
  nearBreach: number
  submitted: number
  onHold: number
  total: number
}

interface UseOrderCountsResult {
  counts: OrderCounts
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useOrderCounts(refreshInterval: number = 10000, businessUnit?: string): UseOrderCountsResult {
  const [counts, setCounts] = useState<OrderCounts>({
    breach: 0,
    nearBreach: 0,
    submitted: 0,
    onHold: 0,
    total: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCounts = useCallback(async () => {
    try {
      const url = new URL('/api/orders/counts', window.location.origin)
      if (businessUnit && businessUnit !== 'ALL') {
        url.searchParams.set('businessUnit', businessUnit)
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success && data.data) {
        setCounts(data.data)
        setError(null)
      } else {
        // Use the data even if success is false (it contains zero counts)
        setCounts(data.data || {
          breach: 0,
          nearBreach: 0,
          submitted: 0,
          onHold: 0,
          total: 0
        })
        setError(data.error || 'Failed to fetch counts')
      }
    } catch (err) {
      console.error('Failed to fetch order counts:', err)
      setError('Network error')
      // Keep existing counts on error
    } finally {
      setIsLoading(false)
    }
  }, [businessUnit])

  useEffect(() => {
    // Initial fetch
    fetchCounts()

    // Set up polling
    const intervalId = setInterval(fetchCounts, refreshInterval)

    return () => clearInterval(intervalId)
  }, [fetchCounts, refreshInterval])

  return {
    counts,
    isLoading,
    error,
    refetch: fetchCounts
  }
}