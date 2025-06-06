
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { FileText, Download, Calendar } from "lucide-react";

const Reports = () => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reportType, setReportType] = useState("");

  // Datos simulados para reportes
  const salesByMonth = [
    { month: "Enero", ventas: 65000, productos: 120 },
    { month: "Febrero", ventas: 78000, productos: 145 },
    { month: "Marzo", ventas: 85000, productos: 160 },
    { month: "Abril", ventas: 91000, productos: 175 },
    { month: "Mayo", ventas: 87000, productos: 168 },
    { month: "Junio", ventas: 95000, productos: 182 },
  ];

  const productsSold = [
    { name: "Laptops", value: 35, color: "#3b82f6" },
    { name: "Accesorios", value: 28, color: "#10b981" },
    { name: "Monitores", value: 20, color: "#f59e0b" },
    { name: "Software", value: 10, color: "#ef4444" },
    { name: "Otros", value: 7, color: "#6b7280" },
  ];

  const topCustomers = [
    { name: "Empresa ABC", total: 25000 },
    { name: "Juan Pérez", total: 18500 },
    { name: "María González", total: 15200 },
    { name: "Tech Solutions", total: 12800 },
    { name: "Innovation Corp", total: 11500 },
  ];

  const inventoryValue = [
    { category: "Computadoras", value: 180000 },
    { category: "Accesorios", value: 45000 },
    { category: "Monitores", value: 32000 },
    { category: "Software", value: 28000 },
    { category: "Otros", value: 15000 },
  ];

  const generateReport = () => {
    alert(`Generando reporte de ${reportType} desde ${dateFrom} hasta ${dateTo}`);
  };

  const exportToPDF = () => {
    alert("Exportando reporte a PDF...");
  };

  const exportToCSV = () => {
    alert("Exportando reporte a CSV...");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Reportes y Análisis</h1>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={exportToPDF} className="bg-red-600 hover:bg-red-700">
            <FileText className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filtros de reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Generar Reporte Personalizado</CardTitle>
          <CardDescription>Configure los filtros para generar reportes específicos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="report-type">Tipo de Reporte</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Ventas</SelectItem>
                  <SelectItem value="inventory">Inventario</SelectItem>
                  <SelectItem value="customers">Clientes</SelectItem>
                  <SelectItem value="financial">Financiero</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date-from">Fecha Desde</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="date-to">Fecha Hasta</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={generateReport} className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Generar Reporte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Ventas</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="financial">Financiero</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ventas Mensuales</CardTitle>
                <CardDescription>Evolución de ventas e ítems vendidos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'ventas' ? `$${value.toLocaleString()}` : `${value} productos`,
                      name === 'ventas' ? 'Ventas' : 'Productos'
                    ]} />
                    <Bar dataKey="ventas" fill="#3b82f6" />
                    <Bar dataKey="productos" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Productos Vendidos</CardTitle>
                <CardDescription>Porcentaje de ventas por categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productsSold}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {productsSold.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top 5 Clientes</CardTitle>
              <CardDescription>Clientes con mayor volumen de compras</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCustomers.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                    <span className="font-bold text-green-600">${customer.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Valor del Inventario por Categoría</CardTitle>
              <CardDescription>Distribución del valor total del inventario</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={inventoryValue} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={100} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Valor"]} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Clientes</CardTitle>
              <CardDescription>Métricas y comportamiento de clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-slate-500 py-8">
                Reportes de clientes - Funcionalidad en desarrollo
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen Financiero</CardTitle>
              <CardDescription>Análisis financiero del período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">$521,000</div>
                  <div className="text-sm text-green-700">Ingresos Totales</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">$315,200</div>
                  <div className="text-sm text-blue-700">Costos de Productos</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">$205,800</div>
                  <div className="text-sm text-purple-700">Margen Bruto</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
