import React, { useState, useEffect } from 'react';
import { X, Save, Key } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
    const [provider, setProvider] = useState('groq');
    const [groqKey, setGroqKey] = useState('');
    const [hfToken, setHfToken] = useState('');
    const [geminiKey, setGeminiKey] = useState('');
    const [endpoint, setEndpoint] = useState('');

    useEffect(() => {
        if (isOpen) {
            setProvider(localStorage.getItem('user_ai_provider') || 'groq');
            setGroqKey(localStorage.getItem('user_groq_key') || '');
            setHfToken(localStorage.getItem('user_hf_token') || '');
            setGeminiKey(localStorage.getItem('user_gemini_key') || '');
            setEndpoint(localStorage.getItem('user_hf_endpoint') || '');
        }
    }, [isOpen]);

    const handleSave = () => {
        localStorage.setItem('user_ai_provider', provider);

        if (groqKey.trim()) localStorage.setItem('user_groq_key', groqKey.trim());
        if (hfToken.trim()) localStorage.setItem('user_hf_token', hfToken.trim());
        if (geminiKey.trim()) localStorage.setItem('user_gemini_key', geminiKey.trim());
        if (endpoint.trim()) localStorage.setItem('user_hf_endpoint', endpoint.trim());

        onSave();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Key size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">AI Settings</h2>
                        <p className="text-sm text-slate-500">Choose your Intelligence Provider</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Provider Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Select AI Provider
                        </label>
                        <select
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="groq">Groq (Fastest & Smartest)</option>
                            {/* <option value="huggingface">Hugging Face (Disabled)</option> */}
                            <option value="gemini">Google Gemini (Reliable Free Tier)</option>
                            <option value="mock">Offline Mock Engine (No Internet)</option>
                        </select>
                    </div>

                    {/* Dynamic Inputs based on Provider */}
                    {provider === 'groq' && (
                        <div className="animate-fade-in space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Groq API Key
                                </label>
                                <input
                                    type="password"
                                    value={groqKey}
                                    onChange={(e) => setGroqKey(e.target.value)}
                                    placeholder="gsk_..."
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Model Selection (Sorted by Daily Limit)
                                </label>
                                <select
                                    onChange={(e) => localStorage.setItem('user_groq_model', e.target.value)}
                                    defaultValue={localStorage.getItem('user_groq_model') || "llama-3.3-70b-versatile"}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <optgroup label="High Limit / Fast (14.4k req/day)">
                                        <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant (Fastest)</option>
                                        <option value="mixtral-8x7b-32768">Mixtral 8x7B (Balanced)</option>
                                        <option value="gemma2-9b-it">Gemma 2 9B (Google)</option>
                                    </optgroup>
                                    <optgroup label="High Intelligence (1k req/day)">
                                        <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Smartest)</option>
                                        <option value="llama-3.1-70b-versatile">Llama 3.1 70B (Legacy)</option>
                                    </optgroup>
                                </select>
                                <p className="text-xs text-slate-500 mt-1">
                                    <strong>Tip:</strong> Your API Key works for <u>ALL</u> these models. If one hits the limit, switch to another!
                                </p>
                            </div>

                            <p className="text-xs text-slate-500">
                                Get a free key from <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">console.groq.com</a>.
                            </p>
                        </div>
                    )}

                    {/* Hugging Face Option Removed */}

                    {provider === 'gemini' && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Google Gemini API Key
                            </label>
                            <input
                                type="password"
                                value={geminiKey}
                                onChange={(e) => setGeminiKey(e.target.value)}
                                placeholder="AIza..."
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Get a free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">aistudio.google.com</a>.
                            </p>
                        </div>
                    )}

                    {provider === 'mock' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800 animate-fade-in">
                            <strong>Offline Mode:</strong> Uses local data only. No internet connection required. Good for testing inventory and order queries.
                        </div>
                    )}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                        <strong>Note:</strong> Keys are saved locally in your browser.
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                        <Save size={18} />
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
