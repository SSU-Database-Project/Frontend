import type { AuthUser } from '../../types/auth'
import MemberWithdrawal from './MemberWithdrawal'
import MemberPasswordChange from './MemberPasswordChange'

export default function MemberAccountInfo({ user, onWithdrawn, onPasswordChanged }: {
  user: AuthUser; onWithdrawn: () => void; onPasswordChanged: () => void
}) {
  return <section className="member-account-info" aria-labelledby="member-account-title">
    <div className="member-account-heading">
      <h2 id="member-account-title">계정 정보</h2>
      <div className="member-account-controls">
        <MemberPasswordChange onChanged={onPasswordChanged} />
        <MemberWithdrawal onWithdrawn={onWithdrawn} />
      </div>
    </div>
    <dl className="member-account-details">
      <div><dt>이름</dt><dd>{user.name}</dd></div>
      <div><dt>이메일</dt><dd>{user.email}</dd></div>
      <div><dt>가입 유형</dt><dd>일반회원</dd></div>
    </dl>
  </section>
}
