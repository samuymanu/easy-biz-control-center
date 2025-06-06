
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, ShoppingCart, FileText } from "lucide-react";
import SaleModal from "@/components/sales/SaleModal";
import CustomerModal from "@/components/sales/CustomerModal";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Sale {
  id: string;
  date: string;
  customer: Customer;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: string;
}

const Sales = () => {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "1",
      name: "Juan Pérez",
      email: "juan@email.com",
      phone: "555-0123",
      address: "Calle Principal 123"
    },
    {
      id: "2",
      name: "María González",
      email: "maria@email.com",
      phone: "555-0456",
      address: "Av. Central 456"
    }
  ]);

  const [sales, setSales] = useState<Sale[]>([
    {
      id: "1",
      date: "2024-06-06",
      customer: customers[0],
      items: [
        { productName: "Laptop HP EliteBook", quantity: 1, price: 1200, total: 1200 },
        { productName: "Mouse Logitech", quantity: 2, price: 95, total: 190 }
      ],
      subtotal: 1390,
      tax: 208.5,
      total: 1598.5,
      paymentMethod: "Tarjeta",
      status: "Completada"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const filteredSales = sales.filter(sale =>
    sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewSale = (saleData: Omit<Sale, "id" | "date">) => {
    const newSale: Sale = {
      ...saleData,
      id: `SALE-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setSales([newSale, ...sales]);
    setIsSaleModalOpen(false);
  };

  const handleNewCustomer = (customerData: Omit<Customer, "id">) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString()
    };
    setCustomers([...customers, newCustomer]);
    setIsCustomerModalOpen(false);
  };

  const getTotalSalesAmount = () => {
    return sales.reduce((total, sale) => total + sale.total, 0);
  };

  const getTodaySales = () => {
    const today = new Date().toISOString().split('T')[0];
    return sales.filter(sale => sale.date === today);
  };

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ventas Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${getTotalSalesAmount().toLocaleString()}
            </div>
            <p className="text-sm text-slate-600">{sales.length} transacciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ventas de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {getTodaySales().length}
            </div>
            <p className="text-sm text-slate-600">transacciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clientes Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {customers.length}
            </div>
            <p className="text-sm text-slate-600">clientes activos</p>
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
                  <Label htmlFor="search-sales">Buscar por cliente o ID de venta</Label>
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
            {filteredSales.map((sale) => (
              <Card key={sale.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Venta #{sale.id}</CardTitle>
                      <CardDescription>
                        {sale.date} - {sale.customer.name}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge variant={sale.status === "Completada" ? "default" : "secondary"}>
                        {sale.status}
                      </Badge>
                      <div className="text-2xl font-bold text-green-600 mt-1">
                        ${sale.total.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="font-medium">Productos:</div>
                    {sale.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm text-slate-600">
                        <span>{item.productName} x{item.quantity}</span>
                        <span>${item.total.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between text-sm">
                        <span>Método de pago:</span>
                        <span>{sale.paymentMethod}</span>
                      </div>
                    </div>
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
            ))}
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{customer.name}</CardTitle>
                  <CardDescription>{customer.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div><strong>Teléfono:</strong> {customer.phone}</div>
                    <div><strong>Dirección:</strong> {customer.address}</div>
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
