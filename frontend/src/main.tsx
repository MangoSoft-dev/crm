import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'antd/dist/reset.css'; // If using antd v5. If using v4, use antd/dist/antd.css
import './styles/main.scss'; // 🌍 GLOBAL SASS ARCHITECTURE
import './app/i18n'; // Global Multiple Languages Configuration

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
