import React from 'react';
import { UserRole } from '../types';
import { SALES_FORECAST, INVENTORY, ORDERS } from '../data/mockDb';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, AlertTriangle, DollarSign } from 'lucide-react';

interface DashboardProps {
    userRole: UserRole;
}

const Dashboard: React.FC<DashboardProps> = ({ userRole: _userRole }) => {
    // KPI Calculations
    const totalRevenue = ORDERS.reduce((sum, o) => sum + o.value, 0);
    const totalInventory = INVENTORY.reduce((sum, i) => sum + i.quantity, 0);
    const backorderedItems = ORDERS.filter(o => o.status === 'Backordered').length;

    // Chart Data Preparation
    const salesData = SALES_FORECAST.map(s => ({
        name: s.itemId,
        Forecast: s.forecastQty,
        Actual: s.actualQty
    }));

    const inventoryByLocation = INVENTORY.reduce((acc, curr) => {
        const existing = acc.find(a => a.name === curr.location);
        if (existing) {
            existing.value += curr.quantity;
        } else {
            acc.push({ name: curr.location, value: curr.quantity });
        }
        return acc;
    }, [] as { name: string; value: number }[]);

    const COLORS = ['#b91c1c', '#0f172a', '#64748b', '#ef4444'];

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Enterprise Dashboard</h1>
                <p className="text-slate-500">Real-time overview of business performance</p>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Total Revenue</p>
                        <p className="text-2xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</p>
                    </div>
                </div>

                <div className="card flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Total Inventory</p>
                        <p className="text-2xl font-bold text-slate-900">{totalInventory} Units</p>
                    </div>
                </div>

                <div className="card flex items-center">
                    <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Backorders</p>
                        <p className="text-2xl font-bold text-slate-900">{backorderedItems}</p>
                    </div>
                </div>

                <div className="card flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Forecast Accuracy</p>
                        <p className="text-2xl font-bold text-slate-900">92%</p>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Chart */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Sales Forecast vs Actual</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <Legend />
                                <Bar dataKey="Forecast" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Actual" fill="#b91c1c" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Inventory Pie Chart */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Inventory Distribution</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={inventoryByLocation}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {inventoryByLocation.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="card">
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
            </div>
        </div>
    );
};

export default Dashboard;
