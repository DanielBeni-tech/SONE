import { createContext, useContext, useState, type ReactNode } from 'react'
import { apiPost } from '../api/client'

interface User {
  id: number
  pseudo: string
  role: string
  level: string | null
  is_online: boolean
  network_type: string
}

interface AuthContextValue {
  token: string | null
  user: User | null
  login: (pseudo: string, password: string) => Promise<void>
  register: (pseudo: string, password: string, level: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  )

  const persist = (t: string, u: User) => {
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
    setToken(t)
    setUser(u)
  }

  const login = async (pseudo: string, password: string) => {
    const res = await apiPost<{ access_token: string; user: User }>('/auth/login', { pseudo, password })
    persist(res.access_token, res.user)
  }

  const register = async (pseudo: string, password: string, level: string) => {
    const res = await apiPost<{ access_token: string; user: User }>('/auth/register', { pseudo, password, level })
    persist(res.access_token, res.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
