import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit, Package, AlertTriangle } from "lucide-react";
import { useApi, useApiMutation } from "@/hooks/useApi";
import { toast } from "sonner";
import ProductModal from "@/components/inventory/ProductModal";
import StockMovementModal from "@/components/inventory/StockMovementModal";
import { Product, Category, Supplier, Movement } from "@/types/inventory";

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // API calls with proper null handling
  const { data: productsData, loading: loadingProducts, error: errorProducts, refetch: refetchProducts } = useApi<Product[]>('/products');
  const { data: categoriesData, refetch: refetchCategories } = useApi<Category[]>('/categories');
  const { data: suppliersData, refetch: refetchSuppliers } = useApi<Supplier[]>('/suppliers');
  const { data: movementsData, refetch: refetchMovements } = useApi<Movement[]>('/inventory/movements');
  
  // Ensure data is always an array, never null
  const products = Array.isArray(productsData) ? productsData : [];
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const suppliers = Array.isArray(suppliersData) ? suppliersData : [];
  const movements = Array.isArray(movementsData) ? movementsData : [];
  
  const { mutate: createProduct, loading: creatingProduct } = useApiMutation<Product>();
  const { mutate: updateProduct, loading: updatingProduct } = useApiMutation<Product>();
  const { mutate: createMovement, loading: creatingMovement } = useApiMutation<any>();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.model && product.model.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddProduct = async (productData: any) => {
    try {
      await createProduct('/products', productData);
      toast.success('Producto creado correctamente');
      setIsProductModalOpen(false);
      // Actualiza el estado de productos y movimientos sin recargar la página
      refetchProducts();
      refetchMovements();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Error al crear producto');
    }
  };

  const handleEditProduct = async (productData: any) => {
    if (selectedProduct) {
      try {
        await updateProduct(`/products/${selectedProduct.id}`, productData, 'PUT');
        toast.success('Producto actualizado correctamente');
        setSelectedProduct(null);
        setIsProductModalOpen(false);
        refetchProducts();
        refetchMovements();
      } catch (error) {
        console.error('Error updating product:', error);
        toast.error('Error al actualizar producto');
      }
    }
  };

  const handleStockMovement = async (productId: string, movement: { type: string; quantity: number; reason: string }) => {
    try {
      await createMovement('/inventory/movement', {
        product_id: productId,
        movement_type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason
      });
      toast.success('Movimiento registrado correctamente');
      setIsStockModalOpen(false);
      setSelectedProduct(null);
      refetchProducts();
      refetchMovements();
    } catch (error) {
      console.error('Error creating movement:', error);
      toast.error('Error al registrar movimiento');
    }
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= minStock) return { status: "Bajo", color: "bg-red-500" };
    if (stock <= minStock * 1.5) return { status: "Medio", color: "bg-yellow-500" };
    return { status: "Bueno", color: "bg-green-500" };
  };

  const lowStockProducts = products.filter(p => p.current_stock <= p.minimum_stock);

  if (loadingProducts) {
    return <div className="flex items-center justify-center h-64">Cargando productos...</div>;
  }

  if (errorProducts) {
    return <div className="flex items-center justify-center h-64 text-red-500">Error: {errorProducts}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Gestión de Inventario</h1>
        <Button onClick={() => {
            setSelectedProduct(null);
            setIsProductModalOpen(true);
        }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{products.length}</div>
            <p className="text-sm text-slate-600">productos activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stock Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {products.reduce((sum, p) => sum + p.current_stock, 0)}
            </div>
            <p className="text-sm text-slate-600">unidades en stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Valor Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${products.reduce((sum, p) => sum + (p.current_stock * p.cost_price), 0).toLocaleString()}
            </div>
            <p className="text-sm text-slate-600">valor total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alertas Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockProducts.length}</div>
            <p className="text-sm text-slate-600">productos con stock bajo</p>
          </CardContent>
        </Card>
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
                  <Label htmlFor="search">Buscar por nombre, SKU, marca o modelo</Label>
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
              const stockStatus = getStockStatus(product.current_stock, product.minimum_stock);
              
              return (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        {(product.brand || product.model) && 
                          <CardDescription>{product.brand} {product.model}</CardDescription>
                        }
                        <CardDescription>SKU: {product.sku}</CardDescription>
                      </div>
                      <Badge variant="secondary">{product.category_name || 'Sin categoría'}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Stock:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{product.current_stock}</span>
                          <div className={`w-2 h-2 rounded-full ${stockStatus.color}`}></div>
                          <span className="text-xs">{stockStatus.status}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Precio venta:</span>
                        <span className="font-bold text-green-600">${product.sale_price}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Proveedor:</span>
                        <span className="text-sm">{product.supplier_name || 'Sin proveedor'}</span>
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
              <div className="space-y-4">
                {movements.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">
                    No hay movimientos registrados
                  </div>
                ) : (
                  movements.slice(0, 10).map((movement) => (
                    <div key={movement.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium">{movement.product_name}</div>
                        <div className="text-sm text-slate-600">
                          {movement.movement_type === 'entrada' ? 'Entrada' : 'Salida'} - {movement.quantity} unidades
                        </div>
                        <div className="text-xs text-slate-500">{movement.reason}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-600">{movement.username}</div>
                        <div className="text-xs text-slate-500">
                          {new Date(movement.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                {lowStockProducts.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">
                    No hay productos con stock bajo
                  </div>
                ) : (
                  lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <div>
                          <div className="font-medium text-slate-800">{product.name}</div>
                          <div className="text-sm text-slate-600">
                            Stock: {product.current_stock} | Mínimo: {product.minimum_stock}
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsStockModalOpen(true);
                        }}
                      >
                        Reabastecer
                      </Button>
                    </div>
                  ))
                )}
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
        categories={categories}
        suppliers={suppliers}
        loading={creatingProduct || updatingProduct}
      />

      <StockMovementModal
        isOpen={isStockModalOpen}
        onClose={() => {
          setIsStockModalOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleStockMovement}
        product={selectedProduct}
        loading={creatingMovement}
      />
    </div>
  );
};

export default Inventory;
