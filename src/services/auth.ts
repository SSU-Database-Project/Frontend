import type { AuthUser, SignupInput } from '../types/auth'
import { apiRequest, AUTH_TOKEN_KEY, IS_MOCK_MODE } from './api'
import { getMockSessionUser, loginMockUser, MOCK_SESSION_KEY, signupMockUser } from './mockStore'

function validatedUser(user: AuthUser | null | undefined): AuthUser {
  if (!user || !Number.isInteger(user.id) || typeof user.email !== 'string' ||
      typeof user.name !== 'string' || !['USER', 'SELLER', 'ADMIN'].includes(user.role)) {
    throw new Error('계정 정보를 확인할 수 없습니다. 다시 로그인해 주세요.')
  }
  return user
}

export async function login(email: string, password: string): Promise<AuthUser> {
  if (IS_MOCK_MODE) return loginMockUser(email, password)
  const data = await apiRequest<{ accessToken: string; user: AuthUser }>('/api/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password }),
  })
  const user = validatedUser(data?.user)
  if (typeof data.accessToken !== 'string' || !data.accessToken.trim()) {
    throw new Error('로그인 정보를 받지 못했습니다. 다시 시도해 주세요.')
  }
  localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken)
  return user
}

export async function signup(input: SignupInput) {
  if (IS_MOCK_MODE) return signupMockUser(input)
  const data = await apiRequest<Pick<AuthUser, 'id' | 'email' | 'role'>>('/api/auth/signup', {
    method: 'POST', body: JSON.stringify(input),
  })
  if (!Number.isInteger(data?.id) || data.role !== input.role) throw new Error('가입 결과를 확인할 수 없습니다.')
}

export function hasSession() {
  return IS_MOCK_MODE ? !!sessionStorage.getItem(MOCK_SESSION_KEY) : !!localStorage.getItem(AUTH_TOKEN_KEY)
}

export async function restoreSession() {
  if (IS_MOCK_MODE) return validatedUser(getMockSessionUser())
  return validatedUser(await apiRequest<AuthUser>('/api/users/me'))
}

export function logout() {
  if (IS_MOCK_MODE) sessionStorage.removeItem(MOCK_SESSION_KEY)
  else localStorage.removeItem(AUTH_TOKEN_KEY)
}
