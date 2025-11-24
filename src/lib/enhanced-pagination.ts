import { useLoadingState } from '@/hooks/use-loading-state'
import { loggingService } from '@/lib/logging-service'
import { getGMT7Time, safeParseDate } from '@/lib/utils'

// Enhanced pagination function with loading state management
export async function enhancedFetchWithProgress(
  loadingState: ReturnType<typeof useLoadingState>,
  options: {
    dateFrom?: string
    dateTo?: string
    maxPages?: number
    maxOrders?: number
    defaultPageSize?: number
    enableCache?: boolean
    cacheValidation?: (dateFrom: string, dateTo: string) => boolean
    cacheData?: any
    updateCache?: (data: any) => void
  } = {}
) {
  const {
    dateFrom: providedDateFrom,
    dateTo: providedDateTo,
    maxPages = 100,
    maxOrders = 50000,
    defaultPageSize = 10000,
    enableCache = true,
    cacheValidation,
    cacheData,
    updateCache
  } = options

  // Calculate date range if not provided
  let dateFrom = providedDateFrom
  let dateTo = providedDateTo
  
  if (!dateFrom || !dateTo) {
    const endDate = getGMT7Time()
    endDate.setHours(23, 59, 59, 999)
    const startDate = getGMT7Time()
    startDate.setDate(endDate.getDate() - 1)
    startDate.setHours(0, 0, 0, 0)

    dateFrom = startDate.toISOString().split("T")[0]
    dateTo = endDate.toISOString().split("T")[0]
  }

  // Check cache first
  if (enableCache && cacheValidation && cacheValidation(dateFrom, dateTo)) {
    loggingService.cacheHit(cacheData?.orders?.length || 0, Date.now() - (cacheData?.timestamp || 0))
    loadingState.addLoadingMessage('Using cached data', 'success')
    return cacheData.orders || []
  }

  if (enableCache) {
    loggingService.cacheMiss('Cache expired or invalid')
  }

  // Initialize loading state
  loadingState.startLoading('Initializing data fetch...')
  const logger = loggingService.createChildLogger('pagination')
  
  // Start progress tracking
  const estimatedPages = Math.ceil(maxOrders / defaultPageSize)
  loadingState.startPaginationProgress(estimatedPages, maxOrders)
  loggingService.startPagination(estimatedPages, maxOrders, 'order fetch')

  const allOrders: any[] = []
  let currentPage = 1
  let hasNext = true
  
  // Performance and safety configuration
  const MIN_PAGE_SIZE = 1000
  const MAX_PAGE_SIZE = 10000
  let dynamicPageSize = defaultPageSize
  let totalFetched = 0
  let consecutiveFailures = 0
  const maxConsecutiveFailures = 3
  let successfulPages = 0
  let failedPages = 0
  const startTime = Date.now()

  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
    loggingService.timeout('pagination', Date.now() - startTime, 60000, totalFetched)
  }, 60000)

  try {
    while (hasNext && currentPage <= maxPages && consecutiveFailures < maxConsecutiveFailures && allOrders.length < maxOrders) {
      // Update loading message for current page
      loadingState.addLoadingMessage(`Fetching page ${currentPage} with pageSize ${dynamicPageSize}...`, 'info')
      loggingService.startPage(currentPage, dynamicPageSize, estimatedPages)
      
      const pageStartTime = Date.now()
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: dynamicPageSize.toString(),
        dateFrom,
        dateTo,
      })

      // Retry logic for each page
      let pageSuccess = false
      let retryAttempt = 0
      const MAX_RETRIES = 3
      const BASE_RETRY_DELAY = 1000

      while (!pageSuccess && retryAttempt < MAX_RETRIES) {
        try {
          if (retryAttempt > 0) {
            loadingState.addLoadingMessage(`Retrying page ${currentPage}, attempt ${retryAttempt + 1}/${MAX_RETRIES}`, 'warning')
            loggingService.retryPage(currentPage, retryAttempt + 1, MAX_RETRIES, 'Network/API error')
          }

          const response = await fetch(`/api/orders/external?${queryParams.toString()}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data) {
              const orders = data.data.data || []
              
              // Process and validate orders
              const validOrders = orders.filter((order: any) => {
                if (!order || !order.id) return false
                
                try {
                  const orderDate = safeParseDate(order.order_date || order.metadata?.created_at)
                  const orderGMT7 = getGMT7Time(orderDate)
                  const startDate = new Date(dateFrom + 'T00:00:00.000Z')
                  const endDate = new Date(dateTo + 'T23:59:59.999Z')
                  return orderGMT7 >= startDate && orderGMT7 <= endDate
                } catch (error) {
                  logger.warning(`Invalid order date for order ${order.id}`, { error: error instanceof Error ? error.message : String(error) })
                  return false
                }
              }).map((order: any) => ({
                // Memory-efficient field filtering
                id: order.id,
                order_no: order.order_no,
                status: order.status,
                channel: order.channel,
                total_amount: order.total_amount,
                order_date: order.order_date,
                location: order.location,
                sla_info: order.sla_info ? {
                  target_minutes: order.sla_info.target_minutes,
                  elapsed_minutes: order.sla_info.elapsed_minutes,
                  status: order.sla_info.status
                } : undefined,
                customer: order.customer ? {
                  name: order.customer.name,
                  id: order.customer.id
                } : undefined,
                metadata: order.metadata ? {
                  created_at: order.metadata.created_at,
                  updated_at: order.metadata.updated_at
                } : undefined
              }))

              // Deduplicate orders
              const existingIds = new Set(allOrders.map((o: any) => o.id))
              const newOrders = validOrders.filter((order: any) => !existingIds.has(order.id))
              
              // Accumulate orders
              allOrders.push(...newOrders)
              totalFetched += newOrders.length

              // Calculate page metrics
              const pageTime = Date.now() - pageStartTime
              const avgTime = currentPage > 0 ? (Date.now() - startTime) / currentPage : 0

              // Update progress tracking
              loadingState.updatePaginationProgress(currentPage, newOrders.length, data.data.pagination?.hasNext || false, pageStartTime)
              
              // Log page completion
              loggingService.completePage(
                currentPage, 
                newOrders.length, 
                totalFetched, 
                pageTime, 
                avgTime, 
                data.data.pagination?.hasNext || false,
                estimatedPages
              )

              // Dynamic page size optimization
              if (avgTime > 5000) {
                const newPageSize = Math.max(MIN_PAGE_SIZE, Math.floor(dynamicPageSize * 0.8))
                if (newPageSize !== dynamicPageSize) {
                  logger.warning(`Reducing page size due to slow performance`, {
                    from: dynamicPageSize,
                    to: newPageSize,
                    avgTime
                  })
                  dynamicPageSize = newPageSize
                }
              } else if (avgTime < 2000 && dynamicPageSize < MAX_PAGE_SIZE) {
                const newPageSize = Math.min(MAX_PAGE_SIZE, Math.floor(dynamicPageSize * 1.2))
                if (newPageSize !== dynamicPageSize) {
                  logger.info(`Increasing page size due to good performance`, {
                    from: dynamicPageSize,
                    to: newPageSize,
                    avgTime
                  })
                  dynamicPageSize = newPageSize
                }
              }

              // Check limits
              if (allOrders.length >= maxOrders) {
                loadingState.addLoadingMessage(`Reached maximum order limit (${maxOrders})`, 'warning')
                loggingService.warning('Reached maximum order limit', { maxOrders, current: allOrders.length })
                break
              }

              // Update pagination state
              hasNext = data.data.pagination?.hasNext || false
              pageSuccess = true
              consecutiveFailures = 0
              successfulPages++

              if (retryAttempt > 0) {
                loadingState.addLoadingMessage(`Page ${currentPage} succeeded after ${retryAttempt + 1} attempts`, 'success')
              }

            } else {
              throw new Error(`Invalid response data structure for page ${currentPage}`)
            }
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
        } catch (pageError) {
          retryAttempt++

          loggingService.error(`Page ${currentPage} error`, {
            page: currentPage,
            attempt: retryAttempt,
            maxRetries: MAX_RETRIES,
            error: pageError instanceof Error ? pageError.message : String(pageError)
          }, pageError instanceof Error ? pageError : undefined)

          if (retryAttempt < MAX_RETRIES) {
            const delayMs = BASE_RETRY_DELAY * Math.pow(2, retryAttempt - 1)
            loadingState.addLoadingMessage(`Page ${currentPage} failed, retrying in ${delayMs}ms`, 'warning')
            await new Promise(resolve => setTimeout(resolve, delayMs))
          } else {
            loadingState.addLoadingMessage(`Page ${currentPage} failed after ${MAX_RETRIES} attempts`, 'error')
            loggingService.failPage(currentPage, pageError instanceof Error ? pageError.message : String(pageError), true)
            consecutiveFailures++
            failedPages++
            pageSuccess = true // Exit retry loop
          }
        }
      }

      // Move to next page
      if (pageSuccess) {
        currentPage++
        
        // Optional delay between pages
        const REQUEST_DELAY = 100
        if (hasNext && REQUEST_DELAY > 0) {
          await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY))
        }
      }
    }

    clearTimeout(timeoutId)

    // Complete progress tracking
    const totalTime = Date.now() - startTime
    const avgTime = successfulPages > 0 ? totalTime / successfulPages : 0
    
    loadingState.completePaginationProgress(totalFetched, totalTime, failedPages, 0)
    loggingService.completePagination(totalFetched, successfulPages, totalTime, avgTime, failedPages, 0)

    // Update cache if enabled
    if (enableCache && updateCache) {
      const cacheData = {
        orders: allOrders,
        timestamp: Date.now(),
        dateRange: { from: dateFrom, to: dateTo },
        fetchedPages: successfulPages,
        totalOrders: allOrders.length
      }
      updateCache(cacheData)
      loggingService.cacheUpdate(allOrders.length)
    }

    // Update loading states to complete
    loadingState.resetLoadingStates()
    loadingState.addLoadingMessage(`Data fetch completed: ${totalFetched} orders from ${successfulPages} pages`, 'success')

    return allOrders

  } catch (error) {
    clearTimeout(timeoutId)

    loadingState.addLoadingMessage(`Data fetch failed: ${error instanceof Error ? error.message : String(error)}`, 'error')
    loggingService.error('Pagination failed', { error: error instanceof Error ? error.message : String(error) }, error instanceof Error ? error : undefined)
    
    // Return partial results if available
    if (allOrders.length > 0) {
      loadingState.addLoadingMessage(`Returning partial results: ${allOrders.length} orders`, 'warning')
      return allOrders
    }
    
    throw error
  }
}

export default enhancedFetchWithProgress
