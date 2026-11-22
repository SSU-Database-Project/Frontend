import { API_BASE_URL, apiRequest, requestData } from './api'
import type { SignupInput } from '../types/auth'
import blousonPhoto from '../assets/catalog/blouson.webp'
import capPhoto from '../assets/catalog/cap.webp'
import denimPhoto from '../assets/catalog/denim.webp'
import hoodiePhoto from '../assets/catalog/hoodie.webp'
import knitPhoto from '../assets/catalog/knit.webp'
import shirtPhoto from '../assets/catalog/shirt.webp'
import slacksPhoto from '../assets/catalog/slacks.webp'
import stripePhoto from '../assets/catalog/stripe.webp'
import trenchPhoto from '../assets/catalog/trench.webp'
import totePhoto from '../assets/seam-tote.webp'
import type {
  AccountProfile,
  Brand,
  BrandSalesSummary,
  BrandStatus,
  Category,
  ColorOption,
  Gender,
  PasswordChangeInput,
  Product,
  ProductOption,
  ProductStatus,
  ProfileUpdateInput,
  SalesStatPoint,
  SellerShipment,
  ShipmentStatus,
  SizeGroup,
  SizeOption,
  StatPeriod,
  StockHistoryItem,
  StockHistoryType,
  TopProductStat,
  UserItem,
  UserStatus,
  WithdrawalCheckResult,
} from '../types/commerce'
import type { Role } from '../types/role'

export const MOCK_SESSION_KEY = 'seam_mock_user_id'

const STORAGE_KEY = 'seam_mock_db_v5'

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

const SAMPLE_SVG_SHOES = createSvgSample('#3b2e28', '#ede6df', 'URBAN FOOTWEAR', 'SHOES · ARCHIVE LINE')
const SAMPLE_SVG_ACCESSORY = createSvgSample('#cfc4b4', '#22201e', 'ESSENTIAL ACC', 'ACCESSORY · FREE SIZE')

export const SAMPLE_PRODUCT_IMAGES: { label: string; url: string }[] = [
  { label: '캔버스 토트백 (가방 샘플)', url: totePhoto },
  { label: '발마칸 트렌치 코트 (아우터 샘플)', url: trenchPhoto },
  { label: '오버핏 후드 스웻 (상의 샘플)', url: hoodiePhoto },
  { label: '와이드 데님 팬츠 (바지 샘플)', url: denimPhoto },
  { label: '옥스포드 셔츠 (셔츠 샘플)', url: shirtPhoto },
  { label: '램스울 크루넥 니트 (니트 샘플)', url: knitPhoto },
  { label: '워크웨어 블루종 자켓 (자켓 샘플)', url: blousonPhoto },
  { label: '와이드 슬랙스 (슬랙스 샘플)', url: slacksPhoto },
  { label: '스트라이프 티셔츠 (티셔츠 샘플)', url: stripePhoto },
  { label: '코튼 볼캡 (모자 샘플)', url: capPhoto },
]

const SAMPLE_FILE_IMAGE_MAP: Record<string, string> = {
  'tee.jpg': stripePhoto,
  'longsleeve.jpg': stripePhoto,
  'shirt.jpg': shirtPhoto,
  'knit.jpg': knitPhoto,
  'hoodie.jpg': hoodiePhoto,
  'jacket.jpg': blousonPhoto,
  'coat.jpg': trenchPhoto,
  'padding.jpg': blousonPhoto,
  'cardigan.jpg': knitPhoto,
  'denim.jpg': denimPhoto,
  'slacks.jpg': slacksPhoto,
  'training.jpg': slacksPhoto,
  'shorts.jpg': denimPhoto,
  'dress.jpg': trenchPhoto,
  'skirt.jpg': slacksPhoto,
  'sneakers.jpg': SAMPLE_SVG_SHOES,
  'loafers.jpg': SAMPLE_SVG_SHOES,
  'backpack.jpg': totePhoto,
  'crossbag.jpg': totePhoto,
  'cap.jpg': capPhoto,
  'beanie.jpg': capPhoto,
  'socks.jpg': SAMPLE_SVG_ACCESSORY,
}

export function resolveProductImageUrl(rawUrl?: string | null): string {
  if (!rawUrl || !rawUrl.trim()) {
    return SAMPLE_PRODUCT_IMAGES[0].url
  }
  const trimmed = rawUrl.trim()
  if (trimmed.startsWith('/images/samples/')) {
    const fileName = trimmed.slice('/images/samples/'.length).toLowerCase()
    return SAMPLE_FILE_IMAGE_MAP[fileName] ?? SAMPLE_PRODUCT_IMAGES[0].url
  }
  if (trimmed.startsWith('/images/')) {
    return `${API_BASE_URL.replace(/\/$/, '')}${trimmed}`
  }
  return trimmed
}

function sanitizeImageUrlForBackend(rawUrl?: string | null): string {
  if (!rawUrl || !rawUrl.trim()) {
    return '/images/samples/tee.jpg'
  }
  const trimmed = rawUrl.trim()
  const basePrefix = API_BASE_URL.replace(/\/$/, '')
  if (trimmed.startsWith(basePrefix + '/images/')) {
    return trimmed.slice(basePrefix.length)
  }
  if (trimmed.startsWith('data:') || trimmed.length > 500) {
    return '/images/samples/tee.jpg'
  }
  return trimmed
}

export async function uploadSellerImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiRequest<{ url: string }>('/api/seller/images', {
    method: 'POST',
    body: formData,
  })
  if (!response?.url) {
    throw new Error('이미지 업로드 경로를 받지 못했습니다.')
  }
  return resolveProductImageUrl(response.url)
}

/**
 * 백엔드 V4__fashion_mall_redesign.sql 고정 참조 데이터와 100% 동일한 ID 및 체계
 */
export const FIXED_CATEGORIES: Category[] = [
  // 대분류 (parentId: null)
  { id: 1, parentId: null, name: '상의', sizeGroup: 'CLOTHING' },
  { id: 2, parentId: null, name: '아우터', sizeGroup: 'CLOTHING' },
  { id: 3, parentId: null, name: '바지', sizeGroup: 'CLOTHING' },
  { id: 4, parentId: null, name: '원피스/스커트', sizeGroup: 'CLOTHING' },
  { id: 5, parentId: null, name: '신발', sizeGroup: 'SHOES' },
  { id: 6, parentId: null, name: '가방', sizeGroup: 'FREE' },
  { id: 7, parentId: null, name: '모자', sizeGroup: 'FREE' },
  { id: 8, parentId: null, name: '액세서리', sizeGroup: 'FREE' },
  // 소분류 (leaf categories)
  { id: 11, parentId: 1, name: '반소매 티셔츠', sizeGroup: 'CLOTHING' },
  { id: 12, parentId: 1, name: '긴소매 티셔츠', sizeGroup: 'CLOTHING' },
  { id: 13, parentId: 1, name: '셔츠/블라우스', sizeGroup: 'CLOTHING' },
  { id: 14, parentId: 1, name: '니트/스웨터', sizeGroup: 'CLOTHING' },
  { id: 15, parentId: 1, name: '후드/맨투맨', sizeGroup: 'CLOTHING' },
  { id: 21, parentId: 2, name: '자켓', sizeGroup: 'CLOTHING' },
  { id: 22, parentId: 2, name: '코트', sizeGroup: 'CLOTHING' },
  { id: 23, parentId: 2, name: '패딩', sizeGroup: 'CLOTHING' },
  { id: 24, parentId: 2, name: '가디건', sizeGroup: 'CLOTHING' },
  { id: 31, parentId: 3, name: '데님 팬츠', sizeGroup: 'CLOTHING' },
  { id: 32, parentId: 3, name: '슬랙스', sizeGroup: 'CLOTHING' },
  { id: 33, parentId: 3, name: '트레이닝 팬츠', sizeGroup: 'CLOTHING' },
  { id: 34, parentId: 3, name: '숏 팬츠', sizeGroup: 'CLOTHING' },
  { id: 41, parentId: 4, name: '원피스', sizeGroup: 'CLOTHING' },
  { id: 42, parentId: 4, name: '스커트', sizeGroup: 'CLOTHING' },
  { id: 51, parentId: 5, name: '스니커즈', sizeGroup: 'SHOES' },
  { id: 52, parentId: 5, name: '구두/로퍼', sizeGroup: 'SHOES' },
  { id: 53, parentId: 5, name: '샌들/슬리퍼', sizeGroup: 'SHOES' },
  { id: 54, parentId: 5, name: '부츠', sizeGroup: 'SHOES' },
  { id: 61, parentId: 6, name: '백팩', sizeGroup: 'FREE' },
  { id: 62, parentId: 6, name: '크로스백', sizeGroup: 'FREE' },
  { id: 63, parentId: 6, name: '토트백', sizeGroup: 'FREE' },
  { id: 71, parentId: 7, name: '캡/야구모자', sizeGroup: 'FREE' },
  { id: 72, parentId: 7, name: '비니', sizeGroup: 'FREE' },
  { id: 73, parentId: 7, name: '버킷햇', sizeGroup: 'FREE' },
  { id: 81, parentId: 8, name: '양말', sizeGroup: 'FREE' },
  { id: 82, parentId: 8, name: '벨트', sizeGroup: 'FREE' },
  { id: 83, parentId: 8, name: '주얼리', sizeGroup: 'FREE' },
]

export const FIXED_COLORS: ColorOption[] = [
  { id: 1, name: '블랙', hexCode: '#000000' },
  { id: 2, name: '화이트', hexCode: '#FFFFFF' },
  { id: 3, name: '그레이', hexCode: '#8E8E8E' },
  { id: 4, name: '네이비', hexCode: '#1F2A44' },
  { id: 5, name: '베이지', hexCode: '#D8C3A5' },
  { id: 6, name: '브라운', hexCode: '#6B4423' },
  { id: 7, name: '카키', hexCode: '#5B5F3A' },
  { id: 8, name: '레드', hexCode: '#C62828' },
  { id: 9, name: '핑크', hexCode: '#F4A6C0' },
  { id: 10, name: '블루', hexCode: '#1E5BB8' },
  { id: 11, name: '그린', hexCode: '#2E7D32' },
  { id: 12, name: '옐로우', hexCode: '#F2C94C' },
]

export const FIXED_SIZES: SizeOption[] = [
  { id: 1, sizeGroup: 'CLOTHING', label: 'XS' },
  { id: 2, sizeGroup: 'CLOTHING', label: 'S' },
  { id: 3, sizeGroup: 'CLOTHING', label: 'M' },
  { id: 4, sizeGroup: 'CLOTHING', label: 'L' },
  { id: 5, sizeGroup: 'CLOTHING', label: 'XL' },
  { id: 6, sizeGroup: 'CLOTHING', label: 'XXL' },
  { id: 11, sizeGroup: 'SHOES', label: '220' },
  { id: 12, sizeGroup: 'SHOES', label: '230' },
  { id: 13, sizeGroup: 'SHOES', label: '240' },
  { id: 14, sizeGroup: 'SHOES', label: '250' },
  { id: 15, sizeGroup: 'SHOES', label: '260' },
  { id: 16, sizeGroup: 'SHOES', label: '270' },
  { id: 17, sizeGroup: 'SHOES', label: '280' },
  { id: 18, sizeGroup: 'SHOES', label: '290' },
  { id: 19, sizeGroup: 'SHOES', label: '300' },
  { id: 21, sizeGroup: 'FREE', label: 'FREE' },
]

export type SellerTabKey = 'brands' | 'products' | 'inventory' | 'orders' | 'stats'
export type AdminTabKey = 'brands' | 'products' | 'users' | 'stats'

export type UnreadChangesState = {
  SELLER: Record<SellerTabKey, number>
  ADMIN: Record<AdminTabKey, number>
}

type MockDatabase = {
  credentials?: Record<number, { salt: string; hash: string }>
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
      categoryId: 63,
      parentCategoryName: '가방',
      categoryName: '토트백',
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
          colorId: 10,
          colorName: '블루',
          hexCode: '#1E5BB8',
          sizeId: 21,
          sizeLabel: 'FREE',
          stockQuantity: 28,
        },
        {
          id: 1002,
          productId: 101,
          colorId: 1,
          colorName: '블랙',
          hexCode: '#000000',
          sizeId: 21,
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
      categoryId: 22,
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
          colorId: 3,
          colorName: '그레이',
          hexCode: '#8E8E8E',
          sizeId: 3,
          sizeLabel: 'M',
          stockQuantity: 9,
        },
        {
          id: 1004,
          productId: 102,
          colorId: 3,
          colorName: '그레이',
          hexCode: '#8E8E8E',
          sizeId: 4,
          sizeLabel: 'L',
          stockQuantity: 6,
        },
        {
          id: 1005,
          productId: 102,
          colorId: 1,
          colorName: '블랙',
          hexCode: '#000000',
          sizeId: 4,
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
      categoryId: 15,
      parentCategoryName: '상의',
      categoryName: '후드/맨투맨',
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
          colorId: 3,
          colorName: '그레이',
          hexCode: '#8E8E8E',
          sizeId: 3,
          sizeLabel: 'M',
          stockQuantity: 20,
        },
        {
          id: 1007,
          productId: 103,
          colorId: 3,
          colorName: '그레이',
          hexCode: '#8E8E8E',
          sizeId: 4,
          sizeLabel: 'L',
          stockQuantity: 25,
        },
        {
          id: 1008,
          productId: 103,
          colorId: 4,
          colorName: '네이비',
          hexCode: '#1F2A44',
          sizeId: 4,
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
      categoryId: 31,
      parentCategoryName: '바지',
      categoryName: '데님 팬츠',
      sizeGroup: 'CLOTHING',
      name: '와이드 셀비지 데님 트라우저',
      productCode: 'SEAM-26FW-004',
      gender: 'MEN',
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
          colorId: 10,
          colorName: '블루',
          hexCode: '#1E5BB8',
          sizeId: 3,
          sizeLabel: 'M',
          stockQuantity: 12,
        },
        {
          id: 1010,
          productId: 104,
          colorId: 10,
          colorName: '블루',
          hexCode: '#1E5BB8',
          sizeId: 4,
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
      categoryId: 52,
      parentCategoryName: '신발',
      categoryName: '구두/로퍼',
      sizeGroup: 'SHOES',
      name: '스퀘어토 더비 레더 로퍼',
      productCode: 'SEAM-26FW-005',
      gender: 'UNISEX',
      season: '26FW',
      shipDays: 3,
      price: 198000,
      imageUrl: SAMPLE_SVG_SHOES,
      status: 'SOLD_OUT',
      createdAt: '2026-10-25T09:30:00',
      options: [
        {
          id: 1011,
          productId: 105,
          colorId: 1,
          colorName: '블랙',
          hexCode: '#000000',
          sizeId: 15,
          sizeLabel: '260',
          stockQuantity: 0,
        },
        {
          id: 1012,
          productId: 105,
          colorId: 6,
          colorName: '브라운',
          hexCode: '#6B4423',
          sizeId: 16,
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
      categoryId: 83,
      parentCategoryName: '액세서리',
      categoryName: '주얼리',
      sizeGroup: 'FREE',
      name: '퓨어 캐시미어 프린지 머플러',
      productCode: 'ATEL-26FW-010',
      gender: 'WOMEN',
      season: '26FW',
      shipDays: 1,
      price: 145000,
      imageUrl: SAMPLE_SVG_ACCESSORY,
      status: 'ON_SALE',
      createdAt: '2026-10-27T12:00:00',
      options: [
        {
          id: 1013,
          productId: 106,
          colorId: 5,
          colorName: '베이지',
          hexCode: '#D8C3A5',
          sizeId: 21,
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
      colorName: '블루',
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
      colorName: '블루',
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
      colorName: '그레이',
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
      colorName: '그레이',
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
          colorName: '블루',
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
          colorName: '그레이',
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
          colorName: '그레이',
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
          colorName: '블루',
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
  // 서버 DB 연동 전용 (임시 목데이터 초기화 미사용)
}

export function getUnreadChanges(): UnreadChangesState {
  return {
    SELLER: { brands: 0, products: 0, inventory: 0, orders: 0, stats: 0 },
    ADMIN: { brands: 0, products: 0, users: 0, stats: 0 },
  }
}

export function clearSellerTabBadge(_tab: SellerTabKey): void {
  // 서버 DB 연동 전용
}

export function clearAdminTabBadge(_tab: AdminTabKey): void {
  // 서버 DB 연동 전용
}

// Only the explicit offline demo uses these accounts. Real sessions are issued by the API.
async function mockPasswordHash(password: string, salt: string) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({
    name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100_000, hash: 'SHA-256',
  }, key, 256)
  return Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function loginMockUser(email: string, password: string) {
  const db = loadDb()
  const user = db.users.find(item => item.email.toLowerCase() === email.toLowerCase())
  const credential = user && db.credentials?.[user.id]
  const matches = credential
    ? await mockPasswordHash(password, credential.salt) === credential.hash
    : password === 'demo1234!'
  if (!user || user.status !== 'ACTIVE' || !matches) throw new Error('이메일 또는 비밀번호를 확인해 주세요.')
  sessionStorage.setItem(MOCK_SESSION_KEY, String(user.id))
  return user
}

export function getMockSessionUser() {
  const id = Number(sessionStorage.getItem(MOCK_SESSION_KEY))
  return loadDb().users.find(user => user.id === id && user.status === 'ACTIVE') ?? null
}

export async function getAccountProfile(): Promise<AccountProfile> {
  const user = await apiRequest<AccountProfile>('/api/users/me')
  return {
    ...user,
    phone: user.phone ?? null,
    status: user.status ?? 'ACTIVE',
    seller: user.seller ?? null,
  }
}

export async function updateAccountProfile(input: ProfileUpdateInput): Promise<AccountProfile> {
  const payload = input.seller
    ? {
        name: input.name.trim(),
        phone: input.phone.trim(),
        seller: {
          companyName: input.seller.companyName.trim(),
          representativeName: input.seller.representativeName.trim(),
        },
      }
    : {
        name: input.name.trim(),
        phone: input.phone.trim(),
      }
  const updated = await apiRequest<AccountProfile>('/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return {
    ...updated,
    phone: updated.phone ?? null,
    status: updated.status ?? 'ACTIVE',
    seller: updated.seller ?? null,
  }
}

export async function changeAccountPassword(input: PasswordChangeInput): Promise<void> {
  await apiRequest<void>('/api/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function checkAccountWithdrawal(): Promise<WithdrawalCheckResult> {
  return apiRequest<WithdrawalCheckResult>('/api/users/me/withdrawal')
}

export async function withdrawMySellerOrUserAccount(password: string): Promise<void> {
  await apiRequest<void>('/api/users/me/withdrawal', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
}

export async function signupMockUser(input: SignupInput) {
  const salt = crypto.randomUUID()
  const hash = await mockPasswordHash(input.password, salt)
  const db = loadDb()
  if (db.users.some(user => user.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error('이미 가입된 이메일입니다.')
  }
  const sellerInfo = input.role === 'SELLER' ? input.seller : undefined
  if (sellerInfo && db.users.some(user => user.sellerInfo?.businessNumber === sellerInfo.businessNumber)) {
    throw new Error('이미 등록된 사업자등록번호입니다.')
  }
  const id = db.users.reduce((max, user) => Math.max(max, user.id), 0) + 1
  db.users.push({ id, name: input.name, email: input.email, role: input.role, sellerInfo,
    status: 'ACTIVE', createdAt: new Date().toISOString() })
  db.credentials = { ...db.credentials, [id]: { salt, hash } }
  ensureUnreadChanges(db).ADMIN.users += 1
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
// BACKEND DTO MAPPERS & HELPERS
// ============================================================================

type BackendBrandDto = {
  id: number
  sellerId: number
  sellerCompanyName?: string | null
  sellerName?: string | null
  name: string
  description?: string | null
  logoUrl?: string | null
  status: BrandStatus
  rejectReason?: string | null
  createdAt?: string | null
}

type BackendOptionDto = {
  optionId?: number
  id?: number
  colorId: number
  colorName: string
  hexCode: string
  sizeId: number
  sizeLabel: string
  stock?: number
  stockQuantity?: number
  soldOut?: boolean
}

type BackendProductSummaryDto = {
  id: number
  productCode: string
  name: string
  price: number
  imageUrl?: string | null
  status: ProductStatus
  soldOut?: boolean
  totalStock?: number
  brandId: number
  brandName: string
  categoryId: number
  categoryName: string
  gender: string
  season: string
  createdAt?: string | null
  options?: BackendOptionDto[]
}

type BackendProductDetailDto = BackendProductSummaryDto & {
  description?: string | null
  shipDays?: number
  rejectReason?: string | null
  sellerId?: number
  sellerCompanyName?: string | null
  sizeGroup?: SizeGroup
  options?: BackendOptionDto[]
  updatedAt?: string | null
}

type BackendStockHistoryDto = {
  id: number
  type: StockHistoryType
  changeQty: number
  quantityAfter: number
  orderItemId?: number | null
  memo?: string | null
  createdAt?: string | null
}

type BackendOrderItemDto = {
  orderItemId?: number
  id?: number
  optionId: number
  productId: number
  productName: string
  productCode?: string
  colorName: string
  sizeLabel: string
  imageUrl?: string | null
  unitPrice: number
  quantity: number
  lineTotal?: number
}

type BackendSellerShipmentDto = {
  shipmentId?: number
  id?: number
  orderId: number
  orderNumber?: string
  sellerId?: number
  brandName?: string
  status: ShipmentStatus
  orderedAt?: string | null
  createdAt?: string | null
  confirmedAt?: string | null
  canceledAt?: string | null
  canceledBy?: 'BUYER' | 'SELLER' | null
  cancelReason?: string | null
  subtotal?: number
  totalAmount?: number
  receiverName?: string | null
  buyerName?: string | null
  receiverPhone?: string | null
  buyerEmail?: string | null
  zipCode?: string | null
  address?: string | null
  addressDetail?: string | null
  items?: BackendOrderItemDto[]
}

type BackendAdminUserDto = {
  id: number
  email: string
  name: string
  phone?: string | null
  role: Role
  status: UserStatus
  createdAt?: string | null
  withdrawnAt?: string | null
}

type BackendSalesPointDto = {
  periodStart: string
  quantity: number
  revenue: number
  orderCount: number
}

type BackendSalesStatsResponse = {
  period: string
  from: string
  to: string
  totalQuantity: number
  totalRevenue: number
  totalOrders: number
  points: BackendSalesPointDto[]
}

type BackendTopProductDto = {
  rank: number
  productId: number
  productCode: string
  productName: string
  quantity: number
  revenue: number
}

type BackendTopProductsResponse = {
  from: string
  to: string
  sort: string
  products: BackendTopProductDto[]
}

type BackendBrandSalesDto = {
  brandId: number
  brandName: string
  brandStatus: string
  sellerId: number
  sellerCompanyName?: string | null
  productCount: number
  quantity: number
  revenue: number
  orderCount: number
}

type BackendBrandSalesResponse = {
  from: string
  to: string
  totalQuantity: number
  totalRevenue: number
  brands: BackendBrandSalesDto[]
}

type BackendBrandWithProductResponse = {
  brand: BackendBrandDto
  product: BackendProductDetailDto
}

type BackendPageResponse<T> = {
  content?: T[]
  page?: number
  size?: number
  totalElements?: number
  totalPages?: number
}

/**
 * 백엔드 페이징 API의 전체 페이지를 순회 조회하여 100건 조회 제한을 해소하는 헬퍼
 */
async function fetchAllPages<T>(
  baseEndpoint: string,
  pageSize = 100,
): Promise<T[]> {
  const items: T[] = []
  let page = 0
  const sep = baseEndpoint.includes('?') ? '&' : '?'

  while (true) {
    const res = await requestData<BackendPageResponse<T> | T[]>(
      `${baseEndpoint}${sep}page=${page}&size=${pageSize}`,
    )
    if (Array.isArray(res)) {
      return res
    }
    const content = Array.isArray(res?.content) ? res.content : []
    items.push(...content)
    const totalPages =
      typeof res?.totalPages === 'number' ? res.totalPages : 1
    page += 1
    if (page >= totalPages || content.length === 0) {
      break
    }
  }

  return items
}

function normalizeGender(value?: string | null): Gender {
  if (value === 'MEN' || value === 'MALE') return 'MEN'
  if (value === 'WOMEN' || value === 'FEMALE') return 'WOMEN'
  return 'UNISEX'
}

function getCategoryMeta(categoryId: number, fallbackCategoryName?: string, fallbackSizeGroup?: SizeGroup) {
  const leaf = FIXED_CATEGORIES.find(c => c.id === categoryId)
  const parent = leaf?.parentId ? FIXED_CATEGORIES.find(c => c.id === leaf.parentId) : undefined
  return {
    categoryName: leaf?.name ?? fallbackCategoryName ?? '기타',
    parentCategoryName: parent?.name ?? '패션',
    sizeGroup: leaf?.sizeGroup ?? fallbackSizeGroup ?? 'CLOTHING',
  }
}

function mapBackendBrand(dto: BackendBrandDto, fallbackSellerName = '내 브랜드'): Brand {
  return {
    id: dto.id,
    sellerId: dto.sellerId,
    sellerName: dto.sellerCompanyName ?? dto.sellerName ?? fallbackSellerName,
    name: dto.name,
    description: dto.description ?? '',
    status: dto.status,
    rejectReason: dto.rejectReason ?? undefined,
    createdAt: dto.createdAt ?? new Date().toISOString().slice(0, 19),
  }
}

const cachedBrandSellerNames = new Map<number, string>()

function mapBackendProductDetail(dto: BackendProductDetailDto): Product {
  const catMeta = getCategoryMeta(dto.categoryId, dto.categoryName, dto.sizeGroup)
  const options: ProductOption[] = (dto.options ?? []).map(opt => ({
    id: opt.optionId ?? opt.id ?? 0,
    productId: dto.id,
    colorId: opt.colorId,
    colorName: opt.colorName,
    hexCode: opt.hexCode,
    sizeId: opt.sizeId,
    sizeLabel: opt.sizeLabel,
    stockQuantity: opt.stock ?? opt.stockQuantity ?? 0,
  }))

  return {
    id: dto.id,
    brandId: dto.brandId,
    brandName: dto.brandName,
    sellerId: dto.sellerId ?? 0,
    sellerName:
      dto.sellerCompanyName ??
      cachedBrandSellerNames.get(dto.brandId) ??
      dto.brandName,
    categoryId: dto.categoryId,
    parentCategoryName: catMeta.parentCategoryName,
    categoryName: dto.categoryName || catMeta.categoryName,
    sizeGroup: dto.sizeGroup ?? catMeta.sizeGroup,
    name: dto.name,
    productCode: dto.productCode,
    gender: normalizeGender(dto.gender),
    season: dto.season,
    shipDays: dto.shipDays ?? 2,
    price: dto.price,
    imageUrl: resolveProductImageUrl(dto.imageUrl),
    status: dto.status,
    rejectReason: dto.rejectReason ?? undefined,
    options,
    createdAt: dto.createdAt ?? new Date().toISOString().slice(0, 19),
  }
}

let cachedSellerProducts: Product[] = []

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

function validateInitialProductDraftFields(draft: InitialProductDraftInput) {
  const category = FIXED_CATEGORIES.find(c => c.id === draft.categoryId)
  if (!category || category.parentId === null) {
    throw new Error('소분류 카테고리를 선택해 주세요.')
  }

  const trimmedProductName = draft.name.trim()
  const trimmedProductCode = draft.productCode.trim().toUpperCase()
  if (!trimmedProductName || !trimmedProductCode) {
    throw new Error('상품명과 품번을 모두 입력해 주세요.')
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
  _brandName?: string,
): void {
  validateInitialProductDraftFields(draft)
}

export async function getSellerBrands(
  _sellerId?: number,
): Promise<Brand[]> {
  let sellerCompanyName = '내 브랜드'
  try {
    const sellerInfo = await apiRequest<{ companyName?: string }>('/api/seller/me')
    if (sellerInfo?.companyName) {
      sellerCompanyName = sellerInfo.companyName
    }
  } catch {
    // Ignore if /api/seller/me fails
  }

  const rawBrands = await apiRequest<BackendBrandDto[]>('/api/seller/brands')
  return (rawBrands ?? [])
    .map(b => mapBackendBrand(b, sellerCompanyName))
    .sort((a, b) => b.id - a.id)
}

export async function createSellerBrand(input: {
  name: string
  description: string
  sellerId?: number
  initialProduct: InitialProductDraftInput
}): Promise<Brand> {
  const trimmedName = input.name.trim()
  if (!trimmedName) {
    throw new Error('브랜드명을 입력해 주세요.')
  }
  if (!input.initialProduct) {
    throw new Error('브랜드 등록 시 초기 대표 상품 1건을 필수로 함께 신청해야 합니다.')
  }

  validateInitialProductDraftFields(input.initialProduct)

  const existingBrands = await getSellerBrands()
  const matchedApproved = existingBrands.find(
    b => b.name.toLowerCase() === trimmedName.toLowerCase() && b.status === 'APPROVED',
  )

  if (matchedApproved) {
    await createSellerProduct({
      brandId: matchedApproved.id,
      ...input.initialProduct,
    })
    return matchedApproved
  }

  const draft = input.initialProduct
  const created = await apiRequest<BackendBrandWithProductResponse>(
    '/api/seller/brands/with-product',
    {
      method: 'POST',
      body: JSON.stringify({
        brand: {
          name: trimmedName,
          description: input.description.trim() || undefined,
        },
        product: {
          categoryId: draft.categoryId,
          productCode: draft.productCode.trim().toUpperCase(),
          name: draft.name.trim(),
          description: `${draft.name.trim()} — 브랜드 대표 상품`,
          price: draft.price,
          gender: normalizeGender(draft.gender),
          season: draft.season.trim().toUpperCase(),
          shipDays: draft.shipDays,
          imageUrl: sanitizeImageUrlForBackend(draft.imageUrl),
          options: draft.options.map(opt => ({
            colorId: opt.colorId,
            sizeId: opt.sizeId,
            stock: opt.stockQuantity,
          })),
        },
      }),
    },
  )

  return mapBackendBrand(created.brand)
}

export async function deleteSellerBrand(
  brandId: number,
  actor: 'SELLER' | 'ADMIN' = 'SELLER',
): Promise<void> {
  const endpoint =
    actor === 'ADMIN'
      ? `/api/admin/brands/${brandId}`
      : `/api/seller/brands/${brandId}`

  await apiRequest<BackendBrandDto>(endpoint, {
    method: 'DELETE',
  })
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

export async function getSellerProducts(
  _sellerId?: number,
): Promise<Product[]> {
  const summaries = await fetchAllPages<BackendProductDetailDto>(
    '/api/seller/products',
  )
  const activeSummaries = (summaries ?? []).filter(
    s => s.status !== 'DELETED',
  )

  const enriched = await Promise.all(
    activeSummaries.map(async s => {
      if (s.status === 'REJECTED' && !s.rejectReason) {
        try {
          return await apiRequest<BackendProductDetailDto>(
            `/api/seller/products/${s.id}`,
          )
        } catch {
          return s
        }
      }
      return s
    }),
  )

  const mapped = enriched.map(mapBackendProductDetail).sort((a, b) => b.id - a.id)
  cachedSellerProducts = mapped
  return mapped
}

export async function createSellerProduct(
  input: UpsertProductInput,
): Promise<Product> {
  validateInitialProductDraftFields(input)
  const created = await apiRequest<BackendProductDetailDto>('/api/seller/products', {
    method: 'POST',
    body: JSON.stringify({
      brandId: input.brandId,
      categoryId: input.categoryId,
      productCode: input.productCode.trim().toUpperCase(),
      name: input.name.trim(),
      description: `${input.name.trim()} — 상세 상품 정보`,
      price: input.price,
      gender: normalizeGender(input.gender),
      season: input.season.trim().toUpperCase(),
      shipDays: input.shipDays,
      imageUrl: sanitizeImageUrlForBackend(input.imageUrl),
      options: input.options.map(opt => ({
        colorId: opt.colorId,
        sizeId: opt.sizeId,
        stock: opt.stockQuantity,
      })),
    }),
  })
  return mapBackendProductDetail(created)
}

export async function updateSellerProduct(
  productId: number,
  input: UpsertProductInput,
): Promise<Product> {
  validateInitialProductDraftFields(input)
  const existingDetail = await apiRequest<BackendProductDetailDto>(
    `/api/seller/products/${productId}`,
  )
  const existingOptions = existingDetail.options ?? []

  const addOptions: { colorId: number; sizeId: number; stock: number }[] = []
  const stockAdjustments: { optionId: number; delta: number }[] = []

  for (const opt of input.options) {
    const found = existingOptions.find(
      eo => eo.colorId === opt.colorId && eo.sizeId === opt.sizeId,
    )
    if (!found) {
      addOptions.push({
        colorId: opt.colorId,
        sizeId: opt.sizeId,
        stock: opt.stockQuantity,
      })
    } else {
      const currentStock = found.stock ?? found.stockQuantity ?? 0
      const delta = opt.stockQuantity - currentStock
      const optId = found.optionId ?? found.id
      if (delta !== 0 && optId) {
        stockAdjustments.push({ optionId: optId, delta })
      }
    }
  }

  for (const adj of stockAdjustments) {
    await apiRequest(`/api/seller/options/${adj.optionId}/stock`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'ADJUST',
        quantity: adj.delta,
        memo: '상품 수정 시 재고 수량 조정',
      }),
    })
  }

  const updated = await apiRequest<BackendProductDetailDto>(
    `/api/seller/products/${productId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        categoryId: input.categoryId,
        productCode: input.productCode.trim().toUpperCase(),
        name: input.name.trim(),
        price: input.price,
        gender: normalizeGender(input.gender),
        season: input.season.trim().toUpperCase(),
        shipDays: input.shipDays,
        imageUrl: sanitizeImageUrlForBackend(input.imageUrl),
        addOptions: addOptions.length > 0 ? addOptions : undefined,
      }),
    },
  )
  return mapBackendProductDetail(updated)
}

export async function updateSellerProductSaleStatus(
  productId: number,
  nextStatus: 'ON_SALE' | 'SOLD_OUT',
): Promise<Product> {
  const updated = await apiRequest<BackendProductDetailDto>(
    `/api/seller/products/${productId}/sale-status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus }),
    },
  )
  return mapBackendProductDetail(updated)
}

export async function deleteSellerProduct(
  productId: number,
): Promise<void> {
  await apiRequest<void>(`/api/seller/products/${productId}`, {
    method: 'DELETE',
  })
}

export async function adjustOptionStock(input: {
  optionId: number
  type: 'IN' | 'ADJUST'
  changeQty: number
  memo?: string
}): Promise<ProductOption> {
  const res = await apiRequest<{ optionId: number; stockQuantity: number }>(
    `/api/seller/options/${input.optionId}/stock`,
    {
      method: 'POST',
      body: JSON.stringify({
        type: input.type,
        quantity: input.changeQty,
        memo:
          input.memo?.trim() ||
          (input.type === 'IN' ? '정기 재고 입고' : '재고 실사 조정'),
      }),
    },
  )

  for (const product of cachedSellerProducts) {
    const found = product.options.find(o => o.id === input.optionId)
    if (found) {
      found.stockQuantity = res.stockQuantity
      return { ...found, stockQuantity: res.stockQuantity }
    }
  }

  return {
    id: res.optionId ?? input.optionId,
    productId: 0,
    colorId: 1,
    colorName: '선택 옵션',
    hexCode: '#000000',
    sizeId: 1,
    sizeLabel: '옵션',
    stockQuantity: res.stockQuantity,
  }
}

export async function getStockHistory(
  _sellerId?: number,
  optionId?: number,
  productsHint?: Product[],
): Promise<StockHistoryItem[]> {
  const products =
    productsHint && productsHint.length > 0
      ? productsHint
      : cachedSellerProducts.length > 0
        ? cachedSellerProducts
        : await getSellerProducts()

  const optionMetaList = products.flatMap(p =>
    p.options.map(o => ({
      optionId: o.id,
      productId: p.id,
      productName: p.name,
      productCode: p.productCode,
      colorName: o.colorName,
      sizeLabel: o.sizeLabel,
    })),
  )

  const targets =
    optionId !== undefined
      ? optionMetaList.filter(m => m.optionId === optionId)
      : optionMetaList.slice(0, 24)

  const results = await Promise.all(
    targets.map(async meta => {
      try {
        const rows =
          optionId !== undefined
            ? await fetchAllPages<BackendStockHistoryDto>(
                `/api/seller/options/${meta.optionId}/stock-history`,
              )
            : await apiRequest<BackendStockHistoryDto[]>(
                `/api/seller/options/${meta.optionId}/stock-history?size=30`,
              )
        return (rows ?? []).map(row => ({
          id: row.id,
          optionId: meta.optionId,
          productId: meta.productId,
          productName: meta.productName,
          productCode: meta.productCode,
          colorName: meta.colorName,
          sizeLabel: meta.sizeLabel,
          changeQty: row.changeQty,
          quantityAfter: row.quantityAfter,
          type: row.type,
          memo: row.memo ?? undefined,
          orderItemId: row.orderItemId ?? undefined,
          createdAt: row.createdAt ?? new Date().toISOString().slice(0, 19),
        }))
      } catch {
        return []
      }
    }),
  )

  return results
    .flat()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id)
}

// ============================================================================
// SELLER: ORDER / SHIPMENT APIs
// ============================================================================

function mapBackendShipment(dto: BackendSellerShipmentDto): SellerShipment {
  const shipmentId = dto.shipmentId ?? dto.id ?? 0
  const createdAt = dto.orderedAt ?? dto.createdAt ?? new Date().toISOString().slice(0, 19)
  const datePart = createdAt.slice(0, 10).replaceAll('-', '')
  const orderNumber =
    dto.orderNumber ?? `ORD-${datePart}-${String(dto.orderId).padStart(3, '0')}`
  const fullAddress = [
    dto.zipCode ? `[${dto.zipCode}]` : '',
    dto.address ?? '',
    dto.addressDetail ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return {
    id: shipmentId,
    orderId: dto.orderId,
    orderNumber,
    sellerId: dto.sellerId ?? 0,
    brandName: dto.brandName ?? '',
    buyerName: dto.receiverName ?? dto.buyerName ?? '구매자',
    buyerEmail: dto.receiverPhone ?? dto.buyerEmail ?? '',
    address: fullAddress,
    status: dto.status,
    totalAmount: dto.subtotal ?? dto.totalAmount ?? 0,
    createdAt,
    confirmedAt: dto.confirmedAt ?? undefined,
    canceledAt: dto.canceledAt ?? undefined,
    canceledBy: dto.canceledBy ?? undefined,
    cancelReason: dto.cancelReason ?? undefined,
    items: (dto.items ?? []).map(item => ({
      id: item.orderItemId ?? item.id ?? 0,
      optionId: item.optionId,
      productId: item.productId,
      productName: item.productName,
      productCode: item.productCode ?? '',
      colorName: item.colorName,
      sizeLabel: item.sizeLabel,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
    })),
  }
}

export async function getSellerShipments(
  _sellerId?: number,
): Promise<SellerShipment[]> {
  const raw = await fetchAllPages<BackendSellerShipmentDto>(
    '/api/seller/shipments',
  )
  return (raw ?? []).map(mapBackendShipment)
}

export async function updateShipmentStatus(
  shipmentId: number,
  nextStatus: 'PREPARING' | 'SHIPPING' | 'DELIVERED',
): Promise<SellerShipment> {
  const updated = await apiRequest<BackendSellerShipmentDto>(
    `/api/seller/shipments/${shipmentId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus }),
    },
  )
  return mapBackendShipment(updated)
}

export async function cancelSellerShipment(
  shipmentId: number,
  reason: string,
): Promise<SellerShipment> {
  const trimmedReason = reason.trim()
  if (!trimmedReason) {
    throw new Error('주문 취소 사유를 입력해 주세요.')
  }
  const updated = await apiRequest<BackendSellerShipmentDto>(
    `/api/seller/shipments/${shipmentId}/cancel`,
    {
      method: 'POST',
      body: JSON.stringify({ reason: trimmedReason }),
    },
  )
  return mapBackendShipment(updated)
}

// ============================================================================
// ADMIN: BRAND, PRODUCT, USER MANAGEMENT APIs
// ============================================================================

export async function getAdminBrands(): Promise<Brand[]> {
  const raw = await fetchAllPages<BackendBrandDto>('/api/admin/brands')
  const mapped = (raw ?? [])
    .map(b => {
      const mappedBrand = mapBackendBrand(b, `판매자 #${b.sellerId}`)
      cachedBrandSellerNames.set(mappedBrand.id, mappedBrand.sellerName)
      return mappedBrand
    })
    .sort((a, b) => b.id - a.id)
  return mapped
}

export async function updateAdminBrandStatus(
  brandId: number,
  status: BrandStatus,
  rejectReason?: string,
): Promise<Brand> {
  const updated = await apiRequest<BackendBrandDto>(
    `/api/admin/brands/${brandId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        rejectReason: status === 'REJECTED' ? rejectReason?.trim() : undefined,
      }),
    },
  )

  return mapBackendBrand(updated, `판매자 #${updated.sellerId}`)
}

export async function getAdminProducts(): Promise<Product[]> {
  const summaries = await fetchAllPages<BackendProductDetailDto>(
    '/api/admin/products',
  )
  const activeSummaries = (summaries ?? []).filter(
    s => s.status !== 'DELETED',
  )

  const enriched = await Promise.all(
    activeSummaries.map(async s => {
      if (s.status === 'REJECTED' && !s.rejectReason) {
        try {
          return await apiRequest<BackendProductDetailDto>(
            `/api/admin/products/${s.id}`,
          )
        } catch {
          return s
        }
      }
      return s
    }),
  )

  return enriched.map(mapBackendProductDetail).sort((a, b) => b.id - a.id)
}

export async function updateAdminProductStatus(
  productId: number,
  status: ProductStatus,
  rejectReason?: string,
): Promise<Product> {
  const updated = await apiRequest<BackendProductDetailDto>(
    `/api/admin/products/${productId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        rejectReason: status === 'REJECTED' ? rejectReason?.trim() : undefined,
      }),
    },
  )
  return mapBackendProductDetail(updated)
}

function mapBackendAdminUser(u: BackendAdminUserDto): UserItem {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone ?? undefined,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt ?? new Date().toISOString().slice(0, 19),
    withdrawnAt: u.withdrawnAt ?? undefined,
  }
}

export async function getAdminUsers(): Promise<UserItem[]> {
  const raw = await fetchAllPages<BackendAdminUserDto>('/api/admin/users')
  return (raw ?? []).map(mapBackendAdminUser).sort((a, b) => a.id - b.id)
}

export async function updateAdminUserStatus(
  userId: number,
  nextStatus: 'ACTIVE' | 'SUSPENDED',
): Promise<UserItem> {
  const updated = await apiRequest<BackendAdminUserDto>(
    `/api/admin/users/${userId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus }),
    },
  )
  return mapBackendAdminUser(updated)
}

export async function withdrawAdminUser(userId: number): Promise<UserItem> {
  const withdrawn = await apiRequest<BackendAdminUserDto>(
    `/api/admin/users/${userId}`,
    {
      method: 'DELETE',
    },
  )
  return mapBackendAdminUser(withdrawn)
}

// ============================================================================
// STATS APIs (SELLER & ADMIN)
// ============================================================================

function formatStatLabel(periodStart: string, period: StatPeriod): string {
  const parts = periodStart.split('-')
  if (parts.length < 3) return periodStart
  const [yyyy, mm, dd] = parts
  if (period === 'daily') {
    return `${mm}/${dd}`
  }
  if (period === 'weekly') {
    const dayNum = Number(dd)
    const weekOfMonth = Math.ceil(dayNum / 7)
    return `${Number(mm)}월 ${weekOfMonth}주 (${mm}/${dd})`
  }
  return `${yyyy}.${mm}`
}

export async function getSalesStats(
  period: StatPeriod,
  scope: 'SELLER' | 'ADMIN',
  fromDate?: string,
  toDate?: string,
): Promise<SalesStatPoint[]> {
  const backendPeriod = period.toUpperCase()
  const params = new URLSearchParams({ period: backendPeriod })
  if (period === 'daily') {
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)
  }

  const basePath =
    scope === 'ADMIN' ? '/api/admin/stats/sales' : '/api/seller/stats/sales'
  const response = await apiRequest<BackendSalesStatsResponse | SalesStatPoint[]>(
    `${basePath}?${params.toString()}`,
  )

  if (Array.isArray(response)) {
    return response
  }

  const rawPoints = response?.points ?? []
  const maxBars = period === 'daily' ? 10 : 6
  const sliced =
    rawPoints.length > maxBars
      ? rawPoints.slice(rawPoints.length - maxBars)
      : rawPoints

  return sliced.map(pt => ({
    label: formatStatLabel(pt.periodStart, period),
    dateKey: pt.periodStart,
    salesCount: pt.quantity ?? 0,
    revenue: pt.revenue ?? 0,
    orderCount: pt.orderCount ?? 0,
  }))
}

export async function getTopProducts(
  scope: 'SELLER' | 'ADMIN',
  fromDate?: string,
  toDate?: string,
): Promise<TopProductStat[]> {
  if (scope === 'SELLER') {
    const params = new URLSearchParams({
      sort: 'revenue',
      limit: '10',
      from: fromDate || '2026-01-01',
    })
    if (toDate) {
      params.set('to', toDate)
    }

    const [topRes, sellerProducts] = await Promise.all([
      apiRequest<BackendTopProductsResponse>(
        `/api/seller/stats/products/top?${params.toString()}`,
      ),
      cachedSellerProducts.length > 0
        ? Promise.resolve(cachedSellerProducts)
        : getSellerProducts(),
    ])

    const prodMap = new Map<number, Product>(
      sellerProducts.map(p => [p.id, p]),
    )

    return (topRes?.products ?? []).map(tp => {
      const matched = prodMap.get(tp.productId)
      const currentStock = matched
        ? matched.options.reduce((sum, o) => sum + o.stockQuantity, 0)
        : 0
      return {
        productId: tp.productId,
        productName: tp.productName,
        productCode: tp.productCode,
        brandName: matched?.brandName ?? '내 브랜드',
        categoryName: matched
          ? `${matched.parentCategoryName} > ${matched.categoryName}`
          : '패션',
        salesCount: tp.quantity ?? 0,
        revenue: tp.revenue ?? 0,
        currentStock,
      }
    })
  }

  const adminProducts = await getAdminProducts()
  return adminProducts.map(p => {
    const currentStock = p.options.reduce((sum, o) => sum + o.stockQuantity, 0)
    return {
      productId: p.id,
      productName: p.name,
      productCode: p.productCode,
      brandName: p.brandName,
      categoryName: `${p.parentCategoryName} > ${p.categoryName}`,
      salesCount: 0,
      revenue: 0,
      currentStock,
    }
  })
}

export async function getBrandSalesSummaries(): Promise<BrandSalesSummary[]> {
  const res = await apiRequest<BackendBrandSalesResponse>('/api/admin/stats/brands')
  return (res?.brands ?? [])
    .map(b => ({
      brandId: b.brandId,
      brandName: b.brandName,
      sellerName: b.sellerCompanyName ?? `판매자 #${b.sellerId}`,
      productCount: b.productCount ?? 0,
      salesCount: b.quantity ?? 0,
      revenue: b.revenue ?? 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
}
