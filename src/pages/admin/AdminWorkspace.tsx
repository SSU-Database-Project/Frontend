import { useEffect, useState } from 'react'
import WorkspaceLayout, { type WorkspaceNavItem } from '../../components/WorkspaceLayout'
import {
  clearAdminTabBadge,
  getAdminBrands,
  getAdminProducts,
  getAdminUsers,
  getUnreadChanges,
  resetMockStore,
} from '../../services/mockStore'
import AdminBrandsTab from './AdminBrandsTab'
import AdminProductsTab from './AdminProductsTab'
import AdminStatsTab from './AdminStatsTab'
import AdminUsersTab from './AdminUsersTab'

export type AdminTab = 'brands' | 'products' | 'users' | 'stats'

export default function AdminWorkspace({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    clearAdminTabBadge('brands')
    return 'brands'
  })
  const [version, setVersion] = useState(0)
  const [banner, setBanner] = useState<{
    type: 'success' | 'error' | 'info'
    text: string
  } | null>(null)

  useEffect(() => {
    clearAdminTabBadge(activeTab)
  }, [activeTab])

  void version
  const brands = getAdminBrands()
  const products = getAdminProducts()
  const users = getAdminUsers()
  const unread = getUnreadChanges().ADMIN

  function refresh() {
    setVersion(v => v + 1)
  }

  function notify(type: 'success' | 'error' | 'info', text: string) {
    setBanner({ type, text })
  }

  function handleResetDemo() {
    resetMockStore()
    clearAdminTabBadge(activeTab)
    refresh()
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
  ]

  return (
    <WorkspaceLayout
      role="ADMIN"
      roleTitle="관리자 콘솔"
      accountLabel="admin@seam.kr · 플랫폼 총괄"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={tab => {
        clearAdminTabBadge(tab)
        setActiveTab(tab)
        setBanner(null)
        refresh()
      }}
      onAcknowledgeActiveTab={() => {
        clearAdminTabBadge(activeTab)
        refresh()
      }}
      onBackToRoles={onBack}
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
    </WorkspaceLayout>
  )
}
