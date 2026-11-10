import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import totePhoto from './assets/seam-tote.webp'
import './App.css'

type Screen = 'login' | 'signup' | 'roles'
type Role = 'ADMIN' | 'USER' | 'SELLER'
type IconName = 'arrow' | 'back' | 'eye' | 'eyeOff' | 'lock' | 'check' | Role

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    back: <path d="M20 12H5m6 6-6-6 6-6" />,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    eyeOff: <><path d="m3 3 18 18M10 5.2c6-1.3 10.5 4.5 12 6.8a21 21 0 0 1-3.5 4.2M6 6.8A21 21 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 4-.8" /></>,
    lock: <><rect x="5.5" y="10" width="13" height="11" rx="2" /><path d="M8.5 10V7a3.5 3.5 0 0 1 7 0v3m-3.5 5v2" /></>,
    check: <path d="m5 12 4.5 4.5L19 7" />,
    ADMIN: <><path d="m12 2 8 3v6c0 5-3.6 8.6-8 11-4.4-2.4-8-6-8-11V5l8-3Z" /><path d="m8.5 11.5 2.3 2.3 4.7-4.7" /></>,
    USER: <><circle cx="12" cy="8" r="3.6" /><path d="M4.5 21v-2a7.5 7.5 0 0 1 15 0v2" /></>,
    SELLER: <><path d="M4 11v9h16v-9M3 8l2-5h14l2 5v1a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V8Zm6 12v-6h6v6" /></>,
  }
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

const roles: { id: Role; name: string; details: string }[] = [
  { id: 'ADMIN', name: '관리자', details: '회원 관리와 브랜드·상품 승인' },
  { id: 'USER', name: '일반회원', details: '상품 쇼핑과 주문 내역 확인' },
  { id: 'SELLER', name: '판매자', details: '브랜드·상품 관리와 배송 처리' },
]

function AccountForm({ mode, onSwitch, onComplete }: {
  mode: 'login' | 'signup'
  onSwitch: () => void
  onComplete: () => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const signup = mode === 'signup'
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onComplete()
  }

  return (
    <>
      <form className="account-form" onSubmit={submit} noValidate={!signup}>
        {signup && <div className="field">
          <label htmlFor="name">이름</label>
          <input id="name" autoComplete="name" placeholder="이름을 입력하세요" required maxLength={50} />
        </div>}
        <div className="field">
          <label htmlFor="email">이메일</label>
          <input id="email" type="email" autoComplete={signup ? 'email' : 'username'} placeholder="name@example.com" required={signup} />
        </div>
        <div className="field">
          <label htmlFor="password">비밀번호</label>
          <div className="password-input">
            <input id="password" type={showPassword ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} placeholder={signup ? '8자 이상 입력하세요' : '비밀번호를 입력하세요'} required={signup} minLength={signup ? 8 : undefined} />
            <button type="button" className="visibility-toggle" aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'} onClick={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? 'eyeOff' : 'eye'} />
            </button>
          </div>
        </div>
        <button className="primary-button" type="submit">{signup ? '회원가입' : '로그인'}<Icon name="arrow" /></button>
      </form>
      <div className="account-switch">
        <span>{signup ? '이미 계정이 있으신가요?' : '아직 계정이 없으신가요?'}</span>
        <button type="button" onClick={onSwitch}>{signup ? '로그인' : '회원가입'}</button>
      </div>
    </>
  )
}

function RolePicker({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<Role | null>(null)
  return (
    <>
      <div className="role-list" role="group" aria-label="이용할 역할">
        {roles.map(role => (
          <button className="role-option" key={role.id} type="button" aria-pressed={selected === role.id} onClick={() => setSelected(role.id)}>
            <span className="role-icon"><Icon name={role.id} /></span>
            <span className="role-copy"><strong>{role.name}</strong><small>{role.details}</small></span>
            <span className="selection-dot">{selected === role.id && <Icon name="check" />}</span>
          </button>
        ))}
      </div>
      <button className="back-link" type="button" onClick={onBack}><Icon name="back" />로그인으로 돌아가기</button>
    </>
  )
}

const screens = {
  login: { title: '로그인', description: '지금은 입력 없이 로그인하고 역할을 선택할 수 있어요.' },
  signup: { title: '회원가입', description: '가입 정보를 입력하면 역할 선택으로 이어져요.' },
  roles: { title: '역할 선택', description: '이용할 역할을 선택해 주세요.' },
}

function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const heading = useRef<HTMLHeadingElement>(null)
  const previousScreen = useRef(screen)
  useEffect(() => {
    document.title = screens[screen].title + ' | SEAM'
    if (previousScreen.current !== screen) heading.current?.focus()
    previousScreen.current = screen
  }, [screen])

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="wordmark" aria-label="SEAM">SEAM<span className="brand-stitch" aria-hidden="true" /></div>
        <span className="member-label"><Icon name="lock" />회원 전용</span>
      </header>
      <main className="account-layout">
        <figure className="editorial">
          <div className="photo-frame"><img src={totePhoto} alt="크롬 의자에 놓인 코발트 블루 캔버스 토트백" fetchPriority="high" /></div>
          <figcaption><span className="item-name">캔버스 토트백</span><span className="item-color"><i aria-hidden="true" />코발트 블루</span></figcaption>
        </figure>
        <section className="account-panel" aria-labelledby="screen-title">
          <div className="panel-inner">
            <h1 id="screen-title" ref={heading} tabIndex={-1}>{screens[screen].title}</h1>
            <p className="intro">{screens[screen].description}</p>
            {screen === 'roles'
              ? <RolePicker onBack={() => setScreen('login')} />
              : <AccountForm key={screen} mode={screen} onSwitch={() => setScreen(screen === 'login' ? 'signup' : 'login')} onComplete={() => setScreen('roles')} />}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
