import { useState, type FormEvent } from 'react'
import Icon from '../../components/Icon'
import { deleteSellerBrand, updateAdminBrandStatus } from '../../services/mockStore'
import type { Brand, BrandStatus } from '../../types/commerce'

const BRAND_STATUS_LABEL: Record<BrandStatus, string> = {
  PENDING: '승인 대기',
  APPROVED: '승인 완료',
  REJECTED: '승인 거절',
}

type AdminBrandsTabProps = {
  brands: Brand[]
  onRefresh: () => void
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void
}

export default function AdminBrandsTab({
  brands,
  onRefresh,
  onNotify,
}: AdminBrandsTabProps) {
  const [statusFilter, setStatusFilter] = useState<'ALL' | BrandStatus>('ALL')
  const [keyword, setKeyword] = useState('')
  const [rejectingBrand, setRejectingBrand] = useState<Brand | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const filtered = brands.filter(b => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false
    if (keyword.trim()) {
      const q = keyword.trim().toLowerCase()
      return (
        b.name.toLowerCase().includes(q) ||
        b.sellerName.toLowerCase().includes(q)
      )
    }
    return true
  })

  async function handleApprove(brand: Brand) {
    try {
      await updateAdminBrandStatus(brand.id, 'APPROVED')
      await onRefresh()
      onNotify(
        'success',
        `브랜드 [${brand.name}]이(가) 승인 처리되었습니다. 이제 판매자가 해당 브랜드에 상품을 등록할 수 있습니다.`,
      )
    } catch (err) {
      onNotify('error', err instanceof Error ? err.message : '브랜드 승인에 실패했습니다.')
    }
  }

  async function handleRejectSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!rejectingBrand) return
    try {
      await updateAdminBrandStatus(rejectingBrand.id, 'REJECTED', rejectReason)
      setRejectingBrand(null)
      setRejectReason('')
      await onRefresh()
      onNotify(
        'info',
        `브랜드 [${rejectingBrand.name}]이(가) 거절 처리되었으며 판매자에게 거절 사유가 전달됩니다.`,
      )
    } catch (err) {
      onNotify('error', err instanceof Error ? err.message : '브랜드 거절 처리에 실패했습니다.')
    }
  }

  async function handleDelete(brand: Brand) {
    try {
      await deleteSellerBrand(brand.id, 'ADMIN')
      await onRefresh()
      onNotify('info', `브랜드 [${brand.name}]이(가) 삭제 처리되었습니다.`)
    } catch (err) {
      onNotify('error', err instanceof Error ? err.message : '브랜드 삭제에 실패했습니다.')
    }
  }

  return (
    <>
      <div className="ws-page-header">
        <div>
          <h1>브랜드 승인 및 관리</h1>
          <p>
            판매자가 신청한 신규 브랜드를 심사하여 승인하거나 거절 사유와 함께 반려합니다.
          </p>
        </div>
      </div>

      <div className="ws-kpi-grid">
        <div className="ws-kpi-card">
          <span className="ws-kpi-label">승인 대기 브랜드</span>
          <strong className="ws-kpi-value">
            {brands.filter(b => b.status === 'PENDING').length}건
          </strong>
          <span className="ws-kpi-sub">승인 즉시 상품 등록 가능</span>
        </div>
        <div className="ws-kpi-card">
          <span className="ws-kpi-label">승인 완료 브랜드</span>
          <strong className="ws-kpi-value">
            {brands.filter(b => b.status === 'APPROVED').length}건
          </strong>
          <span className="ws-kpi-sub">현재 플랫폼 입점 브랜드</span>
        </div>
        <div className="ws-kpi-card">
          <span className="ws-kpi-label">반려/거절 브랜드</span>
          <strong className="ws-kpi-value">
            {brands.filter(b => b.status === 'REJECTED').length}건
          </strong>
          <span className="ws-kpi-sub">거절 사유 기록됨</span>
        </div>
      </div>

      <section className="ws-card" aria-label="브랜드 심사 목록">
        <div className="ws-toolbar">
          <div className="ws-filter-pills" role="group" aria-label="상태 필터">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(st => (
              <button
                key={st}
                type="button"
                className="ws-pill"
                aria-pressed={statusFilter === st}
                onClick={() => setStatusFilter(st)}
              >
                {st === 'ALL' ? '전체' : BRAND_STATUS_LABEL[st]}
              </button>
            ))}
          </div>

          <div className="ws-search-box">
            <input
              className="ws-input"
              placeholder="브랜드명 또는 판매자 상호 검색"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>
        </div>

        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>브랜드명 / 소개</th>
                <th>신청 판매자</th>
                <th>현재 상태</th>
                <th>신청 일시</th>
                <th>승인 / 거절 관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(brand => (
                <tr key={brand.id}>
                  <td>#{brand.id}</td>
                  <td>
                    <strong style={{ fontSize: '14px' }}>{brand.name}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>
                      {brand.description}
                    </div>
                    {brand.status === 'REJECTED' && brand.rejectReason && (
                      <div className="ws-reject-box">
                        <strong>거절 사유:</strong> {brand.rejectReason}
                      </div>
                    )}
                  </td>
                  <td>
                    <strong>{brand.sellerName}</strong>
                    <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                      판매자 #{brand.sellerId}
                    </div>
                  </td>
                  <td>
                    <span className={`ws-badge ws-badge-${brand.status}`}>
                      {BRAND_STATUS_LABEL[brand.status]}
                    </span>
                  </td>
                  <td>{brand.createdAt.replace('T', ' ')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {brand.status !== 'APPROVED' && (
                        <button
                          type="button"
                          className="ws-btn ws-btn-sm ws-btn-success"
                          onClick={() => handleApprove(brand)}
                        >
                          <Icon name="check" />
                          <span>승인</span>
                        </button>
                      )}
                      {brand.status !== 'REJECTED' && (
                        <button
                          type="button"
                          className="ws-btn ws-btn-sm ws-btn-danger"
                          onClick={() => {
                            setRejectingBrand(brand)
                            setRejectReason(brand.rejectReason ?? '')
                          }}
                        >
                          거절
                        </button>
                      )}
                      <button
                        type="button"
                        className="ws-btn ws-btn-sm ws-btn-danger"
                        onClick={() => handleDelete(brand)}
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
                    조건에 해당하는 브랜드 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {rejectingBrand && (
        <div className="ws-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="reject-brand-title">
          <div className="ws-modal" style={{ maxWidth: '480px' }}>
            <div className="ws-modal-header">
              <h2 id="reject-brand-title">브랜드 승인 거절 ({rejectingBrand.name})</h2>
              <button
                type="button"
                className="ws-banner-close"
                onClick={() => setRejectingBrand(null)}
                aria-label="모달 닫기"
              >
                <Icon name="close" />
              </button>
            </div>
            <form onSubmit={handleRejectSubmit} className="ws-main" style={{ gap: '14px' }}>
              <div className="ws-field">
                <label htmlFor="brand-reject-reason">거절 사유 (판매자 화면에 표시됨)</label>
                <textarea
                  id="brand-reject-reason"
                  className="ws-textarea"
                  placeholder="예: 상표권 등록증 확인 불가 및 브랜드 설명 보완 필요"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  required
                />
              </div>
              <div className="ws-modal-actions">
                <button
                  type="button"
                  className="ws-btn"
                  onClick={() => setRejectingBrand(null)}
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
