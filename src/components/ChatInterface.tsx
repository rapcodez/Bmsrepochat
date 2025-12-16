import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Settings, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatWithHF, refreshHFClient } from '../services/huggingFaceService';
import { ChatMessage } from '../types';
import SettingsModal from './SettingsModal';
import clsx from 'clsx';
import { generateInventoryReport, generateSalesReport } from '../services/reportService';

const ChatInterface: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I am your BMS AI Assistant. I can help you check inventory, track orders, and analyze market data. What would you like to do?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [hasToken, setHasToken] = useState(!!(import.meta.env.VITE_HF_TOKEN || localStorage.getItem('user_hf_token')));
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const responseText = await chatWithHF(input);

            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseText,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm sorry, I encountered an error processing your request. Please try again.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSettingsSave = () => {
        refreshHFClient();
        setHasToken(!!(import.meta.env.VITE_HF_TOKEN || localStorage.getItem('user_hf_token')));
    };

    const handleDownloadReport = () => {
        generateInventoryReport();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50">
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onSave={handleSettingsSave}
            />

            {/* Header */}
            <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">AI Assistant</h2>
                    <div className="flex items-center gap-2">
                        <span className={clsx("w-2 h-2 rounded-full", hasToken ? "bg-blue-500" : "bg-green-500")}></span>
                        <span className="text-sm text-slate-500">
                            {hasToken ? "Online (Mistral)" : "Online (Mock)"}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownloadReport}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        title="Download Inventory Report"
                    >
                        <FileText size={20} />
                    </button>
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        title="AI Settings"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={clsx(
                            "flex gap-4 max-w-3xl",
                            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        <div className={clsx(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                            msg.role === 'assistant' ? "bg-primary text-white" : "bg-slate-200 text-slate-600"
                        )}>
                            {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                        </div>

                        <div className={clsx(
                            "p-4 rounded-lg shadow-sm prose prose-sm max-w-none",
                            msg.role === 'assistant'
                                ? "bg-white text-slate-800 border border-slate-100"
                                : "bg-slate-900 text-white"
                        )}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    table: ({ node, ...props }) => <table className="border-collapse table-auto w-full text-sm my-4" {...props} />,
                                    th: ({ node, ...props }) => <th className="border-b border-slate-300 font-semibold p-2 text-left bg-slate-50" {...props} />,
                                    td: ({ node, ...props }) => <td className="border-b border-slate-200 p-2" {...props} />
                                }}
                            >
                                {msg.content}
                            </ReactMarkdown>
                            <span className="text-xs opacity-50 block mt-2">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-4 max-w-3xl">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                            <Bot size={18} />
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-sm text-slate-500">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
                <div className="max-w-4xl mx-auto relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about inventory, orders, or market analysis..."
                        className="w-full pl-4 pr-12 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all shadow-sm"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary disabled:opacity-50 transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
                <p className="text-center text-xs text-slate-400 mt-2">
                    AI can make mistakes. Please verify critical inventory data.
                </p>
            </div>
        </div>
    );
};

export default ChatInterface;
