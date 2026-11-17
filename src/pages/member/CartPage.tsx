import { formatPrice } from '../../utils/formatPrice'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ProductImage } from '../../components/member/ShopFeedback'
import type { Cart, CartUpdate, DeliveryAddress } from '../../types/member'

type Props = { cart: Cart; busy: boolean; update: (ids: number[], change: CartUpdate) => void
  remove: (id: number) => void; checkout: (address: DeliveryAddress) => void }

export default function CartPage({ cart, busy, update, remove, checkout }: Props) {
  const all = useRef<HTMLInputElement>(null)
  const [ordering, setOrdering] = useState(false)
  const checked = cart.items.filter(line => line.selected)
  const purchasable = cart.items.filter(line => line.state === 'AVAILABLE')
  const allSelected = purchasable.length > 0 && purchasable.every(line => line.selected)
  const blocked = checked.some(line => line.state !== 'AVAILABLE' || line.quantity > line.stock)
  useEffect(() => {
    if (all.current) all.current.indeterminate = !allSelected && checked.length > 0
  }, [allSelected, checked.length])
  return <>
    <div className="shop-title"><h1>장바구니</h1><span>{cart.items.length}개 항목</span></div>
    {!cart.items.length ? <div className="shop-empty">장바구니가 비어 있어요. <a href="#home">상품 둘러보기</a></div> :
      <div className="cart-layout"><div className="cart-list">
        <label className="check-all"><input ref={all} type="checkbox" checked={allSelected} disabled={busy || (!purchasable.length && !checked.length)}
          onChange={() => {
            const select = !allSelected && purchasable.length > 0
            const ids = cart.items.filter(line => select ? line.state === 'AVAILABLE' && !line.selected : line.selected).map(line => line.cartItemId)
            update(ids, { selected: select })
          }} />전체 선택</label>
        {cart.items.map(line => {
          const label = [line.productName, line.colorName, line.sizeLabel].join(' ')
          const available = line.state === 'AVAILABLE'
          return <article className="cart-line" key={line.cartItemId}>
            <input type="checkbox" aria-label={label + ' 선택'} checked={line.selected} disabled={busy || (!available && !line.selected)}
              onChange={e => update([line.cartItemId], { selected: e.target.checked })} />
            <ProductImage className="line-thumb" src={line.imageUrl} alt={line.productName} />
            <div className="line-info"><small>{line.brandName}</small>{line.state === 'UNAVAILABLE' ? <strong>{line.productName}</strong> :
              <a href={'#product/' + line.productId}>{line.productName}</a>}
              <span>{line.colorName} / {line.sizeLabel}</span>
              {!available && <span>{line.state === 'SOLD_OUT' ? '품절' : '판매 종료'}</span>}
              {available && line.quantity > line.stock && <span>남은 재고 {line.stock}개</span>}
              <div className="quantity-control">
                <button aria-label={label + ' 수량 줄이기'} disabled={busy || line.quantity <= 1} onClick={() => update([line.cartItemId], { quantity: line.quantity - 1 })}>−</button>
                <span>{line.quantity}</span>
                <button aria-label={label + ' 수량 늘리기'} disabled={busy || !available || line.quantity >= Math.min(99, line.stock)}
                  onClick={() => update([line.cartItemId], { quantity: line.quantity + 1 })}>+</button>
              </div>
            </div>
            <div className="line-end"><strong>{formatPrice(line.lineTotal)}</strong><button disabled={busy} aria-label={label + ' 삭제'} onClick={() => remove(line.cartItemId)}>삭제</button></div>
          </article>
        })}
      </div><aside className="cart-summary" aria-label="선택 상품 합계">
        <h2>선택 상품 합계</h2><p>선택한 항목 <strong>{cart.selectedCount}개</strong></p><b aria-live="polite">{formatPrice(cart.totalPrice)}</b>
        {blocked && <p role="status">품절·판매 종료 상품은 선택을 해제하고, 재고가 부족한 상품은 수량을 줄여 주세요.</p>}
        {ordering ? <AddressForm busy={busy} disabled={blocked || !cart.selectedCount} checkout={checkout} close={() => setOrdering(false)} /> :
          <button className="primary-button checkout-button" disabled={busy || blocked || !cart.selectedCount} onClick={() => setOrdering(true)}>선택 상품 주문</button>}
      </aside></div>}
  </>
}

function AddressForm({ busy, disabled, checkout, close }: { busy: boolean; disabled: boolean
  checkout: (address: DeliveryAddress) => void; close: () => void }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || disabled) return
    const form = new FormData(event.currentTarget)
    const value = (name: string) => String(form.get(name) ?? '').trim()
    checkout({ receiverName: value('receiverName'), receiverPhone: value('receiverPhone'), zipCode: value('zipCode'),
      address: value('address'), addressDetail: value('addressDetail') })
  }
  return <form className="delivery-form" onSubmit={submit}>
    <h3>배송지</h3>
    <label>받는 분<input name="receiverName" autoComplete="shipping name" maxLength={50} required /></label>
    <label>연락처<input name="receiverPhone" type="tel" autoComplete="shipping tel" pattern="01[0-9]-?[0-9]{3,4}-?[0-9]{4}" placeholder="010-1234-5678" required /></label>
    <label>우편번호<input name="zipCode" autoComplete="shipping postal-code" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} required /></label>
    <label>주소<input name="address" autoComplete="shipping address-line1" maxLength={255} required /></label>
    <label>상세주소 (선택)<input name="addressDetail" autoComplete="shipping address-line2" maxLength={255} /></label>
    <small>실제 결제 없이 주문이 접수됩니다.</small>
    <button className="primary-button" disabled={busy || disabled}>{busy ? '처리 중…' : '주문 접수'}</button>
    <button className="text-button" type="button" disabled={busy} onClick={close}>배송지 입력 닫기</button>
  </form>
}
