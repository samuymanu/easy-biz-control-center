import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/types/inventory";

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (saleData: any) => void;
  customers: Customer[];
  products: Product[];
  loading: boolean;
  exchangeRate: number;
}

const paymentMethods = [
  { value: "Pago Móvil", label: "Pago Móvil" },
  { value: "Punto de Venta", label: "Punto de Venta" },
  { value: "Efectivo Bs", label: "Efectivo Bs" },
  { value: "Efectivo USD", label: "Efectivo $" },
  { value: "Zelle", label: "Zelle" },
  { value: "USDT", label: "USDT" },
];

const SaleModal: React.FC<SaleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customers,
  products,
  loading,
  exchangeRate: initialExchangeRate,
}) => {
  // LOCAL STATE
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [items, setItems] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>(paymentMethods[0].value);
  const [exchangeRate, setExchangeRate] = useState<number>(initialExchangeRate || 0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<any>(null);
  const [showFactura, setShowFactura] = useState<boolean>(false);

  // Find selected product with strict string comparison
  const productObj = products.find(p => String(p.id) === String(selectedProductId));

  // Cuando seleccionas producto, pon el precio por defecto del producto
  const handleSelectProduct = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prodId = e.target.value;
    setSelectedProductId(prodId);
    const prod = products.find(p => String(p.id) === String(prodId));
    setPrice(prod ? prod.sale_price : 0);
  };

  // Add product to sale
  const handleAddItem = () => {
    setFeedback(null);

    // Validación robusta
    if (!selectedProductId) {
      setFeedback("Selecciona un producto");
      return;
    }
    if (!productObj) {
      setFeedback("Producto no válido");
      return;
    }
    if (!quantity || quantity < 1) {
      setFeedback("Cantidad debe ser al menos 1");
      return;
    }
    if (quantity > productObj.current_stock) {
      setFeedback(`No hay suficiente stock. Disponible: ${productObj.current_stock}`);
      return;
    }
    if (!price || price <= 0) {
      setFeedback("El precio debe ser mayor a 0");
      return;
    }
    if (items.some(item => String(item.productId) === String(productObj.id))) {
      setFeedback("Este producto ya fue agregado");
      return;
    }
    setItems([...items, {
      productId: productObj.id,
      productName: productObj.name,
      quantity,
      price,
      total: price * quantity,
      stock: productObj.current_stock,
    }]);
    setSelectedProductId("");
    setQuantity(1);
    setPrice(0);
  };

  // Remove item
  const handleRemoveItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  // Totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = +(subtotal * 0.15).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  // Process sale
  const handleProcessSale = () => {
    setFeedback(null);
    if (items.length === 0) {
      setFeedback("Agrega al menos un producto");
      return;
    }
    onSave({
      customer: selectedCustomer ? customers.find(c => c.id === selectedCustomer) : null,
      items,
      subtotal,
      tax,
      total,
      paymentMethod,
      exchangeRate,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-500 hover:text-red-500 text-xl">&times;</button>
        <h2 className="text-2xl font-semibold mb-1">Nueva Venta</h2>
        <p className="mb-4 text-slate-500">Procesar una nueva venta</p>

        {/* Tasa de cambio */}
        <div className="mb-4 flex items-center gap-3">
          <Label>Tasa de cambio Bs/$:</Label>
          <Input
            type="number"
            min={0}
            value={exchangeRate}
            onChange={e => setExchangeRate(Number(e.target.value))}
            className="w-28"
            placeholder="Tasa Bs"
          />
        </div>

        {/* Cliente */}
        <Label>Cliente</Label>
        <select
          className="w-full border rounded px-2 py-2 mb-4"
          value={selectedCustomer}
          onChange={e => setSelectedCustomer(e.target.value)}
        >
          <option value="">Consumidor Final</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} {c.email && `- ${c.email}`}
            </option>
          ))}
        </select>

        {/* Agregar productos */}
        <div className="mb-4 border p-3 rounded">
          <Label>Agregar Productos</Label>
          <div className="flex gap-2 mb-2 items-end">
            <select
              className="border rounded px-2 py-1"
              value={selectedProductId}
              onChange={handleSelectProduct}
            >
              <option value="">Seleccionar producto</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <Input
              type="number"
              min={1}
              max={productObj?.current_stock || 1}
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              placeholder="Cantidad"
              className="w-20"
              disabled={!selectedProductId}
            />
            <Input
              type="number"
              min={0}
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              placeholder="Precio"
              className="w-28"
              disabled={!selectedProductId}
            />
            <Button onClick={handleAddItem} disabled={!selectedProductId || !quantity || !price}>+ Agregar</Button>
          </div>
          {productObj && (
            <div className="text-xs text-slate-600 mb-1">
              <b>Stock disponible:</b> {productObj.current_stock}
            </div>
          )}
          {feedback && <div className="text-red-500 text-xs">{feedback}</div>}
        </div>

        {/* Productos en la venta */}
        <div className="mb-4 border rounded p-3">
          <Label>Productos en la Venta</Label>
          {items.length === 0 ? (
            <div className="text-slate-400">No hay productos agregados.</div>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between border-b py-1">
                <div>
                  <span className="font-semibold">{item.productName}</span>
                  <span className="ml-2 text-slate-500 text-xs">Stock: {item.stock}</span>
                  <div className="text-xs text-slate-600">
                    Precio unitario: ${item.price} | Bs {(item.price * exchangeRate).toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span>{item.quantity} x ${item.price} = <b>${item.total.toFixed(2)}</b></span>
                  <span className="text-xs text-slate-500 ml-2">Bs {(item.total * exchangeRate).toFixed(2)}</span>
                  <Button size="sm" variant="destructive" onClick={() => handleRemoveItem(idx)}>Eliminar</Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totales */}
        <div className="mb-4">
          <div>Subtotal: <b>${subtotal.toFixed(2)}</b> | <b>Bs {(subtotal * exchangeRate).toFixed(2)}</b></div>
          <div>Impuestos (15%): <b>${tax.toFixed(2)}</b> | <b>Bs {(tax * exchangeRate).toFixed(2)}</b></div>
          <div className="font-bold text-lg mt-2">Total: ${total.toFixed(2)} | Bs {(total * exchangeRate).toFixed(2)}</div>
        </div>

        {/* Método de pago */}
        <div className="mb-4">
          <Label>Método de Pago</Label>
          <select
            className="w-full border rounded px-2 py-2"
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value)}
          >
            {paymentMethods.map(pm => (
              <option key={pm.value} value={pm.value}>{pm.label}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleProcessSale}
            disabled={items.length === 0 || loading}
          >
            {loading ? "Procesando..." : "Procesar Venta"}
          </Button>
        </div>

        {/* Botones adicionales para ver e imprimir factura */}
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={() => {
            setVentaSeleccionada(null);
            setShowFactura(true);
          }}>
            Ver Factura
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SaleModal;
