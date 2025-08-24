import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function StoreLocationManager() {
  const { API_BASE, token } = useAuth()
  const [locations, setLocations] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [formData, setFormData] = useState({
    nome: '',
    rent_a_car_id: '',
    endereco: '',
    cidade: '',
    codigo_postal: '',
    pais: 'Portugal',
    contacto_telefone: '',
    contacto_email: '',
    horario_funcionamento: '',
    is_active: true
  })
  const [submitting, setSubmitting] = useState(false)

  // Carregar localizações e empresas
  useEffect(() => {
    fetchCompanies()
    fetchLocations()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/rent-a-cars`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Falha ao carregar empresas')
      }

      const data = await response.json()
      setCompanies(data.data || [])
    } catch (error) {
      toast.error('Erro ao carregar empresas: ' + error.message)
    }
  }

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/admin/store-locations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Falha ao carregar localizações')
      }

      const data = await response.json()
      setLocations(data.data || [])
    } catch (error) {
      toast.error('Erro ao carregar localizações: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (location = null) => {
    if (location) {
      setCurrentLocation(location)
      setFormData({
        nome: location.nome || '',
        rent_a_car_id: location.rent_a_car_id.toString(),
        endereco: location.endereco || '',
        cidade: location.cidade || '',
        codigo_postal: location.codigo_postal || '',
        pais: location.pais || 'Portugal',
        contacto_telefone: location.contacto_telefone || '',
        contacto_email: location.contacto_email || '',
        horario_funcionamento: location.horario_funcionamento || '',
        is_active: location.is_active
      })
    } else {
      setCurrentLocation(null)
      setFormData({
        nome: '',
        rent_a_car_id: companies.length > 0 ? companies[0].id.toString() : '',
        endereco: '',
        cidade: '',
        codigo_postal: '',
        pais: 'Portugal',
        contacto_telefone: '',
        contacto_email: '',
        horario_funcionamento: '',
        is_active: true
      })
    }
    setDialogOpen(true)
  }

  const handleOpenDeleteDialog = (location) => {
    setCurrentLocation(location)
    setDeleteDialogOpen(true)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSwitchChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      is_active: checked
    }))
  }

  const handleSelectChange = (value) => {
    setFormData(prev => ({
      ...prev,
      rent_a_car_id: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nome.trim()) {
      toast.error('O nome da localização é obrigatório')
      return
    }

    if (!formData.rent_a_car_id) {
      toast.error('Selecione uma empresa')
      return
    }

    try {
      setSubmitting(true)
      const url = currentLocation
        ? `${API_BASE}/admin/store-locations/${currentLocation.id}`
        : `${API_BASE}/admin/store-locations`
      
      const method = currentLocation ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          rent_a_car_id: parseInt(formData.rent_a_car_id)
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao salvar localização')
      }

      await fetchLocations()
      setDialogOpen(false)
      toast.success(`Localização ${currentLocation ? 'atualizada' : 'criada'} com sucesso`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!currentLocation) return

    try {
      setSubmitting(true)
      const response = await fetch(`${API_BASE}/admin/store-locations/${currentLocation.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao excluir localização')
      }

      await fetchLocations()
      setDeleteDialogOpen(false)
      toast.success('Localização excluída com sucesso')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Função para obter o nome da empresa a partir do ID
  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.id === companyId)
    return company ? company.nome : 'Desconhecida'
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Localizações de Lojas</h3>
        <Button onClick={() => handleOpenDialog()} size="sm" disabled={companies.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Localização
        </Button>
      </div>

      {companies.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800 text-sm">
          Você precisa cadastrar pelo menos uma empresa antes de adicionar localizações.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : locations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma localização cadastrada. Clique em "Nova Localização" para adicionar.
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">{location.nome}</TableCell>
                  <TableCell>{getCompanyName(location.rent_a_car_id)}</TableCell>
                  <TableCell>{location.cidade || '-'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${location.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {location.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(location)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(location)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog para adicionar/editar localização */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{currentLocation ? 'Editar Localização' : 'Nova Localização'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="rent_a_car_id">Empresa *</Label>
                <Select 
                  value={formData.rent_a_car_id} 
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Localização *</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Ex: Loja Centro, Filial Aeroporto"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleInputChange}
                    placeholder="Rua, número"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleInputChange}
                    placeholder="Cidade"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="codigo_postal">Código Postal</Label>
                  <Input
                    id="codigo_postal"
                    name="codigo_postal"
                    value={formData.codigo_postal}
                    onChange={handleInputChange}
                    placeholder="1000-000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pais">País</Label>
                  <Input
                    id="pais"
                    name="pais"
                    value={formData.pais}
                    onChange={handleInputChange}
                    placeholder="Portugal"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contacto_telefone">Telefone de Contato</Label>
                  <Input
                    id="contacto_telefone"
                    name="contacto_telefone"
                    value={formData.contacto_telefone}
                    onChange={handleInputChange}
                    placeholder="+351 123 456 789"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contacto_email">Email de Contato</Label>
                  <Input
                    id="contacto_email"
                    name="contacto_email"
                    type="email"
                    value={formData.contacto_email}
                    onChange={handleInputChange}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="horario_funcionamento">Horário de Funcionamento</Label>
                <Textarea
                  id="horario_funcionamento"
                  name="horario_funcionamento"
                  value={formData.horario_funcionamento}
                  onChange={handleInputChange}
                  placeholder="Ex: Segunda a Sexta: 9h às 18h, Sábado: 9h às 13h"
                  rows={2}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="is_active">Localização Ativa</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentLocation ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza que deseja excluir a localização <strong>{currentLocation?.nome}</strong>?</p>
            <p className="text-sm text-muted-foreground mt-2">
              Esta ação não poderá ser desfeita. Se houver veículos associados a esta localização, a exclusão não será permitida.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}