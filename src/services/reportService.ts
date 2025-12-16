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

export const generateExecutiveReport = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    // Title
    doc.setFontSize(22);
    doc.setTextColor(185, 28, 28); // Red
    doc.text('BMS Executive Summary Report', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${date}`, 14, 28);

    let finalY = 35;

    // Section 1: Inventory Overview
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('1. Inventory Overview', 14, finalY);

    const inventoryData = INVENTORY.slice(0, 15).map(item => {
        const product = ITEMS.find(i => i.id === item.itemId);
        return [item.itemId, product?.name || 'Unknown', item.location, item.quantity, item.status];
    });

    autoTable(doc, {
        head: [['Item ID', 'Name', 'Location', 'Qty', 'Status']],
        body: inventoryData,
        startY: finalY + 5,
        theme: 'grid',
        headStyles: { fillColor: [41, 37, 36] }, // Stone-800
        styles: { fontSize: 8 }
    });

    // @ts-ignore
    finalY = doc.lastAutoTable.finalY + 15;

    // Section 2: Sales Forecast
    doc.text('2. Sales Forecast & Market Trends', 14, finalY);

    const salesData = SALES_FORECAST.slice(0, 10).map(f => [
        f.itemId, f.month, f.forecastQty, f.actualQty.toFixed(0), f.trend
    ]);

    autoTable(doc, {
        head: [['Item', 'Month', 'Forecast', 'Actual', 'Trend']],
        body: salesData,
        startY: finalY + 5,
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74] }, // Green-600
        styles: { fontSize: 8 }
    });

    // @ts-ignore
    finalY = doc.lastAutoTable.finalY + 15;

    // Section 3: Recent Orders (Simulated "My Orders")
    doc.text('3. Recent Orders Status', 14, finalY);

    // Mocking "My Orders" from the general orders list for demo
    const ordersData = [
        ['ORD-2024-001', 'BMS0001', '2024-12-15', 'Processing', 'High Priority'],
        ['ORD-2024-002', 'BMS0003', '2024-12-14', 'Shipped', 'Standard'],
        ['ORD-2024-003', 'BMS0002', '2024-12-12', 'Delivered', 'Standard'],
        ['ORD-2024-005', 'BMS0004', '2024-12-10', 'Pending', 'Urgent']
    ];

    autoTable(doc, {
        head: [['Order ID', 'Item', 'Date', 'Status', 'Priority']],
        body: ordersData,
        startY: finalY + 5,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] }, // Blue-600
        styles: { fontSize: 8 }
    });

    doc.save(`BMS_Executive_Report_${date.replace(/\//g, '-')}.pdf`);
};
