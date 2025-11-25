'use client'

import { ATCConfiguration } from '@/types/atc-config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Minus, Edit } from 'lucide-react'

interface ConfigDiffViewerProps {
  oldConfig: Partial<ATCConfiguration> | null
  newConfig: Partial<ATCConfiguration>
  title?: string
}

type DiffType = 'added' | 'removed' | 'modified' | 'unchanged'

interface DiffItem {
  path: string
  type: DiffType
  oldValue?: unknown
  newValue?: unknown
}

/**
 * ConfigDiffViewer Component
 *
 * Displays side-by-side comparison of two configurations with visual highlighting
 * of additions, modifications, and removals. Supports deep object comparison.
 */
export function ConfigDiffViewer({ oldConfig, newConfig, title }: ConfigDiffViewerProps) {
  const diffs = generateDiffs(oldConfig, newConfig)

  const addedCount = diffs.filter((d) => d.type === 'added').length
  const modifiedCount = diffs.filter((d) => d.type === 'modified').length
  const removedCount = diffs.filter((d) => d.type === 'removed').length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title || 'Configuration Changes'}</CardTitle>
          <div className="flex gap-2">
            {addedCount > 0 && (
              <Badge variant="default" className="bg-green-600">
                <Plus className="h-3 w-3 mr-1" />
                {addedCount} Added
              </Badge>
            )}
            {modifiedCount > 0 && (
              <Badge variant="default" className="bg-blue-600">
                <Edit className="h-3 w-3 mr-1" />
                {modifiedCount} Modified
              </Badge>
            )}
            {removedCount > 0 && (
              <Badge variant="default" className="bg-red-600">
                <Minus className="h-3 w-3 mr-1" />
                {removedCount} Removed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] w-full">
          <div className="space-y-2">
            {diffs.length === 0 && (
              <div className="text-center text-muted-foreground py-8">No changes detected</div>
            )}
            {diffs.map((diff, index) => (
              <DiffRow key={index} diff={diff} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

/**
 * DiffRow Component
 *
 * Renders a single diff item with appropriate styling and icons
 */
function DiffRow({ diff }: { diff: DiffItem }) {
  const getBgColor = (type: DiffType) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
      case 'removed':
        return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
      case 'modified':
        return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
      default:
        return 'bg-muted/30'
    }
  }

  const getIcon = (type: DiffType) => {
    switch (type) {
      case 'added':
        return <Plus className="h-4 w-4 text-green-600" />
      case 'removed':
        return <Minus className="h-4 w-4 text-red-600" />
      case 'modified':
        return <Edit className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }

  if (diff.type === 'unchanged') {
    return null // Don't render unchanged items
  }

  return (
    <div className={`p-3 border rounded-lg ${getBgColor(diff.type)}`}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{getIcon(diff.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm mb-1">{diff.path}</div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 text-sm">
            {diff.type !== 'added' && diff.oldValue !== undefined && (
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Previous Value</div>
                <div className="font-mono text-xs p-2 bg-background/50 rounded overflow-x-auto">
                  {formatValue(diff.oldValue)}
                </div>
              </div>
            )}
            {diff.type !== 'removed' && diff.newValue !== undefined && (
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">New Value</div>
                <div className="font-mono text-xs p-2 bg-background/50 rounded overflow-x-auto">
                  {formatValue(diff.newValue)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Generate diffs between two configuration objects
 */
function generateDiffs(
  oldConfig: Partial<ATCConfiguration> | null,
  newConfig: Partial<ATCConfiguration>
): DiffItem[] {
  const diffs: DiffItem[] = []

  // If no old config, everything is added
  if (!oldConfig) {
    traverseObject(newConfig, '', (path, value) => {
      diffs.push({ path, type: 'added', newValue: value })
    })
    return diffs
  }

  // Compare objects recursively
  const allPaths = new Set<string>()
  traverseObject(oldConfig, '', (path) => allPaths.add(path))
  traverseObject(newConfig, '', (path) => allPaths.add(path))

  allPaths.forEach((path) => {
    const oldValue = getValueAtPath(oldConfig, path)
    const newValue = getValueAtPath(newConfig, path)

    if (oldValue === undefined && newValue !== undefined) {
      diffs.push({ path, type: 'added', newValue })
    } else if (oldValue !== undefined && newValue === undefined) {
      diffs.push({ path, type: 'removed', oldValue })
    } else if (!deepEqual(oldValue, newValue)) {
      diffs.push({ path, type: 'modified', oldValue, newValue })
    }
  })

  return diffs.sort((a, b) => a.path.localeCompare(b.path))
}

/**
 * Traverse object and call callback for each leaf path
 */
function traverseObject(
  obj: unknown,
  prefix: string,
  callback: (path: string, value: unknown) => void,
  maxDepth = 5
) {
  if (maxDepth <= 0 || obj === null || typeof obj !== 'object') {
    callback(prefix, obj)
    return
  }

  const entries = Array.isArray(obj) ? obj.entries() : Object.entries(obj)

  for (const [key, value] of entries) {
    const path = prefix ? `${prefix}.${key}` : String(key)
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      traverseObject(value, path, callback, maxDepth - 1)
    } else {
      callback(path, value)
    }
  }
}

/**
 * Get value at a specific path in an object
 */
function getValueAtPath(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return current
}

/**
 * Deep equality check
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a === null || b === null) return false
  if (typeof a !== typeof b) return false
  if (typeof a !== 'object') return false

  const aKeys = Object.keys(a as object)
  const bKeys = Object.keys(b as object)

  if (aKeys.length !== bKeys.length) return false

  return aKeys.every((key) => {
    const aVal = (a as Record<string, unknown>)[key]
    const bVal = (b as Record<string, unknown>)[key]
    return deepEqual(aVal, bVal)
  })
}

/**
 * Format value for display
 */
function formatValue(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'boolean') return value.toString()
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    if (value.length <= 3) return JSON.stringify(value)
    return `[${value.length} items]`
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value)
    if (keys.length === 0) return '{}'
    if (keys.length <= 3) return JSON.stringify(value, null, 2)
    return `{${keys.length} properties}`
  }
  return String(value)
}
