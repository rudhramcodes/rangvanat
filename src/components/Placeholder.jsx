import { ArrowLeft } from 'lucide-react'
import Button from './Button'

const Placeholder = ({ title, tagline }) => {
  return (
    <section className="grain flex min-h-screen items-center justify-center bg-espresso px-5 pb-16 pt-32 text-center">
      <div>
        <img
          src="/images/full-logo.svg"
          alt="RANGVANAT — Khadi Art by Rangvesh"
          className="mx-auto h-12 w-auto opacity-90"
        />
        <h1 className="mt-8 font-display text-4xl text-ivory sm:text-6xl">{title}</h1>
        <p className="mx-auto mt-5 max-w-md font-sans text-sm font-light leading-relaxed text-ivory/60">
          {tagline || 'This page is coming soon. The story is being woven right now.'}
        </p>
        <Button to="/" className="mt-10">
          <ArrowLeft size={15} />
          Back to Home
        </Button>
      </div>
    </section>
  )
}

export default Placeholder
