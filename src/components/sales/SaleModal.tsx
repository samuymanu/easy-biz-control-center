
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, AlertCircle } from "lucide-react";

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

interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  availableStock: number;
}

interface Sale {
  customer: Customer;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: string;
}

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sale: Omit<Sale, "id" | "date">) => void;
  customers: Customer[];
  products: Product[];
  loading?: boolean;
}

const SaleModal = ({ isOpen, onClose, onSave, customers, products, loading = false }: SaleModalProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [newItem, setNewItem] = useState({
    productId: "",
    quantity: 1,
    price: 0
  });

  const addItem = () => {
    const selectedProduct = products.find(p => p.id === newItem.productId);
    if (selectedProduct && newItem.quantity > 0 && newItem.price > 0) {
      // Verificar stock disponible
      if (newItem.quantity > selectedProduct.current_stock) {
        alert(`Stock insuficiente. Disponible: ${selectedProduct.current_stock}`);
        return;
      }

      // Verificar si el producto ya está en la lista
      const existingItemIndex = items.findIndex(item => item.productId === newItem.productId);
      
      if (existingItemIndex >= 0) {
        // Actualizar cantidad del producto existente
        const updatedItems = [...items];
        const newQuantity = updatedItems[existingItemIndex].quantity + newItem.quantity;
        
        if (newQuantity > selectedProduct.current_stock) {
          alert(`Stock insuficiente. Disponible: ${selectedProduct.current_stock}`);
          return;
        }
        
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity,
          total: newQuantity * updatedItems[existingItemIndex].price
        };
        setItems(updatedItems);
      } else {
        // Agregar nuevo producto
        const item: SaleItem = {
          productId: newItem.productId,
          productName: selectedProduct.name,
          quantity: newItem.quantity,
          price: newItem.price,
          total: newItem.quantity * newItem.price,
          availableStock: selectedProduct.current_stock
        };
        setItems([...items, item]);
      }
      
      setNewItem({ productId: "", quantity: 1, price: 0 });
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItemQuantity = (index: number, newQuantity: number) => {
    const updatedItems = [...items];
    const item = updatedItems[index];
    
    if (newQuantity > item.availableStock) {
      alert(`Stock insuficiente. Disponible: ${item.availableStock}`);
      return;
    }
    
    if (newQuantity <= 0) {
      removeItem(index);
      return;
    }
    
    updatedItems[index] = {
      ...item,
      quantity: newQuantity,
      total: newQuantity * item.price
    };
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.15; // 15% de impuesto
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomer && items.length > 0 && paymentMethod) {
      const { subtotal, tax, total } = calculateTotals();
      
      onSave({
        customer: selectedCustomer,
        items: items,
        subtotal,
        tax,
        total,
        paymentMethod,
        status: "Completada"
      });

      // Reset form
      resetForm();
    }
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setItems([]);
    setPaymentMethod("");
    setNewItem({ productId: "", quantity: 1, price: 0 });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setNewItem(prev => ({
        ...prev,
        productId,
        price: product.sale_price
      }));
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  // Filtrar productos con stock
  const availableProducts = products.filter(p => p.current_stock > 0);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Venta</DialogTitle>
          <DialogDescription>Procesar una nueva venta</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selección de cliente */}
          <div>
            <Label htmlFor="customer">Cliente *</Label>
            <Select 
              value={selectedCustomer?.id || ""} 
              onValueChange={(value) => {
                const customer = customers.find(c => c.id === value);
                setSelectedCustomer(customer || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {customers.filter(c => c.is_active !== false).map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Agregar productos */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Agregar Productos</h3>
            
            {availableProducts.length === 0 ? (
              <div className="text-center py-4">
                <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-slate-600">No hay productos disponibles con stock</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor="product">Producto *</Label>
                  <Select 
                    value={newItem.productId}
                    onValueChange={handleProductSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ${product.sale_price} (Stock: {product.current_stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="quantity">Cantidad *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Precio *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItem.price}
                    onChange={(e) => setNewItem(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                
                <div className="flex items-end">
                  <Button 
                    type="button" 
                    onClick={addItem} 
                    className="w-full"
                    disabled={!newItem.productId || newItem.quantity <= 0 || newItem.price <= 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Lista de productos agregados */}
          {items.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">Productos en la Venta</h3>
              
              <div className="space-y-3 mb-4">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-sm text-slate-600">
                        Precio unitario: ${item.price} | Stock disponible: {item.availableStock}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max={item.availableStock}
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                      <span className="text-sm text-slate-600 min-w-[80px]">= ${item.total.toFixed(2)}</span>
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impuestos (15%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Método de pago */}
          <div>
            <Label htmlFor="payment">Método de Pago *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="tarjeta">Tarjeta de Crédito/Débito</SelectItem>
                <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedCustomer || items.length === 0 || !paymentMethod || loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "Procesando..." : "Procesar Venta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SaleModal;
