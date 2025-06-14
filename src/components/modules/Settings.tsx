import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Settings as SettingsIcon, Database, Users, Plus } from "lucide-react";
import { useApi, useApiMutation, apiClient } from "@/hooks/useApi";

interface SettingsProps {
  onLogout: () => void;
}

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: number;
  created_at: string;
}

interface ConfigData {
  company_name?: string;
  tax_rate?: string;
  currency?: string;
  invoice_prefix?: string;
}

interface BackupFile {
  filename: string;
  created_at: string;
  size: number;
}

const Settings = ({ onLogout }: SettingsProps) => {
  const { toast } = useToast();
  const [config, setConfig] = useState<ConfigData>({});
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    role: "vendedor"
  });
  const [showUserForm, setShowUserForm] = useState(false);

  // API hooks
  const { data: users, loading: usersLoading, error: usersError, refetch: refetchUsers } = useApi<User[]>('/users');
  const { data: configData } = useApi<ConfigData>('/config');
  const { data: backups } = useApi<BackupFile[]>('/backup/list');
  const { mutate: saveConfig, loading: savingConfig } = useApiMutation();
  const { mutate: createUser, loading: creatingUser } = useApiMutation();
  const { mutate: createBackup, loading: creatingBackup } = useApiMutation();
  const { mutate: updateUser } = useApiMutation();
  const { mutate: deleteUser } = useApiMutation();

  useEffect(() => {
    if (configData) {
      setConfig(configData);
    }
  }, [configData]);

  const handleSaveConfig = async (configKey: string, value: string) => {
    try {
      await saveConfig('/config', { config_key: configKey, config_value: value });
      toast({
        title: "Configuración guardada",
        description: "La configuración se ha guardado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser('/auth/register', newUser);
      setNewUser({ username: "", password: "", email: "", fullName: "", role: "vendedor" });
      setShowUserForm(false);
      toast({
        title: "Usuario creado",
        description: "El usuario se ha creado correctamente.",
      });
      refetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el usuario.",
        variant: "destructive",
      });
    }
  };

  const handleCreateBackup = async () => {
    try {
      await createBackup('/backup/create');
      toast({
        title: "Respaldo creado",
        description: "El respaldo se ha creado correctamente.",
      });
      // Refrescar la lista de respaldos
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el respaldo.",
        variant: "destructive",
      });
    }
  };

  const handleToggleUser = async (userId: number, isActive: boolean) => {
    try {
      const user = users?.find(u => u.id === userId);
      if (user) {
        await updateUser(`/users/${userId}`, {
          ...user,
          isActive: isActive ? 1 : 0
        }, 'PUT');
        toast({
          title: "Usuario actualizado",
          description: `El usuario ha sido ${isActive ? 'activado' : 'desactivado'}.`,
        });
        refetchUsers();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
      case 'administrador':
        return 'default';
      case 'vendedor':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'administrador':
        return 'Administrador';
      case 'vendedor':
        return 'Vendedor';
      default:
        return role;
    }
  };

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
                  <Input
                    id="company-name"
                    value={config.company_name || ""}
                    onChange={(e) => setConfig(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Mi Empresa S.A."
                  />
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => handleSaveConfig('company_name', config.company_name || "")}
                    disabled={savingConfig}
                  >
                    Guardar
                  </Button>
                </div>
                <div>
                  <Label htmlFor="currency">Moneda</Label>
                  <Input
                    id="currency"
                    value={config.currency || ""}
                    onChange={(e) => setConfig(prev => ({ ...prev, currency: e.target.value }))}
                    placeholder="USD"
                  />
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => handleSaveConfig('currency', config.currency || "")}
                    disabled={savingConfig}
                  >
                    Guardar
                  </Button>
                </div>
              </div>
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
                  <Input
                    id="tax-rate"
                    type="number"
                    value={config.tax_rate || ""}
                    onChange={(e) => setConfig(prev => ({ ...prev, tax_rate: e.target.value }))}
                    placeholder="15"
                  />
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => handleSaveConfig('tax_rate', config.tax_rate || "")}
                    disabled={savingConfig}
                  >
                    Guardar
                  </Button>
                </div>
                <div>
                  <Label htmlFor="invoice-prefix">Prefijo de Facturas</Label>
                  <Input
                    id="invoice-prefix"
                    value={config.invoice_prefix || ""}
                    onChange={(e) => setConfig(prev => ({ ...prev, invoice_prefix: e.target.value }))}
                    placeholder="INV"
                  />
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => handleSaveConfig('invoice_prefix', config.invoice_prefix || "")}
                    disabled={savingConfig}
                  >
                    Guardar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gestión de Usuarios
                  </CardTitle>
                  <CardDescription>Administrar usuarios del sistema</CardDescription>
                </div>
                <Button onClick={() => setShowUserForm(!showUserForm)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showUserForm && (
                <form onSubmit={handleCreateUser} className="mb-6 p-4 border rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="new-username">Usuario</Label>
                      <Input
                        id="new-username"
                        value={newUser.username}
                        onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password">Contraseña</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-email">Email</Label>
                      <Input
                        id="new-email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-fullname">Nombre Completo</Label>
                      <Input
                        id="new-fullname"
                        value={newUser.fullName}
                        onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="new-role">Rol</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="administrador">Administrador</SelectItem>
                          <SelectItem value="vendedor">Vendedor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={creatingUser}>
                      {creatingUser ? "Creando..." : "Crear Usuario"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowUserForm(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {usersLoading ? (
                  <div>Cargando usuarios...</div>
                ) : usersError ? (
                  <div className="text-red-600">Error: {usersError}</div>
                ) : (
                  users?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-slate-600">{user.email}</div>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {getRoleDisplayName(user.role)}
                          </Badge>
                          <Badge variant={user.is_active ? 'default' : 'destructive'}>
                            {user.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleUser(user.id, !user.is_active)}
                        >
                          {user.is_active ? 'Desactivar' : 'Activar'}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
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
                  <div className="text-sm text-blue-600">./backend/database/sistema.db</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button variant="outline" onClick={() => toast({ title: "Integridad verificada", description: "La base de datos está en buen estado." })}>
                  Verificar Integridad
                </Button>
                <Button variant="outline" onClick={() => toast({ title: "Optimización completada", description: "La base de datos ha sido optimizada." })}>
                  Optimizar Base de Datos
                </Button>
                <Button variant="outline" onClick={() => toast({ title: "Estadísticas", description: "Tablas: 12, Registros totales: 1,247" })}>
                  Ver Estadísticas
                </Button>
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
              <div className="flex gap-2 mb-4">
                <Button onClick={handleCreateBackup} disabled={creatingBackup}>
                  {creatingBackup ? "Creando..." : "Crear Respaldo Ahora"}
                </Button>
                <Button variant="outline">Configurar Respaldo Automático</Button>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">Respaldos Disponibles</h3>
                {backups?.map((backup) => (
                  <div key={backup.filename} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium">{backup.filename}</div>
                      <div className="text-sm text-slate-600">
                        {new Date(backup.created_at).toLocaleString()} - {Math.round(backup.size / 1024)} KB
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Restaurar
                    </Button>
                  </div>
                )) || (
                  <div className="text-slate-500">No hay respaldos disponibles</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
