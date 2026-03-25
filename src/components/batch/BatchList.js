import React, { useState } from 'react';
import { ListChecks, Plus, X } from 'lucide-react';

export default function BatchList({ batches, selectedId, onSelect, onNew, onDelete }) {
    return (
        <aside className="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <ListChecks className="w-4 h-4 text-sky-600" />
                    Batches
                </span>
                <button
                    type="button"
                    onClick={onNew}
                    className="rounded-md p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50"
                    title="New batch"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto py-1">
                {batches.length === 0 ? (
                    <p className="px-4 py-6 text-xs text-slate-400 text-center">
                        No batches yet.<br />Create one to get started.
                    </p>
                ) : (
                    batches.map(b => (
                        <div
                            key={b.id}
                            onClick={() => onSelect(b.id)}
                            className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors
                                ${selectedId === b.id
                                    ? 'bg-sky-50 border-r-2 border-sky-500'
                                    : 'hover:bg-slate-50'}`}
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">{b.name}</p>
                                <p className="text-xs text-slate-400">{(b.requests || []).length} request{(b.requests || []).length !== 1 ? 's' : ''}</p>
                            </div>
                            <button
                                type="button"
                                onClick={e => { e.stopPropagation(); onDelete(b.id); }}
                                className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-slate-300 hover:text-rose-500"
                                title="Delete batch"
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
