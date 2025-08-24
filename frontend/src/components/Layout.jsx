import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  Car, 
  LayoutDashboard, 
  FileText, 
  Users, 
  LogOut, 
  Menu,
  Plus,
  Search,
  Mail,
  Settings
} from 'lucide-react'

const getNavigation = (user) => {
  const baseNavigation = [
    { name: 'Painel de Controlo', href: '/', icon: LayoutDashboard },
    { name: 'Veículos', href: '/vehicles', icon: Car },
    { name: 'Email Triggers', href: '/email-triggers', icon: Mail },
    { name: 'Relatórios', href: '/reports', icon: FileText },
    { name: 'Utilizadores', href: '/users', icon: Users },
  ]
  
  // Adicionar link para o painel de administração apenas para administradores
  if (user?.role === 'admin') {
    baseNavigation.push({ name: 'Administração', href: '/admin', icon: Settings })
  }
  
  return baseNavigation
}

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  
  // Obter a navegação com base no usuário
  const navigation = getNavigation(user)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? 'w-full' : 'w-64'} bg-card border-r`}>
      <div className="flex items-center gap-2 p-6 border-b">
        <div className="bg-primary rounded-lg p-2">
          <Car className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-lg">CarFind</h1>
          <p className="text-sm text-muted-foreground">Sistema de Gestão de Veículos</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => mobile && setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-secondary rounded-full p-2">
            <Users className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="w-full"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar desktop */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Sidebar mobile */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b px-4 py-3 flex items-center justify-between lg:px-6">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <Sidebar mobile />
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">
                {navigation.find(nav => nav.href === location.pathname)?.name || 'Sistema'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {location.pathname === '/vehicles' && (
              <Button size="sm" asChild>
                <Link to="/vehicles/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Veículo
                </Link>
              </Button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

