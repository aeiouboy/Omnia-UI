import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Check, X, Truck, Zap, Store, Settings } from "lucide-react";
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

export function SLABadge({
  targetMinutes,
  elapsedMinutes,
  status,
  slaStatus
}: {
  targetMinutes: number;
  elapsedMinutes: number;
  status: string;
  slaStatus?: string;
}) {
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

  // Check SLA status or calculate breach from time remaining
  if (slaStatus === "BREACH" || remainingSeconds < 0) {
    const overMinutes = Math.floor((elapsedMinutes - targetMinutes) / 60);
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200 font-mono text-sm flex items-center">
        <AlertTriangle className="h-3 w-3 mr-1" />
        {overMinutes}m BREACH
      </Badge>
    );
  } else if (remainingSeconds < targetMinutes * 0.2 || slaStatus === "NEAR_BREACH") {
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

// FMS Extended Badge Components

// Delivery Type Badge - STD (Standard), EXP (Express), CC (Click & Collect)
export function DeliveryTypeBadge({ deliveryType }: { deliveryType?: string }) {
  if (!deliveryType) {
    return <Badge className="bg-gray-100 text-gray-800 border-gray-300 font-mono text-sm">-</Badge>;
  }

  switch (deliveryType) {
    case "Standard Delivery":
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-mono text-sm flex items-center">
          <Truck className="h-3 w-3 mr-1" />
          STD
        </Badge>
      );
    case "Express Delivery":
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200 font-mono text-sm flex items-center">
          <Zap className="h-3 w-3 mr-1" />
          EXP
        </Badge>
      );
    case "Click & Collect":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 font-mono text-sm flex items-center">
          <Store className="h-3 w-3 mr-1" />
          C&C
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-300 font-mono text-sm">
          {deliveryType}
        </Badge>
      );
  }
}

// Settlement Type Badge - Auto Settle (green), Manual Settle (yellow)
export function SettlementTypeBadge({ settlementType }: { settlementType?: string }) {
  if (!settlementType) {
    return <Badge className="bg-gray-100 text-gray-800 border-gray-300 font-mono text-sm">-</Badge>;
  }

  switch (settlementType) {
    case "Auto Settle":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 font-mono text-sm flex items-center">
          <Settings className="h-3 w-3 mr-1" />
          Auto
        </Badge>
      );
    case "Manual Settle":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 font-mono text-sm flex items-center">
          <Settings className="h-3 w-3 mr-1" />
          Manual
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-300 font-mono text-sm">
          {settlementType}
        </Badge>
      );
  }
}

// Request Tax Badge - Checkmark for true, X for false
export function RequestTaxBadge({ requestTax }: { requestTax?: boolean }) {
  if (requestTax === undefined || requestTax === null) {
    return <Badge className="bg-gray-100 text-gray-800 border-gray-300 font-mono text-sm">-</Badge>;
  }

  if (requestTax) {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 font-mono text-sm flex items-center">
        <Check className="h-3 w-3 mr-1" />
        Yes
      </Badge>
    );
  }
  return (
    <Badge className="bg-gray-100 text-gray-600 border-gray-300 font-mono text-sm flex items-center">
      <X className="h-3 w-3 mr-1" />
      No
    </Badge>
  );
}

// Order Type Badge (FMS values)
export function OrderTypeBadge({ orderType }: { orderType?: string }) {
  if (!orderType) {
    return <Badge className="bg-gray-100 text-gray-800 border-gray-300 font-mono text-sm">-</Badge>;
  }

  // Map FMS order types to colors
  const typeStyles: Record<string, string> = {
    "Large format": "bg-purple-100 text-purple-800 border-purple-200",
    "Tops daily CFR": "bg-blue-100 text-blue-800 border-blue-200",
    "Tops daily CFM": "bg-cyan-100 text-cyan-800 border-cyan-200",
    "Subscription": "bg-indigo-100 text-indigo-800 border-indigo-200",
    "Retail": "bg-teal-100 text-teal-800 border-teal-200",
  };

  const style = typeStyles[orderType] || "bg-gray-100 text-gray-800 border-gray-300";

  return (
    <Badge className={`${style} font-mono text-sm`}>
      {orderType}
    </Badge>
  );
}

// Payment Type Badge - displays abbreviated payment types with appropriate colors
export function PaymentTypeBadge({ paymentType }: { paymentType?: string }) {
  if (!paymentType) {
    return <Badge className="bg-gray-100 text-gray-800 border-gray-300 font-mono text-sm">-</Badge>;
  }

  // Handle combined payment types (e.g., "Cash on Delivery + T1C Redeem Payment")
  const parts = paymentType.split(" + ");

  // If combined, show abbreviated combo
  if (parts.length > 1) {
    const abbreviations = parts.map(part => getPaymentAbbreviation(part));
    return (
      <Badge className="bg-gradient-to-r from-green-100 to-orange-100 text-gray-800 border-gray-300 font-mono text-sm">
        {abbreviations.join("+")}
      </Badge>
    );
  }

  // Single payment type
  const { abbreviation, style } = getPaymentTypeStyle(paymentType);
  return (
    <Badge className={`${style} font-mono text-sm`}>
      {abbreviation}
    </Badge>
  );
}

function getPaymentAbbreviation(paymentType: string): string {
  const abbreviations: Record<string, string> = {
    "Cash on Delivery": "COD",
    "Credit Card on Delivery": "CC-OD",
    "2C2P-Credit-Card": "2C2P",
    "QR PromptPay": "QR",
    "T1C Redeem Payment": "T1C",
    "Lazada Payment": "Lazada",
    "Shopee Payment": "Shopee",
  };
  return abbreviations[paymentType] || paymentType;
}

function getPaymentTypeStyle(paymentType: string): { abbreviation: string; style: string } {
  const styles: Record<string, { abbreviation: string; style: string }> = {
    "Cash on Delivery": {
      abbreviation: "COD",
      style: "bg-green-100 text-green-800 border-green-200",
    },
    "Credit Card on Delivery": {
      abbreviation: "CC-OD",
      style: "bg-blue-100 text-blue-800 border-blue-200",
    },
    "2C2P-Credit-Card": {
      abbreviation: "2C2P",
      style: "bg-purple-100 text-purple-800 border-purple-200",
    },
    "QR PromptPay": {
      abbreviation: "QR",
      style: "bg-cyan-100 text-cyan-800 border-cyan-200",
    },
    "T1C Redeem Payment": {
      abbreviation: "T1C",
      style: "bg-orange-100 text-orange-800 border-orange-200",
    },
    "Lazada Payment": {
      abbreviation: "Lazada",
      style: "bg-blue-100 text-blue-800 border-blue-200",
    },
    "Shopee Payment": {
      abbreviation: "Shopee",
      style: "bg-orange-100 text-orange-800 border-orange-200",
    },
  };

  return styles[paymentType] || {
    abbreviation: paymentType,
    style: "bg-gray-100 text-gray-800 border-gray-300",
  };
}
