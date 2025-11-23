"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ComponentShowcase } from "./component-showcase"
import { ColorSwatch } from "./color-swatch"
import { TypographyShowcase } from "./typography-showcase"
import { SpacingShowcase } from "./spacing-showcase"
import { BreakpointShowcase } from "./breakpoint-showcase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Loader2 } from "lucide-react"

export function StyleGuideContent() {
  const [sliderValue, setSliderValue] = useState([50])
  const [checked, setChecked] = useState(false)
  const [switchOn, setSwitchOn] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-enterprise-dark mb-2">Style Guide</h1>
        <p className="text-enterprise-text-light">
          Comprehensive design system documentation for Central Group OMS
        </p>
      </div>

      {/* Tabs for Different Sections */}
      <Tabs defaultValue="components" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="spacing">Spacing</TabsTrigger>
          <TabsTrigger value="breakpoints">Breakpoints</TabsTrigger>
        </TabsList>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-8">
          {/* Buttons Section */}
          <div>
            <h2 className="text-2xl font-semibold text-enterprise-dark mb-4">Buttons</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <ComponentShowcase
                title="Button Variants"
                description="All available button style variants"
                preview={
                  <div className="flex flex-wrap gap-3">
                    <Button>Default</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </div>
                }
                code={`<Button>Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`}
              />

              <ComponentShowcase
                title="Button Sizes"
                description="Available button sizes"
                preview={
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon">
                      <AlertCircle className="h-4 w-4" />
                    </Button>
                  </div>
                }
                code={`<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">
  <AlertCircle className="h-4 w-4" />
</Button>`}
              />

              <ComponentShowcase
                title="Button States"
                description="Loading and disabled states"
                preview={
                  <div className="flex flex-wrap gap-3">
                    <Button disabled>Disabled</Button>
                    <Button>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading
                    </Button>
                  </div>
                }
                code={`<Button disabled>Disabled</Button>
<Button>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading
</Button>`}
              />
            </div>
          </div>

          <Separator />

          {/* Badges Section */}
          <div>
            <h2 className="text-2xl font-semibold text-enterprise-dark mb-4">Badges</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <ComponentShowcase
                title="Badge Variants"
                description="All available badge variants"
                preview={
                  <div className="flex flex-wrap gap-3">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                }
                code={`<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>`}
              />
            </div>
          </div>

          <Separator />

          {/* Alerts Section */}
          <div>
            <h2 className="text-2xl font-semibold text-enterprise-dark mb-4">Alerts</h2>
            <div className="grid gap-6">
              <ComponentShowcase
                title="Alert Variants"
                description="Different alert types with icons"
                preview={
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Information</AlertTitle>
                      <AlertDescription>This is an informational alert message.</AlertDescription>
                    </Alert>
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>This is an error alert message.</AlertDescription>
                    </Alert>
                  </div>
                }
                code={`<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>This is an informational alert message.</AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>This is an error alert message.</AlertDescription>
</Alert>`}
              />
            </div>
          </div>

          <Separator />

          {/* Form Inputs Section */}
          <div>
            <h2 className="text-2xl font-semibold text-enterprise-dark mb-4">Form Inputs</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <ComponentShowcase
                title="Text Input"
                description="Standard text input field"
                preview={
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Enter your email" />
                  </div>
                }
                code={`<Label htmlFor="email">Email</Label>
<Input id="email" type="email" placeholder="Enter your email" />`}
              />

              <ComponentShowcase
                title="Checkbox"
                description="Checkbox input component"
                preview={
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" checked={checked} onCheckedChange={(c) => setChecked(!!c)} />
                    <Label htmlFor="terms">Accept terms and conditions</Label>
                  </div>
                }
                code={`<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>`}
              />

              <ComponentShowcase
                title="Switch"
                description="Toggle switch component"
                preview={
                  <div className="flex items-center space-x-2">
                    <Switch id="notifications" checked={switchOn} onCheckedChange={setSwitchOn} />
                    <Label htmlFor="notifications">Enable notifications</Label>
                  </div>
                }
                code={`<div className="flex items-center space-x-2">
  <Switch id="notifications" />
  <Label htmlFor="notifications">Enable notifications</Label>
</div>`}
              />

              <ComponentShowcase
                title="Slider"
                description="Range slider component"
                preview={
                  <div className="space-y-2">
                    <Label>Volume: {sliderValue[0]}%</Label>
                    <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
                  </div>
                }
                code={`<Label>Volume: {value}%</Label>
<Slider value={value} onValueChange={setValue} max={100} step={1} />`}
              />
            </div>
          </div>

          <Separator />

          {/* Cards Section */}
          <div>
            <h2 className="text-2xl font-semibold text-enterprise-dark mb-4">Cards</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <ComponentShowcase
                title="Card with Header"
                description="Card with title and description"
                preview={
                  <Card>
                    <CardHeader>
                      <CardTitle>Card Title</CardTitle>
                      <CardDescription>Card description text goes here</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-enterprise-text">This is the card content area.</p>
                    </CardContent>
                  </Card>
                }
                code={`<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>This is the card content area.</p>
  </CardContent>
</Card>`}
              />
            </div>
          </div>

          <Separator />

          {/* Progress & Loading Section */}
          <div>
            <h2 className="text-2xl font-semibold text-enterprise-dark mb-4">Progress & Loading</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <ComponentShowcase
                title="Progress Bar"
                description="Progress indicator component"
                preview={
                  <div className="space-y-2">
                    <Label>Progress: 65%</Label>
                    <Progress value={65} />
                  </div>
                }
                code={`<Progress value={65} />`}
              />

              <ComponentShowcase
                title="Skeleton Loader"
                description="Loading skeleton component"
                preview={
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                }
                code={`<Skeleton className="h-4 w-full" />
<Skeleton className="h-4 w-3/4" />
<Skeleton className="h-4 w-1/2" />`}
              />
            </div>
          </div>

          <Separator />

          {/* Avatar Section */}
          <div>
            <h2 className="text-2xl font-semibold text-enterprise-dark mb-4">Avatars</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <ComponentShowcase
                title="Avatar Variants"
                description="Avatar with image and fallback"
                preview={
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  </div>
                }
                code={`<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>
<Avatar>
  <AvatarFallback>JD</AvatarFallback>
</Avatar>`}
              />
            </div>
          </div>

          <Separator />

          {/* Separator Section */}
          <div>
            <h2 className="text-2xl font-semibold text-enterprise-dark mb-4">Separator</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <ComponentShowcase
                title="Horizontal Separator"
                description="Visual divider between sections"
                preview={
                  <div className="space-y-4">
                    <p className="text-sm">Content above</p>
                    <Separator />
                    <p className="text-sm">Content below</p>
                  </div>
                }
                code={`<p>Content above</p>
<Separator />
<p>Content below</p>`}
              />
            </div>
          </div>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-enterprise-dark mb-4">Enterprise Colors</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ColorSwatch
                name="Enterprise Dark"
                value="#1a2233"
                usage="Dark header background"
                className="bg-enterprise-dark"
              />
              <ColorSwatch
                name="Enterprise Blue"
                value="#0f172a"
                usage="Dark blue for panels"
                className="bg-enterprise-blue"
              />
              <ColorSwatch
                name="Enterprise Light"
                value="#f8fafc"
                usage="Light background"
                className="bg-enterprise-light"
              />
              <ColorSwatch
                name="Enterprise Border"
                value="#e2e8f0"
                usage="Border color"
                className="bg-enterprise-border"
              />
              <ColorSwatch
                name="Enterprise Text"
                value="#334155"
                usage="Main text color"
                className="bg-enterprise-text"
              />
              <ColorSwatch
                name="Enterprise Text Light"
                value="#64748b"
                usage="Secondary text"
                className="bg-enterprise-text-light"
              />
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-2xl font-semibold text-enterprise-dark mb-4">Status Colors</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ColorSwatch
                name="Success"
                value="#10b981"
                usage="Positive metrics and actions"
                className="bg-status-success"
              />
              <ColorSwatch
                name="Warning"
                value="#f59e0b"
                usage="Warnings and caution"
                className="bg-status-warning"
              />
              <ColorSwatch
                name="Critical"
                value="#ef4444"
                usage="Critical issues and errors"
                className="bg-status-critical"
              />
              <ColorSwatch
                name="Info"
                value="#3b82f6"
                usage="Information and highlights"
                className="bg-status-info"
              />
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-2xl font-semibold text-enterprise-dark mb-4">Business Unit Colors</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ColorSwatch
                name="Tops Green"
                value="#10b981"
                usage="Tops supermarket brand"
                className="bg-tops-green"
              />
              <ColorSwatch
                name="Central Orange"
                value="#f97316"
                usage="Central department store brand"
                className="bg-central-orange"
              />
              <ColorSwatch
                name="Supersports Blue"
                value="#3b82f6"
                usage="Supersports brand"
                className="bg-supersports-blue"
              />
            </div>
          </div>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography">
          <TypographyShowcase />
        </TabsContent>

        {/* Spacing Tab */}
        <TabsContent value="spacing">
          <SpacingShowcase />
        </TabsContent>

        {/* Breakpoints Tab */}
        <TabsContent value="breakpoints">
          <BreakpointShowcase />
        </TabsContent>
      </Tabs>
    </div>
  )
}
