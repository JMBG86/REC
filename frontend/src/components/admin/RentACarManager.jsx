import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Pencil, Trash2, Plus, Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export default function RentACarManager() {
  const { API_BASE, token } = useAuth()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentCompany, setCurrentCompany] = useState(null)
  const [formData, setFormData] = useState({
    nome: '',
    contacto_email: '',
    contacto_telefone: '',
    endereco: '',
    cidade: '',
    codigo_postal: '',
    pais: 'Portugal',
    nif: '',
    website: '',
    logo_url: '',
    descricao: '',
    is_active: true
  })
  const [submitting, setSubmitting] = useState(false)

  // Carregar empresas
  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (company = null) => {
    if (company) {
      setCurrentCompany(company)
      setFormData({
        nome: company.nome || '',
        contacto_email: company.contacto_email || '',
        contacto_telefone: company.contacto_telefone || '',
        endereco: company.endereco || '',
        cidade: company.cidade || '',
        codigo_postal: company.codigo_postal || '',
        pais: company.pais || 'Portugal',
        nif: company.nif || '',
        website: company.website || '',
        logo_url: company.logo_url || '',
        descricao: company.descricao || '',
        is_active: company.is_active
      })
    } else {
      setCurrentCompany(null)
      setFormData({
        nome: '',
        contacto_email: '',
        contacto_telefone: '',
        endereco: '',
        cidade: '',
        codigo_postal: '',
        pais: 'Portugal',
        nif: '',
        website: '',
        logo_url: '',
        descricao: '',
        is_active: true
      })
    }
    setDialogOpen(true)
  }

  const handleOpenDeleteDialog = (company) => {
    setCurrentCompany(company)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nome.trim()) {
      toast.error('O nome da empresa é obrigatório')
      return
    }

    try {
      setSubmitting(true)
      const url = currentCompany
        ? `${API_BASE}/admin/rent-a-cars/${currentCompany.id}`
        : `${API_BASE}/admin/rent-a-cars`
      
      const method = currentCompany ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao salvar empresa')
      }

      await fetchCompanies()
      setDialogOpen(false)
      toast.success(`Empresa ${currentCompany ? 'atualizada' : 'criada'} com sucesso`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!currentCompany) return

    try {
      setSubmitting(true)
      const response = await fetch(`${API_BASE}/admin/rent-a-cars/${currentCompany.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao excluir empresa')
      }

      await fetchCompanies()
      setDeleteDialogOpen(false)
      toast.success('Empresa excluída com sucesso')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Empresas de Aluguel</h3>
        <Button onClick={() => handleOpenDialog()} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma empresa cadastrada. Clique em "Nova Empresa" para adicionar.
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.nome}</TableCell>
                  <TableCell>{company.contacto_email || '-'}</TableCell>
                  <TableCell>{company.contacto_telefone || '-'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${company.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {company.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(company)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(company)}>
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

      {/* Dialog para adicionar/editar empresa */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{currentCompany ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Empresa *</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Nome da empresa"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nif">NIF</Label>
                  <Input
                    id="nif"
                    name="nif"
                    value={formData.nif}
                    onChange={handleInputChange}
                    placeholder="Número de Identificação Fiscal"
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
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://www.exemplo.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logo_url">URL do Logo</Label>
                  <Input
                    id="logo_url"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleInputChange}
                    placeholder="https://www.exemplo.com/logo.png"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  placeholder="Descrição da empresa"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="is_active">Empresa Ativa</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentCompany ? 'Atualizar' : 'Criar'}
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
            <p>Tem certeza que deseja excluir a empresa <strong>{currentCompany?.nome}</strong>?</p>
            <p className="text-sm text-muted-foreground mt-2">
              Esta ação não poderá ser desfeita. Se houver usuários ou localizações associados a esta empresa, a exclusão não será permitida.
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