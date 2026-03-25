import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

function StatusBadge({ statusCode, error }) {
    if (error) return <span className="flex items-center gap-1 text-rose-600 text-xs font-medium"><XCircle className="w-3.5 h-3.5" /> Error</span>;
    if (!statusCode) return <span className="text-slate-400 text-xs">—</span>;
    const ok = statusCode >= 200 && statusCode < 300;
    return (
        <span className={`flex items-center gap-1 text-xs font-mono font-bold ${ok ? 'text-emerald-600' : 'text-rose-600'}`}>
            {ok ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {statusCode}
        </span>
    );
}

export default function BatchResultsTable({ results }) {
    if (!results || results.length === 0) return null;

    // Collect all unique extractor names across all results
    const extractorNames = [...new Set(results.flatMap(r => Object.keys(r.extracted || {})))];

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-slate-700">Results</h2>
                <span className="text-xs text-slate-400">
                    {results.filter(r => !r.error && r.statusCode >= 200 && r.statusCode < 300).length}/{results.length} successful
                </span>
            </div>

            <div className="overflow-auto rounded-lg border border-slate-200">
                <table className="min-w-full text-xs border-collapse">
                    <thead>
                        <tr>
                            <th className="px-3 py-2 text-left font-semibold text-slate-600 bg-slate-50 border-b border-slate-200 whitespace-nowrap">#</th>
                            <th className="px-3 py-2 text-left font-semibold text-slate-600 bg-slate-50 border-b border-slate-200 whitespace-nowrap">Name / URL</th>
                            <th className="px-3 py-2 text-left font-semibold text-slate-600 bg-slate-50 border-b border-slate-200 whitespace-nowrap">Status</th>
                            <th className="px-3 py-2 text-left font-semibold text-slate-600 bg-slate-50 border-b border-slate-200 whitespace-nowrap">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />ms</span>
                            </th>
                            {extractorNames.map(name => (
                                <th key={name} className="px-3 py-2 text-left font-semibold text-sky-700 bg-sky-50 border-b border-slate-200 whitespace-nowrap">
                                    {name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {results.map((r, i) => (
                            <tr key={r.id || i} className={r.error ? 'bg-rose-50' : 'hover:bg-sky-50 transition-colors'}>
                                <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                                <td className="px-3 py-2 font-mono text-slate-700 max-w-xs">
                                    <div className="truncate" title={r.url}>{r.name || r.url}</div>
                                    {r.error && <div className="text-rose-600 text-xs mt-0.5 truncate" title={r.error}>{r.error}</div>}
                                </td>
                                <td className="px-3 py-2"><StatusBadge statusCode={r.statusCode} error={r.error} /></td>
                                <td className="px-3 py-2 text-slate-500 font-mono">{r.durationMs ?? '—'}</td>
                                {extractorNames.map(name => {
                                    const val = r.extracted?.[name];
                                    return (
                                        <td key={name} className="px-3 py-2 font-mono text-slate-700 max-w-xs">
                                            <span className="truncate block" title={val === null ? 'null' : String(val ?? '')}>
                                                {val === null ? <span className="text-slate-300 italic">null</span>
                                                    : val === undefined ? <span className="text-slate-300">—</span>
                                                    : typeof val === 'object' ? JSON.stringify(val)
                                                    : String(val)}
                                            </span>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
