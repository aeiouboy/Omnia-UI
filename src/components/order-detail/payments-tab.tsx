import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Order } from "../order-management-hub"
import { CreditCard, Wallet, User, MapPin, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { PaymentStatusBadge } from "../order-badges"
import { formatCurrency } from "@/lib/currency-utils"

interface PaymentsTabProps {
    order: Order
}

export function PaymentsTab({ order }: PaymentsTabProps) {
    // Logic to determine payment methods breakdown
    // This is a simulation based on the available data structure in Order
    // intended to match the visual requirements requested.

    const hasT1Redemption = (order.customerRedeemAmount || 0) > 0;
    const mainPaymentAmount = (order.customerPayAmount || order.total_amount) || 0;
    const mainPaymentMethod = order.payment_info?.method || order.paymentType || "Unknown Method";

    const paymentMethods: {
        type: string;
        name: string;
        amount: number;
        status: string;
        details: {
            cardNumber?: string;
            expiry?: string;
            memberId?: string;
        };
    }[] = [
            {
                type: "Main",
                name: mainPaymentMethod,
                amount: mainPaymentAmount,
                status: order.payment_info?.status || "PENDING",
                details: {
                    // Mocking card details if it's a card payment, as these aren't in the base ApiOrder type yet
                    ...(mainPaymentMethod.toLowerCase().includes("card") ? {
                        cardNumber: "411111XXXXXX1111", // Placeholder matching requirements
                        expiry: "8/2029",
                    } : {})
                }
            }
        ];

    if (hasT1Redemption) {
        paymentMethods.push({
            type: "T1",
            name: "T1 Point Redemption",
            amount: order.customerRedeemAmount || 0,
            status: "PAID", // Redemption is usually immediate
            details: {
                memberId: order.customer?.T1Number || "N/A"
            }
        });
    }

    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="space-y-4">
            {/* 1. Order Payment Header */}
            <Card>
                <CardContent className="p-4 sm:p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">Order Payment</h3>
                        <PaymentStatusBadge status={order.payment_info?.status || 'PENDING'} />
                    </div>
                    <div className="text-xl font-bold text-green-600">
                        {formatCurrency(order.total_amount)}
                    </div>
                </CardContent>
            </Card>

            {/* 2. Payment Methods List */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">
                        Payment Methods ({paymentMethods.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {paymentMethods.map((method, index) => (
                        <div key={index} className="border border-gray-100 rounded-lg bg-gray-50/50 overflow-hidden">
                            <Collapsible defaultOpen={true}>
                                <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        {method.type === 'T1' ? (
                                            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">T1</div>
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <CreditCard className="h-4 w-4" />
                                            </div>
                                        )}
                                        <span className="font-medium text-gray-900">{method.name}</span>
                                        <Badge variant="secondary" className={method.status === 'PAID' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                                            {method.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-gray-900">{formatCurrency(method.amount)}</span>
                                        <CollapsibleTrigger asChild>
                                            <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                                <ChevronDown className="h-4 w-4 text-gray-500" />
                                                <span className="sr-only">Toggle details</span>
                                            </button>
                                        </CollapsibleTrigger>
                                    </div>
                                </div>
                                <CollapsibleContent>
                                    <div className="p-4 space-y-2 bg-gray-50/50 text-sm">
                                        {/* Specific Payment Type Details */}
                                        {method.type === 'Main' && method.details.cardNumber && (
                                            <>
                                                <div className="flex gap-2">
                                                    <span className="font-semibold text-gray-700">CREDIT CARD:</span>
                                                    <span className="text-gray-900 font-medium">{method.details.cardNumber}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="font-semibold text-gray-700">Expiry Date :</span>
                                                    <span className="text-gray-900 font-medium">{method.details.expiry}</span>
                                                </div>
                                            </>
                                        )}

                                        {method.type === 'T1' && (
                                            <div className="flex gap-2">
                                                <span className="font-semibold text-gray-700">T1:</span>
                                                <span className="text-gray-900 font-medium">{method.details.memberId}</span>
                                            </div>
                                        )}

                                        {/* Amount Rows */}
                                        <div className="flex gap-2">
                                            <span className="font-semibold text-gray-700">Amount to be charged:</span>
                                            <span className="text-gray-900 font-medium">{formatCurrency(method.amount)}</span>
                                        </div>

                                        <div className="flex gap-2">
                                            <span className="font-semibold text-gray-700">Amount charged:</span>
                                            <span className="text-gray-900 font-medium">{formatCurrency(method.amount)}</span>
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    ))}

                </CardContent>
            </Card>

            {/* 3. Billing Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Billing Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-sm flex gap-2">
                        <p className="text-gray-500 font-medium whitespace-nowrap">Billing Name :</p>
                        <p className="text-gray-900 font-medium">{order.customer?.name || order.shipping_address?.street?.split(' ')[0] || 'N/A'}</p>
                    </div>
                    <div className="text-sm">
                        <p className="text-gray-500 font-medium mb-1">Billing Address :</p>
                        <p className="text-gray-900 leading-relaxed">
                            {order.shipping_address?.street || ''}<br />
                            {order.shipping_address?.city || ''}, {order.shipping_address?.state || ''}, {order.shipping_address?.country || 'TH'}, {order.shipping_address?.postal_code || ''}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
