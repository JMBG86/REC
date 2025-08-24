import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Car, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Calendar,
  MapPin,
  Euro
} from 'lucide-react'

const statusColors = {
  'em_tratamento': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'submetido': 'bg-blue-100 text-blue-800 border-blue-300',
  'recuperado': 'bg-green-100 text-green-800 border-green-300',
  'perdido': 'bg-red-100 text-red-800 border-red-300'
}

const statusLabels = {
  'em_tratamento': 'Em Tratamento',
  'submetido': 'Submetido',
  'recuperado': 'Recuperado',
  'perdido': 'Perdido'
}

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([])
  const [filteredVehicles, setFilteredVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [marcaFilter, setMarcaFilter] = useState('all')
  const { token, API_BASE } = useAuth()

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    filterVehicles()
  }, [vehicles, searchTerm, statusFilter, marcaFilter])

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_BASE}/vehicles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      }
    } catch (error) {
      console.error('Erro ao carregar veículos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterVehicles = () => {
    let filtered = vehicles

    // Filtro por termo de pesquisa
    if (searchTerm) {
      filtered = filtered.filter(vehicle => 
        vehicle.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vehicle.vin && vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter)
    }

    // Filtro por marca
    if (marcaFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.marca === marcaFilter)
    }

    setFilteredVehicles(filtered)
  }

  const getUniqueMarcas = () => {
    const marcas = [...new Set(vehicles.map(v => v.marca))].sort()
    return marcas
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
          <h1 className="text-2xl font-bold">Veículos</h1>
          <p className="text-muted-foreground">
            Gerir todos os veículos no sistema ({filteredVehicles.length} de {vehicles.length})
          </p>
        </div>
        <Button asChild>
          <Link to="/vehicles/new">
            <Car className="h-4 w-4 mr-2" />
            Novo Veículo
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pesquisar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Matrícula, marca, modelo, VIN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="em_tratamento">Em Tratamento</SelectItem>
                  <SelectItem value="submetido">Submetido</SelectItem>
                  <SelectItem value="recuperado">Recuperado</SelectItem>
                  <SelectItem value="perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Marca</label>
              <Select value={marcaFilter} onValueChange={setMarcaFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as marcas</SelectItem>
                  {getUniqueMarcas().map(marca => (
                    <SelectItem key={marca} value={marca}>{marca}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de veículos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{vehicle.matricula}</CardTitle>
                  <CardDescription>
                    {vehicle.marca} {vehicle.modelo}
                  </CardDescription>
                </div>
                <Badge className={statusColors[vehicle.status] || 'bg-gray-100 text-gray-800'}>
                  {statusLabels[vehicle.status] || vehicle.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {vehicle.vin && (
                <div className="text-sm text-muted-foreground">
                  <strong>VIN:</strong> {vehicle.vin}
                </div>
              )}
              
              {vehicle.valor && (
                <div className="flex items-center gap-2 text-sm">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  <span>€{parseFloat(vehicle.valor).toLocaleString('pt-PT')}</span>
                </div>
              )}
              
              {vehicle.loja_aluguer && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{vehicle.loja_aluguer}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {vehicle.data_submissao 
                    ? new Date(vehicle.data_submissao).toLocaleDateString('pt-PT')
                    : 'Data não definida'
                  }
                </span>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link to={`/vehicles/${vehicle.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link to={`/vehicles/${vehicle.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVehicles.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum veículo encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {vehicles.length === 0 
                ? 'Ainda não há veículos registados no sistema.'
                : 'Tente ajustar os filtros de pesquisa.'
              }
            </p>
            {vehicles.length === 0 && (
              <Button asChild>
                <Link to="/vehicles/new">
                  Adicionar Primeiro Veículo
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

