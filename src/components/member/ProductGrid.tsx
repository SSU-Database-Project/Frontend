import { formatPrice, type Product } from '../../data/memberCatalog'
import Icon from '../Icon'

type Props = {
  items: Product[]
  favorites: number[]
  onFavorite: (id: number) => void
}

export default function ProductGrid({ items, favorites, onFavorite }: Props) {
  return (
    <ul className="product-grid">
      {items.map(p => <li className="product-card" key={p.id}>
        <a href={'#product/' + p.id} aria-label={p.name + ' 상세 보기'}>
          <div className="card-photo"><img src={p.image} alt={p.name} loading="lazy" />
            {p.stock === 0 && <span className="stock-label">품절</span>}
          </div>
          <div className="card-info"><small>{p.brand}</small><h3>{p.name}</h3><strong>{formatPrice(p.price)}</strong></div>
        </a>
        <button type="button" className="favorite-button" aria-label={p.name + ' 좋아요'} aria-pressed={favorites.includes(p.id)} onClick={() => onFavorite(p.id)}><Icon name="heart" /></button>
      </li>)}
    </ul>
  )
}
