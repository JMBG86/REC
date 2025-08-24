import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Car, Shield } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, login, API_BASE } = useAuth()
  
  // Log para verificar a URL da API
  useEffect(() => {
    console.log('URL da API configurada:', API_BASE)
    // Testar a conexão com o backend
    fetch(`${API_BASE}/health`, { method: 'GET' })
      .then(response => {
        console.log('Teste de conexão com backend:', response.status, response.statusText)
        return response.text()
      })
      .then(data => console.log('Resposta do teste de conexão:', data))
      .catch(err => console.error('Erro no teste de conexão com backend:', err))
  }, [API_BASE])

  // Se já está logado, redirecionar
  if (user) {
    return <Navigate to="/" />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    console.log('Iniciando processo de login')
    console.log('Credenciais:', { username, password: '***' })
    console.log('URL completa de login:', `${API_BASE}/auth/login`)

    try {
      // Verificar se a API está acessível antes de tentar login
      console.log('Verificando CORS e disponibilidade da API...')
      try {
        // Adiciona timestamp para evitar cache
        const timestamp = new Date().getTime()
        const preflightCheck = await fetch(`${API_BASE}/auth/login?_=${timestamp}`, { 
          method: 'OPTIONS',
          headers: {
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type, Authorization'
          },
          credentials: 'include',
          mode: 'cors'
        })
        console.log('Resposta do preflight:', preflightCheck.status, preflightCheck.statusText)
        console.log('Headers do preflight:', [...preflightCheck.headers.entries()])
      } catch (preflightErr) {
        console.error('Erro no preflight CORS:', preflightErr)
      }
      
      console.log('Enviando requisição de login...')
      const result = await login(username, password)
      console.log('Resultado do login:', result)
      
      if (!result.success) {
        console.error('Falha no login:', result.error)
        setError(result.error || 'Falha na autenticação. Tente novamente.')
      } else {
        console.log('Login bem-sucedido!')
      }
    } catch (err) {
      console.error('Erro no processo de login:', err)
      console.error('Detalhes do erro:', err.message, err.stack)
      setError('Erro inesperado. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary rounded-full p-3">
              <Car className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Recuperação</h1>
          <p className="text-gray-600 mt-2">Gestão de Veículos Desaparecidos</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Iniciar Sessão
            </CardTitle>
            <CardDescription>
              Aceda ao sistema com as suas credenciais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Nome de utilizador</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Introduza o seu nome de utilizador"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Introduza a sua password"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'A entrar...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Sistema seguro de gestão de veículos</p>
        </div>
      </div>
    </div>
  )
}

