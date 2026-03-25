import React, { useState, useEffect, useRef } from 'react';
import { FlaskConical, FileCode, BookOpen, Play, History } from 'lucide-react';
import FeatureEditor from './FeatureEditor';
import StepEditor from './StepEditor';
import RunsHistory from './RunsHistory';

const TABS = [
    { id: 'features', label: 'Feature Files', Icon: FileCode },
    { id: 'steps',    label: 'Step Definitions', Icon: BookOpen },
    { id: 'runs',     label: 'Runs', Icon: History },
];

export default function PlaywrightToolLayout() {
    const [activeTab, setActiveTab]     = useState('features');
    const [runs, setRuns]               = useState([]);
    const [currentRun, setCurrentRun]   = useState(null);  // { runId, status, scenarios, error }
    const [liveLog, setLiveLog]         = useState(null);
    const [running, setRunning]         = useState(false);
    const pollRef = useRef(null);

    useEffect(() => {
        fetchRuns();
    }, []);

    const fetchRuns = async () => {
        const res = await fetch('/api/playwright/runs');
        const data = await res.json();
        setRuns(data.runs || []);
    };

    const startPolling = (runId) => {
        pollRef.current = setInterval(async () => {
            const res = await fetch(`/api/playwright/run?runId=${runId}`);
            const data = await res.json();
            setLiveLog(data.log || '');
            setCurrentRun({ id: runId, ...data });
            if (data.status !== 'running') {
                clearInterval(pollRef.current);
                setRunning(false);
                setLiveLog(null);
                fetchRuns();
            }
        }, 2000);
    };

    const handleRun = async () => {
        setRunning(true);
        setCurrentRun(null);
        setLiveLog('Starting...');
        setActiveTab('runs');
        try {
            const res = await fetch('/api/playwright/run', { method: 'POST' });
            const { runId } = await res.json();
            startPolling(runId);
        } catch (err) {
            setLiveLog(`Failed to start run: ${err.message}`);
            setRunning(false);
        }
    };

    // Clean up poll on unmount
    useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

    return (
        <div className="flex-1 flex flex-col p-6 gap-4 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-3 flex-wrap">
                <FlaskConical className="w-5 h-5 text-violet-600 shrink-0" />
                <h1 className="text-lg font-semibold text-slate-800">Playwright Testing</h1>
                <span className="text-xs text-slate-400 flex-1">Gherkin feature files + Playwright execution</span>
                <button
                    type="button"
                    onClick={handleRun}
                    disabled={running}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                    <Play className="w-4 h-4" />
                    {running ? 'Running…' : 'Run Tests'}
                </button>
            </div>

            {/* Setup notice */}
            <div className="rounded-lg bg-sky-50 border border-sky-200 px-4 py-3 text-xs text-sky-800">
                <strong>First-time setup:</strong> Run <code className="font-mono bg-sky-100 px-1 rounded">npx playwright install chromium</code> in the project directory to install the browser.
                Then make sure Playwright browsers are available.
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200">
                {TABS.map(({ id, label, Icon }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px
                            ${activeTab === id
                                ? 'border-sky-500 text-sky-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                        {id === 'runs' && running && (
                            <span className="ml-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab panels */}
            <div className="flex-1 flex flex-col min-h-0">
                {activeTab === 'features' && <FeatureEditor />}
                {activeTab === 'steps'    && <StepEditor />}
                {activeTab === 'runs'     && (
                    <RunsHistory
                        runs={runs}
                        currentRun={currentRun?.status === 'running' || (currentRun && currentRun.status !== 'running' && !runs.find(r => r.id === currentRun?.id)) ? currentRun : null}
                        liveLog={liveLog}
                    />
                )}
            </div>
        </div>
    );
}
