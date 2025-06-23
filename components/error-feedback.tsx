import { Alert, AlertDescription } from "@/components/ui/alert"
import { WifiOff, CheckCircle } from "lucide-react"

interface ConnectionStatusProps {
  isConnected: boolean
  message?: string
}

export function ConnectionStatus({ isConnected, message }: ConnectionStatusProps) {
  if (isConnected) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          {message || "Connected to server"}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="border-red-200 bg-red-50">
      <WifiOff className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        {message || "Connection lost. Retrying..."}
      </AlertDescription>
    </Alert>
  )
}