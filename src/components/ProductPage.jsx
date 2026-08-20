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
      <div className="product-page">
        <div className="lookbook-empty">
          <p className="eyebrow">Not found</p>
          <h2>This piece could not be found.</h2>
          <p>It may have been moved, or the link is incorrect.</p>
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
    <div className="product-page">
      <a className="product-back" href="/?page=collections">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to the lookbook
      </a>

      <div className="product-grid">
        <div className="product-media">
          <Asset product={product} />
        </div>

        <div className="product-body">
          <div className="lookbook-modal-kicker">
            <span className="lookbook-code">{product.code}</span>
            <span className="lookbook-category">{product.category}</span>
            {collection && <span className="lookbook-collection">{collection.name}</span>}
          </div>

          <h2>{product.name}</h2>
          <p className="lookbook-tagline">{product.tagline}</p>

          <p className="lookbook-description">{product.description}</p>

          <div className="lookbook-specs">
            <SpecList title="Inspired by" items={product.inspiredBy} />
            <SpecList title="Details" items={product.specs} />
          </div>

          <div className="lookbook-modal-cta">
            <a
              className="cta cta-md"
              href={`mailto:rangvanat@gmail.com?subject=Enquiry — ${product.code} ${product.name}`}
            >
              <span className="cta-label">Enquire about this piece</span>
            </a>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="product-related" aria-labelledby="product-related-heading">
          <h3 id="product-related-heading">More from {collection ? collection.name : 'this collection'}</h3>
          <div className="lookbook-results lookbook-layout-grid product-related-grid">
            {related.map((item) => {
              const col = getCollection(item.collection)
              return (
                <a className="lookbook-card" key={item.id} href={`/?page=product&id=${item.id}`}>
                  <Asset product={item} />
                  <div className="lookbook-card-body">
                    <span className="lookbook-card-cat">{item.category}</span>
                    {col && <span className="lookbook-card-col">{col.name}</span>}
                    <h3>{item.name}</h3>
                    <p>{item.tagline}</p>
                    <span className="lookbook-card-enquire">View details →</span>
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