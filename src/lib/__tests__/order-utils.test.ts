// Unit tests for order line utilities
// NOTE: Order line splitting logic has been removed (chore-17105b9b)
// These tests verify the passthrough behavior

import { describe, it, expect } from '@jest/globals'
import {
  splitOrderLines,
  groupSplitLinesByParent,
  getOriginalQuantity,
  isSplitLine,
  hasSplitChildren
} from '../order-utils'
import type { ApiOrderItem } from '@/components/order-management-hub'

describe('splitOrderLines (passthrough)', () => {
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

  describe('passthrough behavior', () => {
    it('should preserve original quantities without modification', () => {
      const items = [createTestItem('001', 3)]
      const result = splitOrderLines(items)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('001')
      expect(result[0].quantity).toBe(3)
      expect(result[0].parentLineId).toBeUndefined()
      expect(result[0].splitIndex).toBeUndefined()
      expect(result[0].splitReason).toBeUndefined()
    })

    it('should not split items with quantity = 2', () => {
      const items = [createTestItem('001', 2)]
      const result = splitOrderLines(items)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('001')
      expect(result[0].quantity).toBe(2)
      expect(result[0].parentLineId).toBeUndefined()
    })

    it('should not split items with quantity = 5', () => {
      const items = [createTestItem('001', 5)]
      const result = splitOrderLines(items)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('001')
      expect(result[0].quantity).toBe(5)
      expect(result[0].parentLineId).toBeUndefined()
    })

    it('should preserve items with quantity = 1', () => {
      const items = [createTestItem('001', 1)]
      const result = splitOrderLines(items)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('001')
      expect(result[0].quantity).toBe(1)
    })

    it('should preserve decimal quantities', () => {
      const items = [createTestItem('001', 1.5)]
      const result = splitOrderLines(items)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('001')
      expect(result[0].quantity).toBe(1.5)
    })

    it('should preserve items with weight UOM', () => {
      const items = [createTestItem('001', 2, 'KG')]
      const result = splitOrderLines(items)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('001')
      expect(result[0].quantity).toBe(2)
      expect(result[0].uom).toBe('KG')
    })
  })

  describe('edge cases', () => {
    it('should handle empty array', () => {
      const result = splitOrderLines([])
      expect(result).toHaveLength(0)
    })

    it('should handle null input', () => {
      const result = splitOrderLines(null as unknown as ApiOrderItem[])
      expect(result).toHaveLength(0)
    })

    it('should handle undefined input', () => {
      const result = splitOrderLines(undefined as unknown as ApiOrderItem[])
      expect(result).toHaveLength(0)
    })
  })

  describe('multiple items', () => {
    it('should preserve all items with their original quantities', () => {
      const items = [
        createTestItem('001', 1),
        createTestItem('002', 3),
        createTestItem('003', 1),
        createTestItem('004', 2)
      ]

      const result = splitOrderLines(items)

      expect(result).toHaveLength(4)
      expect(result[0].quantity).toBe(1)
      expect(result[1].quantity).toBe(3)
      expect(result[2].quantity).toBe(1)
      expect(result[3].quantity).toBe(2)
    })

    it('should preserve all original IDs', () => {
      const items = [
        createTestItem('001', 2),
        createTestItem('002', 3)
      ]

      const result = splitOrderLines(items)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('001')
      expect(result[1].id).toBe('002')
    })
  })

  describe('metadata preservation', () => {
    it('should preserve all original fields unchanged', () => {
      const originalItem: ApiOrderItem = {
        id: '001',
        product_id: 'PROD-001',
        product_name: 'Test Product',
        thaiName: 'สินค้าทดสอบ',
        product_sku: 'SKU-001',
        quantity: 3,
        unit_price: 100,
        total_price: 300,
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

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(originalItem)
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

  it('should group items by parentLineId when present', () => {
    const items = [
      createTestItem('001-0', 1, '001'),
      createTestItem('001-1', 1, '001'),
      createTestItem('001-2', 1, '001'),
      createTestItem('002', 1)
    ]

    const groups = groupSplitLinesByParent(items)

    expect(groups.size).toBe(2)
    expect(groups.get('001')).toHaveLength(3)
    expect(groups.get('002')).toHaveLength(1)
  })

  it('should use item id when no parentLineId exists', () => {
    const items = [
      createTestItem('001', 3),
      createTestItem('002', 2)
    ]

    const groups = groupSplitLinesByParent(items)

    expect(groups.size).toBe(2)
    expect(groups.get('001')).toHaveLength(1)
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

  it('should return the item quantity for non-split items', () => {
    const items = [createTestItem('001', 5)]

    const result = getOriginalQuantity(items[0], items)
    expect(result).toBe(5)
  })

  it('should return 1 when quantity is missing', () => {
    const item = createTestItem('001', 1)
    // @ts-expect-error - Testing undefined quantity
    item.quantity = undefined
    const items = [item]

    const result = getOriginalQuantity(items[0], items)
    expect(result).toBe(1)
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
