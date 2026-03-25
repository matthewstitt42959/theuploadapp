import fs from 'fs';
import path from 'path';

const STEPS_DIR  = path.join(process.cwd(), 'src', 'lib', 'playwright-steps');
const STEPS_FILE = path.join(STEPS_DIR, 'common.steps.js');

function ensureDir() {
    fs.mkdirSync(STEPS_DIR, { recursive: true });
}

export default function handler(req, res) {
    ensureDir();

    if (req.method === 'GET') {
        if (!fs.existsSync(STEPS_FILE)) return res.status(200).json({ content: '' });
        return res.status(200).json({ content: fs.readFileSync(STEPS_FILE, 'utf8') });
    }

    if (req.method === 'POST') {
        const { content } = req.body || {};
        if (content === undefined) return res.status(400).json({ message: 'content is required' });
        fs.writeFileSync(STEPS_FILE, content);
        return res.status(200).json({ message: 'Saved' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
