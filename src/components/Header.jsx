import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Button from './Button'

const NAV = [
  { to: '/about', label: 'Our Story' },
  { to: '/collections', label: 'Collections' },
  { to: '/craftsmanship', label: 'The Craft' },
  { to: '/artisans', label: 'Artisans' },
  { to: '/contact', label: 'Contact' },
]

const Header = () => {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const linkColor = scrolled ? 'text-espresso/70 hover:text-terracotta' : 'text-espresso/75 hover:text-terracotta'

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || open ? 'bg-ivory/90 shadow-[0_1px_0_rgba(184,134,58,0.25)] backdrop-blur' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" aria-label="RANGVANAT — home">
          <img
            src="/images/logo-only.svg"
            alt="RANGVANAT — Khadi Art by Rangvesh"
            className="h-14 w-auto sm:h-16"
          />
        </Link>

        <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`relative text-[11px] font-medium uppercase tracking-[0.25em] transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-terracotta after:transition-all after:duration-300 hover:after:w-full ${linkColor}`}
            >
              {item.label}
            </Link>
          ))}
          <Button to="/contact" size="sm">
            Enquire
          </Button>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className={`lg:hidden text-oxblood`}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <nav className="grain border-t border-brass/20 bg-ivory px-5 pb-6 pt-3 lg:hidden" aria-label="Mobile">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block border-b border-parchment py-3.5 text-xs font-medium uppercase tracking-[0.25em] text-espresso hover:text-terracotta"
            >
              {item.label}
            </Link>
          ))}
          <Button
            to="/contact"
            size="sm"
            onClick={() => setOpen(false)}
            className="mt-5 w-full"
          >
            Enquire
          </Button>
        </nav>
      )}
    </header>
  )
}

export default Header
