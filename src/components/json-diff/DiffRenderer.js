import React, { useState } from 'react';

const TYPE_STYLES = {
    added:     { row: 'bg-emerald-50', indicator: '+', indicatorClass: 'text-emerald-600 font-bold w-4 shrink-0', path: 'text-emerald-700', val: 'text-emerald-800' },
    removed:   { row: 'bg-rose-50',    indicator: '-', indicatorClass: 'text-rose-600 font-bold w-4 shrink-0',    path: 'text-rose-700',    val: 'text-rose-800' },
    changed:   { row: 'bg-amber-50',   indicator: '~', indicatorClass: 'text-amber-600 font-bold w-4 shrink-0',   path: 'text-amber-700',   val: 'text-amber-900' },
    unchanged: { row: 'bg-white',      indicator: ' ', indicatorClass: 'text-slate-300 w-4 shrink-0',             path: 'text-slate-400',   val: 'text-slate-400' },
};

function formatVal(val) {
    if (val === undefined) return '';
    if (val === null) return 'null';
    if (typeof val === 'string') return `"${val}"`;
    return String(val);
}

export default function DiffRenderer({ entries }) {
    const [showUnchanged, setShowUnchanged] = useState(false);

    if (!entries || entries.length === 0) {
        return (
            <p className="text-sm text-emerald-600 font-medium py-4 text-center">
                No differences found — the two JSON structures are identical.
            </p>
        );
    }

    const diffCount = entries.filter(e => e.type !== 'unchanged').length;
    const visible = showUnchanged ? entries : entries.filter(e => e.type !== 'unchanged');

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                    {diffCount} difference{diffCount !== 1 ? 's' : ''} found
                    {!showUnchanged && entries.length > diffCount && ` · ${entries.length - diffCount} unchanged hidden`}
                </p>
                <button
                    type="button"
                    onClick={() => setShowUnchanged(v => !v)}
                    className="text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2"
                >
                    {showUnchanged ? 'Hide unchanged' : 'Show unchanged'}
                </button>
            </div>

            <div className="rounded-lg border border-slate-200 overflow-hidden font-mono text-xs">
                {visible.map((entry, i) => {
                    const s = TYPE_STYLES[entry.type] || TYPE_STYLES.unchanged;
                    return (
                        <div key={i} className={`flex items-start gap-2 px-3 py-1.5 border-b border-slate-100 last:border-0 ${s.row}`}>
                            <span className={s.indicatorClass}>{s.indicator}</span>
                            <span className={`${s.path} shrink-0 max-w-[40%] truncate`} title={entry.path}>
                                {entry.path}
                            </span>
                            {entry.type === 'changed' ? (
                                <span className="flex items-center gap-2 flex-wrap">
                                    <span className="text-rose-600 line-through">{formatVal(entry.leftVal)}</span>
                                    <span className="text-slate-400">→</span>
                                    <span className="text-emerald-700">{formatVal(entry.rightVal)}</span>
                                </span>
                            ) : (
                                <span className={s.val}>
                                    {entry.type === 'removed' ? formatVal(entry.leftVal) : formatVal(entry.rightVal)}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
