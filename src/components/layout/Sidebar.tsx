
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  FileText, 
  Settings,
  Menu,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  user?: {
    role: string;
  };
}

const Sidebar = ({ activeModule, onModuleChange, collapsed, onToggleCollapse, user }: SidebarProps) => {
  const menuItems = [
    { id: "dashboard", label: "Panel Principal", icon: Home },
    { id: "inventory", label: "Inventario", icon: Package },
    { id: "sales", label: "Ventas", icon: ShoppingCart },
    { id: "reports", label: "Reportes", icon: FileText },
    { id: "settings", label: "Configuración", icon: Settings },
  ];

  const getVisibleMenuItems = () => {
    if (!user) {
      return [];
    }
    const role = user.role.toLowerCase();

    return menuItems.filter((item) => {
      switch (item.id) {
        case "dashboard":
          return true;
        case "inventory":
          return ["admin", "administrativo"].includes(role);
        case "sales":
          return ["admin", "vendedor", "administrativo"].includes(role);
        case "reports":
          return ["admin", "administrativo"].includes(role);
        case "settings":
          return role === "admin";
        default:
          return false;
      }
    });
  };

  const visibleMenuItems = getVisibleMenuItems();

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-slate-900 text-white transition-all duration-300 z-50",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!collapsed && (
          <h1 className="text-xl font-bold text-blue-400">SistemaAdmin</h1>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="text-white hover:bg-slate-700"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onModuleChange(item.id)}
              className={cn(
                "w-full flex items-center px-4 py-3 text-left transition-colors hover:bg-slate-700",
                isActive && "bg-blue-600 border-r-2 border-blue-400"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <span className="ml-3 font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4 text-xs text-slate-400 text-center">
          Sistema Administrativo v1.0
        </div>
      )}
    </div>
  );
};

export default Sidebar;
