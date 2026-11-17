import { useEffect, useState } from 'react'
import ShopHeader from '../../components/member/ShopHeader'
import ProductGrid from '../../components/member/ProductGrid'
import { products, type Category } from '../../data/memberCatalog'
import CartPage from './CartPage'
import CatalogPage from './CatalogPage'
import OrdersPage from './OrdersPage'
import ProductPage from './ProductPage'
import { quantityInCart, useMemberBag } from './useMemberBag'
import './MemberShop.css'

const titles = { home: '상품 둘러보기', favorites: '좋아요', cart: '장바구니', mypage: '마이페이지' }
type Tab = keyof typeof titles
function currentRoute() { return window.location.hash.slice(1) || 'home' }

export default function MemberShop({ userId, onExit }: { userId: number; onExit: () => void }) {
  const [route, setRoute] = useState(currentRoute)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | '전체'>('전체')
  const bag = useMemberBag(userId)
  const product = products.find(p => route === 'product/' + p.id)
  const tab: Tab = Object.hasOwn(titles, route) ? route as Tab : 'home'
  const title = product?.name ?? titles[tab]

  useEffect(() => {
    function sync() { setRoute(currentRoute()) }
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])
  useEffect(() => {
    document.title = title + ' | SEAM'
    window.scrollTo(0, 0)
    document.getElementById('member-content')?.focus({ preventScroll: true })
  }, [route, title])

  function search(value: string) {
    setQuery(value)
    setCategory('전체')
    window.location.hash = 'home'
    window.scrollTo(0, 0)
  }
  function content() {
    if (product) {
      return <ProductPage key={product.id} product={product} favorite={bag.favorites.includes(product.id)}
        remaining={product.stock - quantityInCart(bag.cart, product.id)}
        onFavorite={() => bag.toggleFavorite(product.id)} onAdd={(color, size) => bag.add(product, color, size)} />
    }
    switch (tab) {
      case 'favorites': {
        const items = products.filter(p => bag.favorites.includes(p.id))
        return <><div className="shop-title"><h1>좋아요</h1><span>{items.length}개 상품</span></div>
          {items.length ? <ProductGrid items={items} favorites={bag.favorites} onFavorite={bag.toggleFavorite} />
            : <div className="shop-empty">아직 좋아요를 누른 상품이 없어요. <a href="#home">상품 둘러보기</a></div>}</>
      }
      case 'cart': return <CartPage {...bag} />
      case 'mypage': return <OrdersPage onExit={onExit} />
      case 'home': return <CatalogPage query={query} category={category} onCategory={setCategory} favorites={bag.favorites} onFavorite={bag.toggleFavorite} />
    }
  }
  return <div className="member-shop">
    <ShopHeader active={tab} onSearch={search} onHome={() => search('')} />
    <main id="member-content" tabIndex={-1}>{content()}</main>
  </div>
}
