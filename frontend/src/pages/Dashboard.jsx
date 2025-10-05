/**
 * Dashboard Page
 * Main flood risk assessment dashboard
 */
import { useState, useEffect } from 'react';
import FloodMap from '../components/Map/FloodMap';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import useFloodStore from '../stores/floodStore';
import useUIStore from '../stores/uiStore';
import { formatCoordinates } from '../utils/geoUtils';
import { formatToReadable } from '../utils/dateFormatter';
import { getRiskBgColor } from '../services/floodRiskAPI';

console.log('📄 Dashboard component loading...');

const Dashboard = () => {
  console.log('🎨 Dashboard component rendering...');
  
  const location = useFloodStore((state) => state.location);
  const dateRange = useFloodStore((state) => state.dateRange);
  const floodData = useFloodStore((state) => state.floodData);
  const loading = useFloodStore((state) => state.loading);
  const error = useFloodStore((state) => state.error);
  const setDateRange = useFloodStore((state) => state.setDateRange);
  const fetchFloodRisk = useFloodStore((state) => state.fetchFloodRisk);
  const addNotification = useUIStore((state) => state.addNotification);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  useEffect(() => {
    console.log('✅ Dashboard mounted successfully');
    console.log('📍 Location:', location);
  }, []);

  const handleAssessRisk = async () => {
    if (!startDate || !endDate) {
      addNotification({
        type: 'error',
        message: 'Please select both start and end dates',
      });
      return;
    }

    setDateRange(startDate, endDate);
    await fetchFloodRisk();
    
    if (!error) {
      addNotification({
        type: 'success',
        message: 'Flood risk assessment completed',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            🌊 BahaLaNa - Flood Risk Assessment
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            AI-powered flood prediction using NASA satellite data
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Location Card */}
            <Card title="Location">
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">Selected Coordinates:</p>
                  <p className="font-mono text-blue-600">
                    {formatCoordinates(location.latitude, location.longitude)}
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  Click on the map to select a different location
                </p>
              </div>
            </Card>

            {/* Date Range Card */}
            <Card title="Date Range">
              <div className="space-y-3">
                <Input
                  type="date"
                  label="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
                <Input
                  type="date"
                  label="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleAssessRisk}
                  loading={loading}
                  disabled={!startDate || !endDate}
                >
                  Assess Flood Risk
                </Button>
              </div>
            </Card>

            {/* Results Card */}
            {floodData && (
              <Card title="Flood Risk Assessment">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Risk Level:</p>
                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-full text-white font-semibold ${getRiskBgColor(
                        floodData.flood_risk.level
                      )}`}
                    >
                      {floodData.flood_risk.level}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Probability:</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {floodData.flood_risk.probability}%
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Confidence:</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {floodData.flood_risk.confidence}%
                    </p>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-500">
                      Analysis period: {formatToReadable(floodData.date_range.start)} to{' '}
                      {formatToReadable(floodData.date_range.end)}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {error && (
              <Card>
                <div className="flex items-start gap-3 text-red-600">
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold">Error</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Map Panel */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <LoadingSpinner size="xl" message="Assessing flood risk..." />
                </div>
              ) : (
                <FloodMap className="h-full w-full rounded-lg overflow-hidden" />
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
