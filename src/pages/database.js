import React from 'react';
import Head from 'next/head';
import DBToolLayout from '../components/database/DBToolLayout';

export default function DatabasePage() {
    return (
        <>
            <Head>
                <title>Database – Perry ParcelRunner</title>
            </Head>
            <DBToolLayout />
        </>
    );
}
