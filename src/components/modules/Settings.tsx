
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Settings as SettingsIcon, Database, Users } from "lucide-react";

interface SettingsProps {
  onLogout: () => void;
}

const Settings = ({ onLogout }: SettingsProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Configuración del Sistema</h1>
        <Button onClick={onLogout} variant="destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="database">Base de Datos</TabsTrigger>
          <TabsTrigger value="backup">Respaldo</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Configuración General
              </CardTitle>
              <CardDescription>Configuraciones básicas del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Nombre de la Empresa</Label>
                  <Input id="company-name" defaultValue="Mi Empresa S.A." />
                </div>
                <div>
                  <Label htmlFor="company-address">Dirección</Label>
                  <Input id="company-address" defaultValue="Calle Principal 123" />
                </div>
                <div>
                  <Label htmlFor="company-phone">Teléfono</Label>
                  <Input id="company-phone" defaultValue="555-0123" />
                </div>
                <div>
                  <Label htmlFor="company-email">Email</Label>
                  <Input id="company-email" defaultValue="contacto@miempresa.com" />
                </div>
              </div>
              <Button className="mt-4">Guardar Configuración</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración de Impuestos</CardTitle>
              <CardDescription>Configurar porcentajes de impuestos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tax-rate">Tasa de Impuesto (%)</Label>
                  <Input id="tax-rate" type="number" defaultValue="15" />
                </div>
                <div>
                  <Label htmlFor="currency">Moneda</Label>
                  <Input id="currency" defaultValue="USD" />
                </div>
              </div>
              <Button className="mt-4">Guardar Impuestos</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestión de Usuarios
              </CardTitle>
              <CardDescription>Administrar usuarios del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Administrador</div>
                      <div className="text-sm text-slate-600">admin@sistema.com</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Editar</Button>
                      <Button variant="destructive" size="sm">Eliminar</Button>
                    </div>
                  </div>
                </div>
                
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Agregar Usuario
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Configuración de Base de Datos
              </CardTitle>
              <CardDescription>Estado y configuración de la base de datos SQLite</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="font-medium text-green-800">Estado de la Conexión</div>
                  <div className="text-sm text-green-600">✓ Conectado a SQLite</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="font-medium text-blue-800">Ubicación de BD</div>
                  <div className="text-sm text-blue-600">./database/sistema.db</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button variant="outline">Verificar Integridad</Button>
                <Button variant="outline">Optimizar Base de Datos</Button>
                <Button variant="outline">Ver Estadísticas</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Respaldo y Restauración</CardTitle>
              <CardDescription>Gestionar copias de seguridad del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="font-medium text-yellow-800">Último Respaldo</div>
                <div className="text-sm text-yellow-600">06/06/2024 - 14:30</div>
              </div>
              
              <div className="space-y-2">
                <Button className="w-full md:w-auto">Crear Respaldo Ahora</Button>
                <Button variant="outline" className="w-full md:w-auto">Restaurar desde Respaldo</Button>
                <Button variant="outline" className="w-full md:w-auto">Configurar Respaldo Automático</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
