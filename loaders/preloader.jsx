import { useEffect, useRef } from 'react'
import { createTimeline } from 'animejs'

const Charkha = () => (
  <svg viewBox="0 0 100 100" className="h-24 w-24 sm:h-28 sm:w-28" aria-hidden>
    <circle cx="50" cy="50" r="44" fill="none" stroke="#b8863a" strokeWidth="1.5" />
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

const Preloader = ({ onDone }) => {
  const overlayRef = useRef(null)
  const wheelRef = useRef(null)

  useEffect(() => {
    const tl = createTimeline({
      defaults: { ease: 'inOutCubic' },
      onComplete: onDone,
    })
    tl.add(wheelRef.current.querySelector('[data-spokes]'), { rotate: 360, duration: 1400 })
      .add('.preloader-brand', { opacity: [0, 1], translateY: [12, 0], duration: 500 }, '-=800')
      .add(overlayRef.current, { opacity: 0, duration: 700 }, '+=150')
    return () => tl.pause?.()
  }, [onDone])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-espresso grain"
    >
      <div ref={wheelRef}>
        <Charkha />
      </div>
      <p className="preloader-brand text-[11px] font-medium uppercase tracking-[0.5em] text-champagne opacity-0">
        RANGVANAT
      </p>
    </div>
  )
}

export default Preloader
