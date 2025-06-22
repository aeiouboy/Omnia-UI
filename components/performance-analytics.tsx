"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Target,
  Zap,
  BarChart3,
  Users,
  Clock,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb
} from "lucide-react"
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine
} from "recharts"

interface PerformanceMetric {
  id: string
  name: string
  value: number
  target: number
  trend: number
  status: 'excellent' | 'good' | 'warning' | 'critical'
  unit: string
  description: string
}

interface Insight {
  id: string
  type: 'opportunity' | 'issue' | 'achievement' | 'trend'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
  recommendations?: string[]
  dataPoints?: any[]
}

interface PerformanceAnalyticsProps {
  data: {
    orders: any[]
    channels: any[]
    slaMetrics: any[]
    timeRange: string
  }
  isLoading: boolean
  className?: string
}

export function PerformanceAnalytics({ data, isLoading, className }: PerformanceAnalyticsProps) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Calculate performance metrics
  const metrics = useMemo((): PerformanceMetric[] => {
    if (!data.orders || data.orders.length === 0) return []

    const totalOrders = data.orders.length
    const completedOrders = data.orders.filter(o => o.status === 'DELIVERED' || o.status === 'FULFILLED').length
    const slaBreaches = data.orders.filter(o => o.sla_info?.status === 'BREACH').length
    const avgProcessingTime = data.orders.reduce((sum, o) => sum + (o.processing_time || 0), 0) / totalOrders
    const totalRevenue = data.orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)

    return [
      {
        id: 'fulfillment_rate',
        name: 'Fulfillment Rate',
        value: (completedOrders / totalOrders) * 100,
        target: 95,
        trend: 2.5,
        status: (completedOrders / totalOrders) * 100 >= 95 ? 'excellent' : 
               (completedOrders / totalOrders) * 100 >= 90 ? 'good' : 
               (completedOrders / totalOrders) * 100 >= 80 ? 'warning' : 'critical',
        unit: '%',
        description: 'Percentage of orders successfully fulfilled'
      },
      {
        id: 'sla_compliance',
        name: 'SLA Compliance',
        value: ((totalOrders - slaBreaches) / totalOrders) * 100,
        target: 98,
        trend: -1.2,
        status: ((totalOrders - slaBreaches) / totalOrders) * 100 >= 98 ? 'excellent' :
               ((totalOrders - slaBreaches) / totalOrders) * 100 >= 95 ? 'good' :
               ((totalOrders - slaBreaches) / totalOrders) * 100 >= 90 ? 'warning' : 'critical',
        unit: '%',
        description: 'Percentage of orders meeting SLA requirements'
      },
      {
        id: 'avg_processing_time',
        name: 'Avg Processing Time',
        value: avgProcessingTime,
        target: 15,
        trend: 0.8,
        status: avgProcessingTime <= 10 ? 'excellent' :
               avgProcessingTime <= 15 ? 'good' :
               avgProcessingTime <= 25 ? 'warning' : 'critical',
        unit: 'min',
        description: 'Average time to process an order'
      },
      {
        id: 'revenue_per_order',
        name: 'Revenue per Order',
        value: totalRevenue / totalOrders,
        target: 1500,
        trend: 5.2,
        status: (totalRevenue / totalOrders) >= 2000 ? 'excellent' :
               (totalRevenue / totalOrders) >= 1500 ? 'good' :
               (totalRevenue / totalOrders) >= 1000 ? 'warning' : 'critical',
        unit: '฿',
        description: 'Average revenue generated per order'
      }
    ]
  }, [data.orders])

  // Generate actionable insights
  const insights = useMemo((): Insight[] => {
    if (!metrics.length) return []

    const insights: Insight[] = []

    // SLA Compliance insights
    const slaMetric = metrics.find(m => m.id === 'sla_compliance')
    if (slaMetric) {
      if (slaMetric.status === 'critical' || slaMetric.status === 'warning') {
        insights.push({
          id: 'sla_improvement',
          type: 'issue',
          title: 'SLA Compliance Below Target',
          description: `Current SLA compliance at ${slaMetric.value.toFixed(1)}% is below the ${slaMetric.target}% target`,
          impact: 'high',
          actionable: true,
          recommendations: [
            'Review order processing workflows for bottlenecks',
            'Implement automated alerts for approaching SLA deadlines',
            'Analyze top channels contributing to SLA breaches',
            'Consider increasing staffing during peak hours'
          ]
        })
      } else if (slaMetric.status === 'excellent' && slaMetric.trend > 0) {
        insights.push({
          id: 'sla_achievement',
          type: 'achievement',
          title: 'Excellent SLA Performance',
          description: `SLA compliance at ${slaMetric.value.toFixed(1)}% exceeds target with positive trend`,
          impact: 'high',
          actionable: true,
          recommendations: [
            'Document current best practices for replication',
            'Share successful strategies across all channels',
            'Consider tightening SLA targets for continuous improvement'
          ]
        })
      }
    }

    // Processing Time insights
    const processingMetric = metrics.find(m => m.id === 'avg_processing_time')
    if (processingMetric && processingMetric.value > processingMetric.target) {
      insights.push({
        id: 'processing_optimization',
        type: 'opportunity',
        title: 'Processing Time Optimization Opportunity',
        description: `Average processing time of ${processingMetric.value.toFixed(1)} minutes exceeds target`,
        impact: 'medium',
        actionable: true,
        recommendations: [
          'Implement automated order validation processes',
          'Optimize inventory allocation algorithms',
          'Reduce manual touchpoints in order workflow',
          'Train staff on efficient processing techniques'
        ]
      })
    }

    // Revenue insights
    const revenueMetric = metrics.find(m => m.id === 'revenue_per_order')
    if (revenueMetric && revenueMetric.trend > 3) {
      insights.push({
        id: 'revenue_growth',
        type: 'trend',
        title: 'Strong Revenue Growth Trend',
        description: `Revenue per order showing ${revenueMetric.trend.toFixed(1)}% positive trend`,
        impact: 'high',
        actionable: true,
        recommendations: [
          'Analyze high-value order patterns for replication',
          'Identify successful product categories for expansion',
          'Implement upselling strategies during peak performance',
          'Monitor and maintain current successful practices'
        ]
      })
    }

    // Channel performance insights
    if (data.channels && data.channels.length > 0) {
      const topChannel = data.channels.reduce((prev, current) => 
        (prev.orders > current.orders) ? prev : current
      )
      const bottomChannel = data.channels.reduce((prev, current) => 
        (prev.orders < current.orders) ? prev : current
      )

      if (topChannel.orders > bottomChannel.orders * 3) {
        insights.push({
          id: 'channel_imbalance',
          type: 'opportunity',
          title: 'Channel Performance Imbalance',
          description: `${topChannel.channel} outperforming ${bottomChannel.channel} by ${Math.round(topChannel.orders / bottomChannel.orders)}x`,
          impact: 'medium',
          actionable: true,
          recommendations: [
            `Study ${topChannel.channel} success factors for application to other channels`,
            `Investigate ${bottomChannel.channel} performance barriers`,
            'Implement cross-channel best practice sharing',
            'Consider resource reallocation between channels'
          ]
        })
      }
    }

    return insights
  }, [metrics, data.channels])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
      case 'good': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Lightbulb className="h-5 w-5 text-blue-600" />
      case 'issue': return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'achievement': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'trend': return <TrendingUp className="h-5 w-5 text-purple-600" />
      default: return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-amber-100 text-amber-800 border-amber-200',
      low: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return (
      <Badge className={`text-xs ${colors[impact as keyof typeof colors]}`}>
        {impact.toUpperCase()} IMPACT
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Performance Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = metrics.map(metric => ({
    name: metric.name,
    value: metric.value,
    target: metric.target,
    status: metric.status
  }))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Performance Analytics</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((metric) => (
                <Card 
                  key={metric.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${
                    selectedMetric === metric.id ? 'ring-2 ring-blue-500' : ''
                  } ${getStatusColor(metric.status)}`}
                  onClick={() => setSelectedMetric(selectedMetric === metric.id ? null : metric.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {metric.id === 'fulfillment_rate' && <Target className="h-4 w-4" />}
                        {metric.id === 'sla_compliance' && <Clock className="h-4 w-4" />}
                        {metric.id === 'avg_processing_time' && <Zap className="h-4 w-4" />}
                        {metric.id === 'revenue_per_order' && <DollarSign className="h-4 w-4" />}
                      </div>
                      <div className="flex items-center space-x-1 text-xs">
                        {metric.trend > 0 ? (
                          <ArrowUpRight className="h-3 w-3 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red-600" />
                        )}
                        <span className={metric.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                          {Math.abs(metric.trend)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-2xl font-bold">
                        {metric.unit === '%' ? `${metric.value.toFixed(1)}%` : 
                         metric.unit === '฿' ? `฿${metric.value.toFixed(0)}` :
                         `${metric.value.toFixed(1)}${metric.unit}`}
                      </div>
                      <div className="text-sm font-medium text-gray-700">{metric.name}</div>
                      <div className="text-xs text-gray-500">{metric.description}</div>
                      
                      {/* Progress Bar */}
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Current</span>
                          <span>Target: {metric.target}{metric.unit === '%' ? '%' : metric.unit}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              metric.status === 'excellent' ? 'bg-emerald-500' :
                              metric.status === 'good' ? 'bg-green-500' :
                              metric.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ 
                              width: `${Math.min(100, (metric.value / metric.target) * 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance vs Target</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="target" fill="#e5e7eb" name="Target" />
                      <Bar dataKey="value" fill="#3b82f6" name="Current" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4 mt-6">
            {insights.length === 0 ? (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Available</h3>
                <p className="text-gray-600">Insights will appear when sufficient data is available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => (
                  <Card key={insight.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                            {getImpactBadge(insight.impact)}
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                          
                          {insight.recommendations && insight.actionable && (
                            <div className="mt-3">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Recommended Actions:</h4>
                              <ul className="space-y-1">
                                {insight.recommendations.map((rec, index) => (
                                  <li key={index} className="text-sm text-gray-600 flex items-start">
                                    <span className="text-blue-600 mr-2">•</span>
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Trend Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trend Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <span className="text-sm font-medium">{metric.name}</span>
                      <div className="flex items-center space-x-2">
                        {metric.trend > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${
                          metric.trend > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.trend > 0 ? '+' : ''}{metric.trend.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
