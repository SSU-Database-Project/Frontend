import Icon from '../components/Icon'
import PageHeading from '../components/PageHeading'
import type { Role } from '../types/role'

const rolePages = {
  ADMIN: { title: '관리자 콘솔', description: '관리자 페이지를 준비하고 있어요.' },
  USER: { title: '일반회원 홈', description: '쇼핑 페이지를 준비하고 있어요.' },
  SELLER: { title: '판매자 센터', description: '판매자 페이지를 준비하고 있어요.' },
}

export default function RoleHomePage({ role, onBack }: { role: Role; onBack: () => void }) {
  const { title, description } = rolePages[role]
  return (
    <>
      <PageHeading title={title} description={description} />
      <button className="back-link" type="button" onClick={onBack}><Icon name="back" />역할 다시 선택</button>
    </>
  )
}
