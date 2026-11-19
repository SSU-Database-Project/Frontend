import type { Cart, OrderPayment, PaymentInput, PaymentMethod } from '../types/member'

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  CARD: '카드', BANK_TRANSFER: '계좌이체', EASY_PAY: '간편결제',
}

export function paymentInput(method: PaymentMethod, cardNumber: string): PaymentInput {
  if (method !== 'CARD') return { method }
  const digits = cardNumber.replace(/[- ]/g, '')
  if (!/^[0-9]{16}$/.test(digits)) throw new Error('카드번호는 숫자 16자리로 입력해 주세요.')
  return { method, cardNumber: digits }
}

export function paymentStatus(payment: OrderPayment) {
  if (payment.refunds.length === 0) return '결제 완료'
  return payment.balance === 0 ? '전액 환불' : '부분 환불'
}

// The server orders the selected cart, so recheck its contents before submitting.
export function checkoutSignature(cart: Cart) {
  return JSON.stringify(cart.items.filter(item => item.selected).map(item =>
    [item.cartItemId, item.optionId, item.quantity, item.price, item.state, item.stock],
  ).sort((a, b) => Number(a[0]) - Number(b[0])))
}
