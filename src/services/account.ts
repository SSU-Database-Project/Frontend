import type { WithdrawalCheck } from '../types/auth'
import { IS_MOCK_MODE, requestData } from './api'

const withdrawalEndpoint = '/api/users/me/withdrawal'

export async function checkWithdrawal(signal?: AbortSignal): Promise<WithdrawalCheck> {
  if (IS_MOCK_MODE) {
    return { canWithdraw: false, inProgressOrderCount: 0, message: '시연 계정은 탈퇴할 수 없습니다.' }
  }
  const result = await requestData<WithdrawalCheck>(withdrawalEndpoint, { signal })
  if (!result || typeof result.canWithdraw !== 'boolean' || typeof result.message !== 'string' ||
      !result.message.trim() || !Number.isInteger(result.inProgressOrderCount) || result.inProgressOrderCount < 0) {
    throw new Error('탈퇴 정보를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.')
  }
  return result
}

export async function withdrawAccount(password: string): Promise<void> {
  if (IS_MOCK_MODE) throw new Error('시연 계정은 탈퇴할 수 없습니다.')
  await requestData<void>(withdrawalEndpoint, {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
}
