import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Car, 
  ArrowLeft, 
  Edit, 
  Calendar, 
  MapPin, 
  Euro, 
  FileText, 
  Plus,
  Download,
  Trash2,
  Clock,
  User,
  CheckCircle,
  AlertCircle
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

export default function VehicleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, API_BASE } = useAuth()
  
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updateForm, setUpdateForm] = useState({
    descricao: '',
    tipo: 'observacao',
    localizacao: ''
  })

  useEffect(() => {
    fetchVehicle()
  }, [id])

  const fetchVehicle = async () => {
    try {
      const response = await fetch(`${API_BASE}/vehicles/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setVehicle(data)
      }
    } catch (error) {
      console.error('Erro ao carregar veículo:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUpdate = async (e) => {
    e.preventDefault()
    
    if (!updateForm.descricao.trim()) return

    try {
      const response = await fetch(`${API_BASE}/vehicles/${id}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateForm)
      })

      if (response.ok) {
        setUpdateForm({ descricao: '', tipo: 'observacao', localizacao: '' })
        fetchVehicle() // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao adicionar atualização:', error)
    }
  }

  const handleDownloadDocument = async (docId, filename) => {
    try {
      const response = await fetch(`${API_BASE}/documents/${docId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Erro ao fazer download:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Veículo não encontrado</h2>
        <Button onClick={() => navigate('/vehicles')}>
          Voltar à lista
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/vehicles')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{vehicle.matricula}</h1>
            <p className="text-muted-foreground">
              {vehicle.marca} {vehicle.modelo}
            </p>
          </div>
          <Badge className={statusColors[vehicle.status]}>
            {statusLabels[vehicle.status]}
          </Badge>
        </div>
        <Button asChild>
          <Link to={`/vehicles/${id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Link>
        </Button>
      </div>

      {/* Informações principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">VIN:</span>
              <span className="font-mono text-sm">{vehicle.vin || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor:</span>
              <span>
                {vehicle.valor 
                  ? `€${parseFloat(vehicle.valor).toLocaleString('pt-PT')}` 
                  : 'N/A'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">NUIPC:</span>
              <span className="flex items-center gap-1">
                {vehicle.nuipc ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Sim
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    Não
                  </>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GPS Ativo:</span>
              <span className="flex items-center gap-1">
                {vehicle.gps_ativo ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Sim
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    Não
                  </>
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Datas Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Submissão:</span>
              <span>
                {vehicle.data_submissao 
                  ? new Date(vehicle.data_submissao).toLocaleDateString('pt-PT')
                  : 'N/A'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Desaparecimento:</span>
              <span>
                {vehicle.data_desaparecimento 
                  ? new Date(vehicle.data_desaparecimento).toLocaleDateString('pt-PT')
                  : 'N/A'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recuperação:</span>
              <span>
                {vehicle.data_recuperacao 
                  ? new Date(vehicle.data_recuperacao).toLocaleDateString('pt-PT')
                  : 'Pendente'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Localização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{vehicle.loja_aluguer || 'Não especificada'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Informações do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nome:</span>
                <span>{vehicle.nome_cliente || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contacto:</span>
                <span>{vehicle.contacto_cliente || 'N/A'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{vehicle.email_cliente || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">NUIPC Nº:</span>
                <span>{vehicle.numero_nuipc || 'N/A'}</span>
              </div>
            </div>
            {vehicle.morada_cliente && (
              <div className="md:col-span-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Morada:</span>
                  <span>{vehicle.morada_cliente}</span>
                </div>
              </div>
            )}
            {vehicle.observacoes_cliente && (
              <div className="md:col-span-2">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-sm">Observações sobre o Cliente:</span>
                  <p className="text-sm bg-gray-50 p-2 rounded">{vehicle.observacoes_cliente}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      {vehicle.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{vehicle.observacoes}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs para Timeline e Documentos */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">
            Timeline ({vehicle.atualizacoes?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documentos ({vehicle.documentos?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          {/* Formulário para adicionar atualização */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Atualização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo</label>
                    <Select 
                      value={updateForm.tipo} 
                      onValueChange={(value) => setUpdateForm(prev => ({...prev, tipo: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="observacao">Observação</SelectItem>
                        <SelectItem value="localizacao">Localização</SelectItem>
                        <SelectItem value="acao">Ação Tomada</SelectItem>
                        <SelectItem value="contacto">Contacto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Localização (opcional)</label>
                    <Input
                      value={updateForm.localizacao}
                      onChange={(e) => setUpdateForm(prev => ({...prev, localizacao: e.target.value}))}
                      placeholder="Rua, cidade..."
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    value={updateForm.descricao}
                    onChange={(e) => setUpdateForm(prev => ({...prev, descricao: e.target.value}))}
                    placeholder="Descreva a atualização..."
                    required
                  />
                </div>
                
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Lista de atualizações */}
          <div className="space-y-4">
            {vehicle.atualizacoes && vehicle.atualizacoes.length > 0 ? (
              vehicle.atualizacoes.map((update, index) => (
                <Card key={update.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{update.tipo}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(update.data_atualizacao).toLocaleString('pt-PT')}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{update.descricao}</p>
                        {update.localizacao && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{update.localizacao}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Ainda não há atualizações para este veículo.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          {/* Lista de documentos */}
          <div className="space-y-4">
            {vehicle.documentos && vehicle.documentos.length > 0 ? (
              vehicle.documentos.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.nome_original}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{doc.tipo_documento}</span>
                            <span>
                              {new Date(doc.data_upload).toLocaleDateString('pt-PT')}
                            </span>
                            {doc.tamanho_ficheiro && (
                              <span>
                                {(doc.tamanho_ficheiro / 1024 / 1024).toFixed(2)} MB
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadDocument(doc.id, doc.nome_original)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Ainda não há documentos para este veículo.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

