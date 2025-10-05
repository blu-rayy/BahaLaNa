import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import '@fontsource/fira-sans/300.css'
import '@fontsource/fira-sans/400.css'
import '@fontsource/fira-sans/500.css'
import '@fontsource/fira-sans/600.css'
import '@fontsource/fira-sans/700.css'
import '@fontsource/fira-sans/800.css'
import '@fontsource/fira-sans/900.css'
import '@fontsource/overpass/100.css'
import '@fontsource/overpass/200.css'
import '@fontsource/overpass/300.css'
import '@fontsource/overpass/400.css'
import '@fontsource/overpass/500.css'
import '@fontsource/overpass/600.css'
import '@fontsource/overpass/700.css'
import '@fontsource/overpass/800.css'
import '@fontsource/overpass/900.css'
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
      <App />
    );
    console.log('✅ App rendered successfully!');
  }
} catch (error) {
  console.error('❌ Error rendering app:', error);
}
