import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ORANGE     = '#E8651A'
const PINK       = '#E8608A'
const CHARTREUSE = '#C5D93A'
const SILVER     = '#C0C0C0'
const BLACK      = '#1A1A1A'

function getVoterId() {
  let id = localStorage.getItem('shoppi_voter_id')
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('shoppi_voter_id', id)
  }
  return id
}

function LoadingState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-4">
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
      <h1 className="text-[22px] font-medium text-shoppi-ink">Link not found</h1>
      <p className="text-sm" style={{ color: SILVER }}>This wishlist item may have been removed.</p>
      <Link
        to="/"
        className="mt-2 rounded-full px-6 py-2.5 text-sm font-medium text-white"
        style={{ background: ORANGE }}
      >
        Go to Shoppi
      </Link>
    </div>
  )
}

function VoteTally({ votes, voted }) {
  const total      = votes.yes + votes.no
  const yesPercent = total > 0 ? Math.round((votes.yes / total) * 100) : 50

  return (
    <div className="mt-5 space-y-3">
      <p className="text-center text-[11px] font-medium" style={{ color: SILVER }}>
        {total} {total === 1 ? 'vote' : 'votes'}
      </p>
      <div className="flex h-2 overflow-hidden rounded-full" style={{ background: '#f0f0f0' }}>
        <div
          className="h-full transition-all duration-700"
          style={{ width: `${yesPercent}%`, background: ORANGE }}
        />
      </div>
      <div className="flex justify-between text-sm font-medium">
        <span style={{ color: ORANGE }}>♥ {votes.yes} yes</span>
        <span style={{ color: '#6a7a00' }}>{votes.no} no</span>
      </div>
      {voted !== null && (
        <p className="text-center text-xs" style={{ color: SILVER }}>
          You voted <strong>{voted ? 'Yes' : 'No'}</strong>
        </p>
      )}
    </div>
  )
}

// ── Try-on photo components ────────────────────────────────────────────────────
function PhotoVoteButtons({ photoId, voterId }) {
  const key = `shoppi_photo_vote_${photoId}`
  const [votes, setVotes]   = useState({ yes: 0, no: 0 })
  const [voted, setVoted]   = useState(null)
  const [voting, setVoting] = useState(false)

  useEffect(() => {
    loadVotes()
    const prior = localStorage.getItem(key)
    if (prior !== null) setVoted(prior === 'true')
  }, [photoId])

  async function loadVotes() {
    const { data } = await supabase.from('photo_votes').select('vote').eq('photo_id', photoId)
    if (data) setVotes({ yes: data.filter(v => v.vote).length, no: data.filter(v => !v.vote).length })
  }

  async function handleVote(voteValue) {
    if (voted !== null || voting) return
    setVoting(true)
    const { error } = await supabase.from('photo_votes').insert({ photo_id: photoId, vote: voteValue, voter_id: voterId })
    if (!error) {
      localStorage.setItem(key, String(voteValue))
      setVoted(voteValue)
      setVotes(v => ({ yes: voteValue ? v.yes + 1 : v.yes, no: !voteValue ? v.no + 1 : v.no }))
    }
    setVoting(false)
  }

  const hasVoted = voted !== null
  return (
    <div className="mt-2 flex gap-2">
      <button
        onClick={() => handleVote(true)}
        disabled={hasVoted || voting}
        className="flex flex-1 items-center justify-center gap-1 rounded py-2 text-xs font-medium text-white transition-opacity hover:opacity-80 disabled:cursor-default"
        style={{ background: hasVoted ? (voted ? ORANGE : '#e5e5e5') : ORANGE, color: hasVoted ? (voted ? '#fff' : SILVER) : '#fff' }}
      >
        ♥ {votes.yes}
      </button>
      <button
        onClick={() => handleVote(false)}
        disabled={hasVoted || voting}
        className="flex flex-1 items-center justify-center gap-1 rounded border py-2 text-xs font-medium transition-opacity hover:opacity-80 disabled:cursor-default"
        style={{
          borderColor: hasVoted ? (!voted ? CHARTREUSE : SILVER) : CHARTREUSE,
          background:  hasVoted ? (!voted ? CHARTREUSE : '#fff') : CHARTREUSE,
          color:       hasVoted ? (!voted ? BLACK : SILVER) : BLACK,
        }}
      >
        {votes.no}
      </button>
    </div>
  )
}

function PhotoCard({ photo, voterId }) {
  return (
    <div className="overflow-hidden rounded border bg-white" style={{ borderColor: SILVER }}>
      <div className="aspect-square w-full overflow-hidden bg-gray-50">
        <img src={photo.photo_url} alt="Try-on photo" className="h-full w-full object-cover" />
      </div>
      <div className="p-2">
        <PhotoVoteButtons photoId={photo.id} voterId={voterId} />
      </div>
    </div>
  )
}

function TryOnSection({ itemId, voterId }) {
  const [photos, setPhotos]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [uploading, setUploading]     = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const fileInputRef                  = useRef(null)

  useEffect(() => { loadPhotos() }, [itemId])

  async function loadPhotos() {
    const { data } = await supabase.from('tryon_photos').select('*').eq('item_id', itemId).order('created_at', { ascending: false })
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

    const { error: storageError } = await supabase.storage.from('tryon-photos').upload(path, file, { cacheControl: '3600', upsert: false })
    if (storageError) { setUploadError(storageError.message); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('tryon-photos').getPublicUrl(path)
    const { data: photo, error: dbError } = await supabase.from('tryon_photos').insert({ item_id: itemId, photo_url: publicUrl, user_id: null }).select().single()

    if (dbError) setUploadError(dbError.message)
    else if (photo) setPhotos(prev => [photo, ...prev])
    setUploading(false)
  }

  return (
    <div className="px-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] font-medium" style={{ color: SILVER }}>Try-on photos</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded border px-4 py-1.5 text-xs font-medium transition-opacity hover:opacity-70 disabled:opacity-40"
          style={{ borderColor: PINK, color: PINK }}
        >
          {uploading ? 'Uploading…' : 'Add photo'}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {uploadError && (
        <p className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-500">{uploadError}</p>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map(i => <div key={i} className="aspect-square animate-pulse bg-gray-100" />)}
        </div>
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded border border-dashed py-10 text-center" style={{ borderColor: SILVER }}>
          <p className="text-sm font-medium" style={{ color: SILVER }}>No try-ons yet</p>
          <p className="text-xs" style={{ color: SILVER }}>Be the first to upload one</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {photos.map(photo => <PhotoCard key={photo.id} photo={photo} voterId={voterId} />)}
        </div>
      )}
    </div>
  )
}

// ── Event Mode ─────────────────────────────────────────────────────────────────
function OutfitVoteButtons({ outfitId, voterId }) {
  const key = `shoppi_outfit_vote_${outfitId}`
  const [votes, setVotes]   = useState({ yes: 0, no: 0 })
  const [voted, setVoted]   = useState(null)
  const [voting, setVoting] = useState(false)

  useEffect(() => {
    loadVotes()
    const prior = localStorage.getItem(key)
    if (prior !== null) setVoted(prior === 'true')
  }, [outfitId])

  async function loadVotes() {
    const { data } = await supabase.from('votes').select('vote').eq('item_id', outfitId)
    if (data) setVotes({ yes: data.filter(v => v.vote).length, no: data.filter(v => !v.vote).length })
  }

  async function handleVote(voteValue) {
    if (voted !== null || voting) return
    setVoting(true)
    const { error } = await supabase.from('votes').insert({ item_id: outfitId, vote: voteValue, voter_id: voterId })
    if (!error) {
      localStorage.setItem(key, String(voteValue))
      setVoted(voteValue)
      setVotes(v => ({ yes: voteValue ? v.yes + 1 : v.yes, no: !voteValue ? v.no + 1 : v.no }))
    }
    setVoting(false)
  }

  const hasVoted = voted !== null
  return (
    <div className="flex gap-2 mt-3">
      <button
        onClick={() => handleVote(true)}
        disabled={hasVoted || voting}
        className="flex flex-1 items-center justify-center gap-1 rounded py-2 text-xs font-medium transition-opacity hover:opacity-80 disabled:cursor-default"
        style={{ background: hasVoted ? (voted ? ORANGE : '#e5e5e5') : ORANGE, color: hasVoted ? (voted ? '#fff' : SILVER) : '#fff' }}
      >
        ♥ {votes.yes}
      </button>
      <button
        onClick={() => handleVote(false)}
        disabled={hasVoted || voting}
        className="flex flex-1 items-center justify-center gap-1 rounded py-2 text-xs font-medium transition-opacity hover:opacity-80 disabled:cursor-default"
        style={{
          background:  hasVoted ? (!voted ? CHARTREUSE : '#fff') : CHARTREUSE,
          color:       hasVoted ? (!voted ? BLACK : SILVER) : BLACK,
          border:      `1px solid ${hasVoted ? (!voted ? CHARTREUSE : SILVER) : CHARTREUSE}`,
        }}
      >
        {votes.no}
      </button>
    </div>
  )
}

function OutfitCard({ outfit, voterId }) {
  return (
    <div className="flex flex-col overflow-hidden rounded border bg-white p-3" style={{ borderColor: SILVER }}>
      {outfit.caption && (
        <p className="mb-2 text-xs italic line-clamp-3" style={{ color: '#888' }}>
          "{outfit.caption}"
        </p>
      )}
      <a
        href={outfit.product_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-1 truncate text-xs font-medium transition-opacity hover:opacity-70"
        style={{ color: ORANGE }}
      >
        View outfit
      </a>
      <OutfitVoteButtons outfitId={outfit.id} voterId={voterId} />
    </div>
  )
}

function EventOutfitSection({ itemId, voterId, eventName }) {
  const [outfits, setOutfits]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [form, setForm]               = useState({ product_url: '', caption: '' })
  const [submitting, setSubmitting]   = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitted, setSubmitted]     = useState(false)

  useEffect(() => { loadOutfits() }, [itemId])

  async function loadOutfits() {
    const { data } = await supabase.from('event_outfits').select('*').eq('item_id', itemId).order('created_at', { ascending: false })
    if (data) setOutfits(data)
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.product_url.trim()) return
    setSubmitting(true)
    setSubmitError(null)

    const { data: outfit, error } = await supabase
      .from('event_outfits')
      .insert({ item_id: itemId, submitter_id: voterId, product_url: form.product_url.trim(), caption: form.caption.trim() || null })
      .select().single()

    if (error) setSubmitError(error.message)
    else {
      setOutfits(prev => [outfit, ...prev])
      setForm({ product_url: '', caption: '' })
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    }
    setSubmitting(false)
  }

  const inputClass = 'w-full rounded border bg-white px-3 py-2.5 text-sm text-shoppi-ink placeholder:text-[#999] outline-none transition focus:border-shoppi-orange'

  return (
    <div className="px-5">
      <div className="mb-5 text-center">
        <p className="text-[11px] font-medium mb-1" style={{ color: SILVER }}>Group chat energy</p>
        <h2 className="text-[22px] font-medium text-shoppi-ink">What are you wearing?</h2>
        <p className="mt-1 text-sm" style={{ color: '#888' }}>Drop a link — everyone votes.</p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded border p-4" style={{ borderColor: SILVER, background: '#fafafa' }}>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-shoppi-ink">Your outfit link</label>
          <input
            type="url"
            value={form.product_url}
            onChange={e => setForm(f => ({ ...f, product_url: e.target.value }))}
            placeholder="https://…"
            required
            className={inputClass}
            style={{ borderColor: SILVER }}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-shoppi-ink">
            Note <span className="font-normal" style={{ color: '#999' }}>(optional)</span>
          </label>
          <input
            type="text"
            value={form.caption}
            onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
            placeholder="Thinking this one?? help"
            className={inputClass}
            style={{ borderColor: SILVER }}
          />
        </div>
        {submitError && <p className="text-xs text-red-500">{submitError}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full py-3 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ background: PINK }}
        >
          {submitted ? 'Added!' : submitting ? 'Adding…' : 'Share your outfit'}
        </button>
      </form>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map(i => <div key={i} className="aspect-square animate-pulse rounded bg-gray-100" />)}
        </div>
      ) : outfits.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded border border-dashed py-10 text-center" style={{ borderColor: SILVER }}>
          <p className="text-sm font-medium" style={{ color: SILVER }}>No outfits yet</p>
          <p className="text-xs" style={{ color: SILVER }}>Be the first to share one</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {outfits.map(outfit => <OutfitCard key={outfit.id} outfit={outfit} voterId={voterId} />)}
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function SharePage() {
  const { slug } = useParams()
  const [item, setItem]       = useState(null)
  const [votes, setVotes]     = useState({ yes: 0, no: 0 })
  const [voted, setVoted]     = useState(null)
  const [voting, setVoting]   = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const voterId = getVoterId()

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    loadPage()
  }, [slug])

  async function loadPage() {
    const { data, error } = await supabase.from('items').select('*').eq('slug', slug).single()
    if (error || !data) { setNotFound(true); setLoading(false); return }

    setItem(data)
    setLoading(false)

    supabase.from('items').update({ view_count: (data.view_count ?? 0) + 1 }).eq('id', data.id).then(() => {})

    await loadVotes(data.id)
    const prior = localStorage.getItem(`shoppi_vote_${data.id}`)
    if (prior !== null) setVoted(prior === 'true')
  }

  async function loadVotes(itemId) {
    const { data } = await supabase.from('votes').select('vote').eq('item_id', itemId)
    if (data) setVotes({ yes: data.filter(v => v.vote).length, no: data.filter(v => !v.vote).length })
  }

  async function handleVote(voteValue) {
    if (voted !== null || voting || !supabase || !item) return
    setVoting(true)
    const { error } = await supabase.from('votes').insert({ item_id: item.id, vote: voteValue, voter_id: voterId })
    if (!error) {
      localStorage.setItem(`shoppi_vote_${item.id}`, String(voteValue))
      setVoted(voteValue)
      setVotes(v => ({ yes: voteValue ? v.yes + 1 : v.yes, no: !voteValue ? v.no + 1 : v.no }))
    }
    setVoting(false)
  }

  if (loading) return <LoadingState />
  if (notFound || !item) return <NotFound />

  const hasVoted  = voted !== null
  const showTally = hasVoted || (votes.yes + votes.no) > 0
  const isEvent   = !!item.event_name

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-sm pb-16">

        {/* Event banner */}
        {isEvent && (
          <div className="px-5 pt-5 pb-1">
            <div
              className="inline-flex w-full items-center justify-center rounded-full border px-4 py-2 text-center"
              style={{ borderColor: PINK, background: '#fff' }}
            >
              <span className="text-xs font-medium text-shoppi-ink">{item.event_name}</span>
            </div>
          </div>
        )}

        {/* Item details */}
        <div className="px-5 pt-6">
          <h1 className="text-[28px] font-medium leading-tight text-shoppi-ink">
            {item.item_name}
          </h1>

          {isEvent && (
            <p className="mt-2 text-sm font-medium" style={{ color: PINK }}>
              For {item.event_name} — would you wear this or leave it?
            </p>
          )}

          {item.caption && (
            <p className="mt-3 text-base leading-relaxed" style={{ color: '#888' }}>
              "{item.caption}"
            </p>
          )}

          <a
            href={item.item_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: ORANGE }}
          >
            View on store
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M7 7h10v10" />
            </svg>
          </a>
        </div>

        <div className="mx-5 my-6 h-px" style={{ background: SILVER }} />

        {/* Vote section */}
        <div className="px-5">
          <p className="mb-4 text-center text-[11px] font-medium" style={{ color: SILVER }}>
            Should they get it?
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => handleVote(true)}
              disabled={hasVoted || voting}
              className="flex flex-1 flex-col items-center justify-center gap-1 rounded py-5 text-center font-medium transition-opacity active:scale-95 disabled:cursor-default hover:opacity-80"
              style={{
                background: hasVoted ? (voted ? ORANGE : '#f3f4f6') : ORANGE,
                color:      hasVoted ? (voted ? '#fff' : SILVER) : '#fff',
              }}
            >
              <span className="text-xl">♥</span>
              <span className="text-xs">Yes</span>
            </button>

            <button
              onClick={() => handleVote(false)}
              disabled={hasVoted || voting}
              className="flex flex-1 flex-col items-center justify-center gap-1 rounded border-2 py-5 text-center font-medium transition-opacity active:scale-95 disabled:cursor-default hover:opacity-80"
              style={{
                borderColor: hasVoted ? (!voted ? CHARTREUSE : SILVER) : CHARTREUSE,
                background:  hasVoted ? (!voted ? CHARTREUSE : '#fff') : CHARTREUSE,
                color:       hasVoted ? (!voted ? BLACK : SILVER) : BLACK,
              }}
            >
              <span className="text-xl">—</span>
              <span className="text-xs">No</span>
            </button>
          </div>

          {showTally && <VoteTally votes={votes} voted={voted} />}
          {!hasVoted && !showTally && (
            <p className="mt-4 text-center text-xs" style={{ color: SILVER }}>Be the first to vote</p>
          )}
        </div>

        <div className="mx-5 my-6 h-px" style={{ background: SILVER }} />

        {isEvent
          ? <EventOutfitSection itemId={item.id} voterId={voterId} eventName={item.event_name} />
          : <TryOnSection itemId={item.id} voterId={voterId} />
        }

        <div className="mt-12 flex items-center justify-center">
          <Link
            to="/"
            className="text-xs font-medium transition-opacity hover:opacity-60"
            style={{ color: SILVER }}
          >
            Make your own — Shoppi
          </Link>
        </div>

      </div>
    </div>
  )
}
