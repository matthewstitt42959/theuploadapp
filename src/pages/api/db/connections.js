import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'src', 'lib', 'db-connections.json');

function readConnections() {
    if (!fs.existsSync(DB_FILE)) return [];
    try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(raw).connections || [];
    } catch {
        return [];
    }
}

function writeConnections(connections) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ connections }, null, 2));
}

export default function handler(req, res) {
    if (req.method === 'GET') {
        return res.status(200).json({ connections: readConnections() });
    }

    if (req.method === 'POST') {
        const { name, type, host, port, database, username } = req.body || {};
        if (!name || !type || !host || !database) {
            return res.status(400).json({ message: 'name, type, host, and database are required' });
        }
        const connections = readConnections();
        const newConn = {
            id: `conn_${Date.now()}`,
            name,
            type,
            host,
            port: port ? Number(port) : defaultPort(type),
            database,
            username: username || '',
        };
        connections.push(newConn);
        writeConnections(connections);
        return res.status(201).json({ connection: newConn });
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ message: 'id is required' });
        const connections = readConnections().filter(c => c.id !== id);
        writeConnections(connections);
        return res.status(200).json({ message: 'Deleted' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
}

function defaultPort(type) {
    switch (type) {
        case 'postgresql': return 5432;
        case 'mysql':      return 3306;
        case 'mssql':      return 1433;
        default:           return null;
    }
}
