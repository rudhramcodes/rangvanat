import { Link } from 'react-router-dom'
import { Camera, Mail, MapPin, Phone } from 'lucide-react'

const EXPLORE = [
  { to: '/about', label: 'Our Story' },
  { to: '/collections', label: 'Collections' },
  { to: '/craftsmanship', label: 'The Craft' },
  { to: '/artisans', label: 'Artisans' },
  { to: '/contact', label: 'Contact' },
]

const Footer = () => {
  return (
    <footer className="grain bg-espresso text-ivory/70">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <img
            src="/images/full-logo.svg"
            alt="RANGVANAT — Khadi Art by Rangvesh"
            className="h-14 w-auto"
          />
          <p className="mt-6 max-w-sm font-sans text-sm font-light leading-relaxed text-ivory/60">
            The art of weaving colours into fabric, and fabric into stories. From the soil of
            Bardoli, to the world.
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brass">Explore</p>
          <ul className="mt-5 space-y-3">
            {EXPLORE.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="font-sans text-sm font-light transition-colors hover:text-champagne"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brass">Contact</p>
          <ul className="mt-5 space-y-3 font-sans text-sm font-light">
            <li className="flex items-center gap-3">
              <Mail size={15} className="shrink-0 text-brass" />
              <a href="mailto:hello@rangvanat.com" className="transition-colors hover:text-champagne">
                hello@rangvanat.com
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={15} className="shrink-0 text-brass" />
              <a href="tel:+910000000000" className="transition-colors hover:text-champagne">
                +91 00000 00000
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin size={15} className="shrink-0 text-brass" />
              Bardoli, Gujarat, India
            </li>
            <li className="flex items-center gap-3">
              <Camera size={15} className="shrink-0 text-brass" />
              <a
                href="https://instagram.com/rangvanat"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-champagne"
              >
                @rangvanat
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-5 font-sans text-xs font-light text-ivory/40 sm:flex-row sm:px-8">
          <p>© {new Date().getFullYear()} RANGVANAT — Khadi Art by Rangvesh. All rights reserved.</p>
          <p>Crafted with pride in Bardoli, Gujarat</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
