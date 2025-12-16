import React from 'react';
import { HelpCircle, MessageSquare, LayoutDashboard, ShieldCheck, ArrowRight, Database } from 'lucide-react';
import { ITEMS } from '../data/mockDb';

interface HelpGuideProps {
    onQuerySelect: (query: string) => void;
}

const HelpGuide: React.FC<HelpGuideProps> = ({ onQuerySelect }) => {
    const sampleQueries = [
        "Check stock for BMS0001",
        "What is the status of order ORD-24-1001?",
        "Show me the market analysis for X15 Engine",
        "Compare price of BMS0001 vs Cummins",
        "Show recent orders",
        "Show sales analysis for BMS0002"
    ];

    return (
        <div className="p-8 animate-fade-in max-w-5xl mx-auto">
            <header className="mb-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="w-8 h-8 text-red-700" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">User Guide</h1>
                <p className="text-slate-500 mt-2">How to use the BMS Cognitive ERP Assistant</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Assistant Section */}
                <div className="card col-span-1 md:col-span-2">
                    <div className="flex items-start">
                        <div className="bg-blue-100 p-2 rounded-lg mr-4">
                            <MessageSquare className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Using the AI Assistant</h3>
                            <p className="text-slate-600 mb-4">
                                The AI Assistant answers natural language queries about inventory, orders, and market data.
                                Click any example below to try it out:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {sampleQueries.map((query, index) => (
                                    <button
                                        key={index}
                                        onClick={() => onQuerySelect(query)}
                                        className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg text-sm text-slate-700 hover:text-blue-700 transition-all group text-left"
                                    >
                                        <span>"{query}"</span>
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Sheet Section */}
                <div className="card col-span-1 md:col-span-2">
                    <div className="flex items-start">
                        <div className="bg-amber-100 p-2 rounded-lg mr-4">
                            <Database className="w-6 h-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Sample Data Sheet</h3>
                            <p className="text-slate-600 mb-4">
                                Use these Item IDs to test specific queries.
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-600">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-2">Item ID</th>
                                            <th className="px-4 py-2">Name</th>
                                            <th className="px-4 py-2">Category</th>
                                            <th className="px-4 py-2">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ITEMS.slice(0, 5).map(item => (
                                            <tr key={item.id} className="border-b border-slate-100">
                                                <td className="px-4 py-2 font-medium text-slate-900">{item.id}</td>
                                                <td className="px-4 py-2">{item.name}</td>
                                                <td className="px-4 py-2">{item.category}</td>
                                                <td className="px-4 py-2">${item.price}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard & Roles (Condensed) */}
                <div className="card">
                    <div className="flex items-start">
                        <div className="bg-purple-100 p-2 rounded-lg mr-4">
                            <LayoutDashboard className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Dashboard</h3>
                            <ul className="text-sm text-slate-600 space-y-2">
                                <li>• <strong>Sales Forecast:</strong> Predicted vs Actuals</li>
                                <li>• <strong>Inventory:</strong> Stock across locations</li>
                                <li>• <strong>Transactions:</strong> Recent activity log</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-start">
                        <div className="bg-green-100 p-2 rounded-lg mr-4">
                            <ShieldCheck className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Roles</h3>
                            <ul className="text-sm text-slate-600 space-y-2">
                                <li>• <strong>Admin:</strong> Full System Access</li>
                                <li>• <strong>Sales:</strong> Market & Forecast Data</li>
                                <li>• <strong>Customer:</strong> Order Tracking Only</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpGuide;
