import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
]

export default function Nav() {
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

        <ul className="flex items-center gap-1">
          {links.map(({ to, label }) => (
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
      </div>
    </nav>
  )
}
