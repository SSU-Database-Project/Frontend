import { useCallback } from 'react'
import ProductGrid, { type HeartControls } from '../../components/member/ProductGrid'
import { LoadStatus, PageNav } from '../../components/member/ShopFeedback'
import type { MemberApi } from '../../types/member'
import { useMemberRequest } from './useMemberRequest'

export type CatalogFilter = { query: string; category: number | null; page: number }

export default function CatalogPage({ api, filter, onFilter, hearts }: {
  api: MemberApi; filter: CatalogFilter; onFilter: (filter: CatalogFilter) => void; hearts: HeartControls
}) {
  const { query, category, page } = filter
  const categories = useMemberRequest(api.categories)
  const load = useCallback(() => api.products(query, category, page), [api, query, category, page])
  const products = useMemberRequest(load)
  function choose(id: number | null) {
    onFilter({ ...filter, category: id, page: 0 })
  }
  return <>
    <div className="shop-title"><h1>{query ? '검색 결과' : '상품 둘러보기'}</h1>
      {products.data && <span>총 {products.data.totalElements}개 상품</span>}</div>
    <div className="catalog-tools">
      <div className="category-tabs" role="group" aria-label="카테고리">
        <button aria-pressed={category === null} onClick={() => choose(null)}>전체</button>
        {categories.data?.map(c => <button key={c.id} aria-pressed={category === c.id} onClick={() => choose(c.id)}>{c.name}</button>)}
      </div><span className="sort-label">최근 등록순</span>
    </div>
    {!categories.data && <LoadStatus error={categories.error} retry={categories.refresh} />}
    {!products.data ? <LoadStatus error={products.error} retry={products.refresh} /> : <>
      {!products.data.content.length && <p className="shop-empty">일치하는 상품이 없어요.</p>}
      {categories.data ? categories.data.map(c => {
        const ids = new Set([c.id, ...c.children.map(child => child.id)])
        const items = products.data!.content.filter(p => ids.has(p.categoryId))
        return items.length > 0 && <section className="catalog-section" key={c.id}><h2>{c.name}</h2><ProductGrid items={items} hearts={hearts} /></section>
      }) : <ProductGrid items={products.data.content} hearts={hearts} />}
      <PageNav result={products.data} onChange={page => onFilter({ ...filter, page })} />
    </>}
  </>
}
