import { useEffect, useRef, useState, type FormEvent } from 'react'
import { checkWithdrawal, withdrawAccount } from '../../services/account'
import type { WithdrawalCheck } from '../../types/auth'

function errorMessage(error: unknown) {
  return error instanceof Error && !(error instanceof TypeError)
    ? error.message : '서버에 연결할 수 없습니다. 다시 시도해 주세요.'
}

export default function MemberWithdrawal({ onWithdrawn }: { onWithdrawn: () => void }) {
  const [open, setOpen] = useState(false)
  return <div className="member-account-actions">
    <button className="member-withdrawal-link" type="button" onClick={() => setOpen(true)}>회원 탈퇴</button>
    {open && <WithdrawalDialog onClose={() => setOpen(false)} onWithdrawn={onWithdrawn} />}
  </div>
}

function WithdrawalDialog({ onClose, onWithdrawn }: { onClose: () => void; onWithdrawn: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const passwordInput = useRef<HTMLInputElement>(null)
  const pending = useRef(false)
  const [check, setCheck] = useState<WithdrawalCheck | null>(null)
  const [checkError, setCheckError] = useState('')
  const [retry, setRetry] = useState(0)
  const [password, setPassword] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const element = dialog.current!
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    element.showModal()
    return () => {
      element.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    checkWithdrawal(controller.signal).then(result => {
      if (!controller.signal.aborted) setCheck(result)
    }).catch(error => {
      if (!controller.signal.aborted) setCheckError(errorMessage(error))
    })
    return () => controller.abort()
  }, [retry])

  useEffect(() => {
    if (check?.canWithdraw) passwordInput.current?.focus()
  }, [check])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current || !check?.canWithdraw || !password) return
    pending.current = true
    setSubmitting(true)
    setSubmitError('')
    try {
      await withdrawAccount(password)
      onWithdrawn()
    } catch (error) {
      setSubmitError(errorMessage(error))
    } finally {
      pending.current = false
      setSubmitting(false)
    }
  }

  return <dialog ref={dialog} className="member-withdrawal-dialog" aria-labelledby="withdrawal-title"
    aria-describedby="withdrawal-message" onCancel={event => {
      if (pending.current) event.preventDefault()
      else onClose()
    }}>
    <h2 id="withdrawal-title">회원 탈퇴</h2>
    <p id="withdrawal-message" role="status">{check?.message ?? (checkError ? '탈퇴 정보를 확인하지 못했습니다.' : '탈퇴 가능 여부를 확인하고 있습니다.')}</p>
    {checkError && <p className="shop-error" role="alert">{checkError}</p>}
    <form onSubmit={submit} aria-busy={submitting}>
      {check?.canWithdraw && <label className="withdrawal-password" htmlFor="withdrawal-password">
        본인 확인을 위해 비밀번호를 입력해 주세요.
        <input ref={passwordInput} id="withdrawal-password" name="password" type="password" autoComplete="current-password"
          value={password} onChange={event => setPassword(event.target.value)} required disabled={submitting} />
      </label>}
      {submitError && <p className="shop-error" role="alert">{submitError}</p>}
      <div className="withdrawal-actions">
        <button className="withdrawal-cancel" type="button" onClick={onClose} disabled={submitting}>{check?.canWithdraw ? '취소' : '닫기'}</button>
        {checkError && <button className="withdrawal-cancel" type="button" onClick={() => {
          setCheck(null)
          setCheckError('')
          setRetry(value => value + 1)
        }}>다시 시도</button>}
        {check?.canWithdraw && <button className="withdrawal-confirm" type="submit" disabled={submitting || !password}>
          {submitting ? '탈퇴 처리 중…' : '탈퇴하기'}
        </button>}
      </div>
    </form>
  </dialog>
}
