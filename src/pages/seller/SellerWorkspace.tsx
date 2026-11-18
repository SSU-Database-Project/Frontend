import { useCallback, useEffect, useState } from 'react'
import AccountSettingsSection from '../../components/AccountSettingsSection'
import WorkspaceLayout, { type WorkspaceNavItem } from '../../components/WorkspaceLayout'
import {
  clearSellerTabBadge,
  getSellerBrands,
  getSellerProducts,
  getSellerShipments,
  getStockHistory,
  getUnreadChanges,
  resetMockStore,
} from '../../services/mockStore'
import type {
  Brand,
  Product,
  SellerShipment,
  StockHistoryItem,
} from '../../types/commerce'
import SellerBrandsTab from './SellerBrandsTab'
import SellerInventoryTab from './SellerInventoryTab'
import SellerOrdersTab from './SellerOrdersTab'
import SellerProductsTab from './SellerProductsTab'
import SellerStatsTab from './SellerStatsTab'

export type SellerTab = 'brands' | 'products' | 'inventory' | 'orders' | 'stats' | 'account'

export default function SellerWorkspace({ accountLabel, onLogout }: { accountLabel: string; onLogout: () => void }) {
  const [displayLabel, setDisplayLabel] = useState(accountLabel)
  const [activeTab, setActiveTab] = useState<SellerTab>(() => {
    clearSellerTabBadge('brands')
    return 'brands'
  })
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stockHistory, setStockHistory] = useState<StockHistoryItem[]>([])
  const [shipments, setShipments] = useState<SellerShipment[]>([])
  const [unread, setUnread] = useState(() => getUnreadChanges().SELLER)
  const [banner, setBanner] = useState<{
    type: 'success' | 'error' | 'info'
    text: string
  } | null>(null)

  const [preselectedBrandId, setPreselectedBrandId] = useState<number | null>(null)
  const [preselectedProductId, setPreselectedProductId] = useState<number | null>(null)

  const refresh = useCallback(async () => {
    try {
      const [nextBrands, nextProducts, nextShipments] = await Promise.all([
        getSellerBrands(),
        getSellerProducts(),
        getSellerShipments(),
      ])
      setBrands(nextBrands)
      setProducts(nextProducts)
      setShipments(nextShipments)
      setUnread(getUnreadChanges().SELLER)
      const nextHistory = await getStockHistory(undefined, undefined, nextProducts)
      setStockHistory(nextHistory)
    } catch (err) {
      setBanner({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : '백엔드 서버에서 판매자 데이터를 불러오지 못했습니다.',
      })
    }
  }, [])

  useEffect(() => {
    if (activeTab !== 'account') {
      clearSellerTabBadge(activeTab)
    }
    let active = true
    void Promise.all([
      getSellerBrands(),
      getSellerProducts(),
      getSellerShipments(),
    ])
      .then(async ([nextBrands, nextProducts, nextShipments]) => {
        if (!active) return
        setBrands(nextBrands)
        setProducts(nextProducts)
        setShipments(nextShipments)
        setUnread(getUnreadChanges().SELLER)
        const nextHistory = await getStockHistory(undefined, undefined, nextProducts)
        if (!active) return
        setStockHistory(nextHistory)
      })
      .catch(err => {
        if (!active) return
        setBanner({
          type: 'error',
          text:
            err instanceof Error
              ? err.message
              : '백엔드 서버에서 판매자 데이터를 불러오지 못했습니다.',
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
      clearSellerTabBadge(activeTab)
    }
    void refresh()
    notify('info', '시연 데이터가 초기 상태로 복원되었습니다.')
  }

  const navItems: WorkspaceNavItem<SellerTab>[] = [
    {
      id: 'brands',
      label: '브랜드 관리',
      caption: '브랜드 등록 및 승인 상태',
      icon: 'brand',
      badgeCount: unread.brands,
    },
    {
      id: 'products',
      label: '상품 관리',
      caption: '상품 신청·수정·품절 전환',
      icon: 'product',
      badgeCount: unread.products,
    },
    {
      id: 'inventory',
      label: '재고·이력 관리',
      caption: '옵션별 입고·조정 및 로그',
      icon: 'stock',
      badgeCount: unread.inventory,
    },
    {
      id: 'orders',
      label: '주문·배송 관리',
      caption: '배송 상태 선택 및 구매확정',
      icon: 'order',
      badgeCount: unread.orders,
    },
    {
      id: 'stats',
      label: '판매 통계',
      caption: '일/주/월 매출 및 TOP 상품',
      icon: 'chart',
      badgeCount: unread.stats,
    },
    {
      id: 'account',
      label: '마이페이지 (계정 관리)',
      caption: '내 정보·상호 수정 및 회원 탈퇴',
      icon: 'SELLER',
    },
  ]

  return (
    <WorkspaceLayout
      role="SELLER"
      roleTitle="판매자 센터"
      accountLabel={displayLabel}
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={tab => {
        if (tab !== 'account') {
          clearSellerTabBadge(tab)
        }
        setPreselectedBrandId(null)
        setPreselectedProductId(null)
        setActiveTab(tab)
        setBanner(null)
        void refresh()
      }}
      onAcknowledgeActiveTab={() => {
        if (activeTab !== 'account') {
          clearSellerTabBadge(activeTab)
        }
        void refresh()
      }}
      onLogout={onLogout}
      onResetDemoData={handleResetDemo}
      bannerMessage={banner}
      onClearBanner={() => setBanner(null)}
    >
      {activeTab === 'brands' && (
        <SellerBrandsTab
          brands={brands}
          onRefresh={refresh}
          onNotify={notify}
          onGoToProductCreate={targetBrandId => {
            clearSellerTabBadge('products')
            setPreselectedBrandId(targetBrandId)
            setActiveTab('products')
            void refresh()
          }}
        />
      )}

      {activeTab === 'products' && (
        <SellerProductsTab
          brands={brands}
          products={products}
          preselectedBrandId={preselectedBrandId}
          onRefresh={refresh}
          onNotify={notify}
          onGoToInventory={targetProductId => {
            clearSellerTabBadge('inventory')
            setPreselectedProductId(targetProductId)
            setActiveTab('inventory')
            void refresh()
          }}
        />
      )}

      {activeTab === 'inventory' && (
        <SellerInventoryTab
          products={products}
          stockHistory={stockHistory}
          preselectedProductId={preselectedProductId}
          onRefresh={refresh}
          onNotify={notify}
        />
      )}

      {activeTab === 'orders' && (
        <SellerOrdersTab
          shipments={shipments}
          onRefresh={refresh}
          onNotify={notify}
        />
      )}

      {activeTab === 'stats' && (
        <SellerStatsTab
          brands={brands}
          products={products}
          shipments={shipments}
        />
      )}

      {activeTab === 'account' && (
        <>
          <div className="ws-page-header">
            <div>
              <h1>마이페이지 (판매자 계정 관리)</h1>
              <p>
                판매자 계정 정보(이름·전화번호·상호명·대표자명)를 확인·수정하고, 비밀번호 변경 및 회원 탈퇴를 수행합니다.
              </p>
            </div>
          </div>
          <AccountSettingsSection
            onUserUpdated={updated => setDisplayLabel(updated.name)}
            onLogout={onLogout}
            onNotify={notify}
          />
        </>
      )}
    </WorkspaceLayout>
  )
}
