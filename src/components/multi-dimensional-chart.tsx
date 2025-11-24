"use client"

import React, { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Filter, 
  X, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Grid3X3,
  Layers,
  Eye,
  EyeOff,
  RefreshCw,
  Download
} from "lucide-react"
import { 
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  AreaChart,
  Area
} from "recharts"

interface DataDimension {
  id: string
  name: string
  type: 'categorical' | 'numerical' | 'temporal'
  values: string[] | number[]
  color?: string
}

interface CrossFilter {
  dimensionId: string
  values: string[] | number[]
  operator: 'in' | 'not_in' | 'range' | 'equals'
}

interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area'
  xAxis: string
  yAxis: string
  groupBy?: string
  aggregation: 'sum' | 'count' | 'avg' | 'min' | 'max'
}

interface MultiDimensionalChartProps {
  data: any[]
  dimensions: DataDimension[]
  title: string
  height?: string
  onFiltersChange?: (filters: CrossFilter[]) => void
  enableExport?: boolean
}

const CHART_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", 
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
]

export function MultiDimensionalChart({
  data,
  dimensions,
  title,
  height = "h-[500px]",
  onFiltersChange,
  enableExport = true
}: MultiDimensionalChartProps) {
  const [activeFilters, setActiveFilters] = useState<CrossFilter[]>([])
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type: 'bar',
    xAxis: dimensions[0]?.id || '',
    yAxis: dimensions[1]?.id || '',
    aggregation: 'sum'
  })
  const [hiddenDimensions, setHiddenDimensions] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'single' | 'multiple'>('single')

  // Apply cross-filters to data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      return activeFilters.every(filter => {
        const value = item[filter.dimensionId]
        switch (filter.operator) {
          case 'in':
            return (filter.values as any[]).includes(value)
          case 'not_in':
            return !(filter.values as any[]).includes(value)
          case 'equals':
            return value === filter.values[0]
          case 'range':
            const [min, max] = filter.values as [number, number]
            return value >= min && value <= max
          default:
            return true
        }
      })
    })
  }, [data, activeFilters])

  // Process data for visualization
  const chartData = useMemo(() => {
    if (!filteredData.length) return []

    const { xAxis, yAxis, groupBy, aggregation } = chartConfig
    
    if (chartConfig.type === 'pie') {
      // Group by x-axis for pie chart
      const grouped = filteredData.reduce((acc, item) => {
        const key = item[xAxis]
        if (!acc[key]) acc[key] = []
        acc[key].push(item)
        return acc
      }, {})

      return (Object.entries(grouped) as [string, any[]][]).map(([name, items]) => ({
        name,
        value: aggregation === 'count' ? items.length :
               aggregation === 'sum' ? items.reduce((sum, item) => sum + (item[yAxis] || 0), 0) :
               aggregation === 'avg' ? items.reduce((sum, item) => sum + (item[yAxis] || 0), 0) / items.length :
               aggregation === 'min' ? Math.min(...items.map(item => item[yAxis] || 0)) :
               Math.max(...items.map(item => item[yAxis] || 0))
      }))
    }

    if (groupBy && groupBy !== xAxis) {
      // Multi-series data
      const grouped = filteredData.reduce((acc, item) => {
        const xKey = item[xAxis]
        const groupKey = item[groupBy]
        
        if (!acc[xKey]) acc[xKey] = { [xAxis]: xKey }
        if (!acc[xKey][groupKey]) acc[xKey][groupKey] = []
        acc[xKey][groupKey].push(item)
        return acc
      }, {})

      return Object.values(grouped).map((group: any) => {
        const result = { [xAxis]: group[xAxis] }
        Object.keys(group).forEach(key => {
          if (key !== xAxis && Array.isArray(group[key])) {
            const items = group[key]
            result[key] = aggregation === 'count' ? items.length :
                         aggregation === 'sum' ? items.reduce((sum, item) => sum + (item[yAxis] || 0), 0) :
                         aggregation === 'avg' ? items.reduce((sum, item) => sum + (item[yAxis] || 0), 0) / items.length :
                         aggregation === 'min' ? Math.min(...items.map(item => item[yAxis] || 0)) :
                         Math.max(...items.map(item => item[yAxis] || 0))
          }
        })
        return result
      })
    }

    // Simple aggregation by x-axis
    const grouped = filteredData.reduce((acc, item) => {
      const key = item[xAxis]
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {})

    return (Object.entries(grouped) as [string, any[]][]).map(([name, items]) => ({
      [xAxis]: name,
      [yAxis]: aggregation === 'count' ? items.length :
               aggregation === 'sum' ? items.reduce((sum, item) => sum + (item[yAxis] || 0), 0) :
               aggregation === 'avg' ? items.reduce((sum, item) => sum + (item[yAxis] || 0), 0) / items.length :
               aggregation === 'min' ? Math.min(...items.map(item => item[yAxis] || 0)) :
               Math.max(...items.map(item => item[yAxis] || 0))
    }))
  }, [filteredData, chartConfig])

  // Add cross-filter
  const addFilter = useCallback((dimensionId: string, values: any[], operator: CrossFilter['operator'] = 'in') => {
    const newFilter: CrossFilter = { dimensionId, values, operator }
    const updatedFilters = activeFilters.filter(f => f.dimensionId !== dimensionId)
    updatedFilters.push(newFilter)
    setActiveFilters(updatedFilters)
    onFiltersChange?.(updatedFilters)
  }, [activeFilters, onFiltersChange])

  // Remove cross-filter
  const removeFilter = useCallback((dimensionId: string) => {
    const updatedFilters = activeFilters.filter(f => f.dimensionId !== dimensionId)
    setActiveFilters(updatedFilters)
    onFiltersChange?.(updatedFilters)
  }, [activeFilters, onFiltersChange])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setActiveFilters([])
    onFiltersChange?.([])
  }, [onFiltersChange])

  // Toggle dimension visibility
  const toggleDimension = useCallback((dimensionId: string) => {
    const newHidden = new Set(hiddenDimensions)
    if (newHidden.has(dimensionId)) {
      newHidden.delete(dimensionId)
    } else {
      newHidden.add(dimensionId)
    }
    setHiddenDimensions(newHidden)
  }, [hiddenDimensions])

  // Render chart based on type
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    switch (chartConfig.type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartConfig.xAxis} />
            <YAxis />
            <Tooltip />
            <Legend />
            {chartConfig.groupBy ? (
              // Multi-series bars
              Object.keys(chartData[0] || {})
                .filter(key => key !== chartConfig.xAxis)
                .map((key, index) => (
                  <Bar 
                    key={key} 
                    dataKey={key} 
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    onClick={(data) => addFilter(chartConfig.groupBy!, [data.payload[chartConfig.groupBy!]])}
                  />
                ))
            ) : (
              <Bar
                dataKey={chartConfig.yAxis}
                fill={CHART_COLORS[0]}
                onClick={(data) => addFilter(chartConfig.xAxis, [data.payload[chartConfig.xAxis]])}
              />
            )}
          </BarChart>
        )

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartConfig.xAxis} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={chartConfig.yAxis} 
              stroke={CHART_COLORS[0]} 
              strokeWidth={2}
            />
          </LineChart>
        )

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartConfig.xAxis} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={chartConfig.yAxis} 
              stroke={CHART_COLORS[0]} 
              fill={CHART_COLORS[0]}
              fillOpacity={0.3}
            />
          </AreaChart>
        )

      case 'pie':
        return (
          <RechartsPieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              onClick={(data) => addFilter(chartConfig.xAxis, [data.name])}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </RechartsPieChart>
        )

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartConfig.xAxis} />
            <YAxis dataKey={chartConfig.yAxis} />
            <Tooltip />
            <Scatter fill={CHART_COLORS[0]} />
          </ScatterChart>
        )

      default:
        return <div>Unsupported chart type</div>
    }
  }

  // Get available values for a dimension
  const getDimensionValues = (dimensionId: string) => {
    const dimension = dimensions.find(d => d.id === dimensionId)
    if (!dimension) return []
    
    if (dimension.values.length > 0) {
      return dimension.values
    }
    
    // Extract unique values from data
    const uniqueValues = [...new Set(data.map(item => item[dimensionId]))]
    return uniqueValues.slice(0, 20) // Limit for performance
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Grid3X3 className="h-5 w-5" />
            <span>{title}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'single' ? 'multiple' : 'single')}
            >
              <Layers className="h-4 w-4 mr-1" />
              {viewMode === 'single' ? 'Multi-View' : 'Single View'}
            </Button>
            {enableExport && (
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex items-center space-x-2 pt-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.dimensionId}
                  variant="secondary"
                  className="flex items-center space-x-1"
                >
                  <span>{dimensions.find(d => d.id === filter.dimensionId)?.name}: {filter.values.join(', ')}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter(filter.dimensionId)}
                  />
                </Badge>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-6 px-2 text-xs"
              >
                Clear All
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Chart Configuration */}
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="filters">Cross-Filters</TabsTrigger>
            <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Chart Type</label>
                <Select 
                  value={chartConfig.type} 
                  onValueChange={(value: ChartConfig['type']) => 
                    setChartConfig(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                    <SelectItem value="scatter">Scatter Plot</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">X Axis</label>
                <Select 
                  value={chartConfig.xAxis} 
                  onValueChange={(value) => 
                    setChartConfig(prev => ({ ...prev, xAxis: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dimensions.map(dim => (
                      <SelectItem key={dim.id} value={dim.id}>{dim.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Y Axis</label>
                <Select 
                  value={chartConfig.yAxis} 
                  onValueChange={(value) => 
                    setChartConfig(prev => ({ ...prev, yAxis: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dimensions.filter(d => d.type === 'numerical').map(dim => (
                      <SelectItem key={dim.id} value={dim.id}>{dim.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Aggregation</label>
                <Select 
                  value={chartConfig.aggregation} 
                  onValueChange={(value: ChartConfig['aggregation']) => 
                    setChartConfig(prev => ({ ...prev, aggregation: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sum">Sum</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="avg">Average</SelectItem>
                    <SelectItem value="min">Minimum</SelectItem>
                    <SelectItem value="max">Maximum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {chartConfig.type !== 'pie' && (
              <div>
                <label className="text-sm font-medium">Group By (Optional)</label>
                <Select 
                  value={chartConfig.groupBy || ''} 
                  onValueChange={(value) => 
                    setChartConfig(prev => ({ ...prev, groupBy: value || undefined }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {dimensions.filter(d => d.type === 'categorical').map(dim => (
                      <SelectItem key={dim.id} value={dim.id}>{dim.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </TabsContent>

          <TabsContent value="filters" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dimensions.map(dimension => (
                <div key={dimension.id} className="space-y-2">
                  <label className="text-sm font-medium">{dimension.name}</label>
                  <Select onValueChange={(value) => addFilter(dimension.id, [value])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select value..." />
                    </SelectTrigger>
                    <SelectContent>
                      {getDimensionValues(dimension.id).map((value: any) => (
                        <SelectItem key={value} value={value}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="dimensions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dimensions.map(dimension => (
                <div key={dimension.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{dimension.name}</div>
                    <div className="text-sm text-gray-500">{dimension.type}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleDimension(dimension.id)}
                  >
                    {hiddenDimensions.has(dimension.id) ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Chart Visualization */}
        <div className={`${height} w-full`}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        {/* Data Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
          <span>Showing {filteredData.length} of {data.length} records</span>
          <span>{activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''} applied</span>
        </div>
      </CardContent>
    </Card>
  )
}
