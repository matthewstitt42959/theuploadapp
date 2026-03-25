import React from 'react';
import { ClipboardPaste, X } from 'lucide-react';

export default function DiffPanel({ label, value, onChange, parseError }) {
    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            onChange(text);
        } catch {
            // clipboard access denied — do nothing
        }
    };

    return (
        <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">{label}</label>
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={handlePaste}
                        title="Paste from clipboard"
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-slate-500 hover:bg-slate-100"
                    >
                        <ClipboardPaste className="w-3.5 h-3.5" />
                        Paste
                    </button>
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        title="Clear"
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-slate-500 hover:bg-slate-100"
                    >
                        <X className="w-3.5 h-3.5" />
                        Clear
                    </button>
                </div>
            </div>
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder='Paste JSON here…'
                spellCheck={false}
                className={`w-full h-64 rounded-lg border px-3 py-2 text-sm font-mono resize-y
                    focus:outline-none focus:ring-2 focus:ring-sky-400
                    ${parseError ? 'border-rose-400 bg-rose-50' : 'border-slate-300 bg-white'}`}
            />
            {parseError && (
                <p className="text-xs text-rose-600 px-1">{parseError}</p>
            )}
        </div>
    );
}
