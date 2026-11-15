import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import Icon from '../../components/Icon'
import {
  createSellerProduct,
  deleteSellerProduct,
  getCatalogData,
  updateSellerProduct,
  updateSellerProductSaleStatus,
  type ProductOptionInput,
} from '../../services/mockStore'
import type { Brand, Gender, Product, ProductStatus } from '../../types/commerce'

const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  PENDING: '승인 대기',
  ON_SALE: '판매중',
  SOLD_OUT: '품절(수동)',
  REJECTED: '승인 거절',
  BLOCKED: '관리자 차단',
  DELETED: '삭제됨',
}

const GENDER_LABEL: Record<Gender, string> = {
  UNISEX: '공용',
  MALE: '남성',
  FEMALE: '여성',
}

type SellerProductsTabProps = {
  brands: Brand[]
  products: Product[]
  preselectedBrandId?: number | null
  onRefresh: () => void
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void
  onGoToInventory: (productId: number) => void
}

export default function SellerProductsTab({
  brands,
  products,
  preselectedBrandId,
  onRefresh,
  onNotify,
  onGoToInventory,
}: SellerProductsTabProps) {
  const catalog = getCatalogData()
  const approvedBrands = brands.filter(b => b.status === 'APPROVED')

  const [statusFilter, setStatusFilter] = useState<'ALL' | ProductStatus>('ALL')
  const [brandFilter, setBrandFilter] = useState<number | 'ALL'>('ALL')
  const [keyword, setKeyword] = useState('')

  // 모달(등록/수정 폼) 상태
  const [formOpen, setFormOpen] = useState<boolean>(() =>
    Boolean(
      preselectedBrandId &&
        approvedBrands.some(b => b.id === preselectedBrandId),
    ),
  )
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)

  function showModalError(message: string) {
    setModalError(message)
    modalRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const [brandId, setBrandId] = useState<number>(
    () => preselectedBrandId ?? approvedBrands[0]?.id ?? 0,
  )
  const [rootCategoryId, setRootCategoryId] = useState<number>(catalog.rootCategories[0].id)
  const [categoryId, setCategoryId] = useState<number>(catalog.leafCategories[0].id)
  const [name, setName] = useState('')
  const [productCode, setProductCode] = useState('')
  const [gender, setGender] = useState<Gender>('UNISEX')
  const [season, setSeason] = useState('26FW')
  const [shipDays, setShipDays] = useState(2)
  const [price, setPrice] = useState(89000)
  const [imageUrl, setImageUrl] = useState(catalog.sampleImages[0].url)
  const [options, setOptions] = useState<ProductOptionInput[]>(() => [
    {
      colorId: catalog.colors[0].id,
      sizeId: catalog.sizes[0].id,
      stockQuantity: 15,
    },
  ])

  // 옵션 추가 빌더 입력값
  const [draftColorId, setDraftColorId] = useState<number>(catalog.colors[0].id)
  const [draftSizeId, setDraftSizeId] = useState<number>(catalog.sizes[0].id)
  const [draftStock, setDraftStock] = useState<number>(15)

  const currentLeaf =
    catalog.leafCategories.find(c => c.id === categoryId) ?? catalog.leafCategories[0]
  const availableSizes = catalog.sizes.filter(
    s => s.sizeGroup === currentLeaf.sizeGroup,
  )

  function syncCategoryAndSizes(nextLeafId: number, resetOptions: boolean) {
    const leaf = catalog.leafCategories.find(c => c.id === nextLeafId)
    if (!leaf) return
    setCategoryId(leaf.id)
    if (leaf.parentId) setRootCategoryId(leaf.parentId)
    const sizesForGroup = catalog.sizes.filter(s => s.sizeGroup === leaf.sizeGroup)
    const firstSizeId = sizesForGroup[0]?.id ?? 1
    setDraftSizeId(firstSizeId)
    if (resetOptions) {
      setOptions([
        {
          colorId: catalog.colors[0].id,
          sizeId: firstSizeId,
          stockQuantity: 15,
        },
      ])
    }
  }

  function openCreateModal(defaultBrandId?: number) {
    if (approvedBrands.length === 0) {
      onNotify(
        'error',
        '승인 완료된 브랜드가 없습니다. 먼저 브랜드를 등록하고 관리자 승인을 받아주세요.',
      )
      return
    }
    const targetBrandId = defaultBrandId ?? approvedBrands[0].id
    const defaultLeaf = catalog.leafCategories[0]
    const defaultSizes = catalog.sizes.filter(
      s => s.sizeGroup === defaultLeaf.sizeGroup,
    )
    setEditingProduct(null)
    setModalError(null)
    setBrandId(targetBrandId)
    setRootCategoryId(defaultLeaf.parentId ?? catalog.rootCategories[0].id)
    setCategoryId(defaultLeaf.id)
    setName('')
    setProductCode('')
    setGender('UNISEX')
    setSeason('26FW')
    setShipDays(2)
    setPrice(89000)
    setImageUrl(catalog.sampleImages[0].url)
    setDraftColorId(catalog.colors[0].id)
    setDraftSizeId(defaultSizes[0]?.id ?? 1)
    setDraftStock(15)
    setOptions([
      {
        colorId: catalog.colors[0].id,
        sizeId: defaultSizes[0]?.id ?? 1,
        stockQuantity: 15,
      },
    ])
    setFormOpen(true)
  }

  function openEditModal(product: Product) {
    const leaf = catalog.leafCategories.find(c => c.id === product.categoryId)
    const sizesForGroup = catalog.sizes.filter(
      s => s.sizeGroup === (leaf?.sizeGroup ?? product.sizeGroup),
    )
    setEditingProduct(product)
    setModalError(null)
    setBrandId(product.brandId)
    setRootCategoryId(leaf?.parentId ?? catalog.rootCategories[0].id)
    setCategoryId(product.categoryId)
    setName(product.name)
    setProductCode(product.productCode)
    setGender(product.gender)
    setSeason(product.season)
    setShipDays(product.shipDays)
    setPrice(product.price)
    setImageUrl(product.imageUrl)
    setDraftColorId(catalog.colors[0].id)
    setDraftSizeId(sizesForGroup[0]?.id ?? 1)
    setDraftStock(10)
    setOptions(
      product.options.map(o => ({
        colorId: o.colorId,
        sizeId: o.sizeId,
        stockQuantity: o.stockQuantity,
      })),
    )
    setFormOpen(true)
  }

  function handleRootCategoryChange(nextRootId: number) {
    setRootCategoryId(nextRootId)
    const firstLeaf = catalog.leafCategories.find(c => c.parentId === nextRootId)
    if (firstLeaf) {
      syncCategoryAndSizes(firstLeaf.id, true)
    }
  }

  function handleAddOption() {
    const exists = options.some(
      o => o.colorId === draftColorId && o.sizeId === draftSizeId,
    )
    if (exists) {
      showModalError('이미 추가된 색상×사이즈 조합입니다.')
      return
    }
    setModalError(null)
    setOptions(prev => [
      ...prev,
      {
        colorId: draftColorId,
        sizeId: draftSizeId,
        stockQuantity: Math.max(0, draftStock),
      },
    ])
  }

  function handleRemoveOption(index: number) {
    setOptions(prev => prev.filter((_, idx) => idx !== index))
  }

  function handleOptionStockChange(index: number, nextQty: number) {
    setOptions(prev =>
      prev.map((item, idx) =>
        idx === index ? { ...item, stockQuantity: Math.max(0, nextQty) } : item,
      ),
    )
  }

  function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showModalError('이미지 파일(jpg, png, webp)만 업로드할 수 있습니다.')
      return
    }
    setModalError(null)
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      if (editingProduct) {
        const updated = await updateSellerProduct(editingProduct.id, {
          brandId,
          categoryId,
          name,
          productCode,
          gender,
          season,
          shipDays,
          price,
          imageUrl,
          options,
        })
        setModalError(null)
        setFormOpen(false)
        await onRefresh()
        onNotify(
          'info',
          `상품 [${updated.name}] 정보가 수정되어 재승인 대기 상태로 전환되었습니다. 관리자 승인 전까지 쇼핑몰에서 숨김 처리됩니다.`,
        )
      } else {
        const created = await createSellerProduct({
          brandId,
          categoryId,
          name,
          productCode,
          gender,
          season,
          shipDays,
          price,
          imageUrl,
          options,
        })
        setModalError(null)
        setFormOpen(false)
        await onRefresh()
        onNotify(
          'success',
          `신규 상품 [${created.name} (${created.productCode})] 등록 신청이 완료되었습니다. 관리자 승인 후 판매가 시작됩니다.`,
        )
      }
    } catch (err) {
      showModalError(err instanceof Error ? err.message : '상품 저장에 실패했습니다.')
    }
  }

  async function handleToggleSaleStatus(product: Product) {
    try {
      const next = product.status === 'ON_SALE' ? 'SOLD_OUT' : 'ON_SALE'
      await updateSellerProductSaleStatus(product.id, next)
      await onRefresh()
      onNotify(
        'success',
        `[${product.name}] 판매 상태가 ${next === 'ON_SALE' ? '판매중' : '품절'}(으)로 즉시 변경되었습니다.`,
      )
    } catch (err) {
      onNotify('error', err instanceof Error ? err.message : '상태 변경에 실패했습니다.')
    }
  }

  async function handleDeleteProduct(product: Product) {
    try {
      await deleteSellerProduct(product.id)
      await onRefresh()
      onNotify('info', `상품 [${product.name}]이(가) 삭제 처리되었습니다.`)
    } catch (err) {
      onNotify('error', err instanceof Error ? err.message : '상품 삭제에 실패했습니다.')
    }
  }

  const filteredProducts = products.filter(p => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false
    if (brandFilter !== 'ALL' && p.brandId !== brandFilter) return false
    if (keyword.trim()) {
      const q = keyword.trim().toLowerCase()
      return (
        p.name.toLowerCase().includes(q) ||
        p.productCode.toLowerCase().includes(q) ||
        p.brandName.toLowerCase().includes(q)
      )
    }
    return true
  })

  const subCategories = catalog.leafCategories.filter(
    c => c.parentId === rootCategoryId,
  )

  return (
    <>
      <div className="ws-page-header">
        <div>
          <h1>상품 관리</h1>
          <p>
            승인된 브랜드의 상품을 신청·수정·삭제하고 판매중/품절 상태를 전환합니다. 정보 수정 시에는 재승인 대기 상태로 전환됩니다.
          </p>
        </div>
        <button
          type="button"
          className="ws-btn ws-btn-primary"
          onClick={() => openCreateModal()}
        >
          <Icon name="plus" />
          <span>신규 상품 등록 신청</span>
        </button>
      </div>

      <section className="ws-card" aria-label="상품 목록 및 필터">
        <div className="ws-toolbar">
          <div className="ws-filter-pills" role="group" aria-label="상품 상태 필터">
            {(
              ['ALL', 'ON_SALE', 'PENDING', 'REJECTED', 'SOLD_OUT', 'BLOCKED'] as const
            ).map(st => (
              <button
                key={st}
                type="button"
                className="ws-pill"
                aria-pressed={statusFilter === st}
                onClick={() => setStatusFilter(st)}
              >
                {st === 'ALL' ? '전체' : PRODUCT_STATUS_LABEL[st]}
              </button>
            ))}
          </div>

          <div className="ws-search-box">
            <select
              className="ws-select"
              aria-label="브랜드 필터"
              value={brandFilter}
              onChange={e =>
                setBrandFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
              }
            >
              <option value="ALL">모든 브랜드</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <input
              className="ws-input"
              placeholder="상품명·품번 검색"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>
        </div>

        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead>
              <tr>
                <th>상품 정보 (품번 / 스펙)</th>
                <th>브랜드 / 카테고리</th>
                <th>판매가</th>
                <th>색상×사이즈 옵션 및 재고</th>
                <th>상태</th>
                <th>관리 액션</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const totalStock = product.options.reduce(
                  (sum, o) => sum + o.stockQuantity,
                  0,
                )
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="ws-product-cell">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="ws-thumb"
                        />
                        <div>
                          <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: 700 }}>
                            {product.productCode} · {product.season} · {GENDER_LABEL[product.gender]} · 출고 {product.shipDays}일
                          </div>
                          <strong style={{ fontSize: '14px' }}>{product.name}</strong>
                          {product.status === 'REJECTED' && product.rejectReason && (
                            <div className="ws-reject-box">
                              <strong>거절 사유:</strong> {product.rejectReason}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{product.brandName}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {product.parentCategoryName} &gt; {product.categoryName} ({product.sizeGroup})
                      </div>
                    </td>
                    <td>
                      <strong>{product.price.toLocaleString('ko-KR')}원</strong>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 700 }}>
                        총 {totalStock}개 ({product.options.length}개 옵션)
                      </div>
                      <div className="ws-meta-list">
                        {product.options.map(opt => (
                          <span key={opt.id} className="ws-option-tag">
                            <i
                              className="ws-color-dot"
                              style={{ backgroundColor: opt.hexCode }}
                            />
                            {opt.colorName}/{opt.sizeLabel}: <strong>{opt.stockQuantity}</strong>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`ws-badge ws-badge-${product.status}`}>
                        {PRODUCT_STATUS_LABEL[product.status]}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {(product.status === 'ON_SALE' ||
                          product.status === 'SOLD_OUT') && (
                          <button
                            type="button"
                            className="ws-btn ws-btn-sm"
                            onClick={() => handleToggleSaleStatus(product)}
                          >
                            {product.status === 'ON_SALE' ? '품절 전환' : '판매중 전환'}
                          </button>
                        )}
                        <button
                          type="button"
                          className="ws-btn ws-btn-sm"
                          onClick={() => onGoToInventory(product.id)}
                        >
                          재고·이력
                        </button>
                        <button
                          type="button"
                          className="ws-btn ws-btn-sm"
                          disabled={product.status === 'BLOCKED'}
                          onClick={() => openEditModal(product)}
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          className="ws-btn ws-btn-sm ws-btn-danger"
                          onClick={() => handleDeleteProduct(product)}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="ws-empty">
                    조건에 맞는 상품이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {formOpen && (
        <div className="ws-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
          <div className="ws-modal" ref={modalRef}>
            {modalError && (
              <div className="ws-banner ws-banner-error ws-modal-banner" role="alert">
                <div className="ws-banner-text">
                  <Icon name="alert" />
                  <span>{modalError}</span>
                </div>
                <button
                  type="button"
                  className="ws-banner-close"
                  onClick={() => setModalError(null)}
                  aria-label="경고 닫기"
                >
                  <Icon name="close" />
                </button>
              </div>
            )}

            <div className="ws-modal-header">
              <h2 id="product-modal-title">
                {editingProduct ? `상품 수정 (${editingProduct.productCode})` : '신규 상품 등록 신청'}
              </h2>
              <button
                type="button"
                className="ws-banner-close"
                onClick={() => {
                  setModalError(null)
                  setFormOpen(false)
                }}
                aria-label="모달 닫기"
              >
                <Icon name="close" />
              </button>
            </div>

            {editingProduct && (
              <div className="ws-banner ws-banner-info">
                <div className="ws-banner-text">
                  <Icon name="alert" />
                  <span>
                    상품 정보를 수정하면 <strong>재승인 대기</strong> 상태로 전환되며 관리자 승인 전까지 숨김 처리됩니다.
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="ws-main" style={{ gap: '16px' }}>
              <div className="ws-form-grid">
                <div className="ws-field">
                  <label htmlFor="prod-brand">소속 브랜드 (등록된 브랜드 별도 신청 없이 선택 가능)</label>
                  <select
                    id="prod-brand"
                    className="ws-select"
                    value={brandId}
                    onChange={e => setBrandId(Number(e.target.value))}
                  >
                    {approvedBrands.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} (즉시 사용 가능)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ws-field">
                  <label htmlFor="prod-root-cat">패션 대분류</label>
                  <select
                    id="prod-root-cat"
                    className="ws-select"
                    value={rootCategoryId}
                    onChange={e => handleRootCategoryChange(Number(e.target.value))}
                  >
                    {catalog.rootCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ws-field">
                  <label htmlFor="prod-leaf-cat">소분류 (사이즈 체계 자동 연동)</label>
                  <select
                    id="prod-leaf-cat"
                    className="ws-select"
                    value={categoryId}
                    onChange={e => syncCategoryAndSizes(Number(e.target.value), true)}
                  >
                    {subCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.sizeGroup})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ws-field">
                  <label htmlFor="prod-name">상품명</label>
                  <input
                    id="prod-name"
                    className="ws-input"
                    placeholder="예: 울 블렌드 발마칸 코트"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="ws-field">
                  <label htmlFor="prod-code">품번 (상품 코드)</label>
                  <input
                    id="prod-code"
                    className="ws-input"
                    placeholder="예: SEAM-26FW-009"
                    value={productCode}
                    onChange={e => setProductCode(e.target.value)}
                    required
                  />
                </div>

                <div className="ws-field">
                  <label htmlFor="prod-price">판매 가격 (원)</label>
                  <input
                    id="prod-price"
                    type="number"
                    min={100}
                    step={100}
                    className="ws-input"
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="ws-field">
                  <label htmlFor="prod-gender">성별</label>
                  <select
                    id="prod-gender"
                    className="ws-select"
                    value={gender}
                    onChange={e => setGender(e.target.value as Gender)}
                  >
                    <option value="UNISEX">공용 (UNISEX)</option>
                    <option value="MALE">남성 (MALE)</option>
                    <option value="FEMALE">여성 (FEMALE)</option>
                  </select>
                </div>

                <div className="ws-field">
                  <label htmlFor="prod-season">시즌 (24SS / 26FW 형식)</label>
                  <input
                    id="prod-season"
                    className="ws-input"
                    placeholder="26FW"
                    value={season}
                    onChange={e => setSeason(e.target.value)}
                    required
                  />
                </div>

                <div className="ws-field">
                  <label htmlFor="prod-ship">출고 예정일 (주문 후 0~30일)</label>
                  <input
                    id="prod-ship"
                    type="number"
                    min={0}
                    max={30}
                    className="ws-input"
                    value={shipDays}
                    onChange={e => setShipDays(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="ws-form-grid">
                <div className="ws-field">
                  <label htmlFor="prod-sample-img">품목별 샘플 이미지 선택</label>
                  <select
                    id="prod-sample-img"
                    className="ws-select"
                    value={
                      catalog.sampleImages.some(s => s.url === imageUrl)
                        ? imageUrl
                        : 'CUSTOM'
                    }
                    onChange={e => {
                      if (e.target.value !== 'CUSTOM') setImageUrl(e.target.value)
                    }}
                  >
                    {catalog.sampleImages.map(sample => (
                      <option key={sample.label} value={sample.url}>
                        {sample.label}
                      </option>
                    ))}
                    <option value="CUSTOM">직접 업로드한 이미지</option>
                  </select>
                </div>

                <div className="ws-field">
                  <label htmlFor="prod-file">또는 이미지 파일 직접 업로드</label>
                  <input
                    id="prod-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="ws-input"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: '14px',
                  background: '#f3f2ed',
                  border: '1px solid #d5d6ce',
                  borderRadius: '3px',
                  display: 'grid',
                  gap: '12px',
                }}
              >
                <div>
                  <strong style={{ fontSize: '13.5px' }}>
                    색상 × 사이즈 옵션 및 초기 재고 설정 (사이즈 체계: {currentLeaf.sizeGroup})
                  </strong>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                    재고는 색상 × 사이즈 옵션 단위로 집계됩니다.
                  </p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'flex-end' }}>
                  <div className="ws-field">
                    <label htmlFor="opt-color">색상 (12종 고정)</label>
                    <select
                      id="opt-color"
                      className="ws-select"
                      value={draftColorId}
                      onChange={e => setDraftColorId(Number(e.target.value))}
                    >
                      {catalog.colors.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="ws-field">
                    <label htmlFor="opt-size">사이즈 ({currentLeaf.sizeGroup})</label>
                    <select
                      id="opt-size"
                      className="ws-select"
                      value={draftSizeId}
                      onChange={e => setDraftSizeId(Number(e.target.value))}
                    >
                      {availableSizes.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="ws-field">
                    <label htmlFor="opt-stock">초기 재고</label>
                    <input
                      id="opt-stock"
                      type="number"
                      min={0}
                      className="ws-input"
                      style={{ width: '100px' }}
                      value={draftStock}
                      onChange={e => setDraftStock(Number(e.target.value))}
                    />
                  </div>

                  <button
                    type="button"
                    className="ws-btn ws-btn-primary"
                    onClick={handleAddOption}
                  >
                    <Icon name="plus" />
                    <span>옵션 조합 추가</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '6px' }}>
                  {options.map((opt, idx) => {
                    const color = catalog.colors.find(c => c.id === opt.colorId)
                    const size = catalog.sizes.find(s => s.id === opt.sizeId)
                    return (
                      <div
                        key={`${opt.colorId}-${opt.sizeId}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: '#fff',
                          padding: '8px 12px',
                          border: '1px solid #d5d6ce',
                          borderRadius: '2px',
                          fontSize: '13px',
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <i
                            className="ws-color-dot"
                            style={{ backgroundColor: color?.hexCode ?? '#000' }}
                          />
                          <strong>{color?.name}</strong> / <strong>{size?.label}</strong>
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label style={{ fontSize: '12px', color: 'var(--muted)' }}>
                            재고 수량:
                          </label>
                          <input
                            type="number"
                            min={0}
                            className="ws-input"
                            style={{ width: '88px', minHeight: '30px', padding: '4px 8px' }}
                            value={opt.stockQuantity}
                            onChange={e => handleOptionStockChange(idx, Number(e.target.value))}
                          />
                          <button
                            type="button"
                            className="ws-btn ws-btn-sm ws-btn-danger"
                            onClick={() => handleRemoveOption(idx)}
                          >
                            제거
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="ws-modal-actions">
                <button
                  type="button"
                  className="ws-btn"
                  onClick={() => {
                    setModalError(null)
                    setFormOpen(false)
                  }}
                >
                  취소
                </button>
                <button type="submit" className="ws-btn ws-btn-primary">
                  {editingProduct ? '수정 및 재승인 신청' : '상품 등록 신청'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
