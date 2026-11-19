import type { PaymentMethod } from '../../types/member'
import { paymentMethodLabels } from '../../utils/payment'

type Props = { method: PaymentMethod; cardNumber: string
  onMethod: (method: PaymentMethod) => void; onCardNumber: (value: string) => void }

export default function PaymentFields({ method, cardNumber, onMethod, onCardNumber }: Props) {
  return <section className="checkout-section" aria-labelledby="payment-heading">
    <h2 id="payment-heading">결제수단</h2>
    <fieldset className="payment-methods">
      <legend className="payment-legend">결제수단 선택</legend>
      {(Object.keys(paymentMethodLabels) as PaymentMethod[]).map(value => <label key={value} className={method === value ? 'selected' : ''}>
        <input type="radio" name="paymentMethod" value={value} checked={method === value} onChange={() => onMethod(value)} />
        {paymentMethodLabels[value]}
      </label>)}
    </fieldset>
    {method === 'CARD' && <div className="checkout-field card-number-field">
      <label htmlFor="payment-card-number">시연용 카드번호</label>
      <input id="payment-card-number" name="cardNumber" value={cardNumber} onChange={event => onCardNumber(event.target.value)}
        type="text" inputMode="numeric" autoComplete="off" maxLength={19} pattern="[0-9]{4}([\- ]?[0-9]{4}){3}"
        title="숫자 16자리를 입력해 주세요. 4자리마다 공백이나 하이픈을 넣을 수 있습니다."
        placeholder="1234-5678-9012-3456" aria-describedby="card-number-hint" required />
      <small id="card-number-hint">임의의 숫자 16자리를 입력해 주세요. 끝 4자리가 0000이면 결제 거절을 시연할 수 있습니다.</small>
    </div>}
    <p className="checkout-note">모의 결제이며 실제 금액은 청구되지 않습니다.</p>
  </section>
}
