export default function Pagination({ page, total, pageSize, onChange, disabled = false }: { page: number; total: number; pageSize: number; onChange: (page: number) => void; disabled?: boolean }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pages);
  if (!total) return null;
  const numbers = Array.from({ length: pages }, (_, i) => i + 1).filter(n => n === 1 || n === pages || Math.abs(n - current) <= 1);
  return <nav className="rv-pagination" aria-label="Pagination"><p aria-live="polite">{(current - 1) * pageSize + 1}–{Math.min(current * pageSize, total)} of {total}</p><div className="rv-pagination-controls"><button type="button" disabled={disabled || current === 1} onClick={() => onChange(current - 1)} aria-label="Previous page">←<span> Previous</span></button>{numbers.map((n, i) => <span className="rv-pagination-slot" key={n}>{i > 0 && n - numbers[i - 1] > 1 && <span className="rv-pagination-gap">…</span>}<button type="button" aria-label={`Page ${n}`} aria-current={n === current ? 'page' : undefined} disabled={disabled} onClick={() => onChange(n)}>{n}</button></span>)}<button type="button" disabled={disabled || current === pages} onClick={() => onChange(current + 1)} aria-label="Next page"><span>Next </span>→</button></div></nav>;
}
