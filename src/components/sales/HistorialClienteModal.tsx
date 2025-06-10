import React from "react";

interface Venta {
  sale_number: string;
  sale_date: string;
  total_amount: number;
  items: { productName: string; quantity: number; price: number }[];
}

interface HistorialClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: { name: string; email?: string } | null;
  ventas: Venta[];
}

const HistorialClienteModal: React.FC<HistorialClienteModalProps> = ({
  isOpen,
  onClose,
  cliente,
  ventas,
}) => {
  if (!isOpen || !cliente) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-500 hover:text-red-500 text-xl">&times;</button>
        <h2 className="text-lg font-semibold mb-2">Historial de {cliente.name}</h2>
        <div className="mb-3 text-xs text-slate-500">{cliente.email}</div>
        {ventas.length === 0 ? (
          <div className="text-slate-400">No hay ventas registradas para este cliente.</div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {ventas.map((venta, idx) => (
              <div key={idx} className="border-b pb-2">
                <div className="flex justify-between">
                  <span><b>Venta:</b> {venta.sale_number}</span>
                  <span className="text-xs">{new Date(venta.sale_date).toLocaleDateString()}</span>
                </div>
                <div className="text-xs">Total: ${venta.total_amount?.toFixed(2)}</div>
                <ul className="text-xs ml-2">
                  {venta.items.map((item, i) => (
                    <li key={i}>
                      {item.productName} x{item.quantity} (${item.price?.toFixed(2)})
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialClienteModal;