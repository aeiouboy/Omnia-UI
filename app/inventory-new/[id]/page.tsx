/**
 * Inventory Product Detail Page
 *
 * Dynamic route page for displaying detailed information about a single inventory item.
 * Route: /inventory/[id]
 */

import { notFound } from "next/navigation"
import { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard-shell"
import { InventoryDetailView } from "@/components/inventory-detail-view"
import {
  fetchInventoryItemById,
  fetchStockHistory,
  fetchRecentTransactions,
} from "@/lib/inventory-service"

interface ProductDetailPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    store?: string
  }>
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const item = await fetchInventoryItemById(id)

  if (!item) {
    return {
      title: "Product Not Found",
    }
  }

  return {
    title: `${item.productName} | Inventory`,
    description: `View details for ${item.productName} in ${item.storeName}`,
  }
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: ProductDetailPageProps) {
  const { id } = await params
  const { store } = await searchParams

  // Fetch product data
  const item = await fetchInventoryItemById(id)

  // If product not found, show 404
  if (!item) {
    notFound()
  }

  // Fetch stock history and transactions in parallel
  const [stockHistory, transactions] = await Promise.all([
    fetchStockHistory(item.id),
    fetchRecentTransactions(item.id, 10),
  ])

  return (
    <DashboardShell>
      <InventoryDetailView
        item={item}
        stockHistory={stockHistory}
        transactions={transactions}
        storeContext={store}
      />
    </DashboardShell>
  )
}
