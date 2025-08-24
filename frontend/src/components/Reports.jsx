import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  FileText, 
  Download, 
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Car
} from 'lucide-react'

export default function Reports() {
  const [reportType, setReportType] = useState('summary')
  const [dateRange, setDateRange] = useState('last_month')
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(false)
  const { token, API_BASE } = useAuth()

  const reportTypes = [
    { value: 'summary', label: 'Relatório Resumo', icon: BarChart3 },
    { value: 'detailed', label: 'Relatório Detalhado', icon: FileText },
    { value: 'statistics', label: 'Estatísticas Avançadas', icon: PieChart },
    { value: 'recovery', label: 'Taxa de Recuperação', icon: TrendingUp },
    { value: 'vehicles', label: 'Lista de Veículos', icon: Car }
  ]

  const dateRanges = [
    { value: 'last_week', label: 'Última Semana' },
    { value: 'last_month', label: 'Último Mês' },
    { value: 'last_3_months', label: 'Últimos 3 Meses' },
    { value: 'last_6_months', label: 'Últimos 6 Meses' },
    { value: 'last_year', label: 'Último Ano' },
    { value: 'custom', label: 'Período Personalizado' }
  ]

  const statusOptions = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'em_tratamento', label: 'Em Tratamento' },
    { value: 'submetido', label: 'Submetido' },
    { value: 'recuperado', label: 'Recuperado' },
    { value: 'perdido', label: 'Perdido' }
  ]

  const generateReport = async () => {
    setLoading(true)
    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Em implementação real, faria chamada à API:
      // const response = await fetch(`${API_BASE}/reports/generate`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify({ type: reportType, dateRange, status })
      // })
      
      alert('Relatório gerado com sucesso! (Funcionalidade em desenvolvimento)')
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground">
          Gerar relatórios personalizados sobre veículos e estatísticas
        </p>
      </div>

      {/* Configuração do Relatório */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Configurar Relatório
          </CardTitle>
          <CardDescription>
            Selecione os parâmetros para gerar o relatório desejado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => {
                    const Icon = type.icon
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Período</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {dateRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Início</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Data Fim</Label>
                <Input type="date" />
              </div>
            </div>
          )}

          <Button onClick={generateReport} disabled={loading} className="w-full md:w-auto">
            <Download className="h-4 w-4 mr-2" />
            {loading ? 'A gerar relatório...' : 'Gerar Relatório'}
          </Button>
        </CardContent>
      </Card>

      {/* Relatórios Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Resumo Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Estatísticas gerais do último mês
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Gerar
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Taxa de Recuperação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Análise de performance de recuperação
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Gerar
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Car className="h-4 w-4" />
              Veículos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Lista de todos os casos ativos
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Gerar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico de Relatórios
          </CardTitle>
          <CardDescription>
            Relatórios gerados anteriormente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum relatório gerado ainda.</p>
            <p className="text-sm">Os relatórios gerados aparecerão aqui para download.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

