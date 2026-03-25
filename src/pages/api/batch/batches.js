import fs from 'fs';
import path from 'path';

const FILE = path.join(process.cwd(), 'src', 'lib', 'batches.json');

function read() {
    if (!fs.existsSync(FILE)) return [];
    try { return JSON.parse(fs.readFileSync(FILE, 'utf8')).batches || []; }
    catch { return []; }
}

function write(batches) {
    fs.writeFileSync(FILE, JSON.stringify({ batches }, null, 2));
}

export default function handler(req, res) {
    if (req.method === 'GET') {
        return res.status(200).json({ batches: read() });
    }

    if (req.method === 'POST') {
        const batch = req.body;
        if (!batch?.name) return res.status(400).json({ message: 'name is required' });
        const batches = read();
        if (batch.id) {
            const idx = batches.findIndex(b => b.id === batch.id);
            if (idx >= 0) batches[idx] = batch; else batches.push(batch);
        } else {
            batch.id = `batch_${Date.now()}`;
            batches.push(batch);
        }
        write(batches);
        return res.status(200).json({ batch });
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ message: 'id is required' });
        write(read().filter(b => b.id !== id));
        return res.status(200).json({ message: 'Deleted' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
