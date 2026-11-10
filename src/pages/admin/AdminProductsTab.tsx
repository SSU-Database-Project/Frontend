import { useState, type FormEvent } from 'react'
import Icon from '../../components/Icon'
import { deleteSellerProduct, updateAdminProductStatus } from '../../services/mockStore'
import type { Gender, Product, ProductStatus } from '../../types/commerce'

const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  PENDING: '승인 대기',
  ON_SALE: '판매중',
  SOLD_OUT: '품절(수동)',
  REJECTED: '승인 거절',
  BLOCKED: '관리자 차단',
  DELETED: '삭제됨',
}

const GENDER_LABEL: Record<Gender, string> = {
  UNISEX: '공용',
  MALE: '남성',
  FEMALE: '여성',
}

type AdminProductsTabProps = {
  products: Product[]
  onRefresh: () => void
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void
}

export default function AdminProductsTab({
  products,
  onRefresh,
  onNotify,
}: AdminProductsTabProps) {
  const [statusFilter, setStatusFilter] = useState<'ALL' | ProductStatus>('ALL')
  const [keyword, setKeyword] = useState('')
  const [rejectingProduct, setRejectingProduct] = useState<Product | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const filtered = products.filter(p => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false
    if (keyword.trim()) {
      const q = keyword.trim().toLowerCase()
      return (
        p.name.toLowerCase().includes(q) ||
        p.productCode.toLowerCase().includes(q) ||
        p.brandName.toLowerCase().includes(q)
      )
    }
    return true
  })

  function handleStatusUpdate(
    product: Product,
    nextStatus: 'ON_SALE' | 'BLOCKED',
  ) {
    try {
      updateAdminProductStatus(product.id, nextStatus)
      onRefresh()
      if (nextStatus === 'ON_SALE') {
        onNotify(
          'success',
          `상품 [${product.name} (${product.productCode})]이(가) 판매중 상태로 승인/해제되어 쇼핑몰에 노출됩니다.`,
        )
      } else {
        onNotify(
          'info',
          `상품 [${product.name}]이(가) 관리자 차단 처리되어 구매자에게 숨김 처리되었습니다.`,
        )
      }
    } catch (err) {
      onNotify('error', err instanceof Error ? err.message : '상품 상태 변경에 실패했습니다.')
    }
  }

  function handleRejectSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!rejectingProduct) return
    try {
      updateAdminProductStatus(rejectingProduct.id, 'REJECTED', rejectReason)
      setRejectingProduct(null)
      setRejectReason('')
      onRefresh()
      onNotify(
        'info',
        `상품 [${rejectingProduct.name}] 승인이 거절 처리되었으며 판매자에게 사유가 전달됩니다.`,
      )
    } catch (err) {
      onNotify('error', err instanceof Error ? err.message : '상품 거절 처리에 실패했습니다.')
    }
  }

  function handleDelete(product: Product) {
    try {
      deleteSellerProduct(product.id, 'ADMIN')
      onRefresh()
      onNotify('info', `상품 [${product.name}]이(가) 삭제 처리되었습니다.`)
    } catch (err) {
      onNotify('error', err instanceof Error ? err.message : '상품 삭제에 실패했습니다.')
    }
  }

  return (
    <>
      <div className="ws-page-header">
        <div>
          <h1>상품 승인 및 관리</h1>
          <p>
            신규 등록 또는 수정되어 재승인 대기 중인 상품을 승인/거절하고, 운영 정책 위반 상품을 차단합니다.
          </p>
        </div>
      </div>

      <div className="ws-kpi-grid">
        <div className="ws-kpi-card">
          <span className="ws-kpi-label">승인 대기 상품</span>
          <strong className="ws-kpi-value">
            {products.filter(p => p.status === 'PENDING').length}건
          </strong>
          <span className="ws-kpi-sub">신규 신청 및 정보 수정 재승인 건</span>
        </div>
        <div className="ws-kpi-card">
          <span className="ws-kpi-label">정상 노출 상품 (판매중 · 품절)</span>
          <strong className="ws-kpi-value">
            {products.filter(p => p.status === 'ON_SALE' || p.status === 'SOLD_OUT').length}건
          </strong>
          <span className="ws-kpi-sub">구매자 쇼핑 화면 노출 대상</span>
        </div>
        <div className="ws-kpi-card">
          <span className="ws-kpi-label">거절 / 차단 상품</span>
          <strong className="ws-kpi-value">
            {products.filter(p => p.status === 'REJECTED' || p.status === 'BLOCKED').length}건
          </strong>
          <span className="ws-kpi-sub">쇼핑몰 비노출 상태</span>
        </div>
      </div>

      <section className="ws-card" aria-label="관리자 상품 목록">
        <div className="ws-toolbar">
          <div className="ws-filter-pills" role="group" aria-label="상품 상태 필터">
            {(
              ['ALL', 'PENDING', 'ON_SALE', 'SOLD_OUT', 'REJECTED', 'BLOCKED'] as const
            ).map(st => (
              <button
                key={st}
                type="button"
                className="ws-pill"
                aria-pressed={statusFilter === st}
                onClick={() => setStatusFilter(st)}
              >
                {st === 'ALL' ? '전체' : PRODUCT_STATUS_LABEL[st]}
              </button>
            ))}
          </div>

          <div className="ws-search-box">
            <input
              className="ws-input"
              placeholder="상품명·품번·브랜드 검색"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>
        </div>

        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead>
              <tr>
                <th>상품 정보 (품번·시즌·성별·출고일)</th>
                <th>브랜드 / 판매자</th>
                <th>카테고리 / 판매가</th>
                <th>옵션 구성</th>
                <th>현재 상태</th>
                <th>승인 / 거절 / 차단</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                <tr key={product.id}>
                  <td>
                    <div className="ws-product-cell">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="ws-thumb"
                      />
                      <div>
                        <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: 700 }}>
                          {product.productCode} · {product.season} · {GENDER_LABEL[product.gender]} · 출고 {product.shipDays}일
                        </div>
                        <strong style={{ fontSize: '14px' }}>{product.name}</strong>
                        {product.status === 'REJECTED' && product.rejectReason && (
                          <div className="ws-reject-box">
                            <strong>거절 사유:</strong> {product.rejectReason}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{product.brandName}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {product.sellerName}
                    </div>
                  </td>
                  <td>
                    <div>
                      {product.parentCategoryName} &gt; {product.categoryName}
                    </div>
                    <strong>{product.price.toLocaleString('ko-KR')}원</strong>
                  </td>
                  <td>
                    <div className="ws-meta-list">
                      {product.options.map(opt => (
                        <span key={opt.id} className="ws-option-tag">
                          <i
                            className="ws-color-dot"
                            style={{ backgroundColor: opt.hexCode }}
                          />
                          {opt.colorName}/{opt.sizeLabel} ({opt.stockQuantity}개)
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`ws-badge ws-badge-${product.status}`}>
                      {PRODUCT_STATUS_LABEL[product.status]}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {(product.status === 'PENDING' || product.status === 'REJECTED') && (
                        <button
                          type="button"
                          className="ws-btn ws-btn-sm ws-btn-success"
                          onClick={() => handleStatusUpdate(product, 'ON_SALE')}
                        >
                          <Icon name="check" />
                          <span>승인 (판매개시)</span>
                        </button>
                      )}

                      {product.status === 'PENDING' && (
                        <button
                          type="button"
                          className="ws-btn ws-btn-sm ws-btn-danger"
                          onClick={() => {
                            setRejectingProduct(product)
                            setRejectReason(product.rejectReason ?? '')
                          }}
                        >
                          거절
                        </button>
                      )}

                      {(product.status === 'ON_SALE' || product.status === 'SOLD_OUT') && (
                        <button
                          type="button"
                          className="ws-btn ws-btn-sm ws-btn-danger"
                          onClick={() => handleStatusUpdate(product, 'BLOCKED')}
                        >
                          상품 차단
                        </button>
                      )}

                      {product.status === 'BLOCKED' && (
                        <button
                          type="button"
                          className="ws-btn ws-btn-sm ws-btn-primary"
                          onClick={() => handleStatusUpdate(product, 'ON_SALE')}
                        >
                          차단 해제
                        </button>
                      )}

                      <button
                        type="button"
                        className="ws-btn ws-btn-sm ws-btn-danger"
                        onClick={() => handleDelete(product)}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="ws-empty">
                    조건에 해당하는 상품이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {rejectingProduct && (
        <div className="ws-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="reject-product-title">
          <div className="ws-modal" style={{ maxWidth: '480px' }}>
            <div className="ws-modal-header">
              <h2 id="reject-product-title">
                상품 승인 거절 ({rejectingProduct.productCode})
              </h2>
              <button
                type="button"
                className="ws-banner-close"
                onClick={() => setRejectingProduct(null)}
                aria-label="모달 닫기"
              >
                <Icon name="close" />
              </button>
            </div>
            <form onSubmit={handleRejectSubmit} className="ws-main" style={{ gap: '14px' }}>
              <div className="ws-field">
                <label htmlFor="prod-reject-reason">거절 사유 (판매자 상품 관리에 표시됨)</label>
                <textarea
                  id="prod-reject-reason"
                  className="ws-textarea"
                  placeholder="예: 대표 이미지 화질 불량 또는 품번/혼용률 표기 보완 필요"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  required
                />
              </div>
              <div className="ws-modal-actions">
                <button
                  type="button"
                  className="ws-btn"
                  onClick={() => setRejectingProduct(null)}
                >
                  취소
                </button>
                <button type="submit" className="ws-btn ws-btn-danger">
                  거절 확정
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
