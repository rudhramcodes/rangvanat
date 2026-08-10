import { useState } from 'react'
import { Mail, Phone, MapPin, ChevronDown } from 'lucide-react'
import Button from './Button'

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
  </svg>
)

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
    <path d="M14 8h3V5h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1Z" />
  </svg>
)

const SOCIALS = [
  { href: 'https://instagram.com/rangvanat', label: 'Instagram', Icon: InstagramIcon },
  { href: 'https://facebook.com/rangvanat', label: 'Facebook', Icon: FacebookIcon },
]

const EXPLORE = [
  { href: '#story', label: 'Story' },
  { href: '#craft', label: 'Craft' },
  { href: '#artisans', label: 'Artisans' },
  { href: '#collections', label: 'Collections' },
  { href: '#contact', label: 'Contact' },
]

const Accordion = ({ title, children }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-champagne/10 lg:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 lg:cursor-default lg:py-0"
      >
        <p className="eyebrow text-brass">{title}</p>
        <ChevronDown
          size={16}
          className={`text-brass transition-transform duration-300 lg:hidden ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-500 ${open ? 'pb-5' : 'max-h-0 lg:max-h-none lg:pb-0'}`}>
        {children}
      </div>
    </div>
  )
}

const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [joined, setJoined] = useState(false)

  if (joined)
    return (
      <p className="font-display text-lg italic text-champagne">Thank you — welcome to the journey.</p>
    )

  return (
    <form
      className="flex items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        if (email.trim()) setJoined(true)
      }}
    >
      <label htmlFor="footer-email" className="sr-only">
        Email address
      </label>
      <input
        id="footer-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="input-line input-line-dark flex-1"
      />
      <Button type="submit" size="sm" className="shrink-0">
        Join the Journey
      </Button>
    </form>
  )
}

const Footer = () => {
  return (
    <footer id="contact" className="grain relative overflow-hidden bg-espresso">
      <span className="ghost-wordmark" aria-hidden>
        RANGVANAT
      </span>
      <div className="page-x relative grid gap-10 pb-16 pt-20 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.2fr_1.4fr]">
        <div>
          <a href="#top" aria-label="RANGVANAT — home">
            <img
              src="/images/logo-only.svg"
              alt="RANGVANAT — Khadi Art by Rangvesh"
              className="h-10 w-auto brightness-0 invert"
            />
          </a>
          <p className="type-sub mt-6 max-w-xs text-champagne/80">
            The art of weaving colours into fabric, and fabric into stories.
          </p>
          <div className="mt-8 flex gap-5">
            {SOCIALS.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="text-champagne transition-colors duration-300 hover:text-terracotta"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        <div className="lg:pt-2">
          <Accordion title="Explore">
            <ul className="mt-1 space-y-3">
              {EXPLORE.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="caption text-champagne/70 transition-colors hover:text-champagne"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </Accordion>
        </div>

        <div className="lg:pt-2">
          <Accordion title="Reach Us">
            <ul className="mt-1 space-y-3 caption text-champagne/70">
              <li className="flex items-start gap-3">
                <MapPin size={15} strokeWidth={1} className="mt-1 shrink-0 text-brass" />
                Bardoli, Gujarat, India
              </li>
              <li className="flex items-start gap-3">
                <Mail size={15} strokeWidth={1} className="mt-1 shrink-0 text-brass" />
                <a href="mailto:hello@rangvanat.com" className="transition-colors hover:text-champagne">
                  hello@rangvanat.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={15} strokeWidth={1} className="mt-1 shrink-0 text-brass" />
                <a href="tel:+910000000000" className="transition-colors hover:text-champagne">
                  +91 00000 00000
                </a>
              </li>
            </ul>
          </Accordion>
        </div>

        <div className="lg:pt-2">
          <Accordion title="Newsletter">
            <p className="caption mb-5 mt-1 text-champagne/70">
              Be the first to hear when a new Rangvanat story is ready to be told.
            </p>
            <Newsletter />
          </Accordion>
        </div>
      </div>

      <div className="page-x relative border-t border-champagne/15 py-6">
        <div className="flex flex-col items-center justify-between gap-2 caption text-champagne/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Rangvanat — Khadi Art by Rangvesh.</p>
          <p>Handwoven in Bardoli</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
