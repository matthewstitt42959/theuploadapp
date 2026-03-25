import React, { useState } from 'react';
import { Plus, X, ChevronDown, ChevronRight } from 'lucide-react';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const METHOD_COLORS = {
    GET: 'text-emerald-600', POST: 'text-amber-600', PUT: 'text-sky-600',
    PATCH: 'text-violet-600', DELETE: 'text-rose-600',
};

function newRequest() {
    return { id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name: '', method: 'GET', url: '', headers: '', body: '', extractors: [] };
}

export default function RequestEditor({ requests, onChange }) {
    const [expanded, setExpanded] = useState({});

    const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

    const updateRequest = (id, patch) =>
        onChange(requests.map(r => r.id === id ? { ...r, ...patch } : r));

    const addExtractor = (reqId) => {
        const req = requests.find(r => r.id === reqId);
        if (!req) return;
        const extractors = [...(req.extractors || []), { name: '', path: '' }];
        updateRequest(reqId, { extractors });
    };

    const updateExtractor = (reqId, idx, patch) => {
        const req = requests.find(r => r.id === reqId);
        if (!req) return;
        const extractors = req.extractors.map((e, i) => i === idx ? { ...e, ...patch } : e);
        updateRequest(reqId, { extractors });
    };

    const removeExtractor = (reqId, idx) => {
        const req = requests.find(r => r.id === reqId);
        if (!req) return;
        updateRequest(reqId, { extractors: req.extractors.filter((_, i) => i !== idx) });
    };

    return (
        <div className="flex flex-col gap-2">
            {requests.map((req, ri) => (
                <div key={req.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    {/* Row header */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50">
                        <button
                            type="button"
                            onClick={() => toggle(req.id)}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            {expanded[req.id]
                                ? <ChevronDown className="w-4 h-4" />
                                : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <span className="text-xs text-slate-400 w-4 shrink-0">{ri + 1}.</span>
                        <select
                            value={req.method}
                            onChange={e => updateRequest(req.id, { method: e.target.value })}
                            className={`text-xs font-bold font-mono rounded border-0 bg-transparent focus:outline-none cursor-pointer ${METHOD_COLORS[req.method] || 'text-slate-600'}`}
                        >
                            {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <input
                            value={req.url}
                            onChange={e => updateRequest(req.id, { url: e.target.value })}
                            placeholder="https://api.example.com/endpoint"
                            className="flex-1 text-sm rounded border border-slate-200 px-2 py-0.5 focus:outline-none focus:border-sky-400 font-mono"
                        />
                        <input
                            value={req.name}
                            onChange={e => updateRequest(req.id, { name: e.target.value })}
                            placeholder="Request name"
                            className="w-32 text-xs rounded border border-slate-200 px-2 py-0.5 focus:outline-none focus:border-sky-400"
                        />
                        <button
                            type="button"
                            onClick={() => onChange(requests.filter(r => r.id !== req.id))}
                            className="rounded p-0.5 text-slate-300 hover:text-rose-500"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Expanded detail */}
                    {expanded[req.id] && (
                        <div className="px-4 py-3 space-y-3 border-t border-slate-100">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Headers (JSON)</label>
                                    <textarea
                                        value={req.headers}
                                        onChange={e => updateRequest(req.id, { headers: e.target.value })}
                                        placeholder={'{\n  "Authorization": "Bearer token"\n}'}
                                        rows={4}
                                        className="w-full text-xs font-mono rounded border border-slate-200 px-2 py-1.5 focus:outline-none focus:border-sky-400 resize-y"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Body (JSON)</label>
                                    <textarea
                                        value={req.body}
                                        onChange={e => updateRequest(req.id, { body: e.target.value })}
                                        placeholder={'{\n  "key": "value"\n}'}
                                        rows={4}
                                        className="w-full text-xs font-mono rounded border border-slate-200 px-2 py-1.5 focus:outline-none focus:border-sky-400 resize-y"
                                    />
                                </div>
                            </div>

                            {/* JSONPath Extractors */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-semibold text-slate-500">JSONPath Extractors</label>
                                    <button
                                        type="button"
                                        onClick={() => addExtractor(req.id)}
                                        className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700"
                                    >
                                        <Plus className="w-3 h-3" /> Add extractor
                                    </button>
                                </div>
                                {(req.extractors || []).length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">No extractors. Add one to pull values from the response.</p>
                                ) : (
                                    <div className="space-y-1">
                                        {req.extractors.map((ex, ei) => (
                                            <div key={ei} className="flex items-center gap-2">
                                                <input
                                                    value={ex.name}
                                                    onChange={e => updateExtractor(req.id, ei, { name: e.target.value })}
                                                    placeholder="Variable name"
                                                    className="w-32 text-xs rounded border border-slate-200 px-2 py-1 focus:outline-none focus:border-sky-400"
                                                />
                                                <span className="text-slate-400 text-xs">=</span>
                                                <input
                                                    value={ex.path}
                                                    onChange={e => updateExtractor(req.id, ei, { path: e.target.value })}
                                                    placeholder="$.data.id"
                                                    className="flex-1 text-xs font-mono rounded border border-slate-200 px-2 py-1 focus:outline-none focus:border-sky-400"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExtractor(req.id, ei)}
                                                    className="text-slate-300 hover:text-rose-500"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ))}

            <button
                type="button"
                onClick={() => onChange([...requests, newRequest()])}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-300 text-sm text-slate-500 hover:border-sky-400 hover:text-sky-600 transition-colors"
            >
                <Plus className="w-4 h-4" /> Add request
            </button>
        </div>
    );
}
