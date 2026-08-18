import { useEffect, useRef, useState } from 'react'
import {
  AtSign,
  Camera,
  Globe2,
  HandHeart,
  Leaf,
  Mail,
  Menu,
  Sparkles,
  X,
} from 'lucide-react'
import Preloader from './components/Preloader'
import { animate, stagger } from 'animejs'
import { gsap, ScrollTrigger, initLenis, useReducedMotion, useReveal } from './lib/motion'

const imagePaths = {
  hero: '/images/hero.png',
  heritageMain: '/images/heritage-main.jpg',
  heritageDetail: '/images/heritage-detail.jpg',
  process: '/images/3.webp',
  processSpinning: '/images/spinning.jpg',
  processDyeing: '/images/dyeing.jpg',
  processWeaving: '/images/3.webp',
  processFinishing: '/images/finishing.jpg',
  artisanOne: '/images/artisan1.jpg',
  artisanTwo: '/images/artisan2.jpg',
  collectionLarge: '/images/everyday-edit.jpg',
  collectionTop: '/images/statement-edit.jpg',
  collectionBottom: '/images/bridal-edit.jpg',
}

// Paste your hero video URL here (mp4/webm). Leave empty ("") to show the background only.
// const HERO_VIDEO_URL = 'https://www.pexels.com/download/video/3967195/'
const HERO_VIDEO_URL = 'https://res.cloudinary.com/dvsrgdyi7/video/upload/rangvanat-hero.mp4'

const navLinks = ['Story', 'Craft', 'Artisans', 'Collections', 'Contact']

const windowLoaded = () =>
  document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise((res) => window.addEventListener('load', res, { once: true }))

const assetAlt = (label) => label.replace(/\.[^.]+$/, '').replaceAll('-', ' ')

const Asset = ({ src, label, className = '', children, alt = assetAlt(label) }) => (
  <div
    className={`asset-frame ${className}`}
    style={{ '--asset': `url(${src})` }}
    role="img"
    aria-label={alt}
  >
    {children}
  </div>
)

const Eyebrow = ({ children }) => <p className="eyebrow">{children}</p>

const Cta = ({ children, href = '#collections', size = 'md', as, btnRef }) => {
  const chars = String(children)
    .split('')
    .map((ch, i) => (
      <span key={i} className="cta-char" style={{ '--i': i }}>
        {ch === ' ' ? '\u00A0' : ch}
      </span>
    ))
  const inner = (
    <>
      <span className="cta-sheen" aria-hidden="true" />
      <span className="cta-label">
        <span className="cta-text">{chars}</span>
        <span className="cta-text cta-text--ghost" aria-hidden="true">
          {chars}
        </span>
      </span>
    </>
  )
  if (as === 'button') {
    return (
      <button type="submit" className={`cta cta-${size}`} ref={btnRef}>
        {inner}
      </button>
    )
  }
  return (
    <a className={`cta cta-${size}`} href={href}>
      {inner}
    </a>
  )
}

const Header = ({ menuOpen, setMenuOpen }) => (
  <>
    <header className="site-header">
      <a className="logo-link" href="#top" aria-label="Rangvanat home">
        <img src="/images/logo-only.svg" alt="Rangvanat" />
      </a>

      <nav className="desktop-nav" aria-label="Primary navigation">
        {navLinks.map((link, index) => (
          <a key={link} href={`#${link.toLowerCase()}`}>
            <span className="nav-index">{String(index + 1).padStart(2, '0')}</span>
            {link}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <Cta href="#collections" size="sm">Explore</Cta>
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(true)}
          aria-controls="mobile-menu"
          aria-expanded={menuOpen}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>
    </header>

    <div
      id="mobile-menu"
      className={`mobile-menu ${menuOpen ? 'is-open' : ''}`}
      aria-hidden={!menuOpen}
    >
      <div className="mobile-menu-top">
        <img src="/images/logo-only.svg" alt="Rangvanat" />
        <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
          <X size={28} />
        </button>
      </div>
      <nav aria-label="Mobile navigation">
        {navLinks.map((link, index) => (
          <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMenuOpen(false)}>
            <span className="nav-index">{String(index + 1).padStart(2, '0')}</span>
            {link}
          </a>
        ))}
      </nav>
      <div className="mobile-menu-foot">
        <p>Bardoli · Gujarat · India</p>
        <Cta href="#contact" size="sm">
          Join the Journey
        </Cta>
      </div>
    </div>
  </>
)

const Hero = () => (
  <section id="top" className="hero grain">
    {HERO_VIDEO_URL && (
      <video
        className="hero-video"
        src={HERO_VIDEO_URL}
        poster={imagePaths.hero}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
    )}
    <div className="hero-content">
      <Eyebrow>Khadi Art by Rangvesh</Eyebrow>
      <h1>Every Thread Remembers.</h1>
      <p>Hand-spun khadi, patient colour, and stories made wearable.</p>
      <Cta href="#collections" size="lg">
        Discover Rangvanat
      </Cta>
    </div>
  </section>
)

const Story = () => (
  <section id="story" className="section story-section">
    <div>
      <Eyebrow>Before it was fashion</Eyebrow>
      <h2>It was freedom.</h2>
    </div>
    <p>
      Long before khadi was commodified, it was a covenant. Spun by hand, worn as resistance,
      passed down as pride. Rangvanat starts there. The same thread, the same patient hands, given
      a new stage to stand on. One that does not ask it to forget where it came from.
    </p>
  </section>
)

const Heritage = () => {
  const headRef = useReveal({ variant: 'mask', delay: 0 })
  const mediaRef = useReveal({ variant: 'scaleIn', delay: 0.1 })
  const copyRef = useReveal({ variant: 'fadeUp', delay: 0.2 })

  return (
    <section id="heritage" className="section heritage-section">
      <div className="heritage-body">
        <div className="heritage-text">
          <div className="heritage-head" ref={headRef}>
            <Eyebrow>Where we come from</Eyebrow>
            <h2>A legacy woven in Bardoli.</h2>
          </div>
          <div className="heritage-copy" ref={copyRef}>
            <p>
              Rangvanat comes from Bardoli, Sardar Patel's home ground. A length of hand-spun cloth
              was once the loudest thing a person could say here. We did not inherit khadi as a
              fabric. We inherited it as a vow to finish.
            </p>
            <Cta href="#craft">Read the Story</Cta>
          </div>
        </div>
        <div className="heritage-media" ref={mediaRef}>
          <Asset
            src={imagePaths.heritageMain}
            label="heritage-bardoli-charkha.jpg"
            className="framed-image"
            alt="Bardoli heritage charkha illustration"
          />
          <Asset
            src={imagePaths.heritageDetail}
            label="heritage-cotton-thread.jpg"
            className="heritage-detail"
            alt="Cotton thread texture detail"
          />
        </div>
      </div>
    </section>
  )
}

const FounderNote = () => (
  <section id="founder" className="quote-section">
    <div className="founder-panel">
      <div className="founder-arch">
        <Asset
          src="/images/founder-rachana-kapadia.jpg"
          label="founder-rachana-kapadia.jpg"
          alt="Rachana Kapadia portrait"
        />
      </div>
    </div>
    <div className="founder-quote">
      <p className="founder-eyebrow">From the Founder</p>
      <blockquote className="tracking-tight">
        "I did not want to just make clothes. I wanted to fold a piece of Bardoli's soil, a piece of my
        grandmother's stories, into every seam I send out into the world. Khadi taught me that slow is
        not a weakness. It is where the meaning actually lives."
      </blockquote>
      <div className="founder">
        <p>
          <strong>Rachana Kapadia</strong>
          <span>Designer, Founder & Managing Director</span>
        </p>
      </div>
      <Cta href="#craft">
        Begin with the Story
      </Cta>
    </div>
  </section>
)

const TIMELINE_ITEMS = [
  ['Bardoli', 'Charkha roots. The village where thread first became defiance.'],
  ['Gandhi & Swadeshi', 'Freedom in every fibre. When khadi became the uniform of a movement.'],
  ['Today / Rangvanat', 'Handwoven for now. The wheel still turns; the wardrobe changed.'],
]

const MarqueeRow = ({ ghost = false }) => {
  const items = [...TIMELINE_ITEMS, ...TIMELINE_ITEMS]
  return (
    <div className={`marquee-row${ghost ? ' marquee-row--ghost' : ''}`} aria-hidden={ghost}>
      <div className="marquee-track">
        {items.map(([title], index) => (
          <span className="marquee-item" key={`${title}-${index}`}>
            <span className="marquee-text">{title}</span>
            <span className="marquee-star" aria-hidden="true">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

const Timeline = () => {
  const sectionRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const section = sectionRef.current
    if (!section) return

    const tracks = gsap.utils.toArray('.marquee-track', section)
    const tween = gsap.fromTo(
      tracks,
      { xPercent: (index) => (index === 0 ? 0 : -50) },
      { xPercent: (index) => (index === 0 ? -50 : 0), ease: 'none', duration: 28, repeat: -1 }
    )

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const speed = gsap.utils.clamp(0.4, 2.5, 1 + Math.abs(self.getVelocity()) / 600)
        tween.timeScale(speed)
      },
    })

    const onEnter = () => tween.timeScale(0)
    const onLeave = () => tween.timeScale(1)
    section.addEventListener('mouseenter', onEnter)
    section.addEventListener('mouseleave', onLeave)

    return () => {
      st.kill()
      tween.kill()
      section.removeEventListener('mouseenter', onEnter)
      section.removeEventListener('mouseleave', onLeave)
    }
  }, [reduced])

  if (reduced) {
    return (
      <section id="timeline" className="timeline-strip timeline-strip--static" aria-label="Rangvanat heritage timeline">
        {TIMELINE_ITEMS.map(([title, body], index) => (
          <div className={index === 1 ? 'is-large' : ''} key={title}>
            <span>{title}</span>
            <p>{body}</p>
          </div>
        ))}
      </section>
    )
  }

  return (
    <section id="timeline" className="timeline-marquee" aria-label="Rangvanat heritage timeline" ref={sectionRef}>
      <MarqueeRow />
      <MarqueeRow ghost />
    </section>
  )
}

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Spinning',
    body: 'Cotton becomes thread under patient hands. The thread is not forced; it is coaxed.',
    src: imagePaths.processSpinning,
    label: 'process-spinning.jpg',
    alt: 'Artisan spinning cotton into thread',
  },
  {
    num: '02',
    title: 'Dyeing',
    body: 'Natural colour settles slowly into the fibre. It does not sit on the surface; it becomes one with it.',
    src: imagePaths.processDyeing,
    label: 'process-dyeing.jpg',
    alt: 'Fabric resting in a natural dye bath',
  },
  {
    num: '03',
    title: 'Weaving',
    body: 'The loom turns memory into fabric. Each throw of the shuttle is a decision.',
    src: imagePaths.processWeaving,
    label: 'process-weaving.jpg',
    alt: 'Artisan weaving khadi on a handloom',
  },
  {
    num: '04',
    title: 'Finishing',
    body: 'Every edge is checked before it leaves Bardoli. Not quality control. Craft pride.',
    src: imagePaths.processFinishing,
    label: 'process-finishing.jpg',
    alt: 'Folded khadi fabric finished by hand',
  },
]

const Craft = () => {
  const gridRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const cards = gridRef.current?.querySelectorAll('.process-card')
    if (!cards?.length) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: { trigger: gridRef.current, start: 'top 82%', once: true },
        },
      )
    }, gridRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section id="craft" className="section process-section">
      <div className="process-head">
        <Eyebrow>The process</Eyebrow>
        <h2>Spun slow. Woven with intention.</h2>
        <p>
          Every piece begins the way it did a hundred years ago. On a charkha, in the hands of
          someone who has spent a lifetime learning what the thread wants to become.
        </p>
      </div>
      <div className="process-grid" ref={gridRef}>
        {PROCESS_STEPS.map(({ num, title, body, src, label, alt }) => (
          <article className="process-card" key={title}>
            <div className="process-card-media">
              <Asset src={src} label={label} className="process-card-image" alt={alt} />
              <span className="process-card-num" aria-hidden="true">
                {num}
              </span>
            </div>
            <div className="process-card-body">
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="value-blocks">
        {[
          ['The thread sets the pace.', 'A charkha spins where a mill would rush.'],
          ['Colour settles; it is not applied.', 'Natural dye settles into the fibre and becomes one with it.'],
          ['The hands have names.', '200+ women in and around Bardoli spin and weave for Rangvanat. Three generations teach the thread.'],
        ].map(([claim, proof]) => (
          <article className="value-block" key={claim}>
            <h3>{claim}</h3>
            <p>{proof}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

const Artisans = () => {
  const collageRef = useReveal({ variant: 'scaleIn', delay: 0.1 })

  return (
    <section id="artisans" className="dark-section artisans-section">
      <div className="artisan-copy">
        <Eyebrow>Who we weave for</Eyebrow>
        <h2>Behind every weave, a woman rewriting her own story.</h2>
        <p>
          Rangvanat exists because of the women who sit at the wheel before sunrise. Rural artisans
          for whom every thread spun is also a step toward standing on their own.
        </p>
        <div className="counters">
          <strong>200+<span>Women Artisans</span></strong>
          <strong>3<span>Generations of Craft</span></strong>
          <strong>1<span>Shared Dream</span></strong>
        </div>
      </div>
      <div className="artisan-collage" ref={collageRef}>
        <Asset
          src={imagePaths.artisanOne}
          label="artisan1.jpg"
          className="artisan-portrait"
          alt="Rangvanat artisan portrait"
        />
        <Asset
          src={imagePaths.artisanTwo}
          label="artisan2.jpg"
          className="artisan-landscape"
          alt="Rangvanat artisan at the loom"
        />
      </div>
    </section>
  )
}

const Collections = () => (
  <section id="collections" className="section collections-section">
    <div className="section-title">
      <div>
        <Eyebrow>The collection</Eyebrow>
        <h2>Where heritage meets the runway.</h2>
        <p className="collections-intro">
          Not in the fast sense. In the sense that every piece carries a lineage, and every
          collection is curated, not compiled.
        </p>
      </div>
      <Cta href="#contact">Explore the Collection</Cta>
    </div>
    <div className="collection-grid">
      <article className="collection-card">
        <Asset src={imagePaths.collectionLarge} label="collection-everyday-edit.jpg" alt="Everyday khadi edit" />
        <div className="collection-meta">
          <span className="collection-num" aria-hidden="true">01</span>
          <h3>The Everyday Edit</h3>
          <p>Khadi for daily life, elevated. Pieces that feel special without being precious.</p>
        </div>
      </article>
      <article className="collection-card">
        <Asset src={imagePaths.collectionTop} label="collection-statement-edit.jpg" alt="Statement khadi edit" />
        <div className="collection-meta">
          <span className="collection-num" aria-hidden="true">02</span>
          <h3>The Statement Edit</h3>
          <p>Not loud, but significant. Khadi that commands attention through presence, not print.</p>
        </div>
      </article>
      <article className="collection-card">
        <Asset src={imagePaths.collectionBottom} label="collection-bridal-edit.jpg" alt="Bridal khadi edit" />
        <div className="collection-meta">
          <span className="collection-num" aria-hidden="true">03</span>
          <h3>The Bridal Edit</h3>
          <p>Not as costume, but as commitment.</p>
        </div>
      </article>
    </div>
  </section>
)

const Questions = () => {
  const listRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const list = listRef.current
    const items = list?.querySelectorAll('.question-item')
    if (!list || !items?.length || reduced) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        animate(items, {
          opacity: [0, 1],
          translateY: [28, 0],
          duration: 800,
          ease: 'outQuad',
          delay: stagger(120),
        })
      },
      { threshold: 0.15 },
    )
    observer.observe(list)
    return () => observer.disconnect()
  }, [reduced])

  const nudge = (e, amount) => {
    if (reduced) return
    const q = e.currentTarget.querySelector('.question-q')
    if (!q) return
    animate(q, { translateX: amount, duration: 300, ease: 'outQuad' })
  }

  return (
    <section id="questions" className="section questions-section">
      <div className="questions-head">
        <Eyebrow>Fair doubts</Eyebrow>
        <h2>Three honest questions.</h2>
        <p className="questions-intro">
          Asked at every market stall. Answered here, once, without a script.
        </p>
      </div>
      <div className="questions-list" ref={listRef}>
        {[
          ['Isn’t khadi coarse, more government emporium than luxury?', 'Khadi earned that reputation when it was sold as duty. Spun fine and woven slow, it drapes with the best of them. The difference is the hand, not the standard.'],
          ['Is this a charity project wearing a fashion label?', 'No. The women who weave for Rangvanat are paid for mastery, not pitied for circumstance. Craft dignity is the business model, not the marketing.'],
          ['If I can’t buy it here, what am I joining?', 'A letter, and a front-row seat. Custodians hear first when an edit opens. Every piece begins with an enquiry, not a cart.'],
        ].map(([doubt, answer]) => (
          <article
            className="question-item"
            key={doubt}
            onMouseEnter={(e) => nudge(e, 6)}
            onMouseLeave={(e) => nudge(e, 0)}
          >
            <div className="question-body">
              <h3 className="question-q">{doubt}</h3>
              <p>{answer}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

// eslint-disable-next-line no-unused-vars -- Pillars is temporarily hidden (render commented out)
const Pillars = () => {
  const gridRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const cards = gridRef.current?.querySelectorAll('.pillar')
    if (!cards?.length) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: { trigger: gridRef.current, start: 'top 82%', once: true },
        },
      )
    }, gridRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section id="pillars" className="section pillars-section">
      <div className="pillars-head">
        <Eyebrow>What we hold to</Eyebrow>
        <h2>Not slogans. Commitments.</h2>
      </div>
      <div className="pillars-grid" ref={gridRef}>
        {[
          ['Heritage Inspired', 'Every design begins with a story worth remembering. Not every story. Ours.', Sparkles],
          ['Empowering Women Artisans', 'Behind every thread, a livelihood. Behind every weave, a future. Not as cause. As craft dignity.', HandHeart],
          ['Sustainable Fashion', 'Made slow, made to last. Khadi was sustainable before the word existed.', Leaf, 'green'],
          ['Global Vision', 'From Bardoli to the world, without losing an inch of who we are.', Globe2],
        ].map(([title, body, Icon, tone], index) => (
          <article className={`pillar ${tone || ''}`} key={title}>
            <span className="pillar-num" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <Icon size={26} aria-hidden="true" />
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null)
  const panelsRef = useRef([])
  const reduced = useReducedMotion()

  useEffect(() => {
    panelsRef.current.forEach((panel, i) => {
      if (!panel) return
      const open = openIndex === i
      if (reduced) {
        panel.style.height = open ? 'auto' : '0px'
        return
      }
      animate(panel, {
        height: open ? panel.scrollHeight : 0,
        duration: 380,
        ease: open ? 'outCubic' : 'inCubic',
      })
    })
  }, [openIndex, reduced])

  return (
    <section id="faq" className="section faq-section">
      <div className="faq-head">
        <Eyebrow>Before you write</Eyebrow>
        <h2>Questions, answered plainly.</h2>
      </div>
      <div className="faq-list">
        {[
          ['What is khadi?', 'Cloth whose thread is spun by hand and woven on a handloom. No stage is mechanised. The slight irregularity is not a flaw. It is the signature.'],
          ['How is Rangvanat different from a khadi store?', 'A khadi store sells cloth. Rangvanat designs garments as edits. Each piece begins with a story and ends in a seam.'],
          ['Can I buy a piece?', 'Yes, by enquiry, not cart. Write to hello@rangvanat.com or use the Enquire button. Edits are made in small numbers, and each begins with a conversation.'],
          ['Where do you ship?', 'Anywhere a courier reaches. Timings and duties are confirmed during enquiry.'],
          ['How are the artisans paid?', 'Directly, per piece, at rates set with the collective, not against a factory clock.'],
          ['What do I get as a custodian?', 'One letter when a story is ready. New edits, artisan profiles, process notes. No promotions. Unsubscribing stays one click.'],
        ].map(([question, answer], index) => {
          const open = openIndex === index
          return (
            <div className={`faq-item${open ? ' is-open' : ''}`} key={question}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`faq-panel-${index}`}
                onClick={() => setOpenIndex((prev) => (prev === index ? null : index))}
              >
                {question}
                <span className="faq-plus" aria-hidden="true">
                  +
                </span>
              </button>
              <div
                className="faq-answer"
                id={`faq-panel-${index}`}
                ref={(el) => {
                  panelsRef.current[index] = el
                }}
              >
                <p>{answer}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

const Closing = () => {
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const sectionRef = useRef(null)
  const underlineRef = useRef(null)
  const buttonRef = useRef(null)
  const inputRef = useRef(null)
  const statusRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    const targets = section?.querySelectorAll('.closing-reveal')
    if (!section || !targets?.length || reduced) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        animate(targets, {
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 700,
          ease: 'outQuad',
          delay: stagger(110),
        })
      },
      { threshold: 0.2 },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [reduced])

  useEffect(() => {
    const el = statusRef.current
    if (!el || !status || reduced) return undefined
    animate(el, { opacity: [0, 1], translateY: [8, 0], duration: 400, ease: 'outQuad' })
    return undefined
  }, [status, errorMessage, reduced])

  const growUnderline = (open) => {
    if (reduced || !underlineRef.current) return
    animate(underlineRef.current, {
      scaleX: open ? 1 : 0,
      duration: open ? 400 : 300,
      ease: open ? 'outCubic' : 'inCubic',
    })
  }

  const shake = () => {
    if (reduced || !inputRef.current) return
    animate(inputRef.current, {
      translateX: [
        { to: -5, duration: 70 },
        { to: 5, duration: 70 },
        { to: -4, duration: 70 },
        { to: 4, duration: 70 },
        { to: 0, duration: 70 },
      ],
      ease: 'outQuad',
    })
  }

  const fail = (message) => {
    setErrorMessage(message)
    setStatus('error')
    inputRef.current?.focus()
    shake()
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const input = event.currentTarget.elements['newsletter-email']
    if (input.validity.valueMissing) {
      fail('Please enter your email address.')
      return
    }
    if (input.validity.typeMismatch) {
      fail('That doesn’t look like a valid email address. One more try?')
      return
    }
    input.value = ''
    setErrorMessage('')
    setStatus('joined')
    if (!reduced && buttonRef.current) {
      animate(buttonRef.current, {
        scale: [
          { to: 0.94, duration: 180 },
          { to: 1, duration: 320 },
        ],
        ease: 'outQuad',
      })
    }
  }

  return (
    <section id="contact" className="closing-section grain" ref={sectionRef}>
      <div className="closing-head">
        <div className="closing-reveal">
          <Eyebrow>Become a custodian</Eyebrow>
        </div>
        <h2 className="closing-reveal">From Bardoli to the World.</h2>
        <p className="closing-intro closing-reveal">
          Not a subscriber. Not a follower. A custodian. Someone who looks after something worth
          looking after. Be the first to hear when a new Rangvanat story is ready to be told.
        </p>
      </div>
      <div className="closing-form-wrap closing-reveal">
        <form
          className={`closing-form${status === 'error' ? ' has-error' : ''}`}
          noValidate
          onSubmit={handleSubmit}
        >
          <label htmlFor="newsletter-email">Email address</label>
          <div className="closing-field">
            <input
              id="newsletter-email"
              name="newsletter-email"
              type="email"
              placeholder="Your email address"
              required
              ref={inputRef}
              aria-invalid={status === 'error'}
              aria-describedby="closing-status"
              onFocus={() => growUnderline(true)}
              onBlur={() => growUnderline(false)}
              onChange={() => {
                if (status === 'error') {
                  setStatus('idle')
                  setErrorMessage('')
                }
              }}
            />
            <span className="closing-underline" aria-hidden="true" />
          </div>
          <Cta as="button" btnRef={buttonRef}>Join the Journey</Cta>
        </form>
        <p className="form-helper">One letter when a story is ready. Nothing else.</p>
        <p
          id="closing-status"
          className={`form-status${status === 'joined' ? ' is-success' : ''}${status === 'error' ? ' is-error' : ''}`}
          aria-live="polite"
          ref={statusRef}
        >
          {status === 'joined' && <span aria-hidden="true">✓</span>}
          {status === 'joined' ? 'Thank you. Welcome to the journey.' : ''}
          {status === 'error' ? errorMessage : ''}
        </p>
      </div>
    </section>
  )
}

const Footer = () => {
  const reduced = useReducedMotion()
  const labelRef = useRef(null)

  useEffect(() => {
    const el = labelRef.current
    if (!el || reduced) return

    const items = el.querySelectorAll('.care-item')
    const thread = el.querySelector('.care-thread')
    thread.style.transform = 'scaleY(0)'

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        animate(items, {
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 700,
          ease: 'outQuad',
          delay: stagger(90),
        })
        animate(thread, {
          scaleY: [0, 1],
          duration: 600,
          ease: 'outCubic',
          delay: stagger(90)(items.length),
        })
        io.disconnect()
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  return (
    <footer className="footer grain">
      <div className="care-label" ref={labelRef}>
        <span className="care-tag care-item">
          <span className="care-tag-full">100% </span>Handwoven Khadi · Made in Bardoli
        </span>
        <img src="/images/full-logo.svg" alt="Rangvanat" className="care-brand care-item" />
        <p className="care-origin care-item my-10">
          The art of weaving colours into fabric, and fabric into stories.
        </p>
        <p className="care-promise care-item">Your address stays in Bardoli. No lists are sold, ever.</p>
        <div className="care-grid">
          <nav className="care-item" aria-label="Footer navigation">
            <h3>Explore</h3>
            {navLinks.map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`}>
                {link}
                <span className="care-link-arrow" aria-hidden="true">
                  →
                </span>
              </a>
            ))}
          </nav>
          <div className="care-info care-item">
            <div>
              <h3>Reach Us</h3>
              <p>Bardoli, Gujarat, India</p>
              <a href="mailto:hello@rangvanat.com">
                hello@rangvanat.com
                <span className="care-link-arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </div>
            <div>
              <h3>Follow Us</h3>
              <div className="socials">
                <a href="https://instagram.com" aria-label="Instagram">
                  <Camera size={18} />
                </a>
                <a href="https://instagram.com" aria-label="Rangvanat social profile">
                  <AtSign size={18} />
                </a>
                <a href="mailto:hello@rangvanat.com" aria-label="Email">
                  <Mail size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
        <p className="care-wash care-item">
          <span>
            <b>Wash</b> by hand
          </span>
          <span>
            <b>Dry</b> in the sun
          </span>
          <span>
            <b>Wear</b> anywhere
          </span>
        </p>
        <span className="care-thread" aria-hidden="true" />
      </div>
      <div className="care-legal">
        <span>© {new Date().getFullYear()} Rangvanat · Khadi Art by Rangvesh</span>
        <span>Handwoven in Bardoli</span>
      </div>
    </footer>
  )
}

const App = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [showPreloader, setShowPreloader] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    Promise.race([
      Promise.all([document.fonts.ready, windowLoaded()]),
      new Promise((res) => setTimeout(res, 4000)),
    ]).then(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const reduced = useReducedMotion()

  useEffect(() => {
    return initLenis(reduced)
  }, [reduced])

  useEffect(() => {
    if (reduced) return
    const onClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]')
      if (!anchor) return
      const hash = anchor.getAttribute('href')
      if (hash === '#') return
      const lenis = window.__lenis
      if (hash === '#top') {
        e.preventDefault()
        if (lenis) lenis.scrollTo(0, { duration: 1.4 })
        else window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      const target = document.querySelector(hash)
      if (!target) return
      e.preventDefault()
      if (lenis) lenis.scrollTo(target, { offset: -78, duration: 1.4 })
      else target.scrollIntoView({ behavior: 'smooth' })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [reduced])

  return (
    <>
      {showPreloader && <Preloader isLoading={isLoading} onDone={() => setShowPreloader(false)} />}
      <div className="grain-overlay" aria-hidden />
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        <Hero />
        <Story />
        <Heritage />
        <FounderNote />
        <Timeline />
        <Craft />
        <Artisans />
        <Collections />
        <Questions />
        <Faq />
        {/* <Pillars /> */}
        <Closing />
      </main>
      <Footer />
    </>
  )
}

export default App
