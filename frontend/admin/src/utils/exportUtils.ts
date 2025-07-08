import * as XLSX from 'xlsx';

interface ExportData {
  [key: string]: any[];
}

export const exportToExcel = (data: ExportData, filename: string = 'analytics-export') => {
  const workbook = XLSX.utils.book_new();
  
  Object.entries(data).forEach(([sheetName, sheetData]) => {
    if (sheetData && sheetData.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }
  });
  
  XLSX.writeFile(workbook, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportToPowerBI = (data: any, filename: string = 'analytics-powerbi') => {
  const jsonData = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const shareReport = (data: any, title: string = 'Raport analityczny') => {
  const reportData = {
    title,
    data,
    generatedAt: new Date().toISOString(),
    version: '1.0'
  };
  
  const jsonData = JSON.stringify(reportData, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  if (navigator.share) {
    navigator.share({
      title,
      text: 'Raport analityczny z WorkshopBooker',
      url
    });
  } else {
    // Fallback - copy to clipboard
    navigator.clipboard.writeText(jsonData).then(() => {
      alert('Raport skopiowany do schowka!');
    });
  }
  
  URL.revokeObjectURL(url);
};

export const generateCSV = (data: any[], filename: string = 'analytics-export') => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}; 