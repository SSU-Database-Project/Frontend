import { useState, type FormEvent } from 'react'
import Icon from './Icon'
import './AccountForm.css'

export default function AccountForm({ mode, onSwitch, onComplete }: {
  mode: 'login' | 'signup'
  onSwitch: () => void
  onComplete: () => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const signup = mode === 'signup'
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onComplete()
  }

  return (
    <>
      <form className="account-form" onSubmit={submit} noValidate={!signup}>
        {signup && <div className="field">
          <label htmlFor="name">이름</label>
          <input id="name" autoComplete="name" placeholder="이름을 입력하세요" required maxLength={50} />
        </div>}
        <div className="field">
          <label htmlFor="email">이메일</label>
          <input id="email" type="email" autoComplete={signup ? 'email' : 'username'} placeholder="name@example.com" required={signup} />
        </div>
        <div className="field">
          <label htmlFor="password">비밀번호</label>
          <div className="password-input">
            <input id="password" type={showPassword ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} placeholder={signup ? '8자 이상 입력하세요' : '비밀번호를 입력하세요'} required={signup} minLength={signup ? 8 : undefined} />
            <button type="button" className="visibility-toggle" aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'} onClick={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? 'eyeOff' : 'eye'} />
            </button>
          </div>
        </div>
        <button className="primary-button" type="submit">{signup ? '회원가입' : '로그인'}<Icon name="arrow" /></button>
      </form>
      <div className="account-switch">
        <span>{signup ? '이미 계정이 있으신가요?' : '아직 계정이 없으신가요?'}</span>
        <button type="button" onClick={onSwitch}>{signup ? '로그인' : '회원가입'}</button>
      </div>
    </>
  )
}
