"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { setManualAuthToken } from "@/lib/auth-client"

export function TokenInjector() {
  const [token, setToken] = useState("")
  const [isInjecting, setIsInjecting] = useState(false)
  const { toast } = useToast()

  const handleInjectToken = async () => {
    if (!token.trim()) {
      toast({
        title: "Token Required",
        description: "Please enter your Bearer Token",
        variant: "destructive",
      })
      return
    }

    setIsInjecting(true)

    try {
      // Method 1: Use client-side injection
      setManualAuthToken(token.trim(), 3600)

      // Method 2: Also call the API endpoint
      const response = await fetch('/api/auth/external', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          manualToken: token.trim(),
          expiresIn: 3600
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "✅ Token Injected Successfully!",
          description: "Dashboard will now use real data. Refreshing page...",
          variant: "default",
        })

        // Refresh the page to load real data
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        throw new Error(result.error || "Failed to inject token")
      }
    } catch (error) {
      console.error("Token injection error:", error)
      toast({
        title: "❌ Token Injection Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsInjecting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">🔑 Bearer Token Injection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Paste your Bearer Token:</label>
          <Input
            type="password"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="font-mono text-xs"
          />
        </div>
        
        <Button 
          onClick={handleInjectToken}
          disabled={isInjecting || !token.trim()}
          className="w-full"
        >
          {isInjecting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Injecting Token...</span>
            </div>
          ) : (
            "🚀 Inject Token & Load Real Data"
          )}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• This will replace mock data with real merchant orders</p>
          <p>• Token expires in 1 hour</p>
          <p>• Page will refresh automatically after injection</p>
        </div>
      </CardContent>
    </Card>
  )
}
