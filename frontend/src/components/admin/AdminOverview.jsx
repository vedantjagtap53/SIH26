import React, { useState } from 'react';
import { Search, Filter, Activity, Map as MapIcon, ChevronRight } from 'lucide-react';
import { MapContainer, TileLayer, WMSTileLayer, LayersControl, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import mlData from '../../data/ml_predictions.json';

// Fix for default Leaflet marker icons not showing in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function BentoCard({ title, value, icon, children, className = "" }) {
  return (
    <div className={`bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
          <span className="text-indigo-500">{icon}</span>
          {title}
        </h3>
        {value && <span className="text-2xl font-black text-gray-900">{value}</span>}
      </div>
      <div className="flex-1 flex flex-col h-full w-full">{children}</div>
    </div>
  );
}

export default function AdminOverview({ 
  searchQuery, 
  setSearchQuery, 
  scope = 'national',
  onAssignClick
}) {
  const [filter, setFilter] = useState('ALL');

  const filteredMines = mlData.filter(mine => 
    (mine.mine_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (mine.company || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-8">
        {/* Map Section */}
        <div className="w-full h-[500px] flex flex-col">
          <BentoCard title={scope === 'national' ? "National Safety Map" : "Regional Safety Map"} icon={<MapIcon size={20} />} className="flex-1 flex flex-col">
            <div className="flex-1 w-full h-full min-h-[500px] mt-2 rounded-xl overflow-hidden border border-gray-200 relative z-0">
              <MapContainer 
                center={[23.79, 86.43]} 
                zoom={9} 
                scrollWheelZoom={true} 
                style={{ height: '100%', width: '100%' }}
              >
                <LayersControl position="topright">
                  <LayersControl.BaseLayer checked name="Satellite (Esri World Imagery)">
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution="Tiles &copy; Esri"
                    />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="Bhuvan WMS (ISRO)">
                    <WMSTileLayer
                      url="https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms"
                      layers="india3"
                      format="image/png"
                      transparent={true}
                      version="1.1.1"
                      attribution="Map data &copy; ISRO, Bhuvan"
                    />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="Street Map (OpenStreetMap)">
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>
                {filteredMines.map(mine => {
                  if (!mine.lat || !mine.lng) return null;
                  
                  // Map marker colors based on safety score (higher is safer)
                  const getRiskColor = (score) => {
                    if (score < 60) return '#ef4444'; // Red
                    if (score < 70) return '#f59e0b'; // Amber
                    return '#10b981'; // Emerald
                  };

                  const riskColor = getRiskColor(mine.score_2627);

                  return (
                    <React.Fragment key={`map-${mine.id}`}>
                      <Marker position={[mine.lat, mine.lng]}>
                        <Popup>
                          <div className="font-sans">
                            <strong className="block text-sm mb-1 text-gray-900">{mine.mine_name}</strong>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">{mine.company}</div>
                            <div className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded border border-slate-100">
                              <span className="font-bold text-gray-600">Forecast:</span>
                              <span style={{ color: riskColor, fontWeight: '900' }}>
                                {mine.score_2627.toFixed(1)} / 100
                              </span>

                            </div>
                            {scope === 'national' && onAssignClick && (
                              <button 
                                onClick={() => onAssignClick(mine)}
                                className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
                              >
                                Dispatch Audit
                              </button>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                      <Circle
                        center={[mine.lat, mine.lng]}
                        pathOptions={{ color: riskColor, fillColor: riskColor, fillOpacity: 0.2 }}
                        radius={2500} // 2.5km geofence radius
                      />
                    </React.Fragment>
                  );
                })}
              </MapContainer>
            </div>
          </BentoCard>
        </div>

<div className="w-full flex flex-col">
          <BentoCard title={scope === 'national' ? "AI Safety Forecast (Target: 2026-2027)" : "Regional AI Forecast (Target: 2026-2027)"} icon={<Activity size={20} />} className="flex-1">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
              <div className="relative w-full md:w-72">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search mine name or company..."
                  className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                    <th className="py-3 px-3">Mine Name</th>
                    <th className="py-3 px-3">Company</th>
                    <th className="py-3 px-3">Base Score (25-26)</th>
                    <th className="py-3 px-3">AI Prediction (26-27)</th>
                    <th className="py-3 px-3">Risk Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {filteredMines.map(mine => {
                    // Risk tier calculation: Higher is safer
                    let tierClass = "bg-emerald-100 text-emerald-700";
                    let tierText = "Safe";
                    if (mine.score_2627 < 70) {
                      tierClass = "bg-amber-100 text-amber-700";
                      tierText = "At Risk";
                    }
                    if (mine.score_2627 < 60) {
                      tierClass = "bg-red-100 text-red-700";
                      tierText = "High Risk";
                    }

                    return (
                      <tr key={mine.id} className="hover:bg-indigo-50/40 transition-colors">
                        <td className="py-3.5 px-3 font-bold text-gray-900">{mine.mine_name}</td>
                        <td className="py-3.5 px-3 text-gray-500">{mine.company}</td>
                        <td className="py-3.5 px-3 font-mono text-gray-600">
                          {mine.score_2526 > 0 ? mine.score_2526.toFixed(1) : 'N/A'}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-indigo-700 flex items-center gap-1">
                          {mine.score_2627.toFixed(1)}
                          {mine.score_2627 > mine.score_2526 ? (
                            <span className="text-[10px] text-emerald-500">▲</span>
                          ) : (
                            <span className="text-[10px] text-red-500">▼</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${tierClass}`}>
                            {tierText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </BentoCard>
        </div>

      </div>
    </div>
  );
}
