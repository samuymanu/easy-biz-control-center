
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApi, useApiMutation } from "@/hooks/useApi";

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: number;
  created_at: string;
}

const UserManagement = () => {
  const { toast } = useToast();
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    role: "vendedor"
  });
  const [showUserForm, setShowUserForm] = useState(false);

  const { data: users, loading: usersLoading, error: usersError, refetch: refetchUsers } = useApi<User[]>('/users');
  const { mutate: createUser, loading: creatingUser } = useApiMutation();
  const { mutate: updateUser } = useApiMutation();

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
  );
};

export default UserManagement;
