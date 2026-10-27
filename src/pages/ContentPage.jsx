import { useStore } from '../context/store';
export default function ContentPage({ slug }) {
  const { settings } = useStore();
  const page = settings?.pages?.find(p => p.slug === slug && p.published !== false);
  return <main id="main-content" className="reading-page"><aside><a href="/">← Back to Rangvanat</a>{settings?.pages?.filter(p => p.published !== false).map(p => <a href={`/pages/${p.slug}`} key={p.slug} aria-current={p.slug === slug ? 'page' : undefined}>{p.title}</a>)}</aside><article><h1>{page?.title || (settings ? 'Page unavailable' : 'Loading…')}</h1>{page?.body?.split('\n').map((paragraph, i) => <p key={i}>{paragraph}</p>)}</article></main>;
}
