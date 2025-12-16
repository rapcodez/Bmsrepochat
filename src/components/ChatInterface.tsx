import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatWithAI } from '../services/aiService';
import { ChatMessage } from '../types';

const ChatInterface: React.FC = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: 'Hello. I am the BMS Cognitive ERP Assistant. I can help you with inventory checks, order status, and market analysis. How can I assist you today?',
            timestamp: new Date()
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatWithAI(userMsg.content);

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.text,
                timestamp: new Date(),
                isOffline: false
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("Chat Error", error);
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I encountered a critical error. Please try again.",
                timestamp: new Date(),
                isOffline: true
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Chat Header */}
            <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <Bot className="w-6 h-6 text-red-700" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-slate-900">AI Assistant</h2>
                        <p className="text-xs text-green-600 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                            Online (Mock)
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                            {/* Avatar */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${msg.role === 'user' ? 'bg-slate-200 ml-3' : 'bg-red-700 mr-3'
                                }`}>
                                {msg.role === 'user' ? <User className="w-5 h-5 text-slate-600" /> : <Bot className="w-5 h-5 text-white" />}
                            </div>

                            {/* Bubble */}
                            <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user'
                                    ? 'bg-slate-900 text-white rounded-tr-none'
                                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                                }`}>

                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>

                                {msg.attachment && (
                                    <div className="mt-3 flex items-center p-3 bg-slate-50 rounded border border-slate-200 cursor-pointer hover:bg-slate-100">
                                        <FileText className="w-5 h-5 text-red-600 mr-2" />
                                        <div className="text-sm">
                                            <p className="font-medium text-slate-900">{msg.attachment.title}</p>
                                            <p className="text-xs text-slate-500">PDF Document</p>
                                        </div>
                                    </div>
                                )}

                                <p className={`text-[10px] mt-2 text-right ${msg.role === 'user' ? 'text-slate-400' : 'text-slate-400'}`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex flex-row items-center ml-11">
                            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center space-x-2">
                                <Loader2 className="w-4 h-4 text-red-700 animate-spin" />
                                <span className="text-sm text-slate-500">Processing request...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus-within:ring-2 focus-within:ring-red-100 focus-within:border-red-400 transition-all">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Ask about inventory, orders, or market analysis..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 placeholder-slate-400"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className={`ml-2 p-2 rounded-full transition-colors ${input.trim()
                                ? 'bg-red-700 text-white hover:bg-red-800'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        <Send className="w-5 h-5" />
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
