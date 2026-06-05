import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode]         = useState('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [notice, setNotice]     = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!supabase) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
      return
    }
    setLoading(true)
    setError(null)
    setNotice(null)

    if (mode === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) { setError(err.message); setLoading(false) }
      else navigate('/dashboard')
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password })
      if (err) { setError(err.message); setLoading(false) }
      else {
        setNotice('Check your email to confirm your account, then sign in.')
        setMode('login')
        setLoading(false)
      }
    }
  }

  function toggleMode() {
    setMode(m => m === 'login' ? 'signup' : 'login')
    setError(null)
    setNotice(null)
  }

  const inputClass = 'w-full rounded border bg-white px-4 py-3 text-sm text-shoppi-ink outline-none transition focus:border-shoppi-orange placeholder:text-[#999]'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">

        <div className="mb-10 text-center">
          <p className="text-[18px] font-medium text-shoppi-ink">Shoppi</p>
          <p className="mt-1 text-[11px] font-medium tracking-widest" style={{ color: '#C0C0C0' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        <h1 className="mb-8 text-[28px] font-medium text-shoppi-ink">
          {mode === 'login' ? 'Sign in' : 'Join Shoppi'}
        </h1>

        {notice && (
          <div className="mb-5 rounded border px-4 py-3 text-sm text-shoppi-ink" style={{ borderColor: '#C5D93A', background: '#f9ffe0' }}>
            {notice}
          </div>
        )}
        {error && (
          <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-shoppi-ink">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className={inputClass}
              style={{ borderColor: '#C0C0C0' }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-shoppi-ink">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className={inputClass}
              style={{ borderColor: '#C0C0C0' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-3 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: '#E8651A' }}
          >
            {loading
              ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
              : (mode === 'login' ? 'Sign in' : 'Create account')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: '#888' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={toggleMode}
            className="font-medium transition-opacity hover:opacity-70"
            style={{ color: '#E8608A' }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

      </div>
    </div>
  )
}
