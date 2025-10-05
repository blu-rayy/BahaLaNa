/**
 * Main App Component
 * BahaLaNa - Flood Risk Assessment Application
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/shared/ErrorBoundary';
import ToastContainer from './components/shared/Toast';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
          <ToastContainer />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
