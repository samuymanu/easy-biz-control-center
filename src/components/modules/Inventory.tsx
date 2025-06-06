
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit, Package } from "lucide-react";
import ProductModal from "@/components/inventory/ProductModal";
import StockMovementModal from "@/components/inventory/StockMovementModal";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  costPrice: number;
  salePrice: number;
  supplier: string;
}

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      sku: "LAP001",
      name: "Laptop HP EliteBook 840",
      category: "Computadoras",
      stock: 15,
      minStock: 5,
      costPrice: 850,
      salePrice: 1200,
      supplier: "HP Inc."
    },
    {
      id: "2",
      sku: "MOU001",
      name: "Mouse Logitech MX Master 3",
      category: "Accesorios",
      stock: 25,
      minStock: 10,
      costPrice: 65,
      salePrice: 95,
      supplier: "Logitech"
    },
    {
      id: "3",
      sku: "MON001",
      name: "Monitor LG 24 pulgadas",
      category: "Monitores",
      stock: 8,
      minStock: 3,
      costPrice: 180,
      salePrice: 250,
      supplier: "LG Electronics"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = (productData: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString()
    };
    setProducts([...products, newProduct]);
    setIsProductModalOpen(false);
  };

  const handleEditProduct = (productData: Omit<Product, "id">) => {
    if (selectedProduct) {
      setProducts(products.map(p => p.id === selectedProduct.id ? { ...productData, id: selectedProduct.id } : p));
      setSelectedProduct(null);
      setIsProductModalOpen(false);
    }
  };

  const handleStockMovement = (productId: string, movement: { type: string; quantity: number; reason: string }) => {
    setProducts(products.map(product => {
      if (product.id === productId) {
        const newStock = movement.type === 'entrada' 
          ? product.stock + movement.quantity 
          : product.stock - movement.quantity;
        return { ...product, stock: Math.max(0, newStock) };
      }
      return product;
    }));
    setIsStockModalOpen(false);
    setSelectedProduct(null);
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= minStock) return { status: "Bajo", color: "bg-red-500" };
    if (stock <= minStock * 1.5) return { status: "Medio", color: "bg-yellow-500" };
    return { status: "Bueno", color: "bg-green-500" };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Gestión de Inventario</h1>
        <Button onClick={() => setIsProductModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          {/* Búsqueda y filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Buscar Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Buscar por nombre o SKU</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="search"
                      placeholder="Buscar productos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de productos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock, product.minStock);
              
              return (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <CardDescription>SKU: {product.sku}</CardDescription>
                      </div>
                      <Badge variant="secondary">{product.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Stock:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{product.stock}</span>
                          <div className={`w-2 h-2 rounded-full ${stockStatus.color}`}></div>
                          <span className="text-xs">{stockStatus.status}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Precio venta:</span>
                        <span className="font-bold text-green-600">${product.salePrice}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Proveedor:</span>
                        <span className="text-sm">{product.supplier}</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsProductModalOpen(true);
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsStockModalOpen(true);
                          }}
                        >
                          <Package className="h-3 w-3 mr-1" />
                          Stock
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="movements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Movimientos</CardTitle>
              <CardDescription>Registro de entradas y salidas de inventario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-slate-500 py-8">
                Historial de movimientos - Funcionalidad en desarrollo
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Stock</CardTitle>
              <CardDescription>Productos que requieren atención</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {products.filter(p => p.stock <= p.minStock).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <div className="font-medium text-slate-800">{product.name}</div>
                      <div className="text-sm text-slate-600">
                        Stock: {product.stock} | Mínimo: {product.minStock}
                      </div>
                    </div>
                    <Button size="sm" variant="destructive">
                      Reabastecer
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modales */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
        onSave={selectedProduct ? handleEditProduct : handleAddProduct}
        product={selectedProduct}
      />

      <StockMovementModal
        isOpen={isStockModalOpen}
        onClose={() => {
          setIsStockModalOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleStockMovement}
        product={selectedProduct}
      />
    </div>
  );
};

export default Inventory;
