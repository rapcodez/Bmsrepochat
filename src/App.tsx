import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import HelpGuide from './components/HelpGuide';
import LoginScreen from './components/LoginScreen';
import { UserRole } from './types';

function App() {
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [activeTab, setActiveTab] = useState('dashboard');

    const handleLogin = (role: UserRole) => {
        setUserRole(role);
        setActiveTab('dashboard');
    };

    const handleLogout = () => {
        setUserRole(null);
    };

    if (!userRole) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                userRole={userRole}
                onLogout={handleLogout}
            />

            <main className="flex-1 overflow-auto relative">
                <header className="bg-red-700 text-slate-50 p-4 flex justify-between items-center">
                    <h1 className="text-xl font-semibold">BMS AI Assistant</h1>
                    {userRole && (
                        <div className="flex items-center">
                            <span className="mr-2">Role:</span>
                            <span className="font-bold capitalize">{userRole}</span>
                        </div>
                    )}
                </header>
                {activeTab === 'dashboard' && <Dashboard userRole={userRole} />}
                {activeTab === 'chat' && <ChatInterface />}
                {activeTab === 'help' && <HelpGuide />}
            </main>
        </div>
    );
}

export default App;
