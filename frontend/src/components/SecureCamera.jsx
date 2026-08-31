import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle } from 'lucide-react';

export default function SecureCamera({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    startCamera();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        err => console.warn('Geolocation denied or unavailable', err),
        { enableHighAccuracy: true }
      );
    }
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error(err);
      setError('Camera access denied. Camera permission is required for secure evidence.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Burn timestamp & GPS onto canvas
    const timestamp = new Date().toISOString();
    const locStr = location 
      ? `Lat: ${location.lat.toFixed(5)}, Lng: ${location.lng.toFixed(5)}` 
      : 'Location unavailable';

    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, canvas.height - 45, canvas.width, 45);

    ctx.fillStyle = '#00ffcc';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`${timestamp} | ${locStr}`, 15, canvas.height - 18);

    const base64Data = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(base64Data);
    stopCamera();
    if (onCapture) {
      onCapture(base64Data);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    if (onCapture) onCapture(null);
    startCamera();
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
          {error}
        </div>
      )}

      {!capturedImage ? (
        <div className="relative rounded-2xl overflow-hidden bg-black shadow border border-gray-200 aspect-[4/3] flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={capturePhoto}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white/30 backdrop-blur rounded-full border-4 border-white flex items-center justify-center hover:bg-white/50 transition-colors cursor-pointer"
          >
            <Camera size={26} className="text-white" />
          </button>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden shadow border border-gray-200 aspect-[4/3]">
          <img src={capturedImage} alt="Captured Evidence" className="w-full h-full object-cover" />
          <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow">
            <CheckCircle size={14} /> Stamped
          </div>
          <button
            type="button"
            onClick={retake}
            className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-xl text-sm backdrop-blur flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw size={14} /> Retake
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
