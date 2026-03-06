// NotesTab.jsx
import React from 'react';

const STORAGE_KEY = 'perry-parcelrunner:notes';

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function NotesTab() {
  const [text, setText] = React.useState('');
  const [status, setStatus] = React.useState(''); // '', 'Saving…', 'Saved'
  const saveTimer = React.useRef(null);
  const lastSavedRef = React.useRef(null);

  // Load once on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved != null) {
        setText(saved);
        // remember last saved value to avoid unnecessary writes
        lastSavedRef.current = saved;
      }
    } catch { }
  }, []);

  // Debounced autosave (skip initial mount; only write if changed)
  React.useEffect(() => {
    // skip intital empty mount flicker
    if (text === '' && localStorage.getItem(STORAGE_KEY) === null) return;

    if (text === lastSavedRef.current) return; // skip if unchanged

    setStatus('Saving…');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, text);
        lastSavedRef.current = text;
        setStatus('Saved');
        setTimeout(() => setStatus(''), 1200);
      } catch {
        setStatus('');
      }
    }, 400);

    return () => clearTimeout(saveTimer.current);
  }, [text]);

  const clearNotes = () => {
    setText('');
    try { localStorage.removeItem(STORAGE_KEY); } catch { }
  };

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-slate-500">{status || ''}</div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 ring-1 ring-slate-200"
            onClick={() => downloadText('notes.txt', text)}
          >
            Download
          </button>
          <button
            type="button"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 ring-1 ring-rose-200"
            onClick={clearNotes}
          >
            Clear
          </button>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Quick notes about this request, auth tokens to remember, sample payloads…"
        rows={8}
        className="w-full rounded-xl border border-slate-300 focus:border-sky-400 focus:ring-sky-400 p-3 font-mono text-sm"
      />
      <div className="mt-1 text-xs text-slate-400">{text.length} chars</div>
    </div>
  );
}
