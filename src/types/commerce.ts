import type { Role } from './role'

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN'

export type SellerBusinessInfo = {
  businessNumber: string
  companyName: string
  representativeName: string
}

export type UserItem = {
  id: number
  email: string
  name: string
  role: Role
  status: UserStatus
  createdAt: string
  withdrawnAt?: string
  sellerInfo?: SellerBusinessInfo
}

export type BrandStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type Brand = {
  id: number
  sellerId: number
  sellerName: string
  name: string
  description: string
  status: BrandStatus
  rejectReason?: string
  createdAt: string
}

export type SizeGroup = 'CLOTHING' | 'SHOES' | 'FREE'

export type Category = {
  id: number
  parentId: number | null
  name: string
  sizeGroup: SizeGroup
}

export type ColorOption = {
  id: number
  name: string
  hexCode: string
}

export type SizeOption = {
  id: number
  sizeGroup: SizeGroup
  label: string
}

export type Gender = 'MEN' | 'WOMEN' | 'UNISEX'

export type ProductStatus =
  | 'PENDING'
  | 'REJECTED'
  | 'ON_SALE'
  | 'SOLD_OUT'
  | 'BLOCKED'
  | 'DELETED'

export type ProductOption = {
  id: number
  productId: number
  colorId: number
  colorName: string
  hexCode: string
  sizeId: number
  sizeLabel: string
  stockQuantity: number
}

export type StockHistoryType = 'IN' | 'ORDER' | 'CANCEL' | 'ADJUST'

export type StockHistoryItem = {
  id: number
  optionId: number
  productId: number
  productName: string
  productCode: string
  colorName: string
  sizeLabel: string
  changeQty: number
  quantityAfter: number
  type: StockHistoryType
  memo?: string
  orderItemId?: number
  createdAt: string
}

export type Product = {
  id: number
  brandId: number
  brandName: string
  sellerId: number
  sellerName: string
  categoryId: number
  parentCategoryName: string
  categoryName: string
  sizeGroup: SizeGroup
  name: string
  productCode: string
  gender: Gender
  season: string
  shipDays: number
  price: number
  imageUrl: string
  status: ProductStatus
  rejectReason?: string
  options: ProductOption[]
  createdAt: string
}

export type ShipmentStatus =
  | 'ORDERED'
  | 'PREPARING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CONFIRMED'
  | 'CANCELED'

export type ShipmentOrderItem = {
  id: number
  optionId: number
  productId: number
  productName: string
  productCode: string
  colorName: string
  sizeLabel: string
  unitPrice: number
  quantity: number
}

export type SellerShipment = {
  id: number
  orderId: number
  orderNumber: string
  sellerId: number
  brandName: string
  buyerName: string
  buyerEmail: string
  address: string
  status: ShipmentStatus
  items: ShipmentOrderItem[]
  totalAmount: number
  createdAt: string
  confirmedAt?: string
  canceledAt?: string
}

export type StatPeriod = 'daily' | 'weekly' | 'monthly'

export type SalesStatPoint = {
  label: string
  dateKey: string
  salesCount: number
  revenue: number
  orderCount: number
}

export type TopProductStat = {
  productId: number
  productName: string
  productCode: string
  brandName: string
  categoryName: string
  salesCount: number
  revenue: number
  currentStock: number
}

export type BrandSalesSummary = {
  brandId: number
  brandName: string
  sellerName: string
  productCount: number
  salesCount: number
  revenue: number
}
