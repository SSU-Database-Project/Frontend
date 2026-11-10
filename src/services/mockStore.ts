import totePhoto from '../assets/seam-tote.webp'
import type {
  Brand,
  BrandSalesSummary,
  BrandStatus,
  Category,
  ColorOption,
  Gender,
  Product,
  ProductOption,
  ProductStatus,
  SalesStatPoint,
  SellerShipment,
  ShipmentStatus,
  SizeOption,
  StatPeriod,
  StockHistoryItem,
  TopProductStat,
  UserItem,
} from '../types/commerce'

const STORAGE_KEY = 'seam_mock_db_v4'
export const CURRENT_SELLER_ID = 2

function createSvgSample(bg: string, fg: string, title: string, subtitle: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
    <rect width="600" height="750" fill="${bg}"/>
    <rect x="44" y="44" width="512" height="662" fill="none" stroke="${fg}" stroke-opacity="0.22" stroke-width="2"/>
    <text x="72" y="108" fill="${fg}" font-family="Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="2">SEAM ARCHIVE</text>
    <text x="72" y="610" fill="${fg}" font-family="Arial, sans-serif" font-size="34" font-weight="800">${title}</text>
    <text x="72" y="650" fill="${fg}" fill-opacity="0.75" font-family="Arial, sans-serif" font-size="18" font-weight="600">${subtitle}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export const SAMPLE_PRODUCT_IMAGES: { label: string; url: string }[] = [
  { label: '캔버스 토트백 (기본 샘플)', url: totePhoto },
  {
    label: '울 발마칸 코트 (아우터 샘플)',
    url: createSvgSample('#2b3036', '#f4f3ef', 'WOOL BALMACAAN COAT', 'OUTERWEAR · 26FW COLLECTION'),
  },
  {
    label: '헤비웨이트 스웻셔츠 (상의 샘플)',
    url: createSvgSample('#d8dad5', '#1c201e', 'HEAVYWEIGHT SWEAT', 'TOP · UNISEX ARCHIVE'),
  },
  {
    label: '와이드 셀비지 데님 (바지 샘플)',
    url: createSvgSample('#23395d', '#f5f6f8', 'WIDE SELVEDGE DENIM', 'BOTTOM · INDIGO WASHED'),
  },
  {
    label: '더비 레더 로퍼 (신발 샘플)',
    url: createSvgSample('#3b2e28', '#ede6df', 'DERBY LEATHER LOAFER', 'FOOTWEAR · HANDCRAFTED'),
  },
  {
    label: '캐시미어 머플러 (액세서리 샘플)',
    url: createSvgSample('#cfc4b4', '#22201e', 'CASHMERE MUFFLER', 'ACCESSORY · FREE SIZE'),
  },
]

export const FIXED_CATEGORIES: Category[] = [
  // 대분류 (parentId: null)
  { id: 1, parentId: null, name: '상의', sizeGroup: 'CLOTHING' },
  { id: 2, parentId: null, name: '아우터', sizeGroup: 'CLOTHING' },
  { id: 3, parentId: null, name: '바지', sizeGroup: 'CLOTHING' },
  { id: 4, parentId: null, name: '원피스·스커트', sizeGroup: 'CLOTHING' },
  { id: 5, parentId: null, name: '신발', sizeGroup: 'SHOES' },
  { id: 6, parentId: null, name: '가방', sizeGroup: 'FREE' },
  { id: 7, parentId: null, name: '모자', sizeGroup: 'FREE' },
  { id: 8, parentId: null, name: '액세서리', sizeGroup: 'FREE' },
  // 소분류 (leaf categories)
  { id: 101, parentId: 1, name: '맨투맨·스웻셔츠', sizeGroup: 'CLOTHING' },
  { id: 102, parentId: 1, name: '셔츠·블라우스', sizeGroup: 'CLOTHING' },
  { id: 103, parentId: 1, name: '니트·스웨터', sizeGroup: 'CLOTHING' },
  { id: 104, parentId: 1, name: '반소매 티셔츠', sizeGroup: 'CLOTHING' },
  { id: 201, parentId: 2, name: '코트', sizeGroup: 'CLOTHING' },
  { id: 202, parentId: 2, name: '자켓·블루종', sizeGroup: 'CLOTHING' },
  { id: 203, parentId: 2, name: '패딩·다운', sizeGroup: 'CLOTHING' },
  { id: 301, parentId: 3, name: '데님 팬츠', sizeGroup: 'CLOTHING' },
  { id: 302, parentId: 3, name: '슬랙스·트라우저', sizeGroup: 'CLOTHING' },
  { id: 303, parentId: 3, name: '코튼 팬츠', sizeGroup: 'CLOTHING' },
  { id: 401, parentId: 4, name: '미디·롱 스커트', sizeGroup: 'CLOTHING' },
  { id: 402, parentId: 4, name: '캐주얼 원피스', sizeGroup: 'CLOTHING' },
  { id: 501, parentId: 5, name: '구두·로퍼', sizeGroup: 'SHOES' },
  { id: 502, parentId: 5, name: '스니커즈', sizeGroup: 'SHOES' },
  { id: 503, parentId: 5, name: '부츠', sizeGroup: 'SHOES' },
  { id: 601, parentId: 6, name: '토트·숄더백', sizeGroup: 'FREE' },
  { id: 602, parentId: 6, name: '백팩·크로스백', sizeGroup: 'FREE' },
  { id: 701, parentId: 7, name: '볼캡·비니', sizeGroup: 'FREE' },
  { id: 801, parentId: 8, name: '머플러·스카프', sizeGroup: 'FREE' },
  { id: 802, parentId: 8, name: '벨트·주얼리', sizeGroup: 'FREE' },
]

export const FIXED_COLORS: ColorOption[] = [
  { id: 1, name: '블랙', hexCode: '#181818' },
  { id: 2, name: '화이트', hexCode: '#f8f8f6' },
  { id: 3, name: '네이비', hexCode: '#1c2d4a' },
  { id: 4, name: '코발트 블루', hexCode: '#2041bc' },
  { id: 5, name: '그레이', hexCode: '#8c908c' },
  { id: 6, name: '차콜', hexCode: '#3b3e3c' },
  { id: 7, name: '베이지', hexCode: '#d2c2aa' },
  { id: 8, name: '크림', hexCode: '#efeadd' },
  { id: 9, name: '카키', hexCode: '#555d47' },
  { id: 10, name: '브라운', hexCode: '#654633' },
  { id: 11, name: '버건디', hexCode: '#68212b' },
  { id: 12, name: '데님 블루', hexCode: '#3b5b8c' },
]

export const FIXED_SIZES: SizeOption[] = [
  { id: 1, sizeGroup: 'CLOTHING', label: 'S' },
  { id: 2, sizeGroup: 'CLOTHING', label: 'M' },
  { id: 3, sizeGroup: 'CLOTHING', label: 'L' },
  { id: 4, sizeGroup: 'CLOTHING', label: 'XL' },
  { id: 5, sizeGroup: 'SHOES', label: '230' },
  { id: 6, sizeGroup: 'SHOES', label: '240' },
  { id: 7, sizeGroup: 'SHOES', label: '250' },
  { id: 8, sizeGroup: 'SHOES', label: '260' },
  { id: 9, sizeGroup: 'SHOES', label: '270' },
  { id: 10, sizeGroup: 'SHOES', label: '280' },
  { id: 11, sizeGroup: 'FREE', label: 'FREE' },
]

export type SellerTabKey = 'brands' | 'products' | 'inventory' | 'orders' | 'stats'
export type AdminTabKey = 'brands' | 'products' | 'users' | 'stats'

export type UnreadChangesState = {
  SELLER: Record<SellerTabKey, number>
  ADMIN: Record<AdminTabKey, number>
}

type MockDatabase = {
  users: UserItem[]
  brands: Brand[]
  products: Product[]
  stockHistory: StockHistoryItem[]
  shipments: SellerShipment[]
  unreadChanges: UnreadChangesState
  nextIds: {
    brand: number
    product: number
    option: number
    history: number
    shipment: number
  }
}

function createInitialUnreadChanges(): UnreadChangesState {
  return {
    SELLER: {
      brands: 1,
      products: 1,
      inventory: 0,
      orders: 1,
      stats: 0,
    },
    ADMIN: {
      brands: 1,
      products: 1,
      users: 0,
      stats: 0,
    },
  }
}

function createInitialDatabase(): MockDatabase {
  const users: UserItem[] = [
    {
      id: 1,
      email: 'admin@seam.kr',
      name: '플랫폼 총괄관리자',
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: '2026-10-01T09:00:00',
    },
    {
      id: 2,
      email: 'seller@seam.kr',
      name: '김도현 (심스튜디오)',
      role: 'SELLER',
      status: 'ACTIVE',
      createdAt: '2026-10-05T11:20:00',
      sellerInfo: {
        businessNumber: '2148801923',
        companyName: '(주)심스튜디오',
        representativeName: '김도현',
      },
    },
    {
      id: 3,
      email: 'atelier@seam.kr',
      name: '이서윤 (아틀리에케이)',
      role: 'SELLER',
      status: 'ACTIVE',
      createdAt: '2026-10-12T14:10:00',
      sellerInfo: {
        businessNumber: '1098144210',
        companyName: '아틀리에케이 주식회사',
        representativeName: '이서윤',
      },
    },
    {
      id: 4,
      email: 'minji.kim@example.com',
      name: '김민지',
      role: 'USER',
      status: 'ACTIVE',
      createdAt: '2026-10-18T16:40:00',
    },
    {
      id: 5,
      email: 'junho.lee@example.com',
      name: '이준호',
      role: 'USER',
      status: 'ACTIVE',
      createdAt: '2026-10-22T19:05:00',
    },
    {
      id: 6,
      email: 'soyeon.park@example.com',
      name: '박소연',
      role: 'USER',
      status: 'SUSPENDED',
      createdAt: '2026-10-28T10:15:00',
    },
  ]

  const brands: Brand[] = [
    {
      id: 1,
      sellerId: 2,
      sellerName: '(주)심스튜디오',
      name: 'SEAM STUDIO',
      description: '절제된 테일러링과 실용적인 원단을 결합한 컨템포러리 에센셜 브랜드',
      status: 'APPROVED',
      createdAt: '2026-10-06T10:00:00',
    },
    {
      id: 2,
      sellerId: 2,
      sellerName: '(주)심스튜디오',
      name: 'NOIR ARCHIVE',
      description: '모노톤 기반의 미니멀 아우터 및 레더 굿즈 라인',
      status: 'PENDING',
      createdAt: '2026-11-09T15:30:00',
    },
    {
      id: 3,
      sellerId: 2,
      sellerName: '(주)심스튜디오',
      name: 'RAW LINE',
      description: '워싱 데님 및 빈티지 워크웨어 캡슐 라인',
      status: 'REJECTED',
      rejectReason: '동일 상표권 확인 서류 누락 및 브랜드 소개 상세화가 필요합니다.',
      createdAt: '2026-11-02T11:20:00',
    },
    {
      id: 4,
      sellerId: 3,
      sellerName: '아틀리에케이 주식회사',
      name: 'ATELIER K',
      description: '천연 울·캐시미어 니트웨어 및 겨울 액세서리 하우스',
      status: 'APPROVED',
      createdAt: '2026-10-14T13:00:00',
    },
  ]

  const products: Product[] = [
    {
      id: 101,
      brandId: 1,
      brandName: 'SEAM STUDIO',
      sellerId: 2,
      sellerName: '(주)심스튜디오',
      categoryId: 601,
      parentCategoryName: '가방',
      categoryName: '토트·숄더백',
      sizeGroup: 'FREE',
      name: '헤비 캔버스 스티치 토트백',
      productCode: 'SEAM-26FW-001',
      gender: 'UNISEX',
      season: '26FW',
      shipDays: 1,
      price: 89000,
      imageUrl: SAMPLE_PRODUCT_IMAGES[0].url,
      status: 'ON_SALE',
      createdAt: '2026-10-15T10:00:00',
      options: [
        {
          id: 1001,
          productId: 101,
          colorId: 4,
          colorName: '코발트 블루',
          hexCode: '#2041bc',
          sizeId: 11,
          sizeLabel: 'FREE',
          stockQuantity: 28,
        },
        {
          id: 1002,
          productId: 101,
          colorId: 1,
          colorName: '블랙',
          hexCode: '#181818',
          sizeId: 11,
          sizeLabel: 'FREE',
          stockQuantity: 14,
        },
      ],
    },
    {
      id: 102,
      brandId: 1,
      brandName: 'SEAM STUDIO',
      sellerId: 2,
      sellerName: '(주)심스튜디오',
      categoryId: 201,
      parentCategoryName: '아우터',
      categoryName: '코트',
      sizeGroup: 'CLOTHING',
      name: '울 블렌드 오버핏 발마칸 코트',
      productCode: 'SEAM-26FW-002',
      gender: 'UNISEX',
      season: '26FW',
      shipDays: 2,
      price: 289000,
      imageUrl: SAMPLE_PRODUCT_IMAGES[1].url,
      status: 'ON_SALE',
      createdAt: '2026-10-20T14:30:00',
      options: [
        {
          id: 1003,
          productId: 102,
          colorId: 6,
          colorName: '차콜',
          hexCode: '#3b3e3c',
          sizeId: 2,
          sizeLabel: 'M',
          stockQuantity: 9,
        },
        {
          id: 1004,
          productId: 102,
          colorId: 6,
          colorName: '차콜',
          hexCode: '#3b3e3c',
          sizeId: 3,
          sizeLabel: 'L',
          stockQuantity: 6,
        },
        {
          id: 1005,
          productId: 102,
          colorId: 1,
          colorName: '블랙',
          hexCode: '#181818',
          sizeId: 3,
          sizeLabel: 'L',
          stockQuantity: 3,
        },
      ],
    },
    {
      id: 103,
      brandId: 1,
      brandName: 'SEAM STUDIO',
      sellerId: 2,
      sellerName: '(주)심스튜디오',
      categoryId: 101,
      parentCategoryName: '상의',
      categoryName: '맨투맨·스웻셔츠',
      sizeGroup: 'CLOTHING',
      name: '헤비웨이트 루즈핏 아카이브 스웻셔츠',
      productCode: 'SEAM-26FW-003',
      gender: 'UNISEX',
      season: '26FW',
      shipDays: 2,
      price: 78000,
      imageUrl: SAMPLE_PRODUCT_IMAGES[2].url,
      status: 'PENDING',
      createdAt: '2026-11-09T17:10:00',
      options: [
        {
          id: 1006,
          productId: 103,
          colorId: 5,
          colorName: '그레이',
          hexCode: '#8c908c',
          sizeId: 2,
          sizeLabel: 'M',
          stockQuantity: 20,
        },
        {
          id: 1007,
          productId: 103,
          colorId: 5,
          colorName: '그레이',
          hexCode: '#8c908c',
          sizeId: 3,
          sizeLabel: 'L',
          stockQuantity: 25,
        },
        {
          id: 1008,
          productId: 103,
          colorId: 3,
          colorName: '네이비',
          hexCode: '#1c2d4a',
          sizeId: 3,
          sizeLabel: 'L',
          stockQuantity: 15,
        },
      ],
    },
    {
      id: 104,
      brandId: 1,
      brandName: 'SEAM STUDIO',
      sellerId: 2,
      sellerName: '(주)심스튜디오',
      categoryId: 301,
      parentCategoryName: '바지',
      categoryName: '데님 팬츠',
      sizeGroup: 'CLOTHING',
      name: '와이드 셀비지 데님 트라우저',
      productCode: 'SEAM-26FW-004',
      gender: 'MALE',
      season: '26FW',
      shipDays: 3,
      price: 138000,
      imageUrl: SAMPLE_PRODUCT_IMAGES[3].url,
      status: 'REJECTED',
      rejectReason: '상세 스펙의 소재 혼용률 표기가 누락되어 보완 후 재신청 바랍니다.',
      createdAt: '2026-11-04T11:00:00',
      options: [
        {
          id: 1009,
          productId: 104,
          colorId: 12,
          colorName: '데님 블루',
          hexCode: '#3b5b8c',
          sizeId: 2,
          sizeLabel: 'M',
          stockQuantity: 12,
        },
        {
          id: 1010,
          productId: 104,
          colorId: 12,
          colorName: '데님 블루',
          hexCode: '#3b5b8c',
          sizeId: 3,
          sizeLabel: 'L',
          stockQuantity: 10,
        },
      ],
    },
    {
      id: 105,
      brandId: 1,
      brandName: 'SEAM STUDIO',
      sellerId: 2,
      sellerName: '(주)심스튜디오',
      categoryId: 501,
      parentCategoryName: '신발',
      categoryName: '구두·로퍼',
      sizeGroup: 'SHOES',
      name: '스퀘어토 더비 레더 로퍼',
      productCode: 'SEAM-26FW-005',
      gender: 'UNISEX',
      season: '26FW',
      shipDays: 3,
      price: 198000,
      imageUrl: SAMPLE_PRODUCT_IMAGES[4].url,
      status: 'SOLD_OUT',
      createdAt: '2026-10-25T09:30:00',
      options: [
        {
          id: 1011,
          productId: 105,
          colorId: 1,
          colorName: '블랙',
          hexCode: '#181818',
          sizeId: 8,
          sizeLabel: '260',
          stockQuantity: 0,
        },
        {
          id: 1012,
          productId: 105,
          colorId: 10,
          colorName: '브라운',
          hexCode: '#654633',
          sizeId: 9,
          sizeLabel: '270',
          stockQuantity: 2,
        },
      ],
    },
    {
      id: 106,
      brandId: 4,
      brandName: 'ATELIER K',
      sellerId: 3,
      sellerName: '아틀리에케이 주식회사',
      categoryId: 801,
      parentCategoryName: '액세서리',
      categoryName: '머플러·스카프',
      sizeGroup: 'FREE',
      name: '퓨어 캐시미어 프린지 머플러',
      productCode: 'ATEL-26FW-010',
      gender: 'FEMALE',
      season: '26FW',
      shipDays: 1,
      price: 145000,
      imageUrl: SAMPLE_PRODUCT_IMAGES[5].url,
      status: 'ON_SALE',
      createdAt: '2026-10-27T12:00:00',
      options: [
        {
          id: 1013,
          productId: 106,
          colorId: 7,
          colorName: '베이지',
          hexCode: '#d2c2aa',
          sizeId: 11,
          sizeLabel: 'FREE',
          stockQuantity: 18,
        },
      ],
    },
  ]

  const stockHistory: StockHistoryItem[] = [
    {
      id: 1,
      optionId: 1001,
      productId: 101,
      productName: '헤비 캔버스 스티치 토트백',
      productCode: 'SEAM-26FW-001',
      colorName: '코발트 블루',
      sizeLabel: 'FREE',
      changeQty: 30,
      quantityAfter: 30,
      type: 'IN',
      memo: '초기 입고',
      createdAt: '2026-10-15T10:00:00',
    },
    {
      id: 2,
      optionId: 1001,
      productId: 101,
      productName: '헤비 캔버스 스티치 토트백',
      productCode: 'SEAM-26FW-001',
      colorName: '코발트 블루',
      sizeLabel: 'FREE',
      changeQty: -2,
      quantityAfter: 28,
      type: 'ORDER',
      orderItemId: 5001,
      memo: '주문 차감 (ORD-20261108-01)',
      createdAt: '2026-11-08T14:22:00',
    },
    {
      id: 3,
      optionId: 1003,
      productId: 102,
      productName: '울 블렌드 오버핏 발마칸 코트',
      productCode: 'SEAM-26FW-002',
      colorName: '차콜',
      sizeLabel: 'M',
      changeQty: 10,
      quantityAfter: 10,
      type: 'IN',
      memo: '26FW 1차 생산 입고',
      createdAt: '2026-10-20T14:30:00',
    },
    {
      id: 4,
      optionId: 1003,
      productId: 102,
      productName: '울 블렌드 오버핏 발마칸 코트',
      productCode: 'SEAM-26FW-002',
      colorName: '차콜',
      sizeLabel: 'M',
      changeQty: -1,
      quantityAfter: 9,
      type: 'ORDER',
      orderItemId: 5002,
      memo: '주문 차감 (ORD-20261109-02)',
      createdAt: '2026-11-09T11:05:00',
    },
    {
      id: 5,
      optionId: 1011,
      productId: 105,
      productName: '스퀘어토 더비 레더 로퍼',
      productCode: 'SEAM-26FW-005',
      colorName: '블랙',
      sizeLabel: '260',
      changeQty: -3,
      quantityAfter: 0,
      type: 'ADJUST',
      memo: '오프라인 쇼룸 디스플레이 이동',
      createdAt: '2026-11-06T17:40:00',
    },
  ]

  const shipments: SellerShipment[] = [
    {
      id: 301,
      orderId: 9001,
      orderNumber: 'ORD-20261110-01',
      sellerId: 2,
      brandName: 'SEAM STUDIO',
      buyerName: '김민지',
      buyerEmail: 'minji.kim@example.com',
      address: '서울특별시 성동구 연무장길 45, 3층',
      status: 'ORDERED',
      totalAmount: 178000,
      createdAt: '2026-11-10T10:15:00',
      items: [
        {
          id: 5001,
          optionId: 1001,
          productId: 101,
          productName: '헤비 캔버스 스티치 토트백',
          productCode: 'SEAM-26FW-001',
          colorName: '코발트 블루',
          sizeLabel: 'FREE',
          unitPrice: 89000,
          quantity: 2,
        },
      ],
    },
    {
      id: 302,
      orderId: 9002,
      orderNumber: 'ORD-20261109-02',
      sellerId: 2,
      brandName: 'SEAM STUDIO',
      buyerName: '이준호',
      buyerEmail: 'junho.lee@example.com',
      address: '서울특별시 강남구 압구정로 12길 18, 202호',
      status: 'PREPARING',
      totalAmount: 289000,
      createdAt: '2026-11-09T11:05:00',
      items: [
        {
          id: 5002,
          optionId: 1003,
          productId: 102,
          productName: '울 블렌드 오버핏 발마칸 코트',
          productCode: 'SEAM-26FW-002',
          colorName: '차콜',
          sizeLabel: 'M',
          unitPrice: 289000,
          quantity: 1,
        },
      ],
    },
    {
      id: 303,
      orderId: 9003,
      orderNumber: 'ORD-20261108-03',
      sellerId: 2,
      brandName: 'SEAM STUDIO',
      buyerName: '김민지',
      buyerEmail: 'minji.kim@example.com',
      address: '서울특별시 마포구 독막로 9길 21, 101동 903호',
      status: 'SHIPPING',
      totalAmount: 378000,
      createdAt: '2026-11-08T16:40:00',
      items: [
        {
          id: 5003,
          optionId: 1004,
          productId: 102,
          productName: '울 블렌드 오버핏 발마칸 코트',
          productCode: 'SEAM-26FW-002',
          colorName: '차콜',
          sizeLabel: 'L',
          unitPrice: 289000,
          quantity: 1,
        },
        {
          id: 5004,
          optionId: 1002,
          productId: 101,
          productName: '헤비 캔버스 스티치 토트백',
          productCode: 'SEAM-26FW-001',
          colorName: '블랙',
          sizeLabel: 'FREE',
          unitPrice: 89000,
          quantity: 1,
        },
      ],
    },
    {
      id: 304,
      orderId: 9004,
      orderNumber: 'ORD-20261106-04',
      sellerId: 2,
      brandName: 'SEAM STUDIO',
      buyerName: '이준호',
      buyerEmail: 'junho.lee@example.com',
      address: '경기도 성남시 분당구 판교역로 192, 7층',
      status: 'DELIVERED',
      totalAmount: 198000,
      createdAt: '2026-11-06T13:10:00',
      items: [
        {
          id: 5005,
          optionId: 1012,
          productId: 105,
          productName: '스퀘어토 더비 레더 로퍼',
          productCode: 'SEAM-26FW-005',
          colorName: '브라운',
          sizeLabel: '270',
          unitPrice: 198000,
          quantity: 1,
        },
      ],
    },
    {
      id: 305,
      orderId: 9005,
      orderNumber: 'ORD-20261103-05',
      sellerId: 2,
      brandName: 'SEAM STUDIO',
      buyerName: '김민지',
      buyerEmail: 'minji.kim@example.com',
      address: '서울특별시 용산구 이태원로 240, 4층',
      status: 'CONFIRMED',
      confirmedAt: '2026-11-05T18:00:00',
      totalAmount: 578000,
      createdAt: '2026-11-03T09:50:00',
      items: [
        {
          id: 5006,
          optionId: 1005,
          productId: 102,
          productName: '울 블렌드 오버핏 발마칸 코트',
          productCode: 'SEAM-26FW-002',
          colorName: '블랙',
          sizeLabel: 'L',
          unitPrice: 289000,
          quantity: 2,
        },
      ],
    },
    {
      id: 306,
      orderId: 9006,
      orderNumber: 'ORD-20261101-06',
      sellerId: 2,
      brandName: 'SEAM STUDIO',
      buyerName: '박소연',
      buyerEmail: 'soyeon.park@example.com',
      address: '부산광역시 해운대구 센텀중앙로 78, 1201호',
      status: 'CANCELED',
      canceledAt: '2026-11-01T15:30:00',
      totalAmount: 89000,
      createdAt: '2026-11-01T14:00:00',
      items: [
        {
          id: 5007,
          optionId: 1001,
          productId: 101,
          productName: '헤비 캔버스 스티치 토트백',
          productCode: 'SEAM-26FW-001',
          colorName: '코발트 블루',
          sizeLabel: 'FREE',
          unitPrice: 89000,
          quantity: 1,
        },
      ],
    },
  ]

  return {
    users,
    brands,
    products,
    stockHistory,
    shipments,
    unreadChanges: createInitialUnreadChanges(),
    nextIds: {
      brand: 5,
      product: 107,
      option: 1014,
      history: 6,
      shipment: 307,
    },
  }
}

function ensureUnreadChanges(db: MockDatabase): UnreadChangesState {
  const fallback = createInitialUnreadChanges()
  if (!db.unreadChanges) {
    db.unreadChanges = fallback
  } else {
    db.unreadChanges.SELLER = { ...fallback.SELLER, ...db.unreadChanges.SELLER }
    db.unreadChanges.ADMIN = { ...fallback.ADMIN, ...db.unreadChanges.ADMIN }
  }
  return db.unreadChanges
}

function loadDb(): MockDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const initial = createInitialDatabase()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
      return initial
    }
    const parsed = JSON.parse(raw) as MockDatabase
    if (!parsed.unreadChanges) {
      ensureUnreadChanges(parsed)
      saveDb(parsed)
    }
    return parsed
  } catch {
    return createInitialDatabase()
  }
}

function saveDb(db: MockDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // Ignore storage quota errors in restricted environments
  }
}

export function resetMockStore(): void {
  const initial = createInitialDatabase()
  saveDb(initial)
}

export function getUnreadChanges(): UnreadChangesState {
  const db = loadDb()
  return ensureUnreadChanges(db)
}

export function clearSellerTabBadge(tab: SellerTabKey): void {
  const db = loadDb()
  const unread = ensureUnreadChanges(db)
  if (unread.SELLER[tab] !== 0) {
    unread.SELLER[tab] = 0
    saveDb(db)
  }
}

export function clearAdminTabBadge(tab: AdminTabKey): void {
  const db = loadDb()
  const unread = ensureUnreadChanges(db)
  if (unread.ADMIN[tab] !== 0) {
    unread.ADMIN[tab] = 0
    saveDb(db)
  }
}

export function registerMockUser(input: { name: string; email: string }): void {
  const trimmedName = input.name.trim()
  const trimmedEmail = input.email.trim()
  if (!trimmedName && !trimmedEmail) return
  const db = loadDb()
  const unread = ensureUnreadChanges(db)
  const exists = db.users.some(
    u => u.email.toLowerCase() === trimmedEmail.toLowerCase(),
  )
  if (!exists) {
    const nextUserId = db.users.reduce((max, u) => Math.max(max, u.id), 0) + 1
    db.users.push({
      id: nextUserId,
      email: trimmedEmail || `user${nextUserId}@example.com`,
      name: trimmedName || `신규회원#${nextUserId}`,
      role: 'USER',
      status: 'ACTIVE',
      createdAt: new Date().toISOString().slice(0, 19),
    })
  }
  unread.ADMIN.users += 1
  saveDb(db)
}

export function getCatalogData() {
  const rootCategories = FIXED_CATEGORIES.filter(c => c.parentId === null)
  const leafCategories = FIXED_CATEGORIES.filter(c => c.parentId !== null)
  return {
    categories: FIXED_CATEGORIES,
    rootCategories,
    leafCategories,
    colors: FIXED_COLORS,
    sizes: FIXED_SIZES,
    sampleImages: SAMPLE_PRODUCT_IMAGES,
  }
}

// ============================================================================
// SELLER: BRAND APIs
// ============================================================================

export type InitialProductDraftInput = {
  categoryId: number
  name: string
  productCode: string
  gender: Gender
  season: string
  shipDays: number
  price: number
  imageUrl: string
  options: ProductOptionInput[]
}

function validateInitialProductDraftWithDb(
  db: MockDatabase,
  draft: InitialProductDraftInput,
  existingBrandId?: number,
) {
  const category = FIXED_CATEGORIES.find(c => c.id === draft.categoryId)
  if (!category || category.parentId === null) {
    throw new Error('소분류 카테고리를 선택해 주세요.')
  }

  const trimmedProductName = draft.name.trim()
  const trimmedProductCode = draft.productCode.trim().toUpperCase()
  if (!trimmedProductName || !trimmedProductCode) {
    throw new Error('상품명과 품번을 모두 입력해 주세요.')
  }

  if (existingBrandId !== undefined) {
    const duplicateCode = db.products.some(
      p =>
        p.brandId === existingBrandId &&
        p.productCode.toUpperCase() === trimmedProductCode &&
        p.status !== 'DELETED',
    )
    if (duplicateCode) {
      throw new Error('해당 브랜드 내에 동일한 품번이 이미 존재합니다.')
    }
  }

  if (!/^\d{2}(SS|FW)$/i.test(draft.season.trim())) {
    throw new Error('시즌은 24SS, 24FW, 26FW 형식으로 입력해 주세요.')
  }

  if (draft.shipDays < 0 || draft.shipDays > 30 || Number.isNaN(draft.shipDays)) {
    throw new Error('출고 예정일은 0일~30일 사이여야 합니다.')
  }

  if (draft.price <= 0 || Number.isNaN(draft.price)) {
    throw new Error('판매 가격은 0원보다 커야 합니다.')
  }

  if (!draft.options || !draft.options.length) {
    throw new Error('최소 1개 이상의 색상×사이즈 옵션을 추가해 주세요.')
  }

  const comboSet = new Set<string>()
  for (const opt of draft.options) {
    const color = FIXED_COLORS.find(c => c.id === opt.colorId)
    const size = FIXED_SIZES.find(s => s.id === opt.sizeId)
    if (!color || !size) {
      throw new Error('유효하지 않은 색상 또는 사이즈입니다.')
    }
    if (size.sizeGroup !== category.sizeGroup) {
      throw new Error(
        `선택한 카테고리(${category.name})의 사이즈 체계(${category.sizeGroup})와 맞지 않는 옵션이 있습니다.`,
      )
    }
    if (opt.stockQuantity < 0) {
      throw new Error('재고 수량은 0 이상이어야 합니다.')
    }
    const key = `${opt.colorId}-${opt.sizeId}`
    if (comboSet.has(key)) {
      throw new Error('동일한 색상×사이즈 조합이 중복되었습니다.')
    }
    comboSet.add(key)
  }

  const parentCategory = FIXED_CATEGORIES.find(c => c.id === category.parentId)
  return { category, parentCategory, trimmedProductName, trimmedProductCode }
}

export function validateInitialProductDraft(
  draft: InitialProductDraftInput,
  brandName?: string,
): void {
  const db = loadDb()
  const trimmedBrand = brandName?.trim().toLowerCase()
  const existingBrand = trimmedBrand
    ? db.brands.find(b => b.name.toLowerCase() === trimmedBrand)
    : undefined
  validateInitialProductDraftWithDb(db, draft, existingBrand?.id)
}

export function getSellerBrands(sellerId: number = CURRENT_SELLER_ID): Brand[] {
  const db = loadDb()
  // 이미 등록(승인 완료)된 브랜드는 별도 신청 없이 모든 판매자가 즉시 사용 가능
  return db.brands
    .filter(b => b.sellerId === sellerId || b.status === 'APPROVED')
    .sort((a, b) => b.id - a.id)
}

export function createSellerBrand(input: {
  name: string
  description: string
  sellerId?: number
  initialProduct: InitialProductDraftInput
}): Brand {
  const db = loadDb()
  const unread = ensureUnreadChanges(db)
  const sellerId = input.sellerId ?? CURRENT_SELLER_ID
  const trimmedName = input.name.trim()
  if (!trimmedName) {
    throw new Error('브랜드명을 입력해 주세요.')
  }
  if (!input.initialProduct) {
    throw new Error('브랜드 등록 시 초기 대표 상품 1건을 필수로 함께 신청해야 합니다.')
  }

  const seller = db.users.find(u => u.id === sellerId)
  const sellerName = seller?.sellerInfo?.companyName ?? seller?.name ?? '판매자'
  const now = new Date().toISOString().slice(0, 19)

  const existingBrand = db.brands.find(
    b => b.name.toLowerCase() === trimmedName.toLowerCase(),
  )

  if (existingBrand && existingBrand.sellerId === sellerId && existingBrand.status === 'PENDING') {
    throw new Error('현재 승인 대기 중인 브랜드입니다.')
  }

  // 초기 대표 상품 검증 (동일 브랜드 내 품번 중복 검사 포함)
  const { category, parentCategory, trimmedProductName, trimmedProductCode } =
    validateInitialProductDraftWithDb(db, input.initialProduct, existingBrand?.id)

  let targetBrand: Brand
  let brandChanged = false

  if (existingBrand) {
    if (existingBrand.status === 'APPROVED') {
      // 이미 등록(승인)되어 있는 브랜드는 별도 신청 없이 바로 사용 가능
      targetBrand = existingBrand
    } else {
      // 거절되었거나 미승인 상태인 기존 브랜드는 재신청으로 갱신
      existingBrand.sellerId = sellerId
      existingBrand.sellerName = sellerName
      existingBrand.description = input.description.trim() || existingBrand.description
      existingBrand.status = 'PENDING'
      existingBrand.rejectReason = undefined
      existingBrand.createdAt = now
      targetBrand = existingBrand
      brandChanged = true
    }
  } else {
    targetBrand = {
      id: db.nextIds.brand++,
      sellerId,
      sellerName,
      name: trimmedName,
      description: input.description.trim() || '신규 등록 브랜드',
      status: 'PENDING',
      createdAt: now,
    }
    db.brands.push(targetBrand)
    brandChanged = true
  }

  unread.SELLER.brands = 0
  if (brandChanged) {
    unread.ADMIN.brands += 1
  }

  // 브랜드 등록 시 필수 초기 대표 상품 생성
  const draft = input.initialProduct
  const productId = db.nextIds.product++
  let addedStockHistoryCount = 0

  const builtOptions: ProductOption[] = draft.options.map(opt => {
    const color = FIXED_COLORS.find(c => c.id === opt.colorId)!
    const size = FIXED_SIZES.find(s => s.id === opt.sizeId)!
    const optionId = db.nextIds.option++
    const qty = Math.max(0, opt.stockQuantity)
    if (qty > 0) {
      addedStockHistoryCount += 1
      db.stockHistory.unshift({
        id: db.nextIds.history++,
        optionId,
        productId,
        productName: trimmedProductName,
        productCode: trimmedProductCode,
        colorName: color.name,
        sizeLabel: size.label,
        changeQty: qty,
        quantityAfter: qty,
        type: 'IN',
        memo: '브랜드 초기 상품 등록 입고',
        createdAt: now,
      })
    }
    return {
      id: optionId,
      productId,
      colorId: color.id,
      colorName: color.name,
      hexCode: color.hexCode,
      sizeId: size.id,
      sizeLabel: size.label,
      stockQuantity: qty,
    }
  })

  const newProduct: Product = {
    id: productId,
    brandId: targetBrand.id,
    brandName: targetBrand.name,
    sellerId,
    sellerName,
    categoryId: category.id,
    parentCategoryName: parentCategory?.name ?? '패션',
    categoryName: category.name,
    sizeGroup: category.sizeGroup,
    name: trimmedProductName,
    productCode: trimmedProductCode,
    gender: draft.gender,
    season: draft.season.trim().toUpperCase(),
    shipDays: draft.shipDays,
    price: draft.price,
    imageUrl: draft.imageUrl || SAMPLE_PRODUCT_IMAGES[0].url,
    status: 'PENDING',
    createdAt: now,
    options: builtOptions,
  }
  db.products.push(newProduct)
  unread.SELLER.products += 1
  unread.ADMIN.products += 1
  if (addedStockHistoryCount > 0) {
    unread.SELLER.inventory += 1
  }

  saveDb(db)
  return targetBrand
}

export function deleteSellerBrand(
  brandId: number,
  actor: 'SELLER' | 'ADMIN' = 'SELLER',
): void {
  const db = loadDb()
  const unread = ensureUnreadChanges(db)
  const index = db.brands.findIndex(b => b.id === brandId)
  if (index === -1) {
    throw new Error('브랜드를 찾을 수 없습니다.')
  }
  db.brands.splice(index, 1)

  if (actor === 'SELLER') {
    unread.SELLER.brands = 0
    unread.ADMIN.brands += 1
  } else {
    unread.ADMIN.brands = 0
    unread.SELLER.brands += 1
  }

  let deletedProductsCount = 0
  for (const product of db.products) {
    if (product.brandId === brandId && product.status !== 'DELETED') {
      product.status = 'DELETED'
      deletedProductsCount += 1
    }
  }
  if (deletedProductsCount > 0) {
    unread.SELLER.products += deletedProductsCount
    unread.ADMIN.products += deletedProductsCount
  }
  saveDb(db)
}

// ============================================================================
// SELLER: PRODUCT & INVENTORY APIs
// ============================================================================

export type ProductOptionInput = {
  colorId: number
  sizeId: number
  stockQuantity: number
}

export type UpsertProductInput = {
  brandId: number
  categoryId: number
  name: string
  productCode: string
  gender: Gender
  season: string
  shipDays: number
  price: number
  imageUrl: string
  options: ProductOptionInput[]
}

export function getSellerProducts(sellerId: number = CURRENT_SELLER_ID): Product[] {
  const db = loadDb()
  return db.products
    .filter(p => p.sellerId === sellerId && p.status !== 'DELETED')
    .sort((a, b) => b.id - a.id)
}

function validateProductInput(
  db: MockDatabase,
  input: UpsertProductInput,
  editingProductId?: number,
) {
  const brand = db.brands.find(b => b.id === input.brandId)
  if (!brand) {
    throw new Error('선택한 브랜드를 찾을 수 없습니다.')
  }
  if (brand.status !== 'APPROVED') {
    throw new Error('관리자 승인이 완료된 브랜드에만 상품을 등록할 수 있습니다.')
  }

  const category = FIXED_CATEGORIES.find(c => c.id === input.categoryId)
  if (!category || category.parentId === null) {
    throw new Error('소분류 카테고리를 선택해 주세요.')
  }

  const trimmedName = input.name.trim()
  const trimmedCode = input.productCode.trim().toUpperCase()
  if (!trimmedName || !trimmedCode) {
    throw new Error('상품명과 품번을 모두 입력해 주세요.')
  }

  const duplicateCode = db.products.some(
    p =>
      p.brandId === brand.id &&
      p.productCode.toUpperCase() === trimmedCode &&
      p.id !== editingProductId &&
      p.status !== 'DELETED',
  )
  if (duplicateCode) {
    throw new Error('해당 브랜드 내에 동일한 품번이 이미 존재합니다.')
  }

  if (!/^\d{2}(SS|FW)$/i.test(input.season.trim())) {
    throw new Error('시즌은 24SS, 24FW, 26FW 형식으로 입력해 주세요.')
  }

  if (input.shipDays < 0 || input.shipDays > 30 || Number.isNaN(input.shipDays)) {
    throw new Error('출고 예정일은 0일~30일 사이여야 합니다.')
  }

  if (input.price <= 0 || Number.isNaN(input.price)) {
    throw new Error('판매 가격은 0원보다 커야 합니다.')
  }

  if (!input.options.length) {
    throw new Error('최소 1개 이상의 색상×사이즈 옵션을 추가해 주세요.')
  }

  const comboSet = new Set<string>()
  for (const opt of input.options) {
    const color = FIXED_COLORS.find(c => c.id === opt.colorId)
    const size = FIXED_SIZES.find(s => s.id === opt.sizeId)
    if (!color || !size) {
      throw new Error('유효하지 않은 색상 또는 사이즈입니다.')
    }
    if (size.sizeGroup !== category.sizeGroup) {
      throw new Error(
        `선택한 카테고리(${category.name})의 사이즈 체계(${category.sizeGroup})와 맞지 않는 옵션이 있습니다.`,
      )
    }
    if (opt.stockQuantity < 0) {
      throw new Error('재고 수량은 0 이상이어야 합니다.')
    }
    const key = `${opt.colorId}-${opt.sizeId}`
    if (comboSet.has(key)) {
      throw new Error('동일한 색상×사이즈 조합이 중복되었습니다.')
    }
    comboSet.add(key)
  }

  const parentCategory = FIXED_CATEGORIES.find(c => c.id === category.parentId)
  return { brand, category, parentCategory, trimmedName, trimmedCode }
}

export function createSellerProduct(input: UpsertProductInput): Product {
  const db = loadDb()
  const unread = ensureUnreadChanges(db)
  const { brand, category, parentCategory, trimmedName, trimmedCode } =
    validateProductInput(db, input)

  const now = new Date().toISOString().slice(0, 19)
  const productId = db.nextIds.product++
  let addedStockHistoryCount = 0

  const builtOptions: ProductOption[] = input.options.map(opt => {
    const color = FIXED_COLORS.find(c => c.id === opt.colorId)!
    const size = FIXED_SIZES.find(s => s.id === opt.sizeId)!
    const optionId = db.nextIds.option++
    if (opt.stockQuantity > 0) {
      addedStockHistoryCount += 1
      db.stockHistory.unshift({
        id: db.nextIds.history++,
        optionId,
        productId,
        productName: trimmedName,
        productCode: trimmedCode,
        colorName: color.name,
        sizeLabel: size.label,
        changeQty: opt.stockQuantity,
        quantityAfter: opt.stockQuantity,
        type: 'IN',
        memo: '신규 상품 등록 초기 재고',
        createdAt: now,
      })
    }
    return {
      id: optionId,
      productId,
      colorId: color.id,
      colorName: color.name,
      hexCode: color.hexCode,
      sizeId: size.id,
      sizeLabel: size.label,
      stockQuantity: opt.stockQuantity,
    }
  })

  const seller = db.users.find(u => u.id === CURRENT_SELLER_ID)
  const sellerName =
    seller?.sellerInfo?.companyName ?? seller?.name ?? brand.sellerName

  const newProduct: Product = {
    id: productId,
    brandId: brand.id,
    brandName: brand.name,
    sellerId: CURRENT_SELLER_ID,
    sellerName,
    categoryId: category.id,
    parentCategoryName: parentCategory?.name ?? '패션',
    categoryName: category.name,
    sizeGroup: category.sizeGroup,
    name: trimmedName,
    productCode: trimmedCode,
    gender: input.gender,
    season: input.season.trim().toUpperCase(),
    shipDays: input.shipDays,
    price: input.price,
    imageUrl: input.imageUrl || SAMPLE_PRODUCT_IMAGES[0].url,
    status: 'PENDING',
    options: builtOptions,
    createdAt: now,
  }

  db.products.push(newProduct)
  unread.SELLER.products = 0
  unread.ADMIN.products += 1
  if (addedStockHistoryCount > 0) {
    unread.SELLER.inventory += 1
  }
  saveDb(db)
  return newProduct
}

export function updateSellerProduct(
  productId: number,
  input: UpsertProductInput,
): Product {
  const db = loadDb()
  const unread = ensureUnreadChanges(db)
  const product = db.products.find(p => p.id === productId)
  if (!product) {
    throw new Error('상품을 찾을 수 없습니다.')
  }
  if (product.status === 'BLOCKED' || product.status === 'DELETED') {
    throw new Error('차단되었거나 삭제된 상품은 수정할 수 없습니다.')
  }

  const { brand, category, parentCategory, trimmedName, trimmedCode } =
    validateProductInput(db, input, productId)

  const now = new Date().toISOString().slice(0, 19)
  let inventoryChanged = product.options.length !== input.options.length
  const updatedOptions: ProductOption[] = input.options.map(opt => {
    const existing = product.options.find(
      o => o.colorId === opt.colorId && o.sizeId === opt.sizeId,
    )
    const color = FIXED_COLORS.find(c => c.id === opt.colorId)!
    const size = FIXED_SIZES.find(s => s.id === opt.sizeId)!
    if (existing) {
      if (existing.stockQuantity !== opt.stockQuantity) {
        inventoryChanged = true
      }
      return {
        ...existing,
        stockQuantity: opt.stockQuantity,
      }
    }
    inventoryChanged = true
    const optionId = db.nextIds.option++
    if (opt.stockQuantity > 0) {
      db.stockHistory.unshift({
        id: db.nextIds.history++,
        optionId,
        productId,
        productName: trimmedName,
        productCode: trimmedCode,
        colorName: color.name,
        sizeLabel: size.label,
        changeQty: opt.stockQuantity,
        quantityAfter: opt.stockQuantity,
        type: 'IN',
        memo: '옵션 추가 초기 입고',
        createdAt: now,
      })
    }
    return {
      id: optionId,
      productId,
      colorId: color.id,
      colorName: color.name,
      hexCode: color.hexCode,
      sizeId: size.id,
      sizeLabel: size.label,
      stockQuantity: opt.stockQuantity,
    }
  })

  product.brandId = brand.id
  product.brandName = brand.name
  product.categoryId = category.id
  product.parentCategoryName = parentCategory?.name ?? '패션'
  product.categoryName = category.name
  product.sizeGroup = category.sizeGroup
  product.name = trimmedName
  product.productCode = trimmedCode
  product.gender = input.gender
  product.season = input.season.trim().toUpperCase()
  product.shipDays = input.shipDays
  product.price = input.price
  product.imageUrl = input.imageUrl || product.imageUrl
  product.options = updatedOptions
  // 명세서 V4: 정보 수정 시 재승인 대기(PENDING), 승인 전까지 구매자에게 숨김
  product.status = 'PENDING'
  product.rejectReason = undefined

  unread.SELLER.products = 0
  unread.ADMIN.products += 1
  if (inventoryChanged) {
    unread.SELLER.inventory += 1
  }

  saveDb(db)
  return product
}

export function updateSellerProductSaleStatus(
  productId: number,
  nextStatus: 'ON_SALE' | 'SOLD_OUT',
): Product {
  const db = loadDb()
  const unread = ensureUnreadChanges(db)
  const product = db.products.find(p => p.id === productId)
  if (!product) {
    throw new Error('상품을 찾을 수 없습니다.')
  }
  if (product.status !== 'ON_SALE' && product.status !== 'SOLD_OUT') {
    throw new Error('승인된 상품만 판매중/품절 상태를 전환할 수 있습니다.')
  }
  product.status = nextStatus
  unread.SELLER.products = 0
  unread.ADMIN.products += 1
  saveDb(db)
  return product
}

export function deleteSellerProduct(
  productId: number,
  actor: 'SELLER' | 'ADMIN' = 'SELLER',
): void {
  const db = loadDb()
  const unread = ensureUnreadChanges(db)
  const product = db.products.find(p => p.id === productId)
  if (!product) {
    throw new Error('상품을 찾을 수 없습니다.')
  }
  product.status = 'DELETED'
  if (actor === 'SELLER') {
    unread.SELLER.products = 0
    unread.ADMIN.products += 1
  } else {
    unread.ADMIN.products = 0
    unread.SELLER.products += 1
  }
  saveDb(db)
}

export function adjustOptionStock(input: {
  optionId: number
  type: 'IN' | 'ADJUST'
  changeQty: number
  memo?: string
}): ProductOption {
  const db = loadDb()
  const unread = ensureUnreadChanges(db)
  if (input.changeQty === 0 || Number.isNaN(input.changeQty)) {
    throw new Error('변동 수량은 0이 아닌 정수여야 합니다.')
  }
  if (input.type === 'IN' && input.changeQty < 0) {
    throw new Error('입고 수량은 양수여야 합니다.')
  }

  for (const product of db.products) {
    const option = product.options.find(o => o.id === input.optionId)
    if (option) {
      const nextQty = option.stockQuantity + input.changeQty
      if (nextQty < 0) {
        throw new Error('조정 후 재고 수량은 0 미만이 될 수 없습니다.')
      }
      option.stockQuantity = nextQty
      db.stockHistory.unshift({
        id: db.nextIds.history++,
        optionId: option.id,
        productId: product.id,
        productName: product.name,
        productCode: product.productCode,
        colorName: option.colorName,
        sizeLabel: option.sizeLabel,
        changeQty: input.changeQty,
        quantityAfter: nextQty,
        type: input.type,
        memo: input.memo?.trim() || (input.type === 'IN' ? '정기 재고 입고' : '재고 실사 조정'),
        createdAt: new Date().toISOString().slice(0, 19),
      })
      unread.SELLER.inventory = 0
      unread.SELLER.products += 1
      unread.ADMIN.products += 1
      saveDb(db)
      return option
    }
  }
  throw new Error('해당 상품 옵션을 찾을 수 없습니다.')
}

export function getStockHistory(
  sellerId: number = CURRENT_SELLER_ID,
  optionId?: number,
): StockHistoryItem[] {
  const db = loadDb()
  const sellerProductIds = new Set(
    db.products.filter(p => p.sellerId === sellerId).map(p => p.id),
  )
  return db.stockHistory.filter(
    item =>
      sellerProductIds.has(item.productId) &&
      (optionId === undefined || item.optionId === optionId),
  )
}

// ============================================================================
// SELLER: ORDER / SHIPMENT APIs
// ============================================================================

export function getSellerShipments(sellerId: number = CURRENT_SELLER_ID): SellerShipment[] {
  const db = loadDb()
  return db.shipments
    .filter(s => s.sellerId === sellerId)
    .sort((a, b) => b.id - a.id)
}

const VALID_NEXT_SHIPMENT_STATUS: Record<ShipmentStatus, ShipmentStatus[]> = {
  ORDERED: ['PREPARING', 'CANCELED'],
  PREPARING: ['SHIPPING'],
  SHIPPING: ['DELIVERED'],
  DELIVERED: ['CONFIRMED'],
  CONFIRMED: [],
  CANCELED: [],
}

export function updateShipmentStatus(
  shipmentId: number,
  nextStatus: ShipmentStatus,
): SellerShipment {
  const db = loadDb()
  const unread = ensureUnreadChanges(db)
  const shipment = db.shipments.find(s => s.id === shipmentId)
  if (!shipment) {
    throw new Error('배송 내역을 찾을 수 없습니다.')
  }
  if (shipment.status === 'CONFIRMED' || shipment.status === 'CANCELED') {
    throw new Error('이미 구매확정되었거나 취소된 주문은 상태를 변경할 수 없습니다.')
  }

  const allowed = VALID_NEXT_SHIPMENT_STATUS[shipment.status]
  if (!allowed.includes(nextStatus)) {
    throw new Error(
      `현재 상태에서 선택한 상태로 바로 변경할 수 없습니다.`,
    )
  }

  const now = new Date().toISOString().slice(0, 19)
  shipment.status = nextStatus
  unread.SELLER.orders = 0

  if (nextStatus === 'CONFIRMED') {
    shipment.confirmedAt = now
    unread.SELLER.stats += 1
    unread.ADMIN.stats += 1
  } else if (nextStatus === 'CANCELED') {
    shipment.canceledAt = now
    // 주문 취소 시 재고 복원 + STOCK_HISTORY(CANCEL) 기록
    for (const item of shipment.items) {
      for (const product of db.products) {
        const opt = product.options.find(o => o.id === item.optionId)
        if (opt) {
          opt.stockQuantity += item.quantity
          db.stockHistory.unshift({
            id: db.nextIds.history++,
            optionId: opt.id,
            productId: product.id,
            productName: product.name,
            productCode: product.productCode,
            colorName: opt.colorName,
            sizeLabel: opt.sizeLabel,
            changeQty: item.quantity,
            quantityAfter: opt.stockQuantity,
            type: 'CANCEL',
            orderItemId: item.id,
            memo: `주문 취소 재고 복원 (${shipment.orderNumber})`,
            createdAt: now,
          })
        }
      }
    }
    unread.SELLER.inventory += 1
    unread.SELLER.products += 1
    unread.ADMIN.products += 1
    unread.SELLER.stats += 1
    unread.ADMIN.stats += 1
  }

  saveDb(db)
  return shipment
}

// ============================================================================
// ADMIN: BRAND, PRODUCT, USER MANAGEMENT APIs
// ============================================================================

export function getAdminBrands(): Brand[] {
  const db = loadDb()
  return [...db.brands].sort((a, b) => b.id - a.id)
}

export function updateAdminBrandStatus(
  brandId: number,
  status: BrandStatus,
  rejectReason?: string,
): Brand {
  const db = loadDb()
  const unread = ensureUnreadChanges(db)
  const brand = db.brands.find(b => b.id === brandId)
  if (!brand) {
    throw new Error('브랜드를 찾을 수 없습니다.')
  }
  if (status === 'REJECTED' && !rejectReason?.trim()) {
    throw new Error('브랜드 거절 사유를 입력해 주세요.')
  }
  brand.status = status
  brand.rejectReason = status === 'REJECTED' ? rejectReason?.trim() : undefined
  unread.ADMIN.brands = 0
  unread.SELLER.brands += 1
  saveDb(db)
  return brand
}

export function getAdminProducts(): Product[] {
  const db = loadDb()
  return db.products
    .filter(p => p.status !== 'DELETED')
    .sort((a, b) => b.id - a.id)
}

export function updateAdminProductStatus(
  productId: number,
  status: ProductStatus,
  rejectReason?: string,
): Product {
  const db = loadDb()
  const unread = ensureUnreadChanges(db)
  const product = db.products.find(p => p.id === productId)
  if (!product) {
    throw new Error('상품을 찾을 수 없습니다.')
  }
  if (status === 'REJECTED' && !rejectReason?.trim()) {
    throw new Error('상품 거절 사유를 입력해 주세요.')
  }
  product.status = status
  product.rejectReason = status === 'REJECTED' ? rejectReason?.trim() : undefined
  unread.ADMIN.products = 0
  unread.SELLER.products += 1
  saveDb(db)
  return product
}

export function getAdminUsers(): UserItem[] {
  const db = loadDb()
  return [...db.users].sort((a, b) => a.id - b.id)
}

export function updateAdminUserStatus(
  userId: number,
  nextStatus: 'ACTIVE' | 'SUSPENDED',
): UserItem {
  const db = loadDb()
  const unread = ensureUnreadChanges(db)
  const user = db.users.find(u => u.id === userId)
  if (!user) {
    throw new Error('회원을 찾을 수 없습니다.')
  }
  if (user.role === 'ADMIN') {
    throw new Error('관리자 계정은 정지하거나 변경할 수 없습니다.')
  }
  if (user.status === 'WITHDRAWN') {
    throw new Error('이미 탈퇴 처리된 회원입니다.')
  }
  user.status = nextStatus
  unread.ADMIN.users = 0
  saveDb(db)
  return user
}

export function withdrawAdminUser(userId: number): UserItem {
  const db = loadDb()
  const unread = ensureUnreadChanges(db)
  const user = db.users.find(u => u.id === userId)
  if (!user) {
    throw new Error('회원을 찾을 수 없습니다.')
  }
  if (user.role === 'ADMIN') {
    throw new Error('관리자 계정은 삭제(탈퇴) 처리할 수 없습니다.')
  }
  if (user.status === 'WITHDRAWN') {
    throw new Error('이미 탈퇴 처리된 회원입니다.')
  }

  const now = new Date().toISOString().slice(0, 19)
  user.status = 'WITHDRAWN'
  user.withdrawnAt = now
  user.name = `탈퇴회원#${user.id}`
  user.email = `withdrawn_${user.id}@deleted.seam.kr`
  unread.ADMIN.users = 0

  // 판매자인 경우 소속 브랜드 제거 및 소속 상품 판매 종료(DELETED) 처리
  if (user.role === 'SELLER') {
    const removedBrandsCount = db.brands.filter(b => b.sellerId === user.id).length
    db.brands = db.brands.filter(b => b.sellerId !== user.id)
    let deletedProductsCount = 0
    for (const product of db.products) {
      if (product.sellerId === user.id && product.status !== 'DELETED') {
        product.status = 'DELETED'
        deletedProductsCount += 1
      }
    }
    if (removedBrandsCount > 0) {
      unread.ADMIN.brands += removedBrandsCount
      unread.SELLER.brands += removedBrandsCount
    }
    if (deletedProductsCount > 0) {
      unread.ADMIN.products += deletedProductsCount
      unread.SELLER.products += deletedProductsCount
    }
  }

  saveDb(db)
  return user
}

// ============================================================================
// STATS APIs (SELLER & ADMIN)
// ============================================================================

export function getSalesStats(
  period: StatPeriod,
  scope: 'SELLER' | 'ADMIN',
): SalesStatPoint[] {
  const db = loadDb()
  const activeShipments = db.shipments.filter(
    s =>
      s.status !== 'CANCELED' &&
      (scope === 'ADMIN' || s.sellerId === CURRENT_SELLER_ID),
  )

  const recentActualRevenue = activeShipments.reduce((acc, s) => acc + s.totalAmount, 0)
  const recentActualQty = activeShipments.reduce(
    (acc, s) => acc + s.items.reduce((sum, i) => sum + i.quantity, 0),
    0,
  )

  const multiplier = scope === 'ADMIN' ? 1.85 : 1

  if (period === 'daily') {
    return [
      { label: '11/04', dateKey: '2026-11-04', salesCount: Math.round(4 * multiplier), revenue: Math.round(520000 * multiplier), orderCount: Math.round(3 * multiplier) },
      { label: '11/05', dateKey: '2026-11-05', salesCount: Math.round(6 * multiplier), revenue: Math.round(784000 * multiplier), orderCount: Math.round(5 * multiplier) },
      { label: '11/06', dateKey: '2026-11-06', salesCount: Math.round(3 * multiplier), revenue: Math.round(396000 * multiplier), orderCount: Math.round(3 * multiplier) },
      { label: '11/07', dateKey: '2026-11-07', salesCount: Math.round(7 * multiplier), revenue: Math.round(912000 * multiplier), orderCount: Math.round(6 * multiplier) },
      { label: '11/08', dateKey: '2026-11-08', salesCount: Math.round(5 * multiplier), revenue: Math.round(645000 * multiplier), orderCount: Math.round(4 * multiplier) },
      { label: '11/09', dateKey: '2026-11-09', salesCount: Math.round(8 * multiplier), revenue: Math.round(1080000 * multiplier), orderCount: Math.round(6 * multiplier) },
      {
        label: '11/10 (오늘)',
        dateKey: '2026-11-10',
        salesCount: Math.max(2, recentActualQty),
        revenue: Math.max(178000, Math.round(recentActualRevenue * 0.45 * multiplier)),
        orderCount: activeShipments.length,
      },
    ]
  }

  if (period === 'weekly') {
    return [
      { label: '10월 2주', dateKey: '2026-W41', salesCount: Math.round(24 * multiplier), revenue: Math.round(3120000 * multiplier), orderCount: Math.round(19 * multiplier) },
      { label: '10월 3주', dateKey: '2026-W42', salesCount: Math.round(31 * multiplier), revenue: Math.round(4290000 * multiplier), orderCount: Math.round(25 * multiplier) },
      { label: '10월 4주', dateKey: '2026-W43', salesCount: Math.round(29 * multiplier), revenue: Math.round(3890000 * multiplier), orderCount: Math.round(22 * multiplier) },
      { label: '11월 1주', dateKey: '2026-W44', salesCount: Math.round(38 * multiplier), revenue: Math.round(5140000 * multiplier), orderCount: Math.round(31 * multiplier) },
      { label: '11월 2주 (이번주)', dateKey: '2026-W45', salesCount: Math.round(18 * multiplier) + recentActualQty, revenue: Math.round(2450000 * multiplier) + recentActualRevenue, orderCount: Math.round(14 * multiplier) + activeShipments.length },
    ]
  }

  return [
    { label: '2026.07', dateKey: '2026-07', salesCount: Math.round(82 * multiplier), revenue: Math.round(9840000 * multiplier), orderCount: Math.round(68 * multiplier) },
    { label: '2026.08', dateKey: '2026-08', salesCount: Math.round(95 * multiplier), revenue: Math.round(11420000 * multiplier), orderCount: Math.round(79 * multiplier) },
    { label: '2026.09', dateKey: '2026-09', salesCount: Math.round(118 * multiplier), revenue: Math.round(15890000 * multiplier), orderCount: Math.round(96 * multiplier) },
    { label: '2026.10', dateKey: '2026-10', salesCount: Math.round(142 * multiplier), revenue: Math.round(19650000 * multiplier), orderCount: Math.round(115 * multiplier) },
    { label: '2026.11 (이번달)', dateKey: '2026-11', salesCount: Math.round(52 * multiplier) + recentActualQty, revenue: Math.round(7120000 * multiplier) + recentActualRevenue, orderCount: Math.round(42 * multiplier) + activeShipments.length },
  ]
}

export function getTopProducts(scope: 'SELLER' | 'ADMIN'): TopProductStat[] {
  const db = loadDb()
  const products = db.products.filter(
    p =>
      p.status !== 'DELETED' &&
      (scope === 'ADMIN' || p.sellerId === CURRENT_SELLER_ID),
  )

  const salesByProduct = new Map<number, { qty: number; rev: number }>()
  for (const shipment of db.shipments) {
    if (shipment.status === 'CANCELED') continue
    for (const item of shipment.items) {
      const prev = salesByProduct.get(item.productId) ?? { qty: 0, rev: 0 }
      salesByProduct.set(item.productId, {
        qty: prev.qty + item.quantity,
        rev: prev.rev + item.quantity * item.unitPrice,
      })
    }
  }

  return products
    .map((p, idx) => {
      const actual = salesByProduct.get(p.id) ?? { qty: 0, rev: 0 }
      const baseQty = p.status === 'ON_SALE' || p.status === 'SOLD_OUT' ? (5 - (idx % 4)) * 6 : 0
      const salesCount = actual.qty + baseQty
      const revenue = actual.rev + baseQty * p.price
      const currentStock = p.options.reduce((sum, o) => sum + o.stockQuantity, 0)
      return {
        productId: p.id,
        productName: p.name,
        productCode: p.productCode,
        brandName: p.brandName,
        categoryName: `${p.parentCategoryName} > ${p.categoryName}`,
        salesCount,
        revenue,
        currentStock,
      }
    })
    .sort((a, b) => b.revenue - a.revenue)
}

export function getBrandSalesSummaries(): BrandSalesSummary[] {
  const db = loadDb()
  const topProducts = getTopProducts('ADMIN')
  return db.brands
    .filter(b => b.status === 'APPROVED')
    .map(b => {
      const brandProducts = topProducts.filter(tp => tp.brandName === b.name)
      return {
        brandId: b.id,
        brandName: b.name,
        sellerName: b.sellerName,
        productCount: brandProducts.length,
        salesCount: brandProducts.reduce((s, p) => s + p.salesCount, 0),
        revenue: brandProducts.reduce((s, p) => s + p.revenue, 0),
      }
    })
    .sort((a, b) => b.revenue - a.revenue)
}
