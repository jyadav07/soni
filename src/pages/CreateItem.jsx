import { useState } from 'react'
import { supabase } from '../lib/supabase'

function generateSlug() {
  return Math.random().toString(36).slice(2, 8)
}

const serif = { fontFamily: "'DM Serif Display', serif" }

function SuccessCard({ shareUrl, onReset }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-gradient-to-br from-rose-50 via-fuchsia-50 to-pink-50 px-4 py-16">
      <div className="w-full max-w-md text-center">
        {/* Floating hearts animation */}
        <div className="mb-2 flex justify-center gap-3 text-3xl">
          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>💖</span>
          <span className="animate-bounce" style={{ animationDelay: '150ms' }}>✨</span>
          <span className="animate-bounce" style={{ animationDelay: '300ms' }}>💖</span>
        </div>

        <h2 className="mb-1 text-4xl text-foreground" style={serif}>
          Stashed, bestie!
        </h2>
        <p className="mb-8 text-muted-foreground">
          Your link is ready to share ✨
        </p>

        {/* Share URL box */}
        <div className="mb-5 overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-lg shadow-rose-100">
          <div className="border-b border-rose-100 bg-rose-50 px-4 py-2 text-left text-xs font-bold uppercase tracking-widest text-rose-400">
            ✨ your link
          </div>
          <p className="break-all px-5 py-4 text-left font-mono text-sm text-foreground">
            {shareUrl}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleCopy}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-rose-500 py-3.5 text-sm font-bold text-white shadow-md shadow-rose-200 transition-all hover:bg-rose-600 active:scale-[0.97]"
          >
            {copied ? '✅  Copied!' : '🔗  Copy link'}
          </button>
          <button
            onClick={onReset}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-rose-200 bg-white py-3.5 text-sm font-bold text-rose-500 transition-all hover:bg-rose-50 active:scale-[0.97]"
          >
            🎀  Stash another
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
      item_url: form.item_url.trim(),
      caption: form.caption.trim() || null,
      slug,
      user_id: null,
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

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-gradient-to-br from-rose-50 via-fuchsia-50 to-pink-50 px-4 py-16">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 text-5xl">🛍️</div>
          <h1 className="text-4xl text-foreground" style={serif}>
            Add to your wishlist
          </h1>
          <p className="mt-2 text-muted-foreground">
            Drop a link. Share it. Get it. 💅
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-rose-100 bg-white p-8 shadow-2xl shadow-rose-100/60">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Item name */}
            <div className="space-y-1.5">
              <label htmlFor="item_name" className="block text-sm font-bold text-foreground">
                What is it called? <span className="text-rose-400">*</span>
              </label>
              <input
                id="item_name"
                name="item_name"
                type="text"
                value={form.item_name}
                onChange={handleChange}
                placeholder="e.g. Stanley Cup, Lululemon Align…"
                required
                className="w-full rounded-2xl border-2 border-rose-100 bg-rose-50/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition focus:border-rose-400 focus:bg-white"
              />
            </div>

            {/* URL */}
            <div className="space-y-1.5">
              <label htmlFor="item_url" className="block text-sm font-bold text-foreground">
                Paste the product link <span className="text-rose-400">*</span>
              </label>
              <input
                id="item_url"
                name="item_url"
                type="url"
                value={form.item_url}
                onChange={handleChange}
                placeholder="https://…"
                required
                className="w-full rounded-2xl border-2 border-rose-100 bg-rose-50/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition focus:border-rose-400 focus:bg-white"
              />
            </div>

            {/* Caption */}
            <div className="space-y-1.5">
              <label htmlFor="caption" className="block text-sm font-bold text-foreground">
                Add a caption{' '}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="caption"
                name="caption"
                value={form.caption}
                onChange={handleChange}
                placeholder="Why do you want this? Manifest it ✨"
                rows={3}
                className="w-full resize-none rounded-2xl border-2 border-rose-100 bg-rose-50/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition focus:border-rose-400 focus:bg-white"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-rose-500 py-4 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all hover:bg-rose-600 hover:shadow-rose-300 active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? 'Adding to wishlist…' : '✨  Add to wishlist'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          No account needed 🎀 Just link & share
        </p>
      </div>
    </div>
  )
}
