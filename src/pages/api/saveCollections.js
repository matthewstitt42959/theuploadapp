import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    const { collections } = req.body;
    if (!Array.isArray(collections)) {
        return res.status(400).json({ message: 'collections must be an array' });
    }
    const filePath = path.join(process.cwd(), 'src', 'lib', 'collections.json');
    try {
        fs.writeFileSync(filePath, JSON.stringify({ collections }, null, 2));
        res.status(200).json({ message: 'Collections saved successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to write collections', error: err.message });
    }
}
