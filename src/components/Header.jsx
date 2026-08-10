import { useEffect, useState } from 'react'
import Button from './Button'

const NAV = [
  { href: '#story', label: 'Story' },
  { href: '#craft', label: 'Craft' },
  { href: '#artisans', label: 'Artisans' },
  { href: '#collections', label: 'Collections' },
  { href: '#contact', label: 'Contact' },
]

const Header = () => {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const solid = scrolled && !open

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid
          ? 'border-b border-brass/40 bg-parchment'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="page-x flex items-center justify-between py-4">
        <a href="#top" aria-label="RANGVANAT — home" onClick={() => setOpen(false)}>
          <img
            src="/images/logo-only.svg"
            alt="RANGVANAT — Khadi Art by Rangvesh"
            className={`h-9 w-auto transition-all duration-500 ${
              solid || open ? '' : 'brightness-0 invert'
            }`}
          />
        </a>

        <nav className="hidden items-center gap-10 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`nav-link relative transition-colors duration-500 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-terracotta after:transition-all after:duration-300 hover:after:w-full ${
                solid ? 'text-espresso/70 hover:text-terracotta' : 'text-champagne hover:text-champagne'
              }`}
            >
              {item.label}
            </a>
          ))}
          <Button href="#contact" size="sm" variant="ghost" dark={!solid}>
            Enquire
          </Button>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="flex flex-col items-end gap-[6px] p-2 lg:hidden"
        >
          <span
            className={`block h-px w-7 bg-champagne transition-transform duration-300 ${
              open ? 'translate-y-[7px] rotate-45' : ''
            }`}
          />
          <span
            className={`block h-px bg-champagne transition-all duration-300 ${
              open ? 'w-7 -translate-y-[7px] -rotate-45' : 'w-5'
            }`}
          />
        </button>
      </div>

      {open && (
        <div className="grain fixed inset-0 -z-10 flex flex-col bg-oxblood">
          <nav className="flex flex-1 flex-col justify-center gap-2 px-8" aria-label="Mobile">
            {NAV.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="nav-open border-b border-champagne/10 py-4 font-display text-4xl font-medium text-champagne transition-colors hover:text-brass"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="px-8 pb-10">
            <Button
              href="#contact"
              size="sm"
              onClick={() => setOpen(false)}
              className="w-full"
              variant="ghost"
              dark
            >
              Enquire
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
