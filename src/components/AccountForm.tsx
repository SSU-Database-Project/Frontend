import { useState, type FormEvent } from 'react'
import { login, signup } from '../services/auth'
import type { AuthUser } from '../types/auth'
import Icon from './Icon'
import './AccountForm.css'

type FormProps = { onSwitch: () => void } & (
  | { mode: 'login'; initialEmail?: string; onAuthenticated: (user: AuthUser) => void }
  | { mode: 'signup'; onRegistered: (email: string) => void }
)

export default function AccountForm(props: FormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [seller, setSeller] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const registering = props.mode === 'signup'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const fields = new FormData(event.currentTarget)
    const value = (key: string) => String(fields.get(key) ?? '').trim()
    const email = value('email')
    const password = String(fields.get('password') ?? '')
    setError('')
    setPending(true)
    try {
      if (props.mode === 'login') {
        props.onAuthenticated(await login(email, password))
      } else {
        const account = { name: value('name'), email, password }
        await signup(seller ? { ...account, role: 'SELLER', seller: {
          companyName: value('companyName'), representativeName: value('representativeName'),
          businessNumber: value('businessNumber').replaceAll('-', ''),
        } } : { ...account, role: 'USER' })
        props.onRegistered(email)
      }
    } catch (cause) {
      setError(cause instanceof Error && !(cause instanceof TypeError) ? cause.message : '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setPending(false)
    }
  }

  return <>
    <form className="account-form" onSubmit={submit} aria-busy={pending}>
      {registering && <>
        <div className="field">
          <label htmlFor="signup-type">가입 유형</label>
          <select id="signup-type" value={seller ? 'SELLER' : 'USER'} disabled={pending} onChange={e => setSeller(e.target.value === 'SELLER')}>
            <option value="USER">일반회원</option><option value="SELLER">판매자</option>
          </select>
        </div>
        <div className="field"><label htmlFor="name">이름</label>
          <input id="name" name="name" autoComplete="name" required maxLength={50} />
        </div>
        {seller && <>
          <div className="field"><label htmlFor="companyName">상호명</label>
            <input id="companyName" name="companyName" autoComplete="organization" required maxLength={100} /></div>
          <div className="field"><label htmlFor="businessNumber">사업자등록번호</label>
            <input id="businessNumber" name="businessNumber" placeholder="123-45-67890" inputMode="numeric"
              pattern="[0-9]{3}-?[0-9]{2}-?[0-9]{5}" title="사업자등록번호 10자리를 입력해 주세요." required maxLength={12} /></div>
          <div className="field"><label htmlFor="representativeName">대표자명</label>
            <input id="representativeName" name="representativeName" required maxLength={50} /></div>
        </>}
      </>}
      <div className="field"><label htmlFor="email">이메일</label>
        <input id="email" name="email" type="email" autoComplete={registering ? 'email' : 'username'}
          placeholder="name@example.com" defaultValue={props.mode === 'login' ? props.initialEmail : ''} maxLength={100} required />
      </div>
      <div className="field"><label htmlFor="password">비밀번호</label>
        <div className="password-input">
          <input id="password" name="password" type={showPassword ? 'text' : 'password'}
            autoComplete={registering ? 'new-password' : 'current-password'} placeholder={registering ? '8~64자 입력' : '비밀번호를 입력하세요'}
            required minLength={registering ? 8 : undefined} maxLength={registering ? 64 : undefined} />
          <button type="button" className="visibility-toggle" aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'} onClick={() => setShowPassword(!showPassword)}>
            <Icon name={showPassword ? 'eyeOff' : 'eye'} />
          </button>
        </div>
      </div>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="primary-button" type="submit" disabled={pending}>
        {pending ? '처리 중…' : registering ? '회원가입' : '로그인'}<Icon name="arrow" />
      </button>
    </form>
    <div className="account-switch">
      <span>{registering ? '이미 계정이 있으신가요?' : '아직 계정이 없으신가요?'}</span>
      <button type="button" onClick={props.onSwitch} disabled={pending}>{registering ? '로그인' : '회원가입'}</button>
    </div>
  </>
}
