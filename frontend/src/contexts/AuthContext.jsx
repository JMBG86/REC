import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // API base URL - usando variável de ambiente
  const API_BASE = import.meta.env.VITE_API_BASE || '/api'

  useEffect(() => {
    if (token) {
      // Verificar se o token é válido
      console.log('Verificando token em:', `${API_BASE}/auth/me`)
      fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        console.log('Resposta da verificação do token:', response.status)
        if (response.ok) {
          return response.json()
        } else {
          throw new Error('Token inválido')
        }
      })
      .then(userData => {
        console.log('Dados do usuário recebidos')
        setUser(userData)
      })
      .catch((error) => {
        console.error('Erro na verificação do token:', error)
        localStorage.removeItem('token')
        setToken(null)
      })
      .finally(() => {
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [token, API_BASE])

  const login = async (username, password) => {
    try {
      console.log('Tentando login em:', `${API_BASE}/auth/login`)
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      console.log('Resposta do login:', response.status)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro no login')
      }

      const data = await response.json()
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      return { success: true }
    } catch (error) {
      console.error('Erro durante login:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    API_BASE
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

