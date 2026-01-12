/**
 * Organization/Business Unit Type Definitions
 * Defines the organization types and related interfaces for the organization selection feature
 */

/**
 * Organization/Business Unit types
 * - CRC: Central Retail Corporation
 * - CFR: Central Food Retail
 * - CFM: Central Food Manufacturing
 * - DS: Digital Services
 * - ALL: Show all organizations (no filter)
 */
export type Organization = 'CRC' | 'CFR' | 'CFM' | 'DS' | 'ALL'

/**
 * Organization context interface
 */
export interface OrganizationContextType {
  /** Currently selected organization */
  selectedOrganization: Organization
  /** Function to update selected organization */
  setOrganization: (org: Organization) => void
  /** Loading state for initial localStorage read */
  isLoading: boolean
}

/**
 * Display names for organizations
 */
export const ORGANIZATION_DISPLAY_NAMES: Record<Organization, string> = {
  CRC: 'CRC',
  CFR: 'CFR',
  CFM: 'CFM',
  DS: 'DS',
  ALL: 'All Organizations'
}

/**
 * Array of all organization options for dropdown
 */
export const ORGANIZATION_OPTIONS: Organization[] = ['ALL', 'CRC', 'CFR', 'CFM', 'DS']

/**
 * Type guard to check if a value is a valid Organization
 */
export function isValidOrganization(value: unknown): value is Organization {
  return typeof value === 'string' && ORGANIZATION_OPTIONS.includes(value as Organization)
}

/**
 * Get organization display name
 */
export function getOrganizationDisplayName(org: Organization): string {
  return ORGANIZATION_DISPLAY_NAMES[org] || org
}
