import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Settings, FileText, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatWithAI } from '../services/aiService';
import { ChatMessage } from '../types';
import SettingsModal from './SettingsModal';
import clsx from 'clsx';
import { generateDynamicReport } from '../services/reportService';

interface ChatInterfaceProps {
    initialQuery?: string;
    onQueryHandled?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialQuery, onQueryHandled }) => {
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

    useEffect(() => {
        if (initialQuery) {
            setInput(initialQuery);
            if (onQueryHandled) onQueryHandled();
        }
    }, [initialQuery, onQueryHandled]);

    const handleClearChat = () => {
        setMessages([
            {
                id: Date.now().toString(),
                role: 'assistant',
                content: 'Chat history cleared. How can I help you now?',
                timestamp: new Date()
            }
        ]);
    };

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
            const responseText = await chatWithAI(input);

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
        setHasToken(!!(import.meta.env.VITE_HF_TOKEN || localStorage.getItem('user_hf_token')));
    };

    const handleDownloadReport = (currentMsgId: string) => {
        // Find the current message index
        const currentIndex = messages.findIndex(m => m.id === currentMsgId);
        if (currentIndex === -1) return;

        let targetContent = messages[currentIndex].content;
        let foundTable = false;
        let title = "BMS AI Analysis Report";

        // 1. Search backwards for a message with a table (starting from current)
        for (let i = currentIndex; i >= 0; i--) {
            const msg = messages[i];
            if (msg.role === 'assistant' && msg.content.includes('|')) {
                const lines = msg.content.split('\n');
                const hasTable = lines.some(line => line.trim().startsWith('|') && line.includes('|'));
                if (hasTable) {
                    targetContent = msg.content;
                    foundTable = true;

                    // Try to extract title from this message
                    if (lines[0].startsWith('#') || lines[0].startsWith('**')) {
                        title = lines[0].replace(/[#*]/g, '').trim();
                    }
                    break;
                }
            }
        }

        // 2. If no title found in AI message, look for the preceding User message
        if (title === "BMS AI Analysis Report" && currentIndex > 0) {
            const prevUserMsg = messages.slice(0, currentIndex + 1).reverse().find(m => m.role === 'user');
            if (prevUserMsg) {
                title = `Report: ${prevUserMsg.content.length > 50 ? prevUserMsg.content.substring(0, 50) + '...' : prevUserMsg.content}`;
            }
        }

        const cleanContent = targetContent.replace('<<GENERATE_REPORT>>', '').trim();
        const lines = cleanContent.split('\n');

        // 3. Separate Summary and Table
        let summaryLines: string[] = [];
        let tableLines: string[] = [];
        let isTableSection = false;

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('|')) {
                isTableSection = true;
                tableLines.push(trimmed);
            } else if (!isTableSection && trimmed !== '' && !trimmed.startsWith('#')) {
                summaryLines.push(trimmed);
            }
        }

        const summary = summaryLines.join('\n').trim();

        // 4. Parse Table Data
        let headers: string[] = [];
        let rows: string[][] = [];

        if (tableLines.length >= 2) {
            headers = tableLines[0].split('|').filter(c => c.trim()).map(c => c.trim());
            rows = tableLines.slice(2).map(line =>
                line.split('|').filter(c => c.trim() !== '').map(c => c.trim())
            );
        }

        generateDynamicReport(title, summary, rows, headers);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50">
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onSave={handleSettingsSave}
            />

            {/* Header */}
            <div className="bg-white border-b border-slate-200 p-2 flex items-center justify-end shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-4">
                        <span className={clsx("w-2 h-2 rounded-full", hasToken ? "bg-blue-500" : "bg-green-500")}></span>
                        <span className="text-sm text-slate-500">
                            {hasToken ? `Online (${localStorage.getItem('user_groq_model') || 'Groq'})` : "Online (Mock)"}
                        </span>
                    </div>
                    <button
                        onClick={handleClearChat}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Clear Chat History"
                    >
                        <Trash2 size={20} />
                    </button>
                    {/* Report button moved to chat */}
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
                                {msg.content.replace('<<GENERATE_REPORT>>', '')}
                            </ReactMarkdown>

                            {msg.content.includes('<<GENERATE_REPORT>>') && (
                                <button
                                    onClick={() => handleDownloadReport(msg.id)}
                                    className="mt-4 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                                >
                                    <FileText size={16} />
                                    Download Report (PDF)
                                </button>
                            )}

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
