import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/tasks', label: 'Tasks' },
  { to: '/people', label: 'People' },
  { to: '/offerings', label: 'Offerings' },
  { to: '/chat', label: 'Chat' },
  { to: '/console', label: 'API Console' },
]

export function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-full">
      <aside className="flex w-56 shrink-0 flex-col border-r border-slate-800 bg-slate-900/80 p-4">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-white">GodTasker</h1>
          <p className="text-xs text-slate-500">web client</p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm transition ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-slate-800 pt-4 text-xs text-slate-400">
          <p className="truncate font-medium text-slate-200">
            {user?.user_name ?? user?.email}
          </p>
          <p className="mb-2 truncate text-slate-500">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="text-rose-400 hover:text-rose-300"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
