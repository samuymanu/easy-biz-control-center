
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut } from "lucide-react";
import GeneralSettings from "@/components/settings/GeneralSettings";
import UserManagement from "@/components/settings/UserManagement";
import DatabaseSettings from "@/components/settings/DatabaseSettings";
import BackupSettings from "@/components/settings/BackupSettings";

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
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <DatabaseSettings />
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <BackupSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
