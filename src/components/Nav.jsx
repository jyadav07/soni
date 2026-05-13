import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/settings', label: 'Settings' },
]

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-amber-200/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
        <NavLink to="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-amber-500">
          <span className="text-2xl">📦</span>
          <span>Stash</span>
        </NavLink>

        <ul className="flex items-center gap-1">
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-foreground/70 hover:bg-amber-50 hover:text-amber-600'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
