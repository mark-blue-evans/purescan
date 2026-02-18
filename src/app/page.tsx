'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Loader2, Heart, Plus, Search, ShoppingBag } from 'lucide-react';
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
    palmOil: boolean;
    additives: string[];
    artificial: string[];
    pesticides: string[];
    microplastics: string[];
    heavyMetals: string[];
    carcinogens: string[];
  };
  scoreFactors: { overall: string };
  origin?: { country: string; categories: string; manufacturing: string };
}

export default function Scanner() {
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const scannerRef = useRef<any>(null);
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    return () => { if (scannerRef.current) scannerRef.current.stop().catch(() => {}); };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      
      // First check/request camera permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        // Stop test stream
        stream.getTracks().forEach(track => track.stop());
      } catch (permErr: any) {
        if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
          setError('Camera permission denied. Please allow camera access in your browser settings, then refresh.');
        } else if (permErr.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else {
          setError('Camera error: ' + permErr.message);
        }
        return;
      }
      
      setScanning(true);
      
      // Give DOM time to update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Dynamic import to avoid SSR crash
      const { Html5Qrcode } = await import('html5-qrcode');
      
      const scanner = new Html5Qrcode('scanner-container');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 280, height: 160 } },
        async (decodedText) => {
          await scanner.stop();
          setScanning(false);
          await handleScan(decodedText);
        },
        () => {} // Ignore scan errors
      );
    } catch (err: unknown) {
      const e = err as {message?: string, name?: string};
      setScanning(false);
      if (e.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access.');
      } else {
        setError('Camera error: ' + (e.message || 'Failed to start'));
      }
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) { await scannerRef.current.stop(); scannerRef.current = null; }
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
    } catch (err: unknown) {
      const e = err as {message?: string};
      setError(e.message || 'Failed to scan product');
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
    try {
      const response = await fetch('/api/grocery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: result.barcode, productName: result.name, purityScore: result.score }),
      });
      if (response.ok) {
        alert('Added to grocery list!');
      } else {
        alert('Failed to add. Try again.');
      }
    } catch (e) {
      alert('Error adding item');
    }
  };

  const RiskCard = ({ title, items, color, count, riskLevel }: { title: string, items: string[], color: string, count: number, riskLevel?: 'low' | 'medium' | 'high' }) => {
    if (count === 0) return null;
    const riskColors = { low: '#10B981', medium: '#F59E0B', high: '#EF4444' };
    const barColor = riskLevel ? riskColors[riskLevel] : color;
    return (
      <div style={{ background: '#16161c', borderRadius: '16px', padding: '16px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontWeight: 600, fontSize: '15px', color: '#fff' }}>{title}</span>
          {riskLevel && (
            <span style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '12px', background: barColor + '20', color: barColor, fontWeight: 600 }}>
              {riskLevel.toUpperCase()}
            </span>
          )}
        </div>
        {/* Risk level bar */}
        {riskLevel && (
          <div style={{ height: '4px', background: '#2a2a35', borderRadius: '2px', marginBottom: '12px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: riskLevel === 'low' ? '30%' : riskLevel === 'medium' ? '60%' : '90%', background: barColor, borderRadius: '2px' }} />
          </div>
        )}
        {items.slice(0, 5).map((item, i) => (
          <p key={i} style={{ fontSize: '13px', color: '#888', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: barColor, flexShrink: 0 }} />
            {item}
          </p>
        ))}
        {count > 5 && <p style={{ fontSize: '12px', color: '#555', marginTop: '6px' }}>+{count - 5} more</p>}
      </div>
    );
  };

  const QuickHighlights = () => {
    const hasSeedOil = (result?.risks?.seedOils?.length || 0) > 0;
    const hasPalmOil = result?.risks?.palmOil || false;
    const additiveCount = (result?.risks?.additives?.length || 0) + (result?.risks?.artificial?.length || 0);
    
    return (
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px' }}>
        <div style={{ background: hasSeedOil ? '#EF444420' : '#10B98120', border: `1px solid ${hasSeedOil ? '#EF4444' : '#10B981'}40`, borderRadius: '20px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px' }}>🛢️</span>
          <span style={{ fontSize: '13px', color: hasSeedOil ? '#EF4444' : '#10B981', fontWeight: 500 }}>{hasSeedOil ? 'Has Seed Oil' : 'No Seed Oil'}</span>
        </div>
        <div style={{ background: hasPalmOil ? '#EF444420' : '#10B98120', border: `1px solid ${hasPalmOil ? '#EF4444' : '#10B981'}40`, borderRadius: '20px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px' }}>🌴</span>
          <span style={{ fontSize: '13px', color: hasPalmOil ? '#EF4444' : '#10B981', fontWeight: 500 }}>{hasPalmOil ? 'Has Palm Oil' : 'No Palm Oil'}</span>
        </div>
        <div style={{ background: '#667eea20', border: '1px solid #667eea40', borderRadius: '20px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px' }}>📝</span>
          <span style={{ fontSize: '13px', color: '#8892eb', fontWeight: 500 }}>{additiveCount} Additives</span>
        </div>
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

        {/* Scanner */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <div id="scanner-container" style={{ width: '100%', height: scanning ? '280px' : '180px', background: '#121215', borderRadius: '20px', overflow: 'hidden', display: scanning ? 'block' : 'none' }} />
          
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
              
              <QuickHighlights />
              
              <RiskCard title="⚠️ Cancer Risk" items={result.risks?.carcinogens || []} color="#EF4444" count={result.risks?.carcinogens?.length || 0} riskLevel={result.risks?.carcinogens?.length ? 'high' : 'low'} />
              <RiskCard title="🔬 Heavy Metals" items={result.risks?.heavyMetals || []} color="#8B5CF6" count={result.risks?.heavyMetals?.length || 0} riskLevel={result.risks?.heavyMetals?.length ? 'medium' : 'low'} />
              <RiskCard title="🧪 Pesticides" items={result.risks?.pesticides || []} color="#F59E0B" count={result.risks?.pesticides?.length || 0} riskLevel={result.risks?.pesticides?.length ? 'medium' : 'low'} />
              <RiskCard title="🧴 Microplastics" items={result.risks?.microplastics || []} color="#06B6D4" count={result.risks?.microplastics?.length || 0} riskLevel={result.risks?.microplastics?.length ? 'medium' : 'low'} />
              <RiskCard title="🛢️ Seed Oils" items={result.risks?.seedOils || []} color="#F97316" count={result.risks?.seedOils?.length || 0} riskLevel={result.risks?.seedOils?.length ? 'high' : 'low'} />
              <RiskCard title="⚗️ Additives & Preservatives" items={[...(result.risks?.additives || []), ...(result.risks?.artificial || [])]} color="#EC4899" count={(result.risks?.additives?.length || 0) + (result.risks?.artificial?.length || 0)} riskLevel={((result.risks?.additives?.length || 0) + (result.risks?.artificial?.length || 0)) > 5 ? 'high' : ((result.risks?.additives?.length || 0) + (result.risks?.artificial?.length || 0)) > 0 ? 'medium' : 'low'} />
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

      <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
