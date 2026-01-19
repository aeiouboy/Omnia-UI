// Unit tests for order line splitting utilities

import { describe, it, expect } from '@jest/globals'
import {
  splitOrderLines,
  groupSplitLinesByParent,
  getOriginalQuantity,
  isSplitLine,
  hasSplitChildren
} from '../order-utils'
import type { ApiOrderItem } from '@/components/order-management-hub'

describe('splitOrderLines', () => {
  // Helper function to create a basic test item
  const createTestItem = (id: string, quantity: number, uom?: string): ApiOrderItem => ({
    id,
    product_id: `PROD-${id}`,
    product_name: `Test Product ${id}`,
    product_sku: `SKU-${id}`,
    quantity,
    unit_price: 100,
    total_price: quantity * 100,
    product_details: {
      description: 'Test product',
      category: 'Test',
      brand: 'Test Brand'
    },
    ...(uom && { uom })
  })

  describe('integer quantity splitting', () => {
    it('should not split items with quantity = 1', () => {
      const items = [createTestItem('001', 1)]
      const result = splitOrderLines(items)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('001')
      expect(result[0].quantity).toBe(1)
      expect(result[0].parentLineId).toBeUndefined()
    })

    it('should split items with quantity = 2 into 2 lines', () => {
      const items = [createTestItem('001', 2)]
      const result = splitOrderLines(items)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('001-0')
      expect(result[0].quantity).toBe(1)
      expect(result[0].parentLineId).toBe('001')
      expect(result[0].splitIndex).toBe(0)
      expect(result[0].total_price).toBe(100)

      expect(result[1].id).toBe('001-1')
      expect(result[1].quantity).toBe(1)
      expect(result[1].parentLineId).toBe('001')
      expect(result[1].splitIndex).toBe(1)
    })

    it('should split items with quantity = 3 into 3 lines', () => {
      const items = [createTestItem('001', 3)]
      const result = splitOrderLines(items)

      expect(result).toHaveLength(3)
      result.forEach((item, index) => {
        expect(item.quantity).toBe(1)
        expect(item.parentLineId).toBe('001')
        expect(item.splitIndex).toBe(index)
        expect(item.total_price).toBe(100)
      })
    })

    it('should split items with quantity = 5 into 5 lines', () => {
      const items = [createTestItem('001', 5)]
      const result = splitOrderLines(items)

      expect(result).toHaveLength(5)
      result.forEach((item) => {
        expect(item.quantity).toBe(1)
        expect(item.parentLineId).toBe('001')
        expect(item.total_price).toBe(100)
      })
    })
  })

  describe('decimal/weight quantity handling', () => {
    it('should not split items with decimal quantity (e.g., 1.5)', () => {
      const items = [createTestItem('001', 1.5)]
      const result = splitOrderLines(items)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('001')
      expect(result[0].quantity).toBe(1.5)
      expect(result[0].parentLineId).toBeUndefined()
    })

    it('should not split items with decimal quantity (e.g., 1.75)', () => {
      const items = [createTestItem('001', 1.75)]
      const result = splitOrderLines(items)

      expect(result).toHaveLength(1)
      expect(result[0].quantity).toBe(1.75)
      expect(result[0].parentLineId).toBeUndefined()
    })

    it('should not split items with weight UOM (KG) even with integer quantity', () => {
      const items = [createTestItem('001', 2, 'KG')]
      const result = splitOrderLines(items)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('001')
      expect(result[0].quantity).toBe(2)
      expect(result[0].parentLineId).toBeUndefined()
    })

    it('should not split items with weight UOM (G) even with integer quantity', () => {
      const items = [createTestItem('001', 3, 'G')]
      const result = splitOrderLines(items)

      expect(result).toHaveLength(1)
      expect(result[0].quantity).toBe(3)
    })
  })

  describe('edge cases', () => {
    it('should filter out items with quantity = 0', () => {
      const items = [createTestItem('001', 0)]
      const result = splitOrderLines(items)

      expect(result).toHaveLength(0)
    })

    it('should filter out items with negative quantity', () => {
      const items = [createTestItem('001', -1)]
      const result = splitOrderLines(items)

      expect(result).toHaveLength(0)
    })

    it('should handle null quantity by defaulting to 1', () => {
      const item = createTestItem('001', 1)
      // @ts-expect-error - Testing null quantity
      item.quantity = null
      const items = [item]
      const result = splitOrderLines(items)

      expect(result).toHaveLength(1)
      expect(result[0].quantity).toBe(1)
    })

    it('should handle undefined quantity by defaulting to 1', () => {
      const item = createTestItem('001', 1)
      // @ts-expect-error - Testing undefined quantity
      item.quantity = undefined
      const items = [item]
      const result = splitOrderLines(items)

      expect(result).toHaveLength(1)
      expect(result[0].quantity).toBe(1)
    })

    it('should handle empty array', () => {
      const result = splitOrderLines([])
      expect(result).toHaveLength(0)
    })

    it('should handle null input', () => {
      const result = splitOrderLines(null as unknown as ApiOrderItem[])
      expect(result).toHaveLength(0)
    })
  })

  describe('metadata preservation', () => {
    it('should preserve all original fields in split lines', () => {
      const originalItem: ApiOrderItem = {
        id: '001',
        product_id: 'PROD-001',
        product_name: 'Test Product',
        thaiName: 'สินค้าทดสอบ',
        product_sku: 'SKU-001',
        quantity: 2,
        unit_price: 100,
        total_price: 200,
        product_details: {
          description: 'Test description',
          category: 'Test',
          brand: 'Test Brand'
        },
        uom: 'EA',
        location: 'CFM1001',
        barcode: '8850000000001',
        giftWrapped: true,
        giftWrappedMessage: 'Happy Birthday!',
        supplyTypeId: 'On Hand Available',
        fulfillmentStatus: 'Pending',
        shippingMethod: 'Standard Delivery'
      }

      const result = splitOrderLines([originalItem])

      expect(result).toHaveLength(2)

      // Check first split line
      expect(result[0].product_id).toBe(originalItem.product_id)
      expect(result[0].product_name).toBe(originalItem.product_name)
      expect(result[0].thaiName).toBe(originalItem.thaiName)
      expect(result[0].product_sku).toBe(originalItem.product_sku)
      expect(result[0].uom).toBe(originalItem.uom)
      expect(result[0].location).toBe(originalItem.location)
      expect(result[0].barcode).toBe(originalItem.barcode)
      expect(result[0].giftWrapped).toBe(originalItem.giftWrapped)
      expect(result[0].giftWrappedMessage).toBe(originalItem.giftWrappedMessage)
      expect(result[0].supplyTypeId).toBe(originalItem.supplyTypeId)
      expect(result[0].fulfillmentStatus).toBe(originalItem.fulfillmentStatus)
      expect(result[0].shippingMethod).toBe(originalItem.shippingMethod)

      // Check second split line
      expect(result[1].product_id).toBe(originalItem.product_id)
      expect(result[1].product_name).toBe(originalItem.product_name)
    })

    it('should set splitReason to "quantity-normalization"', () => {
      const items = [createTestItem('001', 2)]
      const result = splitOrderLines(items)

      expect(result[0].splitReason).toBe('quantity-normalization')
      expect(result[1].splitReason).toBe('quantity-normalization')
    })
  })

  describe('multiple items', () => {
    it('should handle mixed items with different quantities', () => {
      const items = [
        createTestItem('001', 1),  // No split
        createTestItem('002', 3),  // Split into 3
        createTestItem('003', 1),  // No split
        createTestItem('004', 2)   // Split into 2
      ]

      const result = splitOrderLines(items)

      expect(result).toHaveLength(7) // 1 + 3 + 1 + 2
      expect(result.filter(i => i.parentLineId === '001')).toHaveLength(0)
      expect(result.filter(i => i.parentLineId === '002')).toHaveLength(3)
      expect(result.filter(i => i.parentLineId === '003')).toHaveLength(0)
      expect(result.filter(i => i.parentLineId === '004')).toHaveLength(2)
    })

    it('should handle items with mixed integer and decimal quantities', () => {
      const items = [
        createTestItem('001', 2, 'EA'),   // Split into 2
        createTestItem('002', 1.5, 'KG'), // No split (decimal + weight)
        createTestItem('003', 3, 'PCS')   // Split into 3
      ]

      const result = splitOrderLines(items)

      expect(result).toHaveLength(6) // 2 + 1 + 3
      expect(result.filter(i => i.parentLineId === '001')).toHaveLength(2)
      expect(result.filter(i => i.parentLineId === '002')).toHaveLength(0) // Not split
      expect(result.filter(i => i.parentLineId === '003')).toHaveLength(3)
    })
  })

  describe('price calculation', () => {
    it('should set total_price to unit_price on split lines', () => {
      const items = [createTestItem('001', 3)]
      const result = splitOrderLines(items)

      result.forEach(item => {
        expect(item.quantity).toBe(1)
        expect(item.unit_price).toBe(100)
        expect(item.total_price).toBe(100) // unit_price * 1
      })
    })

    it('should preserve unit_price on split lines', () => {
      const originalItem = createTestItem('001', 5)
      originalItem.unit_price = 250

      const result = splitOrderLines([originalItem])

      result.forEach(item => {
        expect(item.unit_price).toBe(250)
        expect(item.total_price).toBe(250)
      })
    })
  })
})

describe('groupSplitLinesByParent', () => {
  const createTestItem = (id: string, quantity: number, parentLineId?: string): ApiOrderItem => ({
    id,
    product_id: `PROD-${id}`,
    product_name: `Test Product ${id}`,
    product_sku: `SKU-${id}`,
    quantity,
    unit_price: 100,
    total_price: quantity * 100,
    product_details: { description: 'Test', category: 'Test', brand: 'Test' },
    ...(parentLineId && { parentLineId })
  })

  it('should group items by parentLineId', () => {
    const items = [
      createTestItem('001-0', 1, '001'),
      createTestItem('001-1', 1, '001'),
      createTestItem('001-2', 1, '001'),
      createTestItem('002', 1) // No parent
    ]

    const groups = groupSplitLinesByParent(items)

    expect(groups.size).toBe(2)
    expect(groups.get('001')).toHaveLength(3)
    expect(groups.get('002')).toHaveLength(1)
  })
})

describe('getOriginalQuantity', () => {
  const createTestItem = (id: string, quantity: number, parentLineId?: string): ApiOrderItem => ({
    id,
    product_id: `PROD-${id}`,
    product_name: `Test Product ${id}`,
    product_sku: `SKU-${id}`,
    quantity,
    unit_price: 100,
    total_price: quantity * 100,
    product_details: { description: 'Test', category: 'Test', brand: 'Test' },
    ...(parentLineId && { parentLineId })
  })

  it('should return the count of split lines for a split item', () => {
    const items = [
      createTestItem('001-0', 1, '001'),
      createTestItem('001-1', 1, '001'),
      createTestItem('001-2', 1, '001')
    ]

    const result = getOriginalQuantity(items[0], items)
    expect(result).toBe(3)
  })

  it('should return the count of children for a parent item', () => {
    const items = [
      createTestItem('001', 1),
      createTestItem('001-0', 1, '001'),
      createTestItem('001-1', 1, '001'),
      createTestItem('001-2', 1, '001')
    ]

    const result = getOriginalQuantity(items[0], items)
    expect(result).toBe(3)
  })

  it('should return the quantity for items without splits', () => {
    const items = [createTestItem('001', 5)]

    const result = getOriginalQuantity(items[0], items)
    expect(result).toBe(5)
  })
})

describe('isSplitLine', () => {
  it('should return true for items with parentLineId', () => {
    const item = {
      id: '001-0',
      product_id: 'PROD-001',
      product_name: 'Test',
      product_sku: 'SKU-001',
      quantity: 1,
      unit_price: 100,
      total_price: 100,
      product_details: { description: 'Test', category: 'Test', brand: 'Test' },
      parentLineId: '001'
    } as ApiOrderItem

    expect(isSplitLine(item)).toBe(true)
  })

  it('should return false for items without parentLineId', () => {
    const item = {
      id: '001',
      product_id: 'PROD-001',
      product_name: 'Test',
      product_sku: 'SKU-001',
      quantity: 1,
      unit_price: 100,
      total_price: 100,
      product_details: { description: 'Test', category: 'Test', brand: 'Test' }
    } as ApiOrderItem

    expect(isSplitLine(item)).toBe(false)
  })
})

describe('hasSplitChildren', () => {
  const createTestItem = (id: string, quantity: number, parentLineId?: string): ApiOrderItem => ({
    id,
    product_id: `PROD-${id}`,
    product_name: `Test Product ${id}`,
    product_sku: `SKU-${id}`,
    quantity,
    unit_price: 100,
    total_price: quantity * 100,
    product_details: { description: 'Test', category: 'Test', brand: 'Test' },
    ...(parentLineId && { parentLineId })
  })

  it('should return true for items with split children', () => {
    const items = [
      createTestItem('001', 1),
      createTestItem('001-0', 1, '001'),
      createTestItem('001-1', 1, '001')
    ]

    expect(hasSplitChildren(items[0], items)).toBe(true)
  })

  it('should return false for items without split children', () => {
    const items = [
      createTestItem('001', 1),
      createTestItem('002', 1)
    ]

    expect(hasSplitChildren(items[0], items)).toBe(false)
  })
})
