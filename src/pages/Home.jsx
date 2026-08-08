import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { animate } from 'animejs'
import { ArrowRight, ArrowUpRight, Globe, HeartHandshake, History, Leaf } from 'lucide-react'
import PlaceholderImage from '../components/PlaceholderImage'
import Button from '../components/Button'

const eyebrow = 'text-[11px] font-semibold uppercase tracking-[0.3em] text-terracotta'

/** rAF-driven scrub: `apply` receives progress 0→1 of section passing through viewport. */
function useScrubEffect(ref, apply) {
  useEffect(() => {
    let raf
    const tick = () => {
      const el = ref.current
      if (el) {
        const rect = el.getBoundingClientRect()
        const total = el.offsetHeight + window.innerHeight
        const p = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / total))
        apply(p)
      }
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [ref, apply])
}

/** Scroll-triggered entrance. variants: rise | fade | mask */
const Reveal = ({ children, delay = 0, variant = 'rise', className = '' }) => {
  const outerRef = useRef(null)
  const innerRef = useRef(null)
  useEffect(() => {
    const el = variant === 'mask' ? innerRef.current : outerRef.current
    if (!el) return
    if (variant === 'mask') {
      el.style.transform = 'translateY(105%)'
    } else if (variant === 'fade') {
      el.style.opacity = 0
    } else {
      el.style.opacity = 0
      el.style.transform = 'translateY(44px)'
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        const to =
          variant === 'fade'
            ? { opacity: [0, 1] }
            : variant === 'mask'
              ? { translateY: ['105%', '0%'] }
              : { opacity: [0, 1], translateY: [44, 0] }
        animate(el, { ...to, duration: 1000, ease: 'outCubic', delay })
        io.disconnect()
      },
      { threshold: 0.15 },
    )
    io.observe(outerRef.current)
    return () => io.disconnect()
  }, [delay, variant])

  if (variant === 'mask')
    return (
      <div ref={outerRef} className={`overflow-hidden ${className}`}>
        <div ref={innerRef}>{children}</div>
      </div>
    )
  return (
    <div ref={outerRef} className={className}>
      {children}
    </div>
  )
}

const Counter = ({ to, suffix = '', className = '' }) => {
  const ref = useRef(null)
  const [val, setVal] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        const anim = animate({ value: 0 }, { value: to, duration: 1600, ease: 'outQuart', onUpdate: (a) => setVal(Math.round(a.value)) })
        io.disconnect()
        return () => anim.pause?.()
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [to])
  return (
    <span ref={ref} className={className}>
      {val.toLocaleString('en-IN')}
      {suffix}
    </span>
  )
}

const UnderlineLink = ({ to, children, className = '' }) => (
  <Link
    to={to}
    className={`group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-oxblood transition-colors hover:text-terracotta ${className}`}
  >
    {children}
    <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1.5" />
  </Link>
)

const Hero = () => {
  useEffect(() => {
    const anim = animate('[data-hero]', {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 900,
      ease: 'outCubic',
      delay: (el, i) => 200 + i * 120,
    })
    return () => anim.pause?.()
  }, [])
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-parchment">
      <div className="weave absolute inset-0 overflow-hidden opacity-25 lg:right-[62%]" aria-hidden />
      <div className="grain absolute inset-0 opacity-20" aria-hidden />
      <div className="absolute inset-y-0 right-0 w-full lg:w-[62%]">
        <PlaceholderImage light label="Founder portrait" className="h-full w-full" />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-36 sm:px-8">
        <div className="max-w-xl lg:max-w-[42%]">
          <h1
            data-hero
            className="mt-2 font-display text-6xl leading-[0.92] tracking-tight text-espresso sm:text-7xl lg:text-[4.75rem]"
          >
            Every Thread{' '}
            <em className="relative italic text-terracotta">
              Remembers.
              <span
                aria-hidden
                className="absolute -bottom-2 left-0 h-[2px] w-[112%] bg-gradient-to-r from-terracotta to-brass"
              />
              <span aria-hidden className="absolute -bottom-4 right-0 h-1.5 w-1.5 rounded-full bg-brass" />
            </em>
          </h1>
          <p data-hero className="mt-8 max-w-md font-sans text-base font-light italic leading-relaxed text-espresso/75">
            The art of weaving colours into fabric, and fabric into stories.
          </p>
          <div data-hero className="mt-10">
            <Button to="/about" arrow>
              Discover Rangvanat
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

const KineticBand = () => {
  const sectionRef = useRef(null)
  const lineRef = useRef(null)
  useScrubEffect(sectionRef, (p) => {
    if (lineRef.current) lineRef.current.style.transform = `translateX(${(p - 0.5) * 360}px)`
  })
  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-ivory py-24 sm:py-32">
      <span className="absolute left-0 right-0 top-1/2 h-px bg-brass/50" aria-hidden />
      <div ref={lineRef} className="relative will-change-transform">
        <p className="select-none text-center font-display text-[17vw] leading-none tracking-wide text-oxblood/90">
          {'RANGVANAT'.split('').map((l, i) =>
            l === 'V' ? (
              <span key={i} className="relative text-terracotta">
                {l}
                <span className="absolute -bottom-4 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-brass" aria-hidden />
              </span>
            ) : (
              <span key={i} className="text-oxblood/15">
                {l}
              </span>
            ),
          )}
        </p>
      </div>
    </section>
  )
}

const Story = () => (
  <section className="bg-ivory py-28 sm:py-40">
    <div className="mx-auto grid max-w-7xl items-start gap-14 px-5 sm:px-8 lg:grid-cols-[55%_45%] lg:gap-20">
      <Reveal variant="mask" className="lg:sticky lg:top-32">
        <div className="relative p-4 sm:p-6">
          <span className="absolute inset-x-4 top-5 bottom-3 border border-brass/50" aria-hidden />
          <PlaceholderImage label="The Story" className="aspect-[4/5] w-full" />
        </div>
      </Reveal>
      <Reveal variant="rise" className="lg:pb-24 lg:pt-40">
        <p className={eyebrow}>The Story</p>
        <h2 className="mt-5 font-display text-4xl leading-[1.02] text-oxblood sm:text-6xl">
          Before it was fashion, <em className="italic text-terracotta">it was freedom.</em>
        </h2>
        <p className="mt-8 max-w-md font-sans text-sm font-light leading-relaxed text-espresso/75">
          Long before it was a trend, khadi was a promise — spun by hand, worn as resistance, and
          passed down as pride. Rangvanat begins in that story: the looms of Bardoli, the hands
          behind them, and a grandmother who refused to let the thread end.
        </p>
        <UnderlineLink to="/about" className="mt-10">
          Discover the Journey
        </UnderlineLink>
      </Reveal>
    </div>
  </section>
)

const FounderNote = () => (
  <section className="grain relative overflow-hidden bg-parchment py-24 sm:py-32">
    <span
      className="pointer-events-none absolute -left-2 -top-14 select-none font-display text-[10rem] leading-none text-brass/25"
      aria-hidden
    >
      &ldquo;
    </span>
    <div className="relative mx-auto max-w-4xl px-5 sm:px-8">
      <Reveal variant="rise">
        <p className={eyebrow}>In Her Words</p>
        <blockquote className="mt-6 font-display text-2xl italic leading-snug text-oxblood sm:text-4xl">
          &ldquo;I did not want to just make clothes. I wanted to hold a piece of Bardoli&rsquo;s
          soil — a piece of my grandmother&rsquo;s stories — in every fold of fabric I send into the
          world. Khadi taught me that slowness is not a weakness. It is where all the meaning
          lives.&rdquo;
        </blockquote>
        <div className="mt-12 flex flex-row-reverse items-center justify-start gap-5">
          <PlaceholderImage label="Founder" round className="h-20 w-20 shrink-0" />
          <div className="text-right">
            <p className="font-display text-xl text-espresso">— Rachana Kapadia</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.25em] text-terracotta">
              Designer, Founder &amp; Managing Director
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
)

const Heritage = () => {
  const sectionRef = useRef(null)
  const stripRef = useRef(null)
  useScrubEffect(sectionRef, (p) => {
    const strip = stripRef.current
    if (strip) strip.style.transform = `translateX(${-Math.max(0, strip.scrollWidth - window.innerWidth) * p}px)`
  })
  const NODES = [
    {
      year: '1905',
      title: 'The Movement',
      text: 'Swadeshi — when hand-spun cloth became resistance itself.',
      weight: 'large',
    },
    {
      year: '1928',
      title: 'The Land',
      text: 'Bardoli Satyagraha — Sardar Patel’s land learns to stand for itself.',
      weight: 'medium',
    },
    {
      year: '1947',
      title: 'The Freedom',
      text: 'Khadi becomes the livery of a free nation.',
      weight: 'medium',
    },
    {
      year: 'Today',
      title: 'The Legacy',
      text: 'Rangvanat carries the same thread to the world’s biggest stages.',
      weight: 'large',
    },
  ]
  return (
    <section ref={sectionRef} className="overflow-hidden bg-ivory py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal variant="rise">
          <p className={eyebrow}>Rooted in History</p>
          <h2 className="mt-5 font-display text-4xl leading-[1.02] text-oxblood sm:text-6xl">
            A thread of <em className="italic text-terracotta">freedom</em> runs through everything.
          </h2>
        </Reveal>
      </div>
      <Reveal variant="fade" className="mt-20">
        <div ref={stripRef} className="flex w-max items-center gap-16 px-[8vw] will-change-transform sm:gap-24">
          {NODES.map((node, i) => (
            <div key={node.year} className="relative flex min-w-[46vw] max-w-[46vw] flex-col sm:min-w-[30vw] sm:max-w-[30vw]">
              <span className="absolute -bottom-6 left-0 h-px w-full bg-brass/40" aria-hidden />
              <span
                className={`absolute -bottom-[1.9rem] left-0 rounded-full bg-terracotta ${
                  node.weight === 'large' ? 'h-4 w-4' : 'h-2.5 w-2.5'
                }`}
                aria-hidden
              />
              <p
                className={`font-display leading-none text-brass ${
                  node.weight === 'large' ? 'text-7xl sm:text-8xl' : 'text-5xl sm:text-6xl'
                }`}
              >
                {node.year}
              </p>
              <h3 className="mt-6 font-display text-xl text-oxblood sm:text-2xl">{node.title}</h3>
              <p className="mt-3 max-w-xs font-sans text-sm font-light leading-relaxed text-espresso/70">
                {node.text}
              </p>
              {i === 0 && (
                <span className="mt-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-terracotta">
                  Where it all began
                </span>
              )}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

const Craft = () => {
  const STEPS = [
    {
      title: 'Spinning the Yarn',
      text: 'Raw cotton, cleaned by hand, spun slowly on the charkha. This is where the character enters the thread.',
    },
    {
      title: 'Natural Dyeing',
      text: 'Indigo, madder, pomegranate — colour from the earth, fixed with patience, never with haste.',
    },
    {
      title: 'Handloom Weaving',
      text: 'Each metre takes hours. Each blemish is a signature. No two metres are ever the same.',
    },
    {
      title: 'Finishing & Quality',
      text: 'Washed, sun-dried, and inspected fold by fold — every piece leaves the village with its story intact.',
    },
  ]
  const indents = ['', 'lg:ml-[12%]', 'lg:ml-[4%]', 'lg:ml-[16%]']
  return (
    <section className="bg-parchment py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal variant="rise" className="max-w-2xl">
          <p className={eyebrow}>The Craft</p>
          <h2 className="mt-5 font-display text-4xl leading-[1.02] text-oxblood sm:text-6xl">
            Made slowly, <em className="italic text-terracotta">by hand, on purpose.</em>
          </h2>
          <p className="mt-6 font-sans text-sm font-light leading-relaxed text-espresso/75">
            From cotton boll to finished fabric, four movements — and no shortcuts.
          </p>
        </Reveal>
        <div className="mt-20 grid items-start gap-16 lg:grid-cols-2">
          <Reveal variant="mask" className="lg:sticky lg:top-28">
            <PlaceholderImage label="The Craft" className="aspect-[3/4] w-full" />
          </Reveal>
          <div className="space-y-24">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} variant="rise" delay={i * 60} className={indents[i]}>
                <p className="font-display text-5xl text-brass/50">0{i + 1}</p>
                <h3 className="mt-4 font-display text-2xl text-oxblood sm:text-3xl">{step.title}</h3>
                <p className="mt-3 max-w-sm font-sans text-sm font-light leading-relaxed text-espresso/70">
                  {step.text}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const Artisans = () => {
  const stats = [
    { to: 200, suffix: '+', label: 'Women Artisans', offset: 'sm:translate-y-0' },
    { to: 3, suffix: '', label: 'Generations of Craft', offset: 'sm:translate-y-10' },
    { to: 1, suffix: '', label: 'Shared Dream', offset: 'sm:translate-y-20' },
  ]
  return (
    <section className="grain relative bg-espresso py-28 text-center sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal variant="rise">
          <p className={`${eyebrow} !text-champagne`}>Who We Weave For</p>
          <h2 className="mx-auto mt-5 max-w-3xl font-display text-3xl leading-[1.05] text-ivory sm:text-5xl">
            Behind every weave, a woman <em className="italic text-champagne">rewriting her own story.</em>
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-sans text-sm font-light leading-relaxed text-ivory/60">
            Every metre of Rangvanat is woven by artisan partners — paid fairly, trained
            continuously, and celebrated as the true designers of this house.
          </p>
        </Reveal>
        <div className="mt-20 grid gap-14 sm:grid-cols-3 sm:gap-8">
          {stats.map((s, i) => (
            <Reveal key={s.label} variant="rise" delay={i * 120} className={s.offset}>
              <p className="font-display text-7xl leading-none text-champagne sm:text-8xl">
                <Counter to={s.to} suffix={s.suffix} />
              </p>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-brass">
                {s.label}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

const Collections = () => (
  <section className="bg-ivory py-28 sm:py-36">
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <Reveal variant="rise" className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className={eyebrow}>The Collections</p>
          <h2 className="mt-5 font-display text-4xl leading-[1.02] text-oxblood sm:text-6xl">
            Three edits. <em className="italic text-terracotta">One thread.</em>
          </h2>
        </div>
        <UnderlineLink to="/collections">View All Collections</UnderlineLink>
      </Reveal>

      <div className="mt-16 grid grid-cols-12 gap-5">
        <Link
          to="/collections/statement"
          className="group col-span-12 md:col-span-7"
          aria-label="Statement Edit — view collection"
        >
          <PlaceholderImage label="Statement Edit" className="aspect-[4/5] w-full" />
          <div className="mt-5 flex items-baseline justify-between">
            <h3 className="font-display text-xl text-oxblood transition-transform duration-300 group-hover:-rotate-1 sm:text-2xl">
              The Statement Edit
            </h3>
            <ArrowUpRight size={20} className="text-brass transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
          </div>
          <p className="relative mt-2 font-sans text-sm font-light text-espresso/65">
            One piece, unapologetic.
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-terracotta transition-all duration-500 group-hover:w-full" aria-hidden />
          </p>
        </Link>
        <div className="grid gap-5 md:col-span-5 md:grid-rows-2">
          <Link to="/collections/everyday" className="group" aria-label="Everyday Edit — view collection">
            <PlaceholderImage label="Everyday Edit" className="aspect-[16/10] w-full" />
            <h3 className="mt-4 font-display text-lg text-oxblood sm:text-xl">The Everyday Edit</h3>
            <p className="relative mt-1 font-sans text-sm font-light text-espresso/65">
              Made for living in.
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-terracotta transition-all duration-500 group-hover:w-full" aria-hidden />
            </p>
          </Link>
          <Link to="/collections/bridal" className="group" aria-label="Bridal Edit — view collection">
            <PlaceholderImage label="Bridal Edit" className="aspect-[16/10] w-full" />
            <h3 className="mt-4 font-display text-lg text-oxblood sm:text-xl">The Bridal Edit</h3>
            <p className="relative mt-1 font-sans text-sm font-light text-espresso/65">
              For the slowest, sweetest yes.
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-terracotta transition-all duration-500 group-hover:w-full" aria-hidden />
            </p>
          </Link>
        </div>
      </div>
    </div>
  </section>
)

const Pillars = () => {
  const PILLARS = [
    {
      title: 'Heritage Inspired',
      text: 'Every design begins with a story worth remembering.',
      icon: History,
      large: true,
    },
    {
      title: 'Empowering Women Artisans',
      text: 'Behind every thread, a livelihood. Behind every weave, a future.',
      icon: HeartHandshake,
    },
    {
      title: 'Sustainable Fashion',
      text: 'Made slow, made to last — khadi was sustainable before sustainability had a name.',
      icon: Leaf,
      emerald: true,
    },
    {
      title: 'Global Vision',
      text: 'From Bardoli to the world, without losing an inch of who we are.',
      icon: Globe,
    },
  ]
  return (
    <section className="bg-parchment py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal variant="rise" className="max-w-2xl">
          <p className={eyebrow}>What We Stand For</p>
          <h2 className="mt-5 font-display text-4xl leading-[1.02] text-oxblood sm:text-6xl">
            Four pillars, <em className="italic text-terracotta">one ground.</em>
          </h2>
        </Reveal>
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          <Reveal variant="rise" className="md:col-span-2 md:row-span-2">
            <div className="relative h-full min-h-[420px] overflow-hidden">
              <PlaceholderImage label="Heritage" className="absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-oxblood via-oxblood/40 to-transparent" />
              <div className="relative flex h-full min-h-[420px] flex-col justify-end p-8">
                <History size={26} className="text-champagne" />
                <h3 className="mt-4 font-display text-2xl text-ivory sm:text-3xl">Heritage Inspired</h3>
                <p className="mt-3 max-w-md font-sans text-sm font-light leading-relaxed text-ivory/80">
                  Every design begins with a story worth remembering — the movement that freed a
                  nation, and the grandmother who taught this house to weave.
                </p>
              </div>
            </div>
          </Reveal>
          {PILLARS.slice(1, 3).map((p, i) => (
            <Reveal key={p.title} variant="rise" delay={(i + 1) * 100}>
              <div className="group h-full border border-brass/25 bg-ivory p-8 transition-colors duration-300 hover:border-terracotta/60">
                <p.icon
                  size={26}
                  className={p.emerald ? 'text-emerald-700' : 'text-terracotta'}
                />
                <h3 className="mt-5 font-display text-xl leading-snug text-oxblood">{p.title}</h3>
                <p className="mt-3 font-sans text-sm font-light leading-relaxed text-espresso/70">
                  {p.text}
                </p>
              </div>
            </Reveal>
          ))}
          <Reveal variant="rise" delay={300} className="md:col-span-3">
            <div className="flex h-full flex-col gap-5 border border-brass/25 bg-ivory p-8 transition-colors duration-300 hover:border-terracotta/60 sm:flex-row sm:items-center">
              <Globe size={28} className="shrink-0 text-terracotta" />
              <div>
                <h3 className="font-display text-xl text-oxblood">Global Vision</h3>
                <p className="mt-2 max-w-2xl font-sans text-sm font-light leading-relaxed text-espresso/70">
                  From Bardoli to the world, without losing an inch of who we are.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

const ClosingCTA = () => {
  const [email, setEmail] = useState('')
  const [joined, setJoined] = useState(false)
  return (
    <section className="grain relative overflow-hidden bg-oxblood text-center">
      <div className="overflow-hidden pt-20 sm:pt-28">
        <Reveal variant="mask">
          <h2 className="-mt-[0.08em] select-none text-center font-display text-[16vw] leading-[0.82] tracking-tight text-champagne">
            FROM
            <br />
            BARDOLI
          </h2>
        </Reveal>
      </div>
      <p className="mt-5 font-display text-2xl italic text-ivory/85 sm:text-4xl">to the World.</p>
      <div className="mx-auto max-w-2xl px-5 pb-24 pt-14 sm:pb-28">
        <Reveal variant="rise" delay={100}>
          <p className={eyebrow}>&ldquo;Of the Earth, in Earth&rsquo;s own time.&rdquo;</p>
          <p className="mx-auto mt-5 max-w-md font-sans text-sm font-light leading-relaxed text-ivory/70">
            Be the first to know when a new Rangvanat story is ready to be told.
          </p>
          {joined ? (
            <p className="mx-auto mt-8 max-w-md font-display text-xl italic text-champagne">
              Thank you — welcome to the journey.
            </p>
          ) : (
            <form
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault()
                if (email.trim()) setJoined(true)
              }}
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full flex-1 border border-ivory/25 bg-ivory/10 px-4 py-3.5 font-sans text-sm font-light text-ivory placeholder:text-ivory/40 focus:border-champagne focus:outline-none"
              />
              <Button type="submit" size="sm" className="shrink-0">
                Join the Journey
              </Button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}

const Home = () => (
  <main>
    <Hero />
    <KineticBand />
    <Story />
    <FounderNote />
    <Heritage />
    <Craft />
    <Artisans />
    <Collections />
    <Pillars />
    <ClosingCTA />
  </main>
)

export default Home
