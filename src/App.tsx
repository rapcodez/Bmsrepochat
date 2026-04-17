import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import HelpGuide from './components/HelpGuide';
import LoginScreen from './components/LoginScreen';
import ERPScreen from './components/ERPScreen';
import { UserRole, ChatMessage } from './types';

function App() {
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [initialQuery, setInitialQuery] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);

    const handleLogin = (role: UserRole) => {
        setUserRole(role);
        setActiveTab('dashboard');
        // Reset chat on new login
        setMessages([
            {
                id: '1',
                role: 'assistant',
                content: `Hello! I am your BMS AI Assistant (${role} Mode). How can I help you today?`,
                timestamp: new Date()
            }
        ]);
    };

    const handleLogout = () => {
        setUserRole(null);
        setInitialQuery('');
        setMessages([]);
        setViewingOrderId(null);
    };

    const handleQuerySelect = (query: string) => {
        setInitialQuery(query);
        setActiveTab('chat');
    };

    // Global listener for ERP links
    const handleOpenOrder = (orderId: string) => {
        setViewingOrderId(orderId);
    };

    if (!userRole) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    if (viewingOrderId) {
        return <ERPScreen orderId={viewingOrderId} onBack={() => setViewingOrderId(null)} />;
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

                {activeTab === 'dashboard' && <Dashboard userRole={userRole} onOpenOrder={handleOpenOrder} />}
                {activeTab === 'chat' && (
                    <ChatInterface
                        userRole={userRole}
                        initialQuery={initialQuery}
                        onQueryHandled={() => setInitialQuery('')}
                        messages={messages}
                        setMessages={setMessages}
                        onOpenOrder={handleOpenOrder}
                    />
                )}
                {activeTab === 'help' && <HelpGuide onQuerySelect={handleQuerySelect} userRole={userRole} />}
            </main>
        </div>
    );
}

export default App;
