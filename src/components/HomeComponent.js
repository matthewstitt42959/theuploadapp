import React, { useState, useEffect } from 'react';
import RequestBodyComponent from './Body/RequestBodyComponent'; // Component for editing request body
import TabsComponent from './TabsComponent';
import ResponsePanel from './Body/RequestPanel';
import APIRequestComponent from './APIRequestComponent';
import RecentEndpoints, { recentsStorage } from './RecentEndpointComponent';
import CollectionsSidebar from './CollectionsSidebar';
import { collectionsStorage } from '../lib/collectionsStorage';
import { Package } from "lucide-react"; // lucide-react icons

export default function HomeComponent() {
    const [queryParams, setQueryParams] = useState([]); // Initialize as an array
    const [body, setBody] = useState('');
    const [responseData, setResponseData] = useState(null); // State for API response data
    const [responseMeta, setResponseMeta] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null); // State for error messages
    const [requestBody, setRequestBody] = useState(''); // State for request body
    const [loading, setLoading] = useState(false); // State for loading indicator
    const [activeTab, setActiveTab] = useState('home');
    const [recents, setRecents] = useState([]);
    const [collections, setCollections] = useState([]);
    const [isSavingCollection, setIsSavingCollection] = useState(false);

    const handleParamChange = (params) => {
        setQueryParams(params);
    };

    // Load recents + collections on mount (cache-first for collections)
    useEffect(() => {
        setRecents(recentsStorage.load());

        const cached = collectionsStorage.load();
        if (cached !== null) setCollections(cached);

        fetch('/api/getCollections')
            .then(r => r.json())
            .then(data => {
                setCollections(data.collections || []);
                collectionsStorage.save(data.collections || []);
            })
            .catch(() => {});
    }, []);

    // util: push (method, url) to recents, deduping and capping at 5, persist
    const rememberEndpoint = (method, url) => {
        if (!url || !/^https?:\/\//i.test(url)) return;
        const item = { method: (method || 'GET').toUpperCase(), url: url.trim() };
        setRecents(prev => {
            const filtered = prev.filter(r => r.method !== item.method && r.url !== item.url);
            const next = [item, ...filtered].slice(0, 5);
            recentsStorage.save(next);
            return next;
        });
    }

    const [inputs, setInputs] = useState({
        url: '',
        method: 'GET',
        submitted: false,
        params: queryParams // Initialize params with the initial queryParams
    });

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        if (loading) return; // prevent double submits

        setErrorMessage(null); // Clear previous error messages

        const urlOk = /^https?:\/\//i.test(inputs.url || '');
        if (!urlOk) {
            setErrorMessage('URL must start with http:// or https://');
            return;
        }

        if (!inputs.url || !inputs.url.trim()) {
            setErrorMessage("Please enter a valid URL.");
            return;
        }

        if (['POST', 'PUT', 'PATCH'].includes(inputs.method) && !requestBody.trim()) {
            setErrorMessage("Request body is required for this method.");
            return;
        }

        // Build the final URL with latest params
        const finalUrl = constructURLWithParams(inputs.url, queryParams);

        setLoading(true);
        setInputs((prev) => ({
            ...prev,
            url: finalUrl,
            method: inputs.method || "GET",
            submitted: true
        }));
    };

    const handleReset = () => {
        // Clear everything back to defaults
        setQueryParams([]);
        setRequestBody('');
        setResponseData(null);
        setErrorMessage(null);
        setActiveTab('home');
        setLoading(false);
        setInputs({
            url: '',
            method: 'GET',
            submitted: false,
            params: [],
        });
    };

    // APIRequestComponent callback
    const handleAPIResponse = (data, method, error = null, meta = null) => {
        if (error) {
            setErrorMessage(error);
            setResponseData(null);
            setResponseMeta(null);
        } else {
            setResponseData(data);
            setErrorMessage(null);
            setResponseMeta(meta);
            // only remember on successful network response (status present)
            if (meta?.status) rememberEndpoint(method, inputs.url);
        }
        setLoading(false); // stop spinner once child finishes
        setInputs(prev => ({ ...prev, submitted: false })); // reset submitted flag
    };

    const handlePickRecent = (item) => {
        setInputs(prev => ({ ...prev, url: item.url, method: item.method, submitted: false }));
    };
    const handleClearRecents = () => {
        setRecents([]);
        recentsStorage.save([]);
    };

    // --- Collections handlers ---

    const persistCollections = async (updated) => {
        setCollections(updated);
        collectionsStorage.save(updated);
        try {
            await fetch('/api/saveCollections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ collections: updated }),
            });
        } catch {}
    };

    const handleCreateCollection = (name) =>
        persistCollections([...collections, { id: `col_${Date.now()}`, name, requests: [] }]);

    const handleSaveToCollection = async (collectionId, requestName) => {
        if (!inputs.url) return;
        setIsSavingCollection(true);
        const newReq = {
            id: `req_${Date.now()}`,
            name: requestName,
            method: inputs.method,
            url: inputs.url,
            params: queryParams,
            body: requestBody,
        };
        await persistCollections(collections.map(c =>
            c.id === collectionId ? { ...c, requests: [...c.requests, newReq] } : c
        ));
        setIsSavingCollection(false);
    };

    const handleLoadFromCollection = (request) => {
        setInputs(prev => ({ ...prev, url: request.url, method: request.method, submitted: false }));
        setQueryParams(request.params || []);
        setRequestBody(request.body || '');
    };

    const handleDeleteRequest = (colId, reqId) =>
        persistCollections(collections.map(c =>
            c.id === colId ? { ...c, requests: c.requests.filter(r => r.id !== reqId) } : c
        ));

    const handleDeleteCollection = (colId) =>
        persistCollections(collections.filter(c => c.id !== colId));

    const handleImportCollections = (merged) => persistCollections(merged);

    // Builds URL+params safely (respects existing ? or &)
    function constructURLWithParams(url, params) {
        if (!url) return '';
        const usable = (params || []).filter(p => p?.key && p?.value);
        if (usable.length === 0) return url;

        const qs = usable
            .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
            .join('&');

        return url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`;
    }

    return (
        <div className="flex min-h-screen">
            <CollectionsSidebar
                collections={collections}
                onSaveToCollection={handleSaveToCollection}
                onLoadRequest={handleLoadFromCollection}
                onCreateCollection={handleCreateCollection}
                onDeleteRequest={handleDeleteRequest}
                onDeleteCollection={handleDeleteCollection}
                onImport={handleImportCollections}
                isSaving={isSavingCollection}
            />

            <div className="flex-1 bg-gradient-to-b from-sky-50 to-sky-100 py-10">
                <div className="mx-auto w-full max-w-4xl px-4">
                    <div className="rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
                        <div className="px-6 py-6 border-b">
                            <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight">
                                <Package className="w-8 h-8 text-sky-600" />
                                Perry ParcelRunner
                            </h1>
                            <p className="text-slate-500 italic">
                                Delivering APIs with Postal Precision 📦
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="px-6 py-5 space-y-4">
                            {/* Tabs (Query Params / Headers) */}
                            <div className="flex flex-wrap gap-2">
                                <TabsComponent
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                    onParamChange={handleParamChange}
                                />
                            </div>

                            {/* Method + URL + Recents + Buttons */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="w-28">
                                    <select
                                        className="flex-1 border-slate-300 focus:border-purple focus:ring-purple
                                            text-purple placeholder-purple/70"
                                        value={inputs.method || 'GET'}
                                        onChange={(e) => setInputs(p => ({ ...p, method: e.target.value, submitted: false }))}
                                        disabled={loading}
                                    >
                                        {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>

                                <input
                                    className="bg-slate-100 flex-1 border-slate-300 focus:border-sky-400 focus:ring-sky-400"
                                    type="text"
                                    placeholder="https://example.com"
                                    value={inputs.url || ''}
                                    onChange={(e) => setInputs(p => ({ ...p, url: e.target.value, submitted: false }))}
                                    disabled={loading}
                                />

                                {/* Recent endpoints dropdown */}
                                <RecentEndpoints
                                    recents={recents}
                                    onPick={handlePickRecent}
                                    onClear={handleClearRecents}
                                />

                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="rounded-xl px-4 py-2 font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50"
                                >
                                    {loading ? 'Sending…' : 'Send'}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="rounded-xl px-3 py-2 font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                                >
                                    Reset
                                </button>
                            </div>

                            {/* Request body (only when needed) */}
                            {['POST', 'PUT', 'PATCH'].includes(inputs.method) && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Request Body</label>
                                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                                        <RequestBodyComponent requestData={requestBody} onBodyChange={setRequestBody} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <hr className="text-lg font-semibold text-violet-700 mb-6" />
                        <APIRequestComponent
                            onResponse={handleAPIResponse}
                            requestData={requestBody}
                            inputs={inputs}
                            setLoading={setLoading}
                        />

                        {/* Response */}
                        <div className="px-6 pb-6">
                            <ResponsePanel
                                requestData={requestBody}
                                responseData={responseData}
                                errorMessage={errorMessage}
                                meta={responseMeta}
                                onCopy={() => navigator.clipboard.writeText(
                                    typeof responseData === 'object' && responseData !== null
                                        ? JSON.stringify(responseData, null, 2)
                                        : String(responseData ?? '')
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
