import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Car, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Euro
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function PainelDeControlo() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { token, API_BASE } = useAuth()

  // Comentário de teste para verificar hot-reloading no frontend
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas do Painel de Controlo:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center text-muted-foreground">
        Erro ao carregar dados do Painel de Controlo
      </div>
    )
  }

  const statusData = [
    { name: 'Em Tratamento', value: stats.em_tratamento, color: '#FFBB28' },
    { name: 'Submetidos', value: stats.submetidos, color: '#0088FE' },
    { name: 'Recuperados', value: stats.recuperados, color: '#00C49F' },
    { name: 'Perdidos', value: stats.perdidos, color: '#FF8042' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-green-500">PAINEL DE CONTROLO</h1>
        <p className="text-muted-foreground">Visão geral do Painel de Controlo do sistema de recuperação de veículos</p>
      </div>

      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Veículos em sistema</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_vehicles}</div>
            <p className="text-xs text-muted-foreground">
              Registados no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Tratamento</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.em_tratamento}</div>
            <p className="text-xs text-muted-foreground">
              Casos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recuperados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recuperados}</div>
            <p className="text-xs text-muted-foreground">
              Casos resolvidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor em Falta</CardTitle>
            <Euro className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{stats.valor_total_em_falta.toLocaleString('pt-PT')}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor total não recuperado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de status */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
            <CardDescription>
              Estado atual dos veículos no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de marcas */}
        <Card>
          <CardHeader>
            <CardTitle>Veículos por Marca</CardTitle>
            <CardDescription>
              Distribuição dos veículos por marca
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.marca_stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="marca" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas por loja */}
      {stats.loja_stats && stats.loja_stats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Veículos por Loja de Aluguer</CardTitle>
            <CardDescription>
              Distribuição dos casos por loja de origem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.loja_stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="loja" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Alertas e resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Casos Urgentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm">
                {stats.em_tratamento} casos requerem atenção
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Taxa de Recuperação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                {stats.total_vehicles > 0 
                  ? ((stats.recuperados / stats.total_vehicles) * 100).toFixed(1)
                  : 0}% recuperados
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Status Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={stats.em_tratamento > 0 ? "destructive" : "default"}>
              {stats.em_tratamento > 0 ? "Casos Pendentes" : "Tudo em Ordem"}
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

