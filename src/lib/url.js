export function withParams(url, params = []) {
    if (!url) return ''; 
    const usable = (params || []).filter(p => p?.key && p?.value);
    if (!usable.length) return url;

    const qs = usable.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&');

    return url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`;
}


