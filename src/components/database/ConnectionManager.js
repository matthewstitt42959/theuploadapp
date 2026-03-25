import React, { useState } from 'react';
import { Database, Plus, X, ChevronDown } from 'lucide-react';

const TYPE_COLORS = {
    postgresql: 'text-emerald-600 bg-emerald-50',
    mysql:      'text-amber-600 bg-amber-50',
    mssql:      'text-sky-600 bg-sky-50',
};

const DEFAULT_PORTS = { postgresql: 5432, mysql: 3306, mssql: 1433 };

const BLANK_FORM = { name: '', type: 'postgresql', host: '', port: '', database: '', username: '' };

export default function ConnectionManager({ connections, selectedId, onSelect, onAdd, onDelete }) {
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState(BLANK_FORM);
    const [error, setError] = useState('');

    const handleTypeChange = (type) => {
        setForm(f => ({ ...f, type, port: String(DEFAULT_PORTS[type] || '') }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.name.trim() || !form.host.trim() || !form.database.trim()) {
            setError('Name, host, and database are required.');
            return;
        }
        try {
            await onAdd({ ...form, port: form.port ? Number(form.port) : null });
            setForm(BLANK_FORM);
            setAdding(false);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <aside className="w-72 shrink-0 border-r border-slate-200 bg-white flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Database className="w-4 h-4 text-sky-600" />
                    Connections
                </span>
                <button
                    type="button"
                    onClick={() => { setAdding(true); setError(''); }}
                    className="rounded-md p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50"
                    title="Add connection"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Add form */}
            {adding && (
                <form onSubmit={handleSubmit} className="px-3 py-3 border-b border-slate-100 space-y-2 bg-slate-50">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">New Connection</p>

                    <input
                        autoFocus
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Display name…"
                        className="w-full text-sm rounded-lg border border-slate-300 px-2 py-1 focus:outline-none focus:border-sky-400"
                    />

                    <div className="relative">
                        <select
                            value={form.type}
                            onChange={e => handleTypeChange(e.target.value)}
                            className="w-full text-sm rounded-lg border border-slate-300 px-2 py-1 appearance-none focus:outline-none focus:border-sky-400"
                        >
                            <option value="postgresql">PostgreSQL</option>
                            <option value="mysql">MySQL / MariaDB</option>
                            <option value="mssql">SQL Server (MSSQL)</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    <input
                        value={form.host}
                        onChange={e => setForm(f => ({ ...f, host: e.target.value }))}
                        placeholder="Host / IP…"
                        className="w-full text-sm rounded-lg border border-slate-300 px-2 py-1 focus:outline-none focus:border-sky-400"
                    />

                    <div className="flex gap-2">
                        <input
                            value={form.port}
                            onChange={e => setForm(f => ({ ...f, port: e.target.value }))}
                            placeholder="Port"
                            type="number"
                            className="w-24 text-sm rounded-lg border border-slate-300 px-2 py-1 focus:outline-none focus:border-sky-400"
                        />
                        <input
                            value={form.database}
                            onChange={e => setForm(f => ({ ...f, database: e.target.value }))}
                            placeholder="Database name…"
                            className="flex-1 text-sm rounded-lg border border-slate-300 px-2 py-1 focus:outline-none focus:border-sky-400"
                        />
                    </div>

                    <input
                        value={form.username}
                        onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                        placeholder="Username (optional)…"
                        className="w-full text-sm rounded-lg border border-slate-300 px-2 py-1 focus:outline-none focus:border-sky-400"
                    />

                    {error && <p className="text-xs text-rose-600">{error}</p>}

                    <div className="flex gap-1">
                        <button
                            type="submit"
                            className="flex-1 text-xs rounded-md bg-sky-600 text-white py-1 hover:bg-sky-700"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => { setAdding(false); setError(''); setForm(BLANK_FORM); }}
                            className="flex-1 text-xs rounded-md bg-slate-100 text-slate-600 py-1 hover:bg-slate-200"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Connection list */}
            <div className="flex-1 overflow-y-auto py-1">
                {connections.length === 0 ? (
                    <p className="px-4 py-6 text-xs text-slate-400 text-center">
                        No connections yet.<br />Add one to get started.
                    </p>
                ) : (
                    connections.map(c => (
                        <div
                            key={c.id}
                            onClick={() => onSelect(c.id)}
                            className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors
                                ${selectedId === c.id
                                    ? 'bg-sky-50 border-r-2 border-sky-500'
                                    : 'hover:bg-slate-50'}`}
                        >
                            <span className={`text-xs font-mono font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${TYPE_COLORS[c.type] || 'text-slate-600 bg-slate-100'}`}>
                                {c.type === 'postgresql' ? 'PG' : c.type === 'mysql' ? 'MY' : 'MS'}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">{c.name}</p>
                                <p className="text-xs text-slate-400 truncate">{c.host}/{c.database}</p>
                            </div>
                            <button
                                type="button"
                                onClick={e => { e.stopPropagation(); onDelete(c.id); }}
                                className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-slate-300 hover:text-rose-500"
                                title="Delete connection"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
}
