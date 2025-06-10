import React from "react";

interface Item {
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface FacturaModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: {
    sale_number: string;
    sale_date: string;
    customer_name?: string;
    items: Item[];
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    payment_method?: string;
    exchangeRate?: number;
  } | null;
}

const FacturaModal: React.FC<FacturaModalProps> = ({ isOpen, onClose, sale }) => {
  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 print:hidden">
      <div
        className="bg-white rounded-lg shadow-lg max-w-xs w-[80mm] p-4 relative print:w-[80mm] print:max-w-none print:rounded-none"
        style={{
          minWidth: "80mm",
          fontFamily: "monospace",
        }}
        id="factura-ticket"
      >
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute right-3 top-2 text-gray-400 hover:text-red-600 print:hidden"
        >
          ×
        </button>
        {/* Encabezado */}
        <div className="text-center text-xs mb-2">
          <div className="font-bold text-base">TU EMPRESA, C.A.</div>
          <div>RIF: J-12345678-9</div>
          <div>Av. Principal, Caracas</div>
          <div>Telf: 0212-1234567</div>
          <div className="mt-1">
            <b>Factura:</b> {sale.sale_number}
          </div>
          <div>
            <b>Fecha:</b> {new Date(sale.sale_date).toLocaleString()}
          </div>
        </div>

        <div className="border-t border-b py-1 text-xs mb-2">
          Cliente: {sale.customer_name || "Consumidor Final"}
        </div>

        {/* Items */}
        <div className="text-xs mb-2">
          {sale.items?.map((item, idx) => (
            <div key={idx} className="flex justify-between">
              <span>
                {item.productName} x{item.quantity}
              </span>
              <span>
                ${item.price.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Totales */}
        <div className="border-t mt-2 mb-1" />
        <div className="flex justify-between text-xs">
          <span>SUBTOTAL:</span>
          <span>${sale.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>IVA (15%):</span>
          <span>${sale.tax_amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-sm">
          <span>TOTAL:</span>
          <span>${sale.total_amount.toFixed(2)}</span>
        </div>
        {sale.exchangeRate && (
          <div className="flex justify-between text-xs">
            <span>Total Bs:</span>
            <span>
              Bs {(sale.total_amount * sale.exchangeRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {/* Método de pago */}
        <div className="mt-2 text-xs">
          <strong>Pago:</strong> {sale.payment_method}
        </div>

        {/* Pie de página */}
        <div className="text-center text-xs mt-2 border-t pt-2">
          ¡Gracias por su compra!
        </div>

        {/* Botón Imprimir */}
        <div className="flex justify-center mt-3 print:hidden">
          <button
            className="bg-green-600 text-white px-3 py-1 rounded text-xs"
            onClick={() => {
              // Solo imprime el ticket, no el fondo
              window.print();
            }}
          >
            Imprimir
          </button>
        </div>
      </div>
      {/* CSS de impresión */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #factura-ticket, #factura-ticket * { visibility: visible !important; }
          #factura-ticket {
            position: absolute !important;
            left: 0; top: 0;
            width: 80mm !important;
            max-width: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: white !important;
          }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default FacturaModal;