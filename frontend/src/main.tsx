import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { useThemeStore } from './store/themeStore';

// Ensure the zustand store's in-memory state matches whatever the inline
// script in index.html already applied to <html> on page load — without
// this, toggling the theme once would work, but a stale in-memory 'light'
// state (before persist rehydrates) could briefly overwrite the correct
// class on the next render.
useThemeStore.getState().setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);