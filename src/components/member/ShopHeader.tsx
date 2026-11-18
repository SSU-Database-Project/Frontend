import { useState, type FormEvent } from 'react'
import Icon from '../Icon'

const nav = [
  { id: 'home', label: '홈', icon: 'home' },
  { id: 'favorites', label: '좋아요', icon: 'heart' },
  { id: 'cart', label: '장바구니', icon: 'bag' },
  { id: 'mypage', label: '마이페이지', icon: 'USER' },
] as const

type Props = { active: string; name: string; onLogout: () => void; onSearch: (query: string) => void; onHome: () => void }

export default function ShopHeader({ active, name, onLogout, onSearch, onHome }: Props) {
  const [value, setValue] = useState('')
  function home() {
    setValue('')
    onHome()
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onSearch(value.trim())
  }
  return <header className="shop-header">
    <a className="wordmark" href="#home" aria-label="SEAM 홈" onClick={home}>SEAM<span className="brand-stitch" aria-hidden="true" /></a>
    <form role="search" className="shop-search" onSubmit={submit}>
      <input type="search" aria-label="상품 검색" placeholder="상품명 또는 브랜드 검색" value={value} onChange={e => setValue(e.target.value)} />
      <button aria-label="검색" type="submit"><Icon name="search" /></button>
    </form>
    <nav className="member-nav" aria-label="쇼핑 메뉴">{nav.map(item =>
      <a key={item.id} className={'nav-' + item.id} href={'#' + item.id} aria-current={active === item.id ? 'page' : undefined} onClick={item.id === 'home' ? home : undefined}>
        <Icon name={item.icon} /><span>{item.label}</span>
      </a>)}</nav>
    <div className="shop-session" aria-label="로그인한 계정">
      <a className="shop-account-name" href="#mypage" title={name + '님 마이페이지'}>
        <strong>{name}</strong><span>님</span>
      </a>
      <button className="shop-logout" type="button" onClick={onLogout}>로그아웃</button>
    </div>
  </header>
}
