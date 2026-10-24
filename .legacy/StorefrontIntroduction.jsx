import { useLayoutEffect, useRef } from 'react'
import { gsap, useReducedMotion } from '../lib/motion'
import { PRODUCTS } from '../lib/lookbook'
import './storefront.css'

const floraCount = PRODUCTS.filter((product) => product.collection === 'flora').length
const featuredIds = ['rvb-01', 'rvb-02', 'rvj-01', 'rvj-07', 'rvcs-04', 'rvd-04']
const featuredProducts = featuredIds.map((id) => PRODUCTS.find((product) => product.id === id)).filter(Boolean)
const additionalIds = ['rvm-01', 'rvm-02', 'rvj-03', 'rvc-02']
const additionalProducts = additionalIds.map((id) => PRODUCTS.find((product) => product.id === id)).filter(Boolean)

export default function StorefrontIntroduction() {
  const sectionRef = useRef(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    if (reduced) return
    const context = gsap.context(() => {
      gsap.utils.toArray('.store-introduction-row').forEach((row) => {
        gsap.timeline({
          defaults: { duration: 0.9, ease: 'power3.out' },
          scrollTrigger: { trigger: row, start: 'top 82%', once: true },
        })
          .from(row.querySelectorAll('.store-introduction-copy > *'), { y: 24, opacity: 0, stagger: 0.1 }, 0)
        row.querySelectorAll('.store-introduction-media').forEach((media) => {
          gsap.from(media, { y: 36, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: media, start: 'top 90%', once: true } })
        })
      })
    }, sectionRef)
    return () => context.revert()
  }, [reduced])

  return (
    <section ref={sectionRef} className="store-introduction" aria-labelledby="store-introduction-title">
      <div className="store-introduction-row">
      <div className="store-introduction-copy">
        <h2 id="store-introduction-title">Our pieces and<br />collections</h2>
        <p>Handwoven khadi.<br />Made for the everyday.</p>
        <a className="store-text-link" href="/?page=collections">Discover Products <span aria-hidden="true">↗</span></a>
      </div>
      <figure className="store-introduction-media">
        <img src="/images/khadi-editorial-diptych.png" alt="Khadi campaign study: an ivory embroidered jacket worn from the back, alongside a front view showing its wooden buttons and botanical details." width="1536" height="1024" loading="lazy" decoding="async" />
      </figure>
      </div>
      <div className="store-introduction-row">
        <div className="store-introduction-copy">
          <h3>The Flora Edit<br />({floraCount} pieces)</h3>
          <p>Birds, blooms and botanical details. Discover khadi pieces that bring a little of the garden into your everyday.</p>
          <a className="store-text-link" href="/?page=collections&collection=flora">Explore the edit <span aria-hidden="true">↗</span></a>
        </div>
        <div className="store-introduction-media store-flora-media">
          <img src="/images/flora-editorial.png" alt="Flora campaign concept: an Indian model wearing an ivory khadi jacket with oxblood botanical embroidery and espresso trousers." width="1024" height="1280" loading="lazy" decoding="async" />
          <details className="store-outfit-detail store-outfit-detail--jacket">
            <summary aria-label="Explore botanical details"><span className="store-outfit-dot" /></summary>
            <div className="store-outfit-note">
              <h4>Botanical details</h4>
              <p>Birds and blossoms inspire the Flora Edit.</p>
              <a href="/?page=collections&collection=flora">View collection ↗</a>
            </div>
          </details>
          <details className="store-outfit-detail store-outfit-detail--trousers">
            <summary aria-label="Explore everyday khadi"><span className="store-outfit-dot" /></summary>
            <div className="store-outfit-note">
              <h4>Everyday khadi</h4>
              <p>Explore separates and co-ords in the full collection.</p>
              <a href="/?page=collections">Discover pieces ↗</a>
            </div>
          </details>
        </div>
      </div>
      <div className="store-introduction-row store-products-row">
        <div className="store-introduction-copy">
          <h3>Selected pieces<br />Rangvanat ({featuredProducts.length})</h3>
          <p>Khadi separates, embroidered jackets and nature-inspired prints. Six pieces to make your own.</p>
          <a className="store-text-link" href="/?page=collections">See more <span aria-hidden="true">↗</span></a>
        </div>
        <div className="store-selected-grid">
          {featuredProducts.map((product) => (
            <a key={product.id} className="store-selected-product" href={`/?page=product&id=${product.id}`}>
              <div className="store-introduction-media store-selected-media">
                <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
              </div>
              <h4>{product.name}</h4>
              <p>Price on enquiry</p>
            </a>
          ))}
        </div>
      </div>
      <div className="store-selected-grid store-additional-products" role="group" aria-label="More Rangvanat pieces">
        {additionalProducts.map((product) => (
          <a key={product.id} className="store-selected-product" href={`/?page=product&id=${product.id}`}>
            <div className="store-introduction-media store-selected-media">
              <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
            </div>
            <h4>{product.name}</h4>
            <p>Price on enquiry</p>
          </a>
        ))}
      </div>
    </section>
  )
}
