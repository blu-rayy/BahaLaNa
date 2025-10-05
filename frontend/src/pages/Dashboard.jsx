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
    <div className="min-h-screen bg-gray-900">
      {/* Dark Header */}
      <header className="bg-gray-800/95 backdrop-blur-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🌊</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  BahaLaNa
                </h1>
                <p className="text-gray-400 text-sm">
                  AI Flood Prediction System
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-gray-700/60 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300 text-sm">Online</span>
              </div>
              <div className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-full border border-cyan-500/30">
                NASA Data
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-6">
        {/* Top Control Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Analysis Controls */}
          <div className="lg:col-span-8">
            <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-6 h-6 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-cyan-400 text-sm">📍</span>
                </div>
                <h3 className="text-white font-semibold">Analysis Configuration</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Location Display */}
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Location</p>
                  <p className="text-white font-mono text-sm">
                    {formatCoordinates(location.latitude, location.longitude)}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">Click map to change</p>
                </div>

                {/* Date Inputs */}
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
              </div>

              <div className="mt-4">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleAssessRisk}
                  loading={loading}
                  disabled={!startDate || !endDate}
                >
                  Run Analysis
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-4">
            {floodData ? (
              <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-6 h-6 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-red-400 text-sm">⚠️</span>
                  </div>
                  <h3 className="text-white font-semibold">Risk Assessment</h3>
                </div>
                
                {/* Risk Level */}
                <div className="text-center mb-4">
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-xl text-black font-bold text-sm mb-2 ${getRiskBgColor(
                      floodData.flood_risk.level
                    )}`}
                  >
                    {floodData.flood_risk.level}
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {floodData.flood_risk.score}
                  </div>
                  <div className="text-gray-400 text-sm">Risk Score</div>
                </div>

                {/* Quick Metrics */}
                {floodData.climate_summary && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                      <div className="text-blue-400 text-xs font-medium mb-1">Rainfall</div>
                      <div className="text-white font-bold">{floodData.climate_summary.avg_precipitation_mm}mm</div>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
                      <div className="text-orange-400 text-xs font-medium mb-1">Temperature</div>
                      <div className="text-white font-bold">{floodData.climate_summary.avg_temperature_c}°C</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-gray-400 text-xl">📊</span>
                  </div>
                  <p className="text-gray-400 text-sm">Run analysis to see results</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Split Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Map Panel */}
          <div className="xl:col-span-2">
            <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden h-[600px]">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <LoadingSpinner size="xl" />
                  <p className="mt-4 text-gray-300 font-medium">Processing Analysis...</p>
                  <p className="text-xs text-gray-500 mt-1">NASA Satellite Data</p>
                </div>
              ) : (
                <FloodMap className="h-full w-full" />
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Detailed Results */}
            {floodData && (
              <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-blue-400 text-sm">📊</span>
                  </div>
                  <h3 className="text-white font-semibold">Detailed Analysis</h3>
                </div>

                {/* Risk Factors */}
                {floodData.flood_risk.factors && floodData.flood_risk.factors.length > 0 && (
                  <div className="mb-6">
                    <p className="text-gray-400 text-sm mb-3">Risk Factors</p>
                    <div className="space-y-2">
                      {floodData.flood_risk.factors.map((factor, index) => (
                        <div key={index} className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                          <p className="text-yellow-400 text-sm">{factor}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Climate Details */}
                {floodData.climate_summary && (
                  <div className="space-y-3">
                    <p className="text-gray-400 text-sm mb-3">Climate Data</p>
                    <div className="bg-gray-700/50 rounded-xl p-4">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">Max Rainfall:</span>
                          <span className="text-white font-medium">{floodData.climate_summary.max_precipitation_mm}mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">Avg Humidity:</span>
                          <span className="text-white font-medium">{floodData.climate_summary.avg_humidity_percent}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Analysis Period */}
                <div className="mt-6 pt-4 border-t border-gray-700">
                  <p className="text-gray-400 text-xs mb-2">Analysis Period</p>
                  <p className="text-gray-300 text-sm">
                    {formatToReadable(floodData.date_range.start)} to{' '}
                    {formatToReadable(floodData.date_range.end)}
                  </p>
                  {floodData.data_sources && (
                    <p className="text-gray-500 text-xs mt-2">
                      {floodData.data_sources.power_data_days} days of climate data
                      {floodData.data_sources.imerg_granules_found > 0 && 
                        `, ${floodData.data_sources.imerg_granules_found} satellite images`}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-red-400 text-sm">⚠️</span>
                  </div>
                  <div>
                    <p className="text-red-400 font-semibold mb-1">Analysis Error</p>
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* System Info */}
            <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-6 h-6 bg-gray-600/20 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-sm">ℹ️</span>
                </div>
                <h3 className="text-white font-semibold">System Info</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-400">
                <p>• Click map to select location</p>
                <p>• Use historical dates only</p>
                <p>• Analysis uses NASA POWER data</p>
                <p>• Results updated in real-time</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
