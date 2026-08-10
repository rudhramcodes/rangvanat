import { useEffect, useState } from 'react'
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

const imagePaths = {
  hero: '/images/hero.png',
  story: '/images/2.webp',
  process: '/images/3.webp',
  artisanOne: '/images/artisan-portrait-01.webp',
  artisanTwo: '/images/artisan-loom-01.webp',
  collectionLarge: '/images/4.webp',
  collectionTop: '/images/5.webp',
  collectionBottom: '/images/6.webp',
}

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

const Cta = ({ children, href = '#collections', dark = false }) => (
  <a className={`cta ${dark ? 'cta-dark' : ''}`} href={href}>
    {children}
    <span aria-hidden>›</span>
  </a>
)

const Header = ({ menuOpen, setMenuOpen }) => (
  <header className="site-header">
    <a className="logo-link" href="#top" aria-label="Rangvanat home">
      <img src="/images/logo-only.svg" alt="Rangvanat" />
    </a>

    <nav className="desktop-nav" aria-label="Primary navigation">
      {navLinks.map((link) => (
        <a key={link} href={`#${link.toLowerCase()}`}>
          {link}
        </a>
      ))}
    </nav>

    <div className="header-actions">
      <Cta href="#collections">Explore</Cta>
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

    <div id="mobile-menu" className={`mobile-menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
      <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
        <X size={28} />
      </button>
      {navLinks.map((link) => (
        <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMenuOpen(false)}>
          {link}
        </a>
      ))}
      <Cta href="#contact" dark>
        Join the Journey
      </Cta>
    </div>
  </header>
)

const Hero = () => (
  <section id="top" className="hero">
    <Asset
      src={imagePaths.hero}
      label="hero-founder-portrait.jpg"
      className="hero-image"
      alt="Rangvanat founder portrait"
    >
      <div className="hero-copy">
        <Eyebrow>Khadi Art by Rangvesh</Eyebrow>
        <h1>Every Thread Remembers.</h1>
        <p>The art of weaving colours into fabric, and fabric into stories.</p>
      </div>
    </Asset>
    <div className="hero-panel">
      <Eyebrow>New Collection</Eyebrow>
      <h2>From Bardoli to the World.</h2>
      <p>Hand-spun khadi, patient colour, and stories made wearable.</p>
      <Cta href="#collections" dark>
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
      Long before it was a trend, khadi was a promise - spun by hand, worn as resistance, passed down
      as pride. Rangvanat starts there. Same thread, same patient hands, just given a new stage to
      stand on - one that does not ask it to forget where it came from.
    </p>
  </section>
)

const Heritage = () => (
  <section className="section split-section">
    <Asset
      src={imagePaths.story}
      label="story-bardoli-illustration.jpg"
      className="framed-image"
      alt="Bardoli heritage illustration"
    />
    <div className="section-copy">
      <Eyebrow>Where we come from</Eyebrow>
      <h2>A legacy woven in Bardoli.</h2>
      <p>
        Rangvanat comes out of Bardoli - Sardar Patel's home ground, the place where a length of
        hand-spun cloth once became the loudest thing a person could say. We did not inherit khadi as
        a fabric. We inherited it as a job to finish.
      </p>
      <Cta href="#craft">Read the Story</Cta>
    </div>
  </section>
)

const FounderNote = () => (
  <section className="quote-section">
    <blockquote>
      "I did not want to just make clothes. I wanted to fold a piece of Bardoli's soil, a piece of my
      grandmother's stories, into every seam I send out into the world. Khadi taught me that slow is
      not a weakness - it is where the meaning actually lives."
    </blockquote>
    <div className="founder">
      <Asset
        src="/images/home/founder-rachana-kapadia.jpg"
        label="founder-rachana-kapadia.jpg"
        alt="Rachana Kapadia portrait"
      />
      <p>
        <strong>Rachana Kapadia</strong>
        <span>Designer, Founder & Managing Director</span>
      </p>
    </div>
  </section>
)

const Timeline = () => (
  <section className="timeline-strip" aria-label="Rangvanat heritage timeline">
    {[
      ['Bardoli', 'Charkha roots'],
      ['Gandhi & Swadeshi', 'Freedom in every fibre'],
      ['Today / Rangvanat', 'Handwoven for now'],
    ].map(([title, body], index) => (
      <div className={index === 1 ? 'is-large' : ''} key={title}>
        <span>{title}</span>
        <p>{body}</p>
      </div>
    ))}
  </section>
)

const Craft = () => (
  <section id="craft" className="section process-section">
    <Asset
      src={imagePaths.process}
      label="process-charkha.jpg"
      className="process-image"
      alt="Artisan spinning khadi on a charkha"
    />
    <div className="section-copy">
      <Eyebrow>The process</Eyebrow>
      <h2>Spun slow. Woven with intention.</h2>
      <p>
        Every piece starts the same way it did a hundred years ago - on a charkha, in the hands of
        someone who has spent a lifetime learning what the thread wants to become.
      </p>
      {[
        ['Spinning', 'Cotton becomes thread under patient hands.'],
        ['Dyeing', 'Natural colour settles slowly into the fibre.'],
        ['Weaving', 'The loom turns memory into fabric.'],
        ['Finishing', 'Every edge is checked before it leaves Bardoli.'],
      ].map(([title, body]) => (
        <article className="process-step" key={title}>
          <h3>{title}</h3>
          <p>{body}</p>
        </article>
      ))}
    </div>
  </section>
)

const Artisans = () => (
  <section id="artisans" className="dark-section artisans-section">
    <div>
      <Eyebrow>Who we weave for</Eyebrow>
      <h2>Behind every weave, a woman rewriting her own story.</h2>
      <p>
        Rangvanat exists because of the women who sit at the wheel before sunrise - rural artisans
        for whom every thread spun is also a step toward standing on their own.
      </p>
      <div className="counters">
        <strong>200+<span>Women Artisans</span></strong>
        <strong>3<span>Generations of Craft</span></strong>
        <strong>1<span>Shared Dream</span></strong>
      </div>
    </div>
    <div className="artisan-images">
      <Asset src={imagePaths.artisanOne} label="artisan-portrait-01.jpg" alt="Rangvanat artisan portrait" />
      <Asset src={imagePaths.artisanTwo} label="artisan-loom-01.jpg" alt="Rangvanat artisan at loom" />
    </div>
  </section>
)

const Collections = () => (
  <section id="collections" className="section collections-section">
    <div className="section-title">
      <div>
        <Eyebrow>The collection</Eyebrow>
        <h2>Where heritage meets the runway.</h2>
      </div>
      <Cta href="#contact">Explore the Collection</Cta>
    </div>
    <div className="collection-grid">
      <Asset src={imagePaths.collectionLarge} label="collection-everyday-edit.jpg" alt="Everyday khadi edit">
        <h3>The Everyday Edit</h3>
      </Asset>
      <Asset src={imagePaths.collectionTop} label="collection-statement-edit.jpg" alt="Statement khadi edit">
        <h3>The Statement Edit</h3>
      </Asset>
      <Asset src={imagePaths.collectionBottom} label="collection-bridal-edit.jpg" alt="Bridal khadi edit">
        <h3>The Bridal Edit</h3>
      </Asset>
    </div>
  </section>
)

const Pillars = () => (
  <section className="section pillars-section">
    {[
      ['Heritage Inspired', 'Every design starts with a story worth remembering.', Sparkles, 'wide'],
      ['Empowering Women Artisans', 'Behind every thread, a livelihood. Behind every weave, a future.', HandHeart],
      ['Sustainable Fashion', 'Made slow, made to last - khadi was sustainable before the word existed.', Leaf, 'green'],
      ['Global Vision', 'From Bardoli to the world, without losing an inch of who we are.', Globe2],
    ].map(([title, body, Icon, tone]) => (
      <article className={`pillar ${tone || ''}`} key={title}>
        <Icon size={24} />
        <h3>{title}</h3>
        <p>{body}</p>
      </article>
    ))}
  </section>
)

const Closing = () => {
  const [joined, setJoined] = useState(false)

  return (
    <section id="contact" className="closing-section">
      <Eyebrow>Become a custodian</Eyebrow>
      <h2>From Bardoli to the World.</h2>
      <p>Be the first to hear when a new Rangvanat story is ready to be told.</p>
      <form onSubmit={(event) => {
        event.preventDefault()
        setJoined(true)
      }}>
        <label htmlFor="newsletter-email">Email address</label>
        <input id="newsletter-email" type="email" placeholder="you@example.com" required />
        <button type="submit">Join the Journey</button>
      </form>
      <p className="form-status" aria-live="polite">
        {joined ? 'Thank you - welcome to the journey.' : ''}
      </p>
    </section>
  )
}

const Footer = () => (
  <footer className="footer">
    <span className="footer-ghost">RANGVANAT</span>
    <div>
      <img src="/images/logo-only.svg" alt="Rangvanat" />
      <p>The art of weaving colours into fabric, and fabric into stories.</p>
    </div>
    <nav aria-label="Footer navigation">
      <h3>Explore</h3>
      {navLinks.map((link) => (
        <a key={link} href={`#${link.toLowerCase()}`}>
          {link}
        </a>
      ))}
    </nav>
    <div>
      <h3>Reach Us</h3>
      <p>Bardoli, Gujarat, India</p>
      <p>hello@rangvanat.com</p>
      <p>+91 00000 00000</p>
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
    <small>
      © {new Date().getFullYear()} Rangvanat - Khadi Art by Rangvesh.
      <span>Handwoven in Bardoli</span>
    </small>
  </footer>
)

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
        <Pillars />
        <Closing />
      </main>
      <Footer />
    </>
  )
}

export default App
