import 'tailwindcss/tailwind.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import { Windmill } from '@windmill/react-ui';
import React, { useState, useEffect } from 'react';
import TopNavBar from '../components/TopNavBar';

export default function Mockpostman({ Component, pageProps }){
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <>
        {isMounted && (
        <Windmill>
        <div className='bg-background min-h-screen flex flex-col'>
            <TopNavBar />
            <Component {...pageProps} />
        </div>
        </Windmill>
        )}
        </>
    );
}
