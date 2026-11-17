export const AUTH_TOKEN_KEY = 'seam_access_token'
export const SESSION_EXPIRED = 'seam:session-expired'
export const IS_MOCK_MODE: boolean =
  import.meta.env.VITE_USE_MOCK === 'true'

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

type ApiEnvelope<T> = {
  success?: boolean
  data?: T
  error?: { code?: string; message?: string } | null
}

export async function requestData<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = endpoint.startsWith('/api/auth/') ? null : localStorage.getItem(AUTH_TOKEN_KEY)
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL.replace(/\/$/, '')}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers,
  })

  let payload: ApiEnvelope<T> | null = null
  const text = await response.text()
  if (text) {
    try {
      payload = JSON.parse(text) as ApiEnvelope<T>
    } catch {
      payload = null
    }
  }

  if (response.status === 401 && token && token === localStorage.getItem(AUTH_TOKEN_KEY)) {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    window.dispatchEvent(new Event(SESSION_EXPIRED))
  }

  if (!response.ok || payload?.success === false) {
    const errorMessage =
      payload?.error?.message ??
      `백엔드 API 요청 실패 (${response.status} ${response.statusText})`
    throw new Error(errorMessage)
  }

  if (payload && 'data' in payload && payload.data !== undefined) {
    return payload.data
  }

  return (payload as unknown as T) ?? (undefined as unknown as T)
}

// Existing workspace screens consume arrays. Member lists also need the server's page metadata.
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const data = await requestData<T | { content: T }>(endpoint, options)
  if (data && typeof data === 'object' && 'content' in data && Array.isArray(data.content)) return data.content
  return data as T
}
