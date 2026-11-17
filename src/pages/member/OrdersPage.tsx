import { demoOrders, formatPrice, products } from '../../data/memberCatalog'

export default function OrdersPage({ onExit }: { onExit: () => void }) {
  return <>
    <div className="shop-title"><h1>마이페이지</h1><button className="text-button" onClick={onExit}>로그아웃</button></div>
    <section className="orders"><h2>주문 내역 <span>{demoOrders.length}</span></h2>
      {demoOrders.map(order => {
        const p = products.find(item => item.id === order.productId)!
        return <article className="order" key={order.number}>
          <header><strong>{order.date}</strong><span>주문번호 {order.number}</span></header>
          <div className="order-body"><a href={'#product/' + p.id}><img className="line-thumb" src={p.image} alt={p.name} /></a>
            <div className="line-info"><small>{p.brand}</small><a href={'#product/' + p.id}>{p.name}</a><span>{order.color} / {order.size} · {order.quantity}개</span><strong>{formatPrice(order.unitPrice * order.quantity)}</strong></div>
            <span className="delivery-status">{order.status}</span>
          </div>
        </article>
      })}
    </section>
  </>
}
