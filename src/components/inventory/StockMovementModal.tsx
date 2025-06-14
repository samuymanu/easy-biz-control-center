import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/types/inventory";

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: string, movement: { type: string; quantity: number; reason: string }) => void;
  product?: Product | null;
  loading?: boolean;
}

const StockMovementModal = ({ isOpen, onClose, onSave, product, loading = false }: StockMovementModalProps) => {
  const [movementType, setMovementType] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product && movementType && quantity > 0) {
      onSave(product.id, {
        type: movementType,
        quantity: quantity,
        reason: reason
      });
      
      // Reset form
      setMovementType("");
      setQuantity(0);
      setReason("");
    }
  };

  const resetForm = () => {
    setMovementType("");
    setQuantity(0);
    setReason("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Movimiento de Stock</DialogTitle>
          <DialogDescription>
            {product ? `Gestionar stock de: ${product.name}` : "Seleccione un producto"}
          </DialogDescription>
        </DialogHeader>

        {product && (
          <div className="p-3 bg-slate-50 rounded-lg mb-4">
            <div className="text-sm text-slate-600">Stock actual:</div>
            <div className="text-xl font-bold">{product.current_stock} {product.unit_of_measure || 'unidades'}</div>
            <div className="text-xs text-slate-500">SKU: {product.sku}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="movement-type">Tipo de Movimiento *</Label>
            <Select value={movementType} onValueChange={setMovementType}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada de Stock</SelectItem>
                <SelectItem value="salida">Salida de Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity">Cantidad *</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              min="1"
              required
            />
          </div>

          <div>
            <Label htmlFor="reason">Motivo/Observaciones *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe el motivo del movimiento..."
              rows={3}
              required
            />
          </div>

          {movementType && quantity > 0 && product && (
            <div className={`p-3 rounded-lg ${movementType === 'entrada' ? 'bg-green-50' : 'bg-orange-50'}`}>
              <div className={`text-sm ${movementType === 'entrada' ? 'text-green-800' : 'text-orange-800'}`}>
                <strong>Resultado del movimiento:</strong>
              </div>
              <div className={movementType === 'entrada' ? 'text-green-600' : 'text-orange-600'}>
                Stock resultante: {
                  movementType === 'entrada' 
                    ? product.current_stock + quantity 
                    : Math.max(0, product.current_stock - quantity)
                } {product.unit_of_measure || 'unidades'}
              </div>
              {movementType === 'salida' && quantity > product.current_stock && (
                <div className="text-red-600 text-sm mt-1">
                  ⚠️ La cantidad supera el stock disponible
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!movementType || quantity <= 0 || !reason || loading}
            >
              {loading ? "Aplicando..." : "Aplicar Movimiento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StockMovementModal;
