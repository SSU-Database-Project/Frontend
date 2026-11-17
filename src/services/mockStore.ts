import { API_BASE_URL, apiRequest, AUTH_TOKEN_KEY, IS_MOCK_MODE } from './api'
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
  SizeGroup,
  SizeOption,
  StatPeriod,
  StockHistoryItem,
  StockHistoryType,
  TopProductStat,
  UserItem,
  UserStatus,
} from '../types/commerce'
import type { Role } from '../types/role'

export const MOCK_SESSION_KEY = 'seam_mock_user_id'

function currentSellerId() {
  return Number(sessionStorage.getItem(MOCK_SESSION_KEY)) || 2
}

const STORAGE_KEY = 'seam_mock_db_v5'
const PENDING_BRAND_PRODUCTS_KEY = 'seam_pending_brand_products_v1'
const DELETED_BRAND_IDS_KEY = 'seam_deleted_brand_ids_v1'
const DELETED_PRODUCT_IDS_KEY = 'seam_deleted_product_ids_v1'
const SHIPMENT_OVERRIDES_KEY = 'seam_shipment_overrides_v1'

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
  if (IS_MOCK_MODE) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('이미지 파일을 읽지 못했습니다.'))
        }
      }
      reader.onerror = () => reject(new Error('이미지 파일을 읽지 못했습니다.'))
      reader.readAsDataURL(file)
    })
  }

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
  if (!IS_MOCK_MODE) return
  const initial = createInitialDatabase()
  saveDb(initial)
}

export function getUnreadChanges(): UnreadChangesState {
  if (!IS_MOCK_MODE) {
    return {
      SELLER: { brands: 0, products: 0, inventory: 0, orders: 0, stats: 0 },
      ADMIN: { brands: 0, products: 0, users: 0, stats: 0 },
    }
  }
  const db = loadDb()
  return ensureUnreadChanges(db)
}

export function clearSellerTabBadge(tab: SellerTabKey): void {
  if (!IS_MOCK_MODE) return
  const db = loadDb()
  const unread = ensureUnreadChanges(db)
  if (unread.SELLER[tab] !== 0) {
    unread.SELLER[tab] = 0
    saveDb(db)
  }
}

export function clearAdminTabBadge(tab: AdminTabKey): void {
  if (!IS_MOCK_MODE) return
  const db = loadDb()
  const unread = ensureUnreadChanges(db)
  if (unread.ADMIN[tab] !== 0) {
    unread.ADMIN[tab] = 0
    saveDb(db)
  }
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
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
    sellerName: dto.sellerCompanyName ?? dto.brandName,
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

function loadIdSet(storageKey: string): Set<number> {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as number[]
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

function saveIdSet(storageKey: string, set: Set<number>): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(set)))
  } catch {
    // Ignore
  }
}

type PendingBrandProductEntry = {
  brandId: number
  brandName: string
  sellerToken?: string | null
  draft: InitialProductDraftInput
}

function loadPendingBrandProducts(): PendingBrandProductEntry[] {
  try {
    const raw = localStorage.getItem(PENDING_BRAND_PRODUCTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PendingBrandProductEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function savePendingBrandProducts(entries: PendingBrandProductEntry[]): void {
  try {
    localStorage.setItem(PENDING_BRAND_PRODUCTS_KEY, JSON.stringify(entries))
  } catch {
    // Ignore
  }
}

async function flushPendingBrandProductForBrand(brandId: number, tokenOverride?: string | null): Promise<void> {
  const entries = loadPendingBrandProducts()
  const target = entries.find(e => e.brandId === brandId)
  if (!target) return

  const remaining = entries.filter(e => e.brandId !== brandId)
  savePendingBrandProducts(remaining)

  const token = tokenOverride ?? target.sellerToken ?? localStorage.getItem(AUTH_TOKEN_KEY)
  const headers: Record<string, string> = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const draft = target.draft
    await apiRequest<BackendProductDetailDto>('/api/seller/products', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        brandId,
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
      }),
    })
  } catch {
    // 이미 등록되었거나 권한 토큰이 만료된 경우 무시
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
  db: MockDatabase | null,
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

  if (db && existingBrandId !== undefined) {
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
  if (IS_MOCK_MODE) {
    const db = loadDb()
    const trimmedBrand = brandName?.trim().toLowerCase()
    const existingBrand = trimmedBrand
      ? db.brands.find(b => b.name.toLowerCase() === trimmedBrand)
      : undefined
    validateInitialProductDraftWithDb(db, draft, existingBrand?.id)
    return
  }

  validateInitialProductDraftWithDb(null, draft)
}

export async function getSellerBrands(
  sellerId: number = currentSellerId(),
): Promise<Brand[]> {
  if (IS_MOCK_MODE) {
    const db = loadDb()
    return db.brands
      .filter(b => b.sellerId === sellerId || b.status === 'APPROVED')
      .sort((a, b) => b.id - a.id)
  }

  let sellerCompanyName = '내 브랜드'
  try {
    const sellerInfo = await apiRequest<{ companyName?: string }>('/api/seller/me')
    if (sellerInfo?.companyName) {
      sellerCompanyName = sellerInfo.companyName
    }
  } catch {
    // Ignore if /api/seller/me fails
  }

  const deletedIds = loadIdSet(DELETED_BRAND_IDS_KEY)
  const rawBrands = await apiRequest<BackendBrandDto[]>('/api/seller/brands')
  const mapped = (rawBrands ?? [])
    .filter(b => !deletedIds.has(b.id))
    .map(b => mapBackendBrand(b, sellerCompanyName))
    .sort((a, b) => b.id - a.id)

  for (const b of mapped) {
    if (b.status === 'APPROVED') {
      await flushPendingBrandProductForBrand(b.id)
    }
  }

  return mapped
}

export async function createSellerBrand(input: {
  name: string
  description: string
  sellerId?: number
  initialProduct: InitialProductDraftInput
}): Promise<Brand> {
  if (IS_MOCK_MODE) {
    const db = loadDb()
    const unread = ensureUnreadChanges(db)
    const sellerId = input.sellerId ?? currentSellerId()
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

    const { category, parentCategory, trimmedProductName, trimmedProductCode } =
      validateInitialProductDraftWithDb(db, input.initialProduct, existingBrand?.id)

    let targetBrand: Brand
    let brandChanged = false

    if (existingBrand) {
      if (existingBrand.status === 'APPROVED') {
        targetBrand = existingBrand
      } else {
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

  const trimmedName = input.name.trim()
  const existingBrands = await getSellerBrands()
  const matchedApproved = existingBrands.find(
    b => b.name.toLowerCase() === trimmedName.toLowerCase() && b.status === 'APPROVED',
  )

  if (matchedApproved) {
    if (input.initialProduct) {
      await createSellerProduct({
        brandId: matchedApproved.id,
        ...input.initialProduct,
      })
    }
    return matchedApproved
  }

  const createdDto = await apiRequest<BackendBrandDto>('/api/seller/brands', {
    method: 'POST',
    body: JSON.stringify({
      name: trimmedName,
      description: input.description.trim() || undefined,
    }),
  })
  const createdBrand = mapBackendBrand(createdDto)

  if (input.initialProduct) {
    if (createdBrand.status === 'APPROVED') {
      await createSellerProduct({
        brandId: createdBrand.id,
        ...input.initialProduct,
      })
    } else {
      const pendingEntries = loadPendingBrandProducts().filter(
        e => e.brandId !== createdBrand.id,
      )
      pendingEntries.push({
        brandId: createdBrand.id,
        brandName: createdBrand.name,
        sellerToken: localStorage.getItem(AUTH_TOKEN_KEY),
        draft: input.initialProduct,
      })
      savePendingBrandProducts(pendingEntries)
    }
  }

  return createdBrand
}

export async function deleteSellerBrand(
  brandId: number,
  actor: 'SELLER' | 'ADMIN' = 'SELLER',
): Promise<void> {
  if (IS_MOCK_MODE) {
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
    return
  }

  if (actor === 'SELLER') {
    try {
      const myProducts = await getSellerProducts()
      const brandProducts = myProducts.filter(p => p.brandId === brandId && p.status !== 'BLOCKED')
      await Promise.all(
        brandProducts.map(p =>
          apiRequest<void>(`/api/seller/products/${p.id}`, { method: 'DELETE' }).catch(() => undefined),
        ),
      )
    } catch {
      // Ignore
    }
  }

  const deletedIds = loadIdSet(DELETED_BRAND_IDS_KEY)
  deletedIds.add(brandId)
  saveIdSet(DELETED_BRAND_IDS_KEY, deletedIds)
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
  sellerId: number = currentSellerId(),
): Promise<Product[]> {
  if (IS_MOCK_MODE) {
    const db = loadDb()
    return db.products
      .filter(p => p.sellerId === sellerId && p.status !== 'DELETED')
      .sort((a, b) => b.id - a.id)
  }

  const deletedProductIds = loadIdSet(DELETED_PRODUCT_IDS_KEY)
  const deletedBrandIds = loadIdSet(DELETED_BRAND_IDS_KEY)
  const summaries = await apiRequest<BackendProductSummaryDto[]>('/api/seller/products?size=100')
  const activeSummaries = (summaries ?? []).filter(
    s =>
      s.status !== 'DELETED' &&
      !deletedProductIds.has(s.id) &&
      !deletedBrandIds.has(s.brandId),
  )

  const details = await Promise.all(
    activeSummaries.map(s =>
      apiRequest<BackendProductDetailDto>(`/api/seller/products/${s.id}`).catch(() => ({
        ...s,
        options: [],
      })),
    ),
  )

  const mapped = details.map(mapBackendProductDetail).sort((a, b) => b.id - a.id)
  cachedSellerProducts = mapped
  return mapped
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

export async function createSellerProduct(
  input: UpsertProductInput,
): Promise<Product> {
  if (IS_MOCK_MODE) {
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

    const seller = db.users.find(u => u.id === currentSellerId())
    const sellerName =
      seller?.sellerInfo?.companyName ?? seller?.name ?? brand.sellerName

    const newProduct: Product = {
      id: productId,
      brandId: brand.id,
      brandName: brand.name,
      sellerId: currentSellerId(),
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

  validateInitialProductDraftWithDb(null, input)
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
  if (IS_MOCK_MODE) {
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

  validateInitialProductDraftWithDb(null, input)
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
  if (IS_MOCK_MODE) {
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
  actor: 'SELLER' | 'ADMIN' = 'SELLER',
): Promise<void> {
  if (IS_MOCK_MODE) {
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
    return
  }

  if (actor === 'SELLER') {
    await apiRequest<void>(`/api/seller/products/${productId}`, {
      method: 'DELETE',
    })
    return
  }

  // Admin: 백엔드는 물리 삭제 대신 차단(BLOCKED)/거절(REJECTED) 상태를 사용하므로 상태 전환 후 숨김 처리
  try {
    const detail = await apiRequest<BackendProductDetailDto>(`/api/admin/products/${productId}`)
    if (detail.status === 'ON_SALE' || detail.status === 'SOLD_OUT') {
      await apiRequest(`/api/admin/products/${productId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'BLOCKED' }),
      })
    } else if (detail.status === 'PENDING') {
      await apiRequest(`/api/admin/products/${productId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'REJECTED', rejectReason: '관리자 삭제 처리' }),
      })
    }
  } catch {
    // Ignore transition error if already REJECTED or BLOCKED
  }

  const deletedProductIds = loadIdSet(DELETED_PRODUCT_IDS_KEY)
  deletedProductIds.add(productId)
  saveIdSet(DELETED_PRODUCT_IDS_KEY, deletedProductIds)
}

export async function adjustOptionStock(input: {
  optionId: number
  type: 'IN' | 'ADJUST'
  changeQty: number
  memo?: string
}): Promise<ProductOption> {
  if (IS_MOCK_MODE) {
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
  sellerId: number = currentSellerId(),
  optionId?: number,
  productsHint?: Product[],
): Promise<StockHistoryItem[]> {
  if (IS_MOCK_MODE) {
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

  const products =
    productsHint && productsHint.length > 0
      ? productsHint
      : cachedSellerProducts.length > 0
        ? cachedSellerProducts
        : await getSellerProducts(sellerId)

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
        const rows = await apiRequest<BackendStockHistoryDto[]>(
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

type ShipmentOverride = {
  status: ShipmentStatus
  confirmedAt?: string
  canceledAt?: string
}

function loadShipmentOverrides(): Record<number, ShipmentOverride> {
  try {
    const raw = localStorage.getItem(SHIPMENT_OVERRIDES_KEY)
    if (!raw) return {}
    return (JSON.parse(raw) as Record<number, ShipmentOverride>) ?? {}
  } catch {
    return {}
  }
}

function saveShipmentOverride(shipmentId: number, override: ShipmentOverride): void {
  try {
    const map = loadShipmentOverrides()
    map[shipmentId] = override
    localStorage.setItem(SHIPMENT_OVERRIDES_KEY, JSON.stringify(map))
  } catch {
    // Ignore
  }
}

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

  const override = loadShipmentOverrides()[shipmentId]
  const finalStatus = override?.status ?? dto.status

  return {
    id: shipmentId,
    orderId: dto.orderId,
    orderNumber,
    sellerId: dto.sellerId ?? 0,
    brandName: dto.brandName ?? '',
    buyerName: dto.receiverName ?? dto.buyerName ?? '구매자',
    buyerEmail: dto.receiverPhone ?? dto.buyerEmail ?? '',
    address: fullAddress,
    status: finalStatus,
    totalAmount: dto.subtotal ?? dto.totalAmount ?? 0,
    createdAt,
    confirmedAt: override?.confirmedAt ?? dto.confirmedAt ?? undefined,
    canceledAt: override?.canceledAt ?? dto.canceledAt ?? undefined,
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
  sellerId: number = currentSellerId(),
): Promise<SellerShipment[]> {
  if (IS_MOCK_MODE) {
    const db = loadDb()
    return db.shipments
      .filter(s => s.sellerId === sellerId)
      .sort((a, b) => b.id - a.id)
  }

  const raw = await apiRequest<BackendSellerShipmentDto[]>(
    '/api/seller/shipments?size=100',
  )
  return (raw ?? []).map(mapBackendShipment)
}

const VALID_NEXT_SHIPMENT_STATUS: Record<ShipmentStatus, ShipmentStatus[]> = {
  ORDERED: ['PREPARING', 'CANCELED'],
  PREPARING: ['SHIPPING'],
  SHIPPING: ['DELIVERED'],
  DELIVERED: ['CONFIRMED'],
  CONFIRMED: [],
  CANCELED: [],
}

export async function updateShipmentStatus(
  shipmentId: number,
  nextStatus: ShipmentStatus,
): Promise<SellerShipment> {
  if (IS_MOCK_MODE) {
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

  // 백엔드 SellerShipmentController 는 PREPARING, SHIPPING, DELIVERED 3가지를 지원
  if (
    nextStatus === 'PREPARING' ||
    nextStatus === 'SHIPPING' ||
    nextStatus === 'DELIVERED'
  ) {
    const updated = await apiRequest<BackendSellerShipmentDto>(
      `/api/seller/shipments/${shipmentId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      },
    )
    return mapBackendShipment(updated)
  }

  // CONFIRMED / CANCELED 를 판매자 센터에서 직접 클릭한 경우
  const now = new Date().toISOString().slice(0, 19)
  const shipments = await getSellerShipments()
  const target = shipments.find(s => s.id === shipmentId)
  if (!target) {
    throw new Error('배송 내역을 찾을 수 없습니다.')
  }

  if (nextStatus === 'CANCELED') {
    for (const item of target.items) {
      await apiRequest(`/api/seller/options/${item.optionId}/stock`, {
        method: 'POST',
        body: JSON.stringify({
          type: 'IN',
          quantity: item.quantity,
          memo: `주문 취소 재고 복원 (${target.orderNumber})`,
        }),
      }).catch(() => undefined)
    }
  }

  saveShipmentOverride(shipmentId, {
    status: nextStatus,
    confirmedAt: nextStatus === 'CONFIRMED' ? now : undefined,
    canceledAt: nextStatus === 'CANCELED' ? now : undefined,
  })

  return {
    ...target,
    status: nextStatus,
    confirmedAt: nextStatus === 'CONFIRMED' ? now : target.confirmedAt,
    canceledAt: nextStatus === 'CANCELED' ? now : target.canceledAt,
  }
}

// ============================================================================
// ADMIN: BRAND, PRODUCT, USER MANAGEMENT APIs
// ============================================================================

export async function getAdminBrands(): Promise<Brand[]> {
  if (IS_MOCK_MODE) {
    const db = loadDb()
    return [...db.brands].sort((a, b) => b.id - a.id)
  }

  const deletedIds = loadIdSet(DELETED_BRAND_IDS_KEY)
  const raw = await apiRequest<BackendBrandDto[]>('/api/admin/brands?size=100')
  return (raw ?? [])
    .filter(b => !deletedIds.has(b.id))
    .map(b => mapBackendBrand(b, `판매자 #${b.sellerId}`))
    .sort((a, b) => b.id - a.id)
}

export async function updateAdminBrandStatus(
  brandId: number,
  status: BrandStatus,
  rejectReason?: string,
): Promise<Brand> {
  if (IS_MOCK_MODE) {
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

  if (status === 'APPROVED') {
    await flushPendingBrandProductForBrand(brandId)
  }

  return mapBackendBrand(updated, `판매자 #${updated.sellerId}`)
}

export async function getAdminProducts(): Promise<Product[]> {
  if (IS_MOCK_MODE) {
    const db = loadDb()
    return db.products
      .filter(p => p.status !== 'DELETED')
      .sort((a, b) => b.id - a.id)
  }

  const deletedProductIds = loadIdSet(DELETED_PRODUCT_IDS_KEY)
  const deletedBrandIds = loadIdSet(DELETED_BRAND_IDS_KEY)
  const summaries = await apiRequest<BackendProductSummaryDto[]>(
    '/api/admin/products?size=100',
  )
  const activeSummaries = (summaries ?? []).filter(
    s =>
      s.status !== 'DELETED' &&
      !deletedProductIds.has(s.id) &&
      !deletedBrandIds.has(s.brandId),
  )

  const details = await Promise.all(
    activeSummaries.map(s =>
      apiRequest<BackendProductDetailDto>(`/api/admin/products/${s.id}`).catch(() => ({
        ...s,
        options: [],
      })),
    ),
  )

  return details.map(mapBackendProductDetail).sort((a, b) => b.id - a.id)
}

export async function updateAdminProductStatus(
  productId: number,
  status: ProductStatus,
  rejectReason?: string,
): Promise<Product> {
  if (IS_MOCK_MODE) {
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
    role: u.role,
    status: u.status,
    createdAt: u.createdAt ?? new Date().toISOString().slice(0, 19),
    withdrawnAt: u.withdrawnAt ?? undefined,
  }
}

export async function getAdminUsers(): Promise<UserItem[]> {
  if (IS_MOCK_MODE) {
    const db = loadDb()
    return [...db.users].sort((a, b) => a.id - b.id)
  }

  const raw = await apiRequest<BackendAdminUserDto[]>('/api/admin/users?size=100')
  return (raw ?? []).map(mapBackendAdminUser).sort((a, b) => a.id - b.id)
}

export async function updateAdminUserStatus(
  userId: number,
  nextStatus: 'ACTIVE' | 'SUSPENDED',
): Promise<UserItem> {
  if (IS_MOCK_MODE) {
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
  if (IS_MOCK_MODE) {
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
  if (IS_MOCK_MODE) {
    const db = loadDb()
    const activeShipments = db.shipments.filter(
      s =>
        s.status !== 'CANCELED' &&
        (scope === 'ADMIN' || s.sellerId === currentSellerId()),
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
): Promise<TopProductStat[]> {
  if (IS_MOCK_MODE) {
    const db = loadDb()
    const products = db.products.filter(
      p =>
        p.status !== 'DELETED' &&
        (scope === 'ADMIN' || p.sellerId === currentSellerId()),
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

  if (scope === 'SELLER') {
    const [topRes, sellerProducts] = await Promise.all([
      apiRequest<BackendTopProductsResponse>(
        '/api/seller/stats/products/top?sort=revenue&limit=10&from=2026-01-01',
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
  if (IS_MOCK_MODE) {
    const db = loadDb()
    const topProducts = await getTopProducts('ADMIN')
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

  // 백엔드 AdminStatsController 는 /api/admin/stats/sales 를 제공하므로
  // 실제 입점 브랜드, 상품 목록, 플랫폼 전체 판매 통계를 조합해 브랜드별 실적을 구성한다.
  const [brands, products, platformStats] = await Promise.all([
    getAdminBrands(),
    getAdminProducts(),
    apiRequest<BackendSalesStatsResponse>('/api/admin/stats/sales?period=MONTHLY'),
  ])

  const approvedBrands = brands.filter(b => b.status === 'APPROVED')
  const totalPlatformQty = platformStats?.totalQuantity ?? 0
  const totalPlatformRev = platformStats?.totalRevenue ?? 0

  const weights = approvedBrands.map(b => {
    const bProds = products.filter(
      p => p.brandId === b.id && (p.status === 'ON_SALE' || p.status === 'SOLD_OUT'),
    )
    const valueWeight = bProds.reduce((sum, p) => sum + p.price, 0)
    return {
      brand: b,
      productCount: products.filter(p => p.brandId === b.id && p.status !== 'DELETED').length,
      countWeight: bProds.length,
      valueWeight,
    }
  })

  const sumCountWeight = weights.reduce((s, w) => s + w.countWeight, 0) || 1
  const sumValueWeight = weights.reduce((s, w) => s + w.valueWeight, 0) || 1

  return weights
    .map(w => ({
      brandId: w.brand.id,
      brandName: w.brand.name,
      sellerName: w.brand.sellerName,
      productCount: w.productCount,
      salesCount: Math.round((totalPlatformQty * w.countWeight) / sumCountWeight),
      revenue: Math.round((totalPlatformRev * w.valueWeight) / sumValueWeight),
    }))
    .sort((a, b) => b.revenue - a.revenue)
}
