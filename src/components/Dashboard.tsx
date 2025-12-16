import React from 'react';
import { UserRole } from '../types';
import { SALES_FORECAST, INVENTORY, ORDERS, MARKET_TRENDS, ITEMS } from '../data/mockDb';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Package, AlertTriangle, DollarSign, Users, Activity } from 'lucide-react';

interface DashboardProps {
    userRole: UserRole;
}

const Dashboard: React.FC<DashboardProps> = ({ userRole }) => {
    // --- Data Filtering based on Role ---
    const filteredOrders = userRole === 'customer'
        ? ORDERS.filter(o => o.customerId === 'CUST-101') // Mock logged-in customer
        : ORDERS;

    const showInventory = userRole === 'admin' || userRole === 'sales';
    const showMarketAnalysis = userRole === 'admin' || userRole === 'sales';
    const showFinancials = userRole === 'admin';

    // --- KPI Calculations ---
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.value, 0);
    const totalInventory = INVENTORY.reduce((sum, i) => sum + i.quantity, 0);
    const backorderedItems = filteredOrders.filter(o => o.status === 'Backordered').length;

    // --- Chart Data Preparation ---

    // 1. Sales Forecast vs Actual (Admin/Sales)
    const salesData = SALES_FORECAST.slice(0, 12).map(s => ({
        name: s.month,
        Forecast: s.forecastQty,
        Actual: s.actualQty
    }));

    // 2. Inventory Distribution (Admin Only)
    const inventoryByLocation = INVENTORY.reduce((acc, curr) => {
        const existing = acc.find(a => a.name === curr.location);
        if (existing) {
            existing.value += curr.quantity;
        } else {
            acc.push({ name: curr.location, value: curr.quantity });
        }
        return acc;
    }, [] as { name: string; value: number }[]);

    // 3. Market Trends (Price Comparison) - For Sales/Admin
    // Take one item (e.g., BMS0001) and show price trend vs competitors over last 6 months
    const trendItem = ITEMS[0];
    const trendData = MARKET_TRENDS
        .filter(t => t.itemId === trendItem.id)
        .slice(-6)
        .map(t => ({
            month: t.month,
            BMS: t.bmsPrice,
            Cummins: t.competitorPrices['Cummins'],
            Cat: t.competitorPrices['Caterpillar'] || 0
        }));

    const COLORS = ['#b91c1c', '#0f172a', '#64748b', '#ef4444', '#f59e0b', '#10b981'];

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        {userRole === 'customer' ? 'My Orders' : 'Enterprise Dashboard'}
                    </h1>
                    <p className="text-slate-500">
                        {userRole === 'customer'
                            ? 'Track your recent purchases and status'
                            : 'Real-time overview of business performance'}
                    </p>
                </div>
                <div className="text-sm text-slate-400">
                    View as: <span className="font-semibold capitalize text-slate-700">{userRole}</span>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {showFinancials && (
                    <div className="card flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Revenue</p>
                            <p className="text-2xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</p>
                        </div>
                    </div>
                )}

                {showInventory && (
                    <div className="card flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Inventory</p>
                            <p className="text-2xl font-bold text-slate-900">{totalInventory.toLocaleString()} Units</p>
                        </div>
                    </div>
                )}

                <div className="card flex items-center">
                    <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">{userRole === 'customer' ? 'My Backorders' : 'Active Backorders'}</p>
                        <p className="text-2xl font-bold text-slate-900">{backorderedItems}</p>
                    </div>
                </div>

                {showMarketAnalysis && (
                    <div className="card flex items-center">
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Market Share</p>
                            <p className="text-2xl font-bold text-slate-900">18.5% <span className="text-xs text-green-600 font-normal">↑ 2.1%</span></p>
                        </div>
                    </div>
                )}
            </div>

            {/* Charts Row */}
            {userRole !== 'customer' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Sales Chart */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Sales Forecast (2025)</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                    <YAxis stroke="#64748b" fontSize={12} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend />
                                    <Bar dataKey="Forecast" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Actual" fill="#b91c1c" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Market Trend Chart (New) */}
                    {showMarketAnalysis && (
                        <div className="card">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Price Trends vs Competitors ({trendItem.name})</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                        <YAxis stroke="#64748b" domain={['auto', 'auto']} fontSize={12} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="BMS" stroke="#b91c1c" strokeWidth={3} dot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="Cummins" stroke="#0f172a" strokeWidth={2} />
                                        <Line type="monotone" dataKey="Cat" stroke="#f59e0b" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Inventory Pie Chart (Admin Only) */}
                    {userRole === 'admin' && (
                        <div className="card lg:col-span-2">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Inventory Distribution by Location</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={inventoryByLocation}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            paddingAngle={2}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {inventoryByLocation.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Recent Orders Table */}
            <div className="card">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    {userRole === 'customer' ? 'My Recent Orders' : 'Recent Transactions'}
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-500 text-sm">
                                <th className="pb-3 font-medium">Order ID</th>
                                <th className="pb-3 font-medium">Date</th>
                                {userRole !== 'customer' && <th className="pb-3 font-medium">Customer</th>}
                                <th className="pb-3 font-medium">Item</th>
                                <th className="pb-3 font-medium">Value</th>
                                <th className="pb-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {filteredOrders.slice(0, 10).map((order) => (
                                <tr key={order.orderId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                    <td className="py-3 font-medium text-slate-900">{order.orderId}</td>
                                    <td className="py-3 text-slate-600">{order.date}</td>
                                    {userRole !== 'customer' && <td className="py-3 text-slate-600">{order.customerName}</td>}
                                    <td className="py-3 text-slate-600">{order.itemId}</td>
                                    <td className="py-3 text-slate-600">${order.value.toLocaleString()}</td>
                                    <td className="py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'Shipped' || order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    order.status === 'Backordered' ? 'bg-red-100 text-red-700' :
                                                        'bg-slate-100 text-slate-700'
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
