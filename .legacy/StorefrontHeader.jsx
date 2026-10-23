import { useRef } from 'react'
import { Menu, X } from 'lucide-react'
import './storefront.css'

const links = [
  { label: 'Shop', href: '/?page=collections' },
  { label: 'Collections', href: '/#collections' },
  { label: 'Our craft', href: '/#craft' },
  { label: 'About us', href: '/#story' },
  { label: 'Contact us', href: '/#contact' },
]

export default function StorefrontHeader() {
  const menuRef = useRef(null)
  const cartRef = useRef(null)

  return (
    <>
      <a className="store-skip" href="#main-content" onClick={(event) => { event.preventDefault(); document.getElementById('main-content')?.focus() }}>Skip to content</a>
      <header className="site-header store-header">
        <a className="store-wordmark" href="/" aria-label="Rangvanat home">RANGVANAT</a>
        <nav className="store-nav" aria-label="Primary navigation">
          {links.map(({ label, href }) => <a key={label} href={href}>{label}</a>)}
        </nav>
        <div className="store-actions">
          <span className="store-market" aria-label="India, Indian rupees">IN — INR (₹)</span>
          <button className="store-cart" onClick={() => cartRef.current.showModal()} aria-haspopup="dialog">[ Cart 0 ]</button>
          <button className="store-menu-toggle" onClick={() => menuRef.current.showModal()} aria-label="Open navigation" aria-haspopup="dialog">
            <Menu size={23} aria-hidden="true" />
          </button>
        </div>
      </header>
      <dialog ref={menuRef} className="store-dialog store-menu" aria-labelledby="store-menu-title">
        <div className="store-dialog-top">
          <span id="store-menu-title">RANGVANAT</span>
          <button onClick={() => menuRef.current.close()} aria-label="Close navigation"><X aria-hidden="true" /></button>
        </div>
        <nav aria-label="Mobile navigation">
          {links.map(({ label, href }) => <a key={label} href={href} onClick={() => menuRef.current.close()}>{label}</a>)}
        </nav>
        <p>Khadi art from Bardoli, India.</p>
        <span>IN — INR (₹)</span>
      </dialog>
      <dialog ref={cartRef} className="store-dialog store-bag" aria-labelledby="store-cart-title">
        <div className="store-dialog-top">
          <h2 id="store-cart-title">Your cart</h2>
          <button onClick={() => cartRef.current.close()} aria-label="Close cart"><X aria-hidden="true" /></button>
        </div>
        <div className="store-bag-content">
          <p>Your cart is empty.</p>
          <p>Discover khadi, made with a story.</p>
          <a className="store-text-link" href="/?page=collections" onClick={() => cartRef.current.close()}>Explore collections <span aria-hidden="true">↗</span></a>
          <p className="store-bag-note">Online checkout is coming soon. For now, enquire about a piece from its product page.</p>
        </div>
      </dialog>
    </>
  )
}
