
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface SaleItem {
  productName: string;
  quantity: number;
  price: number;
  total: number;
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
}

const SaleModal = ({ isOpen, onClose, onSave, customers }: SaleModalProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [newItem, setNewItem] = useState({
    productName: "",
    quantity: 1,
    price: 0
  });

  // Productos disponibles (simulado)
  const availableProducts = [
    { name: "Laptop HP EliteBook", price: 1200 },
    { name: "Mouse Logitech", price: 95 },
    { name: "Monitor LG 24''", price: 250 },
    { name: "Teclado Mecánico", price: 150 },
    { name: "Cable HDMI", price: 25 }
  ];

  const addItem = () => {
    if (newItem.productName && newItem.quantity > 0 && newItem.price > 0) {
      const item: SaleItem = {
        ...newItem,
        total: newItem.quantity * newItem.price
      };
      setItems([...items, item]);
      setNewItem({ productName: "", quantity: 1, price: 0 });
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
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
      setSelectedCustomer(null);
      setItems([]);
      setPaymentMethod("");
      setNewItem({ productName: "", quantity: 1, price: 0 });
    }
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setItems([]);
    setPaymentMethod("");
    setNewItem({ productName: "", quantity: 1, price: 0 });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Venta</DialogTitle>
          <DialogDescription>Procesar una nueva venta</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selección de cliente */}
          <div>
            <Label htmlFor="customer">Cliente</Label>
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
                {customers.map((customer) => (
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
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="product">Producto</Label>
                <Select 
                  value={newItem.productName}
                  onValueChange={(value) => {
                    const product = availableProducts.find(p => p.name === value);
                    setNewItem(prev => ({
                      ...prev,
                      productName: value,
                      price: product?.price || 0
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map((product) => (
                      <SelectItem key={product.name} value={product.name}>
                        {product.name} - ${product.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="quantity">Cantidad</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
              </div>
              
              <div>
                <Label htmlFor="price">Precio</Label>
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
                <Button type="button" onClick={addItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de productos agregados */}
          {items.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">Productos en la Venta</h3>
              
              <div className="space-y-2 mb-4">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div className="flex-1">
                      <span className="font-medium">{item.productName}</span>
                      <span className="text-sm text-slate-600 ml-2">
                        {item.quantity} x ${item.price} = ${item.total}
                      </span>
                    </div>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Impuestos (15%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Método de pago */}
          <div>
            <Label htmlFor="payment">Método de Pago</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="tarjeta">Tarjeta de Crédito</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedCustomer || items.length === 0 || !paymentMethod}
              className="bg-green-600 hover:bg-green-700"
            >
              Procesar Venta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SaleModal;
