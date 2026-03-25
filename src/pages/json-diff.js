import React from 'react';
import Head from 'next/head';
import JsonDiffTool from '../components/json-diff/JsonDiffTool';

export default function JsonDiffPage() {
    return (
        <>
            <Head>
                <title>JSON Diff – Perry ParcelRunner</title>
            </Head>
            <JsonDiffTool />
        </>
    );
}
