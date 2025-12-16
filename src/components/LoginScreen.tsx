import React from 'react';
import { UserRole } from '../types';
import { ShieldCheck, Users, ShoppingBag } from 'lucide-react';

interface LoginScreenProps {
    onLogin: (role: UserRole) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-slate-200 animate-fade-in">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-red-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <ShieldCheck className="text-white w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">BMS Cognitive ERP</h1>
                    <p className="text-slate-500 mt-2">Select your role to continue</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => onLogin('admin')}
                        className="w-full flex items-center p-4 border border-slate-200 rounded-lg hover:border-red-700 hover:bg-red-50 transition-all group"
                    >
                        <div className="bg-slate-100 p-2 rounded-full group-hover:bg-red-200 transition-colors">
                            <ShieldCheck className="w-6 h-6 text-slate-600 group-hover:text-red-700" />
                        </div>
                        <div className="ml-4 text-left">
                            <h3 className="font-semibold text-slate-900">System Admin</h3>
                            <p className="text-sm text-slate-500">Full access to all modules</p>
                        </div>
                    </button>

                    <button
                        onClick={() => onLogin('sales')}
                        className="w-full flex items-center p-4 border border-slate-200 rounded-lg hover:border-red-700 hover:bg-red-50 transition-all group"
                    >
                        <div className="bg-slate-100 p-2 rounded-full group-hover:bg-red-200 transition-colors">
                            <Users className="w-6 h-6 text-slate-600 group-hover:text-red-700" />
                        </div>
                        <div className="ml-4 text-left">
                            <h3 className="font-semibold text-slate-900">Sales Representative</h3>
                            <p className="text-sm text-slate-500">View forecasts & competitor data</p>
                        </div>
                    </button>

                    <button
                        onClick={() => onLogin('customer')}
                        className="w-full flex items-center p-4 border border-slate-200 rounded-lg hover:border-red-700 hover:bg-red-50 transition-all group"
                    >
                        <div className="bg-slate-100 p-2 rounded-full group-hover:bg-red-200 transition-colors">
                            <ShoppingBag className="w-6 h-6 text-slate-600 group-hover:text-red-700" />
                        </div>
                        <div className="ml-4 text-left">
                            <h3 className="font-semibold text-slate-900">Customer Portal</h3>
                            <p className="text-sm text-slate-500">Track orders & browse catalog</p>
                        </div>
                    </button>
                </div>

                <div className="mt-8 text-center text-xs text-slate-400">
                    <p>Powered by Google Gemini 2.5 Flash</p>
                    <p>BMS Cognitive ERP Assistant v1.0.0</p>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
