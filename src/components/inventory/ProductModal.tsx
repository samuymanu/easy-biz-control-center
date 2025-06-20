import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Product, Category, Supplier } from "@/types/inventory";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: any) => void;
  product?: Product | null;
  categories: Category[];
  suppliers: Supplier[];
  loading?: boolean;
}

const ProductModal = ({ isOpen, onClose, onSave, product, categories, suppliers, loading = false }: ProductModalProps) => {
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    brand: "",
    model: "",
    description: "",
    category_id: "",
    supplier_id: "0", // Usar "0" en lugar de "" para indicar sin proveedor
    cost_price: 0,
    sale_price: 0,
    current_stock: 0,
    minimum_stock: 0,
    maximum_stock: 0,
    unit_of_measure: "unidades",
    barcode: "",
    is_active: true
  });

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        brand: product.brand || "",
        model: product.model || "",
        description: product.description || "",
        category_id: product.category_id.toString(),
        supplier_id: product.supplier_id?.toString() || "0",
        cost_price: product.cost_price,
        sale_price: product.sale_price,
        current_stock: product.current_stock,
        minimum_stock: product.minimum_stock,
        maximum_stock: product.maximum_stock || 0,
        unit_of_measure: product.unit_of_measure || "unidades",
        barcode: product.barcode || "",
        is_active: product.is_active
      });
    } else {
      resetForm();
    }
  }, [product, isOpen]);

  const resetForm = () => {
    setFormData({
      sku: "",
      name: "",
      brand: "",
      model: "",
      description: "",
      category_id: "",
      supplier_id: "0",
      cost_price: 0,
      sale_price: 0,
      current_stock: 0,
      minimum_stock: 0,
      maximum_stock: 0,
      unit_of_measure: "unidades",
      barcode: "",
      is_active: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      category_id: parseInt(formData.category_id),
      supplier_id: formData.supplier_id === "0" ? null : parseInt(formData.supplier_id),
      cost_price: parseFloat(formData.cost_price.toString()),
      sale_price: parseFloat(formData.sale_price.toString()),
      current_stock: parseInt(formData.current_stock.toString()),
      minimum_stock: parseInt(formData.minimum_stock.toString()),
      maximum_stock: formData.maximum_stock ? parseInt(formData.maximum_stock.toString()) : null
    };

    onSave(productData);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          <DialogDescription>
            {product ? "Modificar información del producto" : "Agregar un nuevo producto al inventario"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="SKU del producto"
                required
              />
            </div>

            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del producto"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="Marca del producto"
              />
            </div>

            <div>
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                placeholder="Modelo del producto"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción del producto"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="supplier">Proveedor</Label>
              <Select 
                value={formData.supplier_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, supplier_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sin proveedor</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cost_price">Precio de Costo *</Label>
              <Input
                id="cost_price"
                type="number"
                min={0}
                value={formData.cost_price === 0 ? "" : formData.cost_price}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    cost_price: value === "" ? 0 : Number(value)
                  }));
                }}
                required
              />
            </div>

            <div>
              <Label htmlFor="sale_price">Precio de Venta *</Label>
              <Input
                id="sale_price"
                type="number"
                min={0}
                value={formData.sale_price === 0 ? "" : formData.sale_price}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    sale_price: value === "" ? 0 : Number(value)
                  }));
                }}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="current_stock">Stock Actual *</Label>
              <Input
                id="current_stock"
                type="number"
                min={0}
                value={formData.current_stock === 0 ? "" : formData.current_stock}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    current_stock: value === "" ? 0 : Number(value)
                  }));
                }}
                required
              />
            </div>

            <div>
              <Label htmlFor="minimum_stock">Stock Mínimo *</Label>
              <Input
                id="minimum_stock"
                type="number"
                min={0}
                value={formData.minimum_stock === 0 ? "" : formData.minimum_stock}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    minimum_stock: value === "" ? 0 : Number(value)
                  }));
                }}
                required
              />
            </div>

            <div>
              <Label htmlFor="maximum_stock">Stock Máximo</Label>
              <Input
                id="maximum_stock"
                type="number"
                min={0}
                value={formData.maximum_stock === 0 ? "" : formData.maximum_stock}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    maximum_stock: value === "" ? 0 : Number(value)
                  }));
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit_of_measure">Unidad de Medida</Label>
              <Input
                id="unit_of_measure"
                value={formData.unit_of_measure}
                onChange={(e) => setFormData(prev => ({ ...prev, unit_of_measure: e.target.value }))}
                placeholder="ej: unidades, kg, litros"
              />
            </div>

            <div>
              <Label htmlFor="barcode">Código de Barras</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                placeholder="Código de barras"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.name || !formData.sku || !formData.category_id}>
              {loading ? "Guardando..." : (product ? "Actualizar" : "Crear Producto")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
