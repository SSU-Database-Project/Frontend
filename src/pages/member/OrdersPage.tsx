import { formatPrice } from '../../utils/formatPrice'
import { useCallback, useState } from 'react'
import { LoadStatus, PageNav, ProductImage } from '../../components/member/ShopFeedback'
import MemberAccountInfo from '../../components/member/MemberAccountInfo'
import type { AuthUser } from '../../types/auth'
import type { MemberApi, MemberOrder, Shipment, ShipmentAction } from '../../types/member'
import { useMemberAction, useMemberRequest } from './useMemberRequest'

const statusLabel = { ORDERED: '주문 완료', PREPARING: '배송 준비', SHIPPING: '배송 중', DELIVERED: '배송 완료', CONFIRMED: '구매 확정', CANCELED: '주문 취소' }

function OrderCard({ order, detail, busy, change }: { order: MemberOrder; detail?: boolean; busy?: boolean
  change?: (shipment: Shipment, action: ShipmentAction) => void }) {
  return <article className="order">
    <header><strong>{order.createdAt.slice(0, 10)}</strong><span>주문번호 {order.orderId} · {formatPrice(order.totalPrice)}</span>
      {!detail && <a className="text-button" href={'#order/' + order.orderId}>주문 상세</a>}
    </header>
    {order.shipments.map(shipment => <section className="shipment" aria-label={shipment.sellerCompanyName + ' 배송'} key={shipment.shipmentId}>
      <div className="shipment-heading"><strong>{shipment.sellerCompanyName}</strong><span className="delivery-status">{statusLabel[shipment.status]}</span></div>
      {shipment.items.map(item => <div className="order-body" key={item.orderItemId}>
        <ProductImage className="line-thumb" src={item.imageUrl} alt={item.productName} />
        <div className="line-info"><a href={'#product/' + item.productId}>{item.productName}</a>
          <span>{item.colorName} / {item.sizeLabel} · {item.quantity}개</span><strong>{formatPrice(item.lineTotal)}</strong></div>
      </div>)}
      {change && (shipment.status === 'ORDERED' || shipment.status === 'DELIVERED') &&
        <button className="text-button" disabled={busy} onClick={() => change(shipment, shipment.status === 'ORDERED' ? 'cancel' : 'confirm')}>
          {shipment.status === 'ORDERED' ? '이 배송 묶음 취소' : '구매 확정'}</button>}
    </section>)}
    {detail && <section className="shipping-address"><h2>배송지</h2><strong>{order.receiverName} · {order.receiverPhone}</strong>
      <p>({order.zipCode}) {order.address} {order.addressDetail}</p></section>}
  </article>
}

export function OrderDetailPage({ api, id }: { api: MemberApi; id: number }) {
  const load = useCallback(() => api.order(id), [api, id])
  const order = useMemberRequest(load)
  const action = useMemberAction()
  function change(shipment: Shipment, next: ShipmentAction) {
    const question = next === 'cancel' ? '의 배송 묶음을 취소할까요?' : '에서 받은 상품의 구매를 확정할까요?'
    if (!window.confirm(shipment.sellerCompanyName + question)) return
    void action.run(async () => {
      try { order.replace(await api.shipment(id, shipment.shipmentId, next)) }
      catch (error) { await order.refresh(); throw error }
    })
  }
  return <section className="orders">
    <a className="shop-back" href="#mypage">← 주문 내역</a><h1>주문 상세</h1>
    {action.error && <p className="shop-error" role="alert">{action.error}</p>}
    {order.data ? <OrderCard order={order.data} detail busy={action.busy} change={change} /> : <LoadStatus error={order.error} retry={order.refresh} />}
  </section>
}

export default function OrdersPage({ api, user, onWithdrawn }: { api: MemberApi; user: AuthUser; onWithdrawn: () => void }) {
  const [page, setPage] = useState(0)
  const load = useCallback(() => api.orders(page), [api, page])
  const orders = useMemberRequest(load)
  return <>
    <div className="shop-title"><h1>마이페이지</h1></div>
    <MemberAccountInfo user={user} onWithdrawn={onWithdrawn} />
    <section className="orders"><h2>주문 내역 {orders.data && <span>{orders.data.totalElements}건</span>}</h2>
      {orders.data ? <>
        {!orders.data.content.length && <p className="shop-empty">아직 주문한 상품이 없어요. <a href="#home">상품 둘러보기</a></p>}
        {orders.data.content.map(order => <OrderCard key={order.orderId} order={order} />)}
        <PageNav result={orders.data} onChange={setPage} />
      </> : <LoadStatus error={orders.error} retry={orders.refresh} />}
    </section>
  </>
}
