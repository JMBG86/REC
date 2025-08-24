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
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include', // Usar include para suportar CORS em produção
        mode: 'cors', // Garantir que o modo CORS esteja ativado
        body: JSON.stringify({ username, password })
      })
      
      console.log('Status da resposta:', response.status, response.statusText)
      console.log('Headers da resposta:', [...response.headers.entries()])
      
      if (!response.ok) {
        let errorMessage = `Erro ${response.status}: ${response.statusText}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          try {
            const errorText = await response.text()
            if (errorText) errorMessage = errorText
          } catch (textError) {
            console.error('Não foi possível ler o texto do erro:', textError)
          }
        }
        console.error('Resposta de erro:', errorMessage)
        throw new Error(errorMessage)
      }
      
      // Tentar obter o JSON diretamente
      try {
        const data = await response.json()
        console.log('Dados recebidos:', JSON.stringify(data))
        
        if (!data || !data.token) {
          throw new Error('Resposta inválida do servidor: token não encontrado')
        }
        
        localStorage.setItem('token', data.token)
        setToken(data.token)
        setUser(data.user)
        return { success: true }
      } catch (jsonError) {
        console.error('Erro ao processar JSON:', jsonError)
        
        // Tentar ler como texto se o JSON falhar
        const responseText = await response.text()
        console.log('Texto da resposta:', responseText)
        
        throw new Error(`Erro ao processar resposta do servidor: ${jsonError.message}`)
      }
    } catch (error) {
      console.error('Erro durante login:', error)
      setApiError(error.message || 'Falha na conexão com o servidor')
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

