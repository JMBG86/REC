import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Car, Store, MapPin } from 'lucide-react'
import CarBrandManager from './admin/CarBrandManager'
import CarModelManager from './admin/CarModelManager'
import RentACarManager from './admin/RentACarManager'
import StoreLocationManager from './admin/StoreLocationManager'
import { useAuth } from '../contexts/AuthContext'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('car-brands')
  const { user } = useAuth()

  // Verificar se o usuário é administrador
  if (user?.role !== 'admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acesso Restrito</CardTitle>
          <CardDescription>
            Você não tem permissão para acessar esta página.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Painel de Administração</h1>
        <p className="text-muted-foreground">
          Gerencie marcas, modelos, empresas e localizações de lojas.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl">
          <TabsTrigger value="car-brands" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            <span className="hidden sm:inline">Marcas</span>
          </TabsTrigger>
          <TabsTrigger value="car-models" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            <span className="hidden sm:inline">Modelos</span>
          </TabsTrigger>
          <TabsTrigger value="rent-a-cars" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Empresas</span>
          </TabsTrigger>
          <TabsTrigger value="store-locations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Localizações</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="car-brands" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Marcas de Carros</CardTitle>
              <CardDescription>
                Adicione, edite ou remova marcas de carros disponíveis no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CarBrandManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="car-models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Modelos de Carros</CardTitle>
              <CardDescription>
                Adicione, edite ou remova modelos de carros disponíveis no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CarModelManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rent-a-cars" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Empresas de Aluguel</CardTitle>
              <CardDescription>
                Adicione, edite ou remova empresas de aluguel de carros.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RentACarManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store-locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Localizações de Lojas</CardTitle>
              <CardDescription>
                Adicione, edite ou remova localizações de lojas das empresas de aluguel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StoreLocationManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}