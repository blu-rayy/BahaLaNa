/**
 * Dashboard Page
 * Main flood risk assessment dashboard with single date selection
 */
import { useState, useEffect, useRef } from 'react';
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
  
  const [selectedDate, setSelectedDate] = useState('2024-12-31');
  const [selectedMarker, setSelectedMarker] = useState(null);
  const floodMapRef = useRef(null);
  
  useEffect(() => {
    console.log('✅ Dashboard mounted successfully');
    console.log('📍 Location:', location);
  }, []);

  const handleAssessRisk = async () => {
    if (!location.latitude || !location.longitude) {
      addNotification({
        type: 'error',
        message: 'Please select a location on the map',
      });
      return;
    }

    if (!selectedDate) {
      addNotification({
        type: 'error',
        message: 'Please select an analysis date',
      });
      return;
    }

    // Calculate 5 years before the selected date
    const endDate = new Date(selectedDate);
    const startDate = new Date(endDate);
    startDate.setFullYear(endDate.getFullYear() - 5);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    console.log(`📅 Setting date range: ${startDateStr} to ${endDateStr}`);
    setDateRange(startDateStr, endDateStr);
    
    // Generate risk markers on the map
    if (floodMapRef.current) {
      console.log('🎯 Calling generateRiskMarkers from Dashboard...');
      floodMapRef.current.generateRiskMarkers();
    }
    
    await fetchFloodRisk();
    
    if (!error) {
      addNotification({
        type: 'success',
        message: `Flood risk assessment completed (${startDateStr} to ${endDateStr})`,
      });
    }
  };

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#003366' }}>
      {/* Orbital Background */}
      <div className="orbital-background">
        {/* Orbital rings */}
        <div className="orbit orbit-1">
          <div className="satellite satellite-1"></div>
        </div>
        <div className="orbit orbit-2">
          <div className="satellite satellite-2"></div>
        </div>
        <div className="orbit orbit-3">
          <div className="satellite satellite-3"></div>
        </div>
        <div className="orbit orbit-4">
          <div className="satellite satellite-4"></div>
        </div>
        
        {/* Elliptical orbits */}
        <div className="orbit-ellipse orbit-ellipse-1"></div>
        
        {/* Constellation lines */}
        <div className="constellation-line" style={{
          top: '20%', 
          left: '15%', 
          width: '200px', 
          transform: 'rotate(25deg)',
          animationDelay: '0s'
        }}></div>
        <div className="constellation-line" style={{
          bottom: '30%', 
          left: '25%', 
          width: '160px', 
          transform: 'rotate(45deg)',
          animationDelay: '2s'
        }}></div>
        
        {/* Space dots */}
        <div className="space-dots">
          <div className="space-dot" style={{top: '15%', left: '25%', animationDelay: '0s'}}></div>
          <div className="space-dot" style={{top: '25%', left: '75%', animationDelay: '0.5s'}}></div>
          <div className="space-dot" style={{top: '45%', left: '15%', animationDelay: '1s'}}></div>
          <div className="space-dot" style={{top: '65%', left: '85%', animationDelay: '1.5s'}}></div>
          <div className="space-dot" style={{top: '75%', left: '35%', animationDelay: '2s'}}></div>
          <div className="space-dot" style={{top: '35%', left: '50%', animationDelay: '2.5s'}}></div>
          <div className="space-dot" style={{top: '55%', left: '65%', animationDelay: '3s'}}></div>
          <div className="space-dot" style={{top: '85%', left: '20%', animationDelay: '0.8s'}}></div>
          <div className="space-dot" style={{top: '10%', left: '80%', animationDelay: '1.3s'}}></div>
          <div className="space-dot" style={{top: '90%', left: '70%', animationDelay: '1.8s'}}></div>
          <div className="space-dot" style={{top: '5%', left: '45%', animationDelay: '2.2s'}}></div>
          <div className="space-dot" style={{top: '30%', left: '10%', animationDelay: '1.7s'}}></div>
          <div className="space-dot" style={{top: '50%', left: '90%', animationDelay: '0.3s'}}></div>
          <div className="space-dot" style={{top: '70%', left: '60%', animationDelay: '2.8s'}}></div>
          <div className="space-dot" style={{top: '95%', left: '40%', animationDelay: '1.1s'}}></div>
          <div className="space-dot" style={{top: '20%', left: '5%', animationDelay: '2.4s'}}></div>
          <div className="space-dot" style={{top: '60%', left: '30%', animationDelay: '0.9s'}}></div>
          <div className="space-dot" style={{top: '40%', left: '95%', animationDelay: '1.6s'}}></div>
        </div>
      </div>

      {/* NASA Header */}
      <header className="backdrop-blur-lg border-b border-white/20 relative z-10" style={{ background: 'linear-gradient(135deg, rgba(0, 30, 60, 0.95) 0%, rgba(0, 51, 102, 0.9) 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">🌊</span>
              </div>
              <div>
                <h1 className="text-2xl font-nasa-heading font-black text-white">
                  BahaLaNa
                </h1>
                <p className="text-white/80 text-sm font-nasa-body">
                  NASA-Powered Flood Prediction
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-white/20 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-nasa-body">Online</span>
              </div>
              <div className="px-3 py-1 bg-white/20 text-white text-xs font-nasa-body font-bold rounded-full border border-white/30">
                NASA IMERG + POWER
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-6 relative z-10">
        {/* Top Control Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Analysis Controls */}
          <div className="lg:col-span-8">
            <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6" style={{ background: 'linear-gradient(135deg, rgba(0, 30, 60, 0.95) 0%, rgba(0, 51, 102, 0.8) 100%)' }}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📍</span>
                </div>
                <h3 className="text-white font-nasa-heading font-bold">Analysis Configuration</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Location Display */}
                <div className="bg-white/10 rounded-xl p-4 border border-white/30">
                  <p className="text-white/80 text-xs font-nasa-body uppercase tracking-wide mb-1">Location</p>
                  <p className="text-white font-nasa-body font-bold text-sm">
                    {formatCoordinates(location.latitude, location.longitude)}
                  </p>
                  <p className="text-white/70 text-xs font-nasa-body mt-1">Click map to change</p>
                </div>

                {/* Date Selection */}
                <div>
                  <Input
                    type="date"
                    label="Analysis Date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    � Analyzes 5 years of data up to this date
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleAssessRisk}
                  loading={loading}
                  disabled={!selectedDate}
                >
                  Run Analysis
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-4">
            {(floodData || selectedMarker) ? (
              <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6" style={{ background: 'linear-gradient(135deg, rgba(0, 30, 60, 0.95) 0%, rgba(0, 51, 102, 0.8) 100%)' }}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-6 h-6 bg-red-500/30 rounded-lg flex items-center justify-center">
                    <span className="text-red-400 text-sm">⚠️</span>
                  </div>
                  <h3 className="text-white font-nasa-heading font-bold">Risk Assessment</h3>
                  {selectedMarker && (
                    <span className="ml-auto text-cyan-400 text-xs">📍 Marker Data</span>
                  )}
                </div>
                
                {/* Risk Level */}
                <div className="text-center mb-4">
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-xl text-white font-bold text-sm mb-2 ${getRiskBgColor(
                      selectedMarker ? selectedMarker.level : floodData.flood_risk.level
                    )}`}
                  >
                    {selectedMarker ? selectedMarker.level : floodData.flood_risk.level}
                  </div>
                  <div className="text-3xl font-nasa-heading font-black text-white mb-1">
                    {selectedMarker ? Math.round(selectedMarker.score) : floodData.flood_risk.score}
                  </div>
                  <div className="text-white/80 text-sm font-nasa-body">Risk Score</div>
                  {selectedMarker?.isMain && (
                    <div className="mt-2 px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-semibold rounded-full inline-block">
                      📍 Selected Location
                    </div>
                  )}
                </div>

                {/* Quick Metrics */}
                {(selectedMarker || floodData?.climate_summary) && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-blue-500/20 border border-white/30 rounded-xl p-3">
                      <div className="text-blue-300 text-xs font-nasa-body font-bold mb-1">Rainfall</div>
                      <div className="text-white font-nasa-body font-bold">
                        {selectedMarker 
                          ? `${selectedMarker.data.precipitation?.toFixed(2) || 'N/A'}mm`
                          : `${floodData.climate_summary.avg_precipitation_mm}mm`
                        }
                      </div>
                    </div>
                    <div className="bg-yellow-500/20 border border-white/30 rounded-xl p-3">
                      <div className="text-yellow-300 text-xs font-nasa-body font-bold mb-1">Temperature</div>
                      <div className="text-white font-nasa-body font-bold">
                        {selectedMarker 
                          ? `${selectedMarker.data.temperature?.toFixed(2) || 'N/A'}°C`
                          : `${floodData.climate_summary.avg_temperature_c}°C`
                        }
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6" style={{ background: 'linear-gradient(135deg, rgba(0, 30, 60, 0.95) 0%, rgba(0, 51, 102, 0.8) 100%)' }}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <p className="text-white/80 text-sm font-nasa-body">Run analysis to see results</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Split Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Map Panel */}
          <div className="xl:col-span-2">
            <div className="backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden h-[600px]" style={{ background: 'linear-gradient(135deg, rgba(0, 30, 60, 0.95) 0%, rgba(0, 51, 102, 0.8) 100%)' }}>
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <LoadingSpinner size="xl" />
                  <p className="mt-4 text-white font-nasa-body font-bold">Processing Analysis...</p>
                  <p className="text-xs text-blue-300 font-nasa-body mt-1">NASA IMERG + POWER Data</p>
                </div>
              ) : (
                <FloodMap ref={floodMapRef} className="h-full w-full" onMarkerClick={setSelectedMarker} />
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Detailed Results - Shows marker data when clicked, otherwise shows main flood data */}
            {(selectedMarker || floodData) && (
              <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 text-sm">�</span>
                    </div>
                    <h3 className="text-white font-semibold">Detailed Analysis</h3>
                  </div>
                  {selectedMarker && (
                    <button
                      onClick={() => setSelectedMarker(null)}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                      title="Clear selection"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {selectedMarker && (
                  <div className="mb-4 px-3 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                    <p className="text-cyan-400 text-xs font-semibold">
                      {selectedMarker.isMain ? '📍 Selected Location Marker' : '📍 Nearby Risk Marker'}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {formatCoordinates(selectedMarker.lat, selectedMarker.lng)}
                    </p>
                  </div>
                )}

                {/* Risk Factors */}
                {((selectedMarker?.data.risk_factors && selectedMarker.data.risk_factors.length > 0) || 
                  (floodData?.flood_risk.factors && floodData.flood_risk.factors.length > 0)) && (
                  <div className="mb-6">
                    <p className="text-gray-400 text-sm mb-3">Risk Factors</p>
                    <div className="space-y-2">
                      {(selectedMarker?.data.risk_factors || floodData?.flood_risk.factors || []).map((factor, index) => (
                        <div key={index} className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                          <p className="text-yellow-400 text-sm">{factor}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Climate Details */}
                {(selectedMarker || floodData?.climate_summary) && (
                  <div className="space-y-3">
                    <p className="text-gray-400 text-sm mb-3">Climate Data</p>
                    <div className="bg-gray-700/50 rounded-xl p-4">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">Max Rainfall:</span>
                          <span className="text-white font-medium">
                            {selectedMarker 
                              ? `${selectedMarker.data.max_precipitation?.toFixed(2) || 'N/A'}mm`
                              : `${floodData.climate_summary.max_precipitation_mm}mm`
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">Avg Humidity:</span>
                          <span className="text-white font-medium">
                            {selectedMarker 
                              ? `${selectedMarker.data.humidity?.toFixed(2) || '65.00'}%`
                              : `${floodData.climate_summary.avg_humidity_percent}%`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Analysis Period */}
                <div className="mt-6 pt-4 border-t border-gray-700">
                  <p className="text-gray-400 text-xs mb-2">Analysis Period</p>
                  {selectedMarker ? (
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-300">
                        {dateRange && dateRange.start && dateRange.end
                          ? `${dateRange.start} to ${dateRange.end}`
                          : 'Historical Data'}
                      </p>
                      {selectedMarker.data.data_days && (
                        <p className="text-gray-500 text-xs mt-2">
                          {selectedMarker.data.data_days} days of climate data
                          {selectedMarker.data.satellite_images && `, ${selectedMarker.data.satellite_images} satellite images`}
                        </p>
                      )}
                    </div>
                  ) : floodData ? (
                    <div>
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
                  ) : null}
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/20 border border-white/30 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-red-400 text-sm">⚠️</span>
                  </div>
                  <div>
                    <p className="text-red-400 font-nasa-body font-bold mb-1">Analysis Error</p>
                    <p className="text-white/80 text-sm font-nasa-body">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* System Info */}
            <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6" style={{ background: 'linear-gradient(135deg, rgba(0, 30, 60, 0.95) 0%, rgba(0, 51, 102, 0.8) 100%)' }}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">ℹ️</span>
                </div>
                <h3 className="text-white font-nasa-heading font-bold">System Info</h3>
              </div>
              <div className="space-y-3 text-sm text-white/80 font-nasa-body">
                <p>• Click map to select location</p>
                <p>• Use historical dates only</p>
                <p>• Analysis uses NASA IMERG + POWER data</p>
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
