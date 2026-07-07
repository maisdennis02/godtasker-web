import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './auth/AuthContext'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Tasks } from './pages/Tasks'
import { People } from './pages/People'
import { PersonProfile } from './pages/PersonProfile'
import { Offerings } from './pages/Offerings'
import { Chat } from './pages/Chat'
import { Profile } from './pages/Profile'
import { ApiConsole } from './pages/ApiConsole'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
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
  )
}
