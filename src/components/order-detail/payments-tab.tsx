import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Order } from "../order-management-hub"
import { CreditCard, ChevronDown, DollarSign } from "lucide-react"
import { useMemo } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { PaymentStatusBadge } from "../order-badges"
import { formatCurrency } from "@/lib/currency-utils"
import { TransactionType, PaymentTransaction } from "@/types/payment"
import { SettledItemsTable } from "./settled-items-table"

/**
 * Get badge styling for transaction type
 * - Authorization: yellow (pending capture)
 * - Settlement: green (captured/completed)
 * - Refunded: gray (returned)
 */
const getTransactionTypeBadgeStyle = (type?: TransactionType) => {
    switch (type) {
        case 'AUTHORIZATION':
            return 'bg-yellow-100 text-yellow-700'
        case 'SETTLEMENT':
            return 'bg-green-100 text-green-700'
        case 'REFUNDED':
            return 'bg-gray-100 text-gray-700'
        default:
            return 'bg-gray-100 text-gray-500'
    }
}

interface PaymentsTabProps {
    order: Order
}

/**
 * Settlement transaction structure for display
 */
interface SettlementTransaction {
    index: number;
    amount: number;
    status: string;
    transactionType?: TransactionType;
    settledItems: any[];
    itemCount: number;
}

/**
 * Aggregated payment method for deduplication
 * Groups transactions by payment method to avoid duplicate rows
 */
interface AggregatedPaymentMethod {
    method: string;
    cardNumber?: string;
    expiryDate?: string;
    memberId?: string;
    status: string;
    amountToBeCharged: number;  // Sum of AUTHORIZATION amounts
    amountCharged: number;       // Sum of SETTLEMENT amounts
    totalAmount: number;         // Total amount for this method
}

/**
 * Generate unique key for payment method deduplication
 */
const getPaymentMethodKey = (payment: PaymentTransaction) => {
    if (payment.cardNumber) return `${payment.method}-${payment.cardNumber}`;
    if (payment.memberId) return `${payment.method}-${payment.memberId}`;
    return payment.method;
}

export function PaymentsTab({ order }: PaymentsTabProps) {
    // Determine if we have explicit payment details (MAO orders)
    const hasExplicitPaymentDetails = order.paymentDetails && order.paymentDetails.length > 0;

    // Extract and deduplicate payment methods with aggregated amounts
    // Groups transactions by payment method key (method + cardNumber or memberId)
    const paymentMethods: AggregatedPaymentMethod[] = useMemo(() => {
        if (hasExplicitPaymentDetails && order.paymentDetails!.length > 0) {
            const methodMap = new Map<string, AggregatedPaymentMethod>();

            for (const payment of order.paymentDetails!) {
                const key = getPaymentMethodKey(payment);
                const existing = methodMap.get(key);

                if (existing) {
                    // Add to existing method's amounts based on transaction type
                    if (payment.transactionType === 'AUTHORIZATION') {
                        existing.amountToBeCharged += payment.amount || 0;
                    } else if (payment.transactionType === 'SETTLEMENT') {
                        existing.amountCharged += payment.amount || 0;
                    }
                    existing.totalAmount += payment.amount || 0;
                } else {
                    // Create new aggregated method
                    methodMap.set(key, {
                        method: payment.method || 'Unknown',
                        cardNumber: payment.cardNumber,
                        expiryDate: payment.expiryDate,
                        memberId: payment.memberId,
                        status: payment.status || 'PENDING',
                        amountToBeCharged: payment.transactionType === 'AUTHORIZATION' ? (payment.amount || 0) : 0,
                        amountCharged: payment.transactionType === 'SETTLEMENT' ? (payment.amount || 0) : 0,
                        totalAmount: payment.amount || 0
                    });
                }
            }

            // Post-process: For orders with only SETTLEMENT transactions (no separate AUTHORIZATION),
            // copy amountCharged to amountToBeCharged so both fields display the same value
            for (const method of methodMap.values()) {
                if (method.amountToBeCharged === 0 && method.amountCharged > 0) {
                    method.amountToBeCharged = method.amountCharged;
                }
            }

            return Array.from(methodMap.values());
        }
        // Fallback for non-MAO orders - single payment method
        // Use total_amount for both columns since we can't distinguish auth vs settlement
        return [{
            method: order.payment_info?.method || order.paymentType || 'Unknown Method',
            cardNumber: order.payment_info?.cardNumber,
            expiryDate: order.payment_info?.expiryDate,
            memberId: undefined,
            status: order.payment_info?.status || 'PENDING',
            amountToBeCharged: order.total_amount,
            amountCharged: order.payment_info?.status === 'PAID' ? order.total_amount : 0,
            totalAmount: order.total_amount
        }];
    }, [order, hasExplicitPaymentDetails]);

    // Build settlement transactions list
    const settlements: SettlementTransaction[] = useMemo(() => {
        if (hasExplicitPaymentDetails) {
            return order.paymentDetails!.map((pd, idx) => ({
                index: idx + 1,
                amount: pd.amount || 0,
                status: pd.status || 'PENDING',
                transactionType: pd.transactionType,
                settledItems: pd.settledItems || [],
                itemCount: pd.settledItems?.length || pd.settledItemsCount || 0
            }));
        }
        // Fallback for non-MAO orders - single settlement
        return [{
            index: 1,
            amount: order.total_amount || 0,
            status: order.payment_info?.status || 'PENDING',
            transactionType: order.payment_info?.status === 'PAID' ? 'SETTLEMENT' : 'AUTHORIZATION',
            settledItems: [],
            itemCount: order.items?.length || 0
        }];
    }, [order, hasExplicitPaymentDetails]);

    // Calculate totals
    const totalItems = useMemo(() => {
        return settlements.reduce((sum, s) => sum + s.itemCount, 0);
    }, [settlements]);

    // Get billing information
    const billingName = order.billingName || order.customer?.name || order.shipping_address?.street?.split(' ')[0] || 'N/A';
    const billingAddress = order.billingAddress || order.shipping_address;

    return (
        <div className="space-y-4">
            {/* 1. Bill Information & Payment Method - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Bill Information Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            Bill Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Name Column */}
                            <div className="text-sm">
                                <p className="text-gray-500 font-medium mb-1">Name:</p>
                                <p className="text-gray-900 font-medium">{billingName}</p>
                            </div>
                            {/* Address Column */}
                            <div className="text-sm">
                                <p className="text-gray-500 font-medium mb-1">Address:</p>
                                <p className="text-gray-900 leading-relaxed">
                                    {billingAddress?.street || ''}
                                    {billingAddress?.subdistrict && <><br />{billingAddress.subdistrict}</>}
                                    {(billingAddress?.city || billingAddress?.state) && (
                                        <><br />{[billingAddress?.city, billingAddress?.state].filter(Boolean).join(', ')}</>
                                    )}
                                    {billingAddress?.postal_code && <> {billingAddress.postal_code}</>}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Methods Card - Supports multiple payment methods with deduplication */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                                Payment Method{paymentMethods.length > 1 ? 's' : ''}
                            </div>
                            <span className="text-lg font-semibold text-gray-900">
                                {formatCurrency(order.total_amount)}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Payment Method Rows - Vertical Layout */}
                        <div className="space-y-3">
                            {paymentMethods.map((payment, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg ${paymentMethods.length > 1 ? 'bg-gray-50 border border-gray-100' : ''}`}
                                >
                                    {/* Header Row: Icon + Name (left), Status Badge (right) */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                                                payment.method === 'T1' || payment.method?.includes('T1')
                                                    ? 'bg-orange-100 text-orange-600'
                                                    : 'bg-blue-100 text-blue-600'
                                            }`}>
                                                <CreditCard className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium text-gray-900">
                                                {payment.method === 'T1' ? 'The1 Points' : payment.method}
                                            </span>
                                        </div>
                                        <PaymentStatusBadge status={payment.status} />
                                    </div>

                                    {/* Vertical Details Section */}
                                    <div className="mt-3 ml-11 space-y-1 text-sm">
                                        {/* Credit Card Details */}
                                        {payment.cardNumber && (
                                            <>
                                                <div>
                                                    <span className="text-gray-500">CREDIT CARD: </span>
                                                    <span className="text-gray-900">{payment.cardNumber}</span>
                                                </div>
                                                {payment.expiryDate && (
                                                    <div>
                                                        <span className="text-gray-500">Expiry Date: </span>
                                                        <span className="text-gray-900">{payment.expiryDate}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {/* T1/Loyalty Points Details */}
                                        {payment.memberId && (
                                            <div>
                                                <span className="text-gray-500">Member ID: </span>
                                                <span className="text-gray-900">{payment.memberId}</span>
                                            </div>
                                        )}

                                        {/* Amount to be Charged */}
                                        <div>
                                            <span className="text-gray-500">Amount to be charged: </span>
                                            <span className="text-gray-900">{formatCurrency(payment.amountToBeCharged)}</span>
                                        </div>

                                        {/* Amount Charged */}
                                        <div>
                                            <span className="text-gray-500">Amount charged: </span>
                                            <span className="font-semibold text-green-700">{formatCurrency(payment.amountCharged)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 2. Settlement Transactions - With Item Count in Header */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">
                        Settlement Transactions ({settlements.length} settlement{settlements.length !== 1 ? 's' : ''} • {totalItems} item{totalItems !== 1 ? 's' : ''} total)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {settlements.map((settlement) => (
                        <div key={settlement.index} className="border border-gray-200 rounded-lg bg-gray-50/50 overflow-hidden">
                            <Collapsible defaultOpen={settlement.index === 1}>
                                <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-gray-900">
                                            Settlement #{settlement.index} ({settlement.itemCount} item{settlement.itemCount !== 1 ? 's' : ''})
                                        </span>
                                        {settlement.transactionType && (
                                            <Badge variant="secondary" className={getTransactionTypeBadgeStyle(settlement.transactionType)}>
                                                {settlement.transactionType}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-gray-900">{formatCurrency(settlement.amount)}</span>
                                        <CollapsibleTrigger asChild>
                                            <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                                <ChevronDown className="h-4 w-4 text-gray-500" />
                                                <span className="sr-only">Toggle settlement details</span>
                                            </button>
                                        </CollapsibleTrigger>
                                    </div>
                                </div>
                                <CollapsibleContent>
                                    <div className="p-4 bg-gray-50/50">
                                        {/* Settled Items Table - No subtotal row */}
                                        {settlement.settledItems && settlement.settledItems.length > 0 ? (
                                            <SettledItemsTable
                                                items={settlement.settledItems}
                                                paymentAmount={settlement.amount}
                                                currency="THB"
                                                showSubtotal={false}
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No item details available for this settlement</p>
                                        )}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
