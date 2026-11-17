import { useCallback, useEffect, useState } from 'react'
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

export type AdminTab = 'brands' | 'products' | 'users' | 'stats'

export default function AdminWorkspace({ onBack }: { onBack: () => void }) {
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
    clearAdminTabBadge(activeTab)
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
    clearAdminTabBadge(activeTab)
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
        void refresh()
      }}
      onAcknowledgeActiveTab={() => {
        clearAdminTabBadge(activeTab)
        void refresh()
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
