import React from 'react';
import Head from 'next/head';
import PlaywrightToolLayout from '../components/playwright/PlaywrightToolLayout';

export default function PlaywrightTestingPage() {
    return (
        <>
            <Head>
                <title>Playwright Testing – Perry ParcelRunner</title>
            </Head>
            <PlaywrightToolLayout />
        </>
    );
}
