import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import MainLayout from "./layouts/MainLayout";
import './App.css'
import useIdleLogout from "./hooks/useIdleLogout";

import AppRoutes from "./routes/AppRoutes";

function App() {
    // 15 minutes of inactivity
    useIdleLogout(15 * 60 * 1000);


    return (
        <MainLayout>
            <AppRoutes />
        </MainLayout>
    );

}

export default App
