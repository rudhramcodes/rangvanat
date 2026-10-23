import { useEffect, useRef } from 'react'
import { animate, createTimeline, stagger } from 'animejs'

const Charkha = () => (
  <svg viewBox="0 0 100 100" className="h-24 w-24 sm:h-28 sm:w-28" aria-hidden>
    <circle cx="50" cy="50" r="44" fill="none" stroke="#cfa158" strokeWidth="1.5" />
    <g data-spokes style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="50"
          x2="50"
          y2="10"
          stroke="#e9d9ae"
          strokeWidth="1"
          transform={`rotate(${i * 45} 50 50)`}
        />
      ))}
    </g>
    <circle cx="50" cy="50" r="3.5" fill="#e9d9ae" />
  </svg>
)

const BRAND = 'RANGVANAT'

const Preloader = ({ isLoading, onDone }) => {
  const overlayRef = useRef(null)
  const wheelRef = useRef(null)
  const brandRef = useRef(null)
  const idleSpin = useRef(null)
  const mountedAt = useRef(0)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    mountedAt.current = performance.now()
    const spokes = wheelRef.current.querySelector('[data-spokes]')
    const letters = brandRef.current.querySelectorAll('span')
    if (reduced) {
      animate(letters, { opacity: [0, 1], duration: 400, ease: 'outQuad' })
      return undefined
    }
    idleSpin.current = animate(spokes, {
      rotate: 360,
      duration: 3200,
      ease: 'linear',
      loop: true,
    })
    animate(letters, {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 550,
      ease: 'outQuad',
      delay: stagger(50, { start: 300 }),
    })
    return () => idleSpin.current?.pause()
  }, [reduced])

  useEffect(() => {
    if (isLoading) return undefined
    const overlay = overlayRef.current
    // Hold the loader until the brand reveal has fully played out (~1.25s) plus a reading beat.
    const elapsed = performance.now() - mountedAt.current
    const wait = Math.max(0, (reduced ? 600 : 1700) - elapsed)
    let tl
    const timer = setTimeout(() => {
      if (reduced) {
        tl = createTimeline({ onComplete: onDone })
        tl.add(overlay, { opacity: 0, duration: 300, ease: 'outQuad' })
        return
      }
      idleSpin.current?.pause()
      const spokes = wheelRef.current.querySelector('[data-spokes]')
      tl = createTimeline({ onComplete: onDone })
      tl.add(spokes, { rotate: '+=540', duration: 850, ease: 'inQuad' })
        .add(brandRef.current, { opacity: 0, translateY: -10, duration: 260, ease: 'inQuad' }, '-=420')
        .add(wheelRef.current, { opacity: 0, scale: 0.9, duration: 240, ease: 'inQuad' }, '-=320')
        .add(overlay, { translateY: '-100%', duration: 1100, ease: 'outExpo' }, '-=140')
    }, wait)
    return () => {
      clearTimeout(timer)
      tl?.pause?.()
    }
  }, [isLoading, onDone, reduced])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-ivory"
    >
      <div className="preloader-grain" aria-hidden />
      <div ref={wheelRef}>
        <Charkha />
      </div>
      <p
        ref={brandRef}
        className="preloader-brand font-subhead text-[12px] font-semibold uppercase tracking-[0.5em] text-espresso"
      >
        {BRAND.split('').map((ch, i) => (
          <span key={i} className="inline-block opacity-0">
            {ch}
          </span>
        ))}
      </p>
    </div>
  )
}

export default Preloader
