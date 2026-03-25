import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const RUNS_FILE    = path.join(process.cwd(), 'src', 'lib', 'playwright-runs.json');
const RESULTS_FILE = path.join(process.cwd(), '.pw-results', 'output.json');
const RESULTS_DIR  = path.join(process.cwd(), '.pw-results');
const PW_CONFIG    = path.join(process.cwd(), 'playwright.tool.config.js');

// In-memory store for active runs (safe for local dev tool)
const activeRuns = new Map();

function readRuns() {
    if (!fs.existsSync(RUNS_FILE)) return [];
    try { return JSON.parse(fs.readFileSync(RUNS_FILE, 'utf8')).runs || []; }
    catch { return []; }
}

function saveRun(run) {
    const runs = readRuns();
    runs.push(run);
    fs.writeFileSync(RUNS_FILE, JSON.stringify({ runs }, null, 2));
}

function spawnAsync(cmd, args, opts) {
    return new Promise((resolve) => {
        const proc = spawn(cmd, args, { shell: true, cwd: process.cwd(), env: process.env, ...opts });
        let stdout = '', stderr = '';
        proc.stdout?.on('data', d => { stdout += d.toString(); });
        proc.stderr?.on('data', d => { stderr += d.toString(); });
        proc.on('close', code => resolve({ code, stdout, stderr }));
        proc.on('error', err => resolve({ code: -1, stdout, stderr: err.message }));
    });
}

function parsePlaywrightResults(jsonData) {
    const scenarios = [];
    function traverse(suites, featureName) {
        for (const suite of suites || []) {
            const feature = featureName || suite.title;
            if (suite.suites?.length) traverse(suite.suites, feature);
            for (const spec of suite.specs || []) {
                const result = spec.tests?.[0]?.results?.[0];
                const status = result?.status || 'unknown';
                scenarios.push({
                    feature,
                    scenario: spec.title,
                    passed: status === 'passed',
                    status,
                    durationMs: result?.duration || 0,
                    steps: (result?.steps || []).map(s => ({
                        title: s.title,
                        passed: !s.error,
                        error: s.error?.message || null,
                    })),
                    error: result?.error?.message || null,
                });
            }
        }
    }
    traverse(jsonData.suites, null);
    return scenarios;
}

async function executeRun(runId) {
    const entry = activeRuns.get(runId);

    // Step 1: bddgen
    entry.log += '[bddgen] Generating test files from feature files...\n';
    const bddgenResult = await spawnAsync('npx', ['bddgen', '--config', PW_CONFIG]);
    entry.log += bddgenResult.stdout + bddgenResult.stderr;

    if (bddgenResult.code !== 0) {
        entry.status = 'error';
        entry.error = 'bddgen failed — check feature files and step definitions for unmatched steps.';
        const run = { id: runId, startedAt: entry.startedAt, finishedAt: Date.now(), status: 'error', error: entry.error, scenarios: [] };
        saveRun(run);
        return;
    }

    // Step 2: playwright test
    entry.log += '[playwright] Running tests...\n';
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
    if (fs.existsSync(RESULTS_FILE)) fs.unlinkSync(RESULTS_FILE);

    const pwResult = await spawnAsync('npx', ['playwright', 'test', '--config', PW_CONFIG]);
    entry.log += pwResult.stdout + pwResult.stderr;

    // Step 3: parse results
    let scenarios = [];
    let parseError = null;
    if (fs.existsSync(RESULTS_FILE)) {
        try {
            const jsonData = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
            scenarios = parsePlaywrightResults(jsonData);
        } catch (e) {
            parseError = `Could not parse results: ${e.message}`;
        }
    } else {
        parseError = 'No results file produced — playwright may have crashed.';
    }

    const passed = scenarios.length > 0 && scenarios.every(s => s.passed);
    entry.status = parseError ? 'error' : passed ? 'passed' : 'failed';
    entry.scenarios = scenarios;
    entry.error = parseError;

    const run = {
        id: runId,
        startedAt: entry.startedAt,
        finishedAt: Date.now(),
        status: entry.status,
        scenarioCount: scenarios.length,
        passCount: scenarios.filter(s => s.passed).length,
        scenarios,
        error: parseError || null,
    };
    saveRun(run);
}

export default async function handler(req, res) {
    // POST — start a run
    if (req.method === 'POST') {
        const runId = `run_${Date.now()}`;
        activeRuns.set(runId, {
            status: 'running',
            startedAt: Date.now(),
            log: '',
            scenarios: null,
            error: null,
        });
        // Fire and forget
        executeRun(runId).catch(err => {
            const entry = activeRuns.get(runId);
            if (entry) { entry.status = 'error'; entry.error = err.message; }
        });
        return res.status(202).json({ runId });
    }

    // GET ?runId=xxx — poll status
    if (req.method === 'GET') {
        const { runId } = req.query;
        if (!runId) return res.status(400).json({ message: 'runId is required' });
        const entry = activeRuns.get(runId);
        if (!entry) return res.status(404).json({ message: 'Run not found' });
        return res.status(200).json({
            runId,
            status: entry.status,
            startedAt: entry.startedAt,
            scenarios: entry.scenarios,
            error: entry.error,
            // Last 50 lines of log for live feedback
            log: entry.log.split('\n').slice(-50).join('\n'),
        });
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
