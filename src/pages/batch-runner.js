import React from 'react';
import Head from 'next/head';
import BatchRunnerLayout from '../components/batch/BatchRunnerLayout';

export default function BatchRunnerPage() {
    return (
        <>
            <Head>
                <title>Batch Runner – Perry ParcelRunner</title>
            </Head>
            <BatchRunnerLayout />
        </>
    );
}
