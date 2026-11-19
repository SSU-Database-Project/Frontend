import { categories, demoOrders, products } from '../data/memberCatalog'
import type { Cart, CartItem, MemberApi, MemberOrder, Page, ShopDetail, ShopOption } from '../types/member'
import { ApiError } from './api'
import { paymentInput } from '../utils/payment'

const categoryList = categories.map((name, index) => ({ id: index + 1, name, children: [] }))
const catalog: ShopDetail[] = products.map(p => ({
  id: p.id, name: p.name, brandName: p.brand, categoryId: categories.indexOf(p.category) + 1,
  categoryName: p.category, productCode: String(p.id), price: p.price, imageUrl: p.image,
  soldOut: !p.stock, totalStock: p.stock, gender: p.gender, season: p.season, shipDays: 2, description: null,
  options: p.colors.flatMap((colorName, i) => p.sizes.map((sizeLabel, j) => ({
    optionId: p.id * 100 + i * 10 + j, colorName, sizeLabel, stock: p.stock, soldOut: !p.stock,
  }))),
}))

type LocalState = { favorites: number[]; items: CartItem[]; orders: MemberOrder[] }
function cartLine(p: ShopDetail, o: ShopOption, quantity: number, selected: boolean): CartItem {
  return { cartItemId: o.optionId, optionId: o.optionId, productId: p.id, productName: p.name, brandName: p.brandName,
    imageUrl: p.imageUrl, colorName: o.colorName, sizeLabel: o.sizeLabel, price: p.price, stock: o.stock,
    state: p.soldOut ? 'SOLD_OUT' : 'AVAILABLE', quantity, selected, lineTotal: p.price * quantity }
}
function summarize(items: CartItem[]): Cart {
  const checked = items.filter(i => i.selected && i.state === 'AVAILABLE')
  return { items, selectedCount: checked.length, totalPrice: checked.reduce((sum, i) => sum + i.lineTotal, 0) }
}
function slicePage<T>(items: T[], page: number, size: number): Page<T> {
  return { content: items.slice(page * size, (page + 1) * size), page, totalPages: Math.ceil(items.length / size), totalElements: items.length }
}
function initialState(userId: number): LocalState {
  const orders: MemberOrder[] = demoOrders.map((o, index) => {
    const p = catalog.find(item => item.id === o.productId)!
    const total = o.unitPrice * o.quantity
    return { orderId: demoOrders.length - index, createdAt: o.date.replaceAll('.', '-') + 'T12:00:00', totalPrice: total,
      receiverName: '시연 회원', receiverPhone: '', zipCode: '', address: '시연 배송지', addressDetail: '', payment: null,
      shipments: [{ shipmentId: index + 1, sellerCompanyName: p.brandName, subtotal: total,
        status: o.status === '배송 완료' ? 'DELIVERED' : 'SHIPPING',
        items: [{ orderItemId: index + 1, productId: p.id, productName: p.name, imageUrl: p.imageUrl,
          colorName: o.color, sizeLabel: o.size, quantity: o.quantity, unitPrice: o.unitPrice, lineTotal: total }] }] }
  })
  const state: LocalState = { favorites: [], items: [], orders }
  // The earlier offline UI stored color and size names instead of option IDs.
  try {
    const old = JSON.parse(sessionStorage.getItem('seam.member.shopping.v1.' + userId) ?? 'null')
    if (Array.isArray(old?.favorites)) state.favorites = old.favorites.filter((id: number) => catalog.some(p => p.id === id))
    if (Array.isArray(old?.cart)) for (const line of old.cart) {
      const p = catalog.find(item => item.id === line?.productId)
      const o = p?.options.find(opt => opt.colorName === line.color && opt.sizeLabel === line.size)
      if (p && o && Number.isInteger(line.quantity) && line.quantity > 0) state.items.push(cartLine(p, o, line.quantity, line.checked === true))
    }
  } catch { /* Use demo defaults when old data is unreadable. */ }
  return state
}

export function createMockMemberApi(userId: number): MemberApi {
  const key = 'seam.member.mock.v2.' + userId
  function read(): LocalState {
    const raw = sessionStorage.getItem(key)
    const state: LocalState = raw ? JSON.parse(raw) : initialState(userId)
    state.orders.forEach(order => { order.payment ??= null })
    return state
  }
  const save = (state: LocalState) => sessionStorage.setItem(key, JSON.stringify(state))
  function findOrder(state: LocalState, id: number) {
    const order = state.orders.find(o => o.orderId === id)
    if (!order) throw new Error('주문을 찾을 수 없습니다.')
    return order
  }
  return {
    async categories() { return categoryList },
    async products(keyword, categoryId, page) {
      const term = keyword.toLowerCase()
      return slicePage(catalog.filter(p => (!categoryId || p.categoryId === categoryId) &&
        [p.name, p.brandName, p.productCode].some(v => v.toLowerCase().includes(term))), page, 24)
    },
    async product(id) {
      const product = catalog.find(p => p.id === id)
      if (!product) throw new Error('상품을 찾을 수 없습니다.')
      return product
    },
    async favorites() { return read().favorites.flatMap(id => catalog.filter(p => p.id === id)) },
    async like(id, liked) {
      const state = read()
      state.favorites = state.favorites.filter(p => p !== id)
      if (liked) state.favorites.unshift(id)
      save(state)
      return { liked }
    },
    async cart() { return summarize(read().items) },
    async add(id) {
      const state = read()
      const p = catalog.find(p => p.options.some(o => o.optionId === id))
      const o = p?.options.find(o => o.optionId === id)
      if (!p || !o || o.soldOut) throw new Error('담을 수 없는 옵션입니다.')
      const index = state.items.findIndex(line => line.optionId === id)
      const quantity = (state.items[index]?.quantity ?? 0) + 1
      if (quantity > Math.min(o.stock, 99)) throw new Error('담을 수 있는 수량을 초과했습니다.')
      const item = cartLine(p, o, quantity, true)
      if (index < 0) state.items.push(item)
      else state.items[index] = item
      save(state)
      return summarize(state.items)
    },
    async update(id, change) {
      const state = read()
      const line = state.items.find(i => i.cartItemId === id)
      if (!line) throw new Error('장바구니 항목을 찾을 수 없습니다.')
      Object.assign(line, change)
      line.lineTotal = line.price * line.quantity
      save(state)
      return summarize(state.items)
    },
    async remove(id) {
      const state = read()
      state.items = state.items.filter(item => item.cartItemId !== id)
      save(state)
      return summarize(state.items)
    },
    async orders(page) { return slicePage(read().orders, page, 10) },
    async order(id) { return findOrder(read(), id) },
    async checkout(input) {
      const state = read()
      const { payment: request, ...address } = input
      const payment = paymentInput(request.method, request.method === 'CARD' ? request.cardNumber : '')
      const lines = state.items.filter(item => item.selected)
      if (!lines.length || lines.some(line => line.state !== 'AVAILABLE' || line.quantity > line.stock)) throw new Error('주문할 상품을 확인해 주세요.')
      const totalPrice = summarize(lines).totalPrice
      if (totalPrice > 1_000_000) throw new ApiError('결제 한도(100만 원)를 초과해 승인이 거절되었습니다.', 402, 'PAYMENT_DECLINED')
      if (payment.method === 'CARD' && payment.cardNumber.endsWith('0000')) {
        throw new ApiError('카드사에서 승인을 거절했습니다.', 402, 'PAYMENT_DECLINED')
      }
      const orderId = Math.max(0, ...state.orders.map(o => o.orderId)) + 1
      const sellers = Array.from(new Set(lines.map(line => line.brandName)))
      const createdAt = new Date().toISOString()
      const order: MemberOrder = { ...address, orderId, createdAt, totalPrice,
        payment: { paymentId: orderId, method: payment.method, amount: totalPrice,
          cardNumberMasked: payment.method === 'CARD' ? '****-****-****-' + payment.cardNumber.slice(-4) : null,
          approvalNo: 'MOCK-' + createdAt.slice(0, 10).replaceAll('-', '') + '-' + crypto.randomUUID().slice(0, 8).toUpperCase(),
          paidAt: createdAt, refundedAmount: 0, balance: totalPrice, refunds: [] },
        shipments: sellers.map((sellerCompanyName, index) => {
          const items = lines.filter(i => i.brandName === sellerCompanyName).map(i => ({
            ...i, orderItemId: i.cartItemId, unitPrice: i.price,
          }))
          return { shipmentId: orderId * 100 + index, status: 'ORDERED', sellerCompanyName, items, subtotal: items.reduce((sum, i) => sum + i.lineTotal, 0) }
        }) }
      state.orders.unshift(order)
      state.items = state.items.filter(i => !i.selected)
      save(state)
      return order
    },
    async shipment(orderId, id, action) {
      const state = read()
      const order = findOrder(state, orderId)
      const shipment = order.shipments.find(s => s.shipmentId === id)
      if (!shipment || shipment.status !== (action === 'cancel' ? 'ORDERED' : 'DELIVERED')) throw new Error('변경할 수 없는 배송 상태입니다.')
      shipment.status = action === 'cancel' ? 'CANCELED' : 'CONFIRMED'
      if (action === 'cancel' && order.payment) {
        order.payment.refunds.push({ shipmentId: id, amount: shipment.subtotal, refundedAt: new Date().toISOString() })
        order.payment.refundedAmount += shipment.subtotal
        order.payment.balance = order.payment.amount - order.payment.refundedAmount
      }
      save(state)
      return order
    },
  }
}
