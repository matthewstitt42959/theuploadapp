import React from "react";
import ReactDOM from 'react-dom';
import Head from "next/head";
import HomeComponent from "../components/HomeComponent";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


export default function HomePage() {

  return (
    <div id="home-container">

      <Head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="Chrome" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Perry ParcelRunner</title>
     
      </Head>


      <React.StrictMode>
        <HomeComponent />           {/* Render the tabbed interface */}


        <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick 
        draggable 
        pauseOnHover 
        />
      </React.StrictMode>


    </div>
  )
} 