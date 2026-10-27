import { ArrowRight } from 'lucide-react';

export default function OurStoryPage({ navigate }) {
  return <main id="main-content" className="story-page">
    <section className="story-intro">
      <div><nav className="screen-breadcrumb" aria-label="Breadcrumb"><a href="/" onClick={e => { e.preventDefault(); navigate({ page: 'home' }); }}>Home</a><span>/</span><span>Our story</span></nav><h1>A slower rhythm.<br /><em>A lasting feeling.</em></h1><p>Rangvanat began with a quiet reverence for the loom. From Bardoli, we bring handspun cloth into the everyday—through thoughtful silhouettes, texture and colour.</p><button className="story-link" onClick={() => navigate({ page: 'craft' })}>Meet the craft <ArrowRight size={20} /></button></div>
      <figure><img src="/images/founder-rachana-kapadia.jpg" alt="Rachana Kapadia, founder of Rangvanat" /><figcaption>Rachana Kapadia · Founder, Rangvanat</figcaption></figure>
    </section>
    <section className="story-letter"><p>Our point of view</p><h2>Clothing begins with cloth.<br />And cloth begins with people.</h2><div><p>The character of Khadi is in its texture: the small variations in a thread, the touch of the weaver and the way the fabric moves with you.</p><p>We design around that character. Pieces to wear often, care for thoughtfully, and make your own.</p></div></section>
    <section className="story-craft"><img src="/images/heritage-main.jpg" alt="The tools and textures of the handloom" loading="lazy" /><div><h2>From the loom,<br />into your life.</h2><p>Spinning, dyeing, weaving and finishing. Follow the processes that give our pieces their distinctive feel.</p><button className="story-link" onClick={() => navigate({ page: 'craft' })}>Explore the making <ArrowRight size={20} /></button></div></section>
    <section className="editorial-close"><h2>Find a piece of your story.</h2><button className="btn-primary" onClick={() => navigate({ page: 'shop' })}>Explore the collection <ArrowRight size={18} /></button></section>
  </main>;
}
