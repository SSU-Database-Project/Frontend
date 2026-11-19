import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { LoadStatus, ProductImage } from '../../components/member/ShopFeedback'
import PaymentFields from '../../components/member/PaymentFields'
import { ApiError } from '../../services/api'
import type { DeliveryAddress, MemberApi, MemberOrder, PaymentMethod } from '../../types/member'
import { formatPrice } from '../../utils/formatPrice'
import { checkoutSignature, paymentInput } from '../../utils/payment'
import { errorText, useMemberRequest } from './useMemberRequest'
import './CheckoutPage.css'

type Props = { api: MemberApi; onComplete: (order: MemberOrder) => void }

export default function CheckoutPage({ api, onComplete }: Props) {
  const cart = useMemberRequest(api.cart)
  const locked = useRef(false)
  const feedback = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [uncertain, setUncertain] = useState(false)
  const [address, setAddress] = useState<DeliveryAddress>({ receiverName: '', receiverPhone: '', zipCode: '', address: '', addressDetail: '' })
  const [method, setMethod] = useState<PaymentMethod>('CARD')
  const [cardNumber, setCardNumber] = useState('')
  const selected = cart.data?.items.filter(item => item.selected) ?? []
  const blocked = !selected.length || selected.some(item => item.state !== 'AVAILABLE' || item.quantity > item.stock)

  useEffect(() => {
    if (error) feedback.current?.focus()
  }, [error])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (locked.current || blocked || !cart.data) return
    locked.current = true
    setBusy(true)
    setError('')
    setUncertain(false)
    let submitted = false
    try {
      const payment = paymentInput(method, cardNumber)
      const latest = await api.cart()
      if (checkoutSignature(latest) !== checkoutSignature(cart.data)) {
        cart.replace(latest)
        setError('주문 상품이나 금액이 변경되었습니다. 내용을 확인한 뒤 다시 결제해 주세요.')
        return
      }
      submitted = true
      const order = await api.checkout({
        receiverName: address.receiverName.trim(), receiverPhone: address.receiverPhone.trim(), zipCode: address.zipCode.trim(),
        address: address.address.trim(), addressDetail: address.addressDetail.trim(), payment,
      })
      setCardNumber('')
      onComplete(order)
    } catch (cause) {
      if (submitted && (!(cause instanceof ApiError) || cause.status >= 500)) {
        setUncertain(true)
        setError('결제 결과를 확인하지 못했습니다. 다시 결제하기 전에 주문 내역을 확인해 주세요.')
      } else setError(errorText(cause))
      if (cause instanceof ApiError && cause.status === 409) await cart.refresh()
    } finally {
      locked.current = false
      setBusy(false)
    }
  }

  function field(name: keyof DeliveryAddress) {
    return { value: address[name], onChange: (event: ChangeEvent<HTMLInputElement>) => setAddress(previous => ({ ...previous, [name]: event.target.value })) }
  }

  return <>
    <a className="shop-back" href="#cart">← 장바구니</a>
    <div className="shop-title checkout-title"><h1>주문서</h1><span>배송지 입력 · 모의 결제</span></div>
    {error && <div ref={feedback} className="checkout-feedback" role="alert" tabIndex={-1}>{error}{uncertain && <> <a href="#mypage">주문 내역 확인</a></>}</div>}
    {!cart.data ? <LoadStatus error={cart.error} retry={cart.refresh} /> : !selected.length ?
      <div className="shop-empty">선택한 상품이 없습니다. <a href="#cart">장바구니에서 상품 선택하기</a></div> :
      <form className="checkout-layout" onSubmit={submit} aria-busy={busy}>
        <fieldset className="checkout-fields" disabled={busy}>
          <legend className="payment-legend">배송지와 결제 정보</legend>
          <section className="checkout-section" aria-labelledby="checkout-items-heading">
            <h2 id="checkout-items-heading">주문 상품 <span>{selected.length}개 항목</span></h2>
            {selected.map(item => <article className="checkout-item" key={item.cartItemId}>
              <ProductImage className="line-thumb" src={item.imageUrl} alt={item.productName} />
              <div className="line-info"><small>{item.brandName}</small><strong>{item.productName}</strong>
                <span>{item.colorName} / {item.sizeLabel} · {item.quantity}개</span>
                <strong>{formatPrice(item.lineTotal)}</strong>
                {(item.state !== 'AVAILABLE' || item.quantity > item.stock) && <span className="shop-error">현재 주문할 수 없는 상품입니다.</span>}
              </div>
            </article>)}
          </section>
          <section className="checkout-section" aria-labelledby="delivery-heading">
            <h2 id="delivery-heading">배송지</h2>
            <div className="checkout-address">
              <label className="checkout-field">받는 분<input name="receiverName" autoComplete="shipping name" maxLength={50} required {...field('receiverName')} /></label>
              <label className="checkout-field">연락처<input name="receiverPhone" type="tel" autoComplete="shipping tel" pattern="01[0-9]-?[0-9]{3,4}-?[0-9]{4}"
                placeholder="010-1234-5678" title="휴대폰 번호를 입력해 주세요." required {...field('receiverPhone')} /></label>
              <label className="checkout-field">우편번호<input name="zipCode" autoComplete="shipping postal-code" inputMode="numeric" pattern="[0-9]{5}"
                maxLength={5} placeholder="숫자 5자리" title="우편번호는 숫자 5자리입니다." required {...field('zipCode')} /></label>
              <label className="checkout-field full-width">주소<input name="address" autoComplete="shipping address-line1" maxLength={255} required {...field('address')} /></label>
              <label className="checkout-field full-width">상세주소 (선택)<input name="addressDetail" autoComplete="shipping address-line2" maxLength={255} {...field('addressDetail')} /></label>
            </div>
          </section>
          <PaymentFields method={method} cardNumber={cardNumber} onCardNumber={setCardNumber} onMethod={value => {
            setMethod(value)
            setCardNumber('')
          }} />
        </fieldset>
        <aside className="checkout-total" aria-label="결제 금액">
          <h2>결제 금액</h2>
          <p>선택한 상품 <span>{selected.length}개 항목</span></p>
          <strong className="checkout-amount">{formatPrice(cart.data.totalPrice)}</strong>
          <p className="checkout-note">모의 결제로 주문이 접수됩니다.</p>
          {blocked && <p className="shop-error">장바구니에서 상품의 상태와 수량을 확인해 주세요.</p>}
          <button className="primary-button" type="submit" disabled={busy || blocked}>{busy ? '결제 처리 중…' : '모의 결제하기'}</button>
          <a className="checkout-edit-cart" href="#cart">장바구니 수정</a>
        </aside>
      </form>}
  </>
}
