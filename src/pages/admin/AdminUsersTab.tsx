import { useState } from 'react'
import Icon from '../../components/Icon'
import {
  updateAdminUserStatus,
  withdrawAdminUser,
} from '../../services/mockStore'
import type { UserItem, UserStatus } from '../../types/commerce'
import type { Role } from '../../types/role'

const USER_STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: '정상',
  SUSPENDED: '이용 정지',
  WITHDRAWN: '탈퇴 처리됨',
}

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: '관리자',
  SELLER: '판매자',
  USER: '일반회원',
}

type AdminUsersTabProps = {
  users: UserItem[]
  onRefresh: () => void
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void
}

export default function AdminUsersTab({
  users,
  onRefresh,
  onNotify,
}: AdminUsersTabProps) {
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | UserStatus>('ALL')
  const [confirmWithdrawUser, setConfirmWithdrawUser] = useState<UserItem | null>(
    null,
  )

  const filtered = users.filter(u => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false
    if (statusFilter !== 'ALL' && u.status !== statusFilter) return false
    return true
  })

  async function handleToggleSuspend(user: UserItem) {
    try {
      const next = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
      await updateAdminUserStatus(user.id, next)
      await onRefresh()
      onNotify(
        'success',
        `회원 [${user.name}] 계정 상태가 ${next === 'ACTIVE' ? '정상' : '이용 정지'}(으)로 변경되었습니다.`,
      )
    } catch (err) {
      onNotify('error', err instanceof Error ? err.message : '회원 상태 변경에 실패했습니다.')
    }
  }

  async function handleConfirmWithdraw() {
    if (!confirmWithdrawUser) return
    try {
      const targetName = confirmWithdrawUser.name
      const isSeller = confirmWithdrawUser.role === 'SELLER'
      await withdrawAdminUser(confirmWithdrawUser.id)
      setConfirmWithdrawUser(null)
      await onRefresh()
      onNotify(
        'info',
        isSeller
          ? `판매자 [${targetName}] 계정이 탈퇴 처리되어 개인정보가 마스킹되고 소속 상품 판매가 종료되었습니다.`
          : `회원 [${targetName}] 계정이 탈퇴 처리되어 개인정보가 삭제되었습니다 (주문 기록은 유지).`,
      )
    } catch (err) {
      onNotify('error', err instanceof Error ? err.message : '회원 삭제 처리에 실패했습니다.')
    }
  }

  return (
    <>
      <div className="ws-page-header">
        <div>
          <h1>유저(회원) 관리</h1>
          <p>
            일반회원 및 판매자 계정을 조회하고, 계정 정지·해제 또는 회원 탈퇴 처리를 수행합니다.
          </p>
        </div>
      </div>

      <div className="ws-kpi-grid">
        <div className="ws-kpi-card">
          <span className="ws-kpi-label">전체 등록 회원</span>
          <strong className="ws-kpi-value">{users.length}명</strong>
          <span className="ws-kpi-sub">일반회원 · 판매자 · 관리자 포함</span>
        </div>
        <div className="ws-kpi-card">
          <span className="ws-kpi-label">활성 계정</span>
          <strong className="ws-kpi-value">
            {users.filter(u => u.status === 'ACTIVE').length}명
          </strong>
          <span className="ws-kpi-sub">정상 서비스 이용 가능</span>
        </div>
        <div className="ws-kpi-card">
          <span className="ws-kpi-label">정지 계정</span>
          <strong className="ws-kpi-value">
            {users.filter(u => u.status === 'SUSPENDED').length}명
          </strong>
          <span className="ws-kpi-sub">로그인 및 서비스 이용 제한</span>
        </div>
        <div className="ws-kpi-card">
          <span className="ws-kpi-label">탈퇴/삭제 계정</span>
          <strong className="ws-kpi-value">
            {users.filter(u => u.status === 'WITHDRAWN').length}명
          </strong>
          <span className="ws-kpi-sub">개인정보 삭제 · 주문이력 보존</span>
        </div>
      </div>

      <section className="ws-card" aria-label="회원 목록">
        <div className="ws-toolbar">
          <div className="ws-filter-pills" role="group" aria-label="역할 필터">
            {(['ALL', 'USER', 'SELLER', 'ADMIN'] as const).map(r => (
              <button
                key={r}
                type="button"
                className="ws-pill"
                aria-pressed={roleFilter === r}
                onClick={() => setRoleFilter(r)}
              >
                {r === 'ALL' ? '전체 역할' : ROLE_LABEL[r]}
              </button>
            ))}
          </div>

          <div className="ws-filter-pills" role="group" aria-label="계정 상태 필터">
            {(['ALL', 'ACTIVE', 'SUSPENDED', 'WITHDRAWN'] as const).map(st => (
              <button
                key={st}
                type="button"
                className="ws-pill"
                aria-pressed={statusFilter === st}
                onClick={() => setStatusFilter(st)}
              >
                {st === 'ALL' ? '전체 상태' : USER_STATUS_LABEL[st]}
              </button>
            ))}
          </div>
        </div>

        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead>
              <tr>
                <th>회원 ID</th>
                <th>이름 / 이메일</th>
                <th>역할</th>
                <th>판매자 사업자 정보</th>
                <th>계정 상태</th>
                <th>가입일 / 탈퇴일</th>
                <th>계정 관리 (정지 / 삭제)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>
                    <strong>{user.name}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {user.email}
                    </div>
                  </td>
                  <td>
                    <span className="ws-option-tag">
                      <Icon name={user.role} />
                      <strong>{ROLE_LABEL[user.role]}</strong>
                    </span>
                  </td>
                  <td>
                    {user.sellerInfo ? (
                      <div style={{ fontSize: '12px' }}>
                        <strong>{user.sellerInfo.companyName}</strong> (대표: {user.sellerInfo.representativeName})
                        <div style={{ color: 'var(--muted)' }}>
                          사업자번호: {user.sellerInfo.businessNumber}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--muted)', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td>
                    <span className={`ws-badge ws-badge-${user.status}`}>
                      {USER_STATUS_LABEL[user.status]}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px' }}>
                      가입: {user.createdAt.slice(0, 10)}
                    </div>
                    {user.withdrawnAt && (
                      <div style={{ fontSize: '11.5px', color: '#8a1f17' }}>
                        탈퇴: {user.withdrawnAt.replace('T', ' ')}
                      </div>
                    )}
                  </td>
                  <td>
                    {user.role === 'ADMIN' ? (
                      <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 700 }}>
                        관리자 보호 계정
                      </span>
                    ) : user.status === 'WITHDRAWN' ? (
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        삭제(탈퇴) 완료됨
                      </span>
                    ) : (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="ws-btn ws-btn-sm"
                          onClick={() => handleToggleSuspend(user)}
                        >
                          {user.status === 'ACTIVE' ? '계정 정지' : '정지 해제'}
                        </button>
                        <button
                          type="button"
                          className="ws-btn ws-btn-sm ws-btn-danger"
                          onClick={() => setConfirmWithdrawUser(user)}
                        >
                          유저 삭제 (탈퇴)
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {confirmWithdrawUser && (
        <div className="ws-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="withdraw-modal-title">
          <div className="ws-modal" style={{ maxWidth: '480px' }}>
            <div className="ws-modal-header">
              <h2 id="withdraw-modal-title">유저 삭제 (탈퇴 처리) 확인</h2>
              <button
                type="button"
                className="ws-banner-close"
                onClick={() => setConfirmWithdrawUser(null)}
                aria-label="모달 닫기"
              >
                <Icon name="close" />
              </button>
            </div>
            <div style={{ fontSize: '13.5px', lineHeight: 1.6, color: '#262a26' }}>
              <p>
                <strong>{confirmWithdrawUser.name} ({confirmWithdrawUser.email})</strong> 계정을 삭제(탈퇴 처리)하시겠습니까?
              </p>
              <ul style={{ margin: '10px 0 0', paddingLeft: '18px', color: 'var(--muted)', fontSize: '12.5px' }}>
                <li>기존 주문 이력 보존을 위해 계정을 <strong>탈퇴</strong> 상태로 전환합니다.</li>
                <li>이름과 이메일 등 개인정보가 즉시 마스킹/비식별화 처리됩니다.</li>
                {confirmWithdrawUser.role === 'SELLER' && (
                  <li>판매자 계정이므로 소속된 상품이 모두 판매 종료 처리됩니다.</li>
                )}
              </ul>
            </div>
            <div className="ws-modal-actions">
              <button
                type="button"
                className="ws-btn"
                onClick={() => setConfirmWithdrawUser(null)}
              >
                취소
              </button>
              <button
                type="button"
                className="ws-btn ws-btn-danger"
                onClick={handleConfirmWithdraw}
              >
                유저 삭제(탈퇴) 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
