import { useEffect, useRef } from 'react'

export default function PageHeading({ title, description }: { title: string; description: string }) {
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const pageTitle = title + ' | SEAM'
    if (document.title !== pageTitle) {
      document.title = pageTitle
      heading.current?.focus()
    }
  }, [title])

  return (
    <>
      <h1 id="screen-title" ref={heading} tabIndex={-1}>{title}</h1>
      <p className="intro">{description}</p>
    </>
  )
}
