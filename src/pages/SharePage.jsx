import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ── Brand palette ──────────────────────────────────────────────────────────────
const ORANGE = '#E8651A'
const PINK = '#E8608A'
const CHARTREUSE = '#C5D93A'
const SILVER_GRADIENT = 'linear-gradient(135deg,#d4d4d4 0%,#f0f0f0 30%,#b0b0b0 50%,#e8e8e8 70%,#d0d0d0 100%)'

// ── Helpers ────────────────────────────────────────────────────────────────────
function getVoterId() {
  let id = localStorage.getItem('stash_voter_id')
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('stash_voter_id', id)
  }
  return id
}

async function fetchOgImage(url) {
  try {
    const res = await fetch(
      `https://api.microlink.io/?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(6000) }
    )
    const json = await res.json()
    return json?.data?.image?.url ?? null
  } catch {
    return null
  }
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="aspect-square w-full animate-pulse rounded-3xl bg-gray-100" />
        <div className="h-8 w-3/4 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-4 w-full animate-pulse rounded-lg bg-gray-100" />
        <div className="h-4 w-2/3 animate-pulse rounded-lg bg-gray-100" />
        <div className="mt-6 flex gap-3">
          <div className="h-16 flex-1 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-16 flex-1 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <p className="text-6xl">🤷‍♀️</p>
      <h1 className="text-2xl font-extrabold text-gray-900">Link not found</h1>
      <p className="text-gray-400">This wishlist item may have been removed.</p>
      <Link
        to="/"
        className="mt-2 rounded-full px-6 py-2.5 text-sm font-bold text-white"
        style={{ background: PINK }}
      >
        Go to Stash
      </Link>
    </div>
  )
}

function VoteTally({ votes, voted }) {
  const total = votes.yes + votes.no
  const yesPercent = total > 0 ? Math.round((votes.yes / total) * 100) : 50

  return (
    <div className="mt-5 space-y-3">
      <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400">
        {total} {total === 1 ? 'vote' : 'votes'} so far
      </p>

      {/* Bar */}
      <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${yesPercent}%`, background: PINK }}
        />
      </div>

      <div className="flex justify-between text-sm font-bold">
        <span style={{ color: PINK }}>♥ {votes.yes} yes</span>
        <span style={{ color: CHARTREUSE === '#C5D93A' ? '#8a9a1a' : CHARTREUSE }}>
          ✕ {votes.no} no
        </span>
      </div>

      {voted !== null && (
        <p className="text-center text-xs text-gray-400">
          You voted <strong>{voted ? 'YES ♥' : 'NO'}</strong>
        </p>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function SharePage() {
  const { slug } = useParams()
  const [item, setItem] = useState(null)
  const [ogImage, setOgImage] = useState(null)
  const [ogLoading, setOgLoading] = useState(true)
  const [votes, setVotes] = useState({ yes: 0, no: 0 })
  const [voted, setVoted] = useState(null)
  const [voting, setVoting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const voterId = getVoterId()

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    loadPage()
  }, [slug])

  async function loadPage() {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setItem(data)
    setLoading(false)

    // Increment view count (best-effort, no await)
    supabase
      .from('items')
      .update({ view_count: (data.view_count ?? 0) + 1 })
      .eq('id', data.id)
      .then(() => {})

    // Fetch OG image in parallel
    fetchOgImage(data.item_url).then(img => {
      setOgImage(img)
      setOgLoading(false)
    })

    // Load votes
    await loadVotes(data.id)

    // Check prior vote
    const prior = localStorage.getItem(`stash_vote_${data.id}`)
    if (prior !== null) setVoted(prior === 'true')
  }

  async function loadVotes(itemId) {
    const { data } = await supabase
      .from('votes')
      .select('vote')
      .eq('item_id', itemId)

    if (data) {
      setVotes({
        yes: data.filter(v => v.vote === true).length,
        no: data.filter(v => v.vote === false).length,
      })
    }
  }

  async function handleVote(voteValue) {
    if (voted !== null || voting || !supabase || !item) return
    setVoting(true)

    const { error } = await supabase
      .from('votes')
      .insert({ item_id: item.id, vote: voteValue, voter_id: voterId })

    if (!error) {
      localStorage.setItem(`stash_vote_${item.id}`, String(voteValue))
      setVoted(voteValue)
      setVotes(v => ({
        yes: voteValue === true ? v.yes + 1 : v.yes,
        no: voteValue === false ? v.no + 1 : v.no,
      }))
    }
    setVoting(false)
  }

  if (loading) return <LoadingState />
  if (notFound || !item) return <NotFound />

  const hasVoted = voted !== null
  const showTally = hasVoted || (votes.yes + votes.no) > 0

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-sm pb-16">

        {/* ── Product image ───────────────────────────────────────────────── */}
        <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
          {ogLoading ? (
            <div className="h-full w-full animate-pulse bg-gray-100" />
          ) : ogImage ? (
            <img
              src={ogImage}
              alt={item.item_name}
              className="h-full w-full object-cover"
            />
          ) : (
            /* Fallback placeholder */
            <div className="flex h-full w-full flex-col items-center justify-center gap-3"
              style={{ background: 'linear-gradient(135deg,#fff0f5 0%,#fff8e0 100%)' }}>
              <span className="text-7xl">🛍️</span>
            </div>
          )}

          {/* Gradient scrim */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />

          {/* Floating badge */}
          <div className="absolute left-4 top-4">
            <span
              className="rounded-full px-3 py-1 text-xs font-bold text-white"
              style={{ background: ORANGE }}
            >
              🛍️ wishlist
            </span>
          </div>
        </div>

        {/* ── Item details ────────────────────────────────────────────────── */}
        <div className="px-5 pt-2">
          <h1
            className="text-4xl leading-tight text-gray-900"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            {item.item_name}
          </h1>

          {item.caption && (
            <p className="mt-3 text-base leading-relaxed text-gray-500">
              "{item.caption}"
            </p>
          )}

          <a
            href={item.item_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold transition-opacity hover:opacity-70"
            style={{ color: ORANGE }}
          >
            View on store
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M7 7h10v10"/>
            </svg>
          </a>
        </div>

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <div className="mx-5 my-6 h-px bg-gray-100" />

        {/* ── Vote section ────────────────────────────────────────────────── */}
        <div className="px-5">
          <p className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-gray-400">
            Should they get it?
          </p>

          <div className="flex gap-3">
            {/* YES */}
            <button
              onClick={() => handleVote(true)}
              disabled={hasVoted || voting}
              className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-5 text-center font-bold transition-all active:scale-95 disabled:cursor-default"
              style={{
                background: hasVoted
                  ? voted === true
                    ? PINK
                    : '#f3f4f6'
                  : PINK,
                color: hasVoted
                  ? voted === true
                    ? '#fff'
                    : '#9ca3af'
                  : '#fff',
                boxShadow: !hasVoted ? `0 8px 24px ${PINK}55` : 'none',
                transform: !hasVoted ? undefined : 'none',
              }}
            >
              <span className="text-2xl">{voted === true ? '✅' : '♥'}</span>
              <span className="text-sm">YES</span>
            </button>

            {/* NO */}
            <button
              onClick={() => handleVote(false)}
              disabled={hasVoted || voting}
              className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl border-2 py-5 text-center font-bold transition-all active:scale-95 disabled:cursor-default"
              style={{
                borderColor: hasVoted
                  ? voted === false ? CHARTREUSE : '#e5e7eb'
                  : CHARTREUSE,
                background: hasVoted
                  ? voted === false ? CHARTREUSE : '#fff'
                  : '#fff',
                color: hasVoted
                  ? voted === false ? '#3a4a00' : '#9ca3af'
                  : '#3a4a00',
                boxShadow: !hasVoted ? `0 8px 24px ${CHARTREUSE}88` : 'none',
              }}
            >
              <span className="text-2xl">{voted === false ? '✅' : '✕'}</span>
              <span className="text-sm">NO</span>
            </button>
          </div>

          {showTally && <VoteTally votes={votes} voted={voted} />}

          {!hasVoted && !showTally && (
            <p className="mt-4 text-center text-xs text-gray-300">
              Be the first to vote ✨
            </p>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="mt-12 flex items-center justify-center gap-1.5">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 transition-opacity hover:opacity-70"
          >
            <span
              className="inline-block rounded-full px-2 py-0.5 text-white"
              style={{ background: PINK, fontSize: '10px' }}
            >
              🎀 Stash
            </span>
            <span>Make your own wishlist →</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
