import React from 'react';
import { ORDERS, ITEMS } from '../data/mockDb';
import { ArrowLeft, FileText } from 'lucide-react';

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
                    <h1 className="text-lg font-bold tracking-tight text-white">ERP - ORDER MANAGEMENT</h1>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                    <span className="bg-green-600 px-2 py-0.5 rounded text-xs font-bold uppercase animate-pulse">System Online</span>
                </div>
            </div>



            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Header Info Section */}
                <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-lg">
                    <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-2xl font-black text-[#003366] mb-1 uppercase tracking-tight">SALES ORDER: {orderId}</h2>
                            <p className="text-slate-500 text-sm">System Date: {firstLine.date} | Entry Time: 10:42 AM</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="px-4 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-bold uppercase tracking-widest border border-blue-200">
                                {firstLine.status}
                            </span>
                        </div>
                    </div>

                    {/* Detailed Info Grid */}
                    <div className="grid grid-cols-4 gap-6 text-sm">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Customer #</label>
                                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800 font-mono font-bold">
                                    {firstLine.customerId}
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Customer Name</label>
                                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800 font-medium">
                                    {firstLine.customerName}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">PO Number</label>
                                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800 font-mono font-bold">
                                    PO-{orderId.split('-').pop()}
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Order Type</label>
                                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800 font-medium uppercase">
                                    {firstLine.orderType || 'DAILY'}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Ship Via</label>
                                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800 font-medium">
                                    {firstLine.shipVia || 'BMS LOGISTICS'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Tracking #</label>
                                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-blue-700 font-mono font-bold truncate">
                                    {firstLine.trackingNumber || 'GENERATING...'}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Location</label>
                                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800 font-medium">
                                    {firstLine.location}
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Total Value</label>
                                <div className="p-2 bg-slate-900 border border-slate-900 rounded text-white font-bold text-base">
                                    ${totalValue.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Lines Table */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
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
    );
};

export default ERPScreen;
