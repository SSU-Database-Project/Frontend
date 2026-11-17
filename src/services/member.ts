import type { MemberApi, Page, ShopProduct } from '../types/member'
import { requestData } from './api'

const body = (method: string, data: unknown): RequestInit => ({ method, body: JSON.stringify(data) })

export const memberApi: MemberApi = {
  categories: () => requestData('/api/categories'),
  products(keyword, categoryId, page) {
    const query = new URLSearchParams({ page: String(page), size: '24', sort: 'latest' })
    if (keyword) query.set('keyword', keyword)
    if (categoryId !== null) query.set('categoryId', String(categoryId))
    return requestData('/api/products?' + query)
  },
  product: id => requestData('/api/products/' + id),
  async favorites() {
    // Product summaries omit liked state. Load the member's likes once for the grid and detail hearts.
    const items: ShopProduct[] = []
    let page = 0
    while (true) {
      const result = await requestData<Page<ShopProduct>>('/api/users/me/likes?size=100&page=' + page)
      items.push(...result.content)
      if (++page >= result.totalPages) return Array.from(new Map(items.map(item => [item.id, item])).values())
    }
  },
  like: (id, liked) => requestData('/api/products/' + id + '/like', { method: liked ? 'POST' : 'DELETE' }),
  cart: () => requestData('/api/cart'),
  add: optionId => requestData('/api/cart/items', body('POST', { optionId, quantity: 1 })),
  update: (id, change) => requestData('/api/cart/items/' + id, body('PATCH', change)),
  remove: id => requestData('/api/cart/items/' + id, { method: 'DELETE' }),
  orders: page => requestData('/api/orders?size=10&page=' + page),
  order: id => requestData('/api/orders/' + id),
  checkout: address => requestData('/api/orders', body('POST', address)),
  shipment: (id, shipmentId, action) => requestData('/api/orders/' + id + '/shipments/' + shipmentId + '/' + action, { method: 'POST' }),
}
