import { useState } from 'react'
import {
  getBrandSalesSummaries,
  getSalesStats,
} from '../../services/mockStore'
import type { Brand, Product, StatPeriod, UserItem } from '../../types/commerce'

type AdminStatsTabProps = {
  brands: Brand[]
  products: Product[]
  users: UserItem[]
}

export default function AdminStatsTab({
  brands,
  products,
  users,
}: AdminStatsTabProps) {
  const [period, setPeriod] = useState<StatPeriod>('daily')

  const stats = getSalesStats(period, 'ADMIN')
  const brandSummaries = getBrandSalesSummaries()

  const totalRevenue = stats.reduce((sum, s) => sum + s.revenue, 0)
  const totalSalesCount = stats.reduce((sum, s) => sum + s.salesCount, 0)
  const maxRevenue = Math.max(...stats.map(s => s.revenue), 1)

  const approvedBrands = brands.filter(b => b.status === 'APPROVED').length
  const activeProducts = products.filter(p => p.status === 'ON_SALE').length
  const activeUsers = users.filter(u => u.status === 'ACTIVE').length

  return (
    <>
      <div className="ws-page-header">
        <div>
          <h1>플랫폼 전체 통계</h1>
          <p>
            SEAM 플랫폼 전체의 일별·주별·월별 거래액(GMV) 및 판매량 추이와 입점 브랜드별 실적을 종합 집계합니다.
          </p>
        </div>
      </div>

      <div className="ws-kpi-grid">
        <div className="ws-kpi-card">
          <span className="ws-kpi-label">플랫폼 기간 총 거래액</span>
          <strong className="ws-kpi-value">
            {totalRevenue.toLocaleString('ko-KR')}원
          </strong>
          <span className="ws-kpi-sub">취소 주문 제외 전체 거래액</span>
        </div>
        <div className="ws-kpi-card">
          <span className="ws-kpi-label">플랫폼 기간 총 판매수량</span>
          <strong className="ws-kpi-value">{totalSalesCount}개</strong>
          <span className="ws-kpi-sub">전체 입점 브랜드 합산</span>
        </div>
        <div className="ws-kpi-card">
          <span className="ws-kpi-label">입점 브랜드 / 판매중 상품</span>
          <strong className="ws-kpi-value">
            {approvedBrands}개 / {activeProducts}종
          </strong>
          <span className="ws-kpi-sub">승인 완료 기준</span>
        </div>
        <div className="ws-kpi-card">
          <span className="ws-kpi-label">정상 활동 회원</span>
          <strong className="ws-kpi-value">{activeUsers}명</strong>
          <span className="ws-kpi-sub">정상 이용 중인 회원 수</span>
        </div>
      </div>

      <section className="ws-card" aria-labelledby="admin-sales-chart-heading">
        <div className="ws-toolbar">
          <div>
            <h2 id="admin-sales-chart-heading" className="ws-card-title">
              플랫폼 전체 거래액 및 판매량 추이
            </h2>
            <p className="ws-card-desc">선택한 기간 단위별 플랫폼 전체 매출 및 판매량 추이</p>
          </div>

          <div className="ws-filter-pills" role="group" aria-label="집계 기간 단위">
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
        </div>

        <div className="ws-chart-container">
          <svg
            className="ws-chart-svg"
            viewBox="0 0 760 230"
            role="img"
            aria-label="플랫폼 전체 기간별 매출 차트"
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
                    fill="#1c201e"
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

      <section className="ws-card" aria-labelledby="brand-summary-heading">
        <div>
          <h2 id="brand-summary-heading" className="ws-card-title">
            입점 브랜드별 매출 실적 요약
          </h2>
          <p className="ws-card-desc">승인 완료된 브랜드 기준 누적 판매 수량 및 매출액</p>
        </div>

        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>브랜드명</th>
                <th>운영 판매자</th>
                <th>등록 상품 수</th>
                <th>누적 판매 수량</th>
                <th>누적 매출액</th>
              </tr>
            </thead>
            <tbody>
              {brandSummaries.map((b, idx) => (
                <tr key={b.brandId}>
                  <td>
                    <strong>#{idx + 1}</strong>
                  </td>
                  <td>
                    <strong>{b.brandName}</strong>
                  </td>
                  <td>{b.sellerName}</td>
                  <td>{b.productCount}종</td>
                  <td>
                    <strong>{b.salesCount}개</strong>
                  </td>
                  <td>
                    <strong>{b.revenue.toLocaleString('ko-KR')}원</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
