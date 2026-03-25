import React from 'react';
import { Play, AlertCircle } from 'lucide-react';

export default function QueryEditor({ password, onPasswordChange, query, onQueryChange, onRun, loading, selectedConnection }) {
    const queryTrimmed = query.trim().toUpperCase();
    const isSelectQuery = queryTrimmed.startsWith('SELECT') || queryTrimmed === '';
    const canRun = !!selectedConnection && query.trim() && isSelectQuery && !loading;

    return (
        <div className="flex flex-col gap-3">
            {/* Connection info */}
            {selectedConnection ? (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{selectedConnection.name}</span>
                    <span>·</span>
                    <span>{selectedConnection.host}:{selectedConnection.port}/{selectedConnection.database}</span>
                </div>
            ) : (
                <p className="text-xs text-slate-400 italic">Select a connection from the left panel.</p>
            )}

            {/* Password */}
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Password
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={e => onPasswordChange(e.target.value)}
                    placeholder="Connection password…"
                    autoComplete="current-password"
                    disabled={!selectedConnection}
                    className="w-full max-w-sm text-sm rounded-lg border border-slate-300 px-3 py-1.5
                               focus:outline-none focus:border-sky-400 disabled:opacity-50 disabled:bg-slate-50"
                />
                <p className="text-xs text-slate-400">Password is never stored — session only.</p>
            </div>

            {/* Query editor */}
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    SQL Query
                </label>
                <textarea
                    value={query}
                    onChange={e => onQueryChange(e.target.value)}
                    placeholder="SELECT * FROM table_name WHERE ..."
                    spellCheck={false}
                    disabled={!selectedConnection}
                    className={`w-full h-40 rounded-lg border px-3 py-2 text-sm font-mono resize-y
                        focus:outline-none focus:ring-2 focus:ring-sky-400
                        disabled:opacity-50 disabled:bg-slate-50
                        ${!isSelectQuery && query.trim() ? 'border-rose-400 bg-rose-50' : 'border-slate-300 bg-white'}`}
                />
                {!isSelectQuery && query.trim() && (
                    <p className="flex items-center gap-1 text-xs text-rose-600">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Only SELECT queries are allowed.
                    </p>
                )}
            </div>

            {/* Run button */}
            <div>
                <button
                    type="button"
                    disabled={!canRun}
                    onClick={onRun}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium
                               hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <Play className="w-4 h-4" />
                    {loading ? 'Running…' : 'Run Query'}
                </button>
            </div>
        </div>
    );
}
