import { useEffect, useState } from 'react'
import { getSalesStats, getTopProducts } from '../../services/mockStore'
import type {
  Brand,
  Product,
  SalesStatPoint,
  SellerShipment,
  StatPeriod,
  TopProductStat,
} from '../../types/commerce'

type SellerStatsTabProps = {
  brands: Brand[]
  products: Product[]
  shipments: SellerShipment[]
}

export default function SellerStatsTab({
  brands,
  products,
  shipments,
}: SellerStatsTabProps) {
  const [period, setPeriod] = useState<StatPeriod>('daily')
  const [fromDate, setFromDate] = useState('2026-11-08')
  const [toDate, setToDate] = useState('2026-11-17')
  const [stats, setStats] = useState<SalesStatPoint[]>([])
  const [topProducts, setTopProducts] = useState<TopProductStat[]>([])

  useEffect(() => {
    let active = true
    void Promise.all([
      getSalesStats(period, 'SELLER', fromDate, toDate),
      getTopProducts('SELLER'),
    ])
      .then(([nextStats, nextTop]) => {
        if (!active) return
        setStats(nextStats)
        setTopProducts(nextTop)
      })
      .catch(() => {
        if (!active) return
        setStats([])
        setTopProducts([])
      })
    return () => {
      active = false
    }
  }, [period, fromDate, toDate, brands, products, shipments])

  const totalRevenue = stats.reduce((sum, s) => sum + s.revenue, 0)
  const totalSalesCount = stats.reduce((sum, s) => sum + s.salesCount, 0)
  const maxRevenue = Math.max(...stats.map(s => s.revenue), 1)

  const onSaleCount = products.filter(p => p.status === 'ON_SALE').length
  const pendingProducts = products.filter(p => p.status === 'PENDING').length
  const pendingBrands = brands.filter(b => b.status === 'PENDING').length
  const unconfirmedOrders = shipments.filter(
    s => s.status !== 'CONFIRMED' && s.status !== 'CANCELED',
  ).length

  return (
    <>
      <div className="ws-page-header">
        <div>
          <h1>판매 통계 및 대시보드</h1>
          <p>
            일별·주별·월별 판매량 및 매출 추이(취소 주문 제외)와 상품별 판매 순위 TOP 지표를 확인합니다.
          </p>
        </div>
      </div>

      <div className="ws-kpi-grid">
        <div className="ws-kpi-card">
          <span className="ws-kpi-label">조회 기간 누적 매출</span>
          <strong className="ws-kpi-value">
            {totalRevenue.toLocaleString('ko-KR')}원
          </strong>
          <span className="ws-kpi-sub">취소 주문 제외 집계</span>
        </div>
        <div className="ws-kpi-card">
          <span className="ws-kpi-label">조회 기간 판매 수량</span>
          <strong className="ws-kpi-value">{totalSalesCount}개</strong>
          <span className="ws-kpi-sub">주문 상품 수량 합계</span>
        </div>
        <div className="ws-kpi-card">
          <span className="ws-kpi-label">판매중 상품 / 승인 대기</span>
          <strong className="ws-kpi-value">
            {onSaleCount}건 / {pendingProducts}건
          </strong>
          <span className="ws-kpi-sub">브랜드 승인 대기 {pendingBrands}건</span>
        </div>
        <div className="ws-kpi-card">
          <span className="ws-kpi-label">진행중 배송 묶음</span>
          <strong className="ws-kpi-value">{unconfirmedOrders}건</strong>
          <span className="ws-kpi-sub">주문완료~배송완료 단계</span>
        </div>
      </div>

      <section className="ws-card" aria-labelledby="sales-chart-heading">
        <div className="ws-toolbar">
          <div>
            <h2 id="sales-chart-heading" className="ws-card-title">기간별 매출 및 판매량 추이</h2>
            <p className="ws-card-desc">
              조회 기간({fromDate} ~ {toDate}) 기준 매출 및 판매량 집계
            </p>
          </div>

          <div className="ws-search-box">
            <div className="ws-filter-pills" role="group" aria-label="집계 단위">
              {(
                [
                  { id: 'daily', label: '일별 (Daily)' },
                  { id: 'weekly', label: '주별 (Weekly)' },
                  { id: 'monthly', label: '월별 (Monthly)' },
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  className="ws-pill"
                  aria-pressed={period === tab.id}
                  onClick={() => setPeriod(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <input
              type="date"
              className="ws-input"
              aria-label="시작일"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
            />
            <span style={{ color: 'var(--muted)' }}>~</span>
            <input
              type="date"
              className="ws-input"
              aria-label="종료일"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
            />
          </div>
        </div>

        <div className="ws-chart-container">
          <svg
            className="ws-chart-svg"
            viewBox="0 0 760 230"
            role="img"
            aria-label="기간별 판매 매출 막대 차트"
          >
            {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
              const y = 185 - ratio * 150
              const val = Math.round((maxRevenue * ratio) / 10000)
              return (
                <g key={ratio}>
                  <line
                    x1="56"
                    y1={y}
                    x2="740"
                    y2={y}
                    stroke="#e2e3dc"
                    strokeDasharray={ratio === 0 ? undefined : '4 4'}
                  />
                  <text
                    x="48"
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="#626560"
                  >
                    {val}만
                  </text>
                </g>
              )
            })}

            {stats.map((point, idx) => {
              const slotWidth = 660 / stats.length
              const barWidth = Math.min(48, slotWidth * 0.52)
              const x = 68 + idx * slotWidth + (slotWidth - barWidth) / 2
              const barHeight = Math.max(6, (point.revenue / maxRevenue) * 150)
              const y = 185 - barHeight
              return (
                <g key={point.dateKey}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx="2"
                    fill="#2041bc"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 7}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill="#1c201e"
                  >
                    {(point.revenue / 10000).toFixed(0)}만 ({point.salesCount}개)
                  </text>
                  <text
                    x={x + barWidth / 2}
                    y={206}
                    textAnchor="middle"
                    fontSize="11.5"
                    fontWeight="600"
                    fill="#3a3e39"
                  >
                    {point.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </section>

      <section className="ws-card" aria-labelledby="top-products-heading">
        <div>
          <h2 id="top-products-heading" className="ws-card-title">상품별 판매 순위 TOP</h2>
          <p className="ws-card-desc">매출액 기준 상위 판매 상품 목록</p>
        </div>

        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>품번 / 상품명</th>
                <th>브랜드 / 카테고리</th>
                <th>누적 판매량</th>
                <th>누적 매출액</th>
                <th>현재 총 재고</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((item, idx) => (
                <tr key={item.productId}>
                  <td>
                    <strong>#{idx + 1}</strong>
                  </td>
                  <td>
                    <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                      {item.productCode}
                    </div>
                    <strong>{item.productName}</strong>
                  </td>
                  <td>
                    <strong>{item.brandName}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {item.categoryName}
                    </div>
                  </td>
                  <td>
                    <strong>{item.salesCount}개</strong>
                  </td>
                  <td>
                    <strong>{item.revenue.toLocaleString('ko-KR')}원</strong>
                  </td>
                  <td>{item.currentStock}개</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
