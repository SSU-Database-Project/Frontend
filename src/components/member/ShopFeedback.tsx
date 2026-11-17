import type { Page } from '../../types/member'
import { API_BASE_URL, IS_MOCK_MODE } from '../../services/api'
import { useState } from 'react'

export function ProductImage({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState<string | null>(null)
  const url = src && !IS_MOCK_MODE && src.startsWith('/') && !src.startsWith('//')
    ? API_BASE_URL.replace(/\/$/, '') + src : src
  if (!url || failed === url) return <span className={'image-placeholder ' + (className ?? '')} role="img" aria-label={alt + ' 이미지 없음'}>이미지 준비 중</span>
  return <img className={className} src={url} alt={alt} loading="lazy" onError={() => setFailed(url)} />
}

export function LoadStatus({ error, retry }: { error?: string; retry: () => void }) {
  return error ? <div className="shop-empty" role="alert">{error} <button type="button" className="text-button" onClick={retry}>다시 시도</button></div>
    : <p className="shop-empty" role="status">불러오는 중…</p>
}

export function PageNav<T>({ result, onChange }: { result: Page<T>; onChange: (page: number) => void }) {
  if (result.totalPages < 2 && result.page === 0) return null
  return <nav className="shop-pages" aria-label="페이지 이동">
    <button disabled={result.page === 0} onClick={() => onChange(result.page - 1)}>이전</button>
    <span>{result.page + 1} / {Math.max(1, result.totalPages)}</span>
    <button disabled={result.page + 1 >= result.totalPages} onClick={() => onChange(result.page + 1)}>다음</button>
  </nav>
}
