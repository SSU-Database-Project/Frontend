import { useCallback, useEffect, useRef, useState } from 'react'

export function errorText(error: unknown) {
  return error instanceof Error && !(error instanceof TypeError) ? error.message : '서버에 연결할 수 없습니다. 다시 시도해 주세요.'
}

// Ignore responses for a previous page, account, or request superseded by a mutation.
export function useMemberRequest<T>(load: () => Promise<T>) {
  const [state, setState] = useState<{ load: typeof load; data?: T; error?: string }>({ load })
  const version = useRef(0)
  const invalidate = useCallback(() => { version.current++ }, [])
  const fetchLatest = useCallback(() => {
    const request = ++version.current
    return load().then(data => {
      if (version.current === request) setState({ load, data })
    }).catch(error => {
      if (version.current === request) setState({ load, error: errorText(error) })
    })
  }, [load])
  useEffect(() => {
    void fetchLatest()
    return invalidate
  }, [fetchLatest, invalidate])
  const refresh = useCallback(() => {
    setState(previous => ({ load, data: previous.load === load ? previous.data : undefined }))
    return fetchLatest()
  }, [fetchLatest, load])
  function replace(data: T) {
    version.current++
    setState({ load, data })
  }
  return { ...(state.load === load ? state : {}), refresh, replace }
}

export function useMemberAction() {
  const locked = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function run(action: () => Promise<void>) {
    if (locked.current) return
    locked.current = true
    setBusy(true)
    setError('')
    try { await action() } catch (cause) { setError(errorText(cause)) }
    finally { locked.current = false; setBusy(false) }
  }
  return { busy, error, run }
}
