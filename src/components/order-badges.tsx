import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock } from "lucide-react";
import React from "react";

// Theme color classes based on tailwind.config.ts
const channelTheme = {
  GRAB: {
    bg: "bg-green-500",
    text: "text-white",
    border: "border-green-500",
  },
  LAZADA: {
    bg: "bg-blue-500",
    text: "text-white",
    border: "border-blue-500",
  },
  SHOPEE: {
    bg: "bg-orange-500",
    text: "text-white",
    border: "border-orange-500",
  },
  TIKTOK: {
    bg: "bg-gray-800",
    text: "text-white",
    border: "border-gray-800",
  },
  SHOPIFY: {
    bg: "bg-purple-500",
    text: "text-white",
    border: "border-purple-500",
  },
  INSTORE: {
    bg: "bg-yellow-500",
    text: "text-white",
    border: "border-yellow-500",
  },
  FOODPANDA: {
    bg: "bg-pink-500",
    text: "text-white",
    border: "border-pink-500",
  },
  LINEMAN: {
    bg: "bg-emerald-500",
    text: "text-white",
    border: "border-emerald-500",
  },
};

export function ChannelBadge({ channel }: { channel: string }) {
  const normalizedChannel = channel?.toUpperCase();
  const theme = channelTheme[normalizedChannel as keyof typeof channelTheme];
  
  if (theme) {
    return (
      <Badge
        className={`font-mono text-sm font-semibold ${theme.bg} ${theme.text} ${theme.border} border-2 shadow-sm`}
      >
        {channel}
      </Badge>
    );
  }
  
  // Default styling for unknown channels
  return (
    <Badge
      variant="outline"
      className="font-mono text-sm bg-gray-100 text-gray-800 border-gray-300"
    >
      {channel}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  if (priority === "HIGH") {
    return (
      <Badge className="bg-red-500 text-white border-0 font-mono text-sm">HIGH</Badge>
    );
  } else if (priority === "LOW") {
    return (
      <Badge className="bg-gray-100 text-gray-800 border-gray-300 font-mono text-sm">LOW</Badge>
    );
  } else {
    return (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-mono text-sm">NORMAL</Badge>
    );
  }
}

export function PaymentStatusBadge({ status }: { status: string }) {
  switch (status?.toUpperCase()) {
    case "PAID":
      return <Badge className="bg-green-100 text-green-800 border-green-200 font-mono text-sm">PAID</Badge>;
    case "PENDING":
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200 font-mono text-sm">PENDING</Badge>;
    case "FAILED":
      return <Badge className="bg-red-100 text-red-800 border-red-200 font-mono text-sm">FAILED</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 border-gray-300 font-mono text-sm">{status}</Badge>;
  }
}

export function OrderStatusBadge({ status }: { status: string }) {
  switch (status?.toUpperCase()) {
    case "FULFILLED":
      return <Badge className="bg-green-100 text-green-800 border-green-200 font-mono text-sm">FULFILLED</Badge>;
    case "SHIPPED":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-mono text-sm">SHIPPED</Badge>;
    case "DELIVERED":
      return <Badge className="bg-green-50 text-green-700 border-green-100 font-mono text-sm">DELIVERED</Badge>;
    case "PROCESSING":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 font-mono text-sm">PROCESSING</Badge>;
    case "CREATED":
      return <Badge className="bg-gray-100 text-gray-800 border-gray-300 font-mono text-sm">CREATED</Badge>;
    case "CANCELLED":
      return <Badge className="bg-red-100 text-red-800 border-red-200 font-mono text-sm">CANCELLED</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 border-gray-300 font-mono text-sm">{status}</Badge>;
  }
}

export function OnHoldBadge({ onHold }: { onHold: boolean }) {
  if (onHold) {
    return <Badge className="bg-orange-100 text-orange-800 border-orange-200 font-mono text-sm">YES</Badge>;
  }
  return <Badge className="bg-gray-100 text-gray-800 border-gray-300 font-mono text-sm">NO</Badge>;
}

export function ReturnStatusBadge({ status }: { status: string }) {
  if (status?.toUpperCase() === "NONE" || !status) {
    return <Badge className="bg-gray-100 text-gray-800 border-gray-300 font-mono text-sm">NONE</Badge>;
  }
  return <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-mono text-sm">{status}</Badge>;
}

export function SLABadge({ targetMinutes, elapsedMinutes, status }: { targetMinutes: number; elapsedMinutes: number; status: string }) {
  // Only check SUBMITTED and PROCESSING orders for SLA
  if (status !== "SUBMITTED" && status !== "PROCESSING") {
    return (
      <Badge className="bg-gray-100 text-gray-800 border-gray-300 font-mono text-sm">-</Badge>
    );
  }
  
  // Convert seconds to minutes (despite parameter names, values are in seconds)
  const targetInMinutes = Math.floor(targetMinutes / 60);
  const elapsedInMinutes = Math.floor(elapsedMinutes / 60);
  const remainingSeconds = targetMinutes - elapsedMinutes;
  const remainingMinutes = Math.ceil(remainingSeconds / 60);
  
  if (status === "BREACH" || remainingSeconds < 0) {
    const overMinutes = Math.floor((elapsedMinutes - targetMinutes) / 60);
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200 font-mono text-sm flex items-center">
        <AlertTriangle className="h-3 w-3 mr-1" />
        {overMinutes}m BREACH
      </Badge>
    );
  } else if (remainingSeconds < targetMinutes * 0.2 || status === "NEAR_BREACH") {
    return (
      <Badge className="bg-orange-100 text-orange-800 border-orange-200 font-mono text-sm flex items-center">
        <Clock className="h-3 w-3 mr-1" />
        {remainingMinutes}m LEFT
      </Badge>
    );
  } else {
    return (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-mono text-sm flex items-center">
        <Clock className="h-3 w-3 mr-1" />
        {remainingMinutes}m LEFT
      </Badge>
    );
  }
}
