import { useCallback, useEffect, useState } from 'react'
import AccountSettingsSection from '../../components/AccountSettingsSection'
import WorkspaceLayout, { type WorkspaceNavItem } from '../../components/WorkspaceLayout'
import {
  clearAdminTabBadge,
  getAdminBrands,
  getAdminProducts,
  getAdminUsers,
  getUnreadChanges,
  resetMockStore,
} from '../../services/mockStore'
import type { Brand, Product, UserItem } from '../../types/commerce'
import AdminBrandsTab from './AdminBrandsTab'
import AdminProductsTab from './AdminProductsTab'
import AdminStatsTab from './AdminStatsTab'
import AdminUsersTab from './AdminUsersTab'

export type AdminTab = 'brands' | 'products' | 'users' | 'stats' | 'account'

export default function AdminWorkspace({ accountLabel, onLogout }: { accountLabel: string; onLogout: () => void }) {
  const [displayLabel, setDisplayLabel] = useState(accountLabel)
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    clearAdminTabBadge('brands')
    return 'brands'
  })
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<UserItem[]>([])
  const [unread, setUnread] = useState(() => getUnreadChanges().ADMIN)
  const [banner, setBanner] = useState<{
    type: 'success' | 'error' | 'info'
    text: string
  } | null>(null)

  const refresh = useCallback(async () => {
    try {
      const [nextBrands, nextProducts, nextUsers] = await Promise.all([
        getAdminBrands(),
        getAdminProducts(),
        getAdminUsers(),
      ])
      setBrands(nextBrands)
      setProducts(nextProducts)
      setUsers(nextUsers)
      setUnread(getUnreadChanges().ADMIN)
    } catch (err) {
      setBanner({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : '백엔드 서버에서 관리자 데이터를 불러오지 못했습니다.',
      })
    }
  }, [])

  useEffect(() => {
    if (activeTab !== 'account') {
      clearAdminTabBadge(activeTab)
    }
    let active = true
    void Promise.all([
      getAdminBrands(),
      getAdminProducts(),
      getAdminUsers(),
    ])
      .then(([nextBrands, nextProducts, nextUsers]) => {
        if (!active) return
        setBrands(nextBrands)
        setProducts(nextProducts)
        setUsers(nextUsers)
        setUnread(getUnreadChanges().ADMIN)
      })
      .catch(err => {
        if (!active) return
        setBanner({
          type: 'error',
          text:
            err instanceof Error
              ? err.message
              : '백엔드 서버에서 관리자 데이터를 불러오지 못했습니다.',
        })
      })
    return () => {
      active = false
    }
  }, [activeTab])

  function notify(type: 'success' | 'error' | 'info', text: string) {
    setBanner({ type, text })
  }

  function handleResetDemo() {
    resetMockStore()
    if (activeTab !== 'account') {
      clearAdminTabBadge(activeTab)
    }
    void refresh()
    notify('info', '시연 데이터가 초기 상태로 복원되었습니다.')
  }

  const navItems: WorkspaceNavItem<AdminTab>[] = [
    {
      id: 'brands',
      label: '브랜드 승인·관리',
      caption: '신청 브랜드 승인 및 반려',
      icon: 'brand',
      badgeCount: unread.brands,
    },
    {
      id: 'products',
      label: '상품 승인·관리',
      caption: '상품 승인·거절 및 차단',
      icon: 'product',
      badgeCount: unread.products,
    },
    {
      id: 'users',
      label: '유저(회원) 관리',
      caption: '계정 정지·해제 및 탈퇴 처리',
      icon: 'users',
      badgeCount: unread.users,
    },
    {
      id: 'stats',
      label: '플랫폼 전체 통계',
      caption: '전체 거래액 및 브랜드 실적',
      icon: 'chart',
      badgeCount: unread.stats,
    },
    {
      id: 'account',
      label: '마이페이지 (내 계정)',
      caption: '관리자 계정 정보 및 비밀번호 변경',
      icon: 'ADMIN',
    },
  ]

  return (
    <WorkspaceLayout
      role="ADMIN"
      roleTitle="관리자 콘솔"
      accountLabel={displayLabel}
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={tab => {
        if (tab !== 'account') {
          clearAdminTabBadge(tab)
        }
        setActiveTab(tab)
        setBanner(null)
        void refresh()
      }}
      onAcknowledgeActiveTab={() => {
        if (activeTab !== 'account') {
          clearAdminTabBadge(activeTab)
        }
        void refresh()
      }}
      onLogout={onLogout}
      onResetDemoData={handleResetDemo}
      bannerMessage={banner}
      onClearBanner={() => setBanner(null)}
    >
      {activeTab === 'brands' && (
        <AdminBrandsTab
          brands={brands}
          onRefresh={refresh}
          onNotify={notify}
        />
      )}

      {activeTab === 'products' && (
        <AdminProductsTab
          products={products}
          onRefresh={refresh}
          onNotify={notify}
        />
      )}

      {activeTab === 'users' && (
        <AdminUsersTab
          users={users}
          onRefresh={refresh}
          onNotify={notify}
        />
      )}

      {activeTab === 'stats' && (
        <AdminStatsTab
          brands={brands}
          products={products}
          users={users}
        />
      )}

      {activeTab === 'account' && (
        <>
          <div className="ws-page-header">
            <div>
              <h1>마이페이지 (관리자 계정 정보)</h1>
              <p>
                관리자 계정 정보를 확인·수정하고 비밀번호를 변경합니다.
              </p>
            </div>
          </div>
          <AccountSettingsSection
            onUserUpdated={updated => setDisplayLabel(updated.email)}
            onLogout={onLogout}
            onNotify={notify}
          />
        </>
      )}
    </WorkspaceLayout>
  )
}
