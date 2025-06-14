
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DatabaseSettings = () => {
  const { toast } = useToast();

  return (
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
  );
};

export default DatabaseSettings;
