import { useEffect, useState } from 'react'

/**
 * Soft intro: a percentage counter that climbs to 100%,
 * then the porcelain veil dissolves to reveal the world.
 */
export default function Loader() {
  const [progress, setProgress] = useState(0)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const DURATION = 1700

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION)
      // ease-out so the counter sprints early and lands softly
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(Math.round(eased * 100))
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setTimeout(() => setGone(true), 650)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (gone) return null

  const done = progress >= 100

  return (
    <div className={`loader ${done ? 'loader--done' : ''}`} aria-hidden="true">
      <div className="loader__counter">
        {progress}
        <span>%</span>
      </div>
      <p className="loader__label">{done ? 'Your skin is listening' : 'Steeping the formula'}</p>
    </div>
  )
}
