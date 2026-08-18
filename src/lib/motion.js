import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

const prefersReduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const useReducedMotion = () => {
  const [reduced, setReduced] = useState(prefersReduced)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

export const initLenis = (reduced) => {
  if (reduced) {
    window.__lenis = null
    return () => {}
  }
  const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 })
  window.__lenis = lenis
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  return () => {
    gsap.ticker.remove((time) => lenis.raf(time * 1000))
    lenis.destroy()
    window.__lenis = null
  }
}

const VARIANTS = {
  fadeUp: { opacity: 0, y: 32 },
  mask: { clipPath: 'inset(0 0 100% 0)' },
  scaleIn: { opacity: 0, scale: 0.97 },
  wipe: { clipPath: 'inset(0 100% 0 0)' },
}

export const useReveal = ({ variant = 'fadeUp', delay = 0 } = {}) => {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced) return
    const from = VARIANTS[variant]
    const to = {
      opacity: 1,
      y: 0,
      scale: 1,
      clipPath:
        variant === 'wipe'
          ? 'inset(0 0% 0 0)'
          : variant === 'mask'
            ? 'inset(0 0 0% 0)'
            : 'none',
    }
    gsap.fromTo(el, from, {
      ...to,
      duration: 1,
      ease: 'power3.out',
      delay,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    })
  }, [variant, delay, reduced])

  return ref
}
