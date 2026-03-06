import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    const filePath = path.join(process.cwd(), 'src', 'lib', 'collections.json');
    try {
        const fileData = fs.readFileSync(filePath, 'utf8');
        res.status(200).json(JSON.parse(fileData));
    } catch {
        // File missing on fresh install — return empty state
        res.status(200).json({ collections: [] });
    }
}
