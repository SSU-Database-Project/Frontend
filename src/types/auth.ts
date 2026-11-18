import type { SellerBusinessInfo } from './commerce'
import type { Role } from './role'

export type AuthUser = {
  id: number
  name: string
  email: string
  role: Role
}

export type WithdrawalCheck = {
  canWithdraw: boolean
  inProgressOrderCount: number
  message: string
}

export type SignupInput = {
  name: string
  email: string
  password: string
} & ({ role: 'USER' } | { role: 'SELLER'; seller: SellerBusinessInfo })
