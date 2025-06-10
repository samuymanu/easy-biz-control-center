import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportToPDF(filename, rows) {
  if (!rows || !rows.length) {
    alert('No hay datos para exportar');
    return;
  }
  const doc = new jsPDF();
  const keys = Object.keys(rows[0]);
  const data = rows.map(row => keys.map(k => row[k]));
  autoTable(doc, {
    head: [keys],
    body: data,
  });
  doc.save(filename);
}