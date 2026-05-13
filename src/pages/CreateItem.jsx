import { useState } from 'react'
import { supabase } from '../lib/supabase'

function generateSlug() {
  return Math.random().toString(36).slice(2, 8)
}

function SuccessCard({ shareUrl, onReset }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-white px-6">
      <div className="w-full max-w-md text-center">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-stash-silver">
          Added to wishlist
        </p>
        <h2
          className="mb-2 text-4xl text-stash-black"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          It's stashed.
        </h2>
        <p className="mb-8 text-sm text-stash-black/50">
          Share this link and let people vote.
        </p>

        <div className="mb-5 overflow-hidden rounded border border-stash-silver bg-white">
          <div className="border-b border-stash-silver bg-gray-50 px-4 py-2 text-left text-xs font-bold uppercase tracking-widest text-stash-black/40">
            Your link
          </div>
          <p className="break-all px-5 py-4 text-left font-mono text-sm text-stash-black">
            {shareUrl}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleCopy}
            className="flex flex-1 items-center justify-center rounded py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-80"
            style={{ background: '#E8651A' }}
          >
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <button
            onClick={onReset}
            className="flex flex-1 items-center justify-center rounded border border-stash-silver py-3.5 text-sm font-bold uppercase tracking-wider text-stash-black transition-colors hover:border-stash-orange hover:text-stash-orange"
          >
            Add another
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CreateItem() {
  const [form, setForm] = useState({ item_name: '', item_url: '', caption: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [shareUrl, setShareUrl] = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (error) setError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    if (!supabase) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
      setSubmitting(false)
      return
    }

    const slug = generateSlug()
    const { error: dbError } = await supabase.from('items').insert({
      item_name: form.item_name.trim(),
      item_url:  form.item_url.trim(),
      caption:   form.caption.trim() || null,
      slug,
      user_id:   null,
    })

    if (dbError) {
      setError(dbError.message)
      setSubmitting(false)
      return
    }

    setShareUrl(`${window.location.origin}/s/${slug}`)
    setSubmitting(false)
  }

  function handleReset() {
    setForm({ item_name: '', item_url: '', caption: '' })
    setShareUrl(null)
    setError(null)
  }

  if (shareUrl) return <SuccessCard shareUrl={shareUrl} onReset={handleReset} />

  const inputClass = `w-full rounded border border-stash-silver bg-white px-4 py-3 text-sm text-stash-black placeholder:text-stash-black/30 outline-none transition focus:border-stash-orange`

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-white px-6 py-16">
      <div className="w-full max-w-md">

        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-stash-silver">
            New wishlist item
          </p>
          <h1
            className="text-4xl text-stash-black"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Add to wishlist
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="item_name" className="block text-xs font-bold uppercase tracking-wider text-stash-black">
              What is it called? <span className="text-stash-orange">*</span>
            </label>
            <input
              id="item_name"
              name="item_name"
              type="text"
              value={form.item_name}
              onChange={handleChange}
              placeholder="e.g. Loewe Puzzle Bag, New Balance 1906R"
              required
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="item_url" className="block text-xs font-bold uppercase tracking-wider text-stash-black">
              Paste the product link <span className="text-stash-orange">*</span>
            </label>
            <input
              id="item_url"
              name="item_url"
              type="url"
              value={form.item_url}
              onChange={handleChange}
              placeholder="https://…"
              required
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="caption" className="block text-xs font-bold uppercase tracking-wider text-stash-black">
              Add a caption{' '}
              <span className="font-normal normal-case tracking-normal text-stash-black/40">(optional)</span>
            </label>
            <textarea
              id="caption"
              name="caption"
              value={form.caption}
              onChange={handleChange}
              placeholder="Why do you want this?"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: '#E8651A' }}
          >
            {submitting ? 'Saving…' : 'Add to wishlist'}
          </button>
        </form>
      </div>
    </div>
  )
}
