import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import Icon from '../../components/Icon'
import {
  createSellerBrand,
  deleteSellerBrand,
  getCatalogData,
  uploadSellerImage,
  validateInitialProductDraft,
  type InitialProductDraftInput,
  type ProductOptionInput,
} from '../../services/mockStore'
import type { Brand, BrandStatus, Gender } from '../../types/commerce'

const BRAND_STATUS_LABEL: Record<BrandStatus, string> = {
  PENDING: '승인 대기',
  APPROVED: '승인 완료',
  REJECTED: '승인 거절',
}

type SellerBrandsTabProps = {
  brands: Brand[]
  onRefresh: () => void
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void
  onGoToProductCreate: (brandId: number) => void
}

export default function SellerBrandsTab({
  brands,
  onRefresh,
  onNotify,
  onGoToProductCreate,
}: SellerBrandsTabProps) {
  const catalog = getCatalogData()
  const [statusFilter, setStatusFilter] = useState<'ALL' | BrandStatus>('ALL')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const autocompleteRef = useRef<HTMLDivElement | null>(null)

  // 필수 초기 대표 상품 모달 및 입력 상태 (상품 관리의 신규 상품 등록 신청 창과 동일)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)

  const [initRootCategoryId, setInitRootCategoryId] = useState<number>(
    catalog.rootCategories[0].id,
  )
  const [initCategoryId, setInitCategoryId] = useState<number>(
    catalog.leafCategories[0].id,
  )
  const [initProductName, setInitProductName] = useState('')
  const [initProductCode, setInitProductCode] = useState('')
  const [initGender, setInitGender] = useState<Gender>('UNISEX')
  const [initSeason, setInitSeason] = useState('26FW')
  const [initShipDays, setInitShipDays] = useState(2)
  const [initPrice, setInitPrice] = useState(89000)
  const [initImageUrl, setInitImageUrl] = useState(catalog.sampleImages[0].url)
  const [initOptions, setInitOptions] = useState<ProductOptionInput[]>(() => [
    {
      colorId: catalog.colors[0].id,
      sizeId: catalog.sizes[0].id,
      stockQuantity: 15,
    },
  ])

  const [draftColorId, setDraftColorId] = useState<number>(catalog.colors[0].id)
  const [draftSizeId, setDraftSizeId] = useState<number>(catalog.sizes[0].id)
  const [draftStock, setDraftStock] = useState<number>(15)

  const currentLeaf =
    catalog.leafCategories.find(c => c.id === initCategoryId) ??
    catalog.leafCategories[0]
  const availableSizes = catalog.sizes.filter(
    s => s.sizeGroup === currentLeaf.sizeGroup,
  )
  const subCategories = catalog.leafCategories.filter(
    c => c.parentId === initRootCategoryId,
  )

  const filteredBrands = brands.filter(
    b => statusFilter === 'ALL' || b.status === statusFilter,
  )
  const approvedBrands = brands.filter(b => b.status === 'APPROVED')
  const matchedRegisteredBrand = approvedBrands.find(
    b => b.name.toLowerCase() === name.trim().toLowerCase(),
  )

  const trimmedQuery = name.trim().toLowerCase()
  const suggestedBrands = approvedBrands.filter(b => {
    if (!trimmedQuery || matchedRegisteredBrand) return true
    return (
      b.name.toLowerCase().includes(trimmedQuery) ||
      b.description.toLowerCase().includes(trimmedQuery)
    )
  })

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false)
        setHighlightedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  function showModalError(message: string) {
    setModalError(message)
    modalRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetInitialProductForm() {
    const defaultLeaf = catalog.leafCategories[0]
    const defaultSizes = catalog.sizes.filter(
      s => s.sizeGroup === defaultLeaf.sizeGroup,
    )
    const firstSizeId = defaultSizes[0]?.id ?? 1
    setInitRootCategoryId(defaultLeaf.parentId ?? catalog.rootCategories[0].id)
    setInitCategoryId(defaultLeaf.id)
    setInitProductName('')
    setInitProductCode('')
    setInitGender('UNISEX')
    setInitSeason('26FW')
    setInitShipDays(2)
    setInitPrice(89000)
    setInitImageUrl(catalog.sampleImages[0].url)
    setDraftColorId(catalog.colors[0].id)
    setDraftSizeId(firstSizeId)
    setDraftStock(15)
    setInitOptions([
      {
        colorId: catalog.colors[0].id,
        sizeId: firstSizeId,
        stockQuantity: 15,
      },
    ])
  }

  function syncCategoryAndSizes(nextLeafId: number, resetOptions: boolean) {
    const leaf = catalog.leafCategories.find(c => c.id === nextLeafId)
    if (!leaf) return
    setInitCategoryId(leaf.id)
    if (leaf.parentId) setInitRootCategoryId(leaf.parentId)
    const sizesForGroup = catalog.sizes.filter(
      s => s.sizeGroup === leaf.sizeGroup,
    )
    const firstSizeId = sizesForGroup[0]?.id ?? 1
    setDraftSizeId(firstSizeId)
    if (resetOptions) {
      setInitOptions([
        {
          colorId: catalog.colors[0].id,
          sizeId: firstSizeId,
          stockQuantity: 15,
        },
      ])
    }
  }

  function handleRootCategoryChange(nextRootId: number) {
    setInitRootCategoryId(nextRootId)
    const firstLeaf = catalog.leafCategories.find(c => c.parentId === nextRootId)
    if (firstLeaf) {
      syncCategoryAndSizes(firstLeaf.id, true)
    }
  }

  function handleAddOption() {
    const exists = initOptions.some(
      o => o.colorId === draftColorId && o.sizeId === draftSizeId,
    )
    if (exists) {
      showModalError('이미 추가된 색상×사이즈 조합입니다.')
      return
    }
    setModalError(null)
    setInitOptions(prev => [
      ...prev,
      {
        colorId: draftColorId,
        sizeId: draftSizeId,
        stockQuantity: Math.max(0, draftStock),
      },
    ])
  }

  function handleRemoveOption(index: number) {
    setInitOptions(prev => prev.filter((_, idx) => idx !== index))
  }

  function handleOptionStockChange(index: number, nextQty: number) {
    setInitOptions(prev =>
      prev.map((item, idx) =>
        idx === index ? { ...item, stockQuantity: Math.max(0, nextQty) } : item,
      ),
    )
  }

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showModalError('이미지 파일(jpg, png, webp)만 업로드할 수 있습니다.')
      return
    }
    setModalError(null)
    try {
      const uploadedUrl = await uploadSellerImage(file)
      setInitImageUrl(uploadedUrl)
    } catch (err) {
      showModalError(
        err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.',
      )
    }
  }

  function handleSelectExistingBrand(brand: Brand) {
    setName(brand.name)
    setIsDropdownOpen(false)
    setHighlightedIndex(-1)
  }

  function handleBrandInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!isDropdownOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsDropdownOpen(true)
      return
    }
    if (!isDropdownOpen) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (suggestedBrands.length > 0) {
        setHighlightedIndex(prev => (prev + 1) % suggestedBrands.length)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (suggestedBrands.length > 0) {
        setHighlightedIndex(prev =>
          prev <= 0 ? suggestedBrands.length - 1 : prev - 1,
        )
      }
    } else if (
      e.key === 'Enter' &&
      highlightedIndex >= 0 &&
      suggestedBrands[highlightedIndex]
    ) {
      e.preventDefault()
      handleSelectExistingBrand(suggestedBrands[highlightedIndex])
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false)
      setHighlightedIndex(-1)
    }
  }

  async function submitBrandWithProduct(productDraft: InitialProductDraftInput) {
    const wasAlreadyApproved = Boolean(matchedRegisteredBrand)
    const created = await createSellerBrand({
      name,
      description: matchedRegisteredBrand
        ? matchedRegisteredBrand.description
        : description,
      initialProduct: productDraft,
    })
    setName('')
    setDescription('')
    setIsDropdownOpen(false)
    setModalError(null)
    setProductModalOpen(false)
    resetInitialProductForm()
    await onRefresh()
    if (wasAlreadyApproved || created.status === 'APPROVED') {
      onNotify(
        'success',
        `이미 등록된 브랜드 [${created.name}]을(를) 사용하여 초기 대표 상품 [${productDraft.name.trim()}] 등록 신청이 완료되었습니다. 관리자 승인 후 판매가 시작됩니다.`,
      )
    } else {
      onNotify(
        'success',
        `브랜드 [${created.name}] 및 초기 대표 상품 [${productDraft.name.trim()}] 등록 신청이 완료되었습니다. 관리자 승인 후 판매가 시작됩니다.`,
      )
    }
  }

  async function handleProductModalSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      if (!name.trim()) {
        throw new Error('브랜드명을 입력해 주세요.')
      }
      if (!matchedRegisteredBrand && !description.trim()) {
        throw new Error('브랜드 소개 / 컨셉 설명을 입력해 주세요.')
      }
      const draft: InitialProductDraftInput = {
        categoryId: initCategoryId,
        name: initProductName,
        productCode: initProductCode,
        gender: initGender,
        season: initSeason,
        shipDays: initShipDays,
        price: initPrice,
        imageUrl: initImageUrl,
        options: initOptions,
      }
      validateInitialProductDraft(draft, name)
      await submitBrandWithProduct(draft)
    } catch (err) {
      showModalError(
        err instanceof Error
          ? err.message
          : '초기 대표 상품 입력 정보를 확인해 주세요.',
      )
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      if (!name.trim()) {
        throw new Error('브랜드명을 입력해 주세요.')
      }
      if (!matchedRegisteredBrand && !description.trim()) {
        throw new Error('브랜드 소개 / 컨셉 설명을 입력해 주세요.')
      }
      const alreadyPending = brands.some(
        b =>
          b.name.toLowerCase() === name.trim().toLowerCase() &&
          b.status === 'PENDING',
      )
      if (alreadyPending) {
        throw new Error('현재 승인 대기 중인 브랜드입니다.')
      }

      setModalError(null)
      setProductModalOpen(true)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '브랜드 등록 중 오류가 발생했습니다.'
      onNotify('error', message)
    }
  }

  async function handleDeleteBrand(brand: Brand) {
    try {
      await deleteSellerBrand(brand.id)
      await onRefresh()
      onNotify('info', `브랜드 [${brand.name}]이(가) 삭제 처리되었습니다.`)
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : '브랜드 삭제에 실패했습니다.',
      )
    }
  }

  return (
    <>
      <div className="ws-page-header">
        <div>
          <h1>브랜드 관리</h1>
          <p>
            판매자 브랜드를 등록하고 관리자 승인 상태 및 거절 사유를 확인합니다. 승인된 브랜드에 상품을 추가할 수 있습니다.
          </p>
        </div>
      </div>

      <section className="ws-card" aria-labelledby="new-brand-heading">
        <div className="ws-card-header">
          <div>
            <h2 id="new-brand-heading" className="ws-card-title">
              브랜드 입력 및 신규 브랜드 등록 신청
            </h2>
            <p className="ws-card-desc">
              브랜드 입력창에서 이미 등록된 브랜드를 자동완성 드롭다운으로 선택하거나, 없는 브랜드는 직접 타이핑하여 초기 대표 상품 1건과 함께 필수 신청할 수 있습니다.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="ws-main" style={{ gap: '14px' }}>
          <div className="ws-form-grid">
            <div className="ws-field" ref={autocompleteRef}>
              <label htmlFor="brand-name">
                브랜드명 (자동완성 선택 또는 신규 직접 입력)
              </label>
              <div className="ws-autocomplete">
                <div className="ws-autocomplete-input-wrap">
                  <input
                    id="brand-name"
                    className="ws-input"
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={isDropdownOpen}
                    aria-autocomplete="list"
                    aria-controls="brand-autocomplete-listbox"
                    placeholder="브랜드명 타이핑 또는 등록된 브랜드 자동완성 선택"
                    value={name}
                    onFocus={() => {
                      setIsDropdownOpen(true)
                    }}
                    onChange={e => {
                      setName(e.target.value)
                      setIsDropdownOpen(true)
                      setHighlightedIndex(-1)
                    }}
                    onKeyDown={handleBrandInputKeyDown}
                    required
                  />
                  {name && (
                    <button
                      type="button"
                      className="ws-autocomplete-clear"
                      aria-label="브랜드 입력 초기화"
                      onClick={() => {
                        setName('')
                        setIsDropdownOpen(true)
                        setHighlightedIndex(-1)
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {isDropdownOpen && (
                  <div
                    id="brand-autocomplete-listbox"
                    role="listbox"
                    className="ws-autocomplete-dropdown"
                  >
                    <div className="ws-autocomplete-header">
                      <span>
                        이미 등록된 브랜드 추천 / 자동완성 ({suggestedBrands.length}개)
                      </span>
                      <span>선택 시 소개 자동 완성</span>
                    </div>

                    {suggestedBrands.map((b, idx) => {
                      const isSelected = matchedRegisteredBrand?.id === b.id
                      const isHighlighted = highlightedIndex === idx
                      return (
                        <button
                          key={b.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          data-highlighted={isHighlighted}
                          className="ws-autocomplete-item"
                          onMouseDown={e => {
                            // blur보다 먼저 실행되도록 기본 포커스 이동 방지
                            e.preventDefault()
                            handleSelectExistingBrand(b)
                          }}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                        >
                          <div className="ws-autocomplete-item-top">
                            <span className="ws-autocomplete-item-name">
                              {b.name}
                            </span>
                            <span className="ws-badge ws-badge-APPROVED">
                              {isSelected ? '✓ 선택됨' : '등록된 브랜드'}
                            </span>
                          </div>
                          <div className="ws-autocomplete-item-desc">
                            {b.description}
                          </div>
                        </button>
                      )
                    })}

                    {name.trim() && !matchedRegisteredBrand && (
                      <div className="ws-autocomplete-new-hint">
                        찾으시는 브랜드가 없나요? 위 목록을 선택하지 않고 입력하신{' '}
                        <strong>&ldquo;{name.trim()}&rdquo;</strong>(으)로 바로 신규 브랜드를 신청할 수 있습니다.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="ws-field" style={{ gridColumn: 'span 2' }}>
              <label htmlFor="brand-desc">
                브랜드 소개 / 컨셉 설명{' '}
                {matchedRegisteredBrand && (
                  <span style={{ color: '#193398', fontWeight: 700 }}>
                    (이미 등록된 브랜드 정보 자동 완성 · 수정 불가)
                  </span>
                )}
              </label>
              <input
                id="brand-desc"
                className="ws-input"
                placeholder="브랜드 무드, 주력 카테고리 및 타겟 고객층을 입력하세요"
                value={
                  matchedRegisteredBrand
                    ? matchedRegisteredBrand.description
                    : description
                }
                onChange={e => {
                  if (!matchedRegisteredBrand) {
                    setDescription(e.target.value)
                  }
                }}
                readOnly={Boolean(matchedRegisteredBrand)}
                disabled={Boolean(matchedRegisteredBrand)}
                required={!matchedRegisteredBrand}
              />
            </div>
          </div>

          <div
            style={{
              padding: '12px 14px',
              background: '#f5f4ef',
              border: '1px solid #d5d6ce',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: 'var(--muted)',
              }}
            >
              <Icon name="alert" />
              <span>
                브랜드 등록 시 <strong>초기 대표 상품 1건 등록</strong>이 필요합니다. 우측 신청 버튼을 누르면 신규 상품 등록 신청 창이 열립니다.
              </span>
            </div>

            <button type="submit" className="ws-btn ws-btn-primary">
              <Icon name="plus" />
              <span>
                {matchedRegisteredBrand
                  ? '기존 등록 브랜드로 초기 상품 등록 신청'
                  : '브랜드 등록 신청'}
              </span>
            </button>
          </div>
        </form>
      </section>

      <section className="ws-card" aria-labelledby="my-brands-heading">
        <div className="ws-toolbar">
          <div>
            <h2 id="my-brands-heading" className="ws-card-title">
              등록 및 신청 브랜드 목록 ({filteredBrands.length}건)
            </h2>
            <p className="ws-card-desc">
              이미 등록(승인 완료)된 브랜드는 별도 신청 없이 바로 상품 등록에 사용할 수 있습니다.
            </p>
          </div>
          <div className="ws-filter-pills" role="group" aria-label="브랜드 상태 필터">
            {(['ALL', 'APPROVED', 'PENDING', 'REJECTED'] as const).map(st => (
              <button
                key={st}
                type="button"
                className="ws-pill"
                aria-pressed={statusFilter === st}
                onClick={() => setStatusFilter(st)}
              >
                {st === 'ALL' ? '전체' : BRAND_STATUS_LABEL[st]}
              </button>
            ))}
          </div>
        </div>

        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead>
              <tr>
                <th>브랜드 ID</th>
                <th>브랜드명 / 소개</th>
                <th>승인 상태</th>
                <th>신청 일시</th>
                <th>관리 액션</th>
              </tr>
            </thead>
            <tbody>
              {filteredBrands.map(brand => (
                <tr key={brand.id}>
                  <td>#{brand.id}</td>
                  <td>
                    <strong style={{ fontSize: '14px' }}>{brand.name}</strong>
                    <div
                      style={{
                        color: 'var(--muted)',
                        fontSize: '12px',
                        marginTop: '3px',
                      }}
                    >
                      {brand.description}
                    </div>
                    {brand.status === 'REJECTED' && brand.rejectReason && (
                      <div className="ws-reject-box">
                        <strong>거절 사유:</strong> {brand.rejectReason}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`ws-badge ws-badge-${brand.status}`}>
                      {BRAND_STATUS_LABEL[brand.status]}
                    </span>
                    {brand.status === 'APPROVED' && (
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#185826',
                          marginTop: '4px',
                          fontWeight: 700,
                        }}
                      >
                        별도 신청 없이 사용 가능
                      </div>
                    )}
                  </td>
                  <td>{brand.createdAt.replace('T', ' ')}</td>
                  <td>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '6px',
                      }}
                    >
                      {brand.status === 'APPROVED' ? (
                        <button
                          type="button"
                          className="ws-btn ws-btn-sm ws-btn-primary"
                          onClick={() => onGoToProductCreate(brand.id)}
                        >
                          <Icon name="plus" />
                          <span>바로 상품 등록</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                          {brand.status === 'PENDING'
                            ? '관리자 승인 후 상품 등록 가능'
                            : '거절됨 (등록 불가)'}
                        </span>
                      )}
                      <button
                        type="button"
                        className="ws-btn ws-btn-sm ws-btn-danger"
                        onClick={() => handleDeleteBrand(brand)}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBrands.length === 0 && (
                <tr>
                  <td colSpan={5} className="ws-empty">
                    해당 상태의 브랜드가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {productModalOpen && (
        <div
          className="ws-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="brand-init-product-modal-title"
        >
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
              <h2 id="brand-init-product-modal-title">신규 상품 등록 신청</h2>
              <button
                type="button"
                className="ws-banner-close"
                onClick={() => {
                  setModalError(null)
                  setProductModalOpen(false)
                }}
                aria-label="모달 닫기"
              >
                <Icon name="close" />
              </button>
            </div>

            <form
              onSubmit={handleProductModalSubmit}
              className="ws-main"
              style={{ gap: '16px' }}
            >
              <div className="ws-form-grid">
                <div className="ws-field">
                  <label htmlFor="init-prod-brand">
                    소속 브랜드 (브랜드 등록 신청 대상)
                  </label>
                  <input
                    id="init-prod-brand"
                    className="ws-input"
                    placeholder="브랜드명 입력 (예: SEAM STUDIO)"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="ws-field">
                  <label htmlFor="init-prod-root-cat">패션 대분류</label>
                  <select
                    id="init-prod-root-cat"
                    className="ws-select"
                    value={initRootCategoryId}
                    onChange={e =>
                      handleRootCategoryChange(Number(e.target.value))
                    }
                  >
                    {catalog.rootCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ws-field">
                  <label htmlFor="init-prod-leaf-cat">
                    소분류 (사이즈 체계 자동 연동)
                  </label>
                  <select
                    id="init-prod-leaf-cat"
                    className="ws-select"
                    value={initCategoryId}
                    onChange={e =>
                      syncCategoryAndSizes(Number(e.target.value), true)
                    }
                  >
                    {subCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.sizeGroup})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ws-field">
                  <label htmlFor="init-prod-name">상품명</label>
                  <input
                    id="init-prod-name"
                    className="ws-input"
                    placeholder="예: 울 블렌드 발마칸 코트"
                    value={initProductName}
                    onChange={e => setInitProductName(e.target.value)}
                    required
                  />
                </div>

                <div className="ws-field">
                  <label htmlFor="init-prod-code">품번 (상품 코드)</label>
                  <input
                    id="init-prod-code"
                    className="ws-input"
                    placeholder="예: SEAM-26FW-009"
                    value={initProductCode}
                    onChange={e => setInitProductCode(e.target.value)}
                    required
                  />
                </div>

                <div className="ws-field">
                  <label htmlFor="init-prod-price">판매 가격 (원)</label>
                  <input
                    id="init-prod-price"
                    type="number"
                    min={100}
                    step={100}
                    className="ws-input"
                    value={initPrice}
                    onChange={e => setInitPrice(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="ws-field">
                  <label htmlFor="init-prod-gender">성별</label>
                  <select
                    id="init-prod-gender"
                    className="ws-select"
                    value={initGender}
                    onChange={e => setInitGender(e.target.value as Gender)}
                  >
                    <option value="UNISEX">공용 (UNISEX)</option>
                    <option value="MEN">남성 (MEN)</option>
                    <option value="WOMEN">여성 (WOMEN)</option>
                  </select>
                </div>

                <div className="ws-field">
                  <label htmlFor="init-prod-season">
                    시즌 (24SS / 26FW 형식)
                  </label>
                  <input
                    id="init-prod-season"
                    className="ws-input"
                    placeholder="26FW"
                    value={initSeason}
                    onChange={e => setInitSeason(e.target.value)}
                    required
                  />
                </div>

                <div className="ws-field">
                  <label htmlFor="init-prod-ship">
                    출고 예정일 (주문 후 0~30일)
                  </label>
                  <input
                    id="init-prod-ship"
                    type="number"
                    min={0}
                    max={30}
                    className="ws-input"
                    value={initShipDays}
                    onChange={e => setInitShipDays(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="ws-form-grid">
                <div className="ws-field">
                  <label htmlFor="init-prod-sample-img">
                    품목별 샘플 이미지 선택
                  </label>
                  <select
                    id="init-prod-sample-img"
                    className="ws-select"
                    value={
                      catalog.sampleImages.some(s => s.url === initImageUrl)
                        ? initImageUrl
                        : 'CUSTOM'
                    }
                    onChange={e => {
                      if (e.target.value !== 'CUSTOM')
                        setInitImageUrl(e.target.value)
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
                  <label htmlFor="init-prod-file">
                    또는 이미지 파일 직접 업로드
                  </label>
                  <input
                    id="init-prod-file"
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
                    색상 × 사이즈 옵션 및 초기 재고 설정 (사이즈 체계:{' '}
                    {currentLeaf.sizeGroup})
                  </strong>
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--muted)',
                      marginTop: '2px',
                    }}
                  >
                    재고는 색상 × 사이즈 옵션 단위로 집계됩니다.
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    alignItems: 'flex-end',
                  }}
                >
                  <div className="ws-field">
                    <label htmlFor="init-opt-color">색상 (12종 고정)</label>
                    <select
                      id="init-opt-color"
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
                    <label htmlFor="init-opt-size">
                      사이즈 ({currentLeaf.sizeGroup})
                    </label>
                    <select
                      id="init-opt-size"
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
                    <label htmlFor="init-opt-stock">초기 재고</label>
                    <input
                      id="init-opt-stock"
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
                  {initOptions.map((opt, idx) => {
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
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <i
                            className="ws-color-dot"
                            style={{
                              backgroundColor: color?.hexCode ?? '#000',
                            }}
                          />
                          <strong>{color?.name}</strong> /{' '}
                          <strong>{size?.label}</strong>
                        </span>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <label
                            style={{ fontSize: '12px', color: 'var(--muted)' }}
                          >
                            재고 수량:
                          </label>
                          <input
                            type="number"
                            min={0}
                            className="ws-input"
                            style={{
                              width: '88px',
                              minHeight: '30px',
                              padding: '4px 8px',
                            }}
                            value={opt.stockQuantity}
                            onChange={e =>
                              handleOptionStockChange(
                                idx,
                                Number(e.target.value),
                              )
                            }
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
                    setProductModalOpen(false)
                  }}
                >
                  취소
                </button>
                <button type="submit" className="ws-btn ws-btn-primary">
                  상품 등록 신청
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
