import { useEffect, useState } from 'react'
import AccountLayout from './components/AccountLayout'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import SellerWorkspace from './pages/seller/SellerWorkspace'
import AdminWorkspace from './pages/admin/AdminWorkspace'
import MemberShop from './pages/member/MemberShop'
import { AUTH_TOKEN_KEY, IS_MOCK_MODE, SESSION_EXPIRED } from './services/api'
import { hasSession, logout, restoreSession } from './services/auth'
import type { AuthUser } from './types/auth'

type Screen =
  | { page: 'login'; registeredEmail?: string; message?: string }
  | { page: 'signup' | 'restoring' | 'restore-error' }
  | { page: 'home'; user: AuthUser }

function clearRoute() {
  window.history.replaceState(null, '', window.location.pathname + window.location.search)
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => ({ page: hasSession() ? 'restoring' : 'login' }))

  useEffect(() => {
    function expired() {
      clearRoute()
      setScreen({ page: 'login', message: '로그인이 만료되었습니다. 다시 로그인해 주세요.' })
    }
    function sync(event: StorageEvent) {
      if (IS_MOCK_MODE || (event.key !== AUTH_TOKEN_KEY && event.key !== null)) return
      clearRoute()
      setScreen({ page: hasSession() ? 'restoring' : 'login' })
    }
    window.addEventListener(SESSION_EXPIRED, expired)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(SESSION_EXPIRED, expired)
      window.removeEventListener('storage', sync)
    }
  }, [])

  useEffect(() => {
    if (screen.page !== 'restoring') return
    let active = true
    restoreSession().then(user => {
      if (active) setScreen({ page: 'home', user })
    }).catch(() => {
      if (active && hasSession()) setScreen({ page: 'restore-error' })
    })
    return () => { active = false }
  }, [screen])

  function signOut() {
    logout()
    clearRoute()
    setScreen({ page: 'login' })
  }

  function accountWithdrawn() {
    logout()
    clearRoute()
    setScreen({ page: 'login', message: '회원 탈퇴가 완료되었습니다.' })
  }

  function accountPasswordChanged() {
    logout()
    clearRoute()
    setScreen({ page: 'login', message: '비밀번호가 변경되었습니다. 새 비밀번호로 다시 로그인해 주세요.' })
  }

  if (screen.page === 'home') {
    const { user } = screen
    if (user.role === 'USER') return <MemberShop key={user.id} user={user} onExit={signOut}
      onWithdrawn={accountWithdrawn} onPasswordChanged={accountPasswordChanged} />
    if (user.role === 'SELLER') return <SellerWorkspace accountLabel={user.name} onLogout={signOut} />
    return <AdminWorkspace accountLabel={user.email} onLogout={signOut} />
  }

  return <AccountLayout>
    {screen.page === 'restoring' && <p role="status">로그인 정보를 확인하고 있습니다.</p>}
    {screen.page === 'restore-error' && <>
      <h1 id="screen-title">계정 확인</h1>
      <p className="intro" role="alert">로그인 정보를 확인하지 못했습니다. 연결 상태를 확인해 주세요.</p>
      <button className="primary-button" type="button" onClick={() => setScreen({ page: 'restoring' })}>다시 시도</button>
      <button className="back-link" type="button" onClick={signOut}>로그인으로 돌아가기</button>
    </>}
    {screen.page === 'signup' && <SignupPage onLogin={() => setScreen({ page: 'login' })}
      onRegistered={email => setScreen({ page: 'login', registeredEmail: email, message: '회원가입이 완료되었습니다. 로그인해 주세요.' })} />}
    {screen.page === 'login' && <LoginPage onSignup={() => setScreen({ page: 'signup' })}
      initialEmail={screen.registeredEmail} message={screen.message} onAuthenticated={user => {
        clearRoute()
        setScreen({ page: 'home', user })
      }} />}
  </AccountLayout>
}
