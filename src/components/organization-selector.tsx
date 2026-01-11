"use client"

import { Building2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useOrganization } from "@/contexts/organization-context"
import { ORGANIZATION_OPTIONS, getOrganizationDisplayName } from "@/types/organization"
import type { Organization } from "@/types/organization"

export function OrganizationSelector() {
  const { selectedOrganization, setOrganization, isLoading } = useOrganization()

  if (isLoading) {
    return null
  }

  return (
    <Select value={selectedOrganization} onValueChange={(value) => setOrganization(value as Organization)}>
      <SelectTrigger
        className="h-10 w-[200px] border-white/20 bg-transparent text-white hover:bg-white/10 focus:ring-white/20"
        aria-label="Select organization"
      >
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <SelectValue placeholder="Select Organization..." />
        </div>
      </SelectTrigger>
      <SelectContent>
        {ORGANIZATION_OPTIONS.map((org) => (
          <SelectItem
            key={org}
            value={org}
            className="cursor-pointer"
          >
            {getOrganizationDisplayName(org)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
