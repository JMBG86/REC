import { createContext, useContext, useState, useEffect } from 'react'
import { API_BASE, apiRequest } from '../utils/api'

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
  const [apiError, setApiError] = useState(null)

  useEffect(() => {
    if (token) {
      // Verificar se o token é válido
      console.log('Verificando token...')
      apiRequest('auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
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
  }, [token])

  const login = async (username, password) => {
    try {
      setApiError(null) // Limpa erros anteriores
      
      console.log('Enviando requisição para:', `${API_BASE}/auth/login`)
      
      // Usar fetch diretamente para ter mais controle sobre o processo
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'same-origin', // Importante para cookies de sessão no mesmo servidor
        body: JSON.stringify({ username, password })
      })
      
      console.log('Status da resposta:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Resposta de erro:', errorText)
        throw new Error(errorText || `Erro ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Dados recebidos:', JSON.stringify(data))
      
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      return { success: true }
    } catch (error) {
      console.error('Erro durante login:', error)
      return { success: false, error: error.message || 'Falha na conexão com o servidor' }
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
    API_BASE,
    apiError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

