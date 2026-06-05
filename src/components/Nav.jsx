import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Nav() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-white" style={{ borderColor: '#C0C0C0' }}>
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="text-[18px] font-medium text-shoppi-ink"
        >
          Shoppi
        </Link>

        <div className="flex items-center gap-3">
          {session && (
            <Link
              to="/dashboard"
              className="text-sm text-shoppi-ink hover:text-shoppi-orange transition-colors"
            >
              Dashboard
            </Link>
          )}
          <Link
            to="/create"
            className="rounded-full px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
            style={{ background: '#E8651A' }}
          >
            Create link
          </Link>
          {session && (
            <button
              onClick={handleSignOut}
              className="text-sm transition-colors"
              style={{ color: '#C0C0C0' }}
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
