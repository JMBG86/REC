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

export default function CarModelManager() {
  const { API_BASE, token } = useAuth()
  const [models, setModels] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentModel, setCurrentModel] = useState(null)
  const [formData, setFormData] = useState({ 
    name: '', 
    brand_id: '', 
    description: '',
    is_active: true 
  })
  const [submitting, setSubmitting] = useState(false)

  // Carregar modelos e marcas
  useEffect(() => {
    fetchBrands()
    fetchModels()
  }, [])

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/car-brands`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Falha ao carregar marcas')
      }

      const data = await response.json()
      setBrands(data.data || [])
    } catch (error) {
      toast.error('Erro ao carregar marcas: ' + error.message)
    }
  }

  const fetchModels = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/admin/car-models`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Falha ao carregar modelos')
      }

      const data = await response.json()
      setModels(data.data || [])
    } catch (error) {
      toast.error('Erro ao carregar modelos: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (model = null) => {
    if (model) {
      setCurrentModel(model)
      setFormData({ 
        name: model.name, 
        brand_id: model.brand_id.toString(),
        description: model.description || '',
        is_active: model.is_active 
      })
    } else {
      setCurrentModel(null)
      setFormData({ 
        name: '', 
        brand_id: brands.length > 0 ? brands[0].id.toString() : '',
        description: '',
        is_active: true 
      })
    }
    setDialogOpen(true)
  }

  const handleOpenDeleteDialog = (model) => {
    setCurrentModel(model)
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
      brand_id: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('O nome do modelo é obrigatório')
      return
    }

    if (!formData.brand_id) {
      toast.error('Selecione uma marca')
      return
    }

    try {
      setSubmitting(true)
      const url = currentModel
        ? `${API_BASE}/admin/car-models/${currentModel.id}`
        : `${API_BASE}/admin/car-models`
      
      const method = currentModel ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          brand_id: parseInt(formData.brand_id)
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao salvar modelo')
      }

      await fetchModels()
      setDialogOpen(false)
      toast.success(`Modelo ${currentModel ? 'atualizado' : 'criado'} com sucesso`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!currentModel) return

    try {
      setSubmitting(true)
      const response = await fetch(`${API_BASE}/admin/car-models/${currentModel.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao excluir modelo')
      }

      await fetchModels()
      setDeleteDialogOpen(false)
      toast.success('Modelo excluído com sucesso')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Função para obter o nome da marca a partir do ID
  const getBrandName = (brandId) => {
    const brand = brands.find(b => b.id === brandId)
    return brand ? brand.name : 'Desconhecida'
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Modelos de Carros</h3>
        <Button onClick={() => handleOpenDialog()} size="sm" disabled={brands.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Modelo
        </Button>
      </div>

      {brands.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800 text-sm">
          Você precisa cadastrar pelo menos uma marca antes de adicionar modelos.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : models.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum modelo cadastrado. Clique em "Novo Modelo" para adicionar.
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">{model.name}</TableCell>
                  <TableCell>{getBrandName(model.brand_id)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${model.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {model.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(model)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(model)}>
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

      {/* Dialog para adicionar/editar modelo */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentModel ? 'Editar Modelo' : 'Novo Modelo'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="brand_id">Marca</Label>
                <Select 
                  value={formData.brand_id} 
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map(brand => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Modelo</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Corolla, Série 3, A4"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descrição do modelo"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="is_active">Modelo Ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentModel ? 'Atualizar' : 'Criar'}
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
            <p>Tem certeza que deseja excluir o modelo <strong>{currentModel?.name}</strong>?</p>
            <p className="text-sm text-muted-foreground mt-2">
              Esta ação não poderá ser desfeita. Se houver veículos associados a este modelo, a exclusão não será permitida.
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