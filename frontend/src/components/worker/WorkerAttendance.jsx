import React, { useState, useEffect } from 'react';
import BentoCard from '../BentoCard';
import { MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { MapContainer, TileLayer, WMSTileLayer, LayersControl, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;


export default function WorkerAttendance({ userDocData }) {
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn(err)
      );
    }
  }, []);

  const handlePunchIn = async () => {
    setStatus('Acquiring secure GPS lock...');
    
    if (!location) {
      setStatus('Waiting for GPS signal... Please allow location access.');
      return;
    }

    try {
      await addDoc(collection(db, 'attendance'), {
        uid: userDocData.uid,
        name: userDocData.fullName,
        role: 'worker',
        type: 'CLOCK_IN',
        timestamp: serverTimestamp(),
        location: location
      });
      setStatus('Clock-In Successful. Have a safe shift!');
      setTimeout(() => setStatus(''), 3000);
    } catch (e) {
      console.error(e);
      setStatus('Failed to clock in. Try again.');
    }
  };

  const handlePunchOut = async () => {
    setStatus('Acquiring secure GPS lock...');
    
    if (!location) {
      setStatus('Waiting for GPS signal... Please allow location access.');
      return;
    }

    try {
      await addDoc(collection(db, 'attendance'), {
        uid: userDocData.uid,
        name: userDocData.fullName,
        role: 'worker',
        type: 'CLOCK_OUT',
        timestamp: serverTimestamp(),
        location: location
      });
      setStatus('Clock-Out Successful. Shift ended.');
      setTimeout(() => setStatus(''), 3000);
    } catch (e) {
      console.error(e);
      setStatus('Failed to clock out. Try again.');
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <BentoCard title="Shift Attendance & GPS Tracking" icon={<MapPin size={20} />}>
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
            <ShieldCheck size={20} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-blue-900 mb-1">GPS Verification Required</h4>
              <p className="text-xs text-blue-700 leading-relaxed">
                Your exact coordinates will be recorded when you clock in and out to ensure compliance with geofencing regulations.
              </p>
              {location && (
                <div className="mt-2 text-[10px] font-bold text-blue-800 bg-blue-100/50 inline-block px-2 py-1 rounded">
                  GPS Locked: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                </div>
              )}
            </div>
          </div>

          {location ? (
            <div className="h-64 rounded-xl overflow-hidden border border-gray-200 relative z-0">
              <MapContainer 
                center={[location.lat, location.lng]} 
                zoom={14} 
                scrollWheelZoom={false} 
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
                <Marker position={[location.lat, location.lng]}>
                  <Popup>Your Current Location</Popup>
                </Marker>
                {/* Geofence simulation */}
                <Circle
                  center={[location.lat, location.lng]}
                  pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.15 }}
                  radius={500}
                />
              </MapContainer>
            </div>
          ) : (
            <div className="h-64 rounded-xl border border-gray-200 bg-slate-100 flex items-center justify-center">
              <span className="text-sm font-medium text-slate-400">Acquiring GPS Signal...</span>
            </div>
          )}

          <div className="flex gap-4">
            <button onClick={handlePunchIn} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer">
              <span className="text-sm">Clock In</span>
              <span className="text-[10px] opacity-80 uppercase tracking-wider">Start Shift</span>
            </button>
            <button onClick={handlePunchOut} className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer">
              <span className="text-sm">Clock Out</span>
              <span className="text-[10px] opacity-80 uppercase tracking-wider">End Shift</span>
            </button>
          </div>

          {status && (
            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-100 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} />
              {status}
            </div>
          )}
        </div>
      </BentoCard>
    </div>
  );
}
