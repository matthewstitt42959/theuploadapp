import fs from 'fs';
import path from 'path';

const RUNS_FILE = path.join(process.cwd(), 'src', 'lib', 'playwright-runs.json');

function readRuns() {
    if (!fs.existsSync(RUNS_FILE)) return [];
    try { return JSON.parse(fs.readFileSync(RUNS_FILE, 'utf8')).runs || []; }
    catch { return []; }
}

export default function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
    const runs = readRuns();
    // Return most recent first
    return res.status(200).json({ runs: [...runs].reverse() });
}
