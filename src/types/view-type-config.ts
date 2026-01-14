/**
 * View Type Configuration for Inventory Management
 *
 * This module defines the configuration mapping for View Types to Business Units and Channels.
 * View Types determine what inventory data is visible to users based on their selection.
 */

/**
 * Business Unit identifiers
 */
export type BusinessUnit = "CFR" | "DS"

/**
 * Channel identifiers based on View Type mapping
 */
export type ViewTypeChannel = "TOL" | "MKP" | "QC" | "STD" | "EXP"

/**
 * Configuration for a single View Type
 */
export interface ViewTypeConfig {
  /** The View Type code (e.g., "ECOM-TH-CFR-LOCD-STD") */
  viewType: string
  /** Business Unit this View Type belongs to */
  businessUnit: BusinessUnit
  /** Channels associated with this View Type */
  channels: ViewTypeChannel[]
  /** Human-readable description of the View Type */
  description: string
}

/**
 * View Type Configuration Mapping
 *
 * Maps View Types to their Business Units and Channels based on requirements:
 * | View Type | BU | Channel |
 * |-----------|-----|---------| 
 * | ECOM-TH-CFR-LOCD-STD | CFR | TOL |
 * | ECOM-TH-CFR-LOCD-MKP | CFR | MKP |
 * | MKP-TH-CFR-LOCD-STD | CFR | QC |
 * | ECOM-TH-DSS-NW-STD | DS | STD |
 * | ECOM-TH-DSS-LOCD-EXP | DS | EXP |
 */
export const VIEW_TYPE_CONFIG: ViewTypeConfig[] = [
  {
    viewType: "ECOM-TH-CFR-LOCD-STD",
    businessUnit: "CFR",
    channels: ["TOL"],
    description: "CFR - TOL Channel",
  },
  {
    viewType: "ECOM-TH-CFR-LOCD-MKP",
    businessUnit: "CFR",
    channels: ["MKP"],
    description: "CFR - MKP Channel",
  },
  {
    viewType: "MKP-TH-CFR-LOCD-STD",
    businessUnit: "CFR",
    channels: ["QC"],
    description: "CFR - QC Channel",
  },
  {
    viewType: "ECOM-TH-DSS-NW-STD",
    businessUnit: "DS",
    channels: ["STD"],
    description: "DS - Standard Delivery & Pickup",
  },
  {
    viewType: "ECOM-TH-DSS-LOCD-EXP",
    businessUnit: "DS",
    channels: ["EXP"],
    description: "DS - 3H Delivery & 1H Pickup",
  },
]

/**
 * Get all available View Type codes
 */
export function getViewTypeCodes(): string[] {
  return VIEW_TYPE_CONFIG.map((config) => config.viewType)
}

/**
 * Get the configuration for a specific View Type
 * @param viewType - The View Type code to look up
 * @returns The ViewTypeConfig or undefined if not found
 */
export function getViewTypeConfig(viewType: string): ViewTypeConfig | undefined {
  return VIEW_TYPE_CONFIG.find((config) => config.viewType === viewType)
}

/**
 * Get channels associated with a View Type
 * @param viewType - The View Type code to look up
 * @returns Array of channel codes or empty array if not found
 */
export function getChannelsByViewType(viewType: string): ViewTypeChannel[] {
  const config = getViewTypeConfig(viewType)
  return config?.channels || []
}

/**
 * Get the Business Unit for a View Type
 * @param viewType - The View Type code to look up
 * @returns The Business Unit code or undefined if not found
 */
export function getBusinessUnitByViewType(viewType: string): BusinessUnit | undefined {
  const config = getViewTypeConfig(viewType)
  return config?.businessUnit
}

/**
 * Get the description for a View Type
 * @param viewType - The View Type code to look up
 * @returns The description or undefined if not found
 */
export function getViewTypeDescription(viewType: string): string | undefined {
  const config = getViewTypeConfig(viewType)
  return config?.description
}

/**
 * Validate if a string is a valid View Type code
 * @param viewType - The string to validate
 * @returns true if valid, false otherwise
 */
export function isValidViewType(viewType: string): boolean {
  return VIEW_TYPE_CONFIG.some((config) => config.viewType === viewType)
}
