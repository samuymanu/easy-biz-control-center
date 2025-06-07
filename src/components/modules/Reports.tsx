
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { FileText, Download, Calendar } from "lucide-react";
import { useApi, useApiMutation } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";

interface SalesReportData {
  date: string;
  total_sales: number;
  sales_count: number;
}

interface ProductReportData {
  name: string;
  current_stock: number;
  minimum_stock: number;
  stock_value: number;
  stock_status: string;
}

interface DashboardStats {
  monthly_sales: number;
  sales_count: number;
  total_stock: number;
  product_count: number;
  inventory_value: number;
  low_stock_count: number;
}

const Reports = () => {
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reportType, setReportType] = useState("");

  // API hooks
  const { data: dashboardStats } = useApi<DashboardStats>('/dashboard/stats');
  const { data: salesReport } = useApi<SalesReportData[]>(`/reports/sales?from_date=${dateFrom}&to_date=${dateTo}`, [dateFrom, dateTo]);
  const { data: productsReport } = useApi<ProductReportData[]>('/reports/products');
  const { mutate: exportData } = useApiMutation();

  // Configurar fechas por defecto
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setDateFrom(firstDay.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  }, []);

  // Procesar datos para gráficos
  const salesByMonth = salesReport?.map(item => ({
    month: new Date(item.date).toLocaleDateString('es', { month: 'short', day: 'numeric' }),
    ventas: item.total_sales,
    productos: item.sales_count
  })) || [];

  const productsByStatus = productsReport?.reduce((acc, product) => {
    const status = product.stock_status;
    const existing = acc.find(item => item.name === status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: status, value: 1, color: getStatusColor(status) });
    }
    return acc;
  }, [] as { name: string; value: number; color: string }[]) || [];

  const inventoryValue = productsReport?.reduce((acc, product) => {
    acc.push({
      category: product.name.split(' ')[0] + '...', // Simplificar nombres
      value: product.stock_value
    });
    return acc;
  }, [] as { category: string; value: number }[]).slice(0, 10) || []; // Top 10

  function getStatusColor(status: string) {
    switch (status) {
      case 'Bajo': return '#ef4444';
      case 'Medio': return '#f59e0b';
      case 'Normal': return '#10b981';
      default: return '#6b7280';
    }
  }

  const generateReport = async () => {
    try {
      toast({
        title: "Generando reporte",
        description: `Reporte de ${reportType} desde ${dateFrom} hasta ${dateTo}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el reporte",
        variant: "destructive",
      });
    }
  };

  const exportToPDF = () => {
    toast({
      title: "Exportando a PDF",
      description: "El reporte se está generando...",
    });
  };

  const exportToCSV = () => {
    if (salesReport && salesReport.length > 0) {
      const csvContent = [
        ['Fecha', 'Ventas Totales', 'Número de Ventas'],
        ...salesReport.map(row => [row.date, row.total_sales.toString(), row.sales_count.toString()])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-ventas-${dateFrom}-${dateTo}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Exportado a CSV",
        description: "El archivo ha sido descargado",
      });
    }
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
                <CardTitle>Ventas por Período</CardTitle>
                <CardDescription>Evolución de ventas en el período seleccionado</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'ventas' ? `$${value.toLocaleString()}` : `${value} transacciones`,
                      name === 'ventas' ? 'Ventas' : 'Transacciones'
                    ]} />
                    <Line type="monotone" dataKey="ventas" stroke="#3b82f6" strokeWidth={2} />
                    <Bar dataKey="productos" fill="#10b981" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado del Stock</CardTitle>
                <CardDescription>Distribución de productos por estado de stock</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productsByStatus}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {productsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Métricas en tiempo real */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ventas del Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${dashboardStats?.monthly_sales?.toLocaleString() || 0}
                </div>
                <p className="text-sm text-slate-600">{dashboardStats?.sales_count || 0} transacciones</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardStats?.product_count || 0}
                </div>
                <p className="text-sm text-slate-600">{dashboardStats?.total_stock || 0} en stock</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Valor Inventario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  ${dashboardStats?.inventory_value?.toLocaleString() || 0}
                </div>
                <p className="text-sm text-slate-600">valor total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alertas Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {dashboardStats?.low_stock_count || 0}
                </div>
                <p className="text-sm text-slate-600">productos bajo mínimo</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Valor del Inventario por Producto</CardTitle>
              <CardDescription>Top 10 productos por valor de inventario</CardDescription>
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

          <Card>
            <CardHeader>
              <CardTitle>Productos con Stock Bajo</CardTitle>
              <CardDescription>Productos que requieren reabastecimiento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {productsReport?.filter(p => p.stock_status === 'Bajo').map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <div className="font-medium text-slate-800">{product.name}</div>
                      <div className="text-sm text-slate-600">
                        Stock: {product.current_stock} | Mínimo: {product.minimum_stock}
                      </div>
                    </div>
                    <div className="text-red-600 font-bold">
                      ${product.stock_value.toLocaleString()}
                    </div>
                  </div>
                )) || (
                  <div className="text-slate-500 text-center py-4">No hay productos con stock bajo</div>
                )}
              </div>
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
                Los reportes de clientes se implementarán en la siguiente versión.
                <br />
                <Button variant="outline" className="mt-4">
                  Solicitar Funcionalidad
                </Button>
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
                  <div className="text-2xl font-bold text-green-600">
                    ${dashboardStats?.monthly_sales?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-green-700">Ingresos del Mes</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ${dashboardStats?.inventory_value?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-blue-700">Valor del Inventario</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {dashboardStats?.sales_count || 0}
                  </div>
                  <div className="text-sm text-purple-700">Transacciones</div>
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
