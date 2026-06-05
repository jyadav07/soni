import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function shareUrl(slug) {
  return `${window.location.origin}/s/${slug}`
}

function SkeletonCard() {
  return (
    <div className="rounded border bg-white p-5 space-y-3 animate-pulse" style={{ borderColor: '#C0C0C0' }}>
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
    <div className="flex flex-col rounded border bg-white transition-shadow hover:shadow-md" style={{ borderColor: '#C0C0C0' }}>

      {photos.length > 0 && (
        <div className="flex h-24 overflow-hidden rounded-t border-b" style={{ borderColor: '#C0C0C0' }}>
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
            <div className="flex w-12 flex-none items-center justify-center bg-gray-50 text-xs" style={{ color: '#C0C0C0' }}>
              +{photos.length - 4}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h2 className="text-[17px] font-medium leading-snug text-shoppi-ink">
            {item.item_name}
          </h2>
          {item.event_name && (
            <span className="mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium text-white" style={{ background: '#E8608A' }}>
              {item.event_name}
            </span>
          )}
          {item.caption && (
            <p className="mt-1 line-clamp-2 text-sm" style={{ color: '#888' }}>
              {item.caption}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span style={{ color: '#C0C0C0' }}>
            {views} {views === 1 ? 'view' : 'views'}
          </span>
          {(yesVotes + noVotes) > 0 && (
            <>
              <span className="font-medium" style={{ color: '#E8651A' }}>♥ {yesVotes}</span>
              <span className="rounded px-1.5 py-0.5 font-medium text-shoppi-ink" style={{ background: '#C5D93A' }}>
                {noVotes} no
              </span>
            </>
          )}
          {photos.length > 0 && (
            <span className="rounded px-1.5 py-0.5 font-medium text-white" style={{ background: '#E8608A' }}>
              {photos.length} {photos.length === 1 ? 'try-on' : 'try-ons'}
            </span>
          )}
        </div>

        <div className="flex items-stretch gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate rounded border bg-gray-50 px-3 py-2 font-mono text-xs transition-colors hover:text-shoppi-ink"
            style={{ borderColor: '#C0C0C0', color: '#999' }}
          >
            {url}
          </a>
          <button
            onClick={handleCopy}
            className="flex-none rounded border px-3 py-2 text-xs font-medium transition-colors"
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

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <p className="mb-2 text-[11px] font-medium tracking-widest" style={{ color: '#C0C0C0' }}>
        Nothing here yet
      </p>
      <h2 className="mb-6 text-[24px] font-medium text-shoppi-ink">
        Your wishlist is empty
      </h2>
      <Link
        to="/create"
        className="rounded-full px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-80"
        style={{ background: '#E8651A' }}
      >
        Create your first Shoppi
      </Link>
    </div>
  )
}

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
      .select(`*, votes ( vote ), tryon_photos ( photo_url )`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (err) setError(err.message)
    else setItems(data ?? [])
    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-57px)] bg-white">
      <div className="mx-auto max-w-4xl px-6 py-10">

        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1 text-[11px] font-medium tracking-widest" style={{ color: '#C0C0C0' }}>
              Your wishlist
            </p>
            <h1 className="text-[28px] font-medium text-shoppi-ink">Dashboard</h1>
          </div>
          <Link
            to="/create"
            className="rounded-full px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
            style={{ background: '#E8651A' }}
          >
            New Shoppi
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : items.length === 0
              ? <EmptyState />
              : items.map(item => <ItemCard key={item.id} item={item} />)
          }
        </div>

      </div>
    </div>
  )
}
