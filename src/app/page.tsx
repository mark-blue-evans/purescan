'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Loader2, Heart, Search, ShoppingBag } from 'lucide-react';
import { getCountryFlag } from '@/lib/openfoodfacts';

interface ProductResult {
  barcode: string;
  name: string;
  brand?: string;
  image?: string;
  score: number;
  processingLevel: string;
  risks: {
    seedOils: string[];
    additives: string[];
    artificial: string[];
    pesticides: string[];
    microplastics: string[];
    heavyMetals: string[];
    carcinogens: string[];
  };
  scoreFactors: { overall: string; };
  origin?: { country: string; categories: string; manufacturing: string };
}

export default function Scanner() {
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startScanning = async () => {
    try {
      setError(null);
      
      // Check for BarcodeDetector support
      if (!('BarcodeDetector' in window)) {
        // Fallback - use manual entry
        setError('Barcode scanning not supported on this browser. Please use manual search.');
        return;
      }
      
      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      // Create barcode detector
      const detector = new (window as any).BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code']
      });
      
      detectorRef.current = detector;
      setScanning(true);
      
      // Start scanning loop
      scanFrame();
      
    } catch (err: any) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Failed to start camera: ' + err.message);
      }
    }
  };

  const scanFrame = async () => {
    if (!scanning || !videoRef.current || !detectorRef.current) return;
    
    try {
      const barcodes = await detectorRef.current.detect(videoRef.current);
      
      if (barcodes && barcodes.length > 0) {
        const barcode = barcodes[0].rawValue;
        // Found a barcode!
        stopCamera();
        setScanning(false);
        await handleScan(barcode);
        return;
      }
    } catch (err) {
      console.error('Scan error:', err);
    }
    
    // Continue scanning if still active
    if (scanning) {
      requestAnimationFrame(scanFrame);
    }
  };

  const stopScanning = () => {
    stopCamera();
    setScanning(false);
  };

  const handleScan = async (barcode: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Product not found');
      }
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to scan product');
    } finally { setLoading(false); }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) handleScan(manualBarcode.trim());
  };

  const getScoreColor = (score: number) => score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';
  const getScoreBg = (score: number) => score >= 70 ? 'rgba(16, 185, 129, 0.12)' : score >= 40 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)';

  const addToGrocery = async () => {
    if (!result) return;
    await fetch('/api/grocery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode: result.barcode, productName: result.name, purityScore: result.score }),
    });
    alert('Added to grocery list!');
  };

  const RiskCard = ({ title, items, color, count }: { title: string, items: string[], color: string, count: number }) => {
    if (count === 0) return null;
    return (
      <div style={{ background: `${color}10`, borderRadius: '14px', padding: '14px', marginBottom: '10px', border: `1px solid ${color}30` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '14px', color }}>{title}</span>
          <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '12px', background: color, color: '#fff', fontWeight: 600 }}>{count}</span>
        </div>
        {items.slice(0, 4).map((item, i) => <p key={i} style={{ fontSize: '12px', color: '#777', marginBottom: '2px' }}>• {item}</p>)}
        {count > 4 && <p style={{ fontSize: '11px', color: '#555' }}>+{count - 4} more</p>}
      </div>
    );
  };

  const totalRisks = result ? 
    (result.risks?.carcinogens?.length || 0) + (result.risks?.heavyMetals?.length || 0) + 
    (result.risks?.pesticides?.length || 0) + (result.risks?.seedOils?.length || 0) + 
    (result.risks?.additives?.length || 0) : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d12', paddingBottom: '90px' }}>
      <div style={{ padding: '24px 20px', paddingTop: '50px', background: 'linear-gradient(180deg, #13131a 0%, #0d0d12 100%)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>PureScan</h1>
            <p style={{ color: '#666', fontSize: '13px', marginTop: '2px' }}>Scan to reveal the truth</p>
          </div>
          <button onClick={() => setShowManualInput(!showManualInput)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 14px', color: '#888', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={16} /><span style={{ fontSize: '13px' }}>Search</span>
          </button>
        </div>

        <div style={{ position: 'relative', marginBottom: '20px' }}>
          {/* Camera View */}
          <div style={{ width: '100%', height: scanning ? '300px' : '180px', background: '#121215', borderRadius: '20px', overflow: 'hidden', position: 'relative', display: scanning ? 'block' : 'none' }}>
            <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} playsInline muted />
            {/* Scan overlay */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ width: '300px', height: '150px', border: '3px solid #667eea', borderRadius: '12px', boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }}>
                <div style={{ position: 'absolute', top: '-3px', left: '-3px', right: '-3px', height: '4px', background: 'linear-gradient(90deg, transparent, #667eea, transparent)', animation: 'scan 2s ease-in-out infinite' }} />
              </div>
            </div>
          </div>
          
          {!scanning && !loading && !result && (
            <div style={{ textAlign: 'center', padding: '30px 20px', background: '#16161c', borderRadius: '20px', border: '2px dashed #2a2a35' }}>
              <button onClick={startScanning} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', padding: '16px 36px', borderRadius: '30px', fontWeight: 600, cursor: 'pointer', fontSize: '15px', boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={18} /> Start Scanning
              </button>
              <p style={{ color: '#555', fontSize: '14px', marginTop: '14px' }}>Point camera at barcode</p>
            </div>
          )}

          {scanning && (
            <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 40px)' }}>
              <button onClick={stopScanning} style={{ width: '100%', background: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Tap to Stop</button>
            </div>
          )}
        </div>

        {showManualInput && (
          <form onSubmit={handleManualSubmit}>
            <input type="text" value={manualBarcode} onChange={(e) => setManualBarcode(e.target.value)} placeholder="Enter barcode..." style={{ width: '100%', padding: '16px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: '#16161c', color: '#fff', fontSize: '15px', marginBottom: '10px' }} />
            <button type="submit" disabled={loading} style={{ width: '100%', background: '#667eea', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>Look Up Product</button>
          </form>
        )}
      </div>

      <div style={{ padding: '20px', paddingTop: '10px' }}>
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '14px', padding: '16px', color: '#EF4444', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

        {loading && (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div style={{ width: '70px', height: '70px', border: '3px solid #222', borderTopColor: '#667eea', borderRadius: '50%', margin: '0 auto 18px', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#888', fontSize: '15px' }}>Analyzing product...</p>
          </div>
        )}

        {result && (
          <div>
            <div style={{ background: '#16161c', borderRadius: '24px', padding: '28px', marginBottom: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '160px', height: '160px', borderRadius: '50%', background: getScoreBg(result.score), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: `0 0 50px ${getScoreColor(result.score)}30`, border: `5px solid ${getScoreColor(result.score)}`, position: 'relative' }}>
                <span style={{ fontSize: '52px', fontWeight: 700, color: getScoreColor(result.score), lineHeight: 1 }}>{result.score}</span>
                <Heart size={22} fill={getScoreColor(result.score)} color={getScoreColor(result.score)} style={{ marginTop: '2px' }} />
                <div style={{ position: 'absolute', bottom: '-8px', background: getScoreColor(result.score), color: '#fff', fontSize: '11px', fontWeight: 600, padding: '4px 14px', borderRadius: '12px' }}>{result.processingLevel}</div>
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>{result.name}</h2>
              {result.brand && <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>{result.brand}</p>}

              {(result.origin?.country || result.origin?.categories) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  {result.origin?.categories && <span style={{ background: 'rgba(102, 126, 234, 0.15)', color: '#8892eb', padding: '6px 14px', borderRadius: '20px', fontSize: '12px' }}>📂 {result.origin.categories.split(',')[0]}</span>}
                  {result.origin?.country && <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '6px 14px', borderRadius: '20px', fontSize: '12px' }}>{getCountryFlag(result.origin.country)} {result.origin.country}</span>}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button onClick={addToGrocery} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}><ShoppingBag size={18} /> Add to List</button>
                <button onClick={() => { setResult(null); startScanning(); }} style={{ flex: 1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}><Camera size={18} /> Scan Another</button>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#667eea' }}>🔬</span> Health Analysis {totalRisks > 0 && <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 500 }}>({totalRisks} concerns)</span>}</h3>
              
              <RiskCard title="⚠️ Cancer Risk" items={result.risks?.carcinogens || []} color="#EF4444" count={result.risks?.carcinogens?.length || 0} />
              <RiskCard title="🔬 Heavy Metals" items={result.risks?.heavyMetals || []} color="#8B5CF6" count={result.risks?.heavyMetals?.length || 0} />
              <RiskCard title="🧪 Pesticides" items={result.risks?.pesticides || []} color="#F59E0B" count={result.risks?.pesticides?.length || 0} />
              <RiskCard title="🧴 Microplastics" items={result.risks?.microplastics || []} color="#06B6D4" count={result.risks?.microplastics?.length || 0} />
              <RiskCard title="🛢️ Seed Oils" items={result.risks?.seedOils || []} color="#F97316" count={result.risks?.seedOils?.length || 0} />
              <RiskCard title="⚗️ Additives & Preservatives" items={[...(result.risks?.additives || []), ...(result.risks?.artificial || [])]} color="#EC4899" count={(result.risks?.additives?.length || 0) + (result.risks?.artificial?.length || 0)} />
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', borderRadius: '18px', padding: '20px', border: '1px solid rgba(102, 126, 234, 0.2)' }}>
              <p style={{ fontWeight: 600, color: '#fff', marginBottom: '8px', fontSize: '16px' }}>💡 Verdict</p>
              <p style={{ fontSize: '14px', color: '#aaa', lineHeight: 1.6 }}>{result.scoreFactors?.overall || (result.score >= 70 ? '✅ Good choice. Minimal health concerns.' : result.score >= 40 ? '⚠️ Moderate choice. Some risks detected.' : '❌ Poor choice. Multiple health risks.')}</p>
            </div>
          </div>
        )}

        {!loading && !result && !scanning && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(102, 126, 234, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Camera size={32} color="#667eea" />
            </div>
            <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '8px', fontWeight: 600 }}>Ready to Scan</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Scan any food product barcode</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes scan { 0%, 100% { top: -3px; } 50% { top: calc(100% - 1px); } }
      `}</style>
    </div>
  );
}
