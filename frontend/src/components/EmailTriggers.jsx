import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Mail, CheckCircle, XCircle, RefreshCw, Car, AlertTriangle, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function EmailTriggers() {
  const [emailTriggers, setEmailTriggers] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [checkingEmails, setCheckingEmails] = useState(false)
  const [autoProcessing, setAutoProcessing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState('all')
  const { token, API_BASE } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchEmailTriggers()
  }, [currentPage, activeTab])

  const fetchEmailTriggers = async () => {
    try {
      setLoading(true)
      const processed = activeTab === 'processed' ? true : activeTab === 'unprocessed' ? false : null
      const queryParams = new URLSearchParams({
        page: currentPage,
        per_page: 10
      })
      
      if (processed !== null) {
        queryParams.append('processed', processed)
      }
      
      const response = await fetch(`${API_BASE}/email-triggers?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setEmailTriggers(data.email_triggers)
        setTotalPages(data.pages)
      }
    } catch (error) {
      console.error('Erro ao carregar email triggers:', error)
      toast.error('Erro ao carregar emails')
    } finally {
      setLoading(false)
    }
  }

  const checkNewEmails = async () => {
    try {
      setCheckingEmails(true)
      const response = await fetch(`${API_BASE}/email-triggers/check-new`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success(`${data.processed_count} novos emails processados`)
        fetchEmailTriggers()
      } else {
        toast.error('Erro ao verificar novos emails')
      }
    } catch (error) {
      console.error('Erro ao verificar novos emails:', error)
      toast.error('Erro ao verificar novos emails')
    } finally {
      setCheckingEmails(false)
    }
  }

  const autoProcessEmails = async () => {
    try {
      setAutoProcessing(true)
      const response = await fetch(`${API_BASE}/email-triggers/auto-process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success(`${data.success} emails processados com sucesso, ${data.failed} falhas`)
        fetchEmailTriggers()
      } else {
        toast.error('Erro ao processar emails automaticamente')
      }
    } catch (error) {
      console.error('Erro ao processar emails automaticamente:', error)
      toast.error('Erro ao processar emails automaticamente')
    } finally {
      setAutoProcessing(false)
    }
  }

  const processEmailTrigger = async (triggerId) => {
    try {
      setProcessingId(triggerId)
      const response = await fetch(`${API_BASE}/email-triggers/${triggerId}/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('Email processado com sucesso')
        if (data.vehicle_id) {
          const goToVehicle = window.confirm('Veículo criado com sucesso. Deseja visualizar o veículo?')
          if (goToVehicle) {
            navigate(`/vehicles/${data.vehicle_id}`)
            return
          }
        }
        fetchEmailTriggers()
      } else {
        toast.error(`Erro ao processar email: ${data.message}`)
      }
    } catch (error) {
      console.error('Erro ao processar email trigger:', error)
      toast.error('Erro ao processar email')
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '-'
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null
    
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            />
          </PaginationItem>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <PaginationItem key={page}>
              <PaginationLink 
                isActive={currentPage === page}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Email Triggers</h1>
          <p className="text-muted-foreground">Gestão de emails recebidos para processamento automático</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={checkNewEmails} disabled={checkingEmails}>
            {checkingEmails ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                A verificar...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Verificar Novos Emails
              </>
            )}
          </Button>
          <Button onClick={autoProcessEmails} disabled={autoProcessing} variant="secondary">
            {autoProcessing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Car className="mr-2 h-4 w-4" />
                Processar Automaticamente
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="unprocessed">Não Processados</TabsTrigger>
          <TabsTrigger value="processed">Processados</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : emailTriggers.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-2 text-lg font-medium">Nenhum email encontrado</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Não existem emails {activeTab === 'processed' ? 'processados' : activeTab === 'unprocessed' ? 'não processados' : ''} no sistema.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Remetente</TableHead>
                    <TableHead>Assunto</TableHead>
                    <TableHead>Recebido</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailTriggers.map(trigger => (
                    <TableRow key={trigger.id}>
                      <TableCell className="font-medium">{trigger.id}</TableCell>
                      <TableCell>{truncateText(trigger.email_from, 30)}</TableCell>
                      <TableCell>{truncateText(trigger.email_subject, 40)}</TableCell>
                      <TableCell>{formatDate(trigger.received_at)}</TableCell>
                      <TableCell>
                        {trigger.processed ? (
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Processado
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {trigger.vehicle_id ? (
                          <Button 
                            variant="link" 
                            className="p-0 h-auto" 
                            onClick={() => navigate(`/vehicles/${trigger.vehicle_id}`)}
                          >
                            Ver Veículo
                          </Button>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {!trigger.processed && (
                          <Button 
                            size="sm" 
                            onClick={() => processEmailTrigger(trigger.id)}
                            disabled={processingId === trigger.id}
                          >
                            {processingId === trigger.id ? (
                              <>
                                <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                                Processando...
                              </>
                            ) : 'Processar'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {renderPagination()}
    </div>
  )
}