import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'src', 'lib', 'db-connections.json');
const ROW_LIMIT = 500;

// Blocked keywords — any of these in a query (outside of a leading SELECT) is rejected
const BLOCKED_KEYWORDS = [
    'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
    'TRUNCATE', 'EXEC', 'EXECUTE', 'GRANT', 'REVOKE', 'MERGE',
];

function isSelectOnly(sql) {
    const normalized = sql.trim().replace(/\s+/g, ' ').toUpperCase();
    if (!/^SELECT[\s(]/.test(normalized)) return false;
    return !BLOCKED_KEYWORDS.some(kw =>
        new RegExp(`\\b${kw}\\b`).test(normalized)
    );
}

function readConnections() {
    if (!fs.existsSync(DB_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')).connections || [];
    } catch {
        return [];
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { connectionId, password, query } = req.body || {};

    if (!connectionId || !query) {
        return res.status(400).json({ message: 'connectionId and query are required' });
    }

    if (!isSelectOnly(query)) {
        return res.status(400).json({
            message: 'Only SELECT queries are allowed. Write operations are disabled.',
        });
    }

    const conn = readConnections().find(c => c.id === connectionId);
    if (!conn) {
        return res.status(404).json({ message: 'Connection not found' });
    }

    try {
        const result = await runQuery(conn, password || '', query);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

async function runQuery(conn, password, query) {
    switch (conn.type) {
        case 'postgresql': return runPostgres(conn, password, query);
        case 'mysql':      return runMysql(conn, password, query);
        case 'mssql':      return runMssql(conn, password, query);
        default:           throw new Error(`Unsupported database type: ${conn.type}`);
    }
}

async function runPostgres(conn, password, query) {
    const { Client } = await import('pg');
    const client = new Client({
        host: conn.host,
        port: conn.port || 5432,
        database: conn.database,
        user: conn.username,
        password,
        connectionTimeoutMillis: 10000,
        statement_timeout: 30000,
    });
    await client.connect();
    try {
        const result = await client.query(`${query.trim().replace(/;$/, '')} LIMIT ${ROW_LIMIT}`);
        return formatResult(result.fields.map(f => f.name), result.rows);
    } finally {
        await client.end();
    }
}

async function runMysql(conn, password, query) {
    const mysql = await import('mysql2/promise');
    const connection = await mysql.createConnection({
        host: conn.host,
        port: conn.port || 3306,
        database: conn.database,
        user: conn.username,
        password,
        connectTimeout: 10000,
    });
    try {
        const [rows, fields] = await connection.execute(
            `${query.trim().replace(/;$/, '')} LIMIT ${ROW_LIMIT}`
        );
        return formatResult(fields.map(f => f.name), rows);
    } finally {
        await connection.end();
    }
}

async function runMssql(conn, password, query) {
    const sql = await import('mssql');
    const pool = await sql.connect({
        server: conn.host,
        port: conn.port || 1433,
        database: conn.database,
        user: conn.username,
        password,
        options: { encrypt: true, trustServerCertificate: true },
        connectionTimeout: 10000,
        requestTimeout: 30000,
    });
    try {
        const result = await pool.request().query(
            `SELECT TOP ${ROW_LIMIT} * FROM (${query.trim().replace(/;$/, '')}) AS __q`
        );
        const columns = result.recordset.columns
            ? Object.keys(result.recordset.columns)
            : result.recordset.length > 0 ? Object.keys(result.recordset[0]) : [];
        return formatResult(columns, result.recordset);
    } finally {
        await pool.close();
    }
}

function formatResult(columns, rows) {
    const normalizedRows = rows.map(row =>
        columns.map(col => {
            const val = row[col];
            if (val === null || val === undefined) return null;
            if (val instanceof Date) return val.toISOString();
            if (typeof val === 'object') return JSON.stringify(val);
            return val;
        })
    );
    return { columns, rows: normalizedRows, rowCount: normalizedRows.length };
}
