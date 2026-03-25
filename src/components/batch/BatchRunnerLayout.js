import React, { useState, useEffect } from 'react';
import BatchList from './BatchList';
import RequestEditor from './RequestEditor';
import BatchResultsTable from './BatchResultsTable';
import { Play, Save } from 'lucide-react';

function newBatch() {
    return { id: null, name: 'New Batch', requests: [] };
}

export default function BatchRunnerLayout() {
    const [batches, setBatches]       = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [draft, setDraft]           = useState(null);   // currently edited batch
    const [results, setResults]       = useState(null);
    const [running, setRunning]       = useState(false);
    const [dirty, setDirty]           = useState(false);

    const selectedBatch = batches.find(b => b.id === selectedId) || null;

    useEffect(() => {
        fetch('/api/batch/batches').then(r => r.json()).then(d => setBatches(d.batches || []));
    }, []);

    const handleSelect = (id) => {
        const b = batches.find(b => b.id === id);
        if (!b) return;
        setSelectedId(id);
        setDraft({ ...b, requests: b.requests ? JSON.parse(JSON.stringify(b.requests)) : [] });
        setResults(null);
        setDirty(false);
    };

    const handleNew = () => {
        setSelectedId(null);
        setDraft(newBatch());
        setResults(null);
        setDirty(true);
    };

    const handleDelete = async (id) => {
        await fetch(`/api/batch/batches?id=${id}`, { method: 'DELETE' });
        setBatches(prev => prev.filter(b => b.id !== id));
        if (selectedId === id) { setSelectedId(null); setDraft(null); }
    };

    const handleSave = async () => {
        if (!draft) return;
        const res = await fetch('/api/batch/batches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(draft),
        });
        const { batch } = await res.json();
        setBatches(prev => {
            const idx = prev.findIndex(b => b.id === batch.id);
            if (idx >= 0) { const next = [...prev]; next[idx] = batch; return next; }
            return [...prev, batch];
        });
        setDraft(batch);
        setSelectedId(batch.id);
        setDirty(false);
    };

    const handleRun = async () => {
        if (!draft?.requests?.length) return;
        setRunning(true);
        setResults(null);

        // Parse headers/body for each request
        const requests = draft.requests.map(r => {
            let headers = {};
            let body = undefined;
            try { if (r.headers?.trim()) headers = JSON.parse(r.headers); } catch {}
            try { if (r.body?.trim()) body = JSON.parse(r.body); } catch { body = r.body; }
            return { ...r, headers, body };
        });

        try {
            const res = await fetch('/api/batch/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requests }),
            });
            const data = await res.json();
            setResults(data.results || []);
        } catch (err) {
            setResults([{ error: err.message }]);
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="flex flex-1 min-h-0">
            <BatchList
                batches={batches}
                selectedId={selectedId}
                onSelect={handleSelect}
                onNew={handleNew}
                onDelete={handleDelete}
            />

            {/* Main panel */}
            <div className="flex-1 flex flex-col p-6 gap-5 overflow-y-auto">
                {!draft ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 italic text-sm">
                        Select a batch or create a new one.
                    </div>
                ) : (
                    <>
                        {/* Batch name + actions */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <input
                                value={draft.name}
                                onChange={e => { setDraft(d => ({ ...d, name: e.target.value })); setDirty(true); }}
                                className="text-lg font-semibold text-slate-800 border-0 border-b border-transparent hover:border-slate-300 focus:border-sky-400 focus:outline-none bg-transparent flex-1 min-w-0"
                            />
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={!dirty}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                            >
                                <Save className="w-4 h-4" /> Save
                            </button>
                            <button
                                type="button"
                                onClick={handleRun}
                                disabled={running || !draft.requests?.length}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-40"
                            >
                                <Play className="w-4 h-4" />
                                {running ? 'Running…' : 'Run Batch'}
                            </button>
                        </div>

                        <p className="text-xs text-slate-400 -mt-3">
                            Each request runs sequentially. JSONPath extractors pull values from response JSON.
                        </p>

                        <RequestEditor
                            requests={draft.requests || []}
                            onChange={reqs => { setDraft(d => ({ ...d, requests: reqs })); setDirty(true); }}
                        />

                        {results && <BatchResultsTable results={results} />}
                    </>
                )}
            </div>
        </div>
    );
}
