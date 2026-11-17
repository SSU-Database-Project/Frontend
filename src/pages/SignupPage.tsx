import AccountForm from '../components/AccountForm'
import PageHeading from '../components/PageHeading'

export default function SignupPage({ onLogin, onRegistered }: {
  onLogin: () => void
  onRegistered: (email: string) => void
}) {
  return <>
    <PageHeading title="회원가입" description="가입 유형을 선택하고 계정 정보를 입력해 주세요." />
    <AccountForm mode="signup" onSwitch={onLogin} onRegistered={onRegistered} />
  </>
}
