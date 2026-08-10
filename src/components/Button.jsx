import { ArrowRight } from 'lucide-react'

const Button = ({
  href = '#',
  type = 'button',
  onClick,
  children,
  className = '',
  size = 'md',
  variant = 'primary',
  dark = false,
  arrow = false,
}) => {
  const cls = `btn ${variant === 'ghost' ? 'btn-ghost' : 'btn-primary'} ${
    dark ? 'btn-dark' : ''
  } ${size === 'sm' ? 'btn-sm' : ''} ${className}`

  const content = (
    <>
      <span aria-hidden className="btn-underline" />
      <span className="btn-label">{children}</span>
      {arrow && (
        <span aria-hidden className="btn-arrow">
          <ArrowRight size={15} strokeWidth={1.5} />
        </span>
      )}
    </>
  )

  return (
    <a href={href} onClick={onClick} className={cls}>
      {content}
    </a>
  )
}

export default Button
