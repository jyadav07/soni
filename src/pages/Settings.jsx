import { useState } from 'react'

const STORAGE_KEY = 'stash_anthropic_key'

export default function Settings() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '')
  const [visible, setVisible] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave(e) {
    e.preventDefault()
    localStorage.setItem(STORAGE_KEY, apiKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-start justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-3xl shadow-lg shadow-amber-200">
            🔑
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="mt-1 text-muted-foreground">
            Connect your Anthropic API key to power Stash.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-amber-100 bg-white p-8 shadow-xl shadow-amber-100/50">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="api-key"
                className="block text-sm font-semibold text-foreground"
              >
                Anthropic API Key
              </label>

              <div className="flex overflow-hidden rounded-xl border border-input ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-amber-400 focus-within:ring-offset-1">
                <input
                  id="api-key"
                  type={visible ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => { setApiKey(e.target.value); setSaved(false) }}
                  placeholder="sk-ant-…"
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 bg-transparent px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setVisible((v) => !v)}
                  className="flex items-center gap-1.5 border-l border-input bg-secondary/50 px-4 text-xs font-semibold text-muted-foreground transition-colors hover:bg-amber-50 hover:text-amber-600"
                >
                  {visible ? '🙈 Hide' : '👁 Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-white shadow-md shadow-amber-200 transition-all hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-200 active:scale-[0.98]"
            >
              Save API Key
            </button>

            {saved && (
              <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                <span>✅</span>
                <span>Saved! Your key is stored in this browser.</span>
              </div>
            )}
          </form>
        </div>

        {/* Warning */}
        <div className="mt-5 flex gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3.5 text-sm text-orange-800">
          <span className="mt-0.5 shrink-0">⚠️</span>
          <p>
            <strong>Keep this page private</strong> — your key is visible in the browser. Do not share your Stash URL publicly.
          </p>
        </div>
      </div>
    </div>
  )
}
