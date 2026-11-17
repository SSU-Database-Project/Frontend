import { formatPrice } from '../../utils/formatPrice'
import type { ShopProduct } from '../../types/member'
import { ProductImage } from './ShopFeedback'
import Icon from '../Icon'

export type HeartControls = { likedIds: Set<number>; disabled: boolean; toggle: (product: ShopProduct) => void }

export default function ProductGrid({ items, hearts }: { items: ShopProduct[]; hearts: HeartControls }) {
  return <ul className="product-grid">{items.map(p => <li className="product-card" key={p.id}>
    <a href={'#product/' + p.id} aria-label={p.name + ' 상세 보기'}>
      <div className="card-photo"><ProductImage src={p.imageUrl} alt={p.name} />
        {p.soldOut && <span className="stock-label">품절</span>}
      </div>
      <div className="card-info"><small>{p.brandName}</small><h3>{p.name}</h3><strong>{formatPrice(p.price)}</strong></div>
    </a>
    <button type="button" className="favorite-button" aria-label={p.name + ' 좋아요'} disabled={hearts.disabled}
      aria-pressed={hearts.likedIds.has(p.id)} onClick={() => hearts.toggle(p)}><Icon name="heart" /></button>
  </li>)}</ul>
}
