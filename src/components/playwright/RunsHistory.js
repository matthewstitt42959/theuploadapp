import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronRight, Clock } from 'lucide-react';

function StatusIcon({ status }) {
    if (status === 'passed')  return <CheckCircle  className="w-4 h-4 text-emerald-500 shrink-0" />;
    if (status === 'failed')  return <XCircle      className="w-4 h-4 text-rose-500 shrink-0" />;
    if (status === 'running') return <Clock        className="w-4 h-4 text-amber-500 shrink-0 animate-spin" />;
    return                           <AlertCircle  className="w-4 h-4 text-slate-400 shrink-0" />;
}

function StatusBadge({ status }) {
    const styles = {
        passed:  'bg-emerald-50 text-emerald-700',
        failed:  'bg-rose-50 text-rose-700',
        error:   'bg-rose-50 text-rose-700',
        running: 'bg-amber-50 text-amber-700',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
            {status}
        </span>
    );
}

function ScenarioRow({ scenario }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-slate-100 rounded-lg overflow-hidden mb-1">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 text-left"
            >
                {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                <StatusIcon status={scenario.passed ? 'passed' : 'failed'} />
                <span className="flex-1 text-slate-700 truncate">{scenario.scenario}</span>
                <span className="text-xs text-slate-400 shrink-0">{scenario.feature}</span>
                <span className="text-xs text-slate-400 font-mono shrink-0">{scenario.durationMs}ms</span>
            </button>
            {open && (
                <div className="px-4 py-2 border-t border-slate-100 space-y-1 bg-slate-50">
                    {scenario.error && (
                        <p className="text-xs text-rose-600 font-mono mb-2 whitespace-pre-wrap">{scenario.error}</p>
                    )}
                    {(scenario.steps || []).map((step, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                            {step.passed
                                ? <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                                : <XCircle className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />}
                            <span className={`font-mono ${step.passed ? 'text-slate-600' : 'text-rose-700'}`}>{step.title}</span>
                            {step.error && <span className="text-rose-500 ml-1 truncate" title={step.error}>— {step.error}</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function RunsHistory({ runs, currentRun, liveLog }) {
    const [expandedRun, setExpandedRun] = useState(null);

    const allRuns = currentRun
        ? [currentRun, ...runs.filter(r => r.id !== currentRun?.id)]
        : runs;

    if (allRuns.length === 0 && !liveLog) {
        return (
            <p className="text-sm text-slate-400 italic text-center py-12">
                No runs yet. Click "Run Tests" to execute your feature files.
            </p>
        );
    }

    return (
        <div className="space-y-3">
            {/* Live log while running */}
            {liveLog && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs font-semibold text-amber-700 mb-2">Running tests…</p>
                    <pre className="text-xs font-mono text-amber-800 whitespace-pre-wrap max-h-48 overflow-y-auto">{liveLog}</pre>
                </div>
            )}

            {allRuns.map(run => {
                const isOpen = expandedRun === run.id;
                const passCount = (run.scenarios || []).filter(s => s.passed).length;
                const total = (run.scenarios || []).length;
                return (
                    <div key={run.id} className="border border-slate-200 rounded-lg overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setExpandedRun(isOpen ? null : run.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left"
                        >
                            {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                            <StatusIcon status={run.status} />
                            <StatusBadge status={run.status} />
                            <span className="flex-1 text-sm text-slate-600">
                                {new Date(run.startedAt).toLocaleString()}
                            </span>
                            {total > 0 && (
                                <span className="text-sm font-mono text-slate-500 shrink-0">
                                    {passCount}/{total} passed
                                </span>
                            )}
                        </button>
                        {isOpen && (
                            <div className="px-4 py-3 border-t border-slate-100">
                                {run.error && (
                                    <div className="mb-3 p-2 rounded bg-rose-50 border border-rose-200">
                                        <p className="text-xs text-rose-700 font-mono whitespace-pre-wrap">{run.error}</p>
                                    </div>
                                )}
                                {(run.scenarios || []).length === 0 && !run.error && (
                                    <p className="text-xs text-slate-400 italic">No scenarios found.</p>
                                )}
                                {(run.scenarios || []).map((s, i) => (
                                    <ScenarioRow key={i} scenario={s} />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
