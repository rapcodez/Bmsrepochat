import React from 'react';
import { HelpCircle, MessageSquare, LayoutDashboard, ShieldCheck } from 'lucide-react';

const HelpGuide: React.FC = () => {
    return (
        <div className="p-8 animate-fade-in max-w-4xl mx-auto">
            <header className="mb-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="w-8 h-8 text-red-700" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">User Guide</h1>
                <p className="text-slate-500 mt-2">How to use the BMS Cognitive ERP Assistant</p>
            </header>

            <div className="space-y-6">
                <div className="card">
                    <div className="flex items-start">
                        <div className="bg-blue-100 p-2 rounded-lg mr-4">
                            <MessageSquare className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Using the AI Assistant</h3>
                            <p className="text-slate-600 mb-4">
                                The AI Assistant is designed to answer natural language queries about your enterprise data.
                                It works even when offline by using a local fallback engine.
                            </p>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <p className="text-sm font-medium text-slate-700 mb-2">Try asking:</p>
                                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                    <li>"Check stock for BMS0001"</li>
                                    <li>"What is the status of order ORD-24-1001?"</li>
                                    <li>"Show me the market analysis for X15 Engine"</li>
                                    <li>"Do we have enough Heavy Duty Tires in New York?"</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-start">
                        <div className="bg-purple-100 p-2 rounded-lg mr-4">
                            <LayoutDashboard className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Dashboard & Analytics</h3>
                            <p className="text-slate-600">
                                The Live Dashboard provides real-time visibility into your KPIs.
                                <br />
                                - <strong>Sales Forecast:</strong> Compares predicted vs actual sales.
                                <br />
                                - <strong>Inventory Distribution:</strong> Shows stock levels across all warehouses.
                                <br />
                                - <strong>Transactions:</strong> Logs the most recent orders and their status.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-start">
                        <div className="bg-green-100 p-2 rounded-lg mr-4">
                            <ShieldCheck className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Roles & Permissions</h3>
                            <p className="text-slate-600">
                                The application adapts based on your logged-in role:
                                <br />
                                - <strong>Admin:</strong> Full access to all data and system settings.
                                <br />
                                - <strong>Sales:</strong> Access to competitor analysis and sales forecasts.
                                <br />
                                - <strong>Customer:</strong> Restricted view (own orders and catalog only).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpGuide;
