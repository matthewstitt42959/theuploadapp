import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, FileText } from 'lucide-react';

function handleTabKey(e, value, onChange) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        const newVal = value.substring(0, start) + '  ' + value.substring(end);
        onChange(newVal);
        requestAnimationFrame(() => {
            e.target.selectionStart = e.target.selectionEnd = start + 2;
        });
    }
}

export default function FeatureEditor() {
    const [files, setFiles]         = useState([]);
    const [selected, setSelected]   = useState(null); // filename
    const [content, setContent]     = useState('');
    const [savedContent, setSaved]  = useState('');
    const [newName, setNewName]     = useState('');
    const [creating, setCreating]   = useState(false);
    const [saving, setSaving]       = useState(false);

    useEffect(() => {
        fetch('/api/playwright/features').then(r => r.json()).then(d => {
            setFiles(d.files || []);
            if (d.files?.length && !selected) {
                selectFile(d.files[0].filename);
            }
        });
    }, []);

    const selectFile = async (filename) => {
        const res = await fetch(`/api/playwright/features?filename=${encodeURIComponent(filename)}`);
        const data = await res.json();
        setSelected(filename);
        setContent(data.content || '');
        setSaved(data.content || '');
    };

    const handleSave = async () => {
        if (!selected) return;
        setSaving(true);
        await fetch('/api/playwright/features', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: selected, content }),
        });
        setSaved(content);
        setSaving(false);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        let name = newName.trim();
        if (!name) return;
        if (!name.endsWith('.feature')) name += '.feature';
        const starter = `Feature: ${name.replace('.feature', '')}\n\n  Scenario: Example scenario\n    Given I navigate to "https://example.com"\n    Then I should see "Example"\n`;
        await fetch('/api/playwright/features', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: name, content: starter }),
        });
        setFiles(prev => [...prev.filter(f => f.filename !== name), { filename: name }]);
        setNewName('');
        setCreating(false);
        selectFile(name);
    };

    const handleDelete = async () => {
        if (!selected) return;
        if (!confirm(`Delete ${selected}?`)) return;
        await fetch(`/api/playwright/features?filename=${encodeURIComponent(selected)}`, { method: 'DELETE' });
        const remaining = files.filter(f => f.filename !== selected);
        setFiles(remaining);
        if (remaining.length) { selectFile(remaining[0].filename); }
        else { setSelected(null); setContent(''); setSaved(''); }
    };

    const dirty = content !== savedContent;

    return (
        <div className="flex gap-4 flex-1 min-h-0">
            {/* File list */}
            <div className="w-48 shrink-0 border border-slate-200 rounded-lg flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
                    <span className="text-xs font-semibold text-slate-600">Feature Files</span>
                    <button
                        type="button"
                        onClick={() => setCreating(true)}
                        className="rounded p-0.5 text-slate-400 hover:text-sky-600"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                </div>
                {creating && (
                    <form onSubmit={handleCreate} className="px-2 py-2 border-b border-slate-100">
                        <input
                            autoFocus
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="login.feature"
                            className="w-full text-xs rounded border border-slate-300 px-2 py-1 focus:outline-none focus:border-sky-400"
                        />
                        <div className="flex gap-1 mt-1">
                            <button type="submit" className="flex-1 text-xs rounded bg-sky-600 text-white py-0.5 hover:bg-sky-700">Create</button>
                            <button type="button" onClick={() => { setCreating(false); setNewName(''); }} className="flex-1 text-xs rounded bg-slate-100 text-slate-600 py-0.5">Cancel</button>
                        </div>
                    </form>
                )}
                <div className="flex-1 overflow-y-auto">
                    {files.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center px-2 py-4">No feature files yet.</p>
                    ) : files.map(f => (
                        <button
                            key={f.filename}
                            type="button"
                            onClick={() => selectFile(f.filename)}
                            className={`w-full text-left flex items-center gap-1.5 px-3 py-1.5 text-xs truncate transition-colors
                                ${selected === f.filename ? 'bg-sky-50 text-sky-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <FileText className="w-3 h-3 shrink-0" />
                            {f.filename}
                        </button>
                    ))}
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-700 flex-1 truncate">
                        {selected || 'No file selected'}
                        {dirty && <span className="ml-1 text-xs text-amber-500">• unsaved</span>}
                    </span>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!selected || !dirty || saving}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-40"
                    >
                        <Save className="w-3.5 h-3.5" />
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={!selected}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                    </button>
                </div>
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    onKeyDown={e => handleTabKey(e, content, setContent)}
                    disabled={!selected}
                    spellCheck={false}
                    className="flex-1 min-h-[400px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-400 resize-y disabled:opacity-50 disabled:bg-slate-50"
                    placeholder={'Feature: My feature\n\n  Scenario: Example\n    Given I navigate to "https://example.com"\n    Then I should see "Welcome"'}
                />
            </div>
        </div>
    );
}
