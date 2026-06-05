import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const serif = { fontFamily: "'DM Serif Display', serif" }

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode]       = useState('login') // 'login' | 'signup'
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [notice, setNotice]   = useState(null)

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
      if (err) {
        setError(err.message)
        setLoading(false)
      } else {
        navigate('/dashboard')
      }
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password })
      if (err) {
        setError(err.message)
        setLoading(false)
      } else {
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

  const inputClass =
    'w-full rounded border border-stash-silver bg-white px-4 py-3 text-sm text-stash-black placeholder:text-stash-black/30 outline-none transition focus:border-stash-orange'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">

        {/* Wordmark */}
        <div className="mb-10 text-center">
          <p
            className="text-3xl font-extrabold uppercase tracking-widest text-stash-black"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '0.15em' }}
          >
            Stash
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-stash-silver">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Heading */}
        <h1 className="mb-8 text-4xl leading-tight text-stash-black" style={serif}>
          {mode === 'login' ? 'Sign in.' : 'Join Stash.'}
        </h1>

        {/* Notice (post-signup) */}
        {notice && (
          <div className="mb-5 rounded border border-stash-chartreuse bg-stash-chartreuse/10 px-4 py-3 text-sm text-stash-black">
            {notice}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stash-black">
              Email <span className="text-stash-orange">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stash-black">
              Password <span className="text-stash-orange">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: '#E8651A' }}
          >
            {loading
              ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
              : (mode === 'login' ? 'Sign in' : 'Create account')}
          </button>
        </form>

        {/* Toggle */}
        <p className="mt-6 text-center text-sm text-stash-black/50">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={toggleMode}
            className="font-bold transition-opacity hover:opacity-70"
            style={{ color: '#E8608A' }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

      </div>
    </div>
  )
}
