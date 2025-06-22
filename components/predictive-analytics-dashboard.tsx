"use client"

import React, { useState, useMemo, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { 
  TrendingUp,
  TrendingDown,
  Brain,
  Zap,
  Target,
  AlertTriangle,
  BarChart3,
  LineChart,
  Activity,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Package,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  Settings,
  Play,
  Pause,
  RefreshCw
} from "lucide-react"
import { 
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea
} from "recharts"

interface PredictionModel {
  id: string
  name: string
  type: 'linear_regression' | 'arima' | 'prophet' | 'neural_network' | 'ensemble'
  accuracy: number
  lastTrained: Date
  status: 'active' | 'training' | 'inactive'
  description: string
}

interface Forecast {
  date: string
  predicted: number
  confidence_lower: number
  confidence_upper: number
  actual?: number
  trend: 'up' | 'down' | 'stable'
  seasonality?: number
}

interface AnomalyDetection {
  timestamp: Date
  value: number
  expected: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: 'outlier' | 'trend_change' | 'seasonal_anomaly' | 'drift'
  confidence: number
  description: string
}

interface ScenarioAnalysis {
  id: string
  name: string
  parameters: Record<string, number>
  impact: {
    orders: number
    revenue: number
    sla_compliance: number
    processing_time: number
  }
  probability: number
  risk_level: 'low' | 'medium' | 'high'
}

interface PredictiveInsight {
  id: string
  type: 'opportunity' | 'risk' | 'trend' | 'optimization'
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high'
  timeframe: string
  actionItems: string[]
  priority: number
}

interface PredictiveAnalyticsDashboardProps {
  historicalData: any[]
  realTimeData?: any[]
  enableAutoRefresh?: boolean
  forecastHorizon?: number // days
  confidenceInterval?: number // percentage
  onModelRetrain?: (modelId: string) => Promise<void>
  onScenarioCreate?: (scenario: Omit<ScenarioAnalysis, 'id'>) => Promise<void>
}

const PREDICTION_MODELS: PredictionModel[] = [
  {
    id: 'arima-orders',
    name: 'ARIMA Order Forecasting',
    type: 'arima',
    accuracy: 89.5,
    lastTrained: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'active',
    description: 'Time series forecasting for order volume with seasonal adjustments'
  },
  {
    id: 'prophet-revenue',
    name: 'Prophet Revenue Prediction',
    type: 'prophet',
    accuracy: 92.1,
    lastTrained: new Date(Date.now() - 12 * 60 * 60 * 1000),
    status: 'active',
    description: 'Revenue forecasting with holiday and trend detection'
  },
  {
    id: 'neural-sla',
    name: 'Neural Network SLA Predictor',
    type: 'neural_network',
    accuracy: 85.7,
    lastTrained: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'training',
    description: 'Deep learning model for SLA breach prediction'
  }
]

const SAMPLE_FORECASTS: Forecast[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() + i)
  const trend = Math.sin(i * 0.2) * 50 + Math.random() * 20
  const seasonal = Math.sin(i * 0.5) * 30
  const base = 1000 + trend + seasonal
  
  return {
    date: date.toISOString().split('T')[0],
    predicted: Math.round(base),
    confidence_lower: Math.round(base * 0.85),
    confidence_upper: Math.round(base * 1.15),
    trend: trend > 0 ? 'up' : trend < -10 ? 'down' : 'stable',
    seasonality: seasonal
  }
})

const SAMPLE_ANOMALIES: AnomalyDetection[] = [
  {
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    value: 1500,
    expected: 1100,
    severity: 'high',
    type: 'outlier',
    confidence: 0.92,
    description: 'Unusual spike in order volume, 36% above expected'
  },
  {
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    value: 850,
    expected: 1050,
    severity: 'medium',
    type: 'trend_change',
    confidence: 0.78,
    description: 'Downward trend detected in SLA compliance rate'
  }
]

const SAMPLE_INSIGHTS: PredictiveInsight[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'Peak Order Period Approaching',
    description: 'Model predicts 25% increase in orders over next 3 days. Consider scaling resources.',
    confidence: 87,
    impact: 'high',
    timeframe: '3 days',
    actionItems: [
      'Increase staff allocation for order processing',
      'Pre-position inventory at key locations',
      'Setup additional monitoring for SLA compliance'
    ],
    priority: 1
  },
  {
    id: '2',
    type: 'risk',
    title: 'SLA Breach Risk Elevated',
    description: 'Current processing patterns suggest 15% higher SLA breach probability.',
    confidence: 79,
    impact: 'medium',
    timeframe: '24 hours',
    actionItems: [
      'Review current order queue priorities',
      'Consider temporary SLA adjustment',
      'Escalate to operations team'
    ],
    priority: 2
  }
]

export function PredictiveAnalyticsDashboard({
  historicalData,
  realTimeData = [],
  enableAutoRefresh = true,
  forecastHorizon = 30,
  confidenceInterval = 80,
  onModelRetrain,
  onScenarioCreate
}: PredictiveAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('forecasts')
  const [selectedModel, setSelectedModel] = useState(PREDICTION_MODELS[0].id)
  const [forecastPeriod, setForecastPeriod] = useState(7)
  const [showConfidenceInterval, setShowConfidenceInterval] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(enableAutoRefresh)
  const [anomalyThreshold, setAnomalyThreshold] = useState([0.8])
  const [isRetraining, setIsRetraining] = useState(false)

  // Generate combined forecast data with actual vs predicted
  const forecastData = useMemo(() => {
    return SAMPLE_FORECASTS.slice(0, forecastPeriod).map((forecast, index) => ({
      ...forecast,
      day: `Day ${index + 1}`,
      actual: index < 7 ? Math.round(forecast.predicted * (0.9 + Math.random() * 0.2)) : undefined
    }))
  }, [forecastPeriod])

  // Calculate forecast accuracy
  const forecastAccuracy = useMemo(() => {
    const actualData = forecastData.filter(d => d.actual !== undefined)
    if (actualData.length === 0) return 0
    
    const accuracy = actualData.reduce((acc, d) => {
      const error = Math.abs(d.actual! - d.predicted) / d.predicted
      return acc + (1 - error)
    }, 0) / actualData.length
    
    return Math.round(accuracy * 100)
  }, [forecastData])

  // Retrain model
  const handleModelRetrain = useCallback(async (modelId: string) => {
    setIsRetraining(true)
    try {
      await onModelRetrain?.(modelId)
      // Simulate training time
      setTimeout(() => setIsRetraining(false), 3000)
    } catch (error) {
      console.error('Model retraining failed:', error)
      setIsRetraining(false)
    }
  }, [onModelRetrain])

  // Auto-refresh forecasts
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      // Simulate real-time data updates
      console.log('Refreshing forecasts...')
    }, 60000) // 1 minute
    
    return () => clearInterval(interval)
  }, [autoRefresh])

  // Get trend indicator
  const getTrendIndicator = (trend: string, value?: number) => {
    switch (trend) {
      case 'up':
        return { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' }
      case 'down':
        return { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' }
      default:
        return { icon: Minus, color: 'text-gray-600', bg: 'bg-gray-50' }
    }
  }

  // Get severity styling
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <span>AI Predictive Analytics</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Advanced forecasting and anomaly detection powered by machine learning
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              id="auto-refresh"
            />
            <label htmlFor="auto-refresh" className="text-sm">Auto-refresh</label>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure Models
          </Button>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Forecast Accuracy</p>
                <p className="text-2xl font-bold text-green-600">{forecastAccuracy}%</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Models</p>
                <p className="text-2xl font-bold">{PREDICTION_MODELS.filter(m => m.status === 'active').length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Brain className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Anomalies Detected</p>
                <p className="text-2xl font-bold text-orange-600">{SAMPLE_ANOMALIES.length}</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Insights</p>
                <p className="text-2xl font-bold text-purple-600">{SAMPLE_INSIGHTS.length}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Zap className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
        </TabsList>

        {/* Forecasts Tab */}
        <TabsContent value="forecasts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Predictive Forecasts</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm">Forecast Period:</label>
                <Select value={forecastPeriod.toString()} onValueChange={(value) => setForecastPeriod(parseInt(value))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showConfidenceInterval}
                  onCheckedChange={setShowConfidenceInterval}
                  id="confidence-interval"
                />
                <label htmlFor="confidence-interval" className="text-sm">Show Confidence Interval</label>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order Volume Forecast</span>
                <Badge variant="outline">
                  Accuracy: {forecastAccuracy}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        typeof value === 'number' ? value.toLocaleString() : value,
                        name === 'predicted' ? 'Predicted' :
                        name === 'actual' ? 'Actual' :
                        name === 'confidence_upper' ? 'Upper Bound' :
                        'Lower Bound'
                      ]}
                    />
                    <Legend />
                    
                    {/* Confidence Interval */}
                    {showConfidenceInterval && (
                      <Area
                        dataKey="confidence_upper"
                        stroke="none"
                        fill="#e0e7ff"
                        fillOpacity={0.3}
                      />
                    )}
                    
                    {/* Main Forecast Line */}
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Predicted"
                    />
                    
                    {/* Actual Data Points */}
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 6 }}
                      connectNulls={false}
                      name="Actual"
                    />
                    
                    {/* Reference line for current time */}
                    <ReferenceLine x="Day 7" stroke="#ef4444" strokeDasharray="2 2" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Forecast Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {forecastData.slice(0, 3).map((forecast, index) => {
              const trendConfig = getTrendIndicator(forecast.trend)
              const TrendIcon = trendConfig.icon
              
              return (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{forecast.day}</p>
                        <p className="text-xl font-bold">{forecast.predicted.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">
                          Range: {forecast.confidence_lower.toLocaleString()} - {forecast.confidence_upper.toLocaleString()}
                        </p>
                      </div>
                      <div className={`w-8 h-8 ${trendConfig.bg} rounded-full flex items-center justify-center`}>
                        <TrendIcon className={`h-4 w-4 ${trendConfig.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Anomalies Tab */}
        <TabsContent value="anomalies" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Anomaly Detection</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm">Sensitivity:</label>
                <Slider
                  value={anomalyThreshold}
                  onValueChange={setAnomalyThreshold}
                  max={1}
                  min={0.5}
                  step={0.1}
                  className="w-24"
                />
                <span className="text-sm text-gray-500">{Math.round(anomalyThreshold[0] * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SAMPLE_ANOMALIES.map((anomaly, index) => (
              <Card key={index} className={`border-l-4 ${getSeverityStyle(anomaly.severity)}`}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={getSeverityStyle(anomaly.severity)}>
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {anomaly.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div>
                      <p className="font-medium">{anomaly.type.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-sm text-gray-600">{anomaly.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Observed:</span>
                        <span className="font-medium ml-2">{anomaly.value.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Expected:</span>
                        <span className="font-medium ml-2">{anomaly.expected.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-gray-500">Confidence:</span>
                        <span className="font-medium ml-2">{Math.round(anomaly.confidence * 100)}%</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Investigate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <h3 className="text-lg font-semibold">AI-Generated Insights</h3>
          
          <div className="space-y-4">
            {SAMPLE_INSIGHTS.map((insight) => {
              const getInsightIcon = (type: string) => {
                switch (type) {
                  case 'opportunity': return { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' }
                  case 'risk': return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' }
                  case 'trend': return { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' }
                  default: return { icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' }
                }
              }
              
              const iconConfig = getInsightIcon(insight.type)
              const IconComponent = iconConfig.icon
              
              return (
                <Card key={insight.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 ${iconConfig.bg} rounded-lg flex items-center justify-center`}>
                            <IconComponent className={`h-5 w-5 ${iconConfig.color}`} />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-semibold">{insight.title}</h4>
                            <p className="text-sm text-gray-600">{insight.description}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant="outline" className="capitalize">
                            {insight.type}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            {insight.confidence}% confidence
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Impact:</span>
                          <Badge 
                            variant={insight.impact === 'high' ? 'destructive' : 'secondary'} 
                            size="sm" 
                            className="ml-2 capitalize"
                          >
                            {insight.impact}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-500">Timeframe:</span>
                          <span className="font-medium ml-2">{insight.timeframe}</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Recommended Actions:</p>
                        <ul className="text-sm space-y-1">
                          {insight.actionItems.map((action, actionIndex) => (
                            <li key={actionIndex} className="flex items-start space-x-2">
                              <span className="text-gray-400 mt-1">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="text-xs text-gray-500">
                          Priority {insight.priority}
                        </div>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">
                            <Info className="h-3 w-3 mr-1" />
                            More Details
                          </Button>
                          <Button size="sm">
                            Take Action
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Scenario Analysis</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Scenario
            </Button>
          </div>
          
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600">Scenario Modeling Coming Soon</h4>
            <p className="text-sm text-gray-500 mt-2">
              Create and analyze what-if scenarios to understand potential impacts
            </p>
          </div>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">ML Models</h3>
            <Button 
              onClick={() => handleModelRetrain(selectedModel)}
              disabled={isRetraining}
            >
              {isRetraining ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retraining...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Retrain Selected
                </>
              )}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PREDICTION_MODELS.map((model) => (
              <Card 
                key={model.id} 
                className={`cursor-pointer transition-all ${
                  selectedModel === model.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedModel(model.id)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{model.name}</h4>
                      <Badge 
                        variant={
                          model.status === 'active' ? 'default' :
                          model.status === 'training' ? 'secondary' : 'outline'
                        }
                      >
                        {model.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600">{model.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Accuracy</span>
                        <span className="font-medium">{model.accuracy}%</span>
                      </div>
                      <Progress value={model.accuracy} className="h-2" />
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Last trained: {model.lastTrained.toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
