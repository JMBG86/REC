import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Users as UsersIcon, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  User,
  Mail,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react'

const roleColors = {
  'admin': 'bg-red-100 text-red-800 border-red-300',
  'operador': 'bg-blue-100 text-blue-800 border-blue-300',
  'visualizador': 'bg-green-100 text-green-800 border-green-300'
}

const roleLabels = {
  'admin': 'Administrador',
  'operador': 'Operador',
  'visualizador': 'Visualizador'
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    role: 'operador',
    password: ''
  })
  const { token, API_BASE, user: currentUser } = useAuth()

  // Dados de exemplo (em produção viriam da API)
  const mockUsers = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@test.com',
      role: 'admin',
      created_at: '2024-01-15T10:00:00Z',
      is_active: true,
      last_login: '2024-08-24T09:00:00Z'
    },
    {
      id: 2,
      username: 'operador1',
      email: 'operador1@empresa.com',
      role: 'operador',
      created_at: '2024-02-01T14:30:00Z',
      is_active: true,
      last_login: '2024-08-23T16:45:00Z'
    },
    {
      id: 3,
      username: 'visualizador1',
      email: 'visualizador@empresa.com',
      role: 'visualizador',
      created_at: '2024-03-10T09:15:00Z',
      is_active: false,
      last_login: '2024-08-20T11:20:00Z'
    }
  ]

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // Em produção, faria chamada à API:
      // const response = await fetch(`${API_BASE}/users`, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // })
      // const data = await response.json()
      // setUsers(data)
      
      // Por agora, usar dados mock
      setTimeout(() => {
        setUsers(mockUsers)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Erro ao carregar utilizadores:', error)
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      // Em produção:
      // const response = await fetch(`${API_BASE}/users`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(newUser)
      // })
      
      alert('Utilizador criado com sucesso! (Funcionalidade em desenvolvimento)')
      setShowCreateDialog(false)
      setNewUser({ username: '', email: '', role: 'operador', password: '' })
      fetchUsers()
    } catch (error) {
      console.error('Erro ao criar utilizador:', error)
    }
  }

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      // Em produção:
      // await fetch(`${API_BASE}/users/${userId}/toggle-status`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // })
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_active: !currentStatus }
          : user
      ))
    } catch (error) {
      console.error('Erro ao alterar status:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Utilizadores</h1>
          <p className="text-muted-foreground">
            Gerir utilizadores do sistema ({filteredUsers.length} de {users.length})
          </p>
        </div>
        
        {currentUser?.role === 'admin' && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Utilizador
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Utilizador</DialogTitle>
                <DialogDescription>
                  Adicionar um novo utilizador ao sistema
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nome de Utilizador</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="operador">Operador</SelectItem>
                      <SelectItem value="visualizador">Visualizador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Criar</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pesquisar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as roles</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="operador">Operador</SelectItem>
                  <SelectItem value="visualizador">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Utilizadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary rounded-full p-2">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{user.username}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={roleColors[user.role]}>
                    {roleLabels[user.role]}
                  </Badge>
                  {user.is_active ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>Criado: {new Date(user.created_at).toLocaleDateString('pt-PT')}</span>
                </div>
                {user.last_login && (
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="h-3 w-3" />
                    <span>Último login: {new Date(user.last_login).toLocaleDateString('pt-PT')}</span>
                  </div>
                )}
              </div>
              
              {currentUser?.role === 'admin' && user.id !== currentUser.id && (
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleUserStatus(user.id, user.is_active)}
                    className={user.is_active ? 'text-red-600' : 'text-green-600'}
                  >
                    {user.is_active ? (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ativar
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum utilizador encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros de pesquisa.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

