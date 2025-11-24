"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Settings,
  Layout,
  Palette,
  Monitor,
  Smartphone,
  Tablet,
  Grid,
  Eye,
  EyeOff,
  Move,
  RotateCcw,
  Save,
  Download,
  Upload,
  User,
  Users,
  Building,
  Crown,
  Zap
} from "lucide-react"

interface WidgetConfig {
  id: string
  name: string
  type: 'kpi' | 'chart' | 'table' | 'alert' | 'custom'
  position: { x: number; y: number; w: number; h: number }
  visible: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  permissions: string[]
  refreshInterval?: number
  customSettings?: Record<string, any>
}

interface LayoutPreset {
  id: string
  name: string
  description: string
  category: 'executive' | 'operational' | 'analytical' | 'mobile'
  widgets: WidgetConfig[]
  theme: ThemeConfig
}

interface ThemeConfig {
  colorScheme: 'light' | 'dark' | 'auto'
  primaryColor: string
  density: 'compact' | 'comfortable' | 'spacious'
  fontSize: 'small' | 'medium' | 'large'
  animations: boolean
  reduceMotion: boolean
}

interface UserProfile {
  id: string
  name: string
  role: 'executive' | 'manager' | 'analyst' | 'operator'
  department: string
  preferences: {
    defaultLayout: string
    favoriteWidgets: string[]
    hiddenWidgets: string[]
    personalTheme: ThemeConfig
    autoSave: boolean
    shareSettings: boolean
  }
}

interface DashboardCustomizerProps {
  currentLayout: WidgetConfig[]
  availableWidgets: WidgetConfig[]
  userProfile: UserProfile
  onLayoutChange: (layout: WidgetConfig[]) => void
  onThemeChange: (theme: ThemeConfig) => void
  onPresetLoad: (preset: LayoutPreset) => void
  enableSharing?: boolean
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: 'orders-processing',
    name: 'Orders Processing',
    type: 'kpi',
    position: { x: 0, y: 0, w: 2, h: 1 },
    visible: true,
    priority: 'critical',
    permissions: ['read:orders'],
    refreshInterval: 30000
  },
  {
    id: 'sla-breaches',
    name: 'SLA Breaches',
    type: 'kpi',
    position: { x: 2, y: 0, w: 2, h: 1 },
    visible: true,
    priority: 'critical',
    permissions: ['read:sla'],
    refreshInterval: 15000
  },
  {
    id: 'channel-performance',
    name: 'Channel Performance',
    type: 'chart',
    position: { x: 0, y: 1, w: 4, h: 2 },
    visible: true,
    priority: 'high',
    permissions: ['read:analytics'],
    refreshInterval: 60000
  },
  {
    id: 'critical-alerts',
    name: 'Critical Alerts',
    type: 'alert',
    position: { x: 4, y: 0, w: 2, h: 3 },
    visible: true,
    priority: 'critical',
    permissions: ['read:alerts'],
    refreshInterval: 10000
  }
]

const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'executive-overview',
    name: 'Executive Overview',
    description: 'High-level KPIs and summary charts for executive decision making',
    category: 'executive',
    widgets: DEFAULT_WIDGETS.filter(w => w.priority === 'critical'),
    theme: {
      colorScheme: 'light',
      primaryColor: '#1e40af',
      density: 'comfortable',
      fontSize: 'medium',
      animations: true,
      reduceMotion: false
    }
  },
  {
    id: 'operational-control',
    name: 'Operational Control',
    description: 'Detailed operational metrics with real-time monitoring',
    category: 'operational',
    widgets: DEFAULT_WIDGETS,
    theme: {
      colorScheme: 'dark',
      primaryColor: '#059669',
      density: 'compact',
      fontSize: 'small',
      animations: true,
      reduceMotion: false
    }
  },
  {
    id: 'mobile-essential',
    name: 'Mobile Essential',
    description: 'Optimized layout for mobile devices with essential metrics',
    category: 'mobile',
    widgets: DEFAULT_WIDGETS.filter(w => w.priority === 'critical').map(w => ({
      ...w,
      position: { x: 0, y: w.position.y, w: 1, h: w.position.h }
    })),
    theme: {
      colorScheme: 'auto',
      primaryColor: '#7c3aed',
      density: 'spacious',
      fontSize: 'large',
      animations: false,
      reduceMotion: true
    }
  }
]

export function DashboardCustomizer({
  currentLayout,
  availableWidgets,
  userProfile,
  onLayoutChange,
  onThemeChange,
  onPresetLoad,
  enableSharing = true
}: DashboardCustomizerProps) {
  const [activeTab, setActiveTab] = useState('layout')
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)
  const [theme, setTheme] = useState<ThemeConfig>(userProfile.preferences.personalTheme)
  const [previewMode, setPreviewMode] = useState(false)
  const [savedLayouts, setSavedLayouts] = useState<LayoutPreset[]>([])

  // AI-powered layout suggestions based on user behavior
  const generateSmartSuggestions = useCallback(() => {
    const userRole = userProfile.role
    const department = userProfile.department
    const favoriteWidgets = userProfile.preferences.favoriteWidgets

    // Role-based recommendations
    const roleBasedWidgets = {
      executive: ['revenue-summary', 'sla-overview', 'critical-alerts'],
      manager: ['team-performance', 'sla-details', 'resource-allocation'],
      analyst: ['detailed-analytics', 'trend-analysis', 'data-explorer'],
      operator: ['order-queue', 'processing-status', 'urgent-actions']
    }

    // Department-specific widgets
    const departmentWidgets: Record<string, string[]> = {
      operations: ['fulfillment-metrics', 'inventory-status'],
      sales: ['revenue-analytics', 'channel-performance'],
      customer_service: ['sla-monitoring', 'escalation-queue'],
      logistics: ['delivery-tracking', 'capacity-planning']
    }

    return {
      roleRecommended: roleBasedWidgets[userRole] || [],
      departmentRecommended: departmentWidgets[department] || [],
      personalizedOrder: favoriteWidgets
    }
  }, [userProfile])

  // Auto-save functionality
  useEffect(() => {
    if (userProfile.preferences.autoSave) {
      const saveTimer = setTimeout(() => {
        localStorage.setItem('dashboard-layout', JSON.stringify(currentLayout))
        localStorage.setItem('dashboard-theme', JSON.stringify(theme))
      }, 2000)

      return () => clearTimeout(saveTimer)
    }
  }, [currentLayout, theme, userProfile.preferences.autoSave])

  // Widget management functions
  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    const updatedLayout = currentLayout.map(widget => 
      widget.id === widgetId 
        ? { ...widget, visible: !widget.visible }
        : widget
    )
    onLayoutChange(updatedLayout)
  }, [currentLayout, onLayoutChange])

  const updateWidgetPosition = useCallback((widgetId: string, position: WidgetConfig['position']) => {
    const updatedLayout = currentLayout.map(widget =>
      widget.id === widgetId
        ? { ...widget, position }
        : widget
    )
    onLayoutChange(updatedLayout)
  }, [currentLayout, onLayoutChange])

  const updateWidgetSettings = useCallback((widgetId: string, settings: Partial<WidgetConfig>) => {
    const updatedLayout = currentLayout.map(widget =>
      widget.id === widgetId
        ? { ...widget, ...settings }
        : widget
    )
    onLayoutChange(updatedLayout)
  }, [currentLayout, onLayoutChange])

  // Theme management
  const updateTheme = useCallback((updates: Partial<ThemeConfig>) => {
    const newTheme = { ...theme, ...updates }
    setTheme(newTheme)
    onThemeChange(newTheme)
  }, [theme, onThemeChange])

  // Layout export/import
  const exportLayout = useCallback(() => {
    const layoutData = {
      layout: currentLayout,
      theme,
      userProfile: userProfile.id,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(layoutData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-layout-${userProfile.name}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [currentLayout, theme, userProfile])

  const importLayout = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.layout && data.theme) {
          onLayoutChange(data.layout)
          setTheme(data.theme)
          onThemeChange(data.theme)
        }
      } catch (error) {
        console.error('Invalid layout file:', error)
      }
    }
    reader.readAsText(file)
  }, [onLayoutChange, onThemeChange])

  // Smart suggestions
  const suggestions = generateSmartSuggestions()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Customize Dashboard
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Layout className="h-5 w-5" />
            <span>Dashboard Customization</span>
            <Badge variant="outline">{userProfile.role}</Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="widgets">Widgets</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="ai">AI Suggest</TabsTrigger>
          </TabsList>

          {/* Layout Configuration */}
          <TabsContent value="layout" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Layout Configuration</h3>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setPreviewMode(!previewMode)}>
                  <Eye className="h-4 w-4 mr-1" />
                  {previewMode ? 'Edit' : 'Preview'}
                </Button>
                <Button variant="outline" size="sm" onClick={exportLayout}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <label>
                    <Upload className="h-4 w-4 mr-1" />
                    Import
                    <input
                      type="file"
                      accept=".json"
                      onChange={importLayout}
                      className="hidden"
                    />
                  </label>
                </Button>
              </div>
            </div>

            {/* Grid Layout Preview */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-6 gap-2 h-48">
                {currentLayout.map(widget => (
                  <div
                    key={widget.id}
                    className={`
                      border-2 rounded-md p-2 cursor-pointer transition-all
                      ${selectedWidget === widget.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
                      ${!widget.visible ? 'opacity-50' : ''}
                    `}
                    style={{
                      gridColumn: `span ${widget.position.w}`,
                      gridRow: `span ${widget.position.h}`
                    }}
                    onClick={() => setSelectedWidget(widget.id)}
                  >
                    <div className="text-xs font-medium truncate">{widget.name}</div>
                    <div className="text-xs text-gray-500">{widget.type}</div>
                    <Badge
                      variant={widget.priority === 'critical' ? 'destructive' : 'secondary'}
                      className="mt-1 text-xs"
                    >
                      {widget.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget Controls */}
            {selectedWidget && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Widget Settings: {currentLayout.find(w => w.id === selectedWidget)?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Width</label>
                      <Slider
                        value={[currentLayout.find(w => w.id === selectedWidget)?.position.w || 1]}
                        onValueChange={([value]) => 
                          updateWidgetPosition(selectedWidget, {
                            ...currentLayout.find(w => w.id === selectedWidget)!.position,
                            w: value
                          })
                        }
                        max={6}
                        min={1}
                        step={1}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Height</label>
                      <Slider
                        value={[currentLayout.find(w => w.id === selectedWidget)?.position.h || 1]}
                        onValueChange={([value]) => 
                          updateWidgetPosition(selectedWidget, {
                            ...currentLayout.find(w => w.id === selectedWidget)!.position,
                            h: value
                          })
                        }
                        max={4}
                        min={1}
                        step={1}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Visible</label>
                    <Switch
                      checked={currentLayout.find(w => w.id === selectedWidget)?.visible}
                      onCheckedChange={() => toggleWidgetVisibility(selectedWidget)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Refresh Interval (seconds)</label>
                    <Select
                      value={currentLayout.find(w => w.id === selectedWidget)?.refreshInterval?.toString() || '30000'}
                      onValueChange={(value) => 
                        updateWidgetSettings(selectedWidget, { refreshInterval: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5000">5 seconds</SelectItem>
                        <SelectItem value="10000">10 seconds</SelectItem>
                        <SelectItem value="30000">30 seconds</SelectItem>
                        <SelectItem value="60000">1 minute</SelectItem>
                        <SelectItem value="300000">5 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Widget Management */}
          <TabsContent value="widgets" className="space-y-4">
            <h3 className="text-lg font-medium">Available Widgets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {availableWidgets.map(widget => {
                const isActive = currentLayout.some(w => w.id === widget.id)
                return (
                  <Card key={widget.id} className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-blue-500' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{widget.name}</div>
                          <div className="text-sm text-gray-500">{widget.type}</div>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {widget.priority}
                          </Badge>
                        </div>
                        <Button
                          variant={isActive ? "destructive" : "default"}
                          size="sm"
                          onClick={() => {
                            if (isActive) {
                              onLayoutChange(currentLayout.filter(w => w.id !== widget.id))
                            } else {
                              onLayoutChange([...currentLayout, widget])
                            }
                          }}
                        >
                          {isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Theme Customization */}
          <TabsContent value="theme" className="space-y-4">
            <h3 className="text-lg font-medium">Theme Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Color Scheme</label>
                  <Select value={theme.colorScheme} onValueChange={(value: ThemeConfig['colorScheme']) => updateTheme({ colorScheme: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Density</label>
                  <Select value={theme.density} onValueChange={(value: ThemeConfig['density']) => updateTheme({ density: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Font Size</label>
                  <Select value={theme.fontSize} onValueChange={(value: ThemeConfig['fontSize']) => updateTheme({ fontSize: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Animations</label>
                  <Switch
                    checked={theme.animations}
                    onCheckedChange={(checked) => updateTheme({ animations: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Reduce Motion</label>
                  <Switch
                    checked={theme.reduceMotion}
                    onCheckedChange={(checked) => updateTheme({ reduceMotion: checked })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Primary Color</label>
                  <div className="grid grid-cols-6 gap-2 mt-2">
                    {['#1e40af', '#059669', '#dc2626', '#7c3aed', '#ea580c', '#0891b2'].map(color => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-md border-2 ${theme.primaryColor === color ? 'border-gray-900' : 'border-gray-300'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateTheme({ primaryColor: color })}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Layout Presets */}
          <TabsContent value="presets" className="space-y-4">
            <h3 className="text-lg font-medium">Layout Presets</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LAYOUT_PRESETS.map(preset => (
                <Card key={preset.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{preset.name}</CardTitle>
                      <Badge variant="outline">{preset.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">{preset.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{preset.widgets.length} widgets</span>
                      <Button
                        size="sm"
                        onClick={() => onPresetLoad(preset)}
                      >
                        Apply Preset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Suggestions */}
          <TabsContent value="ai" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-medium">AI-Powered Suggestions</h3>
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Role-Based Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Based on your role as {userProfile.role}, we recommend these widgets:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.roleRecommended.map(widgetId => (
                      <Badge key={widgetId} variant="outline">{widgetId}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>Department Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Popular widgets for {userProfile.department} department:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.departmentRecommended.map(widgetId => (
                      <Badge key={widgetId} variant="outline">{widgetId}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Crown className="h-4 w-4" />
                    <span>Personal Favorites</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Your most frequently used widgets:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.personalizedOrder.map(widgetId => (
                      <Badge key={widgetId} variant="default">{widgetId}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset to Default
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            {enableSharing && (
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-1" />
                Share Layout
              </Button>
            )}
            <Button size="sm">
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
