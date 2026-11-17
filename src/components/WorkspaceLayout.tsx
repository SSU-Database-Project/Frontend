import { useEffect, type ReactNode } from 'react'
import { IS_MOCK_MODE } from '../services/api'
import Icon, { type IconName } from './Icon'
import type { Role } from '../types/role'
import './WorkspaceLayout.css'

export type WorkspaceNavItem<T extends string> = {
  id: T
  label: string
  caption: string
  icon: IconName
  badgeCount?: number
}

type WorkspaceLayoutProps<T extends string> = {
  role: Extract<Role, 'SELLER' | 'ADMIN'>
  roleTitle: string
  accountLabel: string
  navItems: WorkspaceNavItem<T>[]
  activeTab: T
  onTabChange: (tab: T) => void
  onAcknowledgeActiveTab?: () => void
  onLogout: () => void
  onResetDemoData: () => void
  bannerMessage?: { type: 'success' | 'error' | 'info'; text: string } | null
  onClearBanner?: () => void
  children: ReactNode
}

export default function WorkspaceLayout<T extends string>({
  role,
  roleTitle,
  accountLabel,
  navItems,
  activeTab,
  onTabChange,
  onAcknowledgeActiveTab,
  onLogout,
  onResetDemoData,
  bannerMessage,
  onClearBanner,
  children,
}: WorkspaceLayoutProps<T>) {
  const currentItem = navItems.find(item => item.id === activeTab)

  useEffect(() => {
    const titleText = currentItem
      ? `${currentItem.label} - ${roleTitle} | SEAM`
      : `${roleTitle} | SEAM`
    document.title = titleText
  }, [currentItem, roleTitle])

  return (
    <div className="ws-shell">
      <header className="ws-header">
        <div className="ws-brand-group">
          <div className="wordmark" aria-label="SEAM">
            SEAM<span className="brand-stitch" aria-hidden="true" />
          </div>
          <span className="ws-role-chip" data-role={role}>
            <Icon name={role} />
            <strong>{roleTitle}</strong>
            <span className="ws-account-divider" aria-hidden="true">·</span>
            <span>{accountLabel}</span>
          </span>
        </div>

        <div className="ws-header-actions">
          {IS_MOCK_MODE && (
            <button
              type="button"
              className="ws-ghost-btn"
              onClick={onResetDemoData}
              title="초기 시연 데이터로 복원"
            >
              <Icon name="refresh" />
              <span>시연 데이터 초기화</span>
            </button>
          )}
          <button type="button" className="ws-switch-role-btn" onClick={onLogout}>
            <Icon name="back" />
            <span>로그아웃</span>
          </button>
        </div>
      </header>

      <div className="ws-body">
        <aside className="ws-sidebar" aria-label={`${roleTitle} 메뉴`}>
          <nav className="ws-nav">
            {navItems.map(item => {
              const active = item.id === activeTab
              return (
                <button
                  key={item.id}
                  type="button"
                  className="ws-nav-item"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => onTabChange(item.id)}
                >
                  <span className="ws-nav-icon">
                    <Icon name={item.icon} />
                  </span>
                  <span className="ws-nav-copy">
                    <strong>{item.label}</strong>
                    <small>{item.caption}</small>
                  </span>
                  {item.badgeCount !== undefined && item.badgeCount > 0 && (
                    <span className="ws-nav-badge">{item.badgeCount}</span>
                  )}
                </button>
              )
            })}
          </nav>

          <div className="ws-sidebar-note">
            <strong>{role === 'ADMIN' ? '플랫폼 심사 및 운영 안내' : '판매자 운영 안내'}</strong>
            <p>
              {role === 'ADMIN'
                ? '판매자가 신청·수정한 브랜드 및 상품 내역이 실시간으로 접수되며, 심사 결과는 해당 판매자에게 즉시 반영됩니다.'
                : '신청·수정한 브랜드 및 상품은 관리자 심사 완료 후 쇼핑몰에 반영되며, 진행 상태가 실시간으로 업데이트됩니다.'}
            </p>
          </div>
        </aside>

        <main
          className="ws-main"
          onClick={() => {
            if (currentItem?.badgeCount && currentItem.badgeCount > 0) {
              onAcknowledgeActiveTab?.()
            }
          }}
        >
          {bannerMessage && (
            <div className={`ws-banner ws-banner-${bannerMessage.type}`} role="status">
              <div className="ws-banner-text">
                <Icon name={bannerMessage.type === 'error' ? 'alert' : 'check'} />
                <span>{bannerMessage.text}</span>
              </div>
              {onClearBanner && (
                <button
                  type="button"
                  className="ws-banner-close"
                  onClick={onClearBanner}
                  aria-label="알림 닫기"
                >
                  <Icon name="close" />
                </button>
              )}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
