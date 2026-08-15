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

const Cta = ({ children, href = '#collections', dark = false, light = false, brand = false, size = 'md' }) => (
  <a
    className={`cta ${dark ? 'cta-dark' : ''} ${light ? 'cta-light' : ''} ${brand ? 'cta-brand' : ''} cta-${size}`}
    href={href}
  >
    <span className="cta-sheen" aria-hidden="true" />
    <span className="cta-label">
      <span className="cta-text">{children}</span>
      <span className="cta-text cta-text--ghost" aria-hidden="true">
        {children}
      </span>
    </span>
  </a>
)

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
        <Cta href="#contact" dark size="sm">
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
      <Cta href="#collections" brand size="lg">
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

const Heritage = () => (
  <section id="heritage" className="section split-section">
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
        Rangvanat comes from Bardoli, Sardar Patel's home ground. A length of hand-spun cloth was
        once the loudest thing a person could say here. We did not inherit khadi as a fabric. We
        inherited it as a vow to finish.
      </p>
      <Cta href="#craft">Read the Story</Cta>
    </div>
  </section>
)

const FounderNote = () => (
  <section id="founder" className="quote-section">
    <blockquote>
      "I did not want to just make clothes. I wanted to fold a piece of Bardoli's soil, a piece of my
      grandmother's stories, into every seam I send out into the world. Khadi taught me that slow is
      not a weakness. It is where the meaning actually lives."
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
    <Cta href="#craft" light>
      Begin with the Story
    </Cta>
  </section>
)

const Timeline = () => (
  <section id="timeline" className="timeline-strip" aria-label="Rangvanat heritage timeline">
    {[
      ['Bardoli', 'Charkha roots. The village where thread first became defiance.'],
      ['Gandhi & Swadeshi', 'Freedom in every fibre. When khadi became the uniform of a movement.'],
      ['Today / Rangvanat', 'Handwoven for now. The wheel still turns; the wardrobe changed.'],
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
        Every piece begins the way it did a hundred years ago. On a charkha, in the hands of
        someone who has spent a lifetime learning what the thread wants to become.
      </p>
      {[
        ['Spinning', 'Cotton becomes thread under patient hands. The thread is not forced; it is coaxed.'],
        ['Dyeing', 'Natural colour settles slowly into the fibre. It does not sit on the surface; it becomes one with it.'],
        ['Weaving', 'The loom turns memory into fabric. Each throw of the shuttle is a decision.'],
        ['Finishing', 'Every edge is checked before it leaves Bardoli. Not quality control. Craft pride.'],
      ].map(([title, body]) => (
        <article className="process-step" key={title}>
          <h3>{title}</h3>
          <p>{body}</p>
        </article>
      ))}
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
    </div>
  </section>
)

const Artisans = () => (
  <section id="artisans" className="dark-section artisans-section grain">
    <div>
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
        <p className="collections-intro">
          Not in the fast sense. In the sense that every piece carries a lineage, and every
          collection is curated, not compiled.
        </p>
      </div>
      <Cta href="#contact">Explore the Collection</Cta>
    </div>
    <div className="collection-grid">
      <Asset src={imagePaths.collectionLarge} label="collection-everyday-edit.jpg" alt="Everyday khadi edit">
        <div className="collection-caption">
          <h3>The Everyday Edit</h3>
          <p>Khadi for daily life, elevated. Pieces that feel special without being precious.</p>
        </div>
      </Asset>
      <Asset src={imagePaths.collectionTop} label="collection-statement-edit.jpg" alt="Statement khadi edit">
        <div className="collection-caption">
          <h3>The Statement Edit</h3>
          <p>Not loud, but significant. Khadi that commands attention through presence, not print.</p>
        </div>
      </Asset>
      <Asset src={imagePaths.collectionBottom} label="collection-bridal-edit.jpg" alt="Bridal khadi edit">
        <div className="collection-caption">
          <h3>The Bridal Edit</h3>
          <p>Not as costume, but as commitment.</p>
        </div>
      </Asset>
    </div>
  </section>
)

const Questions = () => (
  <section id="questions" className="section questions-section">
    <div className="questions-head">
      <Eyebrow>Fair doubts</Eyebrow>
      <h2>Three honest questions.</h2>
    </div>
    <div className="questions-grid">
      {[
        ['“Isn’t khadi coarse, more government emporium than luxury?”', 'Khadi earned that reputation when it was sold as duty. Spun fine and woven slow, it drapes with the best of them. The difference is the hand, not the standard.'],
        ['“Is this a charity project wearing a fashion label?”', 'No. The women who weave for Rangvanat are paid for mastery, not pitied for circumstance. Craft dignity is the business model, not the marketing.'],
        ['“If I can’t buy it here, what am I joining?”', 'A letter, and a front-row seat. Custodians hear first when an edit opens. Every piece begins with an enquiry, not a cart.'],
      ].map(([doubt, answer]) => (
        <article className="question-card" key={doubt}>
          <h3>{doubt}</h3>
          <p>{answer}</p>
        </article>
      ))}
    </div>
  </section>
)

const Pillars = () => (
  <section id="pillars" className="section pillars-section">
    <div className="pillars-head">
      <h2>What we hold to.</h2>
    </div>
    {[
      ['Heritage Inspired', 'Every design begins with a story worth remembering. Not every story. Ours.', Sparkles, 'wide'],
      ['Empowering Women Artisans', 'Behind every thread, a livelihood. Behind every weave, a future. Not as cause. As craft dignity.', HandHeart],
      ['Sustainable Fashion', 'Made slow, made to last. Khadi was sustainable before the word existed.', Leaf, 'green'],
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

const Faq = () => (
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
      ].map(([question, answer]) => (
        <details className="faq-item" key={question}>
          <summary>{question}</summary>
          <p>{answer}</p>
        </details>
      ))}
    </div>
  </section>
)

const Closing = () => {
  const [status, setStatus] = useState('idle')

  return (
    <section id="contact" className="closing-section grain">
      <Eyebrow>Become a custodian</Eyebrow>
      <h2>From Bardoli to the World.</h2>
      <p>
        Not a subscriber. Not a follower. A custodian. Someone who looks after something worth
        looking after. Be the first to hear when a new Rangvanat story is ready to be told.
      </p>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          const input = event.currentTarget.elements['newsletter-email']
          if (!input.checkValidity()) {
            setStatus('error')
            return
          }
          setStatus('joined')
        }}
      >
        <label htmlFor="newsletter-email">Email address</label>
        <input id="newsletter-email" name="newsletter-email" type="email" placeholder="Your email address" required />
        <button type="submit">Join the Journey</button>
      </form>
      <p className="form-helper">One letter when a story is ready. Nothing else.</p>
      <p className="form-status" aria-live="polite">
        {status === 'joined' ? 'Thank you. Welcome to the journey.' : ''}
        {status === 'error' ? 'That address didn’t take. One more try?' : ''}
      </p>
    </section>
  )
}

const Footer = () => (
  <footer className="footer grain">
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
      © {new Date().getFullYear()} Rangvanat · Khadi Art by Rangvesh.
      <span>Your address stays in Bardoli. No lists are sold, ever.</span>
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
        <Questions />
        <Pillars />
        <Faq />
        <Closing />
      </main>
      <Footer />
    </>
  )
}

export default App
