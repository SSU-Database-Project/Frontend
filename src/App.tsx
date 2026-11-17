import { useState } from 'react'
import AccountLayout from './components/AccountLayout'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import RoleSelectionPage from './pages/RoleSelectionPage'
import RoleHomePage from './pages/RoleHomePage'
import SellerWorkspace from './pages/seller/SellerWorkspace'
import AdminWorkspace from './pages/admin/AdminWorkspace'
import MemberShop from './pages/member/MemberShop'
import type { Role } from './types/role'

type Screen = 'login' | 'signup' | 'roles' | Role

export default function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const openLogin = () => setScreen('login')
  const openRoles = () => setScreen('roles')
  function enterRole(role: Role) {
    if (role === 'USER') window.history.replaceState(null, '', '#home')
    setScreen(role)
  }

  function leaveShop() {
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    openRoles()
  }

  if (screen === 'USER') return <MemberShop onExit={leaveShop} />

  if (screen === 'SELLER') {
    return <SellerWorkspace onBack={openLogin} />
  }

  if (screen === 'ADMIN') {
    return <AdminWorkspace onBack={openLogin} />
  }

  let page
  switch (screen) {
    case 'login':
      page = <LoginPage onSignup={() => setScreen('signup')} onComplete={openRoles} />
      break
    case 'signup':
      page = <SignupPage onLogin={openLogin} onComplete={openRoles} />
      break
    case 'roles':
      page = <RoleSelectionPage onBack={openLogin} onContinue={enterRole} />
      break
    default:
      page = <RoleHomePage role={screen} onBack={openRoles} />
  }
  return <AccountLayout>{page}</AccountLayout>
}
