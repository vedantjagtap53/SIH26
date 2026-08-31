import React, { useState, useEffect, useRef } from 'react';
import BentoCard from '../BentoCard';
import { Layers, Send, AlertTriangle, CheckSquare, FileText, Camera, MapPin, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function ActiveAudit({ activeTask, setActiveTask, userDocData }) {
  const templateName = activeTask?.template || '';
  const isOC = templateName.toLowerCase().includes('oc') || 
               templateName.toLowerCase().includes('open cast') || 
               templateName.toLowerCase().includes('bench');
  const isUG = !isOC;

  const [formData, setFormData] = useState({
    safeSystem: 'Yes',
    remarks: '',
    haulRoadGradient: '>90% within limit (Rating: 5/5)',
    haulRoadWidth: '100% compliant (3x dumper + 5m)',
    slopeFinalBatter: '0% increase (As per DGMS approval)',
    fencingOC: '100% length fenced as per statute',
    garlandDrain: '100% constructed with silt traps',
    obDumpHeight: 'Permitted height maintained',
    wetDrillingArrangement: '100% operational with water suppression',
    pillarSize: '>90% pillars within permissible size',
    galleryDimensions: 'Within permissible height & width limits',
    panelizationUG: 'Yes - Isolated panels established',
    depillaringStowing: 'Depillaring with adequate stowing/caving',
    waterStoneDusting: '100% faces covered with stone dusting barrier',
    energyAuditCompliance: 'Yes - Energy & Ventilation audit valid within 5 yrs',
    methaneVentilation: 'Clear & Safe (<0.5% CH4)'
  });
  
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState('');

  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLocation();
    return () => {
      stopCamera();
    };
  }, []);

  const fetchLocation = () => {
    setLocationLoading(true);
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('GPS geolocation is not supported on this device/browser.');
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy ? Math.round(pos.coords.accuracy) : 5
        });
        setLocationLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocationError(err.message || 'Unable to retrieve GPS lock. Please grant location permissions.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Failed to access live camera. Please check camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    const watermarkText = 'LOC: ' + (location ? (location.latitude.toFixed(5) + ', ' + location.longitude.toFixed(5)) : 'GPS PENDING') + ' | ' + new Date().toLocaleString() + ' | DGMS AUDIT';
    ctx.fillText(watermarkText, 14, canvas.height - 15);

    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.82);
    setCapturedPhoto(photoDataUrl);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  if (!activeTask) {
    return (
      <BentoCard title="Active Field Audit" icon={<Layers size={20} />}>
        <div className="py-12 flex flex-col items-center justify-center text-gray-400">
          <Layers size={48} className="mb-4 opacity-50 text-indigo-500" />
          <p className="text-sm font-bold text-gray-700">No active audit selected.</p>
          <p className="text-xs mt-1 text-gray-500">Please select an assigned inspection from 'My Tasks' to launch the official audit form.</p>
        </div>
      </BentoCard>
    );
  }

  const canSubmit = Boolean(capturedPhoto && location);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      alert('Statutory Requirement: You must capture live camera evidence and obtain a valid GPS lock before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalAuditPayload = {
        safeSystem: formData.safeSystem,
        remarks: formData.remarks
      };

      if (isOC) {
        finalAuditPayload = {
          ...finalAuditPayload,
          auditCategory: 'Open Cast (OC) Statutory Standard',
          haulRoadGradient: formData.haulRoadGradient,
          haulRoadWidth: formData.haulRoadWidth,
          slopeFinalBatter: formData.slopeFinalBatter,
          fencingOC: formData.fencingOC,
          garlandDrain: formData.garlandDrain,
          obDumpHeight: formData.obDumpHeight,
          wetDrillingArrangement: formData.wetDrillingArrangement
        };
      } else {
        finalAuditPayload = {
          ...finalAuditPayload,
          auditCategory: 'Underground (UG) Statutory Standard',
          pillarSize: formData.pillarSize,
          galleryDimensions: formData.galleryDimensions,
          panelizationUG: formData.panelizationUG,
          depillaringStowing: formData.depillaringStowing,
          waterStoneDusting: formData.waterStoneDusting,
          energyAuditCompliance: formData.energyAuditCompliance,
          methaneVentilation: formData.methaneVentilation
        };
      }

      await addDoc(collection(db, 'inspections'), {
        assignmentId: activeTask.id,
        mineId: activeTask.mineId || 'MINE-GENERIC',
        mineName: activeTask.mineName || 'Unnamed Mine',
        template: activeTask.template || (isOC ? 'Open Cast Statutory Audit' : 'Underground Statutory Audit'),
        inspectorUid: userDocData?.uid || 'UNKNOWN',
        inspectorName: userDocData?.fullName || userDocData?.email || 'Field Inspector',
        ...finalAuditPayload,
        photoEvidence: capturedPhoto,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy
        },
        status: 'SUBMITTED',
        timestamp: serverTimestamp()
      });

      await updateDoc(doc(db, 'assignments', activeTask.id), {
        status: 'COMPLETED'
      });

      setStatus('Official Audit Evidence with live photo & GPS recorded successfully!');
      setTimeout(() => {
        setActiveTask(null);
        setStatus('');
        setIsSubmitting(false);
      }, 1800);
    } catch (err) {
      console.error(err);
      setStatus('Failed to submit audit. Please check your connection.');
      setIsSubmitting(false);
    }
  };

  return (
    <BentoCard 
      title={'DGMS Official Audit: ' + activeTask.mineName} 
      icon={<FileText size={20} className="text-indigo-600" />}
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-4 mb-6 shadow-md">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded border border-indigo-400/30">
                {isOC ? 'OPEN CAST (OC) STANDARD' : 'UNDERGROUND (UG) STANDARD'}
              </span>
              <span className="text-[11px] text-slate-300 font-mono">Directive: {activeTask.template || 'Statutory Inspection'}</span>
            </div>
            <h3 className="text-lg font-black mt-1 text-white tracking-tight">{activeTask.mineName}</h3>
            <p className="text-xs text-slate-300 mt-0.5">{activeTask.notes || 'Routine DGMS Compliance Audit under Mines Act, 1952.'}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-indigo-300 block">Assigned Due Date</span>
            <span className="text-xs font-mono font-bold text-amber-300">{activeTask.dueDate || 'Immediate'}</span>
          </div>
        </div>
      </div>

      {/* Mandatory Checklist Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <div className={'p-3.5 rounded-xl border flex items-center justify-between ' + (location ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900')}>
          <div className="flex items-center gap-2.5">
            <MapPin size={18} className={location ? 'text-emerald-600' : 'text-amber-600 animate-pulse'} />
            <div>
              <div className="text-[11px] font-black uppercase tracking-wide">
                1. GPS Geotag Lock: {location ? 'ACQUIRED' : 'PENDING'}
              </div>
              <p className="text-[11px] font-mono mt-0.5">
                {locationLoading ? 'Acquiring GPS fix...' : 
                 location ? (location.latitude.toFixed(6) + ', ' + location.longitude.toFixed(6) + ' (±' + (location.accuracy || 5) + 'm)') : 
                 (locationError || 'GPS coordinates required')}
              </p>
            </div>
          </div>
          {!location && (
            <button
              type="button"
              onClick={fetchLocation}
              className="p-1.5 bg-white border border-amber-300 hover:bg-amber-100 rounded-lg text-amber-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} /> Retry
            </button>
          )}
          {location && <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />}
        </div>

        <div className={'p-3.5 rounded-xl border flex items-center justify-between ' + (capturedPhoto ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900')}>
          <div className="flex items-center gap-2.5">
            <Camera size={18} className={capturedPhoto ? 'text-emerald-600' : 'text-amber-600'} />
            <div>
              <div className="text-[11px] font-black uppercase tracking-wide">
                2. Live Camera Evidence: {capturedPhoto ? 'CAPTURED' : 'PENDING'}
              </div>
              <p className="text-[11px] mt-0.5">
                {capturedPhoto ? 'Live photo verified & watermarked.' : 'Live camera capture strictly required.'}
              </p>
            </div>
          </div>
          {capturedPhoto ? (
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          ) : (
            <span className="text-[10px] font-black px-2 py-0.5 bg-amber-200 text-amber-900 rounded uppercase">
              Required
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-xs font-black uppercase text-slate-700 mb-2">Overall Safe System of Work (SSW) Compliance</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, safeSystem: 'Yes' })}
              className={'py-2.5 px-4 rounded-xl text-xs font-bold transition-all border cursor-pointer ' + (formData.safeSystem === 'Yes' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100')}
            >
              YES - Fully Compliant
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, safeSystem: 'No' })}
              className={'py-2.5 px-4 rounded-xl text-xs font-bold transition-all border cursor-pointer ' + (formData.safeSystem === 'No' ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100')}
            >
              NO - Violations Noted
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5 border-b pb-2">
            <CheckSquare size={14} /> Official Parameter Evaluation Matrix
          </h4>

          {isOC ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">1. Haul Road Gradient as per Permission</label>
                <select
                  value={formData.haulRoadGradient}
                  onChange={e => setFormData({ ...formData, haulRoadGradient: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value=">90% within limit (Rating: 5/5)">&gt;90% within limit (Rating 5/5)</option>
                  <option value="70% - 90% within limit (Rating: 3/5)">70% - 90% within limit (Rating 3/5)</option>
                  <option value="<50% non-compliant (Rating: 1/5)">&lt;50% non-compliant (Rating 1/5)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">2. Haul Road Width (3x Dumper + 5m)</label>
                <select
                  value={formData.haulRoadWidth}
                  onChange={e => setFormData({ ...formData, haulRoadWidth: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="100% compliant (3x dumper + 5m)">100% compliant with standard berms</option>
                  <option value="60% - 99% compliant with minor choke points">60% - 99% compliant (minor choke points)</option>
                  <option value="<60% width deficit (Hazardous)">&lt;60% width deficit (Hazardous)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">3. Slope of Final Batter & Geotech Study</label>
                <select
                  value={formData.slopeFinalBatter}
                  onChange={e => setFormData({ ...formData, slopeFinalBatter: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="0% increase (As per DGMS approval)">0% increase (Strictly as per DGMS approval)</option>
                  <option value="1% - 7% steepness variance (Monitor)">1% - 7% steepness variance (Monitor)</option>
                  <option value=">=8% over permissible angle (Unstable)">≥8% over permissible angle (Unstable)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">4. Fencing Around OC Quarry</label>
                <select
                  value={formData.fencingOC}
                  onChange={e => setFormData({ ...formData, fencingOC: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="100% length fenced as per statute">100% length securely fenced</option>
                  <option value="60% - 99% fenced (Breaches present)">60% - 99% fenced (Breaches present)</option>
                  <option value="<60% fencing deficit (Critical Defect)">&lt;60% fencing deficit (Critical Defect)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">5. Garland Drain & Silt Trap Arrangement</label>
                <select
                  value={formData.garlandDrain}
                  onChange={e => setFormData({ ...formData, garlandDrain: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="100% constructed with silt traps">100% constructed with silt traps</option>
                  <option value="60% - 99% completed">60% - 99% completed</option>
                  <option value="<60% inadequate runoff handling">&lt;60% inadequate runoff handling</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">6. Overburden (OB) Dump Height Compliance</label>
                <select
                  value={formData.obDumpHeight}
                  onChange={e => setFormData({ ...formData, obDumpHeight: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Permitted height maintained">Permitted height maintained (&lt;0% excess)</option>
                  <option value="1% - 14% excess terrace height">1% - 14% excess terrace height</option>
                  <option value=">=15% excessive dump height (Danger)">≥15% excessive dump height (Danger)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">7. Wet Drilling & Water Tanker Dust Suppression</label>
                <select
                  value={formData.wetDrillingArrangement}
                  onChange={e => setFormData({ ...formData, wetDrillingArrangement: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="100% operational with water suppression">100% operational with active water suppression</option>
                  <option value="60% - 99% coverage">60% - 99% coverage</option>
                  <option value="<60% severe fugitive dust hazard">&lt;60% severe fugitive dust hazard</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">1. Pillar Size Compliance (DGMS Permitted Size)</label>
                <select
                  value={formData.pillarSize}
                  onChange={e => setFormData({ ...formData, pillarSize: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value=">90% pillars within permissible size">&gt;90% pillars within permissible size</option>
                  <option value="50% - 90% compliant">50% - 90% compliant</option>
                  <option value="<50% undersized pillars (High Risk)">&lt;50% undersized pillars (High Risk)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">2. Height & Width of Galleries</label>
                <select
                  value={formData.galleryDimensions}
                  onChange={e => setFormData({ ...formData, galleryDimensions: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Within permissible height & width limits">Within permissible height & width limits</option>
                  <option value="Minor roof sag / Side spalling">Minor roof sag / Side spalling</option>
                  <option value="Excessive width / Height out of bounds">Excessive width / Height out of bounds</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">3. Panelization of UG Workings</label>
                <select
                  value={formData.panelizationUG}
                  onChange={e => setFormData({ ...formData, panelizationUG: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Yes - Isolated panels established">Yes - Isolated panels established</option>
                  <option value="Partial - Isolation stoppings underway">Partial - Isolation stoppings underway</option>
                  <option value="No - Unpanelized large district (Hazard)">No - Unpanelized large district (Hazard)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">4. Depillaring & Caving / Stowing Status</label>
                <select
                  value={formData.depillaringStowing}
                  onChange={e => setFormData({ ...formData, depillaringStowing: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Depillaring with adequate stowing/caving">Adequate caving / &gt;90% stowed area</option>
                  <option value="Minor void accumulation (50% - 90%)">Minor void accumulation (50% - 90%)</option>
                  <option value="Large uncaved overhang (>50% void) (AIR BLAST RISK)">Large uncaved overhang (Air Blast Risk)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">5. Water Sprinkling & Stone Dusting Barrier</label>
                <select
                  value={formData.waterStoneDusting}
                  onChange={e => setFormData({ ...formData, waterStoneDusting: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="100% faces covered with stone dusting barrier">100% faces covered with stone dusting barrier</option>
                  <option value="60% - 99% coverage">60% - 99% coverage</option>
                  <option value="<60% dust explosion risk">&lt;60% coal dust explosion risk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">6. Methane (CH4) & Main Ventilation</label>
                <select
                  value={formData.methaneVentilation}
                  onChange={e => setFormData({ ...formData, methaneVentilation: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Clear & Safe (<0.5% CH4)">Clear & Safe (&lt;0.5% CH4)</option>
                  <option value="Warning Levels (0.5% - 1.25%)">Warning Levels (0.5% - 1.25%)</option>
                  <option value="DANGER (>1.25% - Immediate Withdrawal)">DANGER (&gt;1.25% - Immediate Withdrawal)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Live Camera Capture Section (Strictly No File Upload) */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Camera size={18} className="text-indigo-400" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">Live Field Photographic Evidence</h4>
                <p className="text-[10px] text-slate-400">Strictly live camera capture only. File uploads are disabled by DGMS protocol.</p>
              </div>
            </div>
            {capturedPhoto && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                Photo Attached
              </span>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden"></canvas>

          {capturedPhoto ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500 max-h-72 flex items-center justify-center bg-black">
                <img src={capturedPhoto} alt="Audit Evidence" className="w-full h-auto object-cover" />
                <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow flex items-center gap-1">
                  <CheckCircle2 size={12} /> Geotagged Evidence
                </div>
              </div>
              <button
                type="button"
                onClick={retakePhoto}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={14} /> Retake Live Photo
              </button>
            </div>
          ) : cameraActive ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-black border border-indigo-500/50 max-h-72 flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-64 object-cover" />
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-mono px-2 py-1 rounded backdrop-blur-sm">
                  LIVE VIEWFINDER • {location ? (location.latitude.toFixed(4) + ', ' + location.longitude.toFixed(4)) : 'ACQUIRING GPS'}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera size={16} /> Snap Geotagged Photo
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <Camera size={36} className="mx-auto text-slate-600 mb-2" />
              <p className="text-xs font-bold text-slate-300">No Photo Evidence Captured</p>
              <p className="text-[10px] text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                You must take a live photograph of the working face / mine condition to validate this statutory audit.
              </p>
              {cameraError && (
                <div className="p-2 mb-3 bg-rose-950/50 border border-rose-800 text-rose-300 text-[11px] rounded-lg">
                  {cameraError}
                </div>
              )}
              <button
                type="button"
                onClick={startCamera}
                className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Camera size={15} /> Launch Camera Viewfinder
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Inspector Statutory Remarks & Rectification Orders</label>
          <textarea
            required
            rows={3}
            placeholder="Specify any immediate notices issued under Regulation 22 or Section 22A of the Mines Act..."
            value={formData.remarks}
            onChange={e => setFormData({ ...formData, remarks: e.target.value })}
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
          />
        </div>

        {status && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 animate-in fade-in duration-300">
            {status}
          </div>
        )}

        {!canSubmit && (
          <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl flex items-center gap-3 text-rose-900">
            <XCircle size={20} className="text-rose-600 shrink-0" />
            <div className="text-xs">
              <span className="font-black uppercase tracking-wide block">Submission Blocked</span>
              <span>
                {!capturedPhoto && !location ? 'You must take a live camera photo and enable GPS location.' :
                 !capturedPhoto ? 'You must take a live camera photo before submitting.' :
                 'Waiting for GPS coordinates lock.'}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !canSubmit}
            className={'flex-1 font-bold py-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 ' + (canSubmit ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300')}
          >
            <Send size={16} /> {isSubmitting ? 'Recording Official Evidence...' : 'Submit Official Audit & Close Directive'}
          </button>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveTask(null);
            }}
            className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </BentoCard>
  );
}
