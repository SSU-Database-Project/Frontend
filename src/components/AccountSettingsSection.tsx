import { useEffect, useState, type FormEvent } from 'react'
import {
  changeAccountPassword,
  checkAccountWithdrawal,
  getAccountProfile,
  updateAccountProfile,
  withdrawMySellerOrUserAccount,
} from '../services/mockStore'
import type {
  AccountProfile,
  UserStatus,
  WithdrawalCheckResult,
} from '../types/commerce'
import type { Role } from '../types/role'
import Icon from './Icon'
import './WorkspaceLayout.css'

const ROLE_LABELS: Record<Role, string> = {
  USER: '일반회원 (구매자)',
  SELLER: '판매자',
  ADMIN: '관리자',
}

const STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: '정상 (이용 중)',
  SUSPENDED: '이용 정지',
  WITHDRAWN: '탈퇴',
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return '—'
  return iso.slice(0, 16).replace('T', ' ')
}

function formatBusinessNumber(num?: string | null): string {
  if (!num) return '—'
  const digits = num.replace(/\D/g, '')
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
  }
  return num
}

function formatPhoneNumber(raw?: string | null): string {
  if (!raw) return ''
  const digits = raw.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  if (digits.length === 10 && !digits.startsWith('010')) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`
}

type AccountSettingsSectionProps = {
  onUserUpdated?: (user: AccountProfile) => void
  onLogout: () => void
  onNotify?: (type: 'success' | 'error' | 'info', text: string) => void
}

export default function AccountSettingsSection({
  onUserUpdated,
  onLogout,
  onNotify,
}: AccountSettingsSectionProps) {
  const [profile, setProfile] = useState<AccountProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<string>('')

  // Profile form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [representativeName, setRepresentativeName] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileFeedback, setProfileFeedback] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Withdrawal modal state
  const [withdrawChecking, setWithdrawChecking] = useState(false)
  const [withdrawalCheck, setWithdrawalCheck] =
    useState<WithdrawalCheckResult | null>(null)
  const [withdrawPassword, setWithdrawPassword] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawError, setWithdrawError] = useState('')
  const [logoutNoticeModal, setLogoutNoticeModal] = useState<string | null>(
    null,
  )

  function applyProfile(next: AccountProfile) {
    setProfile(next)
    setName(next.name ?? '')
    setPhone(formatPhoneNumber(next.phone))
    setCompanyName(next.seller?.companyName ?? '')
    setRepresentativeName(next.seller?.representativeName ?? '')
  }

  async function fetchProfile() {
    setLoading(true)
    setLoadError('')
    try {
      const latest = await getAccountProfile()
      applyProfile(latest)
      onUserUpdated?.(latest)
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : '계정 정보를 불러오지 못했습니다.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    void getAccountProfile()
      .then(latest => {
        if (!active) return
        setProfile(latest)
        setName(latest.name ?? '')
        setPhone(formatPhoneNumber(latest.phone))
        setCompanyName(latest.seller?.companyName ?? '')
        setRepresentativeName(latest.seller?.representativeName ?? '')
        setLoadError('')
        setLoading(false)
      })
      .catch(err => {
        if (!active) return
        setLoadError(
          err instanceof Error
            ? err.message
            : '계정 정보를 불러오지 못했습니다.',
        )
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function handleProfileSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!profile || profileSaving) return
    setProfileFeedback(null)
    setProfileSaving(true)
    try {
      const updated = await updateAccountProfile({
        name,
        phone,
        seller:
          profile.role === 'SELLER'
            ? {
                companyName,
                representativeName,
              }
            : undefined,
      })
      applyProfile(updated)
      onUserUpdated?.(updated)
      const msg = '내 계정 정보가 수정되었습니다.'
      setProfileFeedback({ type: 'success', text: msg })
      onNotify?.('success', msg)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : '정보 수정에 실패했습니다.'
      setProfileFeedback({ type: 'error', text: msg })
      onNotify?.('error', msg)
    } finally {
      setProfileSaving(false)
    }
  }

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (passwordSaving) return
    setPasswordError('')
    setPasswordSaving(true)
    try {
      await changeAccountPassword({
        currentPassword,
        newPassword,
      })
      setLogoutNoticeModal(
        '비밀번호가 변경되어 로그아웃되었습니다. 새 비밀번호로 다시 로그인해 주세요.',
      )
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.'
      setPasswordError(msg)
      onNotify?.('error', msg)
    } finally {
      setPasswordSaving(false)
    }
  }

  async function handleOpenWithdrawalModal() {
    if (withdrawChecking) return
    setWithdrawChecking(true)
    setWithdrawError('')
    setWithdrawPassword('')
    try {
      const result = await checkAccountWithdrawal()
      setWithdrawalCheck(result)
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : '탈퇴 가능 여부를 확인하지 못했습니다.'
      onNotify?.('error', msg)
      setProfileFeedback({ type: 'error', text: msg })
    } finally {
      setWithdrawChecking(false)
    }
  }

  async function handleConfirmWithdrawal(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!withdrawalCheck?.canWithdraw || withdrawing) return
    if (!withdrawPassword) {
      setWithdrawError('본인 확인을 위해 비밀번호를 입력해 주세요.')
      return
    }
    setWithdrawError('')
    setWithdrawing(true)
    try {
      await withdrawMySellerOrUserAccount(withdrawPassword)
      setWithdrawalCheck(null)
      setLogoutNoticeModal(
        '회원 탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.',
      )
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : '회원 탈퇴 처리에 실패했습니다.'
      setWithdrawError(msg)
    } finally {
      setWithdrawing(false)
    }
  }

  if (loading && !profile) {
    return (
      <div className="ws-card" style={{ padding: '28px', textAlign: 'center' }}>
        <p role="status">계정 정보를 불러오고 있습니다…</p>
      </div>
    )
  }

  if (loadError && !profile) {
    return (
      <div className="ws-card" style={{ padding: '28px' }} role="alert">
        <p style={{ color: '#a12524', marginBottom: '12px' }}>{loadError}</p>
        <button
          type="button"
          className="ws-btn ws-btn-primary"
          onClick={() => void fetchProfile()}
        >
          다시 시도
        </button>
      </div>
    )
  }

  if (!profile) return null

  const statusKey: UserStatus = profile.status ?? 'ACTIVE'

  return (
    <div className="account-settings-wrap" style={{ display: 'grid', gap: '20px' }}>
      {/* 1. 계정 정보 요약 카드 */}
      <section className="ws-card" aria-label="내 계정 정보 확인">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', margin: 0 }}>계정 기본 정보</h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 0' }}>
              가입된 계정 상태와 회원 정보를 확인합니다.
            </p>
          </div>
          <span className={`ws-badge ws-badge-${statusKey}`}>
            {STATUS_LABELS[statusKey]}
          </span>
        </div>

        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '12px 20px',
            margin: 0,
            padding: '14px 16px',
            background: '#f7f6f2',
            borderRadius: '6px',
            border: '1px solid var(--line)',
            fontSize: '13.5px',
          }}
        >
          <div>
            <dt style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '3px' }}>
              계정명 (이메일)
            </dt>
            <dd style={{ margin: 0, fontWeight: 700 }}>{profile.email}</dd>
          </div>
          <div>
            <dt style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '3px' }}>
              이름
            </dt>
            <dd style={{ margin: 0, fontWeight: 700 }}>{profile.name}</dd>
          </div>
          <div>
            <dt style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '3px' }}>
              전화번호
            </dt>
            <dd style={{ margin: 0, fontWeight: 600 }}>
              {profile.phone ? formatPhoneNumber(profile.phone) : '미등록'}
            </dd>
          </div>
          <div>
            <dt style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '3px' }}>
              회원 종류
            </dt>
            <dd style={{ margin: 0, fontWeight: 600 }}>
              {ROLE_LABELS[profile.role]}
            </dd>
          </div>
          <div>
            <dt style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '3px' }}>
              계정 상태
            </dt>
            <dd style={{ margin: 0, fontWeight: 600 }}>
              {STATUS_LABELS[statusKey]}
            </dd>
          </div>
          <div>
            <dt style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '3px' }}>
              가입일
            </dt>
            <dd style={{ margin: 0, fontWeight: 600 }}>
              {formatDateTime(profile.createdAt)}
            </dd>
          </div>
          {profile.role === 'SELLER' && profile.seller && (
            <>
              <div>
                <dt style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '3px' }}>
                  상호명
                </dt>
                <dd style={{ margin: 0, fontWeight: 700 }}>
                  {profile.seller.companyName}
                </dd>
              </div>
              <div>
                <dt style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '3px' }}>
                  대표자명
                </dt>
                <dd style={{ margin: 0, fontWeight: 700 }}>
                  {profile.seller.representativeName}
                </dd>
              </div>
              <div>
                <dt style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '3px' }}>
                  사업자등록번호 (고정)
                </dt>
                <dd style={{ margin: 0, fontWeight: 600 }}>
                  {formatBusinessNumber(profile.seller.businessNumber)}
                </dd>
              </div>
            </>
          )}
        </dl>
      </section>

      {/* 2. 내 정보 수정 & 비밀번호 변경 2열 그리드 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* 내 정보 수정 */}
        <section className="ws-card" aria-label="내 정보 수정">
          <div>
            <h2 style={{ fontSize: '17px', margin: '0 0 6px' }}>내 정보 수정</h2>
            <p
              style={{
                fontSize: '12.5px',
                color: 'var(--muted)',
                margin: 0,
                lineHeight: 1.5,
                minHeight: '38px',
              }}
            >
              이름과 연락처를 수정할 수 있습니다 (전화번호 칸을 비우고 저장하면 삭제됩니다).
              {profile.role === 'SELLER' &&
                ' 판매자는 상호명과 대표자명도 수정할 수 있습니다.'}
            </p>
          </div>

          <form
            onSubmit={handleProfileSubmit}
            style={{ display: 'grid', gap: '14px' }}
          >
            <div className="ws-field">
              <label htmlFor="acc-name">이름 *</label>
              <input
                id="acc-name"
                className="ws-input"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={50}
                required
              />
            </div>

            <div className="ws-field">
              <label htmlFor="acc-phone">전화번호 (선택 · 비우면 삭제)</label>
              <input
                id="acc-phone"
                className="ws-input"
                type="tel"
                inputMode="numeric"
                maxLength={13}
                value={phone}
                onChange={e => setPhone(formatPhoneNumber(e.target.value))}
                placeholder="010-0000-0000"
                pattern="^$|^01[0-9]-[0-9]{3,4}-[0-9]{4}$"
                title="010-0000-0000 형식으로 입력하거나 비워 두세요."
              />
            </div>

            {profile.role === 'SELLER' && (
              <>
                <div className="ws-field">
                  <label htmlFor="acc-company">상호명 *</label>
                  <input
                    id="acc-company"
                    className="ws-input"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="ws-field">
                  <label htmlFor="acc-rep">대표자명 *</label>
                  <input
                    id="acc-rep"
                    className="ws-input"
                    value={representativeName}
                    onChange={e => setRepresentativeName(e.target.value)}
                    maxLength={50}
                    required
                  />
                </div>

                <div className="ws-field">
                  <label htmlFor="acc-biznum">사업자등록번호 (변경 불가)</label>
                  <input
                    id="acc-biznum"
                    className="ws-input"
                    value={formatBusinessNumber(profile.seller?.businessNumber)}
                    disabled
                    readOnly
                  />
                </div>
              </>
            )}

            {profileFeedback && (
              <p
                role={profileFeedback.type === 'error' ? 'alert' : 'status'}
                style={{
                  margin: 0,
                  fontSize: '13px',
                  color:
                    profileFeedback.type === 'error' ? '#a12524' : '#1b5e20',
                  fontWeight: 600,
                }}
              >
                {profileFeedback.text}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                type="submit"
                className="ws-btn ws-btn-primary"
                disabled={profileSaving}
              >
                {profileSaving ? '저장 중…' : '정보 수정 저장'}
              </button>
            </div>
          </form>
        </section>

        {/* 비밀번호 변경 */}
        <section className="ws-card" aria-label="비밀번호 변경">
          <div>
            <h2 style={{ fontSize: '17px', margin: '0 0 6px' }}>비밀번호 변경</h2>
            <p
              style={{
                fontSize: '12.5px',
                color: 'var(--muted)',
                margin: 0,
                lineHeight: 1.5,
                minHeight: '38px',
              }}
            >
              현재 비밀번호를 확인한 뒤 새 비밀번호(8~64자)로 변경합니다. 변경 즉시 로그아웃되며 새 비밀번호로 다시 로그인해야 합니다.
            </p>
          </div>

          <form
            onSubmit={handlePasswordSubmit}
            style={{ display: 'grid', gap: '14px' }}
          >
            <div className="ws-field">
              <label htmlFor="acc-cur-pw">현재 비밀번호 *</label>
              <input
                id="acc-cur-pw"
                className="ws-input"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="ws-field">
              <label htmlFor="acc-new-pw">새 비밀번호 (8~64자) *</label>
              <input
                id="acc-new-pw"
                className="ws-input"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                minLength={8}
                maxLength={64}
                placeholder="8~64자 입력"
                required
              />
            </div>

            {passwordError && (
              <p
                role="alert"
                style={{
                  margin: 0,
                  fontSize: '13px',
                  color: '#a12524',
                  fontWeight: 600,
                }}
              >
                {passwordError}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                type="submit"
                className="ws-btn ws-btn-primary"
                disabled={passwordSaving}
              >
                {passwordSaving ? '변경 중…' : '비밀번호 변경 (로그아웃)'}
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* 3. 회원 탈퇴 */}
      {profile.role !== 'ADMIN' && (
        <section
          className="ws-card"
          aria-label="회원 탈퇴"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '16px', margin: '0 0 4px', color: '#8a1f17' }}>
              회원 탈퇴
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', margin: 0 }}>
              {profile.role === 'SELLER'
                ? '처리 중인 주문(주문완료·배송준비·배송중)이 있으면 탈퇴할 수 없으며, 탈퇴 시 등록한 상품이 모두 판매 종료됩니다.'
                : '진행 중인 주문이 있어도 탈퇴할 수 있으며, 주문한 상품의 배송은 판매자가 계속 진행합니다.'}
            </p>
          </div>
          <button
            type="button"
            className="ws-btn ws-btn-danger"
            disabled={withdrawChecking}
            onClick={() => void handleOpenWithdrawalModal()}
          >
            {withdrawChecking ? '확인 중…' : '회원 탈퇴'}
          </button>
        </section>
      )}

      {/* 회원 탈퇴 확인 팝업 모달 */}
      {withdrawalCheck && (
        <div
          className="ws-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="self-withdraw-modal-title"
        >
          <div className="ws-modal" style={{ maxWidth: '460px' }}>
            <div className="ws-modal-header">
              <h2 id="self-withdraw-modal-title">회원 탈퇴 확인</h2>
              <button
                type="button"
                className="ws-banner-close"
                onClick={() => setWithdrawalCheck(null)}
                aria-label="팝업 닫기"
              >
                <Icon name="close" />
              </button>
            </div>

            <div
              className={`ws-banner ${
                withdrawalCheck.canWithdraw ? 'ws-banner-info' : 'ws-banner-error'
              }`}
              style={{ marginBottom: '12px' }}
            >
              <div className="ws-banner-text">
                <Icon name="alert" />
                <span>{withdrawalCheck.message}</span>
              </div>
            </div>

            {withdrawalCheck.canWithdraw ? (
              <form onSubmit={handleConfirmWithdrawal} style={{ display: 'grid', gap: '14px' }}>
                <div className="ws-field">
                  <label htmlFor="withdraw-confirm-pw">
                    비밀번호 재입력 *
                  </label>
                  <input
                    id="withdraw-confirm-pw"
                    className="ws-input"
                    type="password"
                    autoComplete="current-password"
                    placeholder="본인 확인을 위해 비밀번호를 입력해 주세요"
                    value={withdrawPassword}
                    onChange={e => setWithdrawPassword(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                {withdrawError && (
                  <p
                    role="alert"
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      color: '#a12524',
                      fontWeight: 600,
                    }}
                  >
                    {withdrawError}
                  </p>
                )}

                <div className="ws-modal-actions">
                  <button
                    type="button"
                    className="ws-btn"
                    disabled={withdrawing}
                    onClick={() => setWithdrawalCheck(null)}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="ws-btn ws-btn-danger"
                    disabled={withdrawing}
                  >
                    {withdrawing ? '탈퇴 처리 중…' : '회원 탈퇴 확정'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="ws-modal-actions">
                <button
                  type="button"
                  className="ws-btn ws-btn-primary"
                  onClick={() => setWithdrawalCheck(null)}
                >
                  확인
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {logoutNoticeModal && (
        <div
          className="ws-modal-backdrop"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="logout-notice-modal-title"
        >
          <div className="ws-modal" style={{ maxWidth: '440px' }}>
            <div className="ws-modal-header">
              <h2 id="logout-notice-modal-title">계정 안내</h2>
            </div>
            <div className="ws-banner ws-banner-info" style={{ marginBottom: '4px' }}>
              <div className="ws-banner-text">
                <Icon name="check" />
                <span>{logoutNoticeModal}</span>
              </div>
            </div>
            <div className="ws-modal-actions">
              <button
                type="button"
                className="ws-btn ws-btn-primary"
                onClick={() => {
                  setLogoutNoticeModal(null)
                  onLogout()
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
