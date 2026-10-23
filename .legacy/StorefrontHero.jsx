import { useLayoutEffect, useRef } from 'react'
import { gsap, useReducedMotion } from '../lib/motion'
import './storefront.css'

export default function StorefrontHero() {
  const heroRef = useRef(null)
  const imageRef = useRef(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    if (reduced) return
    let disposed = false
    let entrance
    const context = gsap.context(() => {
      entrance = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
        .from('.store-campaign', { y: 40, opacity: 0, scale: 1.08, duration: 1.35 }, 0)
        .from('.store-hero-title > span', { y: 14, opacity: 0, stagger: 0.1, duration: 0.85 }, 0.08)
        .from('.store-hero-description', { y: 10, opacity: 0, duration: 0.9 }, 0.2)
        .from('.store-hero-wordmark', { yPercent: 65, scale: 1.16, transformOrigin: 'center bottom', opacity: 0, duration: 1.65 }, 0.22)
        .from('.store-hero-link', { y: 10, opacity: 0, duration: 0.85 }, 0.4)
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
        .to('.store-campaign-image', { y: () => -heroRef.current.clientHeight * 0.24 }, 0)
        .to('.store-hero-wordmark > span', { y: () => -heroRef.current.clientHeight * 0.05 }, 0)
        .to('.store-hero-title', { y: () => -heroRef.current.clientHeight * 0.035 }, 0)
    }, heroRef)
    imageRef.current.decode().catch(() => {}).then(() => {
      if (!disposed) entrance.play()
    })
    return () => {
      disposed = true
      context.revert()
    }
  }, [reduced])

  return (
    <section ref={heroRef} id="top" className="store-hero" aria-labelledby="store-hero-title">
      <h1 id="store-hero-title" className="store-hero-title">
        <span>Rangvanat New</span>
        <span>Collections</span>
        <span>2026©</span>
      </h1>
      <p className="store-hero-description tracking-tight">Khadi art from the heart of Bardoli. Indian stories, woven into everyday wear.</p>
      <a className="store-text-link store-hero-link" href="/?page=collections">Explore Collections <span aria-hidden="true">↗</span></a>
      <div className="store-hero-wordmark" aria-hidden="true"><span style={{ display: 'block' }}>RANGVANAT</span></div>
      <div className="store-campaign">
        <img ref={imageRef} className="store-campaign-image" src="/images/rangvanat-campaign-cutout.png" alt="Editorial campaign featuring contemporary Indian khadi silhouettes in ivory, beige and espresso." fetchPriority="high" decoding="async" />
      </div>
    </section>
  )
}
