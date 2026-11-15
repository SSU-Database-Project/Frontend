import { useCallback, useEffect, useState } from 'react'
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

export type SellerTab = 'brands' | 'products' | 'inventory' | 'orders' | 'stats'

export default function SellerWorkspace({ onBack }: { onBack: () => void }) {
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
      const [nextBrands, nextProducts, nextHistory, nextShipments] =
        await Promise.all([
          getSellerBrands(),
          getSellerProducts(),
          getStockHistory(),
          getSellerShipments(),
        ])
      setBrands(nextBrands)
      setProducts(nextProducts)
      setStockHistory(nextHistory)
      setShipments(nextShipments)
      setUnread(getUnreadChanges().SELLER)
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
    clearSellerTabBadge(activeTab)
    let active = true
    void Promise.all([
      getSellerBrands(),
      getSellerProducts(),
      getStockHistory(),
      getSellerShipments(),
    ])
      .then(([nextBrands, nextProducts, nextHistory, nextShipments]) => {
        if (!active) return
        setBrands(nextBrands)
        setProducts(nextProducts)
        setStockHistory(nextHistory)
        setShipments(nextShipments)
        setUnread(getUnreadChanges().SELLER)
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
    clearSellerTabBadge(activeTab)
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
  ]

  return (
    <WorkspaceLayout
      role="SELLER"
      roleTitle="판매자 센터"
      accountLabel="(주)심스튜디오 · 김도현"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={tab => {
        clearSellerTabBadge(tab)
        setPreselectedBrandId(null)
        setPreselectedProductId(null)
        setActiveTab(tab)
        setBanner(null)
        void refresh()
      }}
      onAcknowledgeActiveTab={() => {
        clearSellerTabBadge(activeTab)
        void refresh()
      }}
      onBackToRoles={onBack}
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
    </WorkspaceLayout>
  )
}
