
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Package, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";

const Dashboard = () => {
  // Datos simulados para gráficos
  const salesData = [
    { name: "Ene", ventas: 65000 },
    { name: "Feb", ventas: 78000 },
    { name: "Mar", ventas: 85000 },
    { name: "Abr", ventas: 91000 },
    { name: "May", ventas: 87000 },
    { name: "Jun", ventas: 95000 },
  ];

  const topProducts = [
    { name: "Laptop HP", value: 15, color: "#3b82f6" },
    { name: "Mouse Logitech", value: 25, color: "#10b981" },
    { name: "Teclado Mecánico", value: 18, color: "#f59e0b" },
    { name: "Monitor LG", value: 12, color: "#ef4444" },
    { name: "Otros", value: 30, color: "#6b7280" },
  ];

  const lowStockAlerts = [
    { product: "Laptop HP EliteBook", stock: 3, minimum: 5 },
    { product: "Mouse Inalámbrico", stock: 7, minimum: 10 },
    { product: "Cable HDMI", stock: 2, minimum: 8 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Panel de Control</h1>
        <div className="text-sm text-slate-600">
          Última actualización: {new Date().toLocaleString()}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$95,000</div>
            <p className="text-xs text-green-600">+12% respecto al mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos en Stock</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-slate-600">En 15 categorías</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor del Inventario</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$450,320</div>
            <p className="text-xs text-slate-600">Valoración total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas de Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-red-600">Productos con stock bajo</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventas Mensuales</CardTitle>
            <CardDescription>Evolución de ventas en los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Ventas"]} />
                <Line type="monotone" dataKey="ventas" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>Distribución de ventas por producto</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Stock Bajo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Alertas de Stock Bajo
          </CardTitle>
          <CardDescription>Productos que requieren reabastecimiento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lowStockAlerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <div className="font-medium text-slate-800">{alert.product}</div>
                  <div className="text-sm text-slate-600">
                    Stock actual: {alert.stock} | Mínimo: {alert.minimum}
                  </div>
                </div>
                <div className="text-red-600 font-bold">
                  ¡Reabastecer!
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
