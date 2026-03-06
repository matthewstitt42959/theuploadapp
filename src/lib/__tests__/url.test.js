// src/lib/__tests__/url.test.js
import { withParams } from '../url.js';

describe('withParams', () => {
  it('appends encoded params', () => {
    const url = 'https://example.com/path';
    const params = [
      { key: 'q', value: 'a b' },
      { key: 'page', value: '1' },
    ];
    expect(withParams(url, params))
      .toBe('https://example.com/path?q=a%20b&page=1');
  });

  it('returns original url if no params', () => {
    expect(withParams('https://example.com')).toBe('https://example.com');
    expect(withParams('https://example.com', [])).toBe('https://example.com');
    expect(withParams('https://example.com', null)).toBe('https://example.com');
  });

  it('ignores params with missing key or value', () => {
    const url = 'https://example.com';
    const params = [
      { key: 'q', value: 'test' },
      { key: '', value: 'x' },
      { key: 'page' },
    ];
    expect(withParams(url, params))
      .toBe('https://example.com?q=test');
  });
});
