import React, { useState } from 'react';
import { FolderOpen, Plus, ChevronDown, ChevronRight, X } from 'lucide-react';

const METHOD_COLORS = {
    GET:    'text-emerald-600',
    POST:   'text-amber-600',
    PUT:    'text-sky-600',
    PATCH:  'text-violet-600',
    DELETE: 'text-rose-600',
};

export default function CollectionsSidebar({
    collections,
    onSaveToCollection,
    onLoadRequest,
    onCreateCollection,
    onDeleteRequest,
    onDeleteCollection,
    isSaving,
}) {
    const [expanded, setExpanded] = useState({});
    const [creatingNew, setCreatingNew] = useState(false);
    const [newName, setNewName] = useState('');
    const [saveTarget, setSaveTarget] = useState('');
    const [saveName, setSaveName] = useState('');

    const toggleExpand = (id) =>
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        onCreateCollection(newName.trim());
        setNewName('');
        setCreatingNew(false);
    };

    const handleSave = () => {
        if (!saveTarget || !saveName.trim()) return;
        onSaveToCollection(saveTarget, saveName.trim());
        setSaveName('');
        setSaveTarget('');
    };

    return (
        <aside className="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col h-screen sticky top-0">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <FolderOpen className="w-4 h-4 text-violet-600" />
                    Collections
                </span>
                <button
                    type="button"
                    onClick={() => setCreatingNew(true)}
                    className="rounded-md p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50"
                    title="New collection"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* New collection inline form */}
            {creatingNew && (
                <form onSubmit={handleCreateSubmit} className="px-3 py-2 border-b border-slate-100">
                    <input
                        autoFocus
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        onKeyDown={e => e.key === 'Escape' && (setCreatingNew(false), setNewName(''))}
                        placeholder="Collection name…"
                        className="w-full text-sm rounded-lg border border-slate-300 px-2 py-1
                                   focus:outline-none focus:border-sky-400"
                    />
                    <div className="flex gap-1 mt-1">
                        <button
                            type="submit"
                            className="flex-1 text-xs rounded-md bg-sky-600 text-white py-1 hover:bg-sky-700"
                        >
                            Create
                        </button>
                        <button
                            type="button"
                            onClick={() => { setCreatingNew(false); setNewName(''); }}
                            className="flex-1 text-xs rounded-md bg-slate-100 text-slate-600 py-1 hover:bg-slate-200"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Collection list */}
            <div className="flex-1 overflow-y-auto py-1">
                {collections.length === 0 ? (
                    <p className="px-4 py-6 text-xs text-slate-400 text-center">
                        No collections yet.<br />Create one to save requests.
                    </p>
                ) : (
                    collections.map(col => (
                        <div key={col.id}>
                            {/* Collection header row */}
                            <div
                                className="group flex items-center gap-1 px-3 py-1.5 cursor-pointer hover:bg-violet-50 select-none"
                                onClick={() => toggleExpand(col.id)}
                            >
                                {expanded[col.id]
                                    ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                }
                                <span className="flex-1 text-sm font-medium text-violet-700 truncate">
                                    {col.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); onDeleteCollection(col.id); }}
                                    className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-slate-300 hover:text-rose-500"
                                    title="Delete collection"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Request rows */}
                            {expanded[col.id] && col.requests.map(req => (
                                <div
                                    key={req.id}
                                    className="group flex items-center gap-2 pl-8 pr-3 py-1 cursor-pointer hover:bg-sky-50"
                                    onClick={() => onLoadRequest(req)}
                                >
                                    <span className={`text-xs font-mono font-bold shrink-0 ${METHOD_COLORS[req.method] || 'text-slate-600'}`}>
                                        {req.method}
                                    </span>
                                    <span
                                        className="flex-1 text-sm text-slate-700 truncate"
                                        title={req.url}
                                    >
                                        {req.name || req.url}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={e => { e.stopPropagation(); onDeleteRequest(col.id, req.id); }}
                                        className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-slate-300 hover:text-rose-500"
                                        title="Delete request"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>

            {/* Save current request — bottom panel */}
            <div className="border-t border-slate-200 px-3 py-3 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Save current request
                </p>
                <input
                    value={saveName}
                    onChange={e => setSaveName(e.target.value)}
                    placeholder="Request name…"
                    className="w-full text-sm rounded-lg border border-slate-300 px-2 py-1
                               focus:outline-none focus:border-sky-400"
                />
                <select
                    value={saveTarget}
                    onChange={e => setSaveTarget(e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-300 px-2 py-1
                               focus:outline-none focus:border-sky-400"
                >
                    <option value="">Pick a collection…</option>
                    {collections.map(col => (
                        <option key={col.id} value={col.id}>{col.name}</option>
                    ))}
                </select>
                <button
                    type="button"
                    disabled={!saveTarget || !saveName.trim() || isSaving}
                    onClick={handleSave}
                    className="w-full rounded-lg py-1.5 text-sm font-medium text-white
                               bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving…' : 'Save to Collection'}
                </button>
            </div>
        </aside>
    );
}
