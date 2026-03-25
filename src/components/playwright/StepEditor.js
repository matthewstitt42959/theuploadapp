import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

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

export default function StepEditor() {
    const [content, setContent]    = useState('');
    const [saved, setSaved]        = useState('');
    const [saving, setSaving]      = useState(false);
    const [loaded, setLoaded]      = useState(false);

    useEffect(() => {
        fetch('/api/playwright/steps').then(r => r.json()).then(d => {
            setContent(d.content || '');
            setSaved(d.content || '');
            setLoaded(true);
        });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        await fetch('/api/playwright/steps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        });
        setSaved(content);
        setSaving(false);
    };

    const dirty = content !== saved;

    return (
        <div className="flex flex-col gap-3 flex-1 min-h-0">
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <h2 className="text-sm font-semibold text-slate-700">Step Definitions</h2>
                    <p className="text-xs text-slate-400">
                        Edit <code className="font-mono bg-slate-100 px-1 rounded">common.steps.js</code> — defines the Given/When/Then implementations.
                        {dirty && <span className="ml-2 text-amber-500">• unsaved changes</span>}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!dirty || saving || !loaded}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-40"
                >
                    <Save className="w-3.5 h-3.5" />
                    {saving ? 'Saving…' : 'Save'}
                </button>
            </div>
            <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={e => handleTabKey(e, content, setContent)}
                spellCheck={false}
                className="flex-1 min-h-[500px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-400 resize-y"
                placeholder="Loading step definitions..."
            />
        </div>
    );
}
