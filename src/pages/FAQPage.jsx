import { CONTENT_PAGES } from '../../shared/contentPages.js';

export default function FAQPage({ navigate }) {
  const sections = CONTENT_PAGES.find(p => p.slug === 'faq').body.split('\n## ').slice(1);
  const FAQ_GROUPS = [{category: 'Shopping & order help', items: sections.map(section => {
    const [q, ...answer] = section.split('\n');
    return {q, a: answer.join(' ')};
  })}];
  return <main id="main-content" className="faq-layout">
    <header><nav className="screen-breadcrumb" aria-label="Breadcrumb"><a href="/" onClick={e => { e.preventDefault(); navigate({ page: 'home' }); }}>Home</a><span>/</span><span>Help</span></nav><h1>A little<br /><em>clarity.</em></h1><p>Everything you need to know about your pieces, from finding the right fit to caring for them.</p><button className="story-link" onClick={() => navigate({ page: 'contact' })}>Talk to our atelier ↗</button></header>
    <div>{FAQ_GROUPS.map(group => <section className="faq-group" key={group.category}><h2>{group.category}</h2>{group.items.map(item => <details key={item.q}><summary>{item.q}<span aria-hidden="true">+</span></summary><p>{item.a}</p></details>)}</section>)}</div>
  </main>;
}
