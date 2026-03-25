import React from 'react';
import { AlertCircle, Info } from 'lucide-react';

const ROW_LIMIT = 500;

export default function ResultsTable({ columns, rows, rowCount, error, loading }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-sm text-slate-400">
                Running query…
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-start gap-2 p-4 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <pre className="whitespace-pre-wrap font-mono text-xs break-all">{error}</pre>
            </div>
        );
    }

    if (!columns) {
        return (
            <div className="flex items-center justify-center py-12 text-sm text-slate-400 italic">
                Run a query to see results here.
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <p className="text-sm text-slate-500 py-4">Query returned 0 rows.</p>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">{rowCount} row{rowCount !== 1 ? 's' : ''} returned</p>
                {rowCount >= ROW_LIMIT && (
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                        <Info className="w-3.5 h-3.5" />
                        Results capped at {ROW_LIMIT} rows
                    </span>
                )}
            </div>

            <div className="overflow-auto max-h-[55vh] rounded-lg border border-slate-200">
                <table className="min-w-full text-sm border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr>
                            {columns.map(col => (
                                <th
                                    key={col}
                                    className="px-3 py-2 text-left text-xs font-semibold text-slate-600 bg-slate-50 border-b border-slate-200 whitespace-nowrap"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((row, ri) => (
                            <tr key={ri} className="hover:bg-sky-50 transition-colors">
                                {row.map((cell, ci) => (
                                    <td
                                        key={ci}
                                        className="px-3 py-1.5 text-slate-700 font-mono text-xs whitespace-nowrap max-w-xs truncate"
                                        title={cell === null ? 'NULL' : String(cell)}
                                    >
                                        {cell === null
                                            ? <span className="text-slate-300 italic">NULL</span>
                                            : String(cell)
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
