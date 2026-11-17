import AccountForm from '../components/AccountForm'
import PageHeading from '../components/PageHeading'
import { IS_MOCK_MODE } from '../services/api'
import type { AuthUser } from '../types/auth'

type LoginPageProps = {
  onSignup: () => void
  onAuthenticated: (user: AuthUser) => void
  initialEmail?: string
  message?: string
}

export default function LoginPage({ onSignup, onAuthenticated, initialEmail, message }: LoginPageProps) {
  return <>
    <PageHeading title="로그인" description="가입한 이메일과 비밀번호를 입력해 주세요." />
    {IS_MOCK_MODE && <p className="auth-notice">시연 계정은 minji.kim@example.com, seller@seam.kr, admin@seam.kr이며 비밀번호는 demo1234!입니다.</p>}
    {message && <p className="auth-notice" role="status">{message}</p>}
    <AccountForm mode="login" onSwitch={onSignup} onAuthenticated={onAuthenticated} initialEmail={initialEmail} />
  </>
}
