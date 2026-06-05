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
        <p className="mb-2 text-[11px] font-medium tracking-widest" style={{ color: '#C0C0C0' }}>
          Added to Shoppi
        </p>
        <h2 className="mb-2 text-[28px] font-medium text-shoppi-ink">
          It's live.
        </h2>
        <p className="mb-8 text-sm" style={{ color: '#888' }}>
          Share this link and let people vote.
        </p>

        <div className="mb-5 overflow-hidden rounded border bg-white" style={{ borderColor: '#C0C0C0' }}>
          <div className="border-b px-4 py-2 text-left text-[11px] font-medium" style={{ borderColor: '#C0C0C0', background: '#fafafa', color: '#999' }}>
            Your link
          </div>
          <p className="break-all px-5 py-4 text-left font-mono text-sm text-shoppi-ink">
            {shareUrl}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleCopy}
            className="flex flex-1 items-center justify-center rounded-full py-3 text-sm font-medium text-white transition-opacity hover:opacity-80"
            style={{ background: '#E8651A' }}
          >
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <button
            onClick={onReset}
            className="flex flex-1 items-center justify-center rounded-full border py-3 text-sm font-medium text-shoppi-ink transition-colors hover:border-shoppi-orange hover:text-shoppi-orange"
            style={{ borderColor: '#C0C0C0' }}
          >
            Add another
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CreateItem() {
  const [form, setForm] = useState({
    item_name:  '',
    item_url:   '',
    caption:    '',
    event_name: '',
  })
  const [hidePrice, setHidePrice] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState(null)
  const [shareUrl, setShareUrl]     = useState(null)

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
    const { data: { user } } = await supabase.auth.getUser()
    const { error: dbError } = await supabase.from('items').insert({
      item_name:  form.item_name.trim(),
      item_url:   form.item_url.trim(),
      caption:    form.caption.trim() || null,
      event_name: form.event_name.trim() || null,
      hide_price: hidePrice,
      slug,
      user_id:    user?.id ?? null,
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
    setForm({ item_name: '', item_url: '', caption: '', event_name: '' })
    setHidePrice(false)
    setShareUrl(null)
    setError(null)
  }

  if (shareUrl) return <SuccessCard shareUrl={shareUrl} onReset={handleReset} />

  const inputClass = 'w-full rounded border bg-white px-4 py-3 text-sm text-shoppi-ink placeholder:text-[#999] outline-none transition focus:border-shoppi-orange'

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-white px-6 py-16">
      <div className="w-full max-w-md">

        <div className="mb-8">
          <p className="mb-2 text-[11px] font-medium tracking-widest" style={{ color: '#C0C0C0' }}>
            New Shoppi
          </p>
          <h1 className="text-[28px] font-medium text-shoppi-ink">
            Add to wishlist
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="item_name" className="block text-sm font-medium text-shoppi-ink">
              What is it called?
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
              style={{ borderColor: '#C0C0C0' }}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="item_url" className="block text-sm font-medium text-shoppi-ink">
              Paste the product link
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
              style={{ borderColor: '#C0C0C0' }}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="caption" className="block text-sm font-medium text-shoppi-ink">
              Add a caption{' '}
              <span className="font-normal" style={{ color: '#999' }}>(optional)</span>
            </label>
            <textarea
              id="caption"
              name="caption"
              value={form.caption}
              onChange={handleChange}
              placeholder="Why do you want this?"
              rows={3}
              className={`${inputClass} resize-none`}
              style={{ borderColor: '#C0C0C0' }}
            />
          </div>

          {/* Event mode */}
          <div className="rounded border p-4 space-y-4" style={{ borderColor: '#C0C0C0', background: '#fafafa' }}>
            <p className="text-[11px] font-medium tracking-widest" style={{ color: '#C0C0C0' }}>
              Event mode
            </p>

            <div className="space-y-1.5">
              <label htmlFor="event_name" className="block text-sm font-medium text-shoppi-ink">
                What's the occasion?{' '}
                <span className="font-normal" style={{ color: '#999' }}>(optional)</span>
              </label>
              <input
                id="event_name"
                name="event_name"
                type="text"
                value={form.event_name}
                onChange={handleChange}
                placeholder="e.g. Mia's birthday party"
                className={inputClass}
                style={{ borderColor: '#C0C0C0' }}
              />
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-4">
              <span className="text-sm text-shoppi-ink">Hide price from friends</span>
              <button
                type="button"
                role="switch"
                aria-checked={hidePrice}
                onClick={() => setHidePrice(v => !v)}
                className="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
                style={{ background: hidePrice ? '#E8651A' : '#C0C0C0' }}
              >
                <span
                  className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
                  style={{ transform: hidePrice ? 'translateX(20px)' : 'translateX(0)' }}
                />
              </button>
            </label>
          </div>

          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full py-3 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: '#E8651A' }}
          >
            {submitting ? 'Saving…' : 'Create Shoppi link'}
          </button>
        </form>
      </div>
    </div>
  )
}
