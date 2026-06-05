import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
]

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
    <nav className="sticky top-0 z-50 border-b border-stash-silver bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <NavLink
          to="/"
          className="text-xl font-extrabold uppercase tracking-widest text-stash-black"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '0.15em' }}
        >
          Stash
        </NavLink>

        <div className="flex items-center gap-1">
          <ul className="flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `rounded px-4 py-1.5 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-stash-orange text-white'
                        : 'text-stash-black hover:text-stash-orange'
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {session && (
            <button
              onClick={handleSignOut}
              className="ml-3 rounded border px-4 py-1.5 text-sm font-semibold transition-colors"
              style={{ borderColor: '#E8608A', color: '#E8608A' }}
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
