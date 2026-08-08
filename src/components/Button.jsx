import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const Button = ({
  to,
  href,
  type = 'button',
  onClick,
  children,
  className = '',
  size = 'md',
  dark = false,
  arrow = false,
}) => {
  const cls = `btn-khadi group relative inline-flex select-none items-center justify-center gap-3 overflow-hidden border font-semibold uppercase tracking-[0.3em] text-espresso ${
    dark ? 'border-ivory/25' : 'border-espresso/15'
  } ${size === 'sm' ? 'px-6 py-2.5 text-[11px] tracking-[0.25em]' : 'px-8 py-4 text-[11px]'} ${className}`

  const content = (
    <>
      <span aria-hidden className="btn-stitch" />
      <span className="relative z-10 transition-all duration-300 group-hover:tracking-[0.36em] group-hover:text-heritage">
        {children}
      </span>
      {arrow && (
        <ArrowRight size={15} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1.5" />
      )}
    </>
  )

  if (to) {
    return (
      <Link to={to} onClick={onClick} className={cls}>
        {content}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} onClick={onClick} className={cls}>
        {content}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} className={cls}>
      {content}
    </button>
  )
}

export default Button
