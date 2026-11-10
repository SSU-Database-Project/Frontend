import type { ReactNode } from 'react'
import totePhoto from '../assets/seam-tote.webp'
import Icon from './Icon'
import './AccountLayout.css'

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="wordmark" aria-label="SEAM">SEAM<span className="brand-stitch" aria-hidden="true" /></div>
        <span className="member-label"><Icon name="lock" />회원 전용</span>
      </header>
      <main className="account-layout">
        <figure className="editorial">
          <div className="photo-frame"><img src={totePhoto} alt="크롬 의자에 놓인 코발트 블루 캔버스 토트백" fetchPriority="high" /></div>
          <figcaption><span className="item-name">캔버스 토트백</span><span className="item-color"><i aria-hidden="true" />코발트 블루</span></figcaption>
        </figure>
        <section className="account-panel" aria-labelledby="screen-title">
          <div className="panel-inner">
            {children}
          </div>
        </section>
      </main>
    </div>
  )
}
