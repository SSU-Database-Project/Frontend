import { useEffect, useRef } from 'react'
import { formatPrice, products } from '../../data/memberCatalog'
import { lineKey, quantityInCart, type CartLine } from './useMemberBag'

type Props = {
  cart: CartLine[]
  check: (checked: boolean, key?: string) => void
  changeQuantity: (key: string, delta: number) => void
  remove: (key: string) => void
}

export default function CartPage({ cart, check, changeQuantity, remove }: Props) {
  const all = useRef<HTMLInputElement>(null)
  const checked = cart.filter(line => line.checked)
  const count = checked.reduce((sum, line) => sum + line.quantity, 0)
  const total = checked.reduce((sum, line) => sum + products.find(p => p.id === line.productId)!.price * line.quantity, 0)
  useEffect(() => {
    if (all.current) all.current.indeterminate = checked.length > 0 && checked.length < cart.length
  }, [cart.length, checked.length])

  return <>
    <div className="shop-title"><h1>장바구니</h1><span>{cart.length}개 항목</span></div>
    {!cart.length ? <div className="shop-empty">장바구니가 비어 있어요. <a href="#home">상품 둘러보기</a></div> :
      <div className="cart-layout"><div className="cart-list">
        <label className="check-all"><input ref={all} type="checkbox" checked={checked.length === cart.length} onChange={e => check(e.target.checked)} />전체 선택</label>
        {cart.map(line => {
          const p = products.find(item => item.id === line.productId)!
          const key = lineKey(line)
          const label = [p.name, line.color, line.size].join(' ')
          return <article className="cart-line" key={key}>
            <input type="checkbox" aria-label={label + ' 선택'} checked={line.checked} onChange={e => check(e.target.checked, key)} />
            <a href={'#product/' + p.id}><img className="line-thumb" src={p.image} alt={p.name} /></a>
            <div className="line-info"><small>{p.brand}</small><a href={'#product/' + p.id}>{p.name}</a><span>{line.color} / {line.size}</span>
              <div className="quantity-control">
                <button aria-label={label + ' 수량 줄이기'} disabled={line.quantity <= 1} onClick={() => changeQuantity(key, -1)}>−</button>
                <span>{line.quantity}</span>
                <button aria-label={label + ' 수량 늘리기'} disabled={quantityInCart(cart, p.id) >= p.stock} onClick={() => changeQuantity(key, 1)}>+</button>
              </div>
            </div>
            <div className="line-end"><strong>{formatPrice(p.price * line.quantity)}</strong><button aria-label={label + ' 삭제'} onClick={() => remove(key)}>삭제</button></div>
          </article>
        })}
      </div><aside className="cart-summary" aria-label="선택 상품 합계" aria-live="polite">
        <h2>선택 상품 합계</h2><p>선택한 상품 <strong>{count}개</strong></p><b>{formatPrice(total)}</b>
      </aside></div>}
  </>
}
