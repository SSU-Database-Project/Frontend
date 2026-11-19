import type { ShipmentStatus } from './commerce'

export type Page<T> = { content: T[]; page: number; totalPages: number; totalElements: number }
export type ShopCategory = { id: number; name: string; children: ShopCategory[] }
export type ShopProduct = {
  id: number; name: string; brandName: string; categoryId: number; categoryName: string
  productCode: string; price: number; imageUrl: string | null; soldOut: boolean
}
export type ShopOption = { optionId: number; colorName: string; sizeLabel: string; stock: number; soldOut: boolean }
export type ShopDetail = ShopProduct & {
  options: ShopOption[]; totalStock: number; gender: string; season: string; shipDays: number; description: string | null
}
export type CartItem = {
  cartItemId: number; optionId: number; productId: number; productName: string; brandName: string
  imageUrl: string | null; colorName: string; sizeLabel: string; price: number; stock: number
  state: 'AVAILABLE' | 'UNAVAILABLE' | 'SOLD_OUT'; quantity: number; selected: boolean; lineTotal: number
}
export type Cart = { items: CartItem[]; selectedCount: number; totalPrice: number }
export type DeliveryAddress = {
  receiverName: string; receiverPhone: string; zipCode: string; address: string; addressDetail: string
}
export type PaymentMethod = 'CARD' | 'BANK_TRANSFER' | 'EASY_PAY'
export type PaymentInput = { method: 'CARD'; cardNumber: string } | { method: 'BANK_TRANSFER' | 'EASY_PAY' }
export type CheckoutInput = DeliveryAddress & { payment: PaymentInput }
export type PaymentRefund = { shipmentId: number; amount: number; refundedAt: string }
export type OrderPayment = {
  paymentId: number; method: PaymentMethod; amount: number; cardNumberMasked: string | null
  approvalNo: string; paidAt: string; refundedAmount: number; balance: number; refunds: PaymentRefund[]
}
export type OrderItem = {
  orderItemId: number; productId: number; productName: string; imageUrl: string | null
  colorName: string; sizeLabel: string; quantity: number; unitPrice: number; lineTotal: number
}
export type Shipment = {
  shipmentId: number; sellerCompanyName: string; status: ShipmentStatus; subtotal: number; items: OrderItem[]
}
export type MemberOrder = DeliveryAddress & {
  orderId: number; createdAt: string; totalPrice: number; shipments: Shipment[]; payment: OrderPayment | null
}
export type ShipmentAction = 'cancel' | 'confirm'
export type CartUpdate = { quantity?: number; selected?: boolean }
export interface MemberApi {
  categories(): Promise<ShopCategory[]>
  products(keyword: string, categoryId: number | null, page: number): Promise<Page<ShopProduct>>
  product(id: number): Promise<ShopDetail>
  favorites(): Promise<ShopProduct[]>
  like(id: number, liked: boolean): Promise<{ liked: boolean }>
  cart(): Promise<Cart>
  add(optionId: number): Promise<Cart>
  update(itemId: number, change: CartUpdate): Promise<Cart>
  remove(itemId: number): Promise<Cart>
  orders(page: number): Promise<Page<MemberOrder>>
  order(id: number): Promise<MemberOrder>
  checkout(input: CheckoutInput): Promise<MemberOrder>
  shipment(orderId: number, shipmentId: number, action: ShipmentAction): Promise<MemberOrder>
}
