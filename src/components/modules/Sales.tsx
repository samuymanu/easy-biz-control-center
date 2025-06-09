import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, ShoppingCart, FileText, DollarSign, Users, TrendingUp } from "lucide-react";
import { useApi, useApiMutation } from "@/hooks/useApi";
import { toast } from "sonner";
import SaleModal from "@/components/sales/SaleModal";
import CustomerModal from "@/components/sales/CustomerModal";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  tax_id?: string;
  credit_limit?: number;
  is_active?: boolean;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  sale_price: number;
  current_stock: number;
  category_name?: string;
}

interface Sale {
  id: string;
  sale_number: string;
  sale_date: string;
  customer_name?: string;
  customer_id?: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_method?: string;
  payment_status: string;
  sale_status: string;
  notes?: string;
}

const Sales = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // API calls with proper null handling
  const { data: customersData, loading: loadingCustomers } = useApi<Customer[]>('/customers');
  const { data: productsData } = useApi<Product[]>('/products');
  const { data: salesData, loading: loadingSales } = useApi<Sale[]>('/sales');
  
  // Ensure data is always an array, never null
  const customers = Array.isArray(customersData) ? customersData : [];
  const products = Array.isArray(productsData) ? productsData : [];
  const sales = Array.isArray(salesData) ? salesData : [];
  
  const { mutate: createSale, loading: creatingSale } = useApiMutation<Sale>();
  const { mutate: createCustomer, loading: creatingCustomer } = useApiMutation<Customer>();

  const filteredSales = sales.filter(sale =>
    (sale.customer_name && sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    sale.sale_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewSale = async (saleData: any) => {
    try {
      const salePayload = {
        customer_id: saleData.customer.id,
        subtotal: saleData.subtotal,
        tax_amount: saleData.tax,
        total_amount: saleData.total,
        payment_method: saleData.paymentMethod,
        items: saleData.items.map((item: any) => ({
          product_id: products.find(p => p.name === item.productName)?.id,
          quantity: item.quantity,
          unit_price: item.price,
          line_total: item.total
        }))
      };

      console.log('Creating sale with payload:', salePayload);
      await createSale('/sales', salePayload);
      toast.success('Venta procesada correctamente');
      setIsSaleModalOpen(false);
      window.location.reload(); // Refresh to get updated data
    } catch (error) {
      console.error('Error creating sale:', error);
      toast.error('Error al procesar venta');
    }
  };

  const handleNewCustomer = async (customerData: any) => {
    try {
      console.log('Creating customer with data:', customerData);
      await createCustomer('/customers', customerData);
      toast.success('Cliente creado correctamente');
      setIsCustomerModalOpen(false);
      window.location.reload(); // Refresh to get updated data
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Error al crear cliente');
    }
  };

  const getTotalSalesAmount = () => {
    return sales.reduce((total, sale) => total + sale.total_amount, 0);
  };

  const getTodaySales = () => {
    const today = new Date().toISOString().split('T')[0];
    return sales.filter(sale => sale.sale_date === today);
  };

  const getCompletedSales = () => {
    return sales.filter(sale => sale.sale_status === 'completed').length;
  };

  const getAverageSale = () => {
    if (sales.length === 0) return 0;
    return getTotalSalesAmount() / sales.length;
  };

  if (loadingSales || loadingCustomers) {
    return <div className="flex items-center justify-center h-64">Cargando datos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Gestión de Ventas</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsCustomerModalOpen(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
          <Button onClick={() => setIsSaleModalOpen(true)} className="bg-green-600 hover:bg-green-700">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Nueva Venta
          </Button>
        </div>
      </div>

      {/* KPIs de Ventas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${getTotalSalesAmount().toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {sales.length} transacciones totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas de Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {getTodaySales().length}
            </div>
            <p className="text-xs text-muted-foreground">
              ventas realizadas hoy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {customers.filter(c => c.is_active !== false).length}
            </div>
            <p className="text-xs text-muted-foreground">
              clientes registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Venta Promedio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${getAverageSale().toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              promedio por venta
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sales">Ventas</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          {/* Búsqueda */}
          <Card>
            <CardHeader>
              <CardTitle>Buscar Ventas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search-sales">Buscar por cliente o número de venta</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="search-sales"
                      placeholder="Buscar ventas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de ventas */}
          <div className="space-y-4">
            {filteredSales.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <ShoppingCart className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">No hay ventas registradas</p>
                    <Button 
                      onClick={() => setIsSaleModalOpen(true)} 
                      className="mt-2 bg-green-600 hover:bg-green-700"
                    >
                      Crear primera venta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredSales.map((sale) => (
                <Card key={sale.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Venta #{sale.sale_number}</CardTitle>
                        <CardDescription>
                          {new Date(sale.sale_date).toLocaleDateString()} - {sale.customer_name || 'Cliente no especificado'}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge variant={sale.sale_status === "completed" ? "default" : "secondary"}>
                          {sale.sale_status === "completed" ? "Completada" : sale.sale_status}
                        </Badge>
                        <div className="text-2xl font-bold text-green-600 mt-1">
                          ${sale.total_amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Subtotal:</span>
                          <span className="font-medium ml-2">${sale.subtotal.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Impuestos:</span>
                          <span className="font-medium ml-2">${sale.tax_amount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Método de pago:</span>
                          <span className="font-medium ml-2">{sale.payment_method || 'No especificado'}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Estado pago:</span>
                          <Badge variant={sale.payment_status === "paid" ? "default" : "secondary"} className="ml-2">
                            {sale.payment_status === "paid" ? "Pagado" : sale.payment_status}
                          </Badge>
                        </div>
                      </div>
                      
                      {sale.notes && (
                        <div className="mt-2 p-2 bg-slate-50 rounded text-sm">
                          <span className="text-slate-600">Notas:</span> {sale.notes}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm">
                          <FileText className="h-3 w-3 mr-1" />
                          Ver Factura
                        </Button>
                        <Button variant="outline" size="sm">
                          Imprimir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.filter(c => c.is_active !== false).map((customer) => (
              <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{customer.name}</CardTitle>
                  <CardDescription>{customer.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div><strong>Teléfono:</strong> {customer.phone || 'No especificado'}</div>
                    <div><strong>Dirección:</strong> {customer.address || 'No especificada'}</div>
                    {customer.city && <div><strong>Ciudad:</strong> {customer.city}</div>}
                    {customer.tax_id && <div><strong>RUC/DNI:</strong> {customer.tax_id}</div>}
                    {customer.credit_limit && (
                      <div><strong>Límite crédito:</strong> ${customer.credit_limit.toLocaleString()}</div>
                    )}
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        Ver Historial
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modales */}
      <SaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        onSave={handleNewSale}
        customers={customers}
        products={products}
        loading={creatingSale}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleNewCustomer}
      />
    </div>
  );
};

export default Sales;
