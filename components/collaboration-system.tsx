"use client"

import React, { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  MessageSquare,
  Share2,
  Users,
  Eye,
  Edit,
  Lock,
  Unlock,
  Pin,
  Send,
  Reply,
  ThumbsUp,
  ThumbsDown,
  Flag,
  X,
  Copy,
  Download,
  Mail,
  Bookmark,
  Clock,
  MapPin,
  Zap,
  AlertCircle,
  CheckCircle,
  Info,
  Settings,
  Plus,
  Minus
} from "lucide-react"

interface Annotation {
  id: string
  type: 'comment' | 'highlight' | 'question' | 'issue' | 'suggestion'
  content: string
  author: {
    id: string
    name: string
    avatar?: string
    role: string
  }
  position: {
    x: number
    y: number
    elementId?: string
    chartArea?: string
  }
  timestamp: Date
  isResolved: boolean
  replies?: AnnotationReply[]
  likes: number
  tags: string[]
  visibility: 'public' | 'team' | 'private'
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

interface AnnotationReply {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: Date
}

interface ShareConfig {
  id: string
  title: string
  description: string
  recipients: ShareRecipient[]
  permissions: SharePermissions
  expiresAt?: Date
  password?: string
  allowAnnotations: boolean
  allowExport: boolean
  trackViews: boolean
  createdAt: Date
  views: number
  lastAccessed?: Date
}

interface ShareRecipient {
  id: string
  email: string
  name: string
  role: 'viewer' | 'commenter' | 'editor'
  department?: string
  hasAccessed: boolean
  lastAccessed?: Date
}

interface SharePermissions {
  canView: boolean
  canComment: boolean
  canEdit: boolean
  canShare: boolean
  canExport: boolean
  canAnnotate: boolean
}

interface CollaborationSystemProps {
  currentUser: {
    id: string
    name: string
    email: string
    avatar?: string
    role: string
    department: string
  }
  dashboardId: string
  onAnnotationCreate: (annotation: Omit<Annotation, 'id' | 'timestamp'>) => Promise<Annotation>
  onAnnotationUpdate: (id: string, updates: Partial<Annotation>) => Promise<void>
  onAnnotationDelete: (id: string) => Promise<void>
  onShare: (config: Omit<ShareConfig, 'id' | 'createdAt' | 'views'>) => Promise<ShareConfig>
  annotations?: Annotation[]
  sharedConfigs?: ShareConfig[]
  enableRealTimeCollaboration?: boolean
}

const ANNOTATION_TYPES = [
  { id: 'comment', label: 'Comment', icon: MessageSquare, color: 'blue' },
  { id: 'highlight', label: 'Highlight', icon: Pin, color: 'yellow' },
  { id: 'question', label: 'Question', icon: Info, color: 'purple' },
  { id: 'issue', label: 'Issue', icon: AlertCircle, color: 'red' },
  { id: 'suggestion', label: 'Suggestion', icon: Zap, color: 'green' }
] as const

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
}

export function CollaborationSystem({
  currentUser,
  dashboardId,
  onAnnotationCreate,
  onAnnotationUpdate,
  onAnnotationDelete,
  onShare,
  annotations = [],
  sharedConfigs = [],
  enableRealTimeCollaboration = true
}: CollaborationSystemProps) {
  const [activeTab, setActiveTab] = useState('annotations')
  const [showAnnotationMode, setShowAnnotationMode] = useState(false)
  const [selectedAnnotationType, setSelectedAnnotationType] = useState<Annotation['type']>('comment')
  const [newAnnotation, setNewAnnotation] = useState<Partial<Annotation>>({})
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null)
  const [annotationFilters, setAnnotationFilters] = useState({
    type: 'all',
    author: 'all',
    status: 'all',
    priority: 'all'
  })
  const [shareConfig, setShareConfig] = useState<Partial<ShareConfig>>({
    title: '',
    description: '',
    recipients: [],
    permissions: {
      canView: true,
      canComment: false,
      canEdit: false,
      canShare: false,
      canExport: false,
      canAnnotate: false
    },
    allowAnnotations: true,
    allowExport: false,
    trackViews: true
  })
  const [replyText, setReplyText] = useState('')
  const [isCreatingAnnotation, setIsCreatingAnnotation] = useState(false)

  // Filter annotations based on current filters
  const filteredAnnotations = useMemo(() => {
    return annotations.filter(annotation => {
      if (annotationFilters.type !== 'all' && annotation.type !== annotationFilters.type) {
        return false
      }
      if (annotationFilters.author !== 'all' && annotation.author.id !== annotationFilters.author) {
        return false
      }
      if (annotationFilters.status !== 'all') {
        if (annotationFilters.status === 'resolved' && !annotation.isResolved) return false
        if (annotationFilters.status === 'unresolved' && annotation.isResolved) return false
      }
      if (annotationFilters.priority !== 'all' && annotation.priority !== annotationFilters.priority) {
        return false
      }
      return true
    })
  }, [annotations, annotationFilters])

  // Create new annotation
  const createAnnotation = useCallback(async (position: { x: number; y: number }, elementId?: string) => {
    if (!newAnnotation.content?.trim()) return

    setIsCreatingAnnotation(true)
    try {
      const annotationData: Omit<Annotation, 'id' | 'timestamp'> = {
        type: selectedAnnotationType,
        content: newAnnotation.content,
        author: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          role: currentUser.role
        },
        position: { x: position.x, y: position.y, elementId },
        isResolved: false,
        likes: 0,
        tags: newAnnotation.tags || [],
        visibility: newAnnotation.visibility || 'team',
        priority: newAnnotation.priority || 'medium'
      }

      await onAnnotationCreate(annotationData)
      setNewAnnotation({})
      setShowAnnotationMode(false)
    } catch (error) {
      console.error('Failed to create annotation:', error)
    } finally {
      setIsCreatingAnnotation(false)
    }
  }, [newAnnotation, selectedAnnotationType, currentUser, onAnnotationCreate])

  // Toggle annotation resolution
  const toggleAnnotationResolution = useCallback(async (annotationId: string, isResolved: boolean) => {
    try {
      await onAnnotationUpdate(annotationId, { isResolved })
    } catch (error) {
      console.error('Failed to update annotation:', error)
    }
  }, [onAnnotationUpdate])

  // Add reply to annotation
  const addReply = useCallback(async (annotationId: string) => {
    if (!replyText.trim()) return

    const annotation = annotations.find(a => a.id === annotationId)
    if (!annotation) return

    const newReply: AnnotationReply = {
      id: `reply-${Date.now()}`,
      content: replyText,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar
      },
      timestamp: new Date()
    }

    const updatedReplies = [...(annotation.replies || []), newReply]
    await onAnnotationUpdate(annotationId, { replies: updatedReplies })
    setReplyText('')
  }, [replyText, annotations, currentUser, onAnnotationUpdate])

  // Share dashboard
  const shareDashboard = useCallback(async () => {
    if (!shareConfig.title?.trim() || !shareConfig.recipients?.length) return

    try {
      await onShare(shareConfig as Omit<ShareConfig, 'id' | 'createdAt' | 'views'>)
      setShareConfig({
        title: '',
        description: '',
        recipients: [],
        permissions: {
          canView: true,
          canComment: false,
          canEdit: false,
          canShare: false,
          canExport: false,
          canAnnotate: false
        },
        allowAnnotations: true,
        allowExport: false,
        trackViews: true
      })
    } catch (error) {
      console.error('Failed to share dashboard:', error)
    }
  }, [shareConfig, onShare])

  // Add recipient to share config
  const addRecipient = useCallback((email: string, name: string, role: ShareRecipient['role'] = 'viewer') => {
    const newRecipient: ShareRecipient = {
      id: `recipient-${Date.now()}`,
      email,
      name,
      role,
      hasAccessed: false
    }
    setShareConfig(prev => ({
      ...prev,
      recipients: [...(prev.recipients || []), newRecipient]
    }))
  }, [])

  // Get annotation type config
  const getAnnotationTypeConfig = (type: Annotation['type']) => {
    return ANNOTATION_TYPES.find(t => t.id === type) || ANNOTATION_TYPES[0]
  }

  // Render annotation marker
  const renderAnnotationMarker = (annotation: Annotation) => {
    const typeConfig = getAnnotationTypeConfig(annotation.type)
    const IconComponent = typeConfig.icon

    return (
      <Popover key={annotation.id}>
        <PopoverTrigger asChild>
          <button
            className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
              annotation.isResolved ? 'bg-gray-400' : `bg-${typeConfig.color}-500`
            } text-white hover:scale-110 transition-transform z-10`}
            style={{
              left: `${annotation.position.x}px`,
              top: `${annotation.position.y}px`
            }}
          >
            <IconComponent className="h-3 w-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={annotation.author.avatar} />
                  <AvatarFallback className="text-xs">
                    {annotation.author.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">{annotation.author.name}</div>
                  <div className="text-xs text-gray-500">{annotation.timestamp.toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Badge variant="outline" size="sm">
                  {typeConfig.label}
                </Badge>
                <Badge 
                  size="sm" 
                  className={PRIORITY_COLORS[annotation.priority]}
                >
                  {annotation.priority}
                </Badge>
              </div>
            </div>

            <div className="text-sm">{annotation.content}</div>

            {annotation.tags && annotation.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {annotation.tags.map(tag => (
                  <Badge key={tag} variant="secondary" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  {annotation.likes}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleAnnotationResolution(annotation.id, !annotation.isResolved)}
                >
                  {annotation.isResolved ? <Unlock className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAnnotationDelete(annotation.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {/* Replies */}
            {annotation.replies && annotation.replies.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <div className="text-xs font-medium text-gray-600">
                  {annotation.replies.length} {annotation.replies.length === 1 ? 'Reply' : 'Replies'}
                </div>
                {annotation.replies.map(reply => (
                  <div key={reply.id} className="flex space-x-2 text-sm">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={reply.author.avatar} />
                      <AvatarFallback className="text-xs">
                        {reply.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{reply.author.name}</div>
                      <div className="text-gray-600">{reply.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input */}
            <div className="flex space-x-2 pt-2 border-t">
              <Input
                placeholder="Add a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1"
                size="sm"
              />
              <Button size="sm" onClick={() => addReply(annotation.id)}>
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <>
      {/* Annotation Markers Overlay */}
      {annotations.map(renderAnnotationMarker)}

      {/* Collaboration Panel */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            Collaborate
            {annotations.filter(a => !a.isResolved).length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {annotations.filter(a => !a.isResolved).length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Dashboard Collaboration</span>
              {enableRealTimeCollaboration && (
                <Badge variant="outline">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Live
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="annotations">
                Annotations ({filteredAnnotations.length})
              </TabsTrigger>
              <TabsTrigger value="sharing">
                Sharing ({sharedConfigs.length})
              </TabsTrigger>
              <TabsTrigger value="activity">
                Activity
              </TabsTrigger>
            </TabsList>

            {/* Annotations Tab */}
            <TabsContent value="annotations" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={showAnnotationMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowAnnotationMode(!showAnnotationMode)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {showAnnotationMode ? 'Exit Annotation Mode' : 'Add Annotation'}
                  </Button>
                  {showAnnotationMode && (
                    <Select value={selectedAnnotationType} onValueChange={(value: Annotation['type']) => setSelectedAnnotationType(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ANNOTATION_TYPES.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center space-x-2">
                              <type.icon className="h-4 w-4" />
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Annotation Filters */}
                <div className="flex items-center space-x-2">
                  <Select value={annotationFilters.type} onValueChange={(value) => setAnnotationFilters(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {ANNOTATION_TYPES.map(type => (
                        <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={annotationFilters.status} onValueChange={(value) => setAnnotationFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="unresolved">Unresolved</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* New Annotation Form */}
              {showAnnotationMode && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Create New Annotation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Enter your annotation..."
                      value={newAnnotation.content || ''}
                      onChange={(e) => setNewAnnotation(prev => ({ ...prev, content: e.target.value }))}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Select 
                        value={newAnnotation.priority || 'medium'} 
                        onValueChange={(value: Annotation['priority']) => setNewAnnotation(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select 
                        value={newAnnotation.visibility || 'team'} 
                        onValueChange={(value: Annotation['visibility']) => setNewAnnotation(prev => ({ ...prev, visibility: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="team">Team</SelectItem>
                          <SelectItem value="public">Public</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="text-xs text-gray-500">
                      Click anywhere on the dashboard to place your annotation
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Annotations List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredAnnotations.map(annotation => {
                  const typeConfig = getAnnotationTypeConfig(annotation.type)
                  const IconComponent = typeConfig.icon

                  return (
                    <Card key={annotation.id} className={`cursor-pointer transition-all ${
                      annotation.isResolved ? 'opacity-60' : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            annotation.isResolved ? 'bg-gray-400' : `bg-${typeConfig.color}-500`
                          } text-white`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{annotation.author.name}</span>
                                <Badge variant="outline" size="sm">{typeConfig.label}</Badge>
                                <Badge size="sm" className={PRIORITY_COLORS[annotation.priority]}>
                                  {annotation.priority}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-500">
                                {annotation.timestamp.toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-sm text-gray-700">{annotation.content}</div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm">
                                  <ThumbsUp className="h-3 w-3 mr-1" />
                                  {annotation.likes}
                                </Button>
                                {annotation.replies && annotation.replies.length > 0 && (
                                  <Button variant="ghost" size="sm">
                                    <Reply className="h-3 w-3 mr-1" />
                                    {annotation.replies.length}
                                  </Button>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleAnnotationResolution(annotation.id, !annotation.isResolved)}
                              >
                                {annotation.isResolved ? (
                                  <>
                                    <Unlock className="h-3 w-3 mr-1" />
                                    Reopen
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Resolve
                                  </>
                                )}
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

            {/* Sharing Tab */}
            <TabsContent value="sharing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Share Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Share title"
                      value={shareConfig.title || ''}
                      onChange={(e) => setShareConfig(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <Input
                      placeholder="Recipient email"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const email = e.currentTarget.value
                          if (email) {
                            addRecipient(email, email, 'viewer')
                            e.currentTarget.value = ''
                          }
                        }
                      }}
                    />
                  </div>
                  
                  <Textarea
                    placeholder="Description (optional)"
                    value={shareConfig.description || ''}
                    onChange={(e) => setShareConfig(prev => ({ ...prev, description: e.target.value }))}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Allow Comments</label>
                        <Switch
                          checked={shareConfig.permissions?.canComment}
                          onCheckedChange={(checked) => 
                            setShareConfig(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions!, canComment: checked }
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Allow Export</label>
                        <Switch
                          checked={shareConfig.allowExport}
                          onCheckedChange={(checked) => 
                            setShareConfig(prev => ({ ...prev, allowExport: checked }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Track Views</label>
                        <Switch
                          checked={shareConfig.trackViews}
                          onCheckedChange={(checked) => 
                            setShareConfig(prev => ({ ...prev, trackViews: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Allow Annotations</label>
                        <Switch
                          checked={shareConfig.allowAnnotations}
                          onCheckedChange={(checked) => 
                            setShareConfig(prev => ({ ...prev, allowAnnotations: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recipients List */}
                  {shareConfig.recipients && shareConfig.recipients.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Recipients</label>
                      <div className="space-y-2">
                        {shareConfig.recipients.map(recipient => (
                          <div key={recipient.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <div className="font-medium">{recipient.email}</div>
                              <Badge variant="outline" size="sm">{recipient.role}</Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => 
                                setShareConfig(prev => ({
                                  ...prev,
                                  recipients: prev.recipients?.filter(r => r.id !== recipient.id)
                                }))
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button onClick={shareDashboard} className="w-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Dashboard
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Shares */}
              {sharedConfigs.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Active Shares</h4>
                  {sharedConfigs.map(config => (
                    <Card key={config.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{config.title}</div>
                            <div className="text-sm text-gray-500">
                              {config.recipients.length} recipient{config.recipients.length !== 1 ? 's' : ''} • 
                              {config.views} view{config.views !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4">
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Activity feed coming soon</p>
                <p className="text-xs text-gray-500">Track all collaboration activities here</p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}