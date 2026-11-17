import { useEffect, useState } from 'react'
import { products, type Product } from '../../data/memberCatalog'

export type CartLine = {
  productId: number
  color: string
  size: string
  quantity: number
  checked: boolean
}

type MemberBag = { favorites: number[]; cart: CartLine[] }
const storageKey = 'seam.member.shopping.v1'
export const lineKey = (line: Pick<CartLine, 'productId' | 'color' | 'size'>) =>
  [line.productId, line.color, line.size].join('/')

function readBag(): MemberBag {
  const empty = { favorites: [], cart: [] }
  try {
    const raw = sessionStorage.getItem(storageKey)
    if (!raw) return empty
    const saved = JSON.parse(raw)
    if (!Array.isArray(saved.favorites) || !Array.isArray(saved.cart)) return empty
    const favorites = products.filter(p => saved.favorites.includes(p.id)).map(p => p.id)
    const cart: CartLine[] = []
    for (const line of saved.cart) {
      const product = products.find(p => p.id === line?.productId)
      if (!product || !product.colors.includes(line.color) || !product.sizes.includes(line.size) ||
          !Number.isInteger(line.quantity) || line.quantity < 1 || cart.some(item => lineKey(item) === lineKey(line))) continue
      const quantity = Math.min(line.quantity, product.stock - quantityInCart(cart, product.id))
      if (quantity > 0) cart.push({ ...line, quantity, checked: line.checked === true })
    }
    return { favorites, cart }
  } catch {
    return empty
  }
}

export function quantityInCart(cart: CartLine[], productId: number) {
  return cart.reduce((sum, line) => sum + (line.productId === productId ? line.quantity : 0), 0)
}

export function useMemberBag() {
  const [bag, setBag] = useState(readBag)
  useEffect(() => {
    try { sessionStorage.setItem(storageKey, JSON.stringify(bag)) } catch { /* Keep the in-memory bag when storage is unavailable. */ }
  }, [bag])

  function toggleFavorite(id: number) {
    setBag(prev => ({ ...prev, favorites: prev.favorites.includes(id)
      ? prev.favorites.filter(item => item !== id) : [...prev.favorites, id] }))
  }

  function add(product: Product, color: string, size: string) {
    setBag(prev => {
      if (quantityInCart(prev.cart, product.id) >= product.stock) return prev
      const line = { productId: product.id, color, size, quantity: 1, checked: true }
      const key = lineKey(line)
      const cart = prev.cart.some(item => lineKey(item) === key)
        ? prev.cart.map(item => lineKey(item) === key ? { ...item, quantity: item.quantity + 1, checked: true } : item)
        : [...prev.cart, line]
      return { ...prev, cart }
    })
  }

  function changeQuantity(key: string, delta: number) {
    setBag(prev => ({ ...prev, cart: prev.cart.map(line => {
      if (lineKey(line) !== key) return line
      const product = products.find(p => p.id === line.productId)!
      if (line.quantity + delta < 1 || quantityInCart(prev.cart, product.id) + delta > product.stock) return line
      return { ...line, quantity: line.quantity + delta }
    }) }))
  }

  function check(checked: boolean, key?: string) {
    setBag(prev => ({ ...prev, cart: prev.cart.map(line => !key || key === lineKey(line) ? { ...line, checked } : line) }))
  }

  function remove(key: string) {
    setBag(prev => ({ ...prev, cart: prev.cart.filter(line => lineKey(line) !== key) }))
  }
  return { ...bag, toggleFavorite, add, changeQuantity, check, remove }
}
