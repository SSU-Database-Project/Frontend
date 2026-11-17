import { useState } from 'react'
import { formatPrice, type Product } from '../../data/memberCatalog'
import Icon from '../../components/Icon'

type Props = {
  product: Product
  favorite: boolean
  remaining: number
  onFavorite: () => void
  onAdd: (color: string, size: string) => void
}

export default function ProductPage({ product: p, favorite, remaining, onFavorite, onAdd }: Props) {
  const [color, setColor] = useState(p.colors[0])
  const [size, setSize] = useState(p.sizes[0])
  const [message, setMessage] = useState('')
  const specs = [
    ['상품번호', String(p.id)], ['성별', p.gender], ['계절', p.season],
    ['카테고리', p.category], ['출고 예정', p.dispatch], ['재고 수', p.stock + '개'],
  ]
  return <>
    <a className="shop-back" href="#home"><Icon name="back" />상품 목록</a>
    <div className="product-detail">
      <img className="detail-photo" src={p.image} alt={p.name} />
      <div className="detail-info">
        <small className="brand-name">{p.brand}</small><h1>{p.name}</h1><p className="detail-price">{formatPrice(p.price)}</p>
        <fieldset><legend>색상</legend><div className="options">{p.colors.map(c => <button key={c} aria-pressed={color === c} onClick={() => { setColor(c); setMessage('') }}>{c}</button>)}</div></fieldset>
        <fieldset><legend>사이즈</legend><div className="options">{p.sizes.map(s => <button key={s} aria-pressed={size === s} onClick={() => { setSize(s); setMessage('') }}>{s}</button>)}</div></fieldset>
        <div className="detail-actions"><button className="detail-like" aria-label="좋아요" aria-pressed={favorite} onClick={onFavorite}><Icon name="heart" /></button>
          <button className="primary-button" disabled={remaining <= 0} onClick={() => { onAdd(color, size); setMessage(color + ' / ' + size + ' 상품을 장바구니에 담았어요.') }}>
            {p.stock === 0 ? '품절' : remaining === 0 ? '담을 수 있는 수량을 모두 담았어요' : '장바구니 담기'}<Icon name="bag" />
          </button></div>
        <div role="status" className="add-result">{message && <>{message} <a href="#cart">장바구니 보기</a></>}</div>
        <h2>상품 정보</h2><dl className="product-specs">{specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      </div>
    </div>
  </>
}
