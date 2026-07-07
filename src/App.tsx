import { Navigate, Route, Routes } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './auth/AuthContext'
import { Layout } from './components/Layout'

// Route-level code splitting: each page loads on first visit instead of
// shipping in the main bundle.
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })))
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Tasks = lazy(() => import('./pages/Tasks').then(m => ({ default: m.Tasks })))
const People = lazy(() => import('./pages/People').then(m => ({ default: m.People })))
const PersonProfile = lazy(() =>
  import('./pages/PersonProfile').then(m => ({ default: m.PersonProfile }))
)
const Offerings = lazy(() => import('./pages/Offerings').then(m => ({ default: m.Offerings })))
const Chat = lazy(() => import('./pages/Chat').then(m => ({ default: m.Chat })))
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })))
const ApiConsole = lazy(() =>
  import('./pages/ApiConsole').then(m => ({ default: m.ApiConsole }))
)

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PageFallback() {
  return (
    <div className="flex h-full items-center justify-center p-12 text-sm text-slate-400">
      Loading…
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/people" element={<People />} />
          <Route path="/people/:id" element={<PersonProfile />} />
          <Route path="/offerings" element={<Offerings />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/console" element={<ApiConsole />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
