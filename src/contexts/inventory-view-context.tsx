"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useMemo } from "react"
import {
  type ViewTypeConfig,
  type BusinessUnit,
  type ViewTypeChannel,
  getViewTypeConfig,
  getChannelsByViewType,
  getBusinessUnitByViewType,
  isValidViewType,
} from "@/types/view-type-config"

/**
 * Context type for Inventory View state management
 */
export interface InventoryViewContextType {
  /** Currently selected View Type code */
  selectedViewType: string | null
  /** Set the selected View Type */
  setViewType: (viewType: string) => void
  /** Clear the selected View Type */
  clearViewType: () => void
  /** Whether a View Type is currently selected */
  isViewTypeSelected: boolean
  /** Business Unit derived from selected View Type */
  businessUnit: BusinessUnit | null
  /** Channels derived from selected View Type */
  channels: ViewTypeChannel[]
  /** Full configuration for the selected View Type */
  viewTypeConfig: ViewTypeConfig | null
  /** Loading state for initial localStorage read */
  isLoading: boolean
}

const InventoryViewContext = createContext<InventoryViewContextType | undefined>(undefined)

const STORAGE_KEY = "inventory-view-type"

interface InventoryViewProviderProps {
  children: React.ReactNode
}

/**
 * Provider component for Inventory View context
 * Manages View Type selection with localStorage persistence
 */
export function InventoryViewProvider({ children }: InventoryViewProviderProps) {
  const [selectedViewType, setSelectedViewType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && isValidViewType(stored)) {
        setSelectedViewType(stored)
      }
    } catch (error) {
      console.error("Error loading inventory view type from localStorage:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Set View Type and persist to localStorage
  const setViewType = (viewType: string) => {
    if (!isValidViewType(viewType)) {
      console.warn(`Invalid view type: ${viewType}`)
      return
    }
    setSelectedViewType(viewType)
    try {
      localStorage.setItem(STORAGE_KEY, viewType)
    } catch (error) {
      console.error("Error saving inventory view type to localStorage:", error)
    }
  }

  // Clear View Type and remove from localStorage
  const clearViewType = () => {
    setSelectedViewType(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error("Error removing inventory view type from localStorage:", error)
    }
  }

  // Derived values from selected View Type
  const derivedValues = useMemo(() => {
    if (!selectedViewType) {
      return {
        businessUnit: null,
        channels: [] as ViewTypeChannel[],
        viewTypeConfig: null,
        isViewTypeSelected: false,
      }
    }

    return {
      businessUnit: getBusinessUnitByViewType(selectedViewType) || null,
      channels: getChannelsByViewType(selectedViewType),
      viewTypeConfig: getViewTypeConfig(selectedViewType) || null,
      isViewTypeSelected: true,
    }
  }, [selectedViewType])

  const contextValue: InventoryViewContextType = {
    selectedViewType,
    setViewType,
    clearViewType,
    isLoading,
    ...derivedValues,
  }

  return (
    <InventoryViewContext.Provider value={contextValue}>
      {children}
    </InventoryViewContext.Provider>
  )
}

/**
 * Hook to access the Inventory View context
 * @throws Error if used outside of InventoryViewProvider
 */
export function useInventoryView(): InventoryViewContextType {
  const context = useContext(InventoryViewContext)
  if (context === undefined) {
    throw new Error("useInventoryView must be used within an InventoryViewProvider")
  }
  return context
}
