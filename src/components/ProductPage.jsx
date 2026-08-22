import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { animate } from 'animejs'
import { PRODUCTS, getCollection, productsByCollection } from '../lib/lookbook'
import { useReducedMotion } from '../lib/motion'

const Asset = ({ product, className = '' }) => (
  <div
    className={`asset-frame product-asset ${className}`}
    style={{ '--asset': `url(${product.image})` }}
    role="img"
    aria-label={product.name}
  >
    {!product.image && <span className="asset-placeholder-tag">Image coming soon</span>}
  </div>
)

const SpecList = ({ title, items }) => (
  <div className="lookbook-spec-group">
    <h4>{title}</h4>
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
)

const ProductPage = ({ productId }) => {
  const product = PRODUCTS.find((p) => p.id === productId)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !product) return undefined
    const tween = animate('.product-body, .product-asset', {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 480,
      ease: 'outQuad',
      delay: 80,
    })
    return () => tween.pause()
  }, [reduced, product])

  if (!product) {
    return (
      <div className="product-page min-h-[100svh] p-[64px_5vw_96px] bg-ivory max-lg:p-[48px_24px_72px] max-sm:p-[40px_20px_72px]">
        <div className="lookbook-empty grid justify-items-start gap-[14px] p-[72px_0]">
          <p className="eyebrow">Not found</p>
          <h2 className="m-0 text-[clamp(40px,4.5vw,60px)]">This piece could not be found.</h2>
          <p className="max-w-[460px] m-0 mb-[12px]">It may have been moved, or the link is incorrect.</p>
          <a className="cta cta-md" href="/?page=collections">
            <span className="cta-label">Back to the lookbook</span>
          </a>
        </div>
      </div>
    )
  }

  const collection = getCollection(product.collection)
  const related = productsByCollection(product.collection)
    .filter((p) => p.id !== product.id)
    .slice(0, 3)

  return (
    <div className="product-page min-h-[100svh] p-[64px_5vw_96px] bg-ivory max-lg:p-[48px_24px_72px] max-sm:p-[40px_20px_72px]">
      <a className="product-back inline-flex items-center gap-2 mb-[40px] text-[12px] tracking-[0.12em] uppercase text-brass no-underline hover:text-champagne hover:tracking-[0.16em] transition-all duration-250 max-sm:mb-[28px]" href="/?page=collections">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to the lookbook
      </a>

      <div className="product-grid grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-[56px] items-start max-lg:grid-cols-1 max-lg:gap-[40px]">
        <div className="product-media max-lg:static">
          <Asset product={product} className="aspect-[3/4] min-h-0 bg-parchment bg-cover bg-center bg-no-repeat" />
        </div>

        <div className="product-body pt-8 max-lg:pt-0">
          <div className="lookbook-modal-kicker flex flex-wrap items-center gap-[10px] mb-[20px] text-[10px] tracking-[0.16em] uppercase">
            <span className="lookbook-category px-[5px_10px] border border-brass/35 rounded-full text-espresso/70">{product.category}</span>
            {collection && <span className="lookbook-collection px-[5px_10px] border border-brass/35 rounded-full text-espresso/70">{collection.name}</span>}
          </div>

          <h2 className="mb-[10px] text-[clamp(36px,4vw,52px)]">{product.name}</h2>
          <p className="lookbook-tagline mb-[20px] font-display text-[22px] tracking-[0.02em] text-brass">{product.tagline}</p>

          <p className="lookbook-description mb-[28px] text-[15px] leading-[1.75] text-espresso/75">{product.description}</p>

          <div className="lookbook-specs grid grid-cols-2 gap-[32px] pt-[24px] border-t border-brass/22 max-lg:grid-cols-1 max-lg:gap-[24px]">
            <SpecList title="Inspired by" items={product.inspiredBy} />
            <SpecList title="Details" items={product.specs} />
          </div>

          <div className="lookbook-modal-cta mt-[32px]">
            <a
              className="cta cta-md font-sans font-semibold"
              href={`mailto:rangvanat@gmail.com?subject=Enquiry — ${product.code} ${product.name}`}
            >
              <span className="cta-label">Enquire about this piece</span>
            </a>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="product-related mt-[96px] pt-[48px] border-t border-brass/22" aria-labelledby="product-related-heading">
          <h3 id="product-related-heading" className="mb-[32px] text-[13px] tracking-[0.22em] uppercase text-brass">More from {collection ? collection.name : 'this collection'}</h3>
          <div className="lookbook-results lookbook-layout-grid product-related-grid grid grid-cols-3 gap-7 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {related.map((item) => {
              const col = getCollection(item.collection)
              return (
                <a className="lookbook-card flex flex-col cursor-pointer no-underline text-inherit" key={item.id} href={`/?page=product&id=${item.id}`}>
                  <Asset product={item} className="aspect-[3/4] min-h-0 bg-parchment" />
                  <div className="lookbook-card-body pt-4">
                    <span className="lookbook-card-cat inline-block text-[10px] tracking-[0.16em] uppercase text-brass mr-2.5">{item.category}</span>
                    {col && <span className="lookbook-card-col inline-block text-[10px] tracking-[0.16em] uppercase text-espresso/50">{col.name}</span>}
                    <h3 className="mt-[10px] mb-[6px] text-[22px] max-sm:text-[28px]">{item.name}</h3>
                    <p className="m-0 mb-[10px] text-[13px] italic text-espresso/60 max-sm:text-[14px] max-sm:max-w-[520px]">{item.tagline}</p>
                    <span className="lookbook-card-enquire text-[11px] tracking-[0.14em] uppercase text-brass transition-[letter-spacing] duration-200 group-hover:tracking-[0.2em] max-sm:text-[14px]">View details →</span>
                  </div>
                </a>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductPage