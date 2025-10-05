import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('🚀 BahaLaNa App Starting...');
console.log('📦 Environment Variables:', {
  API_URL: import.meta.env.VITE_API_URL,
  HAS_TOKEN: !!import.meta.env.VITE_EARTHDATA_TOKEN,
  TOKEN_LENGTH: import.meta.env.VITE_EARTHDATA_TOKEN?.length || 0,
});

try {
  const root = document.getElementById('root');
  if (!root) {
    console.error('❌ Root element not found!');
  } else {
    console.log('✅ Root element found, rendering app...');
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    console.log('✅ App rendered successfully!');
  }
} catch (error) {
  console.error('❌ Error rendering app:', error);
}
