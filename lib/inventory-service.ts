export type Product = {
  id: number
  barcode: string
  name: string
  description: string
  category: string
  category_id: string
  subcategory: string
  subcategory_id: string
  price: number
  photo: string[]
  weight_value: number
  weight_unit: string
  available_status: string
  created_at: string
  updated_at: string
}

export type ProductWithInventory = Product & {
  inventory_level: number
  reorder_point: number
  inventory_status: "In Stock" | "Low Stock" | "Out of Stock"
  supplier_name: string
  last_restock_date: string
}

export type InventoryMovement = {
  id: number
  product_id: number
  product_name: string
  location_id: number
  location_name: string
  movement_type: "Inbound" | "Outbound" | "Transfer" | "Adjustment"
  quantity: number
  timestamp: string
  reference: string
}

export type InventorySummary = {
  total_products: number
  low_stock_count: number
  out_of_stock_count: number
  total_inventory_value: number
}

export type ProductInventory = {
  available: number
  reserved: number
  safety_stock: number
}

export type LocationInventory = {
  location_id: number
  location_name: string
  location_code: string
  available: number
  reserved: number
}

// ข้อมูล mock สำหรับใช้ในกรณีที่ยังไม่มีข้อมูลใน Supabase
const mockProducts: ProductWithInventory[] = [
  // ผักและผลไม้
  {
    id: 1,
    barcode: "0218852000004",
    name: "องุ่นเขียวไม่มีเมล็ดออสเตรเลีย500กรัม 500กรัม",
    description:
      "AUS Green Seedless Grape 500 g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด",
    category: "Fresh Produce ผักและผลไม้",
    category_id: "THITEDP20200707052000016649",
    subcategory: "ผลไม้ Fruits",
    subcategory_id: "THITEDP20200707102846014313",
    price: 499,
    photo: ["https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0218852000004_01.jpg"],
    weight_value: 500,
    weight_unit: "g",
    available_status: "AVAILABLE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_level: 120,
    reorder_point: 30,
    inventory_status: "In Stock",
    supplier_name: "Tops Fine Food",
    last_restock_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    barcode: "0218244000001",
    name: "มายช้อยส์ฝรั่งกิมจู 1000กรัม",
    description:
      "My Chioce Gimju Guava 1000g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด",
    category: "Fresh Produce ผักและผลไม้",
    category_id: "THITEDP20200707052000016649",
    subcategory: "ผลไม้ Fruits",
    subcategory_id: "THITEDP20200707102846014313",
    price: 89,
    photo: ["https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0218244000001_01.jpg"],
    weight_value: 1000,
    weight_unit: "g",
    available_status: "AVAILABLE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_level: 50,
    reorder_point: 20,
    inventory_status: "In Stock",
    supplier_name: "Tops Fine Food",
    last_restock_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    barcode: "0218317000006",
    name: "มายช้อยส์แตงกวาญี่ปุ่นเกรดพิเศษ 1000กรัม",
    description:
      "My Choice Japanese Cucumber Special 1000g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด",
    category: "Fresh Produce ผักและผลไม้",
    category_id: "THITEDP20200707052000016649",
    subcategory: "ผัก Vegetables",
    subcategory_id: "THITEDP20200707102841015625",
    price: 139,
    photo: ["https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0218317000006_01.jpg"],
    weight_value: 1000,
    weight_unit: "g",
    available_status: "AVAILABLE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_level: 40,
    reorder_point: 15,
    inventory_status: "In Stock",
    supplier_name: "Tops Fine Food",
    last_restock_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // เพิ่มสินค้าใหม่ - ผักและผลไม้
  {
    id: 4,
    barcode: "0216066000001",
    name: "มายช้อยส์ฟักบัตเตอร์นัท",
    description: "My Choice Butter Nut Squash",
    category: "Fresh Produce ผักและผลไม้",
    category_id: "THITEDP20200707052000016649",
    subcategory: "ผัก Vegetables",
    subcategory_id: "THITEDP20200707102841015625",
    price: 105,
    photo: ["https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0216066000001_01.jpg"],
    weight_value: 500,
    weight_unit: "g",
    available_status: "AVAILABLE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_level: 35,
    reorder_point: 10,
    inventory_status: "In Stock",
    supplier_name: "Tops Fine Food",
    last_restock_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    barcode: "0217040000000",
    name: "มายช้อยส์ผักกาดขาวปลี",
    description: "My Choice White Cabbage",
    category: "Fresh Produce ผักและผลไม้",
    category_id: "THITEDP20200707052000016649",
    subcategory: "ผัก Vegetables",
    subcategory_id: "THITEDP20200707102841015625",
    price: 59,
    photo: ["https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0217040000000_01.jpg"],
    weight_value: 500,
    weight_unit: "g",
    available_status: "AVAILABLE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_level: 8,
    reorder_point: 10,
    inventory_status: "Low Stock",
    supplier_name: "Tops Fine Food",
    last_restock_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 6,
    barcode: "0217058000009",
    name: "บร็อคโคลี่",
    description: "Broccoli",
    category: "Fresh Produce ผักและผลไม้",
    category_id: "THITEDP20200707052000016649",
    subcategory: "ผัก Vegetables",
    subcategory_id: "THITEDP20200707102841015625",
    price: 99,
    photo: ["https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0217058000009_01.jpg"],
    weight_value: 500,
    weight_unit: "g",
    available_status: "AVAILABLE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_level: 0,
    reorder_point: 15,
    inventory_status: "Out of Stock",
    supplier_name: "Tops Fine Food",
    last_restock_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 7,
    barcode: "0217393000009",
    name: "แครอทออสเตรเลีย",
    description: "Australian Carrot",
    category: "Fresh Produce ผักและผลไม้",
    category_id: "THITEDP20200707052000016649",
    subcategory: "ผัก Vegetables",
    subcategory_id: "THITEDP20200707102841015625",
    price: 59,
    photo: ["https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0217393000009_01.jpg"],
    weight_value: 500,
    weight_unit: "g",
    available_status: "AVAILABLE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_level: 45,
    reorder_point: 15,
    inventory_status: "In Stock",
    supplier_name: "Tops Fine Food",
    last_restock_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 8,
    barcode: "0217835000000",
    name: "ดอกกะหล่ำ",
    description: "Cauliflower",
    category: "Fresh Produce ผักและผลไม้",
    category_id: "THITEDP20200707052000016649",
    subcategory: "ผัก Vegetables",
    subcategory_id: "THITEDP20200707102841015625",
    price: 109,
    photo: ["https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0217835000000_01.jpg"],
    weight_value: 500,
    weight_unit: "g",
    available_status: "AVAILABLE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_level: 25,
    reorder_point: 10,
    inventory_status: "In Stock",
    supplier_name: "Tops Fine Food",
    last_restock_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 9,
    barcode: "0218297000003",
    name: "มายช้อยส์ไชเท้าญึ่ปุ่นไดคอนเกรดพิเศษ",
    description: "My Choice Japanese Radish Special",
    category: "Fresh Produce ผักและผลไม้",
    category_id: "THITEDP20200707052000016649",
    subcategory: "ผัก Vegetables",
    subcategory_id: "THITEDP20200707102841015625",
    price: 95,
    photo: ["https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0218297000003_01.jpg"],
    weight_value: 500,
    weight_unit: "g",
    available_status: "AVAILABLE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_level: 12,
    reorder_point: 15,
    inventory_status: "Low Stock",
    supplier_name: "Tops Fine Food",
    last_restock_date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 11,
    barcode: "0218062000009",
    name: "ลิ้นจี่เวียดนาม 1 กิโลกรัม",
    description:
      "Lynchee Vietnam น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด",
    category: "Fresh Produce ผักและผลไม้",
    category_id: "THITEDP20200707052000016649",
    subcategory: "ผลไม้ Fruits",
    subcategory_id: "THITEDP20200707102846014313",
    price: 399,
    photo: ["https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0218062000009_01_2024061912122101.jpg"],
    weight_value: 1,
    weight_unit: "kg",
    available_status: "AVAILABLE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_level: 15,
    reorder_point: 5,
    inventory_status: "In Stock",
    supplier_name: "Tops Fine Food",
    last_restock_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // เพิ่มสินค้าใหม่ - เนื้อสัตว์และอาหารทะเล
  {
    id: 12,
    barcode: "0214977000004",
    name: "ทีจีเอ็มหมูอบน้ำผึ้ง250กรัม 250กรัม",
    description:
      "TGM Honey Baked Ham 250g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด",
    category: "Meat and Seafood เนื้อสัตว์และอาหารทะเล",
    category_id: "THITEDP20200707052021018653",
    subcategory: "เนื้อหมู Pork",
    subcategory_id: "THITEDP20200707102913013692",
    price: 850,
    photo: ["https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0214977000004_01.jpg"],
    weight_value: 250,
    weight_unit: "g",
    available_status: "AVAILABLE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_level: 20,
    reorder_point: 10,
    inventory_status: "In Stock",
    supplier_name: "Tops Fine Food",
    last_restock_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 13,
    barcode: "0215017000008",
    name: "เจมส์เดอะบุชเชอร์น่องแกะออสเตรเลีย500กรัม 500กรัม",
    description:
      "James The Butcher Australian Lamb Shank 500g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด",
    category: "Meat and Seafood เนื้อสัตว์และอาหารทะเล",
    category_id: "THITEDP20200707052021018653",
    subcategory: "เนื้อแกะ Lamb",
    subcategory_id: "THITEDP20200707102906010142",
    price: 700,
    photo: ["https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0215017000008_01.jpg"],
    weight_value: 500,
    weight_unit: "g",
    available_status: "AVAILABLE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_level: 5,
    reorder_point: 8,
    inventory_status: "Low Stock",
    supplier_name: "Tops Fine Food",
    last_restock_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 14,
    barcode: "0215902000007",
    name: "กุ้งก้ามเกลี้ยง 18ถึง21ตัวต่อกก500กรัม 500กรัม",
    description:
      "Giant Water Prawn 500g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด",
    category: "Meat and Seafood เนื้อสัตว์และอาหารทะเล",
    category_id: "THITEDP20200707052021018653",
    subcategory: "อาหารทะเล Seafood",
    subcategory_id: "THITEDP20200707102925010693",
    price: 580,
    photo: ["https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0215902000007_01.jpg"],
    weight_value: 500,
    weight_unit: "g",
    available_status: "AVAILABLE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_level: 0,
    reorder_point: 10,
    inventory_status: "Out of Stock",
    supplier_name: "Tops Fine Food",
    last_restock_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 15,
    barcode: "0213530000000",
    name: "ท็อปส์ปีกกลางไก่500กรัม 500กรัม",
    description:
      "Tops Chicken Middle Wing 500g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด",
    category: "Meat and Seafood เนื้อสัตว์และอาหารทะเล",
    category_id: "THITEDP20200707052021018653",
    subcategory: "เนื้อไก่ Chicken",
    subcategory_id: "THITEDP20200707102931012989",
    price: 189,
    photo: ["https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0213530000000_01.jpg"],
    weight_value: 500,
    weight_unit: "g",
    available_status: "AVAILABLE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_level: 40,
    reorder_point: 15,
    inventory_status: "In Stock",
    supplier_name: "Tops Fine Food",
    last_restock_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 16,
    barcode: "0213893000006",
    name: "ท็อปส์หมูอนามัยบดไขมัน 10เปอร์เซ็นต์ S 250กรัม",
    description:
      "Tops Hygienic Pork for Minced Fat 10percent S 250g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด",
    category: "Meat and Seafood เนื้อสัตว์และอาหารทะเล",
    category_id: "THITEDP20200707052021018653",
    subcategory: "เนื้อหมู Pork",
    subcategory_id: "THITEDP20200707102913013692",
    price: 205,
    photo: ["https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0213893000006_01.jpg"],
    weight_value: 250,
    weight_unit: "g",
    available_status: "AVAILABLE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_level: 25,
    reorder_point: 10,
    inventory_status: "In Stock",
    supplier_name: "Tops Fine Food",
    last_restock_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 17,
    barcode: "0219121000008",
    name: "ท็อปส์ซี่โครงหมูอนามัยสไลซ์ S 500กรัม",
    description:
      "Tops Hygienic Pork Spare Rib Slice S 500g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด",
    category: "Meat and Seafood เนื้อสัตว์และอาหารทะเล",
    category_id: "THITEDP20200707052021018653",
    subcategory: "เนื้อหมู Pork",
    subcategory_id: "THITEDP20200707102913013692",
    price: 210,
    photo: ["https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0219121000008_01.jpg"],
    weight_value: 500,
    weight_unit: "g",
    available_status: "AVAILABLE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_level: 18,
    reorder_point: 20,
    inventory_status: "Low Stock",
    supplier_name: "Tops Fine Food",
    last_restock_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 18,
    barcode: "0211463000005",
    name: "ท็อปส์อกไก่ลอกหนังอนามัย S 500กรัม",
    description:
      "Tops Hygienic Chicken Breast Skinless S 500g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด",
    category: "Meat and Seafood เนื้อสัตว์และอาหารทะเล",
    category_id: "THITEDP20200707052021018653",
    subcategory: "เนื้อไก่ Chicken",
    subcategory_id: "THITEDP20200707102931012989",
    price: 149,
    photo: ["https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0211463000005_01.jpg"],
    weight_value: 500,
    weight_unit: "g",
    available_status: "AVAILABLE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_level: 60,
    reorder_point: 20,
    inventory_status: "In Stock",
    supplier_name: "Tops Fine Food",
    last_restock_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 19,
    barcode: "0213550000004",
    name: "ท็อปส์สันในไก่อนามัย S 500กรัม",
    description:
      "Tops Hygienic Chicken Fillet S 500g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด",
    category: "Meat and Seafood เนื้อสัตว์และอาหารทะเล",
    category_id: "THITEDP20200707052021018653",
    subcategory: "เนื้อไก่ Chicken",
    subcategory_id: "THITEDP20200707102931012989",
    price: 120,
    photo: ["https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0213550000004_01.jpg"],
    weight_value: 250,
    weight_unit: "g",
    available_status: "AVAILABLE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_level: 0,
    reorder_point: 15,
    inventory_status: "Out of Stock",
    supplier_name: "Tops Fine Food",
    last_restock_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 20,
    barcode: "0213559000005",
    name: "ท็อปส์ปีกกลางไก่อนามัย S 500กรัม",
    description:
      "Tops Hygienic Chicken Middle Wing S 500g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด",
    category: "Meat and Seafood เนื้อสัตว์และอาหารทะเล",
    category_id: "THITEDP20200707052021018653",
    subcategory: "เนื้อไก่ Chicken",
    subcategory_id: "THITEDP20200707102931012989",
    price: 199,
    photo: ["https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0213559000005_01.jpg"],
    weight_value: 500,
    weight_unit: "g",
    available_status: "AVAILABLE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_level: 30,
    reorder_point: 15,
    inventory_status: "In Stock",
    supplier_name: "Tops Fine Food",
    last_restock_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 21,
    barcode: "0213906000009",
    name: "ท็อปส์สันคอหมูอนามัย S 500กรัม",
    description:
      "Tops Hygienic Pork Collar S 500g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด",
    category: "Meat and Seafood เนื้อสัตว์และอาหารทะเล",
    category_id: "THITEDP20200707052021018653",
    subcategory: "เนื้อหมู Pork",
    subcategory_id: "THITEDP20200707102913013692",
    price: 285,
    photo: ["https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0213906000009_01.jpg"],
    weight_value: 250,
    weight_unit: "g",
    available_status: "AVAILABLE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_level: 15,
    reorder_point: 10,
    inventory_status: "In Stock",
    supplier_name: "Tops Fine Food",
    last_restock_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 22,
    barcode: "0213894000005",
    name: "ท็อปส์หมูสามชั้นอนามัย S 500กรัม",
    description:
      "Tops Hygienic Pork Belly S 500g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด",
    category: "Meat and Seafood เนื้อสัตว์และอาหารทะเล",
    category_id: "THITEDP20200707052021018653",
    subcategory: "เนื้อหมู Pork",
    subcategory_id: "THITEDP20200707102913013692",
    price: 290,
    photo: ["https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0213894000005_01.jpg"],
    weight_value: 250,
    weight_unit: "g",
    available_status: "AVAILABLE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_level: 8,
    reorder_point: 10,
    inventory_status: "Low Stock",
    supplier_name: "Tops Fine Food",
    last_restock_date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 23,
    barcode: "0210939000006",
    name: "เนื้อล้วนออสเตรเลีย 500กรัม",
    description:
      "Australian Grass Fed Lean Meat 500g น้ำหนักอาจมีการเปลี่ยนแปลงขึ้นลงอยู่ระหว่าง 10-20% และราคาจะเปลี่ยนแปลงตามน้ำหนักที่เปลี่ยนไป ซึ่งอาจส่งผลกระทบต่อราคารวมทั้งออเดอร์ และ การใช้โค้ดส่วนลด",
    category: "Meat and Seafood เนื้อสัตว์และอาหารทะเล",
    category_id: "THITEDP20200707052021018653",
    subcategory: "เนื้อวัว Beef",
    subcategory_id: "THITEDP20200707102900010597",
    price: 750,
    photo: ["https://cgcmsstcontentprd.blob.core.windows.net/product-pmp/cfg/0210939000006_01.jpg"],
    weight_value: 500,
    weight_unit: "g",
    available_status: "AVAILABLE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_level: 10,
    reorder_point: 5,
    inventory_status: "In Stock",
    supplier_name: "Tops Fine Food",
    last_restock_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export class InventoryService {
  // ฟังก์ชันสำหรับดึงข้อมูลสินค้าจาก Supabase
  static async getProducts(): Promise<ProductWithInventory[]> {
    try {
      console.log("Fetching products from Supabase...")

      // ใช้ข้อมูล mock แทนการเรียกใช้ Supabase
      return mockProducts
    } catch (error) {
      console.error("Error in getProducts:", error)
      console.log("Using mock data instead")
      return mockProducts
    }
  }

  // ฟังก์ชันสำหรับดึงข้อมูลสินค้าตาม Barcode
  static async getProductByBarcode(barcode: string): Promise<ProductWithInventory | null> {
    try {
      console.log(`Fetching product with barcode ${barcode} from Supabase...`)

      // ใช้ข้อมูล mock แทนการเรียกใช้ Supabase
      const mockProduct = mockProducts.find((p) => p.barcode === barcode)
      return mockProduct || null
    } catch (error) {
      console.error("Error in getProductByBarcode:", error)
      console.log("Using mock data instead")
      const mockProduct = mockProducts.find((p) => p.barcode === barcode)
      return mockProduct || null
    }
  }

  // ฟังก์ชันสำหรับดึงข้อมูลการเคลื่อนไหวของสินค้า
  static async getInventoryMovements(productId?: number): Promise<InventoryMovement[]> {
    try {
      console.log(`Fetching inventory movements for product ${productId || "all"} from Supabase...`)

      // ใช้ข้อมูล mock แทนการเรียกใช้ Supabase
      return InventoryService.getMockInventoryMovements(productId)
    } catch (error) {
      console.error("Error in getInventoryMovements:", error)
      console.log("Using mock inventory movements instead")
      return InventoryService.getMockInventoryMovements(productId)
    }
  }

  // ฟังก์ชันสำหรับดึงข้อมูลสรุปสินค้าคงคลัง
  static async getInventorySummary(): Promise<InventorySummary> {
    try {
      console.log("Fetching inventory summary from Supabase...")

      // ใช้ข้อมูล mock แทนการเรียกใช้ Supabase
      return {
        total_products: mockProducts.length,
        low_stock_count: mockProducts.filter((p) => p.inventory_status === "Low Stock").length,
        out_of_stock_count: mockProducts.filter((p) => p.inventory_status === "Out of Stock").length,
        total_inventory_value: mockProducts.reduce((sum, p) => sum + p.price * p.inventory_level, 0),
      }
    } catch (error) {
      console.error("Error in getInventorySummary:", error)
      return {
        total_products: mockProducts.length,
        low_stock_count: mockProducts.filter((p) => p.inventory_status === "Low Stock").length,
        out_of_stock_count: mockProducts.filter((p) => p.inventory_status === "Out of Stock").length,
        total_inventory_value: mockProducts.reduce((sum, p) => sum + p.price * p.inventory_level, 0),
      }
    }
  }

  // ฟังก์ชันสำหรับดึงข้อมูลสินค้าคงคลังของสินค้า
  static async getProductInventory(productId: number): Promise<ProductInventory> {
    try {
      console.log(`Fetching product inventory for product ${productId} from Supabase...`)

      // ใช้ข้อมูล mock แทนการเรียกใช้ Supabase
      const mockProduct = mockProducts.find((p) => p.id === productId)

      return {
        available: mockProduct?.inventory_level || 0,
        reserved: 25, // ค่าตัวอย่าง
        safety_stock: 50, // ค่าตัวอย่าง
      }
    } catch (error) {
      console.error("Error in getProductInventory:", error)
      return { available: 0, reserved: 0, safety_stock: 0 }
    }
  }

  // ฟังก์ชันสำหรับดึงข้อมูลสินค้าคงคลังตามสถานที่
  static async getInventoryByLocation(productId: number): Promise<LocationInventory[]> {
    try {
      console.log(`Fetching inventory by location for product ${productId} from Supabase...`)

      // ใช้ข้อมูล mock แทนการเรียกใช้ Supabase
      return [
        {
          location_id: 1,
          location_name: "Tops Central World",
          location_code: "topscentralworld",
          available: 35,
          reserved: 10,
        },
        {
          location_id: 2,
          location_name: "Tops Sukhumvit",
          location_code: "topssukhumvit",
          available: 45,
          reserved: 5,
        },
        {
          location_id: 3,
          location_name: "Central Warehouse",
          location_code: "centralwarehouse",
          available: 40,
          reserved: 10,
        },
      ]
    } catch (error) {
      console.error("Error in getInventoryByLocation:", error)
      return []
    }
  }

  // ฟังก์ชันสำหรับสร้างข้อมูล mock การเคลื่อนไหวของสินค้า
  static async getMockInventoryMovements(productId?: number): Promise<InventoryMovement[]> {
    const movements: InventoryMovement[] = []
    const movementTypes: ("Inbound" | "Outbound" | "Transfer" | "Adjustment")[] = [
      "Inbound",
      "Outbound",
      "Transfer",
      "Adjustment",
    ]
    const locations = [
      { id: 1, name: "Tops Central World" },
      { id: 2, name: "Tops Sukhumvit" },
      { id: 3, name: "Central Warehouse" },
    ]

    for (let i = 1; i <= 20; i++) {
      const movementType = movementTypes[Math.floor(Math.random() * movementTypes.length)]
      const pid = productId || Math.floor(Math.random() * mockProducts.length) + 1
      const productName = mockProducts.find((p) => p.id === pid)?.name || `Product ${pid}`
      const locationIndex = Math.floor(Math.random() * locations.length)

      movements.push({
        id: i,
        product_id: pid,
        product_name: productName,
        location_id: locations[locationIndex].id,
        location_name: locations[locationIndex].name,
        movement_type: movementType,
        quantity: Math.floor(Math.random() * 20) + 1,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        reference: `REF-${i.toString().padStart(5, "0")}`,
      })
    }

    return movements
  }
}
