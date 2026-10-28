import { resolveContentPages } from '../../shared/contentPages.js';
import { useStore } from '../context/store';
export default function ContentPage({ slug }) {
  const { settings } = useStore();
  const pages = settings ? resolveContentPages(settings.pages) : [];
  const page = pages.find(p => p.slug === slug && p.published !== false);
  return <main id="main-content" className="reading-page"><aside><a href="/">← Back to Rangvanat</a>{pages.filter(p => p.published !== false).map(p => <a href={`/pages/${p.slug}`} key={p.slug} aria-current={p.slug === slug ? 'page' : undefined}>{p.title}</a>)}</aside><article><h1>{page?.title || (settings ? 'Page unavailable' : 'Loading…')}</h1>{page?.body?.split('\n').filter(line => line.trim()).map((line, i) => line.startsWith('## ') ? <h2 key={i}>{line.slice(3)}</h2> : <p key={i}>{line}</p>)}{page && <a className="story-link" href="/contact">Contact the studio ↗</a>}</article></main>;
}
