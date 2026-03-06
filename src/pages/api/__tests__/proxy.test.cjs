/** @jest-environment node */
// src/pages/api/__tests__/proxy.test.cjs
jest.mock('axios');
const axios = require('axios');
const handler = require('../proxy').default || require('../proxy');

function mockRes() {
  const res = {};
  res.statusCode = 200;
  res.headers = {};
  res.status = (c) => ((res.statusCode = c), res);
  res.setHeader = (k, v) => (res.headers[k] = v);
  res.json = (obj) => ((res.body = obj), (res.finished = true), res);
  return res;
}

describe('/api/proxy', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('passes through JSON from upstream', async () => {
    axios.mockResolvedValueOnce({
      status: 200,
      data: { ok: true },
      headers: { 'content-type': 'application/json' },
    });

    const req = {
      method: 'GET',
      query: { url: 'https://example.com/ping' },
      headers: {},
      body: undefined,
    };
    const res = mockRes();

    await handler(req, res);

    expect(axios).toHaveBeenCalledTimes(1);
    // Handler uses axios(config), so assert the config-object call
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'https://example.com/ping',
      })
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('bubbles upstream status and body when response exists', async () => {
    axios.mockResolvedValueOnce({
      status: 404,
      data: { error: 'nope' },
      headers: { 'content-type': 'application/json' },
    });

    const req = {
      method: 'GET',
      query: { url: 'https://example.com/down' },
      headers: {},
      body: undefined,
    };
    const res = mockRes();

    await handler(req, res);

    expect(axios).toHaveBeenCalledTimes(1);
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'https://example.com/down',
      })
    );
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: { error: 'nope' } });
  });

  it('returns 502 when no response is received from upstream', async () => {
    // Simulate network-level failure (no response)
    axios.mockRejectedValueOnce({ request: {} });

    const req = {
      method: 'GET',
      query: { url: 'https://example.com/timeout' },
      headers: {},
      body: undefined,
    };
    const res = mockRes();

    await handler(req, res);

    expect(axios).toHaveBeenCalledTimes(1);
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'https://example.com/timeout',
      })
    );
    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({ error: 'No response received from the external API' });
  });
});
