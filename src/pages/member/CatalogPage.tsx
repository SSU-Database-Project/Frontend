import ProductGrid from '../../components/member/ProductGrid'
import { categories, products, type Category } from '../../data/memberCatalog'

type Props = {
  query: string
  category: Category | '전체'
  onCategory: (category: Category | '전체') => void
  favorites: number[]
  onFavorite: (id: number) => void
}

export default function CatalogPage({ query, category, onCategory, favorites, onFavorite }: Props) {
  const keyword = query.trim().toLocaleLowerCase()
  const filtered = products.filter(p => (category === '전체' || p.category === category) &&
    (p.name + ' ' + p.brand).toLocaleLowerCase().includes(keyword))
    .sort((a, b) => b.registered.localeCompare(a.registered) || b.id - a.id)

  return <>
    <div className="shop-title"><h1>{keyword ? '검색 결과' : '상품 둘러보기'}</h1><span>총 {filtered.length}개 상품</span></div>
    <div className="catalog-tools">
      <div className="category-tabs" role="group" aria-label="카테고리">
        {(['전체', ...categories] as const).map(c => <button type="button" key={c} aria-pressed={c === category} onClick={() => onCategory(c)}>{c}</button>)}
      </div>
      <span className="sort-label">최근 등록순</span>
    </div>
    {!filtered.length && <p className="shop-empty">일치하는 상품이 없어요. 다른 검색어나 카테고리를 선택해 주세요.</p>}
    {categories.map(c => {
      const items = filtered.filter(p => p.category === c)
      if (!items.length) return null
      return <section className="catalog-section" key={c}>
        <h2>{c} <span>{items.length}</span></h2>
        <ProductGrid items={items} favorites={favorites} onFavorite={onFavorite} />
      </section>
    })}
  </>
}
