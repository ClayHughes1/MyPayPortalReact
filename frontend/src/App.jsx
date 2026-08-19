import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import MainLayout from "./layouts/MainLayout";
import './App.css'

import AppRoutes from "./routes/AppRoutes";

function App() {
    return (
        <MainLayout>
            <AppRoutes />
        </MainLayout>
    );

}

export default App
