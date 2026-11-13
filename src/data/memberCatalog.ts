import knit from '../assets/catalog/knit.webp'
import shirt from '../assets/catalog/shirt.webp'
import hoodie from '../assets/catalog/hoodie.webp'
import stripe from '../assets/catalog/stripe.webp'
import denim from '../assets/catalog/denim.webp'
import slacks from '../assets/catalog/slacks.webp'
import trench from '../assets/catalog/trench.webp'
import blouson from '../assets/catalog/blouson.webp'
import cap from '../assets/catalog/cap.webp'
import tote from '../assets/seam-tote.webp'

export const categories = ['상의', '하의', '아우터', '잡화'] as const
export type Category = typeof categories[number]

export type Product = {
  id: number
  name: string
  brand: string
  category: Category
  price: number
  image: string
  colors: string[]
  sizes: string[]
  stock: number
  season: string
  gender: string
  dispatch: string
  registered: string
}

const apparel = { sizes: ['S', 'M', 'L'], gender: '남녀공용', dispatch: '주문 후 2영업일 이내' }

export const products: Product[] = [
  { ...apparel, id: 1010, name: '울 블렌드 크루넥 니트', brand: 'SEAM', category: '상의', price: 69000, image: knit, colors: ['코발트 블루', '차콜'], stock: 12, season: '가을 · 겨울', registered: '2026-11-10' },
  { ...apparel, id: 1009, name: '핀스트라이프 코튼 셔츠', brand: 'FORM STUDIO', category: '상의', price: 58000, image: shirt, colors: ['스카이 블루', '그레이'], stock: 18, season: '봄 · 가을', registered: '2026-11-09' },
  { ...apparel, id: 1008, name: '오트밀 스웨트 후디', brand: 'BASEMENT', category: '상의', price: 62000, image: hoodie, colors: ['오트밀', '멜란지 그레이'], stock: 8, season: '가을 · 겨울', registered: '2026-11-08' },
  { ...apparel, id: 1007, name: '브레통 스트라이프 티셔츠', brand: 'SEAM', category: '상의', price: 39000, image: stripe, colors: ['네이비', '아이보리'], stock: 15, season: '봄 · 가을', registered: '2026-11-07' },
  { ...apparel, id: 1006, name: '스트레이트 인디고 데님', brand: 'BASEMENT', category: '하의', price: 79000, image: denim, colors: ['인디고', '블랙'], sizes: ['28', '30', '32'], stock: 11, season: '사계절', registered: '2026-11-06' },
  { ...apparel, id: 1005, name: '투턱 와이드 슬랙스', brand: 'FORM STUDIO', category: '하의', price: 89000, image: slacks, colors: ['차콜', '블랙'], stock: 8, season: '사계절', registered: '2026-11-05' },
  { ...apparel, id: 1004, name: '코튼 숏 트렌치 재킷', brand: 'FORM STUDIO', category: '아우터', price: 149000, image: trench, colors: ['샌드 베이지', '카키'], stock: 5, season: '봄 · 가을', registered: '2026-11-04' },
  { ...apparel, id: 1003, name: '나일론 집업 블루종', brand: 'BASEMENT', category: '아우터', price: 119000, image: blouson, colors: ['블랙', '올리브'], stock: 0, season: '봄 · 가을', registered: '2026-11-03' },
  { ...apparel, id: 1002, name: '워시드 코튼 볼캡', brand: 'BASEMENT', category: '잡화', price: 29000, image: cap, colors: ['버건디', '블랙'], sizes: ['FREE'], stock: 16, season: '사계절', registered: '2026-11-02' },
  { ...apparel, id: 1001, name: '캔버스 토트백', brand: 'SEAM', category: '잡화', price: 42000, image: tote, colors: ['코발트 블루', '아이보리'], sizes: ['FREE'], stock: 10, season: '사계절', registered: '2026-11-01' },
]

export const formatPrice = (value: number) => value.toLocaleString('ko-KR') + '원'

export const demoOrders = [
  { number: '20261108-002', date: '2026.11.08', productId: 1009, color: '스카이 블루', size: 'M', quantity: 1, unitPrice: 58000, status: '배송 중' },
  { number: '20261104-001', date: '2026.11.04', productId: 1001, color: '코발트 블루', size: 'FREE', quantity: 1, unitPrice: 42000, status: '배송 완료' },
]
