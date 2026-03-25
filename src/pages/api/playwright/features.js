import fs from 'fs';
import path from 'path';

const FEATURES_DIR = path.join(process.cwd(), 'src', 'lib', 'playwright-features');

function ensureDir() {
    fs.mkdirSync(FEATURES_DIR, { recursive: true });
}

export default function handler(req, res) {
    ensureDir();

    if (req.method === 'GET') {
        const { filename } = req.query;
        if (filename) {
            const filepath = path.join(FEATURES_DIR, filename);
            if (!fs.existsSync(filepath)) return res.status(404).json({ message: 'Not found' });
            return res.status(200).json({ content: fs.readFileSync(filepath, 'utf8') });
        }
        const files = fs.readdirSync(FEATURES_DIR)
            .filter(f => f.endsWith('.feature'))
            .map(f => ({ filename: f }));
        return res.status(200).json({ files });
    }

    if (req.method === 'POST') {
        const { filename, content } = req.body || {};
        if (!filename || content === undefined) {
            return res.status(400).json({ message: 'filename and content are required' });
        }
        if (!filename.endsWith('.feature')) {
            return res.status(400).json({ message: 'filename must end in .feature' });
        }
        const filepath = path.join(FEATURES_DIR, path.basename(filename));
        fs.writeFileSync(filepath, content);
        return res.status(200).json({ message: 'Saved' });
    }

    if (req.method === 'DELETE') {
        const { filename } = req.query;
        if (!filename) return res.status(400).json({ message: 'filename is required' });
        const filepath = path.join(FEATURES_DIR, path.basename(filename));
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        return res.status(200).json({ message: 'Deleted' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
