import type { OrderPayment, Shipment } from '../../types/member'
import { formatPrice } from '../../utils/formatPrice'
import { paymentMethodLabels, paymentStatus } from '../../utils/payment'
import './OrderPaymentInfo.css'

export default function OrderPaymentInfo({ payment, shipments, compact = false }: {
  payment: OrderPayment | null; shipments: Shipment[]; compact?: boolean
}) {
  if (!payment) return <p className="payment-legacy">결제 정보가 없는 이전 주문입니다.</p>
  const status = paymentStatus(payment)
  if (compact) return <div className="payment-summary">
    <strong>{paymentMethodLabels[payment.method]} · {status}</strong>
    <span>결제 {formatPrice(payment.amount)} · 환불 {formatPrice(payment.refundedAmount)} · 남은 결제금액 {formatPrice(payment.balance)}</span>
  </div>
  return <section className="order-payment" aria-label="결제 및 환불 정보">
    <h2>결제 정보 <span>{status}</span></h2>
    <dl className="payment-details">
      <div><dt>결제수단</dt><dd>{paymentMethodLabels[payment.method]}</dd></div>
      {payment.cardNumberMasked && <div><dt>카드번호</dt><dd>{payment.cardNumberMasked}</dd></div>}
      <div><dt>승인번호</dt><dd>{payment.approvalNo}</dd></div>
      <div><dt>결제일시</dt><dd>{payment.paidAt.replace('T', ' ').slice(0, 19)}</dd></div>
      <div><dt>결제금액</dt><dd>{formatPrice(payment.amount)}</dd></div>
      <div><dt>환불금액</dt><dd>{formatPrice(payment.refundedAmount)}</dd></div>
      <div><dt>남은 결제금액</dt><dd>{formatPrice(payment.balance)}</dd></div>
    </dl>
    {payment.refunds.length > 0 && <div className="payment-refunds">
      <h3>환불 내역</h3>
      <ul>{payment.refunds.map(refund => <li key={refund.shipmentId}>
        <div><strong>{shipments.find(shipment => shipment.shipmentId === refund.shipmentId)?.sellerCompanyName ?? '배송 묶음 ' + refund.shipmentId}</strong>
          <span>{refund.refundedAt.replace('T', ' ').slice(0, 19)}</span></div>
        <strong>{formatPrice(refund.amount)}</strong>
      </li>)}</ul>
    </div>}
  </section>
}
