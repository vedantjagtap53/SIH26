import React, { useState, useEffect, useRef } from 'react';
import BentoCard from '../BentoCard';
import { ShieldAlert, Send, Camera, MapPin, X } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ReportHazard({ userDocData, setActiveTab }) {
  const [form, setForm] = useState({ hazardType: 'Roof Fall Risk', severity: 'HIGH', location: '', description: '' });
  const [status, setStatus] = useState('');
  
  // New features state
  const [locationCoords, setLocationCoords] = useState(null);
  const [photoData, setPhotoData] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Fetch location on mount silently
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => console.warn('Geolocation error:', error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setStatus('Camera access denied or unavailable.');
      setIsCameraOpen(false);
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Compress and convert to base64
      const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
      setPhotoData(dataUrl);
      closeCamera();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'incidents'), {
        ...form,
        locationCoords: locationCoords || null,
        photoBase64: photoData || null,
        reporterUid: userDocData.uid,
        reporterName: userDocData.fullName || userDocData.email,
        status: 'UNRESOLVED',
        timestamp: serverTimestamp()
      });
      setStatus('Hazard reported successfully!');
      setTimeout(() => {
        setForm({ hazardType: 'Roof Fall Risk', severity: 'HIGH', location: '', description: '' });
        setPhotoData(null);
        setStatus('');
        setActiveTab('my_reports');
      }, 1500);
    } catch (err) {
      console.error(err);
      setStatus('Failed to submit hazard.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <BentoCard title="Report Immediate Field Hazard" icon={<ShieldAlert size={20} />}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Hazard Category</label>
              <select value={form.hazardType} onChange={e => setForm({...form, hazardType: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500">
                <option>Roof Fall Risk</option>
                <option>Methane / Gas Leak</option>
                <option>Water Inundation</option>
                <option>Machinery Failure</option>
                <option>Fire Hazard</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Severity / Risk Level</label>
              <select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 font-bold">
                <option value="CRITICAL">CRITICAL (Life Threatening)</option>
                <option value="HIGH">HIGH (Serious Injury Risk)</option>
                <option value="MEDIUM">MEDIUM (Operational Risk)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Precise Location in Mine</label>
            <input required type="text" placeholder="e.g. Seam 4, Panel B, Face 12" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Evidence Photo</label>
            {photoData ? (
              <div className="relative inline-block border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <img src={photoData} alt="Hazard Evidence" className="h-40 object-cover" />
                <button type="button" onClick={() => setPhotoData(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-600 transition-colors">
                  <X size={16} />
                </button>
              </div>
            ) : isCameraOpen ? (
              <div className="relative border border-gray-300 bg-black rounded-xl overflow-hidden h-64 flex flex-col">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
                  <button type="button" onClick={capturePhoto} className="bg-white text-black font-bold py-2 px-6 rounded-full shadow-lg flex items-center gap-2 cursor-pointer">
                    <Camera size={16} /> Snap
                  </button>
                  <button type="button" onClick={closeCamera} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full shadow-lg cursor-pointer">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={openCamera} className="w-full border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-6 rounded-xl text-xs transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer">
                <Camera size={24} className="text-gray-400" />
                Capture Live Photo Evidence
              </button>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Detailed Description</label>
            <textarea required rows={3} placeholder="Describe the hazard you observed..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500" />
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-100">
            <MapPin size={14} />
            {locationCoords ? `GPS Coords acquired: ${locationCoords.lat.toFixed(5)}, ${locationCoords.lng.toFixed(5)}` : 'Locating GPS position silently...'}
          </div>

          {status && <div className="text-xs font-bold text-emerald-600 p-2 bg-emerald-50 rounded-lg border border-emerald-100">{status}</div>}
          
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-600/20 text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer">
            <Send size={16} /> Submit Hazard Report Immediately
          </button>
        </form>
      </BentoCard>
    </div>
  );
}