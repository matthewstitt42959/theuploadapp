import React, { useState, useCallback } from 'react';
import { GitCompare } from 'lucide-react';
import DiffPanel from './DiffPanel';
import DiffRenderer from './DiffRenderer';
import { computeJsonDiff } from '../../lib/jsonDiff';

function tryParse(text) {
    if (!text.trim()) return { value: null, error: null };
    try {
        return { value: JSON.parse(text), error: null };
    } catch (e) {
        return { value: null, error: e.message };
    }
}

export default function JsonDiffTool() {
    const [leftText, setLeftText]   = useState('');
    const [rightText, setRightText] = useState('');
    const [diffEntries, setDiffEntries] = useState(null);

    const leftParsed  = tryParse(leftText);
    const rightParsed = tryParse(rightText);

    const canCompare = leftText.trim() && rightText.trim()
        && !leftParsed.error && !rightParsed.error;

    const handleCompare = useCallback(() => {
        if (!canCompare) return;
        const entries = computeJsonDiff(leftParsed.value, rightParsed.value);
        setDiffEntries(entries);
    }, [canCompare, leftParsed.value, rightParsed.value]);

    const handleLeftChange = (v) => { setLeftText(v); setDiffEntries(null); };
    const handleRightChange = (v) => { setRightText(v); setDiffEntries(null); };

    return (
        <div className="flex-1 flex flex-col p-6 gap-6 min-h-0">
            {/* Header */}
            <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-violet-600" />
                <h1 className="text-lg font-semibold text-slate-800">JSON Diff Compare</h1>
                <span className="text-xs text-slate-400">Paste two JSON values to compare their structure</span>
            </div>

            {/* Input panels */}
            <div className="flex gap-4 flex-wrap">
                <DiffPanel
                    label="Left (baseline)"
                    value={leftText}
                    onChange={handleLeftChange}
                    parseError={leftText.trim() ? leftParsed.error : null}
                />
                <DiffPanel
                    label="Right (compare)"
                    value={rightText}
                    onChange={handleRightChange}
                    parseError={rightText.trim() ? rightParsed.error : null}
                />
            </div>

            {/* Compare button */}
            <div>
                <button
                    type="button"
                    disabled={!canCompare}
                    onClick={handleCompare}
                    className="px-5 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium
                               hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    Compare
                </button>
            </div>

            {/* Results */}
            {diffEntries !== null && (
                <div className="flex flex-col gap-2">
                    <h2 className="text-sm font-semibold text-slate-700">Diff Results</h2>
                    <DiffRenderer entries={diffEntries} />
                </div>
            )}
        </div>
    );
}
