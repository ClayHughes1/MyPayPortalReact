import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import "./assets/styles/index.css";
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';

localStorage.removeItem("token");
localStorage.removeItem("user");

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )
