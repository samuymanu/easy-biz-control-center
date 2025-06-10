import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/components/modules/Dashboard";
import Inventory from "@/components/modules/Inventory";
import Sales from "@/components/modules/Sales";
import Reports from "@/components/modules/Reports";
import Settings from "@/components/modules/Settings";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "../context/AuthContext";

const Index = () => {
  const { user, logout } = useAuth();
  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderActiveModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard />;
      case "inventory":
        if (user?.role !== "admin") {
          return <div className="p-4 text-red-600">No tienes acceso a este módulo.</div>;
        }
        return <Inventory />;
      case "sales":
        return <Sales />;
      case "reports":
        return <Reports />;
      case "settings":
        return <Settings onLogout={logout} />;
      default:
        return <Dashboard />;
    }
  };

  // Si NO hay usuario logueado, muestra el formulario de login
  if (!user) {
    return <LoginForm />;
  }

  // Si hay usuario logueado, muestra la app
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user} // Pásale el user al Sidebar si lo necesitas
      />
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-6">
          <div className="mb-4">
            <strong>Usuario:</strong> {user.name} <br />
            <strong>Rol:</strong> {user.role}
          </div>
          {renderActiveModule()}
        </div>
      </main>
    </div>
  );
};

export default Index;