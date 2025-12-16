import React, { useState, useEffect } from 'react';
import { X, Save, Key } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
    const [token, setToken] = useState('');

    useEffect(() => {
        if (isOpen) {
            const savedToken = localStorage.getItem('user_hf_token') || '';
            setToken(savedToken);
        }
    }, [isOpen]);

    const handleSave = () => {
        if (token.trim()) {
            localStorage.setItem('user_hf_token', token.trim());
        } else {
            localStorage.removeItem('user_hf_token');
        }
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
                        <h2 className="text-xl font-bold text-slate-900">API Settings</h2>
                        <p className="text-sm text-slate-500">Configure your AI Provider</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Hugging Face Access Token
                        </label>
                        <input
                            type="password"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="hf_..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Get a free token from <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">huggingface.co</a>.
                            Leave empty to use Mock AI.
                        </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                        <strong>Note:</strong> Your token is saved locally in your browser. It is never sent to our servers.
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
