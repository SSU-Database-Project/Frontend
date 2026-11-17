import { useEffect, useMemo, useState } from 'react'
import ShopHeader from '../../components/member/ShopHeader'
import ProductGrid, { type HeartControls } from '../../components/member/ProductGrid'
import { LoadStatus } from '../../components/member/ShopFeedback'
import { IS_MOCK_MODE } from '../../services/api'
import { memberApi } from '../../services/member'
import { createMockMemberApi } from '../../services/mockMember'
import type { CartUpdate } from '../../types/member'
import CartPage from './CartPage'
import CatalogPage, { type CatalogFilter } from './CatalogPage'
import OrdersPage, { OrderDetailPage } from './OrdersPage'
import ProductPage from './ProductPage'
import { useMemberAction, useMemberRequest } from './useMemberRequest'
import './MemberShop.css'

const titles = { home: '상품 둘러보기', favorites: '좋아요', cart: '장바구니', mypage: '마이페이지' }
type Tab = keyof typeof titles
function currentRoute() { return window.location.hash.slice(1) || 'home' }

export default function MemberShop({ userId, onExit }: { userId: number; onExit: () => void }) {
  const api = useMemo(() => IS_MOCK_MODE ? createMockMemberApi(userId) : memberApi, [userId])
  const [route, setRoute] = useState(currentRoute)
  const [filter, setFilter] = useState<CatalogFilter>({ query: '', category: null, page: 0 })
  const favorites = useMemberRequest(api.favorites)
  const cart = useMemberRequest(api.cart)
  const likesAction = useMemberAction()
  const cartAction = useMemberAction()
  const refreshCart = cart.refresh
  const refreshLikes = favorites.refresh
  const productId = /^product\/(\d+)$/.exec(route)?.[1]
  const orderId = /^order\/(\d+)$/.exec(route)?.[1]
  const tab: Tab = orderId ? 'mypage' : Object.hasOwn(titles, route) ? route as Tab : 'home'
  const title = productId ? '상품 상세' : orderId ? '주문 상세' : titles[tab]

  useEffect(() => {
    function sync() {
      const next = currentRoute()
      setRoute(next)
      if (next === 'cart') void refreshCart()
      if (next === 'favorites') void refreshLikes()
    }
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [refreshCart, refreshLikes])
  useEffect(() => {
    document.title = title + ' | SEAM'
    window.scrollTo(0, 0)
    document.getElementById('member-content')?.focus({ preventScroll: true })
  }, [route, title])

  const likedIds = new Set(favorites.data?.map(p => p.id))
  const hearts: HeartControls = {
    likedIds, disabled: !favorites.data || likesAction.busy,
    toggle(product) {
      const previous = favorites.data
      if (!previous) return
      void likesAction.run(async () => {
        try {
          const { liked } = await api.like(product.id, !likedIds.has(product.id))
          const other = previous.filter(item => item.id !== product.id)
          favorites.replace(liked ? [product, ...other] : other)
        } catch (error) { await favorites.refresh(); throw error }
      })
    },
  }
  function changeCart(work: () => Promise<void>) {
    void cartAction.run(async () => {
      try { await work() } catch (error) { await cart.refresh(); throw error }
    })
  }
  function update(ids: number[], change: CartUpdate) {
    changeCart(async () => {
      for (const id of ids) cart.replace(await api.update(id, change))
    })
  }
  function search(value: string) {
    setFilter({ query: value, category: null, page: 0 })
    window.location.hash = 'home'
    window.scrollTo(0, 0)
  }
  function content() {
    if (productId) return <>
      {cart.error && <LoadStatus error={cart.error} retry={cart.refresh} />}
      <ProductPage key={productId} api={api} id={Number(productId)} hearts={hearts} cart={cart.data} busy={cartAction.busy}
        add={(optionId, done) => changeCart(async () => { cart.replace(await api.add(optionId)); done() })} />
    </>
    if (orderId) return <OrderDetailPage key={orderId} api={api} id={Number(orderId)} />
    switch (tab) {
      case 'favorites': return <>
        <div className="shop-title"><h1>좋아요</h1>{favorites.data && <span>{favorites.data.length}개 상품</span>}</div>
        {favorites.data ? favorites.data.length ? <ProductGrid items={favorites.data} hearts={hearts} /> :
          <div className="shop-empty">아직 좋아요를 누른 상품이 없어요. <a href="#home">상품 둘러보기</a></div> :
          <LoadStatus error={favorites.error} retry={favorites.refresh} />}
      </>
      case 'cart': return cart.data ? <CartPage cart={cart.data} busy={cartAction.busy} update={update}
        remove={id => changeCart(async () => cart.replace(await api.remove(id)))}
        checkout={address => changeCart(async () => {
          const order = await api.checkout(address)
          window.location.hash = 'order/' + order.orderId
          await cart.refresh()
        })} /> : <LoadStatus error={cart.error} retry={cart.refresh} />
      case 'mypage': return <OrdersPage api={api} onExit={onExit} />
      case 'home': return <CatalogPage api={api} filter={filter} onFilter={setFilter} hearts={hearts} />
    }
  }
  return <div className="member-shop">
    <ShopHeader active={tab} onSearch={search} onHome={() => search('')} />
    <main id="member-content" tabIndex={-1}>
      {(productId || tab === 'home') && favorites.error && <LoadStatus error={favorites.error} retry={favorites.refresh} />}
      {likesAction.error && (productId || tab === 'favorites' || tab === 'home') && <p className="shop-error" role="alert">{likesAction.error}</p>}
      {cartAction.error && (productId || tab === 'cart') && <p className="shop-error" role="alert">{cartAction.error}</p>}
      {content()}
    </main>
  </div>
}
