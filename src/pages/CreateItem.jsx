import { useState } from 'react'
import { supabase } from '../lib/supabase'

function generateSlug() {
  return Math.random().toString(36).slice(2, 8)
}

const FIELDS = [
  {
    name: 'item_name',
    label: 'What is it called?',
    type: 'text',
    placeholder: 'Air Jordan 1, Vitamix 5200…',
    required: true,
    multiline: false,
  },
  {
    name: 'item_url',
    label: 'Paste the product link',
    type: 'url',
    placeholder: 'https://…',
    required: true,
    multiline: false,
  },
  {
    name: 'caption',
    label: 'Add a caption (optional)',
    type: 'text',
    placeholder: 'Why do you want this? Tell your story…',
    required: false,
    multiline: true,
  },
]

function SuccessCard({ shareUrl, onReset }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-start justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 px-4 py-16">
      <div className="w-full max-w-lg text-center">
        {/* Celebration */}
        <div className="mb-6 animate-bounce text-6xl">🎉</div>
        <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-foreground">
          Item stashed!
        </h2>
        <p className="mb-8 text-muted-foreground">
          Share this link with anyone to show them what you want.
        </p>

        {/* Share URL */}
        <div className="mb-4 overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-lg shadow-amber-100/50">
          <div className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-left text-xs font-semibold uppercase tracking-widest text-amber-600">
            Your shareable link
          </div>
          <p className="break-all px-5 py-4 text-left font-mono text-sm text-foreground">
            {shareUrl}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleCopy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-sm font-bold text-white shadow-md shadow-amber-200 transition-all hover:bg-amber-600 active:scale-[0.98]"
          >
            {copied ? (
              <>
                <span>✅</span> Copied!
              </>
            ) : (
              <>
                <span>📋</span> Copy link
              </>
            )}
          </button>
          <button
            onClick={onReset}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-white py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-amber-50 active:scale-[0.98]"
          >
            <span>➕</span> Stash another
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

  if (shareUrl) {
    return <SuccessCard shareUrl={shareUrl} onReset={handleReset} />
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-start justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-3xl shadow-lg shadow-amber-200">
            📦
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Stash an item
          </h1>
          <p className="mt-1 text-muted-foreground">
            Save anything you want and share it in one link.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-amber-100 bg-white p-8 shadow-xl shadow-amber-100/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {FIELDS.map(({ name, label, type, placeholder, required, multiline }) => (
              <div key={name} className="space-y-1.5">
                <label
                  htmlFor={name}
                  className="block text-sm font-semibold text-foreground"
                >
                  {label}
                  {required && <span className="ml-1 text-amber-500">*</span>}
                </label>
                {multiline ? (
                  <textarea
                    id={name}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-input bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-shadow focus:ring-2 focus:ring-amber-400 focus:ring-offset-1"
                  />
                ) : (
                  <input
                    id={name}
                    name={name}
                    type={type}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    required={required}
                    className="w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-shadow focus:ring-2 focus:ring-amber-400 focus:ring-offset-1"
                  />
                )}
              </div>
            ))}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-amber-500 py-3.5 text-sm font-bold text-white shadow-md shadow-amber-200 transition-all hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-200 active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? 'Stashing…' : '✨ Stash it'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
