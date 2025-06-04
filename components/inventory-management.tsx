"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpDown, Search, RefreshCw, Loader2, AlertTriangle, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InventoryService, type ProductWithInventory, type InventorySummary } from "@/lib/inventory-service"

export function InventoryManagement() {
  const [products, setProducts] = useState<ProductWithInventory[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductWithInventory[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<keyof ProductWithInventory>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingMockData, setUsingMockData] = useState(true) // เปลี่ยนเป็น true เพราะเรารู้ว่าใช้ข้อมูล mock

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        console.log("Loading inventory data...")

        // ดึงข้อมูลสินค้าและสรุปสินค้าคงคลัง
        const [productsData, summaryData] = await Promise.all([
          InventoryService.getProducts(),
          InventoryService.getInventorySummary(),
        ])

        console.log(`Loaded ${productsData.length} products`)

        setProducts(productsData)
        setFilteredProducts(productsData)
        setInventorySummary(summaryData)
        setUsingMockData(true) // ใช้ข้อมูล mock
      } catch (err) {
        console.error("Failed to load inventory data:", err)
        setError("Failed to load inventory data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    // Filter products based on search query
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.subcategory.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    // Sort products
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })

    setFilteredProducts(sorted)
  }, [searchQuery, products, sortField, sortDirection])

  const handleSort = (field: keyof ProductWithInventory) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const refreshData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log("Refreshing inventory data...")

      // ดึงข้อมูลสินค้าและสรุปสินค้าคงคลัง
      const [productsData, summaryData] = await Promise.all([
        InventoryService.getProducts(),
        InventoryService.getInventorySummary(),
      ])

      console.log(`Refreshed ${productsData.length} products`)

      setProducts(productsData)
      setFilteredProducts(productsData)
      setInventorySummary(summaryData)
      setUsingMockData(true) // ใช้ข้อมูล mock
    } catch (err) {
      console.error("Failed to refresh inventory data:", err)
      setError("Failed to refresh inventory data. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-500/20 text-green-700 hover:bg-green-500/30"
      case "Low Stock":
        return "bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30"
      case "Out of Stock":
        return "bg-red-500/20 text-red-700 hover:bg-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-700 hover:bg-gray-500/30"
    }
  }

  if (isLoading && !products.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-lg text-muted-foreground">Loading inventory data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {usingMockData && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Using sample data</AlertTitle>
          <AlertDescription>
            The system is currently using sample data. This may be because the database tables have not been set up yet
            or there is no data in the database.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventorySummary?.total_products || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{inventorySummary?.low_stock_count || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inventorySummary?.out_of_stock_count || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{inventorySummary?.total_inventory_value.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
            <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2 hidden md:inline">Refresh</span>
            </Button>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="w-[150px] md:w-[250px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Image</TableHead>
                    <TableHead className="w-[250px]">
                      <Button variant="ghost" size="sm" onClick={() => handleSort("name")}>
                        Product Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => handleSort("barcode")}>
                        Barcode
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      <Button variant="ghost" size="sm" onClick={() => handleSort("subcategory")}>
                        Category
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleSort("inventory_level")}>
                        Stock
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleSort("price")}>
                        Price
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="ml-2">Loading products...</span>
                          </div>
                        ) : (
                          "No products found"
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          {product.photo && product.photo.length > 0 ? (
                            <div className="relative h-10 w-10 overflow-hidden rounded-md">
                              <Image
                                src={product.photo[0] || "/placeholder.svg"}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <Link href={`/inventory/${product.barcode}`} className="hover:underline">
                            {product.name}
                          </Link>
                        </TableCell>
                        <TableCell>{product.barcode}</TableCell>
                        <TableCell className="hidden md:table-cell">{product.subcategory}</TableCell>
                        <TableCell className="text-right">
                          {product.inventory_level} / {product.reorder_point}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge className={getStatusColor(product.inventory_status)}>{product.inventory_status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">฿{product.price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between py-4">
              <div className="text-sm text-muted-foreground">
                Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
              </div>
              <div className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Image</TableHead>
                    <TableHead className="w-[250px]">Product Name</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="text-right">Stock Level</TableHead>
                    <TableHead className="hidden md:table-cell">Reorder Point</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.filter((p) => p.inventory_status === "Low Stock").length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No low stock products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts
                      .filter((p) => p.inventory_status === "Low Stock")
                      .map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            {product.photo && product.photo.length > 0 ? (
                              <div className="relative h-10 w-10 overflow-hidden rounded-md">
                                <Image
                                  src={product.photo[0] || "/placeholder.svg"}
                                  alt={product.name}
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            <Link href={`/inventory/${product.barcode}`} className="hover:underline">
                              {product.name}
                            </Link>
                          </TableCell>
                          <TableCell>{product.barcode}</TableCell>
                          <TableCell className="hidden md:table-cell">{product.subcategory}</TableCell>
                          <TableCell className="text-right text-yellow-600 font-medium">
                            {product.inventory_level}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{product.reorder_point}</TableCell>
                          <TableCell className="text-right">฿{product.price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="out-of-stock" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Image</TableHead>
                    <TableHead className="w-[250px]">Product Name</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="text-right">Last Restock</TableHead>
                    <TableHead className="hidden md:table-cell">Reorder Point</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.filter((p) => p.inventory_status === "Out of Stock").length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No out of stock products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts
                      .filter((p) => p.inventory_status === "Out of Stock")
                      .map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            {product.photo && product.photo.length > 0 ? (
                              <div className="relative h-10 w-10 overflow-hidden rounded-md">
                                <Image
                                  src={product.photo[0] || "/placeholder.svg"}
                                  alt={product.name}
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            <Link href={`/inventory/${product.barcode}`} className="hover:underline">
                              {product.name}
                            </Link>
                          </TableCell>
                          <TableCell>{product.barcode}</TableCell>
                          <TableCell className="hidden md:table-cell">{product.subcategory}</TableCell>
                          <TableCell className="text-right">
                            {new Date(product.last_restock_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{product.reorder_point}</TableCell>
                          <TableCell className="text-right">฿{product.price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
