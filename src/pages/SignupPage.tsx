import AccountForm from '../components/AccountForm'
import PageHeading from '../components/PageHeading'

type SignupPageProps = {
  onLogin: () => void
  onComplete: () => void
}

export default function SignupPage({ onLogin, onComplete }: SignupPageProps) {
  return (
    <>
      <PageHeading title="회원가입" description="가입 정보를 입력하면 역할 선택으로 이어져요." />
      <AccountForm mode="signup" onSwitch={onLogin} onComplete={onComplete} />
    </>
  )
}
