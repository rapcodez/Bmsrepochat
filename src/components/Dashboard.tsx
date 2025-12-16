import React from 'react';
                </div >
            </div >

    {/* Recent Orders Table */ }
    < div className = "card" >
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Transactions</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-500 text-sm">
                                <th className="pb-3 font-medium">Order ID</th>
                                <th className="pb-3 font-medium">Customer</th>
                                <th className="pb-3 font-medium">Item</th>
                                <th className="pb-3 font-medium">Value</th>
                                <th className="pb-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {ORDERS.map((order) => (
                                <tr key={order.orderId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                    <td className="py-3 font-medium text-slate-900">{order.orderId}</td>
                                    <td className="py-3 text-slate-600">{order.customerId}</td>
                                    <td className="py-3 text-slate-600">{order.itemId}</td>
                                    <td className="py-3 text-slate-600">${order.value.toLocaleString()}</td>
                                    <td className="py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'Shipped' ? 'bg-green-100 text-green-700' :
                                                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div >
        </div >
    );
};

export default Dashboard;
