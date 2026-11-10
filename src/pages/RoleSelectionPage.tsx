import { useState } from 'react'
import Icon from '../components/Icon'
import PageHeading from '../components/PageHeading'
import type { Role } from '../types/role'
import './RoleSelectionPage.css'

const roles: { id: Role; name: string; details: string }[] = [
  { id: 'ADMIN', name: '관리자', details: '회원 관리와 브랜드·상품 승인' },
  { id: 'USER', name: '일반회원', details: '상품 쇼핑과 주문 내역 확인' },
  { id: 'SELLER', name: '판매자', details: '브랜드·상품 관리와 배송 처리' },
]

export default function RoleSelectionPage({ onBack, onContinue }: { onBack: () => void; onContinue: (role: Role) => void }) {
  const [selected, setSelected] = useState<Role | null>(null)
  return (
    <>
      <PageHeading title="역할 선택" description="이용할 역할을 선택해 주세요." />
      <div className="role-list" role="group" aria-label="이용할 역할">
        {roles.map(role => (
          <button className="role-option" key={role.id} type="button" aria-pressed={selected === role.id} onClick={() => setSelected(role.id)}>
            <span className="role-icon"><Icon name={role.id} /></span>
            <span className="role-copy"><strong>{role.name}</strong><small>{role.details}</small></span>
            <span className="selection-dot">{selected === role.id && <Icon name="check" />}</span>
          </button>
        ))}
      </div>
      <div className="role-actions">
        <button className="back-link" type="button" onClick={onBack}><Icon name="back" />로그인으로 돌아가기</button>
        <button className="primary-button" type="button" disabled={!selected} onClick={() => selected && onContinue(selected)}>
          다음<Icon name="arrow" />
        </button>
      </div>
    </>
  )
}
