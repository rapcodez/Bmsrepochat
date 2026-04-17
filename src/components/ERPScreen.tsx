import React from 'react';
import { ORDERS, ITEMS } from '../data/mockDb';
import { Printer, Save, ArrowLeft, MoreVertical, FileText, Send, CheckCircle } from 'lucide-react';

interface ERPScreenProps {
    orderId: string;
    onBack: () => void;
}

const ERPScreen: React.FC<ERPScreenProps> = ({ orderId, onBack }) => {

    // Get all items for this order ID
    const orderLines = ORDERS.filter(o => o.orderId === orderId);
    
    if (orderLines.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-100 text-slate-500">
                <FileText className="w-16 h-16 mb-4 opacity-20" />
                <p>Order ${orderId} not found in database.</p>
                <button onClick={() => onBack()} className="mt-4 text-blue-600 hover:underline">Go Back</button>
            </div>
        );
    }

    const firstLine = orderLines[0];
    const totalValue = orderLines.reduce((sum, o) => sum + o.value, 0);

    return (
        <div className="min-h-screen bg-[#f0f2f5] font-sans">
            {/* ERP Style Header */}
            <div className="bg-[#003366] text-white p-3 flex justify-between items-center shadow-md">
                <div className="flex items-center space-x-4">
                    <button onClick={() => onBack()} className="hover:bg-blue-800 p-1 rounded transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold tracking-tight">BMS COGNITIVE ERP - ORDER MANAGEMENT</h1>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                    <span className="bg-green-600 px-2 py-0.5 rounded text-xs font-bold uppercase animate-pulse">System Online</span>
                    <span className="opacity-70 text-xs">V 4.2.1-PROD</span>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white border-b border-slate-300 p-2 flex space-x-2 shadow-sm">
                <button className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-all text-sm font-medium">
                    <Save className="w-4 h-4" /> <span>Save</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded hover:bg-slate-100 transition-all text-sm font-medium">
                    <Printer className="w-4 h-4" /> <span>Print Invoice</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded hover:bg-slate-100 transition-all text-sm font-medium">
                    <Send className="w-4 h-4" /> <span>Dispatch</span>
                </button>
                <div className="flex-1"></div>
                <button className="p-1 hover:bg-slate-100 rounded">
                    <MoreVertical className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            <div className="p-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-3 gap-6">
                    {/* Header Info */}
                    <div className="col-span-2 bg-white border border-slate-200 shadow-sm p-6 rounded-lg">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-[#003366] mb-1">SALES ORDER: {orderId}</h2>
                                <p className="text-slate-500 text-sm">Created Date: {firstLine.date} | Time: 10:42 AM</p>
                            </div>
                            <div className="text-right">
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-widest border border-yellow-200">
                                    {firstLine.status}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 text-sm">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Customer Information</label>
                                    <div className="p-3 bg-slate-50 border border-slate-100 rounded text-slate-700 font-medium">
                                        <p className="font-bold text-slate-900">{firstLine.customerName}</p>
                                        <p className="text-xs">{firstLine.customerId}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Order Type</label>
                                        <div className="p-2 bg-slate-50 border border-slate-100 rounded text-slate-700 font-medium">
                                            {firstLine.orderType || 'DAILY ORDER'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Ship Via</label>
                                        <div className="p-2 bg-slate-50 border border-slate-100 rounded text-slate-700 font-medium">
                                            {firstLine.shipVia || 'BMS LOGISTICS'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Shipping Address</label>
                                    <div className="p-3 bg-slate-50 border border-slate-100 rounded text-slate-700">
                                        <p>{firstLine.location}</p>
                                        <p className="text-xs mt-1">Industrial Logistics Hub, Gateway 4</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Tracking Number</label>
                                    <div className="p-2 bg-slate-50 border border-slate-100 rounded text-blue-600 font-mono font-bold">
                                        {firstLine.trackingNumber || 'GENERATING...'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="col-span-1 space-y-4">
                        <div className="bg-[#003366] text-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4">Financial Summary</h3>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm">Net Subtotal</span>
                                <span className="text-lg font-medium">${(totalValue * 0.95).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm">Tax (VAT 5%)</span>
                                <span className="text-lg font-medium">${(totalValue * 0.05).toFixed(2)}</span>
                            </div>
                            <div className="border-t border-blue-800 my-4 pt-4 flex justify-between items-end">
                                <span className="text-sm font-bold">TOTAL PAYABLE</span>
                                <span className="text-3xl font-black">${totalValue.toFixed(2)}</span>
                            </div>
                            <button className="w-full mt-4 bg-white text-blue-900 font-bold py-3 rounded-md hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>APPROVE ORDER</span>
                            </button>
                        </div>
                        
                        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
                            <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-widest">Audit Logs</h3>
                            <div className="space-y-3">
                                <div className="flex space-x-3 text-xs">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></div>
                                    <div>
                                        <p className="font-bold text-slate-700">Order Initiated via AI Assistant</p>
                                        <p className="text-slate-400">10:41 AM - User: admin</p>
                                    </div>
                                </div>
                                <div className="flex space-x-3 text-xs text-slate-400 italic">
                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1"></div>
                                    <p>Waiting for supervisor signature...</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Lines Table */}
                    <div className="col-span-3 bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 p-4">
                            <h3 className="text-sm font-bold text-[#003366] uppercase tracking-wider">Line Item Breakdown</h3>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                                <tr>
                                    <th className="px-6 py-3">Pos.</th>
                                    <th className="px-6 py-3">Part Number</th>
                                    <th className="px-6 py-3">Description</th>
                                    <th className="px-6 py-3 text-right">Quantity</th>
                                    <th className="px-6 py-3 text-right">Unit Price</th>
                                    <th className="px-6 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderLines.map((line, idx) => {
                                    const item = ITEMS.find(i => i.id === line.itemId);
                                    return (
                                        <tr key={idx} className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4 text-slate-400 font-mono">{idx + 1}</td>
                                            <td className="px-6 py-4 font-bold text-blue-700 underline decoration-dotted">{line.itemId}</td>
                                            <td className="px-6 py-4 text-slate-600 font-medium">{item?.name || 'GENERIC ENGINE PART'}</td>
                                            <td className="px-6 py-4 text-right font-bold">{line.quantity}</td>
                                            <td className="px-6 py-4 text-right text-slate-500">${(line.value / line.quantity).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right font-black text-slate-900">${line.value.toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ERPScreen;
