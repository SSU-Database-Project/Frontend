import { useState } from 'react'
import Icon from '../../components/Icon'
import { updateShipmentStatus } from '../../services/mockStore'
import type { SellerShipment, ShipmentStatus } from '../../types/commerce'

const SHIPMENT_STATUS_LABEL: Record<ShipmentStatus, string> = {
  ORDERED: '주문완료',
  PREPARING: '배송준비',
  SHIPPING: '배송중',
  DELIVERED: '배송완료',
  CONFIRMED: '구매확정',
  CANCELED: '주문취소',
}

type SellerOrdersTabProps = {
  shipments: SellerShipment[]
  onRefresh: () => void
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void
}

export default function SellerOrdersTab({
  shipments,
  onRefresh,
  onNotify,
}: SellerOrdersTabProps) {
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE')
  const [statusFilter, setStatusFilter] = useState<'ALL' | ShipmentStatus>('ALL')

  const activeShipments = shipments.filter(
    s => s.status !== 'CONFIRMED' && s.status !== 'CANCELED',
  )
  const archivedShipments = shipments.filter(
    s => s.status === 'CONFIRMED' || s.status === 'CANCELED',
  )

  const baseList = viewMode === 'ACTIVE' ? activeShipments : archivedShipments
  const visibleList = baseList.filter(
    s => statusFilter === 'ALL' || s.status === statusFilter,
  )

  async function handleChangeStatus(shipment: SellerShipment, nextStatus: ShipmentStatus) {
    try {
      await updateShipmentStatus(shipment.id, nextStatus)
      await onRefresh()
      if (nextStatus === 'CONFIRMED') {
        onNotify(
          'success',
          `주문 [${shipment.orderNumber}]이(가) 구매확정 처리되어 [확정 주문내역]으로 이동되었습니다. 이후 상태 수정이 불가합니다.`,
        )
      } else if (nextStatus === 'CANCELED') {
        onNotify(
          'info',
          `주문 [${shipment.orderNumber}]이(가) 취소 처리되었으며 옵션 재고가 자동 복원되었습니다.`,
        )
      } else {
        onNotify(
          'success',
          `주문 [${shipment.orderNumber}] 배송 상태가 [${SHIPMENT_STATUS_LABEL[nextStatus]}](으)로 변경되었습니다.`,
        )
      }
    } catch (err) {
      onNotify('error', err instanceof Error ? err.message : '배송 상태 변경에 실패했습니다.')
    }
  }

  return (
    <>
      <div className="ws-page-header">
        <div>
          <h1>주문 및 배송 관리</h1>
          <p>
            배송 묶음 단위로 배송 상태를 단계별로 변경합니다. 배송완료 후 확정된 주문은 수정이 잠기며 확정 주문내역으로 이동합니다.
          </p>
        </div>
      </div>

      <div className="ws-kpi-grid">
        <div className="ws-kpi-card">
          <span className="ws-kpi-label">신규 주문완료 (발송 대기)</span>
          <strong className="ws-kpi-value">
            {shipments.filter(s => s.status === 'ORDERED').length}건
          </strong>
          <span className="ws-kpi-sub">배송준비 전환 또는 취소 가능</span>
        </div>
        <div className="ws-kpi-card">
          <span className="ws-kpi-label">배송준비 · 배송중</span>
          <strong className="ws-kpi-value">
            {shipments.filter(s => s.status === 'PREPARING' || s.status === 'SHIPPING').length}건
          </strong>
          <span className="ws-kpi-sub">출고 및 택배 이동 진행 중</span>
        </div>
        <div className="ws-kpi-card">
          <span className="ws-kpi-label">배송완료 (확정 대기)</span>
          <strong className="ws-kpi-value">
            {shipments.filter(s => s.status === 'DELIVERED').length}건
          </strong>
          <span className="ws-kpi-sub">확정 시 확정 주문내역으로 이동</span>
        </div>
        <div className="ws-kpi-card">
          <span className="ws-kpi-label">구매확정 완료</span>
          <strong className="ws-kpi-value">
            {shipments.filter(s => s.status === 'CONFIRMED').length}건
          </strong>
          <span className="ws-kpi-sub">정산 확정 (상태 수정 불가)</span>
        </div>
      </div>

      <section className="ws-card" aria-label="주문 내역 목록">
        <div className="ws-toolbar">
          <div className="ws-filter-pills" role="tablist" aria-label="주문 구분 탭">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'ACTIVE'}
              className={`ws-btn ${viewMode === 'ACTIVE' ? 'ws-btn-primary' : ''}`}
              onClick={() => {
                setViewMode('ACTIVE')
                setStatusFilter('ALL')
              }}
            >
              진행중 주문 관리 ({activeShipments.length}건)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'ARCHIVED'}
              className={`ws-btn ${viewMode === 'ARCHIVED' ? 'ws-btn-primary' : ''}`}
              onClick={() => {
                setViewMode('ARCHIVED')
                setStatusFilter('ALL')
              }}
            >
              확정 주문내역 / 취소 ({archivedShipments.length}건)
            </button>
          </div>

          <div className="ws-filter-pills" role="group" aria-label="상세 상태 필터">
            {viewMode === 'ACTIVE' ? (
              (['ALL', 'ORDERED', 'PREPARING', 'SHIPPING', 'DELIVERED'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  className="ws-pill"
                  aria-pressed={statusFilter === st}
                  onClick={() => setStatusFilter(st)}
                >
                  {st === 'ALL' ? '전체' : SHIPMENT_STATUS_LABEL[st]}
                </button>
              ))
            ) : (
              (['ALL', 'CONFIRMED', 'CANCELED'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  className="ws-pill"
                  aria-pressed={statusFilter === st}
                  onClick={() => setStatusFilter(st)}
                >
                  {st === 'ALL' ? '전체' : SHIPMENT_STATUS_LABEL[st]}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead>
              <tr>
                <th>배송묶음 / 주문번호</th>
                <th>주문자 / 배송지</th>
                <th>주문 상품 (옵션·수량)</th>
                <th>합계 금액</th>
                <th>현재 배송 상태</th>
                <th>배송 상태 변경 / 확정</th>
              </tr>
            </thead>
            <tbody>
              {visibleList.map(shipment => (
                <tr key={shipment.id}>
                  <td>
                    <strong>{shipment.orderNumber}</strong>
                    <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                      배송묶음 #{shipment.id} · {shipment.createdAt.replace('T', ' ')}
                    </div>
                  </td>
                  <td>
                    <strong>{shipment.buyerName}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '6px' }}>
                      ({shipment.buyerEmail})
                    </span>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                      {shipment.address}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'grid', gap: '4px' }}>
                      {shipment.items.map(item => (
                        <div key={item.id} style={{ fontSize: '12.5px' }}>
                          <strong>{item.productName}</strong>{' '}
                          <span style={{ color: 'var(--muted)' }}>
                            ({item.colorName} / {item.sizeLabel}) × {item.quantity}개
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <strong>{shipment.totalAmount.toLocaleString('ko-KR')}원</strong>
                  </td>
                  <td>
                    <span className={`ws-badge ws-badge-${shipment.status}`}>
                      {SHIPMENT_STATUS_LABEL[shipment.status]}
                    </span>
                    {shipment.confirmedAt && (
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                        확정: {shipment.confirmedAt.replace('T', ' ')}
                      </div>
                    )}
                    {shipment.canceledAt && (
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                        취소: {shipment.canceledAt.replace('T', ' ')}
                      </div>
                    )}
                  </td>
                  <td>
                    {shipment.status === 'ORDERED' && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="ws-btn ws-btn-sm ws-btn-primary"
                          onClick={() => handleChangeStatus(shipment, 'PREPARING')}
                        >
                          배송준비로 변경
                        </button>
                        <button
                          type="button"
                          className="ws-btn ws-btn-sm ws-btn-danger"
                          onClick={() => handleChangeStatus(shipment, 'CANCELED')}
                        >
                          주문 취소
                        </button>
                      </div>
                    )}

                    {shipment.status === 'PREPARING' && (
                      <button
                        type="button"
                        className="ws-btn ws-btn-sm ws-btn-primary"
                        onClick={() => handleChangeStatus(shipment, 'SHIPPING')}
                      >
                        배송중으로 변경
                      </button>
                    )}

                    {shipment.status === 'SHIPPING' && (
                      <button
                        type="button"
                        className="ws-btn ws-btn-sm ws-btn-primary"
                        onClick={() => handleChangeStatus(shipment, 'DELIVERED')}
                      >
                        배송완료로 변경
                      </button>
                    )}

                    {shipment.status === 'DELIVERED' && (
                      <button
                        type="button"
                        className="ws-btn ws-btn-sm ws-btn-success"
                        onClick={() => handleChangeStatus(shipment, 'CONFIRMED')}
                      >
                        <Icon name="check" />
                        <span>확정 (확정 주문내역 이동)</span>
                      </button>
                    )}

                    {(shipment.status === 'CONFIRMED' || shipment.status === 'CANCELED') && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '12px',
                          color: 'var(--muted)',
                          fontWeight: 700,
                        }}
                      >
                        <Icon name="lock" />
                        <span>{shipment.status === 'CONFIRMED' ? '구매확정 (수정불가)' : '취소 완료 (수정불가)'}</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {visibleList.length === 0 && (
                <tr>
                  <td colSpan={6} className="ws-empty">
                    해당 조건의 주문/배송 내역이 없습니다.
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
