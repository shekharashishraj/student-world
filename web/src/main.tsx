import React from 'react';
import ReactDOM from 'react-dom/client';
import '@babylonjs/loaders/glTF';
import App from './App';
import { logClientEvent } from './lib/logger';

window.addEventListener('error', (event) => {
  void logClientEvent('error', 'window.error', event.message, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  void logClientEvent('error', 'window.unhandledrejection', 'Unhandled promise rejection.', {
    reason: String(event.reason),
  });
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
