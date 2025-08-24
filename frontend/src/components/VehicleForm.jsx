import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Car, Save, ArrowLeft, User, FileText } from 'lucide-react'

export default function VehicleForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, API_BASE } = useAuth()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    matricula: '',
    marca: '',
    modelo: '',
    car_brand_id: '',
    store_location_id: '',
    vin: '',
    valor: '',
    nuipc: false,
    nuipc_numero: '',
    gps_ativo: false,
    status: 'em_tratamento',
    data_desaparecimento: '',
    loja_aluguer: '',
    observacoes: '',
    cliente_nome: '',
    cliente_contacto: '',
    cliente_morada: '',
    cliente_email: '',
    cliente_observacoes: ''
  })
  
  const [carBrands, setCarBrands] = useState([])
  const [storeLocations, setStoreLocations] = useState([])

  useEffect(() => {
    fetchCarBrands()
    fetchStoreLocations()
    
    if (isEditing) {
      fetchVehicle()
    }
  }, [id])

  const fetchCarBrands = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/car-brands`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCarBrands(data.data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar marcas:', error)
    }
  }
  

  
  const fetchStoreLocations = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/store-locations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStoreLocations(data.data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar localizações:', error)
    }
  }

  const fetchVehicle = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/vehicles/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const vehicle = await response.json()
        setFormData({
          matricula: vehicle.matricula || '',
          marca: vehicle.marca || '',
          modelo: vehicle.modelo || '',
          car_brand_id: vehicle.car_brand_id?.toString() || '',
          store_location_id: vehicle.store_location_id?.toString() || '',
          vin: vehicle.vin || '',
          valor: vehicle.valor || '',
          nuipc: vehicle.nuipc || false,
          nuipc_numero: vehicle.nuipc_numero || '',
          gps_ativo: vehicle.gps_ativo || false,
          status: vehicle.status || 'em_tratamento',
          data_desaparecimento: vehicle.data_desaparecimento 
            ? vehicle.data_desaparecimento.split('T')[0] 
            : '',
          loja_aluguer: vehicle.loja_aluguer || '',
          observacoes: vehicle.observacoes || '',
          cliente_nome: vehicle.cliente_nome || '',
          cliente_contacto: vehicle.cliente_contacto || '',
          cliente_morada: vehicle.cliente_morada || '',
          cliente_email: vehicle.cliente_email || '',
          cliente_observacoes: vehicle.cliente_observacoes || ''
        })
        

      } else {
        setError('Erro ao carregar dados do veículo')
      }
    } catch (error) {
      setError('Erro ao carregar dados do veículo')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const url = isEditing 
        ? `${API_BASE}/vehicles/${id}`
        : `${API_BASE}/vehicles`
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSuccess(isEditing ? 'Veículo atualizado com sucesso!' : 'Veículo criado com sucesso!')
        setTimeout(() => {
          navigate('/vehicles')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Erro ao salvar veículo')
      }
    } catch (error) {
      setError('Erro ao salvar veículo')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCheckboxChange = (field, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }))
  }

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/vehicles')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Editar Veículo' : 'Novo Veículo'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Atualizar informações do veículo' : 'Adicionar um novo veículo ao sistema'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Informações do Veículo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Informações do Veículo
            </CardTitle>
            <CardDescription>
              Preencha todos os campos obrigatórios marcados com *
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula *</Label>
                <Input
                  id="matricula"
                  value={formData.matricula}
                  onChange={(e) => handleInputChange('matricula', e.target.value)}
                  placeholder="XX-XX-XX"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="car_brand_id">Marca *</Label>
                <Select
                  value={formData.car_brand_id}
                  onValueChange={(value) => {
                    handleInputChange('car_brand_id', value)
                    // Limpar o modelo quando a marca mudar
                    handleInputChange('car_model_id', '')
                    // Atualizar o campo de texto da marca para compatibilidade
                    const selectedBrand = carBrands.find(brand => brand.id.toString() === value)
                    handleInputChange('marca', selectedBrand ? selectedBrand.name : '')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {carBrands.map(brand => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  value={formData.modelo}
                  onChange={(e) => handleInputChange('modelo', e.target.value)}
                  placeholder="Digite o modelo do veículo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="store_location_id">Localização da Loja *</Label>
                <Select
                  value={formData.store_location_id}
                  onValueChange={(value) => {
                    handleInputChange('store_location_id', value)
                    // Atualizar o campo de texto da loja para compatibilidade
                    const selectedLocation = storeLocations.find(location => location.id.toString() === value)
                    handleInputChange('loja_aluguer', selectedLocation ? selectedLocation.nome : '')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma localização" />
                  </SelectTrigger>
                  <SelectContent>
                    {storeLocations.map(location => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vin">VIN</Label>
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => handleInputChange('vin', e.target.value)}
                  placeholder="17 caracteres"
                  maxLength={17}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (€)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => handleInputChange('valor', e.target.value)}
                  placeholder="25000.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="em_tratamento">Em Tratamento</SelectItem>
                    <SelectItem value="submetido">Submetido</SelectItem>
                    <SelectItem value="recuperado">Recuperado</SelectItem>
                    <SelectItem value="perdido">Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Data e Loja */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_desaparecimento">Data de Desaparecimento</Label>
                <Input
                  id="data_desaparecimento"
                  type="date"
                  value={formData.data_desaparecimento}
                  onChange={(e) => handleInputChange('data_desaparecimento', e.target.value)}
                />
              </div>
              
              {/* Campo removido pois agora usamos o dropdown de localização */}
            </div>

            {/* Checkboxes e NUIPC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="nuipc"
                    checked={formData.nuipc}
                    onCheckedChange={(checked) => handleCheckboxChange('nuipc', checked)}
                  />
                  <Label htmlFor="nuipc">Tem NUIPC (Queixa na Polícia)</Label>
                </div>
                
                {formData.nuipc && (
                  <div className="space-y-2">
                    <Label htmlFor="nuipc_numero">Número NUIPC</Label>
                    <Input
                      id="nuipc_numero"
                      value={formData.nuipc_numero}
                      onChange={(e) => handleInputChange('nuipc_numero', e.target.value)}
                      placeholder="Número da queixa"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gps_ativo"
                  checked={formData.gps_ativo}
                  onCheckedChange={(checked) => handleCheckboxChange('gps_ativo', checked)}
                />
                <Label htmlFor="gps_ativo">Pedido de GPS Ativo</Label>
              </div>
            </div>

            {/* Observações do Veículo */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Informações adicionais sobre o veículo..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Cliente
            </CardTitle>
            <CardDescription>
              Dados da pessoa que alugou o veículo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliente_nome">Nome do Cliente</Label>
                <Input
                  id="cliente_nome"
                  value={formData.cliente_nome}
                  onChange={(e) => handleInputChange('cliente_nome', e.target.value)}
                  placeholder="Nome completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cliente_contacto">Contacto</Label>
                <Input
                  id="cliente_contacto"
                  value={formData.cliente_contacto}
                  onChange={(e) => handleInputChange('cliente_contacto', e.target.value)}
                  placeholder="Telefone ou telemóvel"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="cliente_morada">Morada</Label>
                <Input
                  id="cliente_morada"
                  value={formData.cliente_morada}
                  onChange={(e) => handleInputChange('cliente_morada', e.target.value)}
                  placeholder="Morada completa"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cliente_email">Email</Label>
                <Input
                  id="cliente_email"
                  type="email"
                  value={formData.cliente_email}
                  onChange={(e) => handleInputChange('cliente_email', e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cliente_observacoes">Observações sobre o Cliente</Label>
              <Textarea
                id="cliente_observacoes"
                value={formData.cliente_observacoes}
                onChange={(e) => handleInputChange('cliente_observacoes', e.target.value)}
                placeholder="Informações adicionais sobre o cliente..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'A guardar...' : (isEditing ? 'Atualizar Veículo' : 'Criar Veículo')}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/vehicles')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}

