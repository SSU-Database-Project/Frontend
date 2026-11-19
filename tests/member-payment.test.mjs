import assert from 'node:assert/strict'
import { after, before, beforeEach, test } from 'node:test'
import { createServer } from 'vite'

let server, createMockMemberApi, memberApi, paymentInput, paymentStatus, checkoutSignature
const originalFetch = globalThis.fetch
const session = new Map()
const address = { receiverName: '시연 회원', receiverPhone: '01012345678', zipCode: '06978', address: '시연 주소', addressDetail: '' }

before(async () => {
  globalThis.sessionStorage = { getItem: key => session.get(key) ?? null, setItem: (key, value) => session.set(key, value) }
  globalThis.localStorage = { getItem: () => 'test-member-token' }
  globalThis.fetch = () => { throw new Error('Tests must not contact a real server') }
  server = await createServer({ mode: 'test', server: { middlewareMode: true, watch: null }, appType: 'custom' })
  ;({ createMockMemberApi } = await server.ssrLoadModule('/src/services/mockMember.ts'))
  ;({ memberApi } = await server.ssrLoadModule('/src/services/member.ts'))
  ;({ paymentInput, paymentStatus, checkoutSignature } = await server.ssrLoadModule('/src/utils/payment.ts'))
})
beforeEach(() => {
  session.clear()
  globalThis.fetch = () => { throw new Error('Tests must not contact a real server') }
})
after(async () => {
  globalThis.fetch = originalFetch
  delete globalThis.localStorage
  delete globalThis.sessionStorage
  await server?.close()
})

async function addProduct(api, id = 1010) {
  const product = await api.product(id)
  await api.add(product.options[0].optionId)
  return product
}

test('card validation accepts supported formatting and never forwards a card for other methods', () => {
  assert.deepEqual(paymentInput('CARD', '1234-5678 9012-3456'), { method: 'CARD', cardNumber: '1234567890123456' })
  assert.throws(() => paymentInput('CARD', '1234-5678-9012-345x'), /16자리/)
  assert.throws(() => paymentInput('CARD', '1234'), /16자리/)
  assert.deepEqual(paymentInput('BANK_TRANSFER', '1234567890123456'), { method: 'BANK_TRANSFER' })
  assert.deepEqual(paymentInput('EASY_PAY', '1234567890123456'), { method: 'EASY_PAY' })
})

test('order request carries the payment and authentication, without a client-supplied amount', async () => {
  let request
  globalThis.fetch = async (url, options) => {
    request = { url, ...options }
    return new Response(JSON.stringify({ success: true, data: { orderId: 33 } }), { status: 201 })
  }
  const input = { ...address, payment: paymentInput('BANK_TRANSFER', '') }
  const order = await memberApi.checkout(input)
  assert.equal(order.orderId, 33)
  assert.ok(request.url.endsWith('/api/orders'))
  assert.equal(request.method, 'POST')
  assert.equal(request.headers.get('Authorization'), 'Bearer test-member-token')
  assert.deepEqual(JSON.parse(request.body), input)
  assert.equal('amount' in JSON.parse(request.body), false)
  assert.equal('cardNumber' in JSON.parse(request.body).payment, false)
})

test('API payment rejection preserves status, error code and the server message', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ success: false,
    error: { code: 'PAYMENT_DECLINED', message: '카드사에서 승인을 거절했습니다.' } }), { status: 402 })
  await assert.rejects(memberApi.checkout({ ...address, payment: paymentInput('CARD', '1234567890120000') }),
    error => error.status === 402 && error.code === 'PAYMENT_DECLINED' && error.message === '카드사에서 승인을 거절했습니다.')
})

for (const method of ['CARD', 'BANK_TRANSFER', 'EASY_PAY']) {
  test(`${method}: successful mock checkout records payment and removes only selected cart items`, async () => {
    const api = createMockMemberApi(41)
    await addProduct(api)
    const other = await addProduct(api, 1009)
    await api.update(other.options[0].optionId, { selected: false })
    const order = await api.checkout({ ...address, payment: paymentInput(method, '1234567890123456') })
    assert.equal(order.payment.method, method)
    assert.equal(order.payment.amount, order.totalPrice)
    assert.equal(order.payment.balance, order.totalPrice)
    assert.equal(order.payment.cardNumberMasked, method === 'CARD' ? '****-****-****-3456' : null)
    assert.match(order.payment.approvalNo, /^MOCK-/)
    assert.equal((await api.cart()).items.length, 1)
    assert.equal((await api.cart()).items[0].selected, false)
    assert.equal(session.get('seam.member.mock.v2.41').includes('1234567890123456'), false, 'full card numbers must never be stored')
  })
}

test('declined mock card creates no order and leaves the cart unchanged', async () => {
  const api = createMockMemberApi(42)
  await addProduct(api)
  const previous = session.get('seam.member.mock.v2.42')
  await assert.rejects(api.checkout({ ...address, payment: paymentInput('CARD', '1234567890120000') }), error => error.code === 'PAYMENT_DECLINED')
  assert.equal(session.get('seam.member.mock.v2.42'), previous)
})

test('mock payment limit rejection leaves orders and cart unchanged', async () => {
  const api = createMockMemberApi(43)
  const product = await addProduct(api, 1009)
  await api.update(product.options[0].optionId, { quantity: 18 })
  const previous = session.get('seam.member.mock.v2.43')
  assert.ok((await api.cart()).totalPrice > 1_000_000)
  await assert.rejects(api.checkout({ ...address, payment: { method: 'EASY_PAY' } }), error => error.code === 'PAYMENT_DECLINED')
  assert.equal(session.get('seam.member.mock.v2.43'), previous)
})

test('seller-group cancellations record partial then full refunds, without duplicate refunds', async () => {
  const api = createMockMemberApi(44)
  await addProduct(api)
  await addProduct(api, 1009)
  const order = await api.checkout({ ...address, payment: { method: 'BANK_TRANSFER' } })
  const [first, second] = order.shipments
  const partial = await api.shipment(order.orderId, first.shipmentId, 'cancel')
  assert.equal(partial.totalPrice, order.totalPrice)
  assert.equal(partial.payment.refundedAmount, first.subtotal)
  assert.equal(partial.payment.balance, second.subtotal)
  assert.equal(paymentStatus(partial.payment), '부분 환불')
  await assert.rejects(api.shipment(order.orderId, first.shipmentId, 'cancel'))
  assert.equal((await api.order(order.orderId)).payment.refunds.length, 1)
  const full = await api.shipment(order.orderId, second.shipmentId, 'cancel')
  assert.equal(full.payment.balance, 0)
  assert.equal(paymentStatus(full.payment), '전액 환불')
})

test('legacy stored orders without a payment still load', async () => {
  const api = createMockMemberApi(45)
  await addProduct(api)
  const stored = JSON.parse(session.get('seam.member.mock.v2.45'))
  stored.orders.forEach(order => { delete order.payment })
  session.set('seam.member.mock.v2.45', JSON.stringify(stored))
  assert.equal((await api.orders(0)).content[0].payment, null)
})

test('checkout recheck detects changed quantity, price or selection but ignores unselected items', async () => {
  const api = createMockMemberApi(46)
  const product = await addProduct(api)
  const original = checkoutSignature(await api.cart())
  await api.update(product.options[0].optionId, { quantity: 2 })
  assert.notEqual(checkoutSignature(await api.cart()), original)
  await api.update(product.options[0].optionId, { quantity: 1 })
  const other = await addProduct(api, 1009)
  await api.update(other.options[0].optionId, { selected: false })
  assert.equal(checkoutSignature(await api.cart()), original)
  const changedPrice = await api.cart()
  changedPrice.items[0].price++
  assert.notEqual(checkoutSignature(changedPrice), original)
})
