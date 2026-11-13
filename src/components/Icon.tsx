import type { ReactNode } from 'react'
import type { Role } from '../types/role'

type IconName = 'arrow' | 'back' | 'eye' | 'eyeOff' | 'lock' | 'check' | 'search' | 'heart' | 'bag' | 'home' | Role

export default function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    search: <><circle cx="10.5" cy="10.5" r="6.8" /><path d="m16 16 5 5" /></>,
    heart: <path d="M20.5 4.8a5.5 5.5 0 0 0-8.5 1.4 5.5 5.5 0 0 0-8.5-1.4C.2 8.2 2 12.4 4.7 15.1L12 22l7.3-6.9c2.7-2.7 4.5-6.9 1.2-10.3Z" />,
    bag: <><path d="M4 7h16l1 14H3L4 7Z" /><path d="M8.5 9V6a3.5 3.5 0 0 1 7 0v3" /></>,
    home: <><path d="m2 11 10-8 10 8M5 10v11h5.2v-6h3.6v6H19V10" /></>,
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    back: <path d="M20 12H5m6 6-6-6 6-6" />,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    eyeOff: <><path d="m3 3 18 18M10 5.2c6-1.3 10.5 4.5 12 6.8a21 21 0 0 1-3.5 4.2M6 6.8A21 21 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 4-.8" /></>,
    lock: <><rect x="5.5" y="10" width="13" height="11" rx="2" /><path d="M8.5 10V7a3.5 3.5 0 0 1 7 0v3m-3.5 5v2" /></>,
    check: <path d="m5 12 4.5 4.5L19 7" />,
    ADMIN: <><path d="m12 2 8 3v6c0 5-3.6 8.6-8 11-4.4-2.4-8-6-8-11V5l8-3Z" /><path d="m8.5 11.5 2.3 2.3 4.7-4.7" /></>,
    USER: <><circle cx="12" cy="8" r="3.6" /><path d="M4.5 21v-2a7.5 7.5 0 0 1 15 0v2" /></>,
    SELLER: <><path d="M4 11v9h16v-9M3 8l2-5h14l2 5v1a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V8Zm6 12v-6h6v6" /></>,
  }
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
