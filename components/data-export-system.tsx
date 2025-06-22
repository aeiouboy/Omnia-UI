"use client"

import React, { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Download,
  FileText,
  Table,
  BarChart3,
  Mail,
  Calendar,
  Settings,
  Filter,
  Eye,
  Share2,
  Clock,
  Database,
  FileSpreadsheet,
  FileImage,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react"

interface ExportField {
  id: string
  name: string
  type: 'string' | 'number' | 'date' | 'boolean' | 'object'
  category: 'core' | 'analytics' | 'metadata' | 'custom'
  required?: boolean
  sensitive?: boolean
  description?: string
}

interface ExportFilter {
  field: string
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in'
  value: any
  values?: any[]
}

interface ExportSchedule {
  id: string
  name: string
  frequency: 'once' | 'daily' | 'weekly' | 'monthly'
  dayOfWeek?: number
  dayOfMonth?: number
  time: string
  enabled: boolean
  lastRun?: Date
  nextRun?: Date
}

interface ExportTemplate {
  id: string
  name: string
  description: string
  format: 'csv' | 'xlsx' | 'pdf' | 'json'
  fields: string[]
  filters: ExportFilter[]
  schedule?: ExportSchedule
  recipients?: string[]
  category: 'standard' | 'executive' | 'operational' | 'custom'
}

interface DataExportSystemProps {
  data: any[]
  availableFields: ExportField[]
  onExport: (config: ExportConfig) => Promise<void>
  onSchedule: (schedule: ExportSchedule, template: ExportTemplate) => Promise<void>
  savedTemplates?: ExportTemplate[]
  userPermissions: string[]
}

interface ExportConfig {
  format: 'csv' | 'xlsx' | 'pdf' | 'json'
  fields: string[]
  filters: ExportFilter[]
  fileName: string
  includeHeaders: boolean
  dateRange?: { start: Date; end: Date }
  aggregation?: 'none' | 'sum' | 'avg' | 'count'
  groupBy?: string
}

const STANDARD_TEMPLATES: ExportTemplate[] = [
  {
    id: 'executive-summary',
    name: 'Executive Summary Report',
    description: 'High-level KPIs and performance metrics for executive review',
    format: 'pdf',
    fields: ['order_count', 'revenue_total', 'sla_compliance_rate', 'fulfillment_rate'],
    filters: [],
    category: 'executive'
  },
  {
    id: 'operational-detail',
    name: 'Operational Details Export',
    description: 'Complete order data with processing details for operational analysis',
    format: 'xlsx',
    fields: ['order_no', 'customer_name', 'channel', 'status', 'sla_elapsed', 'total_amount'],
    filters: [],
    category: 'operational'
  },
  {
    id: 'sla-compliance',
    name: 'SLA Compliance Report',
    description: 'Detailed SLA performance analysis by channel and time period',
    format: 'csv',
    fields: ['order_no', 'channel', 'sla_target', 'sla_elapsed', 'sla_status', 'breach_duration'],
    filters: [{ field: 'status', operator: 'in', values: ['PROCESSING', 'BREACH'] }],
    category: 'standard'
  }
]

export function DataExportSystem({
  data,
  availableFields,
  onExport,
  onSchedule,
  savedTemplates = [],
  userPermissions
}: DataExportSystemProps) {
  const [activeTab, setActiveTab] = useState('quick')
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'csv',
    fields: [],
    filters: [],
    fileName: 'dashboard-export',
    includeHeaders: true
  })
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [scheduleConfig, setScheduleConfig] = useState<ExportSchedule>({
    id: '',
    name: '',
    frequency: 'weekly',
    time: '09:00',
    enabled: true
  })

  // All available templates including saved and standard
  const allTemplates = useMemo(() => [
    ...STANDARD_TEMPLATES,
    ...savedTemplates
  ], [savedTemplates])

  // Filtered data based on current filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      return exportConfig.filters.every(filter => {
        const value = item[filter.field]
        switch (filter.operator) {
          case 'equals':
            return value === filter.value
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase())
          case 'greater':
            return Number(value) > Number(filter.value)
          case 'less':
            return Number(value) < Number(filter.value)
          case 'between':
            return Number(value) >= Number(filter.values?.[0]) && Number(value) <= Number(filter.values?.[1])
          case 'in':
            return filter.values?.includes(value)
          default:
            return true
        }
      })
    })
  }, [data, exportConfig.filters])

  // Handle field selection
  const toggleField = useCallback((fieldId: string) => {
    setExportConfig(prev => ({
      ...prev,
      fields: prev.fields.includes(fieldId)
        ? prev.fields.filter(f => f !== fieldId)
        : [...prev.fields, fieldId]
    }))
  }, [])

  // Handle filter management
  const addFilter = useCallback((filter: ExportFilter) => {
    setExportConfig(prev => ({
      ...prev,
      filters: [...prev.filters, filter]
    }))
  }, [])

  const removeFilter = useCallback((index: number) => {
    setExportConfig(prev => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index)
    }))
  }, [])

  // Load template
  const loadTemplate = useCallback((template: ExportTemplate) => {
    setSelectedTemplate(template)
    setExportConfig(prev => ({
      ...prev,
      format: template.format,
      fields: template.fields,
      filters: template.filters,
      fileName: template.name.toLowerCase().replace(/\s+/g, '-')
    }))
  }, [])

  // Handle export
  const handleExport = useCallback(async () => {
    if (exportConfig.fields.length === 0) {
      alert('Please select at least one field to export')
      return
    }

    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      await onExport(exportConfig)
      
      clearInterval(progressInterval)
      setExportProgress(100)
      
      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
      }, 1000)
    } catch (error) {
      console.error('Export failed:', error)
      setIsExporting(false)
      setExportProgress(0)
    }
  }, [exportConfig, onExport])

  // Handle scheduling
  const handleSchedule = useCallback(async () => {
    if (!selectedTemplate) return
    
    try {
      await onSchedule(scheduleConfig, selectedTemplate)
      alert('Export scheduled successfully!')
    } catch (error) {
      console.error('Scheduling failed:', error)
      alert('Failed to schedule export')
    }
  }, [scheduleConfig, selectedTemplate, onSchedule])

  // Get field category groups
  const fieldGroups = useMemo(() => {
    return availableFields.reduce((groups, field) => {
      if (!groups[field.category]) groups[field.category] = []
      groups[field.category].push(field)
      return groups
    }, {} as Record<string, ExportField[]>)
  }, [availableFields])

  // Check user permissions
  const canSchedule = userPermissions.includes('schedule:exports')
  const canViewSensitive = userPermissions.includes('view:sensitive')

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Data Export & Reporting System</span>
            <Badge variant="outline">{filteredData.length} records</Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quick">Quick Export</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            {canSchedule && <TabsTrigger value="schedule">Schedule</TabsTrigger>}
          </TabsList>

          {/* Quick Export */}
          <TabsContent value="quick" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Format</label>
                    <Select 
                      value={exportConfig.format} 
                      onValueChange={(value: ExportConfig['format']) => 
                        setExportConfig(prev => ({ ...prev, format: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span>CSV</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="xlsx">
                          <div className="flex items-center space-x-2">
                            <FileSpreadsheet className="h-4 w-4" />
                            <span>Excel (XLSX)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="pdf">
                          <div className="flex items-center space-x-2">
                            <FileImage className="h-4 w-4" />
                            <span>PDF Report</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="json">
                          <div className="flex items-center space-x-2">
                            <Database className="h-4 w-4" />
                            <span>JSON</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">File Name</label>
                    <Input
                      value={exportConfig.fileName}
                      onChange={(e) => setExportConfig(prev => ({ ...prev, fileName: e.target.value }))}
                      placeholder="Enter file name"
                    />
                  </div>
                </div>

                {/* Pre-selected Templates */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Quick Templates</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {STANDARD_TEMPLATES.map(template => (
                      <Card 
                        key={template.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => loadTemplate(template)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="font-medium text-sm">{template.name}</div>
                            <div className="text-xs text-gray-600">{template.description}</div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" size="sm">{template.format.toUpperCase()}</Badge>
                              <Badge variant="outline" size="sm">{template.fields.length} fields</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Export Button */}
                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleExport} 
                    disabled={isExporting || exportConfig.fields.length === 0}
                    className="w-full min-h-[48px]"
                  >
                    {isExporting ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Exporting... {exportProgress}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>Export {filteredData.length} Records</span>
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Configuration */}
          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Field Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Fields</CardTitle>
                </CardHeader>
                <CardContent className="max-h-80 overflow-y-auto">
                  {Object.entries(fieldGroups).map(([category, fields]) => (
                    <div key={category} className="mb-4">
                      <h4 className="font-medium text-sm mb-2 capitalize">{category} Fields</h4>
                      <div className="space-y-2">
                        {fields.map(field => (
                          <div key={field.id} className="flex items-center space-x-2">
                            <Checkbox
                              checked={exportConfig.fields.includes(field.id)}
                              onCheckedChange={() => toggleField(field.id)}
                              disabled={field.sensitive && !canViewSensitive}
                            />
                            <label className="text-sm flex-1">
                              {field.name}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                              {field.sensitive && <span className="text-orange-500 ml-1">🔒</span>}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Filters & Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filters & Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Active Filters */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">Active Filters</h4>
                    {exportConfig.filters.length > 0 ? (
                      <div className="space-y-2">
                        {exportConfig.filters.map((filter, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">
                              {filter.field} {filter.operator} {filter.value || filter.values?.join(', ')}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFilter(index)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">No filters applied</p>
                    )}
                  </div>

                  {/* Export Options */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Include Headers</label>
                      <Switch
                        checked={exportConfig.includeHeaders}
                        onCheckedChange={(checked) => 
                          setExportConfig(prev => ({ ...prev, includeHeaders: checked }))
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Group By</label>
                      <Select 
                        value={exportConfig.groupBy || ''} 
                        onValueChange={(value) => 
                          setExportConfig(prev => ({ ...prev, groupBy: value || undefined }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {availableFields.filter(f => f.type === 'string').map(field => (
                            <SelectItem key={field.id} value={field.id}>{field.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Aggregation</label>
                      <Select 
                        value={exportConfig.aggregation || 'none'} 
                        onValueChange={(value: ExportConfig['aggregation']) => 
                          setExportConfig(prev => ({ ...prev, aggregation: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="sum">Sum</SelectItem>
                          <SelectItem value="avg">Average</SelectItem>
                          <SelectItem value="count">Count</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>Data Preview</span>
                  <Badge variant="outline">{filteredData.length} records</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {exportConfig.fields.length > 0 ? (
                  <div className="max-h-60 overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {exportConfig.fields.map(fieldId => {
                            const field = availableFields.find(f => f.id === fieldId)
                            return (
                              <th key={fieldId} className="text-left p-2 font-medium">
                                {field?.name || fieldId}
                              </th>
                            )
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.slice(0, 5).map((item, index) => (
                          <tr key={index} className="border-b">
                            {exportConfig.fields.map(fieldId => (
                              <td key={fieldId} className="p-2">
                                {String(item[fieldId] || '-')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredData.length > 5 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Showing 5 of {filteredData.length} records
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 text-center py-8">
                    Select fields to preview data
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Export Button */}
            <Button 
              onClick={handleExport} 
              disabled={isExporting || exportConfig.fields.length === 0}
              className="w-full min-h-[48px]"
            >
              {isExporting ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Exporting... {exportProgress}%</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export {filteredData.length} Records</span>
                </div>
              )}
            </Button>
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allTemplates.map(template => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => loadTemplate(template)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{template.name}</CardTitle>
                    <Badge variant="outline" size="sm">{template.category}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-gray-600">{template.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span>{template.format.toUpperCase()}</span>
                      <span>{template.fields.length} fields</span>
                    </div>
                    {template.schedule && (
                      <div className="flex items-center space-x-1 text-xs text-green-600">
                        <Clock className="h-3 w-3" />
                        <span>Scheduled</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Schedule */}
          {canSchedule && (
            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Schedule Export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Schedule Name</label>
                      <Input
                        value={scheduleConfig.name}
                        onChange={(e) => setScheduleConfig(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter schedule name"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Frequency</label>
                      <Select 
                        value={scheduleConfig.frequency} 
                        onValueChange={(value: ExportSchedule['frequency']) => 
                          setScheduleConfig(prev => ({ ...prev, frequency: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once">Once</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedTemplate && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Selected Template</h4>
                      <p className="text-sm">{selectedTemplate.name}</p>
                      <p className="text-xs text-gray-600">{selectedTemplate.description}</p>
                    </div>
                  )}

                  <Button onClick={handleSchedule} disabled={!selectedTemplate || !scheduleConfig.name}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Export
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
