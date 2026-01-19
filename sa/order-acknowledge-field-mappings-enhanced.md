# Order Acknowledge (Open Status) - Field Mapping Summary (Enhanced)

**Document**: Order Acknowledge (Open status) - [R1][S3]
**Overview**: Publish orders when the order stage is "Open" (1000)
**Topic (SIT)**: oms.all.order-publish.sit
**Topic (UAT)**: oms.all.order-publish.uat

## Legend
- **Direct**: Field maps directly to database column
- **Logic**: Field requires calculation or transformation
- **Fixed Value**: Field has a constant value
- **[Suggested]**: Suggested mapping based on ERD analysis (not from original document)

## ERD Database Tables Reference
- `orders` - Main order header
- `order_lines` - Order line items
- `quantity_details` - Quantity tracking
- `payments` - Payment records
- `payment_methods` - Payment method details
- `payment_transactions` - Transaction records
- `allocations` - Inventory allocations
- `releases` - Order releases
- `release_lines` - Release line items
- `fulfillment_details` - Fulfillment tracking
- `order_tracking` - Shipping tracking
- `master_locations` - Location master data
- `promisings` - Promising records
- `promising_details` - Promising details

---

## Field Mappings

| # | Field Name | Mapping Type | Mapping APIs/Database Table | Mapping Field Name | Remarks |
|---|------------|--------------|-----------------------------|--------------------|---------|
| 1 | CancelLineCount | Logic | [OMS-Order] order_lines Table | min_fulfillment_status_id | COUNT(OrderLine[] WHERE order_line[].min_fulfillment_status_id = "9000") |
| 2 | SuspendedOrderId |  |  |  |  |
| 3 | CreatedTimestamp |  |  |  |  |
| 4 | BusinessDate |  |  |  |  |
| 5 | ReturnTrackingDetail[] |  | [Suggested] order_tracking |  |  |
| 6 | MaxFulfillmentStatusId |  | [Suggested] orders | max_fulfillment_status_id |  |
| 7 | IsOnHold |  | [Suggested] orders | is_on_hold |  |
| 8 | Process |  | [Suggested] quantity_details | process |  |
| 9 | IsConfirmed |  |  |  |  |
| 10 | CurrencyCode |  | [Suggested] orders | currency_code |  |
| 11 | SellingLocationId |  |  |  |  |
| 12 | EventSubmitTime |  |  |  |  |
| 13 | UpdatedBy |  | [Suggested] orders | updated_by |  |
| 14 | FulfillmentStatus |  | [Suggested] orders | fulfillment_status |  |
| 15 | CustomerFirstName |  | [Suggested] orders | customer_first_name |  |
| 16 | OrderChargeDetail[] |  |  |  |  |
| 17 | OrderType.OrderTypeId |  |  |  |  |
| 18 | CountedDate |  |  |  |  |
| 19 | TotalCharges |  | [Suggested] orders | total_charges |  |
| 20 | OrderLineCount |  | [Suggested] order_lines |  |  |
| 21 | OrderHold[] |  | [Suggested] orders | order_hold |  |
| 22 | OrderToken |  |  |  |  |
| 23 | IsArchiveInProgress |  |  |  |  |
| 24 | Messages |  |  |  |  |
| 25 | CreatedBy |  | [Suggested] orders | created_by |  |
| 26 | Priority |  |  |  |  |
| 27 | IsCancelled |  | [Suggested] orders | is_cancelled |  |
| 28 | OrderTagDetail[] |  |  |  |  |
| 29 | OrderExtension5[] |  |  |  |  |
| 30 | CustomerId |  | [Suggested] orders | customer_id |  |
| 31 | OrderId |  | [Suggested] orders | order_id |  |
| 32 | OrderExtension3[] |  |  |  |  |
| 33 | OrderExtension4[] |  |  |  |  |
| 35 | OrderExtension1.UpdatedBy |  | [Suggested] orders | updated_by |  |
| 36 | OrderExtension1.UpdatedTimestamp |  |  |  |  |
| 37 | OrderExtension1.OrgId |  | [Suggested] orders | org_id |  |
| 38 | OrderExtension1.CreatedTimestamp |  |  |  |  |
| 39 | OrderExtension1.CreatedBy |  | [Suggested] orders | created_by |  |
| 40 | OrderExtension1.Extended.LatestT1RedeemTotal |  |  |  |  |
| 41 | OrderExtension1.Extended.CancelAllowed |  |  |  |  |
| 42 | OrderExtension1.Extended.FullTaxInvoice |  | [Suggested] orders (tax fields) |  |  |
| 43 | OrderExtension1.Extended.LatestPostpaidTotal |  |  |  |  |
| 44 | OrderExtension1.Extended.LatestOrderTotal |  |  |  |  |
| 45 | OrderExtension1.Extended.LatestPrepaidTotal |  |  |  |  |
| 46 | OrderExtension1.Extended.SourceOrderShippingTotal |  |  |  |  |
| 47 | OrderExtension1.Extended.AutoSettlement |  |  |  |  |
| 48 | OrderExtension1.Extended.TaxId |  | [Suggested] orders (tax fields) |  |  |
| 49 | OrderExtension1.Extended.T1ConversionRate |  |  |  |  |
| 50 | OrderExtension1.Extended.Extended1 |  |  |  |  |
| 51 | OrderExtension1.Extended.AllowSubstitution |  |  |  |  |
| 52 | OrderExtension1.Extended.CompanyName |  |  |  |  |
| 53 | OrderExtension1.Extended.CustRef |  |  |  |  |
| 54 | OrderExtension1.Extended.SourceOrderTotalDiscount |  |  |  |  |
| 55 | OrderExtension1.Extended.ConfirmPaymentId |  | [Suggested] payments |  |  |
| 56 | OrderExtension1.Extended.SourceOrderSubTotal |  |  |  |  |
| 57 | OrderExtension1.Extended.ExternalMPSellerId |  |  |  |  |
| 58 | OrderExtension1.Extended.IsPSConfirmed |  |  |  |  |
| 59 | OrderExtension1.Extended.LatestOrderSubTotal |  |  |  |  |
| 60 | OrderExtension1.Extended.SourceOrderTotal |  |  |  |  |
| 61 | OrderExtension1.Extended.LatestOrderTotalDiscount |  |  |  |  |
| 62 | OrderExtension1.Extended.T1RedemptionPoint |  |  |  |  |
| 63 | OrderExtension1.Extended.BranchNo |  |  |  |  |
| 64 | OrderExtension1.Extended.T1Number |  |  |  |  |
| 65 | OrderExtension1.Extended.T1PhoneNo |  |  |  |  |
| 66 | OrderExtension1.ContextId |  |  |  |  |
| 67 | OrderExtension1.Process |  | [Suggested] quantity_details | process |  |
| 68 | OrderExtension1.PK |  |  |  |  |
| 69 | OrderExtension1.PurgeDate |  | [Suggested] payments | purge_date |  |
| 70 | OrderExtension1.Unique_Identifier |  |  |  |  |
| 71 | OrderExtension2[] |  |  |  |  |
| 72 | OrderSubTotal |  | [Suggested] orders | order_sub_total |  |
| 74 | Payment[].Actions |  | [Suggested] payments |  |  |
| 75 | Payment[].PK |  | [Suggested] payments |  |  |
| 76 | Payment[].CreatedBy |  | [Suggested] orders | created_by |  |
| 77 | Payment[].CreatedTimestamp |  | [Suggested] payments |  |  |
| 78 | Payment[].UpdatedBy |  | [Suggested] orders | updated_by |  |
| 79 | Payment[].UpdatedTimestamp |  | [Suggested] payments |  |  |
| 80 | Payment[].Messages |  | [Suggested] payments |  |  |
| 81 | Payment[].OrgId |  | [Suggested] orders | org_id |  |
| 82 | Payment[].PurgeDate |  | [Suggested] payments | purge_date |  |
| 83 | Payment[].OrderId |  | [Suggested] orders | order_id |  |
| 84 | Payment[].PaymentGroupId |  | [Suggested] payments | payment_group_id |  |
| 85 | Payment[].CustomerId |  | [Suggested] orders | customer_id |  |
| 86 | Payment[].IsCancelled |  | [Suggested] orders | is_cancelled |  |
| 87 | Payment[].AlternateOrderId |  | [Suggested] payments |  |  |
| 88 | Payment[].IsAnonymized |  | [Suggested] payments | is_anonymized |  |
| 90 | Payment[].PaymentMethod[].Actions |  | [Suggested] payment_methods |  |  |
| 91 | Payment[].PaymentMethod[].PK |  | [Suggested] payment_methods |  |  |
| 92 | Payment[].PaymentMethod[].CreatedBy |  | [Suggested] orders | created_by |  |
| 93 | Payment[].PaymentMethod[].CreatedTimestamp |  | [Suggested] payment_methods |  |  |
| 94 | Payment[].PaymentMethod[].UpdatedBy |  | [Suggested] orders | updated_by |  |
| 95 | Payment[].PaymentMethod[].UpdatedTimestamp |  | [Suggested] payment_methods |  |  |
| 96 | Payment[].PaymentMethod[].Messages |  | [Suggested] payment_methods |  |  |
| 97 | Payment[].PaymentMethod[].OrgId |  | [Suggested] orders | org_id |  |
| 98 | Payment[].PaymentMethod[].PaymentMethodId |  | [Suggested] payment_methods | payment_method_id |  |
| 99 | Payment[].PaymentMethod[].CurrencyCode |  | [Suggested] orders | currency_code |  |
| 100 | Payment[].PaymentMethod[].AlternateCurrencyCode |  | [Suggested] payment_methods |  |  |
| 101 | Payment[].PaymentMethod[].ConversionRate |  | [Suggested] payment_methods |  |  |
| 102 | Payment[].PaymentMethod[].AlternateCurrencyAmount |  | [Suggested] payment_methods |  |  |
| 103 | Payment[].PaymentMethod[].AccountNumber |  | [Suggested] payment_methods | account_number |  |
| 104 | Payment[].PaymentMethod[].AccountDisplayNumber |  | [Suggested] payment_methods | account_display_number |  |
| 105 | Payment[].PaymentMethod[].NameOnCard |  | [Suggested] payment_methods | name_on_card |  |
| 106 | Payment[].PaymentMethod[].SwipeData |  | [Suggested] payment_methods |  |  |
| 107 | Payment[].PaymentMethod[].CardExpiryMonth |  | [Suggested] payment_methods | card_expiry_month |  |
| 108 | Payment[].PaymentMethod[].CardExpiryYear |  | [Suggested] payment_methods | card_expiry_year |  |
| 109 | Payment[].PaymentMethod[].GiftCardPin |  | [Suggested] payment_methods |  |  |
| 110 | Payment[].PaymentMethod[].CustomerSignature |  | [Suggested] payment_methods |  |  |
| 111 | Payment[].PaymentMethod[].CustomerPaySignature |  | [Suggested] payment_methods |  |  |
| 112 | Payment[].PaymentMethod[].ChangeAmount |  | [Suggested] payment_methods |  |  |
| 113 | Payment[].PaymentMethod[].Amount |  | [Suggested] payment_methods | amount |  |
| 114 | Payment[].PaymentMethod[].CurrentAuthAmount |  | [Suggested] payment_methods | current_auth_amount |  |
| 115 | Payment[].PaymentMethod[].CurrentSettledAmount |  | [Suggested] payment_methods | current_settled_amount |  |
| 116 | Payment[].PaymentMethod[].CurrentRefundAmount |  | [Suggested] payment_methods | current_refund_amount |  |
| 117 | Payment[].PaymentMethod[].ChargeSequence |  | [Suggested] payment_methods |  |  |
| 118 | Payment[].PaymentMethod[].IsSuspended |  | [Suggested] payment_methods | is_suspended |  |
| 119 | Payment[].PaymentMethod[].EntryTypeId |  | [Suggested] payment_methods |  |  |
| 120 | Payment[].PaymentMethod[].GatewayId |  | [Suggested] payment_methods | gateway_id |  |
| 121 | Payment[].PaymentMethod[].RoutingNumber |  | [Suggested] payment_methods |  |  |
| 122 | Payment[].PaymentMethod[].RoutingDisplayNumber |  | [Suggested] payment_methods |  |  |
| 123 | Payment[].PaymentMethod[].CheckNumber |  | [Suggested] payment_methods |  |  |
| 124 | Payment[].PaymentMethod[].DriversLicenseNumber |  | [Suggested] payment_methods |  |  |
| 125 | Payment[].PaymentMethod[].DriversLicenseState |  | [Suggested] payment_methods |  |  |
| 126 | Payment[].PaymentMethod[].DriversLicenseCountry |  | [Suggested] payment_methods |  |  |
| 127 | Payment[].PaymentMethod[].BusinessName |  | [Suggested] payment_methods |  |  |
| 128 | Payment[].PaymentMethod[].BusinessTaxId |  | [Suggested] payment_methods |  |  |
| 129 | Payment[].PaymentMethod[].CheckQuantity |  | [Suggested] payment_methods |  |  |
| 130 | Payment[].PaymentMethod[].OriginalAmount |  | [Suggested] payment_methods |  |  |
| 131 | Payment[].PaymentMethod[].IsModifiable |  | [Suggested] payment_methods |  |  |
| 132 | Payment[].PaymentMethod[].CurrentFailedAmount |  | [Suggested] payment_methods | current_failed_amount |  |
| 133 | Payment[].PaymentMethod[].ParentOrderId |  | [Suggested] payment_methods |  |  |
| 134 | Payment[].PaymentMethod[].ParentPaymentGroupId |  | [Suggested] payment_methods |  |  |
| 135 | Payment[].PaymentMethod[].ParentPaymentMethodId |  | [Suggested] payment_methods |  |  |
| 136 | Payment[].PaymentMethod[].IsVoided |  | [Suggested] payment_methods | is_voided |  |
| 137 | Payment[].PaymentMethod[].IsCopied |  | [Suggested] payment_methods |  |  |
| 138 | Payment[].PaymentMethod[].GatewayAccountId |  | [Suggested] payment_methods |  |  |
| 139 | Payment[].PaymentMethod[].LocationId |  | [Suggested] master_locations | location_id |  |
| 140 | Payment[].PaymentMethod[].TransactionReferenceId |  | [Suggested] payment_transactions |  |  |
| 141 | Payment[].PaymentMethod[].CapturedInEdgeMode |  | [Suggested] payment_methods |  |  |
| 142 | Payment[].PaymentMethod[].MerchandiseAmount |  | [Suggested] payment_methods |  |  |
| 143 | Payment[].PaymentMethod[].CapturedSource |  | [Suggested] payment_methods |  |  |
| 144 | Payment[].PaymentMethod[].ShopperReference |  | [Suggested] payment_methods |  |  |
| 145 | Payment[].PaymentMethod[].SuggestedAmount |  | [Suggested] payment_methods |  |  |
| 146 | Payment[].PaymentMethod[].PurgeDate |  | [Suggested] payments | purge_date |  |
| 147 | Payment[].PaymentMethod[].BillingAddress.Actions |  | [Suggested] payment_methods |  |  |
| 148 | Payment[].PaymentMethod[].BillingAddress.PK |  | [Suggested] payment_methods |  |  |
| 149 | Payment[].PaymentMethod[].BillingAddress.CreatedBy |  | [Suggested] orders | created_by |  |
| 150 | Payment[].PaymentMethod[].BillingAddress.CreatedTimestamp |  | [Suggested] payment_methods |  |  |
| 151 | Payment[].PaymentMethod[].BillingAddress.UpdatedBy |  | [Suggested] orders | updated_by |  |
| 152 | Payment[].PaymentMethod[].BillingAddress.UpdatedTimestamp |  | [Suggested] payment_methods |  |  |
| 153 | Payment[].PaymentMethod[].BillingAddress.Messages |  | [Suggested] payment_methods |  |  |
| 154 | Payment[].PaymentMethod[].BillingAddress.OrgId |  | [Suggested] orders | org_id |  |
| 155 | Payment[].PaymentMethod[].BillingAddress.Address.FirstName |  | [Suggested] payment_methods |  |  |
| 156 | Payment[].PaymentMethod[].BillingAddress.Address.LastName |  | [Suggested] payment_methods |  |  |
| 157 | Payment[].PaymentMethod[].BillingAddress.Address.Address1 |  | [Suggested] payment_methods |  |  |
| 158 | Payment[].PaymentMethod[].BillingAddress.Address.Address2 |  | [Suggested] payment_methods |  |  |
| 159 | Payment[].PaymentMethod[].BillingAddress.Address.Address3 |  | [Suggested] payment_methods |  |  |
| 160 | Payment[].PaymentMethod[].BillingAddress.Address.City |  | [Suggested] order_tracking | city |  |
| 161 | Payment[].PaymentMethod[].BillingAddress.Address.State |  | [Suggested] order_tracking | state |  |
| 162 | Payment[].PaymentMethod[].BillingAddress.Address.PostalCode |  | [Suggested] order_tracking | postal_code |  |
| 163 | Payment[].PaymentMethod[].BillingAddress.Address.County |  | [Suggested] payment_methods |  |  |
| 164 | Payment[].PaymentMethod[].BillingAddress.Address.Country |  | [Suggested] order_tracking | country |  |
| 165 | Payment[].PaymentMethod[].BillingAddress.Address.Phone |  | [Suggested] payment_methods |  |  |
| 166 | Payment[].PaymentMethod[].BillingAddress.Address.Email |  | [Suggested] payment_methods |  |  |
| 167 | Payment[].PaymentMethod[].BillingAddress.PurgeDate |  | [Suggested] payments | purge_date |  |
| 168 | Payment[].PaymentMethod[].BillingAddress.Extended.AddressRef |  | [Suggested] payment_methods |  |  |
| 169 | Payment[].PaymentMethod[].PaymentMethodAttribute[] |  | [Suggested] payment_methods |  |  |
| 170 | Payment[].PaymentMethod[].PaymentMethodEncrAttribute[] |  | [Suggested] payment_methods |  |  |
| 172 | Payment[].PaymentMethod[].PaymentTransaction[].Actions |  | [Suggested] payment_transactions |  |  |
| 173 | Payment[].PaymentMethod[].PaymentTransaction[].PK |  | [Suggested] payment_transactions |  |  |
| 174 | Payment[].PaymentMethod[].PaymentTransaction[].CreatedBy |  | [Suggested] orders | created_by |  |
| 175 | Payment[].PaymentMethod[].PaymentTransaction[].CreatedTimestamp |  | [Suggested] payment_transactions |  |  |
| 176 | Payment[].PaymentMethod[].PaymentTransaction[].UpdatedBy |  | [Suggested] orders | updated_by |  |
| 177 | Payment[].PaymentMethod[].PaymentTransaction[].UpdatedTimestamp |  | [Suggested] payment_transactions |  |  |
| 178 | Payment[].PaymentMethod[].PaymentTransaction[].Messages |  | [Suggested] payment_transactions |  |  |
| 179 | Payment[].PaymentMethod[].PaymentTransaction[].OrgId |  | [Suggested] orders | org_id |  |
| 180 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransactionId |  | [Suggested] payment_transactions | payment_transaction_id |  |
| 181 | Payment[].PaymentMethod[].PaymentTransaction[].RequestedAmount |  | [Suggested] payment_transactions | requested_amount |  |
| 182 | Payment[].PaymentMethod[].PaymentTransaction[].RequestId |  | [Suggested] payment_transactions | request_id |  |
| 183 | Payment[].PaymentMethod[].PaymentTransaction[].RequestToken |  | [Suggested] payment_transactions | request_token |  |
| 184 | Payment[].PaymentMethod[].PaymentTransaction[].RequestedDate |  | [Suggested] payment_transactions |  |  |
| 185 | Payment[].PaymentMethod[].PaymentTransaction[].FollowOnId |  | [Suggested] payment_transactions |  |  |
| 186 | Payment[].PaymentMethod[].PaymentTransaction[].FollowOnToken |  | [Suggested] payment_transactions |  |  |
| 187 | Payment[].PaymentMethod[].PaymentTransaction[].TransactionDate |  | [Suggested] payment_transactions | transaction_date |  |
| 188 | Payment[].PaymentMethod[].PaymentTransaction[].TransactionExpiryDate |  | [Suggested] payment_transactions |  |  |
| 189 | Payment[].PaymentMethod[].PaymentTransaction[].ProcessedAmount |  | [Suggested] payment_transactions | processed_amount |  |
| 190 | Payment[].PaymentMethod[].PaymentTransaction[].FollowOnProcessedAmount |  | [Suggested] payment_transactions |  |  |
| 191 | Payment[].PaymentMethod[].PaymentTransaction[].RemainingAttempts |  | [Suggested] payment_transactions |  |  |
| 192 | Payment[].PaymentMethod[].PaymentTransaction[].FollowOnCount |  | [Suggested] payment_transactions |  |  |
| 193 | Payment[].PaymentMethod[].PaymentTransaction[].ReconciliationId |  | [Suggested] payment_transactions | reconciliation_id |  |
| 194 | Payment[].PaymentMethod[].PaymentTransaction[].ExternalResponseId |  | [Suggested] payment_transactions |  |  |
| 195 | Payment[].PaymentMethod[].PaymentTransaction[].ReasonId |  | [Suggested] payment_transactions |  |  |
| 196 | Payment[].PaymentMethod[].PaymentTransaction[].IsValidForRefund |  | [Suggested] payment_transactions | is_valid_for_refund |  |
| 197 | Payment[].PaymentMethod[].PaymentTransaction[].ReAuthOnSettlementFailure |  | [Suggested] payment_transactions |  |  |
| 198 | Payment[].PaymentMethod[].PaymentTransaction[].IsActive |  | [Suggested] payment_transactions | is_active |  |
| 199 | Payment[].PaymentMethod[].PaymentTransaction[].RemainingBalance |  | [Suggested] payment_transactions |  |  |
| 200 | Payment[].PaymentMethod[].PaymentTransaction[].IsCopied |  | [Suggested] payment_transactions |  |  |
| 201 | Payment[].PaymentMethod[].PaymentTransaction[].ScheduledTimestamp |  | [Suggested] payment_transactions |  |  |
| 202 | Payment[].PaymentMethod[].PaymentTransaction[].OrderId |  | [Suggested] orders | order_id |  |
| 203 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentGroupId |  | [Suggested] payments | payment_group_id |  |
| 204 | Payment[].PaymentMethod[].PaymentTransaction[].StoreAndForwardNumber |  | [Suggested] payment_transactions |  |  |
| 205 | Payment[].PaymentMethod[].PaymentTransaction[].IsActivation |  | [Suggested] payment_transactions |  |  |
| 206 | Payment[].PaymentMethod[].PaymentTransaction[].OnHold |  | [Suggested] payment_transactions |  |  |
| 207 | Payment[].PaymentMethod[].PaymentTransaction[].NetworkTransactionId |  | [Suggested] payment_transactions |  |  |
| 208 | Payment[].PaymentMethod[].PaymentTransaction[].UniqueTransactionId |  | [Suggested] payment_transactions |  |  |
| 209 | Payment[].PaymentMethod[].PaymentTransaction[].IsChargeback |  | [Suggested] payment_transactions |  |  |
| 210 | Payment[].PaymentMethod[].PaymentTransaction[].NotificationTimestamp |  | [Suggested] payment_transactions |  |  |
| 211 | Payment[].PaymentMethod[].PaymentTransaction[].AlternateOrderId |  | [Suggested] payment_transactions |  |  |
| 212 | Payment[].PaymentMethod[].PaymentTransaction[].PurgeDate |  | [Suggested] payments | purge_date |  |
| 213 | Payment[].PaymentMethod[].PaymentTransaction[].FollowOnParentTransaction[] |  | [Suggested] payment_transactions |  |  |
| 215 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransAttribute[].Actions |  | [Suggested] payment_transactions |  |  |
| 216 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransAttribute[].PK |  | [Suggested] payment_transactions |  |  |
| 217 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransAttribute[].CreatedBy |  | [Suggested] orders | created_by |  |
| 218 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransAttribute[].CreatedTimestamp |  | [Suggested] payment_transactions |  |  |
| 219 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransAttribute[].UpdatedBy |  | [Suggested] orders | updated_by |  |
| 220 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransAttribute[].UpdatedTimestamp |  | [Suggested] payment_transactions |  |  |
| 221 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransAttribute[].Messages |  | [Suggested] payment_transactions |  |  |
| 222 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransAttribute[].OrgId |  | [Suggested] orders | org_id |  |
| 223 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransAttribute[].ParentPaymentTransaction.PK |  | [Suggested] payment_transactions |  |  |
| 224 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransAttribute[].Name |  | [Suggested] payment_transactions |  |  |
| 225 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransAttribute[].Value |  | [Suggested] payment_transactions |  |  |
| 226 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransAttribute[].PurgeDate |  | [Suggested] payments | purge_date |  |
| 227 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransAttribute[].Extended |  | [Suggested] payment_transactions |  |  |
| 228 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransEncrAttribute[] |  | [Suggested] payment_transactions |  |  |
| 230 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransactionDetail[].Actions |  | [Suggested] payment_transactions |  |  |
| 231 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransactionDetail[].PK |  | [Suggested] payment_transactions |  |  |
| 232 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransactionDetail[].CreatedBy |  | [Suggested] orders | created_by |  |
| 233 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransactionDetail[].CreatedTimestamp |  | [Suggested] payment_transactions |  |  |
| 234 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransactionDetail[].UpdatedBy |  | [Suggested] orders | updated_by |  |
| 235 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransactionDetail[].UpdatedTimestamp |  | [Suggested] payment_transactions |  |  |
| 236 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransactionDetail[].Messages |  | [Suggested] payment_transactions |  |  |
| 237 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransactionDetail[].OrgId |  | [Suggested] orders | org_id |  |
| 238 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransactionDetail[].PaymentTransactionDetailId |  | [Suggested] payment_transactions |  |  |
| 239 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransactionDetail[].ReferenceId |  | [Suggested] payment_transactions |  |  |
| 240 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransactionDetail[].Amount |  | [Suggested] payment_methods | amount |  |
| 241 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransactionDetail[].PurgeDate |  | [Suggested] payments | purge_date |  |
| 242 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransactionDetail[].ReferenceType.TransactionReferenceTypeId |  | [Suggested] payment_transactions |  |  |
| 243 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransactionDetail[].PaymentTransactionDetailGroup[] |  | [Suggested] payment_transactions |  |  |
| 244 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransactionDetail[].Extended |  | [Suggested] payment_transactions |  |  |
| 245 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransactionEMVTags |  | [Suggested] payment_transactions |  |  |
| 246 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentTransactionGroup[] |  | [Suggested] payment_transactions |  |  |
| 247 | Payment[].PaymentMethod[].PaymentTransaction[].TransactionType.PaymentTransactionTypeId |  | [Suggested] payment_transactions |  |  |
| 248 | Payment[].PaymentMethod[].PaymentTransaction[].Status.PaymentTransactionStatusId |  | [Suggested] payment_transactions |  |  |
| 249 | Payment[].PaymentMethod[].PaymentTransaction[].AuthorizationType |  | [Suggested] payment_transactions |  |  |
| 250 | Payment[].PaymentMethod[].PaymentTransaction[].ProcessingMode.ProcessingModeId |  | [Suggested] payment_transactions |  |  |
| 251 | Payment[].PaymentMethod[].PaymentTransaction[].PaymentResponseStatus.PaymentResponseStatusId |  | [Suggested] payment_transactions |  |  |
| 252 | Payment[].PaymentMethod[].PaymentTransaction[].TransmissionStatus.PaymentTransmissionStatusId |  | [Suggested] payment_transactions |  |  |
| 253 | Payment[].PaymentMethod[].PaymentTransaction[].InteractionMode |  | [Suggested] payment_transactions |  |  |
| 254 | Payment[].PaymentMethod[].PaymentTransaction[].NotificationStatus |  | [Suggested] payment_transactions |  |  |
| 255 | Payment[].PaymentMethod[].PaymentTransaction[].Extended |  | [Suggested] payment_transactions |  |  |
| 256 | Payment[].PaymentMethod[].ParentOrderPaymentMethod[] |  | [Suggested] payment_methods |  |  |
| 257 | Payment[].PaymentMethod[].PaymentType.PaymentTypeId |  | [Suggested] payment_methods |  |  |
| 258 | Payment[].PaymentMethod[].CardType.CardTypeId |  | [Suggested] payment_methods |  |  |
| 259 | Payment[].PaymentMethod[].AccountType |  | [Suggested] payment_methods |  |  |
| 260 | Payment[].PaymentMethod[].PaymentCategory |  | [Suggested] payment_methods |  |  |
| 261 | Payment[].PaymentMethod[].Extended.BillingNameString |  | [Suggested] payment_methods |  |  |
| 262 | Payment[].PaymentMethod[].Extended.BillingAddressString |  | [Suggested] payment_methods |  |  |
| 263 | Payment[].PaymentMethod[].Extended.InstallmentPlan |  | [Suggested] payment_methods |  |  |
| 264 | Payment[].PaymentMethod[].Extended.BillingAddressString2 |  | [Suggested] payment_methods |  |  |
| 265 | Payment[].PaymentMethod[].Extended.InstallmentRate |  | [Suggested] payment_methods |  |  |
| 266 | Payment[].Status.StatusId |  | [Suggested] quantity_details | status_id |  |
| 267 | Payment[].Extended |  | [Suggested] payments |  |  |
| 268 | CancelReason |  | [Suggested] orders | cancel_reason |  |
| 269 | ParentReservationRequestId |  |  |  |  |
| 271 | OrderTrackingInfo[].UpdatedTimestamp |  | [Suggested] order_tracking |  |  |
| 272 | OrderTrackingInfo[].CreatedTimestamp |  | [Suggested] order_tracking |  |  |
| 273 | OrderTrackingInfo[].CreatedBy |  | [Suggested] orders | created_by |  |
| 274 | OrderTrackingInfo[].TrackingNumber |  | [Suggested] order_tracking | tracking_number |  |
| 275 | OrderTrackingInfo[].ShippedDate |  | [Suggested] order_tracking |  |  |
| 276 | OrderTrackingInfo[].Extended.CRCTrackingURL |  | [Suggested] order_tracking |  |  |
| 277 | OrderTrackingInfo[].ScheduledDate |  | [Suggested] order_tracking |  |  |
| 278 | OrderTrackingInfo[].Process |  | [Suggested] quantity_details | process |  |
| 279 | OrderTrackingInfo[].StatusSubTypeDescription |  | [Suggested] order_tracking |  |  |
| 280 | OrderTrackingInfo[].TrackingDetailId |  | [Suggested] order_tracking | tracking_detail_id |  |
| 281 | OrderTrackingInfo[].PostalCode |  | [Suggested] order_tracking | postal_code |  |
| 282 | OrderTrackingInfo[].City |  | [Suggested] order_tracking | city |  |
| 283 | OrderTrackingInfo[].Date |  | [Suggested] order_tracking |  |  |
| 284 | OrderTrackingInfo[].OrgId |  | [Suggested] orders | org_id |  |
| 285 | OrderTrackingInfo[].UpdatedBy |  | [Suggested] orders | updated_by |  |
| 286 | OrderTrackingInfo[].State |  | [Suggested] order_tracking | state |  |
| 287 | OrderTrackingInfo[].StatusDescription |  | [Suggested] order_tracking | status_description |  |
| 288 | OrderTrackingInfo[].StatusSubType |  | [Suggested] order_tracking | status_sub_type |  |
| 289 | OrderTrackingInfo[].ContextId |  | [Suggested] order_tracking |  |  |
| 290 | OrderTrackingInfo[].Country |  | [Suggested] order_tracking | country |  |
| 291 | OrderTrackingInfo[].PK |  | [Suggested] order_tracking |  |  |
| 292 | OrderTrackingInfo[].PurgeDate |  | [Suggested] payments | purge_date |  |
| 293 | OrderTrackingInfo[].Unique_Identifier |  | [Suggested] order_tracking |  |  |
| 294 | EstimatedDeliveryDate |  |  |  |  |
| 295 | PackageStatus.PackageStatusId |  |  |  |  |
| 296 | DeliveredDate |  |  |  |  |
| 297 | OrgId |  | [Suggested] orders | org_id |  |
| 298 | ContextId |  |  |  |  |
| 299 | CarrierCode |  | [Suggested] allocations | carrier_code |  |
| 300 | PK |  |  |  |  |
| 301 | PurgeDate |  | [Suggested] payments | purge_date |  |
| 302 | Unique_Identifier |  |  |  |  |
| 303 | OriginalEstimatedDeliveryDate |  |  |  |  |
| 304 | OrderTrackingAdditional |  | [Suggested] order_tracking |  |  |
| 305 | ContactPreference[] |  |  |  |  |
| 306 | ReturnLabel[] |  |  |  |  |
| 307 | RelatedOrders[] |  |  |  |  |
| 308 | TotalInformationalTaxes |  | [Suggested] orders (tax fields) |  |  |
| 309 | ConfirmedDate |  |  |  |  |
| 310 | ArchiveDate |  |  |  |  |
| 311 | TransactionReference[] |  |  |  |  |
| 312 | OrderPromisingInfo |  | [Suggested] promisings |  |  |
| 313 | MinReturnStatusId |  |  |  |  |
| 314 | OrderTaxDetail[] |  | [Suggested] orders (tax fields) |  |  |
| 315 | AlternateOrderId |  |  |  |  |
| 317 | OrderLine[].ParentLineCreatedTimestamp |  | [Suggested] order_lines |  |  |
| 318 | OrderLine[].CreatedTimestamp |  | [Suggested] order_lines |  |  |
| 319 | OrderLine[].BusinessDate |  | [Suggested] order_lines |  |  |
| 320 | OrderLine[].RefundPrice |  | [Suggested] order_lines |  |  |
| 321 | OrderLine[].IsHazmat |  | [Suggested] order_lines |  |  |
| 322 | OrderLine[].TaxOverrideValue |  | [Suggested] order_lines |  |  |
| 323 | OrderLine[].MaxFulfillmentStatusId |  | [Suggested] orders | max_fulfillment_status_id |  |
| 324 | OrderLine[].OrderLineCancelHistory[] |  | [Suggested] order_lines |  |  |
| 325 | OrderLine[].StoreSaleEntryMethod |  | [Suggested] order_lines |  |  |
| 326 | OrderLine[].IsReturnAllowedByAgePolicy |  | [Suggested] order_lines |  |  |
| 327 | OrderLine[].ShippingMethodId |  | [Suggested] order_lines | shipping_method_id |  |
| 328 | OrderLine[].UpdatedBy |  | [Suggested] orders | updated_by |  |
| 329 | OrderLine[].ItemMaxDiscountPercentage |  | [Suggested] order_lines |  |  |
| 330 | OrderLine[].OrderLineSalesAssociate[] |  | [Suggested] order_lines |  |  |
| 331 | OrderLine[].ReleaseGroupId |  | [Suggested] order_lines | release_group_id |  |
| 332 | OrderLine[].OrderLineSubTotal |  | [Suggested] order_lines | order_line_sub_total |  |
| 333 | OrderLine[].ItemStyle |  | [Suggested] order_lines |  |  |
| 334 | OrderLine[].ParentOrderId |  | [Suggested] order_lines |  |  |
| 335 | OrderLine[].ReturnableQuantity |  | [Suggested] order_lines |  |  |
| 336 | OrderLine[].OrderLineHold[] |  | [Suggested] order_lines |  |  |
| 337 | OrderLine[].CreatedBy |  | [Suggested] orders | created_by |  |
| 338 | OrderLine[].SmallImageURI |  | [Suggested] order_lines | small_image_uri |  |
| 339 | OrderLine[].CarrierCode |  | [Suggested] allocations | carrier_code |  |
| 340 | OrderLine[].ItemBarcode |  | [Suggested] order_lines |  |  |
| 342 | OrderLine[].QuantityDetail[].Status.StatusId |  | [Suggested] quantity_details | status_id |  |
| 343 | OrderLine[].QuantityDetail[].UpdatedTimestamp |  | [Suggested] order_lines |  |  |
| 344 | OrderLine[].QuantityDetail[].CreatedBy |  | [Suggested] orders | created_by |  |
| 345 | OrderLine[].QuantityDetail[].CreatedTimestamp |  | [Suggested] order_lines |  |  |
| 346 | OrderLine[].QuantityDetail[].QuantityDetailId |  | [Suggested] quantity_details | quantity_detail_id |  |
| 347 | OrderLine[].QuantityDetail[].WebURL |  | [Suggested] quantity_details | web_url |  |
| 348 | OrderLine[].QuantityDetail[].Quantity |  | [Suggested] order_lines | quantity |  |
| 349 | OrderLine[].QuantityDetail[].Process |  | [Suggested] quantity_details | process |  |
| 350 | OrderLine[].QuantityDetail[].SubstitutionRatio |  | [Suggested] quantity_details | substitution_ratio |  |
| 351 | OrderLine[].QuantityDetail[].ItemId |  | [Suggested] order_lines | item_id |  |
| 352 | OrderLine[].QuantityDetail[].Reason |  | [Suggested] quantity_details | reason |  |
| 353 | OrderLine[].QuantityDetail[].UpdatedBy |  | [Suggested] orders | updated_by |  |
| 354 | OrderLine[].QuantityDetail[].OrgId |  | [Suggested] orders | org_id |  |
| 355 | OrderLine[].QuantityDetail[].SubstitutionType |  | [Suggested] quantity_details | substitution_type |  |
| 356 | OrderLine[].QuantityDetail[].UOM |  | [Suggested] order_lines | uom |  |
| 357 | OrderLine[].QuantityDetail[].StatusId |  | [Suggested] quantity_details | status_id |  |
| 358 | OrderLine[].QuantityDetail[].ReasonType |  | [Suggested] quantity_details | reason_type |  |
| 359 | OrderLine[].QuantityDetail[].ChangeLog |  | [Suggested] order_lines |  |  |
| 360 | OrderLine[].ChangeLog |  | [Suggested] order_lines |  |  |
| 361 | OrderLine[].PromisedShipDate |  | [Suggested] order_lines |  |  |
| 362 | OrderLine[].TotalDiscounts |  | [Suggested] orders | total_discounts |  |
| 363 | OrderLine[].AllocationConfigId |  | [Suggested] order_lines |  |  |
| 364 | OrderLine[].ShipToAddress.AddressName |  | [Suggested] order_lines |  |  |
| 365 | OrderLine[].ShipToAddress.AvsReason |  | [Suggested] order_lines |  |  |
| 366 | OrderLine[].ShipToAddress.Address.Email |  | [Suggested] order_lines |  |  |
| 367 | OrderLine[].ShipToAddress.Address.FirstName |  | [Suggested] order_lines |  |  |
| 368 | OrderLine[].ShipToAddress.Address.State |  | [Suggested] order_tracking | state |  |
| 369 | OrderLine[].ShipToAddress.Address.Phone |  | [Suggested] order_lines |  |  |
| 370 | OrderLine[].ShipToAddress.Address.Address2 |  | [Suggested] order_lines |  |  |
| 371 | OrderLine[].ShipToAddress.Address.Address3 |  | [Suggested] order_lines |  |  |
| 372 | OrderLine[].ShipToAddress.Address.Country |  | [Suggested] order_tracking | country |  |
| 373 | OrderLine[].ShipToAddress.Address.PostalCode |  | [Suggested] order_tracking | postal_code |  |
| 374 | OrderLine[].ShipToAddress.Address.LastName |  | [Suggested] order_lines |  |  |
| 375 | OrderLine[].ShipToAddress.Address.Address1 |  | [Suggested] order_lines |  |  |
| 376 | OrderLine[].ShipToAddress.Address.City |  | [Suggested] order_tracking | city |  |
| 377 | OrderLine[].ShipToAddress.Address.County |  | [Suggested] order_lines |  |  |
| 378 | OrderLine[].ShipToAddress.IsAddressVerified |  | [Suggested] order_lines |  |  |
| 379 | OrderLine[].ShipToAddress.Extended.AddressRef |  | [Suggested] order_lines |  |  |
| 380 | OrderLine[].ShipToAddress.AddressId |  | [Suggested] order_lines |  |  |
| 381 | OrderLine[].ServiceLevelCode |  | [Suggested] allocations | service_level_code |  |
| 382 | OrderLine[].ItemDepartmentNumber |  | [Suggested] order_lines |  |  |
| 383 | OrderLine[].IsReturnable |  | [Suggested] order_lines |  |  |
| 384 | OrderLine[].IsTaxIncluded |  | [Suggested] order_lines | is_tax_included |  |
| 385 | OrderLine[].OrderLinePriceOverrideHistory[] |  | [Suggested] order_lines |  |  |
| 386 | OrderLine[].IsOnHold |  | [Suggested] orders | is_on_hold |  |
| 387 | OrderLine[].Process |  | [Suggested] quantity_details | process |  |
| 388 | OrderLine[].IsReceiptExpected |  | [Suggested] order_lines |  |  |
| 389 | OrderLine[].OrderLineComponents[] |  | [Suggested] order_lines |  |  |
| 390 | OrderLine[].ItemId |  | [Suggested] order_lines | item_id |  |
| 391 | OrderLine[].PhysicalOriginId |  | [Suggested] order_lines |  |  |
| 392 | OrderLine[].ReturnableLineTotal |  | [Suggested] order_lines |  |  |
| 393 | OrderLine[].SellingLocationId |  | [Suggested] order_lines |  |  |
| 394 | OrderLine[].IsGift |  | [Suggested] order_lines | is_gift |  |
| 395 | OrderLine[].FulfillmentStatus |  | [Suggested] orders | fulfillment_status |  |
| 396 | OrderLine[].ParentOrderLineId |  | [Suggested] order_lines |  |  |
| 397 | OrderLine[].TotalCharges |  | [Suggested] orders | total_charges |  |
| 398 | OrderLine[].ParentOrderLineType |  | [Suggested] order_lines |  |  |
| 399 | OrderLine[].AddressId |  | [Suggested] order_lines |  |  |
| 400 | OrderLine[].ShipFromAddress |  | [Suggested] order_lines |  |  |
| 401 | OrderLine[].VolumetricWeight |  | [Suggested] order_lines |  |  |
| 402 | OrderLine[].Priority |  | [Suggested] order_lines |  |  |
| 403 | OrderLine[].OrderId |  | [Suggested] orders | order_id |  |
| 404 | OrderLine[].IsPreOrder |  | [Suggested] order_lines | is_pre_order |  |
| 405 | OrderLine[].PromisedDeliveryDate |  | [Suggested] order_lines | promised_delivery_date |  |
| 406 | OrderLine[].ItemTaxCode |  | [Suggested] order_lines |  |  |
| 407 | OrderLine[].CancelReason |  | [Suggested] orders | cancel_reason |  |
| 408 | OrderLine[].LatestDeliveryDate |  | [Suggested] order_lines |  |  |
| 409 | OrderLine[].StreetDate |  | [Suggested] order_lines |  |  |
| 410 | OrderLine[].OrderLinePromotionRequest[] |  | [Suggested] order_lines |  |  |
| 411 | OrderLine[].AlternateOrderLineId |  | [Suggested] order_lines |  |  |
| 413 | OrderLine[].OrderLinePromisingInfo.InventorySegmentId |  | [Suggested] allocations | inventory_segment_id |  |
| 414 | OrderLine[].OrderLinePromisingInfo.CreatedTimestamp |  | [Suggested] order_lines |  |  |
| 415 | OrderLine[].OrderLinePromisingInfo.ShipFromLocationId |  | [Suggested] allocations | ship_from_location_id |  |
| 416 | OrderLine[].OrderLinePromisingInfo.CountryOfOrigin |  | [Suggested] order_lines |  |  |
| 417 | OrderLine[].OrderLinePromisingInfo.Process |  | [Suggested] quantity_details | process |  |
| 418 | OrderLine[].OrderLinePromisingInfo.InventoryTypeId |  | [Suggested] allocations | inventory_type_id |  |
| 419 | OrderLine[].OrderLinePromisingInfo.ConsolidatationLocationId |  | [Suggested] order_lines |  |  |
| 420 | OrderLine[].OrderLinePromisingInfo.UpdatedBy |  | [Suggested] orders | updated_by |  |
| 421 | OrderLine[].OrderLinePromisingInfo.AsnId |  | [Suggested] order_lines |  |  |
| 422 | OrderLine[].OrderLinePromisingInfo.AsnDetailId |  | [Suggested] order_lines |  |  |
| 423 | OrderLine[].OrderLinePromisingInfo.UpdatedTimestamp |  | [Suggested] order_lines |  |  |
| 424 | OrderLine[].OrderLinePromisingInfo.CreatedBy |  | [Suggested] orders | created_by |  |
| 425 | OrderLine[].OrderLinePromisingInfo.StrategyType.StrategyTypeId |  | [Suggested] order_lines |  |  |
| 426 | OrderLine[].OrderLinePromisingInfo.BatchNumber |  | [Suggested] order_lines |  |  |
| 427 | OrderLine[].OrderLinePromisingInfo.IsForceAllocate |  | [Suggested] promising_configurations | is_force_allocate |  |
| 428 | OrderLine[].OrderLinePromisingInfo.ProductStatusId |  | [Suggested] order_lines |  |  |
| 429 | OrderLine[].OrderLinePromisingInfo.OrgId |  | [Suggested] orders | org_id |  |
| 430 | OrderLine[].OrderLinePromisingInfo.PoDetailId |  | [Suggested] order_lines |  |  |
| 431 | OrderLine[].OrderLinePromisingInfo.ItemAttribute4 |  | [Suggested] order_lines |  |  |
| 432 | OrderLine[].OrderLinePromisingInfo.ItemAttribute3 |  | [Suggested] order_lines |  |  |
| 433 | OrderLine[].OrderLinePromisingInfo.ItemAttribute2 |  | [Suggested] order_lines |  |  |
| 434 | OrderLine[].OrderLinePromisingInfo.ItemAttribute1 |  | [Suggested] order_lines |  |  |
| 435 | OrderLine[].OrderLinePromisingInfo.PoId |  | [Suggested] order_lines |  |  |
| 436 | OrderLine[].OrderLinePromisingInfo.ReqCapacityPerUnit |  | [Suggested] order_lines |  |  |
| 437 | OrderLine[].OrderLinePromisingInfo.ShipThroughLocationId |  | [Suggested] order_lines |  |  |
| 438 | OrderLine[].OrderLinePromisingInfo.ItemAttribute5 |  | [Suggested] order_lines |  |  |
| 439 | OrderLine[].DoNotShipBeforeDate |  | [Suggested] order_lines |  |  |
| 441 | OrderLine[].OrderLineTaxDetail[].IsInvoiceTax |  | [Suggested] order_lines |  |  |
| 442 | OrderLine[].OrderLineTaxDetail[].CreatedTimestamp |  | [Suggested] order_lines |  |  |
| 443 | OrderLine[].OrderLineTaxDetail[].TaxTypeId |  | [Suggested] order_lines |  |  |
| 444 | OrderLine[].OrderLineTaxDetail[].TaxIdentifier5 |  | [Suggested] order_lines |  |  |
| 445 | OrderLine[].OrderLineTaxDetail[].TaxIdentifier4 |  | [Suggested] order_lines |  |  |
| 446 | OrderLine[].OrderLineTaxDetail[].Process |  | [Suggested] quantity_details | process |  |
| 447 | OrderLine[].OrderLineTaxDetail[].JurisdictionTypeId |  | [Suggested] order_lines |  |  |
| 448 | OrderLine[].OrderLineTaxDetail[].UpdatedBy |  | [Suggested] orders | updated_by |  |
| 449 | OrderLine[].OrderLineTaxDetail[].TaxAmount |  | [Suggested] order_lines |  |  |
| 450 | OrderLine[].OrderLineTaxDetail[].HeaderTaxDetailId |  | [Suggested] order_lines |  |  |
| 451 | OrderLine[].OrderLineTaxDetail[].TaxCode |  | [Suggested] order_lines |  |  |
| 452 | OrderLine[].OrderLineTaxDetail[].TaxDate |  | [Suggested] order_lines |  |  |
| 453 | OrderLine[].OrderLineTaxDetail[].TaxRate |  | [Suggested] order_lines |  |  |
| 454 | OrderLine[].OrderLineTaxDetail[].UpdatedTimestamp |  | [Suggested] order_lines |  |  |
| 455 | OrderLine[].OrderLineTaxDetail[].CreatedBy |  | [Suggested] orders | created_by |  |
| 456 | OrderLine[].OrderLineTaxDetail[].TaxDetailId |  | [Suggested] order_lines |  |  |
| 457 | OrderLine[].OrderLineTaxDetail[].TaxableAmount |  | [Suggested] order_lines |  |  |
| 458 | OrderLine[].OrderLineTaxDetail[].TaxEngineId |  | [Suggested] order_lines |  |  |
| 459 | OrderLine[].OrderLineTaxDetail[].Jurisdiction |  | [Suggested] order_lines |  |  |
| 460 | OrderLine[].OrderLineTaxDetail[].FulfillmentGroupId |  | [Suggested] order_lines | fulfillment_group_id |  |
| 461 | OrderLine[].OrderLineTaxDetail[].OrgId |  | [Suggested] orders | org_id |  |
| 462 | OrderLine[].OrderLineTaxDetail[].IsInformational |  | [Suggested] order_lines |  |  |
| 463 | OrderLine[].OrderLineTaxDetail[].TaxIdentifier3 |  | [Suggested] order_lines |  |  |
| 464 | OrderLine[].OrderLineTaxDetail[].TaxIdentifier2 |  | [Suggested] order_lines |  |  |
| 465 | OrderLine[].OrderLineTaxDetail[].TaxIdentifier1 |  | [Suggested] order_lines |  |  |
| 466 | OrderLine[].IsItemTaxOverridable |  | [Suggested] order_lines |  |  |
| 467 | OrderLine[].OrderLineChargeDetail[] |  | [Suggested] order_lines |  |  |
| 468 | OrderLine[].OrderLineTotal |  | [Suggested] order_lines | order_line_total |  |
| 469 | OrderLine[].ItemSeason |  | [Suggested] order_lines |  |  |
| 470 | OrderLine[].ItemDescription |  | [Suggested] order_lines | item_description |  |
| 471 | OrderLine[].IsItemTaxExemptable |  | [Suggested] order_lines |  |  |
| 473 | OrderLine[].Allocation[].InventorySegmentId |  | [Suggested] allocations | inventory_segment_id |  |
| 474 | OrderLine[].Allocation[].ServiceLevelCode |  | [Suggested] allocations | service_level_code |  |
| 475 | OrderLine[].Allocation[].CreatedTimestamp |  | [Suggested] order_lines |  |  |
| 476 | OrderLine[].Allocation[].AllocationId |  | [Suggested] allocations | allocation_id |  |
| 477 | OrderLine[].Allocation[].SubstitutionTypeId |  | [Suggested] order_lines |  |  |
| 478 | OrderLine[].Allocation[].AllocationType |  | [Suggested] allocations | allocation_type |  |
| 479 | OrderLine[].Allocation[].ShipFromLocationId |  | [Suggested] allocations | ship_from_location_id |  |
| 480 | OrderLine[].Allocation[].CountryOfOrigin |  | [Suggested] order_lines |  |  |
| 481 | OrderLine[].Allocation[].EarliestDeliveryDate |  | [Suggested] allocations | earliest_delivery_date |  |
| 482 | OrderLine[].Allocation[].AllocatedOn |  | [Suggested] allocations | allocated_on |  |
| 483 | OrderLine[].Allocation[].Process |  | [Suggested] quantity_details | process |  |
| 484 | OrderLine[].Allocation[].EarliestShipDate |  | [Suggested] allocations | earliest_ship_date |  |
| 485 | OrderLine[].Allocation[].SubstitutionRatio |  | [Suggested] quantity_details | substitution_ratio |  |
| 486 | OrderLine[].Allocation[].InventoryTypeId |  | [Suggested] allocations | inventory_type_id |  |
| 487 | OrderLine[].Allocation[].ItemId |  | [Suggested] order_lines | item_id |  |
| 488 | OrderLine[].Allocation[].IsVirtual |  | [Suggested] allocations | is_virtual |  |
| 489 | OrderLine[].Allocation[].UpdatedBy |  | [Suggested] orders | updated_by |  |
| 490 | OrderLine[].Allocation[].CommittedDeliveryDate |  | [Suggested] allocations | committed_delivery_date |  |
| 491 | OrderLine[].Allocation[].InventoryAttribute1 |  | [Suggested] order_lines |  |  |
| 492 | OrderLine[].Allocation[].InventoryAttribute2 |  | [Suggested] order_lines |  |  |
| 493 | OrderLine[].Allocation[].InventoryAttribute3 |  | [Suggested] order_lines |  |  |
| 494 | OrderLine[].Allocation[].InventoryAttribute4 |  | [Suggested] order_lines |  |  |
| 495 | OrderLine[].Allocation[].InventoryAttribute5 |  | [Suggested] order_lines |  |  |
| 496 | OrderLine[].Allocation[].AsnId |  | [Suggested] order_lines |  |  |
| 497 | OrderLine[].Allocation[].AsnDetailId |  | [Suggested] order_lines |  |  |
| 498 | OrderLine[].Allocation[].Status.StatusId |  | [Suggested] quantity_details | status_id |  |
| 499 | OrderLine[].Allocation[].UpdatedTimestamp |  | [Suggested] order_lines |  |  |
| 500 | OrderLine[].Allocation[].CreatedBy |  | [Suggested] orders | created_by |  |
| 501 | OrderLine[].Allocation[].ShipToLocationId |  | [Suggested] order_lines | ship_to_location_id |  |
| 502 | OrderLine[].Allocation[].CommittedShipDate |  | [Suggested] allocations | committed_ship_date |  |
| 503 | OrderLine[].Allocation[].BatchNumber |  | [Suggested] order_lines |  |  |
| 504 | OrderLine[].Allocation[].Quantity |  | [Suggested] order_lines | quantity |  |
| 505 | OrderLine[].Allocation[].LatestShipDate |  | [Suggested] allocations | latest_ship_date |  |
| 506 | OrderLine[].Allocation[].ShipViaId |  | [Suggested] allocations | ship_via_id |  |
| 507 | OrderLine[].Allocation[].AllocationDependencyId |  | [Suggested] order_lines |  |  |
| 508 | OrderLine[].Allocation[].GroupId |  | [Suggested] order_lines |  |  |
| 509 | OrderLine[].Allocation[].ProductStatusId |  | [Suggested] order_lines |  |  |
| 510 | OrderLine[].Allocation[].OrgId |  | [Suggested] orders | org_id |  |
| 511 | OrderLine[].Allocation[].UOM |  | [Suggested] order_lines | uom |  |
| 512 | OrderLine[].Allocation[].PoDetailId |  | [Suggested] order_lines |  |  |
| 513 | OrderLine[].Allocation[].ReservationRequestDetailId |  | [Suggested] allocations | reservation_request_detail_id |  |
| 514 | OrderLine[].Allocation[].CarrierCode |  | [Suggested] allocations | carrier_code |  |
| 515 | OrderLine[].Allocation[].LatestReleaseDate |  | [Suggested] allocations | latest_release_date |  |
| 516 | OrderLine[].Allocation[].PoId |  | [Suggested] order_lines |  |  |
| 517 | OrderLine[].Allocation[].ReservationRequestId |  | [Suggested] allocations | reservation_request_id |  |
| 518 | OrderLine[].OrderLineVASInstructions[] |  | [Suggested] order_lines |  |  |
| 519 | OrderLine[].PipelineId |  | [Suggested] order_lines |  |  |
| 520 | OrderLine[].ItemSize |  | [Suggested] order_lines |  |  |
| 521 | OrderLine[].IsNonMerchandise |  | [Suggested] order_lines |  |  |
| 522 | OrderLine[].LineType |  | [Suggested] order_lines |  |  |
| 523 | OrderLine[].ShipToLocationId |  | [Suggested] order_lines | ship_to_location_id |  |
| 524 | OrderLine[].ShipFromAddressId |  | [Suggested] order_lines | ship_from_address_id |  |
| 525 | OrderLine[].IsActivationRequired |  | [Suggested] order_lines |  |  |
| 526 | OrderLine[].Quantity |  | [Suggested] order_lines | quantity |  |
| 527 | OrderLine[].IsItemNotOnFile |  | [Suggested] order_lines |  |  |
| 528 | OrderLine[].IsPackAndHold |  | [Suggested] order_lines |  |  |
| 529 | OrderLine[].IsGiftCard |  | [Suggested] order_lines |  |  |
| 530 | OrderLine[].CancelComments |  | [Suggested] order_lines |  |  |
| 531 | OrderLine[].MaxFulfillmentStatus.StatusId |  | [Suggested] quantity_details | status_id |  |
| 532 | OrderLine[].VolumetricWeightUOM |  | [Suggested] order_lines |  |  |
| 534 | OrderLine[].OrderLineExtension1.Extended.OfferId |  | [Suggested] order_lines |  |  |
| 535 | OrderLine[].OrderLineExtension1.Extended.DeliveryRoute |  | [Suggested] order_lines |  |  |
| 536 | OrderLine[].OrderLineExtension1.Extended.ProductNameVN |  | [Suggested] order_lines |  |  |
| 537 | OrderLine[].OrderLineExtension1.Extended.NumberOfPack |  | [Suggested] order_lines |  |  |
| 538 | OrderLine[].OrderLineExtension1.Extended.PickUpStoreCountry |  | [Suggested] order_lines |  |  |
| 539 | OrderLine[].OrderLineExtension1.Extended.MMSDepartment |  | [Suggested] order_lines |  |  |
| 540 | OrderLine[].OrderLineExtension1.Extended.GWPParentItem |  | [Suggested] order_lines |  |  |
| 541 | OrderLine[].OrderLineExtension1.Extended.ProductUOMEN |  | [Suggested] order_lines |  |  |
| 542 | OrderLine[].OrderLineExtension1.Extended.CustomerAddressLong |  | [Suggested] order_lines |  |  |
| 543 | OrderLine[].OrderLineExtension1.Extended.CustomerAddressLat |  | [Suggested] order_lines |  |  |
| 544 | OrderLine[].OrderLineExtension1.Extended.IsBundle |  | [Suggested] order_lines |  |  |
| 545 | OrderLine[].OrderLineExtension1.Extended.LatestItemTotal |  | [Suggested] order_lines |  |  |
| 546 | OrderLine[].OrderLineExtension1.Extended.PackUnitPrice |  | [Suggested] order_lines |  |  |
| 547 | OrderLine[].OrderLineExtension1.Extended.LatestItemSubTotal |  | [Suggested] order_lines |  |  |
| 548 | OrderLine[].OrderLineExtension1.Extended.IsWeightItem |  | [Suggested] order_lines |  |  |
| 549 | OrderLine[].OrderLineExtension1.Extended.ProductNameIT |  | [Suggested] order_lines |  |  |
| 550 | OrderLine[].OrderLineExtension1.Extended.PickUpStoreCode |  | [Suggested] order_lines |  |  |
| 551 | OrderLine[].OrderLineExtension1.Extended.ProductNameEN |  | [Suggested] order_lines |  |  |
| 552 | OrderLine[].OrderLineExtension1.Extended.PromotionId |  | [Suggested] order_lines |  |  |
| 553 | OrderLine[].OrderLineExtension1.Extended.PackItemDescriptionEN |  | [Suggested] order_lines |  |  |
| 554 | OrderLine[].OrderLineExtension1.Extended.PickUpStoreLat |  | [Suggested] order_lines |  |  |
| 555 | OrderLine[].OrderLineExtension1.Extended.MMSSKUType |  | [Suggested] order_lines |  |  |
| 556 | OrderLine[].OrderLineExtension1.Extended.PickUpStoreCity |  | [Suggested] order_lines |  |  |
| 557 | OrderLine[].OrderLineExtension1.Extended.PickUpStoreEmail |  | [Suggested] order_lines |  |  |
| 558 | OrderLine[].OrderLineExtension1.Extended.PickUpSecretKey |  | [Suggested] order_lines |  |  |
| 559 | OrderLine[].OrderLineExtension1.Extended.ReferenceOrderLineId |  | [Suggested] order_lines |  |  |
| 560 | OrderLine[].OrderLineExtension1.Extended.PackSmallImageURI |  | [Suggested] order_lines |  |  |
| 561 | OrderLine[].OrderLineExtension1.Extended.PackItemDescriptionTH |  | [Suggested] order_lines |  |  |
| 562 | OrderLine[].OrderLineExtension1.Extended.PackOriginalUnitPrice |  | [Suggested] order_lines |  |  |
| 563 | OrderLine[].OrderLineExtension1.Extended.ServiceType |  | [Suggested] order_lines |  |  |
| 564 | OrderLine[].OrderLineExtension1.Extended.PickUpStoreAddress2 |  | [Suggested] order_lines |  |  |
| 565 | OrderLine[].OrderLineExtension1.Extended.PickUpStoreAddress1 |  | [Suggested] order_lines |  |  |
| 566 | OrderLine[].OrderLineExtension1.Extended.PackitemDescription |  | [Suggested] order_lines |  |  |
| 567 | OrderLine[].OrderLineExtension1.Extended.PickUpStoreDescription |  | [Suggested] order_lines |  |  |
| 568 | OrderLine[].OrderLineExtension1.Extended.IsSubstitution |  | [Suggested] order_lines |  |  |
| 569 | OrderLine[].OrderLineExtension1.Extended.AverageWeight |  | [Suggested] order_lines |  |  |
| 570 | OrderLine[].OrderLineExtension1.Extended.AverageUnitPrice |  | [Suggested] order_lines |  |  |
| 571 | OrderLine[].OrderLineExtension1.Extended.SlotBookingFrom |  | [Suggested] order_lines |  |  |
| 572 | OrderLine[].OrderLineExtension1.Extended.CanReturntoWarehouse |  | [Suggested] order_lines |  |  |
| 573 | OrderLine[].OrderLineExtension1.Extended.PackOrderedQty |  | [Suggested] order_lines |  |  |
| 574 | OrderLine[].OrderLineExtension1.Extended.PickUpStorePhone |  | [Suggested] order_lines |  |  |
| 575 | OrderLine[].OrderLineExtension1.Extended.SourceItemTotalDiscount |  | [Suggested] order_lines |  |  |
| 576 | OrderLine[].OrderLineExtension1.Extended.ProductNameTH |  | [Suggested] order_lines |  |  |
| 577 | OrderLine[].OrderLineExtension1.Extended.SourceItemTotal |  | [Suggested] order_lines |  |  |
| 578 | OrderLine[].OrderLineExtension1.Extended.PickUpStorePostal |  | [Suggested] order_lines |  |  |
| 579 | OrderLine[].OrderLineExtension1.Extended.SourceItemSubTotal |  | [Suggested] order_lines |  |  |
| 580 | OrderLine[].OrderLineExtension1.Extended.SlotBookingId |  | [Suggested] order_lines |  |  |
| 581 | OrderLine[].OrderLineExtension1.Extended.MMSSubDepartment |  | [Suggested] order_lines |  |  |
| 582 | OrderLine[].OrderLineExtension1.Extended.SecretKeyCode |  | [Suggested] order_lines |  |  |
| 583 | OrderLine[].OrderLineExtension1.Extended.ProductUOMTH |  | [Suggested] order_lines |  |  |
| 584 | OrderLine[].OrderLineExtension1.Extended.PickUpStoreDistrict |  | [Suggested] order_lines |  |  |
| 585 | OrderLine[].OrderLineExtension1.Extended.PrimaryBarcode |  | [Suggested] order_lines |  |  |
| 586 | OrderLine[].OrderLineExtension1.Extended.IsGiftWrapping |  | [Suggested] order_lines |  |  |
| 587 | OrderLine[].OrderLineExtension1.Extended.PickUpStoreName |  | [Suggested] order_lines |  |  |
| 588 | OrderLine[].OrderLineExtension1.Extended.LatestUnitPrice |  | [Suggested] order_lines |  |  |
| 589 | OrderLine[].OrderLineExtension1.Extended.JDASKUType |  | [Suggested] order_lines |  |  |
| 590 | OrderLine[].OrderLineExtension1.Extended.PromotionType |  | [Suggested] order_lines |  |  |
| 591 | OrderLine[].OrderLineExtension1.Extended.SlotBookingTo |  | [Suggested] order_lines |  |  |
| 592 | OrderLine[].OrderLineExtension1.Extended.PickUpStoreLong |  | [Suggested] order_lines |  |  |
| 593 | OrderLine[].OrderLineExtension1.Extended.ActualQuantity |  | [Suggested] order_lines |  |  |
| 594 | OrderLine[].OrderLineExtension1.Extended.IsGWP |  | [Suggested] order_lines |  |  |
| 595 | OrderLine[].OrderLineExtension1.Extended.BundleRefId |  | [Suggested] order_lines |  |  |
| 596 | OrderLine[].OrderLineExtension1.Extended.PickUpStoreSubDistrict |  | [Suggested] order_lines |  |  |
| 597 | OrderLine[].OrderLineExtension1.Extended.ProductNameDE |  | [Suggested] order_lines |  |  |
| 598 | OrderLine[].OrderLineExtension1.Extended.LatestItemTotalDiscount |  | [Suggested] order_lines |  |  |
| 600 | OrderLine[].FulfillmentDetail[].ShipmentId |  | [Suggested] fulfillment_details | fulfillment_id |  |
| 601 | OrderLine[].FulfillmentDetail[].ServiceLevelCode |  | [Suggested] allocations | service_level_code |  |
| 602 | OrderLine[].FulfillmentDetail[].CreatedTimestamp |  | [Suggested] order_lines |  |  |
| 603 | OrderLine[].FulfillmentDetail[].TrackingNumber |  | [Suggested] order_tracking | tracking_number |  |
| 604 | OrderLine[].FulfillmentDetail[].Process |  | [Suggested] quantity_details | process |  |
| 605 | OrderLine[].FulfillmentDetail[].PackageDetailId |  | [Suggested] order_lines |  |  |
| 606 | OrderLine[].FulfillmentDetail[].FulfillmentDate |  | [Suggested] order_lines |  |  |
| 607 | OrderLine[].FulfillmentDetail[].ItemId |  | [Suggested] order_lines | item_id |  |
| 608 | OrderLine[].FulfillmentDetail[].FulfillmentId |  | [Suggested] fulfillment_details | fulfillment_id |  |
| 609 | OrderLine[].FulfillmentDetail[].UpdatedBy |  | [Suggested] orders | updated_by |  |
| 610 | OrderLine[].FulfillmentDetail[].FulfillmentDetailId |  | [Suggested] fulfillment_details | fulfillment_id |  |
| 611 | OrderLine[].FulfillmentDetail[].ReturnTrackingNumber |  | [Suggested] order_lines |  |  |
| 612 | OrderLine[].FulfillmentDetail[].GcNumber |  | [Suggested] order_lines |  |  |
| 613 | OrderLine[].FulfillmentDetail[].UpdatedTimestamp |  | [Suggested] order_lines |  |  |
| 614 | OrderLine[].FulfillmentDetail[].CreatedBy |  | [Suggested] orders | created_by |  |
| 615 | OrderLine[].FulfillmentDetail[].GiftCardPIN |  | [Suggested] order_lines |  |  |
| 616 | OrderLine[].FulfillmentDetail[].Quantity |  | [Suggested] order_lines | quantity |  |
| 617 | OrderLine[].FulfillmentDetail[].ShipViaId |  | [Suggested] allocations | ship_via_id |  |
| 618 | OrderLine[].FulfillmentDetail[].GiftCardNumber |  | [Suggested] order_lines |  |  |
| 619 | OrderLine[].FulfillmentDetail[].ReleaseId |  | [Suggested] releases | release_id |  |
| 620 | OrderLine[].FulfillmentDetail[].ReleaseLineId |  | [Suggested] release_lines | release_line_id |  |
| 621 | OrderLine[].FulfillmentDetail[].GcPIN |  | [Suggested] order_lines |  |  |
| 622 | OrderLine[].FulfillmentDetail[].OrgId |  | [Suggested] orders | org_id |  |
| 623 | OrderLine[].FulfillmentDetail[].UOM |  | [Suggested] order_lines | uom |  |
| 624 | OrderLine[].FulfillmentDetail[].Eta |  | [Suggested] order_lines |  |  |
| 625 | OrderLine[].FulfillmentDetail[].SerialNumber |  | [Suggested] order_lines |  |  |
| 626 | OrderLine[].FulfillmentDetail[].CarrierCode |  | [Suggested] allocations | carrier_code |  |
| 627 | OrderLine[].FulfillmentDetail[].StatusId |  | [Suggested] quantity_details | status_id |  |
| 628 | OrderLine[].FulfillmentDetail[].PackageId |  | [Suggested] order_lines |  |  |
| 629 | OrderLine[].OrderLineExtension2[] |  | [Suggested] order_lines |  |  |
| 630 | OrderLine[].UOM |  | [Suggested] order_lines | uom |  |
| 631 | OrderLine[].OrderLineId |  | [Suggested] order_lines | order_line_id |  |
| 632 | OrderLine[].TotalTaxes |  | [Suggested] orders | total_taxes |  |
| 633 | OrderLine[].OrderLineAdditional |  | [Suggested] order_lines |  |  |
| 634 | OrderLine[].TransactionReferenceId |  | [Suggested] order_lines |  |  |
| 635 | OrderLine[].RequestedDeliveryDate |  | [Suggested] order_lines |  |  |
| 636 | OrderLine[].OriginalUnitPrice |  | [Suggested] order_lines | original_unit_price |  |
| 637 | OrderLine[].IsEvenExchange |  | [Suggested] order_lines |  |  |
| 638 | OrderLine[].LineProcessInfo |  | [Suggested] order_lines |  |  |
| 639 | CancelledOrderSubTotal |  |  |  |  |
| 640 | CustomerEmail |  | [Suggested] orders | customer_email |  |
| 641 | DoNotReleaseBefore |  | [Suggested] releases |  |  |
| 642 | PackageCount |  |  |  |  |
| 643 | SellingChannel.SellingChannelId |  |  |  |  |
| 644 | OrderNote[] |  | [Suggested] orders | order_note |  |
| 645 | OrderAttribute[] |  |  |  |  |
| 646 | OrderAttribute[].UpdatedTimestamp |  |  |  |  |
| 647 | OrderAttribute[].UpdatedBy |  | [Suggested] orders | updated_by |  |
| 648 | OrderAttribute[].OrgId |  | [Suggested] orders | org_id |  |
| 649 | OrderAttribute[].AttributeValue |  |  |  |  |
| 650 | OrderAttribute[].CreatedBy |  | [Suggested] orders | created_by |  |
| 651 | OrderAttribute[].CreatedTimestamp |  |  |  |  |
| 652 | OrderAttribute[].ContextId |  |  |  |  |
| 653 | OrderAttribute[].Process |  | [Suggested] quantity_details | process |  |
| 654 | OrderAttribute[].AttributeName |  |  |  |  |
| 655 | OrderAttribute[].PK |  |  |  |  |
| 656 | OrderAttribute[].PurgeDate |  | [Suggested] payments | purge_date |  |
| 657 | OrderAttribute[].Unique_Identifier |  |  |  |  |
| 658 | RunId |  |  |  |  |
| 659 | MinFulfillmentStatusId |  | [Suggested] orders | min_fulfillment_status_id |  |
| 660 | DocType.DocTypeId |  |  |  |  |
| 662 | Release[].ReleaseType |  | [Suggested] releases | release_type |  |
| 663 | Release[].UpdatedTimestamp |  | [Suggested] releases |  |  |
| 664 | Release[].ServiceLevelCode |  | [Suggested] allocations | service_level_code |  |
| 665 | Release[].ShipToLocationId |  | [Suggested] order_lines | ship_to_location_id |  |
| 666 | Release[].EffectiveRank |  | [Suggested] releases | effective_rank |  |
| 667 | Release[].CreatedBy |  | [Suggested] orders | created_by |  |
| 668 | Release[].CreatedTimestamp |  | [Suggested] releases |  |  |
| 670 | Release[].ReleaseLine[].CancelledQuantity |  | [Suggested] release_lines | cancelled_quantity |  |
| 671 | Release[].ReleaseLine[].UpdatedTimestamp |  | [Suggested] release_lines |  |  |
| 672 | Release[].ReleaseLine[].EffectiveRank |  | [Suggested] releases | effective_rank |  |
| 673 | Release[].ReleaseLine[].CreatedBy |  | [Suggested] orders | created_by |  |
| 674 | Release[].ReleaseLine[].CreatedTimestamp |  | [Suggested] release_lines |  |  |
| 675 | Release[].ReleaseLine[].FulfilledQuantity |  | [Suggested] release_lines | fulfilled_quantity |  |
| 676 | Release[].ReleaseLine[].AllocationId |  | [Suggested] allocations | allocation_id |  |
| 677 | Release[].ReleaseLine[].Quantity |  | [Suggested] order_lines | quantity |  |
| 678 | Release[].ReleaseLine[].Process |  | [Suggested] quantity_details | process |  |
| 679 | Release[].ReleaseLine[].ItemId |  | [Suggested] order_lines | item_id |  |
| 680 | Release[].ReleaseLine[].ReleaseLineId |  | [Suggested] release_lines | release_line_id |  |
| 681 | Release[].ReleaseLine[].OrgId |  | [Suggested] orders | org_id |  |
| 682 | Release[].ReleaseLine[].UpdatedBy |  | [Suggested] orders | updated_by |  |
| 683 | Release[].ReleaseLine[].UOM |  | [Suggested] order_lines | uom |  |
| 684 | Release[].ReleaseLine[].OrderLineId |  | [Suggested] order_lines | order_line_id |  |
| 685 | Release[].ReleaseLine[].CancelledDate |  | [Suggested] release_lines | cancelled_date |  |
| 686 | Release[].DeliveryMethodId |  | [Suggested] releases | delivery_method_id |  |
| 687 | Release[].ShipFromLocationId |  | [Suggested] allocations | ship_from_location_id |  |
| 688 | Release[].ShipViaId |  | [Suggested] allocations | ship_via_id |  |
| 689 | Release[].Process |  | [Suggested] quantity_details | process |  |
| 690 | Release[].ReleaseId |  | [Suggested] releases | release_id |  |
| 691 | Release[].OrderId |  | [Suggested] orders | order_id |  |
| 692 | Release[].OrgId |  | [Suggested] orders | org_id |  |
| 693 | Release[].UpdatedBy |  | [Suggested] orders | updated_by |  |
| 694 | Release[].ReleaseExtension1[] |  | [Suggested] releases |  |  |
| 695 | Release[].DestinationAction |  | [Suggested] releases |  |  |
| 696 | Release[].CarrierCode |  | [Suggested] allocations | carrier_code |  |
| 697 | PublishStatus.PublishStatusId |  |  |  |  |
| 698 | MinFulfillmentStatus.StatusId |  | [Suggested] quantity_details | status_id |  |
| 699 | UpdatedTimestamp |  |  |  |  |
| 700 | ReturnLabelEmail |  |  |  |  |
| 701 | MaxReturnStatusId |  |  |  |  |
| 702 | ProcessInfo |  |  |  |  |
| 704 | OrderMilestoneEvent[].MonitoringRuleId |  |  |  |  |
| 705 | OrderMilestoneEvent[].UpdatedTimestamp |  |  |  |  |
| 706 | OrderMilestoneEvent[].OrgId |  | [Suggested] orders | org_id |  |
| 707 | OrderMilestoneEvent[].UpdatedBy |  | [Suggested] orders | updated_by |  |
| 708 | OrderMilestoneEvent[].CreatedBy |  | [Suggested] orders | created_by |  |
| 709 | OrderMilestoneEvent[].CreatedTimestamp |  |  |  |  |
| 710 | OrderMilestoneEvent[].EventTime |  |  |  |  |
| 711 | OrderMilestoneEvent[].MilestoneDefinitionId |  |  |  |  |
| 712 | OrderMilestoneEvent[].EventId |  |  |  |  |
| 713 | OrderMilestoneEvent[].Process |  | [Suggested] quantity_details | process |  |
| 714 | CancelComments |  |  |  |  |
| 715 | MaxFulfillmentStatus.StatusId |  | [Suggested] quantity_details | status_id |  |
| 716 | MerchSaleLineCount |  |  |  |  |
| 717 | CustomerIdentityDoc[] |  |  |  |  |
| 719 | OrderMilestone[].MonitoringRuleId |  |  |  |  |
| 720 | OrderMilestone[].UpdatedTimestamp |  |  |  |  |
| 721 | OrderMilestone[].OrgId |  | [Suggested] orders | org_id |  |
| 722 | OrderMilestone[].UpdatedBy |  | [Suggested] orders | updated_by |  |
| 723 | OrderMilestone[].CreatedBy |  | [Suggested] orders | created_by |  |
| 724 | OrderMilestone[].CreatedTimestamp |  |  |  |  |
| 725 | OrderMilestone[].ExpectedTime |  |  |  |  |
| 726 | OrderMilestone[].ActualTime |  |  |  |  |
| 727 | OrderMilestone[].MilestoneDefinitionId |  |  |  |  |
| 728 | OrderMilestone[].Process |  | [Suggested] quantity_details | process |  |
| 729 | OrderMilestone[].NextEventTime |  |  |  |  |
| 730 | OrderLocale |  |  |  |  |
| 731 | IsOrderCountable |  |  |  |  |
| 732 | TotalTaxes |  | [Suggested] orders | total_taxes |  |
| 733 | CustomerLastName |  | [Suggested] orders | customer_last_name |  |
| 734 | CapturedDate |  |  |  |  |
| 735 | CustomerTypeId |  |  |  |  |
| 736 | NextEventTime |  |  |  |  |
| 737 | ChangeLog.ModTypes.Order[] |  |  |  |  |
| 738 | OrderTotal |  | [Suggested] orders | order_total |  |
| 739 | TotalDiscounts |  | [Suggested] orders | total_discounts |  |


---

## Statistics
- **Total Fields**: 721
- **Fields with Original Mapping**: 1
- **Fields with Suggested Mapping**: 618
- **Fields without Mapping**: 102

## Field Categories
- **Order Line**: 317 fields
- **Payment**: 190 fields
- **Order Header**: 115 fields
- **Order Extension**: 40 fields
- **Release**: 34 fields
- **Order Tracking**: 24 fields
- **Fulfillment**: 1 fields
