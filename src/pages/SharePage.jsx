/*
 * SUPABASE STORAGE SETUP
 * ─────────────────────────────────────────────────────────────────────────────
 * Before try-on photo uploads will work, create the storage bucket manually:
 *
 *  1. Go to your Supabase project → Storage → New bucket
 *  2. Name it exactly: tryon-photos
 *  3. Check "Public bucket" so uploaded images are publicly readable
 *  4. Leave the file size limit at the default (or set to 5 MB)
 *  5. Click "Create bucket"
 *
 * Required tables (run in SQL editor):
 *
 *  create table tryon_photos (
 *    id          uuid primary key default gen_random_uuid(),
 *    item_id     uuid references items(id) on delete cascade,
 *    user_id     uuid,
 *    photo_url   text not null,
 *    created_at  timestamptz default now()
 *  );
 *
 *  create table photo_votes (
 *    id          uuid primary key default gen_random_uuid(),
 *    photo_id    uuid references tryon_photos(id) on delete cascade,
 *    vote        boolean not null,
 *    voter_id    text not null,
 *    created_at  timestamptz default now()
 *  );
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ── Brand colors (inline where Tailwind custom token unavailable in JSX) ───────
const ORANGE     = '#E8651A'
const PINK       = '#E8608A'
const CHARTREUSE = '#C5D93A'
const SILVER     = '#C0C0C0'
const BLACK      = '#1A1A1A'

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
        <div className="aspect-square w-full animate-pulse bg-gray-100" />
        <div className="h-8 w-3/4 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
        <div className="mt-6 flex gap-3">
          <div className="h-16 flex-1 animate-pulse rounded bg-gray-100" />
          <div className="h-16 flex-1 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <h1 className="text-2xl font-extrabold text-stash-black">Link not found</h1>
      <p className="text-sm" style={{ color: SILVER }}>This wishlist item may have been removed.</p>
      <Link
        to="/"
        className="mt-2 rounded px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white"
        style={{ background: ORANGE }}
      >
        Go to Stash
      </Link>
    </div>
  )
}

function VoteTally({ votes, voted }) {
  const total      = votes.yes + votes.no
  const yesPercent = total > 0 ? Math.round((votes.yes / total) * 100) : 50

  return (
    <div className="mt-5 space-y-3">
      <p className="text-center text-xs font-bold uppercase tracking-widest" style={{ color: SILVER }}>
        {total} {total === 1 ? 'vote' : 'votes'}
      </p>
      <div className="flex h-2 overflow-hidden rounded-full" style={{ background: '#f0f0f0' }}>
        <div
          className="h-full transition-all duration-700"
          style={{ width: `${yesPercent}%`, background: ORANGE }}
        />
      </div>
      <div className="flex justify-between text-sm font-bold">
        <span style={{ color: ORANGE }}>♥ {votes.yes} yes</span>
        <span style={{ color: '#6a7a00' }}>{votes.no} no</span>
      </div>
      {voted !== null && (
        <p className="text-center text-xs" style={{ color: SILVER }}>
          You voted <strong>{voted ? 'YES' : 'NO'}</strong>
        </p>
      )}
    </div>
  )
}

// ── Try-on photo components ────────────────────────────────────────────────────
function PhotoVoteButtons({ photoId, voterId }) {
  const key            = `stash_photo_vote_${photoId}`
  const [votes, setVotes]   = useState({ yes: 0, no: 0 })
  const [voted, setVoted]   = useState(null)
  const [voting, setVoting] = useState(false)

  useEffect(() => {
    loadVotes()
    const prior = localStorage.getItem(key)
    if (prior !== null) setVoted(prior === 'true')
  }, [photoId])

  async function loadVotes() {
    const { data } = await supabase
      .from('photo_votes')
      .select('vote')
      .eq('photo_id', photoId)
    if (data) {
      setVotes({
        yes: data.filter(v => v.vote === true).length,
        no:  data.filter(v => v.vote === false).length,
      })
    }
  }

  async function handleVote(voteValue) {
    if (voted !== null || voting) return
    setVoting(true)
    const { error } = await supabase
      .from('photo_votes')
      .insert({ photo_id: photoId, vote: voteValue, voter_id: voterId })
    if (!error) {
      localStorage.setItem(key, String(voteValue))
      setVoted(voteValue)
      setVotes(v => ({
        yes: voteValue === true  ? v.yes + 1 : v.yes,
        no:  voteValue === false ? v.no  + 1 : v.no,
      }))
    }
    setVoting(false)
  }

  const hasVoted = voted !== null
  const total    = votes.yes + votes.no

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-2">
        <button
          onClick={() => handleVote(true)}
          disabled={hasVoted || voting}
          className="flex flex-1 items-center justify-center gap-1 rounded py-2 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-80 disabled:cursor-default"
          style={{
            background: hasVoted ? (voted === true ? ORANGE : '#e5e5e5') : ORANGE,
            color:      hasVoted ? (voted === true ? '#fff'  : SILVER)   : '#fff',
          }}
        >
          ♥ {votes.yes}
        </button>
        <button
          onClick={() => handleVote(false)}
          disabled={hasVoted || voting}
          className="flex flex-1 items-center justify-center gap-1 rounded border py-2 text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-80 disabled:cursor-default"
          style={{
            borderColor: hasVoted ? (voted === false ? CHARTREUSE : SILVER) : CHARTREUSE,
            background:  hasVoted ? (voted === false ? CHARTREUSE : '#fff') : CHARTREUSE,
            color:       hasVoted ? (voted === false ? BLACK      : SILVER)  : BLACK,
          }}
        >
          {votes.no}
        </button>
      </div>
      {total > 0 && (
        <div className="flex h-1 overflow-hidden rounded-full" style={{ background: '#f0f0f0' }}>
          <div
            className="transition-all duration-500"
            style={{
              width: `${total > 0 ? Math.round((votes.yes / total) * 100) : 50}%`,
              background: ORANGE,
            }}
          />
        </div>
      )}
    </div>
  )
}

function PhotoCard({ photo, voterId }) {
  return (
    <div className="overflow-hidden rounded border bg-white" style={{ borderColor: SILVER }}>
      <div className="aspect-square w-full overflow-hidden bg-gray-50">
        <img
          src={photo.photo_url}
          alt="Try-on photo"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-2">
        <PhotoVoteButtons photoId={photo.id} voterId={voterId} />
      </div>
    </div>
  )
}

function TryOnSection({ itemId, voterId }) {
  const [photos, setPhotos]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [uploading, setUploading]   = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const fileInputRef                = useRef(null)

  useEffect(() => { loadPhotos() }, [itemId])

  async function loadPhotos() {
    const { data } = await supabase
      .from('tryon_photos')
      .select('*')
      .eq('item_id', itemId)
      .order('created_at', { ascending: false })
    if (data) setPhotos(data)
    setLoading(false)
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploading(true)
    setUploadError(null)

    const ext  = file.name.split('.').pop().toLowerCase()
    const path = `${itemId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: storageError } = await supabase.storage
      .from('tryon-photos')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (storageError) {
      setUploadError(storageError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('tryon-photos')
      .getPublicUrl(path)

    const { data: photo, error: dbError } = await supabase
      .from('tryon_photos')
      .insert({ item_id: itemId, photo_url: publicUrl, user_id: null })
      .select()
      .single()

    if (dbError) {
      setUploadError(dbError.message)
    } else if (photo) {
      setPhotos(prev => [photo, ...prev])
    }
    setUploading(false)
  }

  return (
    <div className="px-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: SILVER }}>
          Try-on photos
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded border px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-70 disabled:opacity-40"
          style={{ borderColor: PINK, color: PINK, background: 'transparent' }}
        >
          {uploading ? 'Uploading…' : 'Add photo'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {uploadError && (
        <p className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-500">
          {uploadError}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map(i => (
            <div key={i} className="aspect-square animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-2 rounded border border-dashed py-10 text-center"
          style={{ borderColor: SILVER }}
        >
          <p className="text-sm font-semibold" style={{ color: SILVER }}>No try-ons yet</p>
          <p className="text-xs" style={{ color: SILVER }}>Be the first to upload one</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {photos.map(photo => (
            <PhotoCard key={photo.id} photo={photo} voterId={voterId} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function SharePage() {
  const { slug } = useParams()
  const [item, setItem]           = useState(null)
  const [ogImage, setOgImage]     = useState(null)
  const [ogLoading, setOgLoading] = useState(true)
  const [votes, setVotes]         = useState({ yes: 0, no: 0 })
  const [voted, setVoted]         = useState(null)
  const [voting, setVoting]       = useState(false)
  const [loading, setLoading]     = useState(true)
  const [notFound, setNotFound]   = useState(false)

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

    supabase
      .from('items')
      .update({ view_count: (data.view_count ?? 0) + 1 })
      .eq('id', data.id)
      .then(() => {})

    fetchOgImage(data.item_url).then(img => {
      setOgImage(img)
      setOgLoading(false)
    })

    await loadVotes(data.id)

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
        no:  data.filter(v => v.vote === false).length,
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
        yes: voteValue === true  ? v.yes + 1 : v.yes,
        no:  voteValue === false ? v.no  + 1 : v.no,
      }))
    }
    setVoting(false)
  }

  if (loading) return <LoadingState />
  if (notFound || !item) return <NotFound />

  const hasVoted  = voted !== null
  const showTally = hasVoted || (votes.yes + votes.no) > 0

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-sm pb-16">

        {/* ── Product image ───────────────────────────────────────────────── */}
        <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
          {ogLoading ? (
            <div className="h-full w-full animate-pulse bg-gray-100" />
          ) : ogImage ? (
            <img src={ogImage} alt={item.item_name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-50">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: SILVER }}>
                No image
              </span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />

          {/* Wishlist badge */}
          <div className="absolute left-4 top-4">
            <span
              className="rounded px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
              style={{ background: PINK }}
            >
              Wishlist
            </span>
          </div>
        </div>

        {/* ── Item details ────────────────────────────────────────────────── */}
        <div className="px-5 pt-3">
          <h1
            className="text-4xl leading-tight"
            style={{ fontFamily: "'DM Serif Display', serif", color: BLACK }}
          >
            {item.item_name}
          </h1>

          {item.caption && (
            <p className="mt-3 text-base leading-relaxed" style={{ color: `${BLACK}99` }}>
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
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M7 7h10v10" />
            </svg>
          </a>
        </div>

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <div className="mx-5 my-6 h-px" style={{ background: SILVER }} />

        {/* ── Vote section ────────────────────────────────────────────────── */}
        <div className="px-5">
          <p className="mb-4 text-center text-xs font-bold uppercase tracking-widest" style={{ color: SILVER }}>
            Should they get it?
          </p>

          <div className="flex gap-3">
            {/* YES — orange with heart symbol */}
            <button
              onClick={() => handleVote(true)}
              disabled={hasVoted || voting}
              className="flex flex-1 flex-col items-center justify-center gap-1 rounded py-5 text-center font-bold uppercase tracking-wider transition-opacity active:scale-95 disabled:cursor-default hover:opacity-80"
              style={{
                background: hasVoted ? (voted === true  ? ORANGE    : '#f3f4f6') : ORANGE,
                color:      hasVoted ? (voted === true  ? '#fff'    : SILVER)    : '#fff',
              }}
            >
              <span className="text-xl">♥</span>
              <span className="text-xs">Yes</span>
            </button>

            {/* NO — chartreuse */}
            <button
              onClick={() => handleVote(false)}
              disabled={hasVoted || voting}
              className="flex flex-1 flex-col items-center justify-center gap-1 rounded border-2 py-5 text-center font-bold uppercase tracking-wider transition-opacity active:scale-95 disabled:cursor-default hover:opacity-80"
              style={{
                borderColor: hasVoted ? (voted === false ? CHARTREUSE : SILVER)     : CHARTREUSE,
                background:  hasVoted ? (voted === false ? CHARTREUSE : '#fff')     : CHARTREUSE,
                color:       hasVoted ? (voted === false ? BLACK      : SILVER)     : BLACK,
              }}
            >
              <span className="text-xl">—</span>
              <span className="text-xs">No</span>
            </button>
          </div>

          {showTally && <VoteTally votes={votes} voted={voted} />}
          {!hasVoted && !showTally && (
            <p className="mt-4 text-center text-xs" style={{ color: SILVER }}>
              Be the first to vote
            </p>
          )}
        </div>

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <div className="mx-5 my-6 h-px" style={{ background: SILVER }} />

        {/* ── Try-on photos ───────────────────────────────────────────────── */}
        <TryOnSection itemId={item.id} voterId={voterId} />

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="mt-12 flex items-center justify-center">
          <Link
            to="/"
            className="text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-60"
            style={{ color: SILVER }}
          >
            Make your own — Stash
          </Link>
        </div>

      </div>
    </div>
  )
}
