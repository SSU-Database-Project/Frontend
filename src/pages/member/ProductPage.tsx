import { formatPrice } from '../../utils/formatPrice'
import { useCallback, useState } from 'react'
import type { HeartControls } from '../../components/member/ProductGrid'
import { LoadStatus, ProductImage } from '../../components/member/ShopFeedback'
import Icon from '../../components/Icon'
import type { Cart, MemberApi, ShopDetail } from '../../types/member'
import { useMemberRequest } from './useMemberRequest'

type Props = { api: MemberApi; id: number; hearts: HeartControls; cart?: Cart; busy: boolean
  add: (optionId: number, done: () => void) => void }

export default function ProductPage(props: Props) {
  const { api, id } = props
  const load = useCallback(() => api.product(id), [api, id])
  const detail = useMemberRequest(load)
  return <>
    <a className="shop-back" href="#home"><Icon name="back" />상품 목록</a>
    {detail.data ? <ProductOptions product={detail.data} {...props} /> : <LoadStatus error={detail.error} retry={detail.refresh} />}
  </>
}

function ProductOptions({ product: p, hearts, cart, busy, add }: Props & { product: ShopDetail }) {
  const first = p.options.find(o => !o.soldOut) ?? p.options[0]
  const [chosen, setChosen] = useState(first?.optionId)
  const option = p.options.find(o => o.optionId === chosen)
  const [message, setMessage] = useState('')
  const inCart = cart?.items.find(item => item.optionId === chosen)?.quantity ?? 0
  const available = option && !p.soldOut && !option.soldOut && inCart < Math.min(option.stock, 99)
  const genders: Record<string, string> = { MEN: '남성', WOMEN: '여성', UNISEX: '남녀공용' }
  const specs = [
    ['상품번호', p.productCode], ['성별', genders[p.gender] ?? p.gender], ['계절', p.season], ['카테고리', p.categoryName],
    ['출고 예정', p.shipDays === 0 ? '당일 출고' : '주문 후 ' + p.shipDays + '일 이내'], ['선택 옵션 재고', (option?.stock ?? 0) + '개'],
  ]
  return <div className="product-detail">
    <ProductImage className="detail-photo" src={p.imageUrl} alt={p.name} />
    <div className="detail-info">
      <small className="brand-name">{p.brandName}</small><h1>{p.name}</h1><p className="detail-price">{formatPrice(p.price)}</p>
      <fieldset disabled={busy}><legend>색상</legend><div className="options">{Array.from(new Set(p.options.map(o => o.colorName))).map(color =>
        <button key={color} aria-pressed={color === option?.colorName} onClick={() => {
          const options = p.options.filter(o => o.colorName === color)
          setChosen((options.find(o => o.sizeLabel === option?.sizeLabel && !o.soldOut) ?? options.find(o => !o.soldOut) ?? options[0]).optionId)
          setMessage('')
        }}>{color}</button>)}</div></fieldset>
      <fieldset disabled={busy}><legend>사이즈</legend><div className="options">{p.options.filter(o => o.colorName === option?.colorName).map(o =>
        <button key={o.optionId} aria-pressed={o.optionId === chosen} onClick={() => { setChosen(o.optionId); setMessage('') }}>
          {o.sizeLabel}{o.soldOut && ' (품절)'}</button>)}</div></fieldset>
      <div className="detail-actions"><button className="detail-like" aria-label="좋아요" disabled={hearts.disabled}
        aria-pressed={hearts.likedIds.has(p.id)} onClick={() => hearts.toggle(p)}><Icon name="heart" /></button>
        <button className="primary-button" disabled={!cart || busy || !available} onClick={() => {
          if (option) add(option.optionId, () => setMessage(option.colorName + ' / ' + option.sizeLabel + ' 상품을 담았어요.'))
        }}>{p.soldOut || !option || option.soldOut ? '품절' : available ? '장바구니 담기' : '담을 수 있는 수량을 모두 담았어요'}<Icon name="bag" /></button>
      </div>
      <div role="status" className="add-result">{message && <>{message} <a href="#cart">장바구니 보기</a></>}</div>
      <h2>상품 정보</h2><dl className="product-specs">{specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      {p.description && <p className="shop-description">{p.description}</p>}
    </div>
  </div>
}
