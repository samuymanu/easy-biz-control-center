export function exportToCSV(filename, rows) {
  if (!rows || !rows.length) {
    alert('No hay datos para exportar');
    return;
  }
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows.map(row =>
      keys.map(k => `"${(row[k] ?? '').toString().replace(/"/g, '""')}"`).join(separator)
    ).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}