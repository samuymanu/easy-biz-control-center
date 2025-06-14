
export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  category_id: number;
  category_name?: string;
  supplier_id?: number;
  supplier_name?: string;
  cost_price: number;
  sale_price: number;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  unit_of_measure?: string;
  barcode?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Movement {
  id: number;
  product_id: number;
  product_name: string;
  movement_type: string;
  quantity: number;
  reason: string;
  username: string;
  created_at: string;
}

