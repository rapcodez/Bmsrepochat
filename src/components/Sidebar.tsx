import React from 'react';
import { UserRole } from '../types';
import { LayoutDashboard, MessageSquare, HelpCircle, LogOut, User } from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    userRole: UserRole;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole, onLogout }) => {
    const menuItems = [
        { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
        { id: 'dashboard', label: 'Live Dashboard', icon: LayoutDashboard },
        { id: 'help', label: 'Help & Guide', icon: HelpCircle },
    ];

    return (
        <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen">
            <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white tracking-tight">BMS <span className="text-red-600">AI Assistant</span></h2>

            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-red-700 text-white'
                                : 'hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center mb-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-300" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-white">{userRole} User</p>
                        <p className="text-xs text-slate-500">Online</p>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
