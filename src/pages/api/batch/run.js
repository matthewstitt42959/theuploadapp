import axios from 'axios';
import https from 'https';
import http from 'http';
import fs from 'fs';
import tls from 'tls';

// Same CA cert pattern as proxy.js
const CUSTOM_CA_PATH = process.env.CUSTOM_CA_PATH;
const extraCA = CUSTOM_CA_PATH && fs.existsSync(CUSTOM_CA_PATH)
    ? fs.readFileSync(CUSTOM_CA_PATH) : null;
const httpAgent  = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({
    rejectUnauthorized: true,
    ca: extraCA ? [...tls.rootCertificates, extraCA] : tls.rootCertificates,
});

// Lazy ESM import — jsonpath-plus is ESM-only
let _JSONPath;
async function getJSONPath() {
    if (!_JSONPath) {
        const mod = await import('jsonpath-plus');
        _JSONPath = mod.JSONPath;
    }
    return _JSONPath;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { requests } = req.body || {};
    if (!Array.isArray(requests) || requests.length === 0) {
        return res.status(400).json({ message: 'requests array is required' });
    }

    const JSONPath = await getJSONPath();
    const results = [];

    for (const req_item of requests) {
        const { id, name, method, url, headers, body, extractors } = req_item;
        if (!url) { results.push({ id, name, error: 'URL is required' }); continue; }

        const startMs = Date.now();
        try {
            const response = await axios({
                method: method || 'GET',
                url,
                headers: headers || {},
                data: body || undefined,
                httpAgent,
                httpsAgent,
                validateStatus: () => true,
                timeout: 30000,
            });

            const durationMs = Date.now() - startMs;
            const extracted = {};

            if (Array.isArray(extractors)) {
                for (const { name: eName, path: jpath } of extractors) {
                    if (!eName || !jpath) continue;
                    try {
                        const values = JSONPath({ path: jpath, json: response.data });
                        extracted[eName] = values.length === 1 ? values[0]
                            : values.length === 0 ? null : values;
                    } catch {
                        extracted[eName] = '(jsonpath error)';
                    }
                }
            }

            results.push({
                id,
                name: name || url,
                method: method || 'GET',
                url,
                statusCode: response.status,
                durationMs,
                extracted,
                error: null,
            });
        } catch (err) {
            results.push({
                id,
                name: name || url,
                method: method || 'GET',
                url,
                statusCode: null,
                durationMs: Date.now() - startMs,
                extracted: {},
                error: err.message,
            });
        }
    }

    return res.status(200).json({ results });
}
