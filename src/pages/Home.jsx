import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center bg-white px-6 text-center">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-stash-silver">
        Your personal wishlist
      </p>
      <h1
        className="mb-6 text-5xl leading-tight text-stash-black"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        Share what you want.<br />Get what you love.
      </h1>
      <p className="mb-10 max-w-sm text-base text-stash-black/60">
        Add any item from any store, share the link, and let your people vote on it.
      </p>
      <Link
        to="/create"
        className="rounded px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-80"
        style={{ background: '#E8651A' }}
      >
        Add to wishlist
      </Link>
    </div>
  )
}
