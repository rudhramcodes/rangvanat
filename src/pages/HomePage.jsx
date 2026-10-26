import { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import { api } from '../api/client.js';
import { useStore } from '../context/store.js';
import { COLLECTIONS } from '../lib/lookbook.js';
import './home.css';

const editImages = { flora: '/images/flora-editorial.png', sacred: '/images/bridal-edit.jpg', folk: '/images/statement-edit.jpg', heritage: '/images/heritage-main.jpg', denim: '/images/everyday-edit.jpg', modern: '/images/hero-editorial-couture.jpg' };
export default function HomePage({ navigate }) {
  const { addToast } = useStore();
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEdit, setActiveEdit] = useState('flora');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const root = useRef(null);
  useEffect(() => {
    let alive = true;
    Promise.allSettled([api.getCollections(), api.getFeaturedProducts()]).then(([cols, pieces]) => {
      if (!alive) return;
      if (cols.status === 'fulfilled') setCollections(cols.value);
      if (pieces.status === 'fulfilled') setProducts(pieces.value);
      setLoading(false);
    });
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    if (!window.IntersectionObserver || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.12 });
    root.current.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);
  const edits = collections.length ? collections.map(c => ({ ...c, id: c.collectionId })) : COLLECTIONS;
  const edit = edits.find(c => c.id === activeEdit) || edits[0];
  const shop = (extra = {}) => navigate({ page: 'shop', ...extra });
  async function subscribe(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.subscribeNewsletter(email.trim());
      if (!res?.success) throw new Error();
      setEmail('');
      addToast('Thank you for joining our atelier circle.', 'success');
    } catch { addToast('Could not subscribe. Please try again.', 'error'); }
    finally { setSubmitting(false); }
  }
  return <main id="main-content" className="rv-home" ref={root}>
    <section className="home-stage">
      <div className="stage-photo"><img src="/images/hero-editorial-couture.jpg" alt="Khadi jacket layered over a handwoven drape" fetchPriority="high" /></div>
      <div className="stage-reading">
        <div className="stage-intro">
          <h1>Khadi, <br />lived in.</h1>
          <p>Handspun clothing from Bardoli. Thoughtful silhouettes, botanical colour and the unmistakable texture of cloth made by hand.</p>
          <button className="home-action" onClick={() => shop()}>Discover the pieces <ArrowRight size={18} /></button>
          <a href="#edits" className="home-text-link">Find your edit</a>
        </div>
        <div className="stage-note" data-reveal>
          <img src="/images/heritage-detail.jpg" alt="A closer look at the texture and detail of Khadi" loading="lazy" />
          <div><h2>The human<br />touch</h2><p>Every slub, every weave, a trace of the hands that made it. Discover the beauty in cloth with a character of its own.</p><button className="home-text-link" onClick={() => navigate({ page: 'craft' })}>Meet the craft</button></div>
        </div>
      </div>
    </section>
    <section id="edits" className="home-edits home-section">
      <div className="home-section-heading" data-reveal><h2>Find your expression</h2><p>One cloth. A world of possibilities.</p></div>
      <div className="edit-stage">
        <div className="edit-photo" data-reveal><img key={edit.id} src={edit.coverImage || editImages[edit.id] || '/images/heritage-main.jpg'} alt={edit.name} loading="lazy" /></div>
        <div className="edit-content">
          <div className="edit-tabs" aria-label="Choose a collection">{edits.map(c => <button key={c.id} aria-pressed={edit.id === c.id} onClick={() => setActiveEdit(c.id)}>{c.name.replace(/^The /, '').replace(/ Edit$/, '')}</button>)}</div>
          <div key={edit.id} className="edit-description"><h3>{edit.name}</h3><p>{edit.mood}</p><button className="home-action" onClick={() => shop({ collection: edit.id })}>Explore this edit <ArrowRight size={18} /></button></div>
          <p className="edit-footnote">From the Rangvanat collection</p>
        </div>
      </div>
    </section>
    <section className="home-products home-section">
      <div className="home-section-heading" data-reveal><h2>Pieces to live in</h2><button className="home-text-link" onClick={() => shop()}>Shop all pieces</button></div>
      <div className="home-product-grid">{products.slice(0, 4).map((p, i) => <div key={p._id || p.slug} data-reveal style={{ '--reveal-delay': `${i * 75}ms` }}><ProductCard product={p} onSelect={id => navigate({ page: 'product', id })} /></div>)}</div>
      {!products.length && <div className="catalog-state" role="status"><p>{loading ? 'Gathering the latest pieces…' : 'The latest pieces are waiting in our catalog.'}</p><button className="home-text-link" onClick={() => shop()}>Browse the catalog</button></div>}
    </section>
    <section className="home-craft home-section">
      <div className="craft-heading" data-reveal><h2>From fibre<br />to feeling</h2><p>A slower way of making. A closer connection to what you wear.</p><button className="home-action" onClick={() => navigate({ page: 'craft' })}>Inside the craft <ArrowRight size={18} /></button></div>
      <div className="craft-stories">
        <article data-reveal><img src="/images/spinning.jpg" alt="Spinning cotton thread by hand" loading="lazy" /><h3>It begins with a thread</h3><p>Cotton spun on the charkha, then woven into cloth. The texture of Khadi starts here, with patient hands.</p></article>
        <article data-reveal><img src="/images/dyeing.jpg" alt="The botanical dyeing process" loading="lazy" /><h3>Colour, from nature</h3><p>Indigo, marigold and pomegranate bring their own character to the cloth. Botanical colour with depth you can feel.</p></article>
      </div>
    </section>
    <section className="home-letter home-section">
      <img src="/images/finishing.jpg" alt="Close-up of a woven textile" loading="lazy" data-reveal />
      <div data-reveal><h2>A letter from<br />the atelier</h2><p>New edits, stories from the loom and a closer look at what we’re making. Sent thoughtfully. Unsubscribe whenever you like.</p><form onSubmit={subscribe}><label htmlFor="home-email">Your email address</label><div className="letter-input"><input id="home-email" type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} /><button disabled={submitting} type="submit">{submitting ? 'Joining…' : 'Join the circle'} <ArrowRight size={18} /></button></div></form></div>
    </section>
    <div className="home-signature" aria-hidden="true">rangvanat</div>
  </main>;
}
