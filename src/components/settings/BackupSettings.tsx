
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useApi, useApiMutation } from "@/hooks/useApi";

interface BackupFile {
  filename: string;
  created_at: string;
  size: number;
}

const BackupSettings = () => {
  const { toast } = useToast();
  
  const { data: backups } = useApi<BackupFile[]>('/backup/list');
  const { mutate: createBackup, loading: creatingBackup } = useApiMutation();

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

  return (
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
  );
};

export default BackupSettings;
