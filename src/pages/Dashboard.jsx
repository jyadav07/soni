import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const serif = { fontFamily: "'DM Serif Display', serif" }

// ── Helpers ────────────────────────────────────────────────────────────────────
function shareUrl(slug) {
  return `${window.location.origin}/s/${slug}`
}

function formatCount(n) {
  return n === 1 ? '1' : String(n)
}

// ── Skeleton card ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded border border-stash-silver bg-white p-5 space-y-3 animate-pulse">
      <div className="h-5 w-2/3 rounded bg-gray-100" />
      <div className="h-3 w-full rounded bg-gray-100" />
      <div className="h-3 w-1/2 rounded bg-gray-100" />
      <div className="mt-4 flex gap-3">
        <div className="h-8 flex-1 rounded bg-gray-100" />
        <div className="h-8 w-20 rounded bg-gray-100" />
      </div>
    </div>
  )
}

// ── Item card ──────────────────────────────────────────────────────────────────
function ItemCard({ item }) {
  const [copied, setCopied] = useState(false)

  const url      = shareUrl(item.slug)
  const yesVotes = item.votes?.filter(v => v.vote === true).length  ?? 0
  const noVotes  = item.votes?.filter(v => v.vote === false).length ?? 0
  const photos   = item.tryon_photos ?? []
  const views    = item.view_count ?? 0

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col rounded border border-stash-silver bg-white transition-shadow hover:shadow-md">

      {/* Try-on thumbnails strip — shown only when photos exist */}
      {photos.length > 0 && (
        <div className="flex h-24 overflow-hidden rounded-t border-b border-stash-silver">
          {photos.slice(0, 4).map((p, i) => (
            <div
              key={i}
              className="flex-1 overflow-hidden"
              style={{ borderRight: i < Math.min(photos.length, 4) - 1 ? '1px solid #C0C0C0' : 'none' }}
            >
              <img src={p.photo_url} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
          {photos.length > 4 && (
            <div className="flex w-12 flex-none items-center justify-center bg-gray-50 text-xs font-bold text-stash-silver">
              +{photos.length - 4}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Name + caption */}
        <div>
          <h2
            className="text-xl leading-snug text-stash-black"
            style={serif}
          >
            {item.item_name}
          </h2>
          {item.caption && (
            <p className="mt-1 line-clamp-2 text-sm text-stash-black/50">
              {item.caption}
            </p>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
          {/* Views */}
          <span className="text-stash-silver">
            {formatCount(views)} {views === 1 ? 'view' : 'views'}
          </span>

          {/* YES votes */}
          {(yesVotes + noVotes) > 0 && (
            <>
              <span style={{ color: '#E8651A' }}>♥ {yesVotes}</span>
              <span
                className="rounded px-1.5 py-0.5 text-stash-black"
                style={{ background: '#C5D93A' }}
              >
                {noVotes} no
              </span>
            </>
          )}

          {/* Photo count badge */}
          {photos.length > 0 && (
            <span
              className="rounded px-1.5 py-0.5 text-white"
              style={{ background: '#E8608A' }}
            >
              {photos.length} {photos.length === 1 ? 'try-on' : 'try-ons'}
            </span>
          )}
        </div>

        {/* Shareable link row */}
        <div className="flex items-stretch gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate rounded border border-stash-silver bg-gray-50 px-3 py-2 font-mono text-xs text-stash-black/60 hover:text-stash-black transition-colors"
          >
            {url}
          </a>
          <button
            onClick={handleCopy}
            className="flex-none rounded border px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
            style={{
              borderColor: copied ? '#E8651A' : '#E8608A',
              color:       copied ? '#E8651A' : '#E8608A',
            }}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-stash-silver">
        Nothing here yet
      </p>
      <h2 className="mb-6 text-3xl text-stash-black" style={serif}>
        Your wishlist is empty
      </h2>
      <Link
        to="/create"
        className="rounded px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-80"
        style={{ background: '#E8651A' }}
      >
        + New Stash link
      </Link>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!supabase) {
      setError('Supabase is not configured.')
      setLoading(false)
      return
    }
    loadItems()
  }, [])

  async function loadItems() {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id

    const { data, error: err } = await supabase
      .from('items')
      .select(`
        *,
        votes ( vote ),
        tryon_photos ( photo_url )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setItems(data ?? [])
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-57px)] bg-white">
      <div className="mx-auto max-w-4xl px-6 py-10">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-stash-silver">
              Your wishlist
            </p>
            <h1 className="text-4xl text-stash-black" style={serif}>
              Dashboard
            </h1>
          </div>

          <Link
            to="/create"
            className="rounded px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-80"
            style={{ background: '#E8651A' }}
          >
            + New Stash link
          </Link>
        </div>

        {/* ── Error ─────────────────────────────────────────────────────── */}
        {error && (
          <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ── Grid ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            items.map(item => <ItemCard key={item.id} item={item} />)
          )}
        </div>

      </div>
    </div>
  )
}
