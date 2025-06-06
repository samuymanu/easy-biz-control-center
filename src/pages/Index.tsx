
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/components/modules/Dashboard";
import Inventory from "@/components/modules/Inventory";
import Sales from "@/components/modules/Sales";
import Reports from "@/components/modules/Reports";
import Settings from "@/components/modules/Settings";
import LoginForm from "@/components/auth/LoginForm";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (credentials: { username: string; password: string }) => {
    // Simulación de autenticación - en producción conectar con backend
    if (credentials.username === "admin" && credentials.password === "admin") {
      setIsAuthenticated(true);
    } else {
      alert("Credenciales incorrectas. Use admin/admin para la demo.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveModule("dashboard");
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

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
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
