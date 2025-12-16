                            </span >
                        </div >
                    </div >
                ))}

{
    isLoading && (
        <div className="flex gap-4 max-w-3xl">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                <Bot size={18} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-slate-500">Thinking...</span>
            </div>
        </div>
    )
}
<div ref={messagesEndRef} />
            </div >

    {/* Input Area */ }
    < div className = "p-4 bg-white border-t border-slate-200" >
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
            </div >
        </div >
    );
};

export default ChatInterface;
