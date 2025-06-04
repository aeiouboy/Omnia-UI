import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Edit, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InventoryService } from "@/lib/inventory-service"

interface ProductDetailPageProps {
  params: {
    sku: string
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { sku } = params
  const product = await InventoryService.getProductByBarcode(sku)

  if (!product) {
    notFound()
  }

  // ดึงข้อมูลสินค้าคงคลังและสินค้าคงคลังตามสถานที่
  const inventory = await InventoryService.getProductInventory(product.id)
  const locationInventory = await InventoryService.getInventoryByLocation(product.id)

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/inventory">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Product Details</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                {product.photo && product.photo.length > 0 ? (
                  <div className="relative aspect-square overflow-hidden rounded-md">
                    <Image
                      src={product.photo[0] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              <div className="w-full md:w-2/3 space-y-4">
                <div>
                  <p className="text-sm text-gray-500">SKU: {product.barcode}</p>
                  <h2 className="text-2xl font-bold">{product.name}</h2>
                  <p className="text-lg text-gray-700">{product.description}</p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-2xl font-bold">฿{product.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Weight</p>
                    <p className="text-lg">
                      {product.weight_value} {product.weight_unit}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p>{product.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Subcategory</p>
                    <p>{product.subcategory}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="product-details">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="product-details">Product Details</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
            </TabsList>
            <TabsContent value="product-details" className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Product Information</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-gray-500">Barcode</p>
                    <p>{product.barcode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p>{product.available_status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Supplier</p>
                    <p>{product.supplier_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p>{new Date(product.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Description</h3>
                <p className="mt-2">{product.description}</p>
              </div>
            </TabsContent>
            <TabsContent value="inventory" className="bg-white rounded-lg border shadow-sm p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Inventory Summary</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Available</p>
                      <p className="text-2xl font-bold">{inventory.available}</p>
                      <p className="text-xs text-gray-500">units</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Reserved</p>
                      <p className="text-2xl font-bold">{inventory.reserved}</p>
                      <p className="text-xs text-gray-500">units</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Safety Stock</p>
                      <p className="text-2xl font-bold">{inventory.safety_stock}</p>
                      <p className="text-xs text-gray-500">units</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Inventory Trend</h3>
                    <Button variant="outline" size="sm">
                      <span className="mr-2">View Analytics</span>
                    </Button>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg h-48 flex items-center justify-center">
                    <p className="text-gray-500">Inventory trend chart will be displayed here</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Inventory Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto py-3 justify-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"></path>
                        <path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"></path>
                        <path d="M4 12h16"></path>
                        <path d="M9 12v4"></path>
                        <path d="M15 12v4"></path>
                        <path d="M9 4v4"></path>
                        <path d="M15 4v4"></path>
                      </svg>
                      Create Purchase Order
                    </Button>
                    <Button variant="outline" className="h-auto py-3 justify-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="M10 3H6a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V9L14 3H6Z"></path>
                        <path d="M14 3v6h6"></path>
                        <path d="m16 13-3.5 3.5-2-2L8 17"></path>
                      </svg>
                      Transfer Inventory
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="locations" className="bg-white rounded-lg border shadow-sm p-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Location Inventory</h3>
                <div className="space-y-4">
                  {locationInventory.length === 0 ? (
                    <p className="text-gray-500">No location inventory data available</p>
                  ) : (
                    locationInventory.map((location) => (
                      <div key={location.location_id} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{location.location_name}</h4>
                              <p className="text-sm text-gray-500">Location ID: {location.location_code}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              View Location Details
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Available</p>
                            <p className="text-xl font-bold">{location.available}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Reserved</p>
                            <p className="text-xl font-bold">{location.reserved}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Inventory Status</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Current Stock</p>
                <p className="text-2xl font-bold">{product.inventory_level}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reorder Point</p>
                <p className="text-lg">{product.reorder_point}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.inventory_status === "In Stock"
                      ? "bg-green-100 text-green-800"
                      : product.inventory_status === "Low Stock"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.inventory_status}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Restock</p>
                <p>{new Date(product.last_restock_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button className="w-full justify-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"></path>
                  <path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"></path>
                  <path d="M4 12h16"></path>
                  <path d="M9 12v4"></path>
                  <path d="M15 12v4"></path>
                  <path d="M9 4v4"></path>
                  <path d="M15 4v4"></path>
                </svg>
                Create Purchase Order
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Edit className="mr-2 h-4 w-4" />
                Edit Product
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Printer className="mr-2 h-4 w-4" />
                Print Barcode
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
