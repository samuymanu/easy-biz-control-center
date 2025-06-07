
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/components/modules/Dashboard";
import Inventory from "@/components/modules/Inventory";
import Sales from "@/components/modules/Sales";
import Reports from "@/components/modules/Reports";
import Settings from "@/components/modules/Settings";
import LoginForm from "@/components/auth/LoginForm";
import { apiClient } from "@/hooks/useApi";

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

const Index = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Verificar si hay un token guardado al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Verificar que el token sea válido haciendo una llamada a la API
      apiClient.get('/dashboard/stats')
        .then(() => {
          setIsAuthenticated(true);
        })
        .catch(() => {
          // Token inválido, remover
          localStorage.removeItem('auth_token');
          apiClient.removeToken();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (credentials: { username: string; password: string }) => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        apiClient.setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        
        toast({
          title: "Inicio de sesión exitoso",
          description: `Bienvenido, ${data.user.fullName}`,
        });
      } else {
        toast({
          title: "Error de autenticación",
          description: data.error || "Credenciales incorrectas",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Asegúrese de que esté ejecutándose.",
        variant: "destructive",
      });
      console.error('Error de conexión:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiClient.removeToken();
    setIsAuthenticated(false);
    setUser(null);
    setActiveModule("dashboard");
    
    toast({
      title: "Sesión cerrada",
      description: "Ha cerrado sesión correctamente",
    });
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard />;
      case "inventory":
        return <Inventory />;
      case "sales":
        return <Sales />;
      case "reports":
        return <Reports />;
      case "settings":
        return <Settings onLogout={handleLogout} />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-slate-600">Iniciando sistema...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} loading={loading} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-6">
          {renderActiveModule()}
        </div>
      </main>
    </div>
  );
};

export default Index;
