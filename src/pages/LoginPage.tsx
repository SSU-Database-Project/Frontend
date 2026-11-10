import AccountForm from '../components/AccountForm'
import PageHeading from '../components/PageHeading'

type LoginPageProps = {
  onSignup: () => void
  onComplete: () => void
}

export default function LoginPage({ onSignup, onComplete }: LoginPageProps) {
  return (
    <>
      <PageHeading title="로그인" description="지금은 입력 없이 로그인하고 역할을 선택할 수 있어요." />
      <AccountForm mode="login" onSwitch={onSignup} onComplete={onComplete} />
    </>
  )
}
