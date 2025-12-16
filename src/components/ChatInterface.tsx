placeholder = "Ask about inventory, orders, or market analysis..."
className = "flex-1 bg-transparent border-none focus:ring-0 text-slate-900 placeholder-slate-400"
disabled = { isLoading }
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
                </div >
    <p className="text-center text-xs text-slate-400 mt-2">
        AI can make mistakes. Please verify critical inventory data.
    </p>
            </div >
        </div >
    );
};

export default ChatInterface;
