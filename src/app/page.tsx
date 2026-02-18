'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Loader2, Heart, X, Plus, ChevronRight } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface ProductResult {
  barcode: string;
  name: string;
  brand?: string;
  image?: string;
  ingredients?: string[];
  nutriments?: Record<string, number | undefined>;
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
  scoreFactors: {
    processing: string;
    ingredients: string;
    healthRisks: string;
    overall: string;
  };
  origin?: {
    country: string;
    manufacturing: string;
    origins: string;
    categories: string;
    labels: string;
  };
}

export default function Scanner() {
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      setScanning(true);
      const scanner = new Html5Qrcode('scanner-container');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        async (decodedText) => {
          await scanner.stop();
          setScanning(false);
          await handleScan(decodedText);
        },
        () => {}
      );
    } catch (err: unknown) {
      const error = err as {message?: string};
      setError(error.message || 'Camera access denied');
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      scannerRef.current = null;
    }
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
      const error = err as {message?: string};
      setError(error.message || 'Failed to scan product');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleScan(manualBarcode.trim());
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#10B981';
    if (score >= 40) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'rgba(16, 185, 129, 0.15)';
    if (score >= 40) return 'rgba(245, 158, 11, 0.15)';
    return 'rgba(239, 68, 68, 0.15)';
  };

  const addToGrocery = async () => {
    if (!result) return;
    await fetch('/api/grocery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode: result.barcode, productName: result.name, purityScore: result.score }),
    });
    alert('Added to grocery list!');
  };

  const RiskCard = ({ title, items, color, riskLevel }: { title: string, items: string[], color: string, riskLevel: 'high' | 'medium' | 'low' }) => {
    if (items.length === 0) return null;
    const bgColor = riskLevel === 'high' ? 'rgba(239, 68, 68, 0.1)' : riskLevel === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)';
    return (
      <div style={{ 
        background: bgColor, 
        borderRadius: '12px', 
        padding: '14px', 
        marginBottom: '10px',
        borderLeft: `4px solid ${color}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '14px', color: color }}>{title}</span>
          <span style={{ 
            fontSize: '11px', 
            padding: '2px 8px', 
            borderRadius: '10px', 
            background: color, 
            color: '#fff',
            fontWeight: 600
          }}>
            {items.length} found
          </span>
        </div>
        {items.slice(0, 3).map((item, i) => (
          <p key={i} style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>• {item}</p>
        ))}
        {items.length > 3 && <p style={{ fontSize: '11px', color: '#999' }}>+{items.length - 3} more</p>}
      </div>
    );
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0A0A0B',
      paddingBottom: '100px'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '20px', 
        background: 'linear-gradient(180deg, #1a1a2e 0%, #0A0A0B 100%)',
        paddingTop: '50px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>PureScan</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setShowManualInput(!showManualInput)}
              style={{ background: 'transparent', border: '1px solid #333', borderRadius: '8px', padding: '8px 12px', color: '#888', fontSize: '12px' }}
            >
              Search
            </button>
          </div>
        </div>

        {/* Scanner Area */}
        <div id="scanner-container" style={{ 
          width: '100%', 
          height: scanning ? '280px' : '200px', 
          background: '#16161f', 
          borderRadius: '20px', 
          overflow: 'hidden',
          display: scanning ? 'block' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }} />

        {!scanning && !loading && !result && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <Camera size={40} color="#666" style={{ marginBottom: '10px' }} />
            <p style={{ color: '#666', fontSize: '13px', marginBottom: '15px' }}>Point at a barcode to scan</p>
            <button
              onClick={startScanning}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '25px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '15px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
            >
              Start Scanning
            </button>
          </div>
        )}

        {scanning && (
          <button
            onClick={stopScanning}
            style={{
              width: '100%',
              background: '#EF4444',
              color: '#fff',
              border: 'none',
              padding: '14px',
              borderRadius: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Stop Scanning
          </button>
        )}

        {showManualInput && (
          <form onSubmit={handleManualSubmit} style={{ marginTop: '15px' }}>
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="Enter barcode..."
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #333',
                background: '#16161f',
                color: '#fff',
                fontSize: '15px',
                marginBottom: '10px',
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: '#667eea',
                color: '#fff',
                border: 'none',
                padding: '14px',
                borderRadius: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Look Up
            </button>
          </form>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px', paddingTop: '0' }}>
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', borderRadius: '12px', padding: '14px', color: '#EF4444', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              border: '3px solid #333', 
              borderTopColor: '#667eea', 
              borderRadius: '50%', 
              margin: '0 auto 15px',
              animation: 'spin 1s linear infinite' 
            }} />
            <p style={{ color: '#666' }}>Analyzing product...</p>
          </div>
        )}

        {result && (
          <div>
            {/* Main Score Card */}
            <div style={{ 
              background: '#16161f', 
              borderRadius: '24px', 
              padding: '24px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {/* Score Circle */}
              <div style={{ 
                width: '140px', 
                height: '140px', 
                borderRadius: '50%', 
                background: getScoreBg(result.score),
                border: `4px solid ${getScoreColor(result.score)}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: `0 0 30px ${getScoreColor(result.score)}40`
              }}>
                <span style={{ fontSize: '42px', fontWeight: 700, color: getScoreColor(result.score), lineHeight: 1 }}>
                  {result.score}
                </span>
                <Heart size={20} fill={getScoreColor(result.score)} color={getScoreColor(result.score)} />
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                {result.name}
              </h2>
              {result.brand && (
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>{result.brand}</p>
              )}

              <div style={{ 
                display: 'inline-block', 
                padding: '6px 16px', 
                borderRadius: '20px', 
                background: getScoreBg(result.score),
                color: getScoreColor(result.score),
                fontWeight: 600,
                fontSize: '13px'
              }}>
                {result.processingLevel}
              </div>

              {/* Origin Info */}
              {(result.origin?.country || result.origin?.categories) && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #222' }}>
                  {result.origin?.categories && (
                    <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                      📂 {result.origin.categories}
                    </p>
                  )}
                  {result.origin?.country && (
                    <p style={{ fontSize: '12px', color: '#888' }}>
                      🌍 {result.origin.country}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  onClick={addToGrocery}
                  style={{
                    flex: 1,
                    background: '#222',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus size={18} /> Add to List
                </button>
                <button
                  onClick={() => { setResult(null); startScanning(); }}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Camera size={18} /> Scan Another
                </button>
              </div>
            </div>

            {/* Risk Categories */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
                Health Analysis
              </h3>
              
              <RiskCard 
                title="⚠️ Cancer Risk" 
                items={result.risks?.carcinogens || []} 
                color="#EF4444"
                riskLevel={(result.risks?.carcinogens?.length || 0) > 0 ? 'high' : 'low'}
              />
              <RiskCard 
                title="🔬 Heavy Metals" 
                items={result.risks?.heavyMetals || []} 
                color="#8B5CF6"
                riskLevel={(result.risks?.heavyMetals?.length || 0) > 0 ? 'high' : 'low'}
              />
              <RiskCard 
                title="🧪 Pesticides" 
                items={result.risks?.pesticides || []} 
                color="#F59E0B"
                riskLevel={(result.risks?.pesticides?.length || 0) > 0 ? 'medium' : 'low'}
              />
              <RiskCard 
                title="🧴 Microplastics" 
                items={result.risks?.microplastics || []} 
                color="#06B6D4"
                riskLevel={(result.risks?.microplastics?.length || 0) > 0 ? 'medium' : 'low'}
              />
              <RiskCard 
                title="🛢️ Seed Oils" 
                items={result.risks?.seedOils || []} 
                color="#F97316"
                riskLevel={(result.risks?.seedOils?.length || 0) > 0 ? 'medium' : 'low'}
              />
              <RiskCard 
                title="⚗️ Additives" 
                items={[...(result.risks?.additives || []), ...(result.risks?.artificial || [])]} 
                color="#EC4899"
                riskLevel={((result.risks?.additives?.length || 0) + (result.risks?.artificial?.length || 0)) > 3 ? 'high' : 'low'}
              />
            </div>

            {/* Verdict */}
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)', 
              borderRadius: '16px', 
              padding: '20px',
              border: '1px solid #667eea40'
            }}>
              <p style={{ fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Verdict</p>
              <p style={{ fontSize: '14px', color: '#aaa', lineHeight: 1.5 }}>
                {result.scoreFactors?.overall || (result.score >= 70 ? 'Good choice - mostly clean ingredients' : result.score >= 40 ? 'Moderate - some concerns found' : 'Poor choice - multiple health risks')}
              </p>
            </div>
          </div>
        )}

        {!loading && !result && !scanning && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ color: '#666', fontSize: '15px' }}>
              Scan a barcode to see what's in your food
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
