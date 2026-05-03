import * as XLSX from 'xlsx';

/**
 * Common Export to Excel Function
 * @param {Array} data - The array of objects to export
 * @param {String} fileName - Desired filename without extension
 * @param {String} sheetName - Optional sheet name
 */
export const exportToExcel = (data, fileName = 'Report', sheetName = 'Data') => {
    if (!data || data.length === 0) {
        alert("No data available to export");
        return;
    }

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Convert JSON data to worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate Excel file and trigger download
    const dateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    XLSX.writeFile(wb, `${fileName}_${dateStr}.xlsx`);
};
