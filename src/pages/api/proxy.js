// src/pages/api/proxy.js
import axios from 'axios';
import https from 'https';
import http from 'http';
import fs from 'fs';
import tls from 'tls';


// --- Load your extra CA once, but APPEND to Node's default roots ---
const CUSTOM_CA_PATH = process.env.CUSTOM_CA_PATH;
const extraCA = CUSTOM_CA_PATH && fs.existsSync(CUSTOM_CA_PATH) ? fs.readFileSync(CUSTOM_CA_PATH) : null;
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({
    rejectUnauthorized: true,
    ca: extraCA ? [...tls.rootCertificates, extraCA] : tls.rootCertificates,
});

// Hop-by-hop headers we should NOT forward
const HOP = new Set([
    'host',
    'connection',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailer',
    'transfer-encoding',
    'upgrade',
    'content-length',
    'x-forwarded-host',
    'x-forwarded-proto',
    'x-forwarded-for'
]);

export default async function handler(req, res) {
    const apiUrl = req.query.url;
    if (!apiUrl) return res.status(400).json({ error: 'No URL provided' });

    try {
        // Build outbound headers (copy most inbound headers, but sanitize a few)
        const headers = {};
        for (const [k, v] of Object.entries(req.headers || {})) {
            const key = k.toLowerCase();
            if (!HOP.has(key)) headers[key] = v;
        }
        // Forward Authorization exactly as-is (don't prepend "Bearer ")
        if (req.headers.authorization) headers.authorization = req.headers.authorization;

        const method = (req.method || 'GET').toUpperCase();
        const hasBody = !(method === 'GET' || method === 'HEAD');

        const upstream = await axios({
            url: apiUrl,
            method,
            httpAgent,
            httpsAgent,
            headers,
            data: hasBody ? req.body : undefined,
            timeout: 15000,
            // Let us pass through whatever status the upstream returns
            validateStatus: () => true
        });

        // Pass through status and JSON/text (Axios already parsed JSON by default)
        // If you expect binary, switch to responseType:'arraybuffer' + res.send(Buffer.from(...))
        // Also avoid forwarding hop-by-hop response headers
        for (const [k, v] of Object.entries(upstream.headers || {})) {
            const key = k.toLowerCase();
            if (!['transfer-encoding', 'connection'].includes(key)) {
                try { res.setHeader(key, v); } catch { }
            }
        }

        return res.status(upstream.status).send(upstream.data);
} catch (err) {
  const status = err?.response?.status ?? (err?.code === 'ECONNABORTED' ? 504 : 502);
  return res.status(status).json({
    error: err?.message || 'Bad gateway',
    code: err?.code,                       // e.g. ENOTFOUND, ECONNREFUSED
    errno: err?.errno,
    host: (() => { try { return new URL(apiUrl).host; } catch { return undefined; } })(),
    protocol: (() => { try { return new URL(apiUrl).protocol; } catch { return undefined; } })(),
  });
}
}
