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
  const [apiError, setApiError] = useState(null)

  // API base URL - usando variável de ambiente ou URL direta como fallback
  // Garantindo que sempre usamos a URL completa do backend em produção
  const API_BASE = import.meta.env.VITE_API_BASE || 'https://rec2.onrender.com/api'

  useEffect(() => {
    if (token) {
      // Verificar se o token é válido
      console.log('Verificando token em:', `${API_BASE}/auth/me`)
      fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include',
        mode: 'cors'
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
      setApiError(null) // Limpa erros anteriores
      console.log('Tentando login em:', `${API_BASE}/auth/login`)
      console.log('Versão da API:', import.meta.env.VITE_API_BASE)
      console.log('Ambiente:', import.meta.env.MODE)
      
      // Log detalhado da requisição
      const requestBody = JSON.stringify({ username, password: '***' })
      console.log('Corpo da requisição:', requestBody)
      console.log('Headers da requisição:', {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      })
      
      // Fazer a requisição com logs detalhados
      console.log('Iniciando fetch para:', `${API_BASE}/auth/login`)
      const startTime = performance.now()
      
      // Adiciona um timestamp para evitar cache
      const timestamp = new Date().getTime()
      const url = `${API_BASE}/auth/login?_=${timestamp}`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // Tentar incluir cookies se necessário
        mode: 'cors' // Garantir que estamos usando CORS
      })
      
      const endTime = performance.now()
      console.log(`Requisição completada em ${endTime - startTime}ms`)
      console.log('Resposta do login - Status:', response.status)
      console.log('Resposta do login - Status Text:', response.statusText)
      console.log('Resposta do login - Headers:', [...response.headers.entries()])
      console.log('Resposta do login - Type:', response.type)
      console.log('Resposta do login - URL:', response.url)
      
      if (!response.ok) {
        console.error('Resposta não-OK recebida:', response.status, response.statusText)
        let errorData = {}
        try {
          errorData = await response.json()
          console.error('Detalhes do erro:', errorData)
        } catch (parseError) {
          console.error('Erro ao analisar resposta de erro:', parseError)
          const responseText = await response.text()
          console.error('Texto da resposta de erro:', responseText)
          errorData = { message: 'Erro no formato da resposta' }
        }
        throw new Error(errorData.message || `Erro no login: ${response.status}`)
      }

      console.log('Analisando resposta JSON...')
      const data = await response.json()
      console.log('Dados recebidos:', { ...data, token: data.token ? '***' : null })
      
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      return { success: true }
    } catch (error) {
      console.error('Erro durante login:', error)
      console.error('Stack trace:', error.stack)
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
    API_BASE,
    apiError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

