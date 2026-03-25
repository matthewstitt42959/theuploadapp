import React, { useState, useEffect } from 'react';
import ConnectionManager from './ConnectionManager';
import QueryEditor from './QueryEditor';
import ResultsTable from './ResultsTable';

export default function DBToolLayout() {
    const [connections, setConnections] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [password, setPassword] = useState('');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);   // { columns, rows, rowCount } | null
    const [queryError, setQueryError] = useState(null);
    const [loading, setLoading] = useState(false);

    const selectedConnection = connections.find(c => c.id === selectedId) || null;

    // Load connections on mount
    useEffect(() => {
        fetch('/api/db/connections')
            .then(r => r.json())
            .then(data => setConnections(data.connections || []))
            .catch(() => {});
    }, []);

    const handleSelect = (id) => {
        setSelectedId(id);
        setPassword('');
        setResults(null);
        setQueryError(null);
    };

    const handleAdd = async (formData) => {
        const res = await fetch('/api/db/connections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Failed to save connection');
        }
        const { connection } = await res.json();
        setConnections(prev => [...prev, connection]);
    };

    const handleDelete = async (id) => {
        await fetch(`/api/db/connections?id=${id}`, { method: 'DELETE' });
        setConnections(prev => prev.filter(c => c.id !== id));
        if (selectedId === id) {
            setSelectedId(null);
            setResults(null);
            setQueryError(null);
        }
    };

    const handleRun = async () => {
        if (!selectedId || !query.trim()) return;
        setLoading(true);
        setResults(null);
        setQueryError(null);
        try {
            const res = await fetch('/api/db/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ connectionId: selectedId, password, query }),
            });
            const data = await res.json();
            if (!res.ok) {
                setQueryError(data.message || 'Query failed');
            } else {
                setResults(data);
            }
        } catch (err) {
            setQueryError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-1 min-h-0">
            <ConnectionManager
                connections={connections}
                selectedId={selectedId}
                onSelect={handleSelect}
                onAdd={handleAdd}
                onDelete={handleDelete}
            />

            {/* Main panel */}
            <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold text-slate-800">Database Query</h1>
                    <span className="text-xs text-slate-400">SELECT queries only — read-only access</span>
                </div>

                <QueryEditor
                    password={password}
                    onPasswordChange={setPassword}
                    query={query}
                    onQueryChange={setQuery}
                    onRun={handleRun}
                    loading={loading}
                    selectedConnection={selectedConnection}
                />

                <div className="border-t border-slate-100 pt-4">
                    <h2 className="text-sm font-semibold text-slate-700 mb-3">Results</h2>
                    <ResultsTable
                        columns={results?.columns}
                        rows={results?.rows}
                        rowCount={results?.rowCount}
                        error={queryError}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
}
