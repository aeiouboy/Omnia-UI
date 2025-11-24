import { ApiOrder, OrderAlert } from './types'
import { getGMT7Time, safeToISOString } from '@/lib/utils'
import { filterSLABreach, filterApproachingSLA } from '@/lib/sla-utils'
import { DEFAULT_PAGE_SIZE } from './constants'

// Circuit breaker configuration
interface CircuitBreaker {
  failures: number
  lastFailureTime: number
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
}

// Request queue management
interface RequestQueueManager {
  queue: Map<string, Promise<any>>
  circuitBreaker: CircuitBreaker
}

// Data cache interface
interface DataCache {
  [key: string]: {
    data: ApiOrder[]
    timestamp: number
  }
}

// Clear cache when channel detection logic is updated
export function clearChannelDataCache(cache: DataCache) {
  console.log('🗑️ Clearing channel data cache due to detection logic update')
  Object.keys(cache).forEach(key => {
    delete cache[key]
  })
}

// Create request queue manager
export function createRequestQueueManager(): RequestQueueManager {
  return {
    queue: new Map(),
    circuitBreaker: {
      failures: 0,
      lastFailureTime: 0,
      state: 'CLOSED'
    }
  }
}

// Execute request with deduplication and circuit breaker
export async function executeRequest(
  requestId: string,
  requestFn: () => Promise<any>,
  queueManager: RequestQueueManager,
  options: { timeout?: number; retries?: number } = {}
): Promise<any> {
  // Check if request is already in flight
  if (queueManager.queue.has(requestId)) {
    console.log(`🔄 Request ${requestId} already in flight, returning existing promise`)
    return queueManager.queue.get(requestId)!
  }
  
  // Circuit breaker check
  const circuitBreaker = queueManager.circuitBreaker
  if (circuitBreaker.state === 'OPEN') {
    const timeSinceLastFailure = Date.now() - circuitBreaker.lastFailureTime
    if (timeSinceLastFailure < 30000) { // 30 second timeout
      throw new Error('Circuit breaker is OPEN - too many failures')
    } else {
      circuitBreaker.state = 'HALF_OPEN'
    }
  }
  
  // Create abort controller for this request
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000)
  
  const requestPromise = (async () => {
    try {
      console.log(`🚀 Executing request: ${requestId}`)
      const result = await requestFn()
      
      // Success - reset circuit breaker
      circuitBreaker.failures = 0
      circuitBreaker.state = 'CLOSED'
      
      clearTimeout(timeoutId)
      queueManager.queue.delete(requestId)
      console.log(`✅ Request completed: ${requestId}`)
      return result
      
    } catch (error) {
      clearTimeout(timeoutId)
      queueManager.queue.delete(requestId)
      
      // Update circuit breaker
      circuitBreaker.failures++
      circuitBreaker.lastFailureTime = Date.now()
      if (circuitBreaker.failures >= 3) {
        circuitBreaker.state = 'OPEN'
        console.log('🚫 Circuit breaker opened due to failures')
      }
      
      console.error(`❌ Request failed: ${requestId}`, error)
      throw error
    }
  })()
  
  queueManager.queue.set(requestId, requestPromise)
  return requestPromise
}

// Fetch orders with intelligent caching - now handles complete 7-day datasets
export async function fetchOrdersWithCache(
  dateFrom: string,
  dateTo: string,
  cache: DataCache,
  queueManager: RequestQueueManager,
  onProgress?: (progress: { currentPage: number; totalPages: number; ordersLoaded: number; coverage: number }) => void
): Promise<{ orders: ApiOrder[]; completeness: { coverage: number; completeDays: number; missingDays: string[]; isComplete: boolean } }> {
  const cacheKey = `${dateFrom}-${dateTo}`
  const requestId = `fetch-orders-${cacheKey}`
  
  return executeRequest(requestId, async () => {
    console.log(`🚀 Smart 7-day fetch from ${dateFrom} to ${dateTo}`)
    
    const cached = cache[cacheKey]
    const now = Date.now()
    
    // Check if cached data has complete 7-day coverage
    if (cached && cached.data.length > 0) {
      const age = now - cached.timestamp
      const isStale = age > 60000 // 1 minute
      const cachedCompleteness = validateSevenDaysCoverage(cached.data, dateFrom, dateTo)
      
      if (!isStale && cachedCompleteness.isComplete) {
        console.log(`⚡ Using fresh complete cache (${cached.data.length} orders, ${cachedCompleteness.coverage}% coverage, ${Math.round(age/1000)}s old)`)
        return { orders: cached.data, completeness: cachedCompleteness }
      }
      
      console.log(`📤 Cache is stale or incomplete (${cachedCompleteness.coverage}% coverage), fetching fresh complete dataset...`)
      // Fetch fresh complete data when stale or incomplete
      const freshResult = await fetchOrdersFromAPIFast(dateFrom, dateTo, onProgress)
      if (freshResult.orders.length > 0) {
        cache[cacheKey] = { data: freshResult.orders, timestamp: Date.now() }
        console.log(`🔄 Fresh complete data retrieved: ${freshResult.orders.length} orders, ${freshResult.completeness.coverage}% coverage`)
        return freshResult
      }
      
      // Return stale data only if fresh fetch fails
      console.log(`⚠️ Fresh fetch failed, using stale cache`)
      return { orders: cached.data, completeness: cachedCompleteness }
    }
    
    // No cache, fetch fresh complete data
    const freshResult = await fetchOrdersFromAPIFast(dateFrom, dateTo, onProgress)
    if (freshResult.orders.length > 0) {
      cache[cacheKey] = { data: freshResult.orders, timestamp: now }
    }
    
    return freshResult
  }, queueManager, { timeout: 120000, retries: 1 }) // Increased timeout for complete dataset
}

// Complete data fetch - waits for ALL pages to ensure 7-day data completeness
export async function fetchOrdersFromAPIFast(
  dateFrom: string,
  dateTo: string,
  onProgress?: (progress: { currentPage: number; totalPages: number; ordersLoaded: number; coverage: number }) => void
): Promise<{ orders: ApiOrder[]; completeness: { coverage: number; completeDays: number; missingDays: string[]; isComplete: boolean } }> {
  try {
    console.log(`🚀 Complete 7-day fetch starting for ${dateFrom} to ${dateTo}`)
    
    // Fetch first page to get pagination info
    const firstPageData = await fetchSinglePage(dateFrom, dateTo, 1, DEFAULT_PAGE_SIZE)
    
    if (!firstPageData.success) {
      console.error('❌ First page fetch failed')
      return { orders: [], completeness: { coverage: 0, completeDays: 0, missingDays: [], isComplete: false } }
    }
    
    const allOrders: ApiOrder[] = []
    const firstPageOrders = firstPageData.data.data || []
    const pagination = firstPageData.data.pagination || {}
    
    allOrders.push(...firstPageOrders)
    console.log(`✅ First page: ${firstPageOrders.length} orders`)
    
    // DEBUG: Check what page the API actually returned
    console.log(`🔍 PAGINATION DEBUG - First page response:`, {
      requestedPage: 1,
      actualPage: pagination.page,
      totalPages: pagination.totalPages,
      hasNext: pagination.hasNext,
      hasPrev: pagination.hasPrev,
      pageSize: pagination.pageSize,
      total: pagination.total
    })
    
    // Report initial progress
    const totalPages = pagination.totalPages || 1
    onProgress?.({ currentPage: 1, totalPages, ordersLoaded: allOrders.length, coverage: 0 })
    
    // CRITICAL EXIT: If no data or single page, return immediately
    if (!pagination.hasNext || totalPages <= 1 || allOrders.length === 0) {
      console.log(`🛑 EARLY EXIT: No pagination needed`, {
        hasNext: pagination.hasNext,
        totalPages,
        ordersLength: allOrders.length,
        reason: !pagination.hasNext ? 'no_next_page' : totalPages <= 1 ? 'single_page' : 'no_orders'
      })
      
      const finalCompleteness = validateSevenDaysCoverage(allOrders, dateFrom, dateTo)
      return { orders: allOrders, completeness: finalCompleteness }
    }
    
    // ROBUST PAGINATION with comprehensive debugging and error recovery
    if (pagination.hasNext && totalPages > 1) {
      console.log(`📄 Starting robust pagination: ${totalPages - 1} remaining pages for complete 7-day dataset...`)
      console.log(`🔍 Pagination debug info:`, {
        totalPages,
        hasNext: pagination.hasNext,
        currentPageSize: firstPageOrders.length,
        apiPagination: pagination,
        willFetchPages: `${Math.max(pagination.page + 1, 2)} to ${Math.min(totalPages, 20)}`
      })
      
      // Limit to reasonable number of pages
      const maxPages = Math.min(totalPages, 10) // Reasonable limit with 2k page size
      
      let consecutiveFailures = 0
      let maxConsecutiveFailures = 2 // Will be adjusted based on data collected
      let pageFetchStartTime: number
      
      // Start from the next page after what we got, or page 2 if uncertain
      let startPage = Math.max(pagination.page + 1, 2)
      
      // CRITICAL FIX: Always skip page 2 if we started from page 1
      // This prevents the known hanging issue
      if (pagination.page === 1) {
        startPage = 3 // Skip page 2 entirely
        console.log(`🔧 SKIPPING PAGE 2 - Starting from page 3 to avoid hanging issue`)
      }
      
      // SAFETY CHECK: If API returned page 2 when we requested page 1, 
      // it means we should start from page 3, not page 2
      if (pagination.page === 2 && firstPageOrders.length > 0) {
        startPage = 3
        console.log(`🔧 API returned page 2 for our page 1 request - adjusting start page to 3`)
      }
      
      console.log(`🚀 PAGINATION WILL START FROM PAGE ${startPage} (API returned page ${pagination.page})`)
      
      for (let page = startPage; page <= maxPages; page++) {
        console.log(`\n🚀 === STARTING PAGE ${page} FETCH ===`)
        
        // CIRCUIT BREAKER: Prevent infinite loops
        if (page > maxPages) {
          console.error(`🚫 CIRCUIT BREAKER: Page ${page} exceeds maximum allowed pages (${maxPages})`)
          console.log(`📊 Stopping with ${allOrders.length} orders to prevent infinite loop`)
          break
        }
        
        // HARD LIMIT: Stop if we have too many orders (likely stuck in loop)
        if (allOrders.length > 25000) {
          console.warn(`⚠️ Hard limit reached: ${allOrders.length} orders - stopping to prevent memory issues`)
          break
        }
        
        // DETECT STUCK PAGINATION: If we haven't added new orders in 3 pages
        const ordersBeforeFetch = allOrders.length
        
        // SAFETY CHECK: If we're trying to fetch page 2 and we started from page 1, skip
        if (page === 2 && pagination.page === 1 && startPage === 2) {
          console.log(`🔧 SKIPPING PAGE 2 - Known API issue where page 2 request hangs`)
          continue
        }
        
        pageFetchStartTime = Date.now()
        
        try {
          console.log(`📡 About to fetch page ${page} - Pre-fetch check`)
          console.log(`⏱️ Page ${page} fetch started at:`, new Date().toISOString())
          
          // Add extra debugging before the fetch
          console.log(`🔧 Page ${page} fetch parameters:`, {
            dateFrom,
            dateTo,
            page,
            pageSize: DEFAULT_PAGE_SIZE,
            consecutiveFailures,
            elapsedSinceStart: Date.now() - pageFetchStartTime
          })
          
          const pageData = await fetchSinglePage(dateFrom, dateTo, page, DEFAULT_PAGE_SIZE)
          
          console.log(`📦 Page ${page} fetch completed in ${Date.now() - pageFetchStartTime}ms`)
          console.log(`✅ Page ${page} response:`, {
            success: pageData.success,
            hasData: !!pageData.data,
            dataLength: pageData.data?.data?.length || 0,
            hasPagination: !!pageData.data?.pagination
          })
          
          if (pageData.success) {
            const pageOrders = pageData.data.data || []
            allOrders.push(...pageOrders)
            consecutiveFailures = 0 // Reset failure counter on success
            
            console.log(`✅ Page ${page} SUCCESS: Added ${pageOrders.length} orders`)
            
            // Validate current coverage
            const currentCompleteness = validateSevenDaysCoverage(allOrders, dateFrom, dateTo)
            
            console.log(`✅ Page ${page}/${totalPages}: ${pageOrders.length} orders (Total: ${allOrders.length}, Coverage: ${currentCompleteness.coverage}%)`)
            
            // Report progress
            onProgress?.({ 
              currentPage: page, 
              totalPages, 
              ordersLoaded: allOrders.length, 
              coverage: currentCompleteness.coverage 
            })
            
            // Early exit conditions for better performance
            if (currentCompleteness.isComplete && allOrders.length > 500) {
              console.log(`🎯 Complete 7-day coverage achieved early at page ${page} with ${allOrders.length} orders`)
              break
            } else if (currentCompleteness.coverage >= 95 && allOrders.length > 2000) {
              console.log(`🎯 Excellent coverage (${currentCompleteness.coverage}%) achieved early at page ${page}`)
              break  
            } else if (currentCompleteness.coverage >= 85 && allOrders.length > 5000) {
              console.log(`🎯 Good coverage (${currentCompleteness.coverage}%) with sufficient data at page ${page}`)
              break
            }
            
            // DETECT NO NEW DATA: If this page added very few orders
            const newOrdersAdded = allOrders.length - ordersBeforeFetch
            if (newOrdersAdded < 10 && page > 3) {
              console.log(`⚠️ Page ${page} only added ${newOrdersAdded} orders - likely reached end of data`)
              break
            }
            
            // CHECK FOR PAGINATION LOOP: If hasNext is false, stop
            if (pageData.data?.pagination && !pageData.data.pagination.hasNext) {
              console.log(`✅ Pagination complete - hasNext is false at page ${page}`)
              break
            }
            
          } else {
            // API returned success=false - this usually means no more data available
            console.log(`📄 Page ${page} returned success=false - likely no more data available`)
            console.log(`📄 Page ${page} response:`, pageData)
            
            // Check if this is just end of data rather than an actual error
            const isEndOfData = (
              !pageData.data || 
              (pageData.data && (!pageData.data.data || pageData.data.data.length === 0)) ||
              (pageData.error && (
                pageData.error.toLowerCase().includes('no data') ||
                pageData.error.toLowerCase().includes('no more') ||
                pageData.error.toLowerCase().includes('end of')
              )) ||
              (pageData.message && (
                pageData.message.toLowerCase().includes('no data') ||
                pageData.message.toLowerCase().includes('no more') ||
                pageData.message.toLowerCase().includes('end of')
              ))
            )
            
            if (isEndOfData) {
              console.log(`✅ Page ${page} reached end of available data - stopping pagination gracefully`)
              console.log(`📊 Final pagination summary: ${allOrders.length} orders collected across ${page-1} pages`)
              break
            }
            
            consecutiveFailures++
            
            // Adjust failure tolerance based on data collected
            if (allOrders.length > 10000) {
              maxConsecutiveFailures = 1 // Be less tolerant when we have good data
            } else if (allOrders.length > 5000) {
              maxConsecutiveFailures = 2 // Standard tolerance
            } else {
              maxConsecutiveFailures = 3 // More tolerant when we need more data
            }
            
            if (consecutiveFailures >= maxConsecutiveFailures) {
              console.warn(`⚠️ Too many consecutive failures (${consecutiveFailures}/${maxConsecutiveFailures}), stopping pagination at page ${page}`)
              console.log(`📊 Collected ${allOrders.length} orders before stopping due to failures`)
              break
            }
            
            console.log(`🔄 Continuing to next page despite page ${page} returning success=false`)
          }
        } catch (pageError) {
          consecutiveFailures++
          const fetchDuration = Date.now() - pageFetchStartTime
          
          console.error(`❌ Page ${page} EXCEPTION after ${fetchDuration}ms:`)
          console.error(`❌ Error type:`, pageError instanceof Error ? pageError.name : typeof pageError)
          console.error(`❌ Error message:`, pageError instanceof Error ? pageError.message : String(pageError))
          console.error(`❌ Full error:`, pageError)
          console.error(`❌ Consecutive failures: ${consecutiveFailures}/${maxConsecutiveFailures}`)
          
          if (consecutiveFailures >= maxConsecutiveFailures) {
            console.error(`🚫 PAGINATION STOPPED: Too many consecutive failures (${consecutiveFailures}), stopping at page ${page}`)
            console.error(`🚫 Will proceed with ${allOrders.length} orders from ${page-1} pages`)
            break
          }
          
          console.warn(`🔄 Continuing to next page despite page ${page} failure`)
        }
        
        console.log(`=== PAGE ${page} FETCH COMPLETED ===\n`)
      }
      
      console.log(`📊 PAGINATION SUMMARY:`)
      console.log(`📊 Total pages attempted: ${Math.min(maxPages, totalPages) - 1}`)
      console.log(`📊 Final consecutive failures: ${consecutiveFailures}`)
      console.log(`📊 Total orders collected: ${allOrders.length}`)
    } else {
      console.log(`📋 No additional pages to fetch (hasNext: ${pagination.hasNext}, totalPages: ${totalPages})`)
    }
    
    // Final completeness validation
    const finalCompleteness = validateSevenDaysCoverage(allOrders, dateFrom, dateTo)
    
    console.log(`🎯 COMPLETE 7-DAY FETCH FINISHED:`)
    console.log(`📊 Total Orders: ${allOrders.length}`)
    console.log(`📅 Coverage: ${finalCompleteness.coverage}% (${finalCompleteness.completeDays}/7 days)`)
    console.log(`⚠️ Missing Days: ${finalCompleteness.missingDays.join(', ') || 'None'}`)
    
    return { 
      orders: allOrders, 
      completeness: finalCompleteness 
    }
    
  } catch (error) {
    console.error('❌ Complete fetch failed:', error)
    return { 
      orders: [], 
      completeness: { coverage: 0, completeDays: 0, missingDays: [], isComplete: false } 
    }
  }
}

// Add progress tracking interface for loading states
export interface LoadingProgress {
  currentPage: number
  totalPages: number
  ordersLoaded: number
  coverage: number
  phase: 'fetching' | 'validating' | 'complete'
  message: string
}

// Fetch a single page with comprehensive debugging and timeout handling
async function fetchSinglePage(dateFrom: string, dateTo: string, page: number, pageSize: number) {
  const pageStartTime = Date.now()
  const proxyUrl = new URL('/api/orders/external', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  proxyUrl.searchParams.set('dateFrom', dateFrom)
  proxyUrl.searchParams.set('dateTo', dateTo)
  proxyUrl.searchParams.set('page', page.toString())
  proxyUrl.searchParams.set('pageSize', pageSize.toString())
  
  console.log(`🌐 [Page ${page}] FETCH START: ${proxyUrl.toString()}`)
  console.log(`🕒 [Page ${page}] Started at: ${new Date().toISOString()}`)
  
  // Create abort controller with reasonable timeout
  const controller = new AbortController()
  // AGGRESSIVE TIMEOUT for page 2 to prevent hanging
  const timeoutMs = page === 2 ? 5000 : 30000 // 5 seconds for page 2, 30 seconds for others
  
  const timeoutId = setTimeout(() => {
    console.error(`⏱️ [Page ${page}] TIMEOUT after ${timeoutMs}ms - aborting request`)
    console.error(`⏱️ [Page ${page}] Request was: ${proxyUrl.toString()}`)
    controller.abort()
  }, timeoutMs)
  
  try {
    console.log(`📡 [Page ${page}] About to call fetch()...`)
    
    const fetchPromise = fetch(proxyUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: controller.signal
    })
    
    console.log(`⏳ [Page ${page}] fetch() called, waiting for response...`)
    
    const response = await fetchPromise
    const fetchDuration = Date.now() - pageStartTime
    
    console.log(`📥 [Page ${page}] Response received after ${fetchDuration}ms`)
    console.log(`📊 [Page ${page}] Response status: ${response.status} ${response.statusText}`)
    console.log(`📋 [Page ${page}] Response headers:`, Object.fromEntries(response.headers.entries()))
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      console.error(`❌ [Page ${page}] HTTP ERROR: ${response.status} ${response.statusText}`)
      console.error(`❌ [Page ${page}] Request duration: ${fetchDuration}ms`)
      
      // Try to read error body
      try {
        const errorText = await response.text()
        console.error(`❌ [Page ${page}] Error body:`, errorText.substring(0, 500))
      } catch (bodyError) {
        console.error(`❌ [Page ${page}] Could not read error body:`, bodyError)
      }
      
      throw new Error(`HTTP ${response.status} - ${response.statusText}`)
    }
    
    console.log(`📄 [Page ${page}] About to parse JSON response...`)
    const data = await response.json()
    const totalDuration = Date.now() - pageStartTime
    
    console.log(`✅ [Page ${page}] JSON parsed successfully after ${totalDuration}ms total`)
    console.log(`📦 [Page ${page}] Response structure:`, {
      hasSuccess: 'success' in data,
      success: data.success,
      hasData: 'data' in data,
      dataType: typeof data.data,
      hasCorrelationId: 'correlationId' in data
    })
    
    return data
    
  } catch (error) {
    const errorDuration = Date.now() - pageStartTime
    clearTimeout(timeoutId)
    
    console.error(`❌ [Page ${page}] FETCH FAILED after ${errorDuration}ms`)
    
    if (error instanceof Error) {
      console.error(`❌ [Page ${page}] Error type: ${error.name}`)
      console.error(`❌ [Page ${page}] Error message: ${error.message}`)
      
      if (error.name === 'AbortError') {
        console.error(`⏱️ [Page ${page}] TIMEOUT CONFIRMED - Request was aborted`)
        console.error(`⏱️ [Page ${page}] URL was: ${proxyUrl.toString()}`)
        throw new Error(`Page ${page} timeout after ${timeoutMs}ms`)
      }
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error(`🌐 [Page ${page}] NETWORK ERROR - fetch failed`)
        throw new Error(`Page ${page} network error: ${error.message}`)
      }
    }
    
    console.error(`❌ [Page ${page}] Generic error:`, error)
    throw error
  }
}

// Direct API call to external service with smart pagination - now returns completeness data
export async function fetchOrdersFromAPI(
  dateFrom: string,
  dateTo: string,
  onProgress?: (progress: LoadingProgress) => void
): Promise<{ orders: ApiOrder[]; completeness: { coverage: number; completeDays: number; missingDays: string[]; isComplete: boolean } }> {
  try {
    // Implement smart pagination to fetch ALL orders
    const allOrders: ApiOrder[] = []
    let currentPage = 1
    let hasMorePages = true
    const pageSize = 5000 // Large page size for efficiency
    
    console.log(`🚀 Starting paginated fetch for ${dateFrom} to ${dateTo}`)
    
    while (hasMorePages) {
      const proxyUrl = new URL('/api/orders/external', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
      proxyUrl.searchParams.set('dateFrom', dateFrom)
      proxyUrl.searchParams.set('dateTo', dateTo)
      proxyUrl.searchParams.set('page', currentPage.toString())
      proxyUrl.searchParams.set('pageSize', pageSize.toString())
      
      console.log(`📄 Fetching page ${currentPage} (pageSize: ${pageSize})...`)
      
      try {
        const proxyResponse = await fetch(proxyUrl.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
        
        if (proxyResponse.ok) {
          const proxyData = await proxyResponse.json()
          
          // Handle response structure
          if (proxyData.success && proxyData.data) {
            const pageOrders = proxyData.data.data || []
            const pagination = proxyData.data.pagination || {}
            
            allOrders.push(...pageOrders)
            
            console.log(`✅ Page ${currentPage}: Retrieved ${pageOrders.length} orders (Total so far: ${allOrders.length})`)
            
            // Check if there are more pages
            hasMorePages = pagination.hasNext || false
            currentPage++
            
            // Safety check to prevent infinite loops
            if (currentPage > 50) {
              console.warn('⚠️ Reached maximum page limit (50), stopping pagination')
              hasMorePages = false
            }
          } else {
            console.log(`⚠️ Page ${currentPage} failed:`, proxyData.error || 'Unknown error')
            hasMorePages = false
          }
        } else {
          const errorText = await proxyResponse.text()
          console.error(`❌ Proxy API HTTP error on page ${currentPage}: ${proxyResponse.status} - ${errorText}`)
          hasMorePages = false
        }
      } catch (proxyError) {
        console.error(`❌ Proxy API failed on page ${currentPage}:`, proxyError)
        hasMorePages = false
      }
    }
    
    // Final completeness validation
    const finalCompleteness = validateSevenDaysCoverage(allOrders, dateFrom, dateTo)
    
    // Report final progress
    onProgress?.({
      currentPage: currentPage - 1,
      totalPages: currentPage - 1,
      ordersLoaded: allOrders.length,
      coverage: finalCompleteness.coverage,
      phase: 'complete',
      message: `Complete! ${allOrders.length} orders, ${finalCompleteness.coverage}% coverage`
    })
    
    console.log(`🎯 PAGINATION COMPLETE: Retrieved ${allOrders.length} total orders across ${currentPage - 1} pages`)
    console.log(`📅 7-Day Coverage: ${finalCompleteness.coverage}% (${finalCompleteness.completeDays}/7 days)`)
    
    return { orders: allOrders, completeness: finalCompleteness }
    
  } catch (error) {
    console.error('❌ All API attempts failed:', error)
    console.log('⚠️ No fallback data - production safety - returning empty array')
    
    // Log to Sentry
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: { 
          component: 'executive-dashboard',
          method: 'fetchOrdersFromAPI',
          dateFrom,
          dateTo
        },
        level: 'error'
      })
    }
    
    return { 
      orders: [], 
      completeness: { coverage: 0, completeDays: 0, missingDays: [], isComplete: false } 
    }
  }
}

// Get default date range (7 days)
export function getDefaultDateRange(): { dateFrom: string; dateTo: string } {
  const today = getGMT7Time()
  const sevenDaysAgo = getGMT7Time()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6) // 6 days ago + today = 7 days

  return {
    dateFrom: safeToISOString(sevenDaysAgo, undefined, 'getDefaultDateRange:sevenDaysAgo').split('T')[0],
    dateTo: safeToISOString(today, undefined, 'getDefaultDateRange:today').split('T')[0]
  }
}

// Validate 7-day data coverage
export function validateSevenDaysCoverage(
  orders: ApiOrder[],
  dateFrom: string,
  dateTo: string
): {
  coverage: number
  completeDays: number
  missingDays: string[]
  isComplete: boolean
} {
  const ordersByDate = new Map<string, number>()

  // Count orders by date with safe date validation
  orders.forEach(order => {
    if (order.order_date) {
      const dateObj = new Date(order.order_date)
      // Only process valid dates
      if (!isNaN(dateObj.getTime())) {
        const date = safeToISOString(dateObj, undefined, `validateSevenDaysCoverage:orderId=${order.id}`).split('T')[0]
        ordersByDate.set(date, (ordersByDate.get(date) || 0) + 1)
      } else {
        console.warn(`⚠️ Invalid date detected`, { orderId: order.id, dateField: 'order_date', value: order.order_date })
      }
    }
  })

  // Check each day in range with safe date handling
  const start = new Date(dateFrom)
  const end = new Date(dateTo)
  const missingDays: string[] = []
  let completeDays = 0

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    // Validate date object before converting to ISO string
    if (!isNaN(d.getTime())) {
      const dateStr = safeToISOString(d, undefined, 'validateSevenDaysCoverage:loopDate').split('T')[0]
      if (ordersByDate.has(dateStr) && ordersByDate.get(dateStr)! > 0) {
        completeDays++
      } else {
        missingDays.push(dateStr)
      }
    }
  }

  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const coverage = Math.round((completeDays / totalDays) * 100)

  return {
    coverage,
    completeDays,
    missingDays,
    isComplete: completeDays === totalDays
  }
}

// Process orders for critical alerts - FILTER TO TODAY'S ORDERS ONLY (GMT+7)
export function processOrderAlerts(orders: ApiOrder[]): {
  orderAlerts: OrderAlert[]
  approachingSla: OrderAlert[]
  criticalAlerts: OrderAlert[]
} {
  console.log(`🚨 Processing ${orders.length} orders for TODAY's alerts...`)

  // Filter to TODAY'S ORDERS ONLY for alerts - Using GMT+7 timezone
  const today = getGMT7Time()
  const todayStr = safeToISOString(today, undefined, 'processOrderAlerts:today').split('T')[0] // YYYY-MM-DD format in GMT+7

  console.log(`📅 TODAY (GMT+7): ${todayStr}`)

  const todaysOrders = orders.filter(order => {
    // Skip orders with missing or invalid dates
    if (!order.order_date) {
      console.warn(`⚠️ Invalid date detected`, { orderId: order.id, dateField: 'order_date', value: order.order_date })
      return false
    }

    // Validate order date before processing
    const orderDate = new Date(order.order_date)
    if (isNaN(orderDate.getTime())) {
      console.warn(`⚠️ Invalid date detected`, { orderId: order.id, dateField: 'order_date', value: order.order_date })
      return false
    }

    // Convert order date to GMT+7 for proper comparison
    const orderGMT7 = new Date(orderDate.getTime() + (7 * 60 * 60 * 1000)) // Add 7 hours for GMT+7
    const orderDateStr = safeToISOString(orderGMT7, undefined, `processOrderAlerts:orderId=${order.id}`).split('T')[0]

    console.log(`📋 Order ${order.id}: ${order.order_date} -> GMT+7: ${orderDateStr} (matches today: ${orderDateStr === todayStr})`)

    return orderDateStr === todayStr
  })

  console.log(`📅 TODAY's orders for alerts: ${todaysOrders.length}/${orders.length} (${todayStr})`)

  // Apply SLA filtering to today's orders only
  const slaBreaches = filterSLABreach(todaysOrders)
  const approachingSLA = filterApproachingSLA(todaysOrders)

  console.log(`🚨 TODAY's SLA alerts: ${slaBreaches.length} breaches, ${approachingSLA.length} approaching`)

  // Map orders to OrderAlert format
  const mapToOrderAlert = (order: ApiOrder, type: 'breach' | 'approaching'): OrderAlert => {
    const targetSeconds = order.sla_info?.target_minutes || 300
    const elapsedSeconds = order.sla_info?.elapsed_minutes || 0
    const remainingSeconds = targetSeconds - elapsedSeconds

    return {
      id: order.id,
      order_number: order.order_no || 'N/A',
      customer_name: order.customer?.name || 'Unknown Customer',
      channel: order.channel || 'Unknown',
      location: order.metadata?.store_name || 'Unknown Location',
      remaining: type === 'approaching' ? Math.max(0, remainingSeconds) : undefined,
      overTime: type === 'breach' ? Math.max(0, elapsedSeconds - targetSeconds) : undefined,
      target_minutes: targetSeconds,
      elapsed_minutes: elapsedSeconds,
      type
    }
  }

  // Type assertion: The filtered orders from sla-utils are still ApiOrder objects
  // since we passed ApiOrder[] to the filter functions
  const orderAlerts = slaBreaches.map(order => mapToOrderAlert(order as ApiOrder, 'breach'))
  const approachingAlerts = approachingSLA.map(order => mapToOrderAlert(order as ApiOrder, 'approaching'))

  return {
    orderAlerts,
    approachingSla: approachingAlerts,
    criticalAlerts: orderAlerts.slice(0, 5) // Top 5 critical alerts from today
  }
}
