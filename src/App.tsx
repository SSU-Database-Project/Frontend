import { useState } from 'react'
import AccountLayout from './components/AccountLayout'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import RoleSelectionPage from './pages/RoleSelectionPage'
import RoleHomePage from './pages/RoleHomePage'
import SellerWorkspace from './pages/seller/SellerWorkspace'
import AdminWorkspace from './pages/admin/AdminWorkspace'
import type { Role } from './types/role'

type Screen = 'login' | 'signup' | 'roles' | Role

export default function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const openLogin = () => setScreen('login')
  const openRoles = () => setScreen('roles')

  if (screen === 'SELLER') {
    return <SellerWorkspace onBack={openRoles} />
  }

  if (screen === 'ADMIN') {
    return <AdminWorkspace onBack={openRoles} />
  }

  function renderPage() {
    switch (screen) {
      case 'login':
        return <LoginPage onSignup={() => setScreen('signup')} onComplete={openRoles} />
      case 'signup':
        return <SignupPage onLogin={openLogin} onComplete={openRoles} />
      case 'roles':
        return <RoleSelectionPage onBack={openLogin} onContinue={setScreen} />
      default:
        return <RoleHomePage role={screen} onBack={openRoles} />
    }
  }

  return <AccountLayout>{renderPage()}</AccountLayout>
}
