import { useEffect, useRef, useState, type FormEvent } from 'react'
import { changeAccountPassword } from '../../services/mockStore'
import './MemberPasswordChange.css'

export default function MemberPasswordChange({ onChanged }: { onChanged: () => void }) {
  const [open, setOpen] = useState(false)
  return <>
    <button className="member-password-link" type="button" onClick={() => setOpen(true)}>비밀번호 변경</button>
    {open && <PasswordDialog onClose={() => setOpen(false)} onChanged={onChanged} />}
  </>
}

function PasswordDialog({ onClose, onChanged }: { onClose: () => void; onChanged: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const currentInput = useRef<HTMLInputElement>(null)
  const feedback = useRef<HTMLParagraphElement>(null)
  const locked = useRef(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const element = dialog.current!
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    element.showModal()
    currentInput.current?.focus()
    return () => {
      element.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    if (error) feedback.current?.focus()
  }, [error])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (locked.current) return
    setError('')
    if (!currentPassword.trim()) {
      setError('현재 비밀번호를 입력해 주세요.')
      return
    }
    if (!newPassword.trim() || newPassword.length < 8 || newPassword.length > 64) {
      setError('새 비밀번호는 8~64자로 입력해 주세요.')
      return
    }
    if (newPassword !== confirmation) {
      setError('새 비밀번호와 확인 값이 일치하지 않습니다.')
      return
    }
    locked.current = true
    setBusy(true)
    try {
      await changeAccountPassword({ currentPassword, newPassword })
      onChanged()
    } catch (cause) {
      setError(cause instanceof Error && !(cause instanceof TypeError)
        ? cause.message : '변경 결과를 확인하지 못했습니다. 연결 상태를 확인하고, 다시 로그인할 때 새 비밀번호도 확인해 주세요.')
    } finally {
      locked.current = false
      setBusy(false)
    }
  }

  return <dialog ref={dialog} className="member-password-dialog" aria-labelledby="member-password-title"
    aria-describedby="member-password-description" onCancel={event => {
      if (locked.current) event.preventDefault()
      else onClose()
    }}>
    <h2 id="member-password-title">비밀번호 변경</h2>
    <p id="member-password-description">변경하면 로그아웃됩니다. 새 비밀번호로 다시 로그인해 주세요.</p>
    <form onSubmit={submit} aria-busy={busy}>
      <fieldset disabled={busy} className="member-password-fields">
        <label htmlFor="member-current-password">현재 비밀번호
          <input ref={currentInput} id="member-current-password" name="currentPassword" type="password"
            autoComplete="current-password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} required />
        </label>
        <label htmlFor="member-new-password">새 비밀번호
          <input id="member-new-password" name="newPassword" type="password" autoComplete="new-password"
            minLength={8} maxLength={64} placeholder="8~64자 입력" value={newPassword}
            onChange={event => setNewPassword(event.target.value)} required />
        </label>
        <label htmlFor="member-confirm-password">새 비밀번호 확인
          <input id="member-confirm-password" name="confirmPassword" type="password" autoComplete="new-password"
            minLength={8} maxLength={64} value={confirmation} onChange={event => setConfirmation(event.target.value)} required />
        </label>
      </fieldset>
      {error && <p ref={feedback} className="shop-error" role="alert" tabIndex={-1}>{error}</p>}
      <div className="member-password-actions">
        <button type="button" onClick={onClose} disabled={busy}>취소</button>
        <button className="primary-button" type="submit" disabled={busy}>{busy ? '변경 중…' : '비밀번호 변경'}</button>
      </div>
    </form>
  </dialog>
}
