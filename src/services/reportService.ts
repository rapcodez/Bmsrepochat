import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { INVENTORY, SALES_FORECAST, ITEMS } from '../data/mockDb';

export const generateInventoryReport = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('BMS Inventory Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Data Preparation
    const tableData = INVENTORY.map(item => {
        const product = ITEMS.find(i => i.id === item.itemId);
        return [
            item.itemId,
            product?.name || 'Unknown',
            item.location,
            item.quantity,
            item.status
        ];
    });

    // Table
    autoTable(doc, {
        head: [['Item ID', 'Name', 'Location', 'Qty', 'Status']],
        body: tableData,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [185, 28, 28] } // Red-700
    });

    doc.save('BMS_Inventory_Report.pdf');
};

export const generateSalesReport = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('BMS Sales Forecast Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Data Preparation
    const tableData = SALES_FORECAST.map(forecast => {
        const product = ITEMS.find(i => i.id === forecast.itemId);
        return [
            forecast.itemId,
            product?.name || 'Unknown',
            forecast.month,
            forecast.forecastQty,
            forecast.actualQty.toFixed(0),
            `${forecast.accuracy}%`,
            forecast.trend
        ];
    });

    // Table
    autoTable(doc, {
        head: [['Item ID', 'Name', 'Month', 'Forecast', 'Actual', 'Accuracy', 'Trend']],
        body: tableData,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] } // Slate-900
    });

    doc.save('BMS_Sales_Report.pdf');
};
