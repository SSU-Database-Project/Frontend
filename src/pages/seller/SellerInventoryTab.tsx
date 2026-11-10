import { useState, type FormEvent } from 'react'
import { adjustOptionStock } from '../../services/mockStore'
import type { Product, StockHistoryItem, StockHistoryType } from '../../types/commerce'

const HISTORY_TYPE_LABEL: Record<StockHistoryType, string> = {
  IN: '입고',
  ORDER: '주문차감',
  CANCEL: '취소복원',
  ADJUST: '재고조정',
}

type SellerInventoryTabProps = {
  products: Product[]
  stockHistory: StockHistoryItem[]
  preselectedProductId?: number | null
  onRefresh: () => void
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void
}

export default function SellerInventoryTab({
  products,
  stockHistory,
  preselectedProductId,
  onRefresh,
  onNotify,
}: SellerInventoryTabProps) {
  const [selectedProductId, setSelectedProductId] = useState<number | 'ALL'>(
    () => preselectedProductId ?? 'ALL',
  )
  const [selectedOptionId, setSelectedOptionId] = useState<number>(() => {
    if (preselectedProductId) {
      const targetProd = products.find(p => p.id === preselectedProductId)
      if (targetProd?.options[0]) return targetProd.options[0].id
    }
    return products[0]?.options[0]?.id ?? 0
  })
  const [adjustType, setAdjustType] = useState<'IN' | 'ADJUST'>('IN')
  const [changeQty, setChangeQty] = useState<string>('10')
  const [memo, setMemo] = useState('')
  const [historyFilterOptionId, setHistoryFilterOptionId] = useState<number | 'ALL'>('ALL')

  const visibleProducts = products.filter(
    p => selectedProductId === 'ALL' || p.id === selectedProductId,
  )

  const allOptions = products.flatMap(p =>
    p.options.map(o => ({
      ...o,
      productName: p.name,
      productCode: p.productCode,
      brandName: p.brandName,
    })),
  )

  function handleQuickSelectOption(optionId: number, mode: 'IN' | 'ADJUST') {
    setSelectedOptionId(optionId)
    setAdjustType(mode)
    setChangeQty(mode === 'IN' ? '10' : '-1')
    setHistoryFilterOptionId(optionId)
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      const parsedQty = Number(changeQty)
      if (!changeQty.trim() || Number.isNaN(parsedQty) || !Number.isInteger(parsedQty) || parsedQty === 0) {
        throw new Error('변동 수량은 0이 아닌 정수를 입력해 주세요.')
      }
      const updated = adjustOptionStock({
        optionId: selectedOptionId,
        type: adjustType,
        changeQty: parsedQty,
        memo,
      })
      setMemo('')
      onRefresh()
      onNotify(
        'success',
        `옵션 [${updated.colorName} / ${updated.sizeLabel}] 재고가 ${updated.stockQuantity}개로 갱신되었습니다.`,
      )
    } catch (err) {
      onNotify('error', err instanceof Error ? err.message : '재고 변경에 실패했습니다.')
    }
  }

  const filteredHistory = stockHistory.filter(
    h =>
      (selectedProductId === 'ALL' || h.productId === selectedProductId) &&
      (historyFilterOptionId === 'ALL' || h.optionId === historyFilterOptionId),
  )

  return (
    <>
      <div className="ws-page-header">
        <div>
          <h1>재고 및 입출고 이력 관리</h1>
          <p>
            색상 × 사이즈 옵션 단위로 재고를 입고하거나 실사 조정하고, 입출고 변동 이력을 확인합니다. 재고 변경은 관리자 승인이 필요하지 않습니다.
          </p>
        </div>
      </div>

      <section className="ws-card" aria-labelledby="stock-adjust-heading">
        <div className="ws-card-header">
          <div>
            <h2 id="stock-adjust-heading" className="ws-card-title">옵션 재고 입고 / 조정 처리</h2>
            <p className="ws-card-desc">
              선택한 상품 옵션의 재고 수량을 입고하거나 조정합니다.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="ws-form-grid"
          style={{
            alignItems: 'end',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}
        >
          <div className="ws-field" style={{ gridColumn: 'span 2' }}>
            <label htmlFor="stock-option-select">대상 상품 옵션 (품번 · 상품명 · 색상/사이즈)</label>
            <select
              id="stock-option-select"
              className="ws-select"
              value={selectedOptionId}
              onChange={e => setSelectedOptionId(Number(e.target.value))}
            >
              {allOptions.map(opt => (
                <option key={opt.id} value={opt.id}>
                  [{opt.productCode}] {opt.productName} — {opt.colorName} / {opt.sizeLabel} (현재 재고: {opt.stockQuantity}개)
                </option>
              ))}
            </select>
          </div>

          <div className="ws-field">
            <label htmlFor="stock-type-select">변동 유형</label>
            <select
              id="stock-type-select"
              className="ws-select"
              value={adjustType}
              onChange={e => {
                const nextType = e.target.value as 'IN' | 'ADJUST'
                setAdjustType(nextType)
                if (nextType === 'IN' && (Number(changeQty) <= 0 || Number.isNaN(Number(changeQty)))) {
                  setChangeQty('10')
                }
              }}
            >
              <option value="IN">입고 (+수량)</option>
              <option value="ADJUST">재고 조정 (+/-수량)</option>
            </select>
          </div>

          <div className="ws-field">
            <label htmlFor="stock-qty-input">변동 수량 ({adjustType === 'IN' ? '양수만' : '+/- 정수'})</label>
            <input
              id="stock-qty-input"
              type="number"
              step={1}
              min={adjustType === 'IN' ? 1 : undefined}
              className="ws-input"
              placeholder={adjustType === 'IN' ? '예: 10' : '예: -5 또는 5'}
              value={changeQty}
              onKeyDown={e => {
                if (e.key === 'e' || e.key === 'E' || e.key === '.') {
                  e.preventDefault()
                  return
                }
                if (adjustType === 'IN' && e.key === '-') {
                  e.preventDefault()
                  return
                }
                if (adjustType === 'ADJUST' && e.key === '-' && e.currentTarget.value === '0') {
                  e.currentTarget.value = ''
                  setChangeQty('')
                }
              }}
              onChange={e => setChangeQty(e.target.value)}
              required
            />
          </div>

          <div className="ws-field" style={{ gridColumn: 'span 3' }}>
            <label htmlFor="stock-memo-input">비고 / 사유</label>
            <input
              id="stock-memo-input"
              className="ws-input"
              placeholder="예: 2차 리오더 입고 / 불량 검수 차감"
              value={memo}
              onChange={e => setMemo(e.target.value)}
            />
          </div>

          <div>
            <button type="submit" className="ws-btn ws-btn-primary" style={{ width: '100%' }}>
              재고 반영
            </button>
          </div>
        </form>
      </section>

      <section className="ws-card" aria-labelledby="option-table-heading">
        <div className="ws-toolbar">
          <div>
            <h2 id="option-table-heading" className="ws-card-title">상품별 옵션 재고 현황</h2>
            <p className="ws-card-desc">각 옵션의 빠른 입고/조정 또는 이력 필터링을 선택할 수 있습니다.</p>
          </div>
          <div className="ws-search-box">
            <select
              className="ws-select"
              aria-label="상품 선택 필터"
              value={selectedProductId}
              onChange={e =>
                setSelectedProductId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
              }
            >
              <option value="ALL">전체 상품 보기</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.productCode}] {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead>
              <tr>
                <th>옵션 ID</th>
                <th>품번 / 상품명</th>
                <th>색상</th>
                <th>사이즈</th>
                <th>현재 재고</th>
                <th>빠른 작업</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.flatMap(product =>
                product.options.map(opt => (
                  <tr key={opt.id}>
                    <td>#{opt.id}</td>
                    <td>
                      <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                        {product.productCode}
                      </div>
                      <strong>{product.name}</strong>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <i className="ws-color-dot" style={{ backgroundColor: opt.hexCode }} />
                        {opt.colorName}
                      </span>
                    </td>
                    <td>
                      <strong>{opt.sizeLabel}</strong> ({product.sizeGroup})
                    </td>
                    <td>
                      <strong
                        style={{
                          color: opt.stockQuantity === 0 ? '#9e2119' : '#1c201e',
                          fontSize: '14px',
                        }}
                      >
                        {opt.stockQuantity}개
                      </strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="ws-btn ws-btn-sm ws-btn-primary"
                          onClick={() => handleQuickSelectOption(opt.id, 'IN')}
                        >
                          + 입고 선택
                        </button>
                        <button
                          type="button"
                          className="ws-btn ws-btn-sm"
                          onClick={() => handleQuickSelectOption(opt.id, 'ADJUST')}
                        >
                          조정 선택
                        </button>
                        <button
                          type="button"
                          className="ws-btn ws-btn-sm"
                          onClick={() =>
                            setHistoryFilterOptionId(
                              historyFilterOptionId === opt.id ? 'ALL' : opt.id,
                            )
                          }
                        >
                          {historyFilterOptionId === opt.id ? '전체 이력 보기' : '이 옵션 이력만'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ws-card" aria-labelledby="stock-history-heading">
        <div className="ws-toolbar">
          <div>
            <h2 id="stock-history-heading" className="ws-card-title">
              재고 변동 이력 ({filteredHistory.length}건)
            </h2>
            <p className="ws-card-desc">
              입고, 주문차감, 주문취소, 재고조정 내역이 기록됩니다.
            </p>
          </div>
          {historyFilterOptionId !== 'ALL' && (
            <button
              type="button"
              className="ws-btn ws-btn-sm"
              onClick={() => setHistoryFilterOptionId('ALL')}
            >
              옵션 필터 해제 (#{historyFilterOptionId})
            </button>
          )}
        </div>

        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead>
              <tr>
                <th>이력 ID</th>
                <th>일시</th>
                <th>상품 / 옵션</th>
                <th>변동 유형</th>
                <th>변동 수량</th>
                <th>변경 후 재고</th>
                <th>비고 / 주문라인</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map(item => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td>{item.createdAt.replace('T', ' ')}</td>
                  <td>
                    <strong>{item.productName}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {item.productCode} · {item.colorName} / {item.sizeLabel} (옵션 #{item.optionId})
                    </div>
                  </td>
                  <td>
                    <span
                      className={`ws-badge ${
                        item.type === 'IN' || item.type === 'CANCEL'
                          ? 'ws-badge-APPROVED'
                          : item.type === 'ORDER'
                            ? 'ws-badge-SHIPPING'
                            : 'ws-badge-PENDING'
                      }`}
                    >
                      {HISTORY_TYPE_LABEL[item.type]}
                    </span>
                  </td>
                  <td>
                    <strong
                      style={{
                        color: item.changeQty > 0 ? '#185826' : '#8a1f17',
                      }}
                    >
                      {item.changeQty > 0 ? `+${item.changeQty}` : item.changeQty}
                    </strong>
                  </td>
                  <td>
                    <strong>{item.quantityAfter}개</strong>
                  </td>
                  <td>
                    {item.memo}
                    {item.orderItemId && (
                      <span style={{ fontSize: '11.5px', color: 'var(--muted)', marginLeft: '6px' }}>
                        (주문상품 #{item.orderItemId})
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={7} className="ws-empty">
                    표시할 재고 변동 이력이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
