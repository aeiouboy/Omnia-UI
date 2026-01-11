"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Organization, OrganizationContextType } from "@/types/organization"
import { isValidOrganization } from "@/types/organization"

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

const STORAGE_KEY = 'selected-organization'

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [selectedOrganization, setSelectedOrganization] = useState<Organization>('ALL')
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && isValidOrganization(stored)) {
        setSelectedOrganization(stored)
      }
    } catch (error) {
      console.error('Error loading organization from localStorage:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save to localStorage when organization changes
  const setOrganization = (org: Organization) => {
    setSelectedOrganization(org)
    try {
      localStorage.setItem(STORAGE_KEY, org)
    } catch (error) {
      console.error('Error saving organization to localStorage:', error)
    }
  }

  return (
    <OrganizationContext.Provider value={{ selectedOrganization, setOrganization, isLoading }}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider")
  }
  return context
}
