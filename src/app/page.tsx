'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Loader2, Heart, X, Plus, Search, History, ShoppingBag } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { countryFlags, getCountryFlag } from '@/lib/openfoodfacts';

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
        { fps: 10, qrbox: { width: 280, height: 160 } },
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
    if (score >= 70) return 'rgba(16, 185, 129, 0.12)';
    if (score >= 40) return 'rgba(245, 158, 11, 0.12)';
    return 'rgba(239, 68, 68, 0.12)';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 70) return 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
    if (score >= 40) return 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
    return 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
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
    const bgColor = riskLevel === 'high' ? 'rgba(239, 68, 68, 0.08)' : riskLevel === 'medium' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)';
    const borderColor = riskLevel === 'high' ? 'rgba(239, 68, 68, 0.3)' : riskLevel === 'medium' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)';
    return (
      <div style={{ 
        background: bgColor, 
        borderRadius: '14px', 
        padding: '14px', 
        marginBottom: '10px',
        border: `1px solid ${borderColor}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '14px', color: color }}>{title}</span>
          <span style={{ 
            fontSize: '11px', 
            padding: '3px 10px', 
            borderRadius: '12px', 
            background: color, 
            color: '#fff',
            fontWeight: 600
          }}>
            {items.length}
          </span>
        </div>
        {items.slice(0, 4).map((item, i) => (
          <p key={i} style={{ fontSize: '12px', color: '#888', marginBottom: '2px', lineHeight: 1.4 }}>• {item}</p>
        ))}
        {items.length > 4 && <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>+{items.length - 4} more</p>}
      </div>
    );
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0d0d12',
      paddingBottom: '90px'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '24px 20px', 
        background: 'linear-gradient(180deg, #13131a 0%, #0d0d12 100%)',
        paddingTop: '50px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>PureScan</h1>
            <p style={{ color: '#666', fontSize: '13px', marginTop: '2px' }}>Scan to reveal the truth</p>
          </div>
          <button 
            onClick={() => setShowManualInput(!showManualInput)}
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '12px', 
              padding: '10px 14px',
              color: '#888',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Search size={16} />
            <span style={{ fontSize: '13px' }}>Search</span>
          </button>
        </div>

        {/* Scanner */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <div 
            id="scanner-container" 
            style={{ 
              width: '100%', 
              height: scanning ? '280px' : '220px', 
              background: '#121215', 
              borderRadius: '24px', 
              overflow: 'hidden',
              display: scanning ? 'block' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed #2a2a35'
            }} 
          />

          {!scanning && !loading && !result && (
            <div style={{ 
              textAlign: 'center',
              width: '100%',
              padding: '20px'
            }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Camera size={36} color="#667eea" />
              </div>
              <p style={{ color: '#555', fontSize: '14px', marginBottom: '16px' }}>Point camera at barcode</p>
              <button
                onClick={startScanning}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '14px 36px',
                  borderRadius: '30px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '15px',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Camera size={18} />
                Start Scanning
              </button>
            </div>
          )}

          {scanning && (
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'calc(100% - 40px)',
              maxWidth: '300px'
            }}>
              <button
                onClick={stopScanning}
                style={{
                  width: '100%',
                  background: 'rgba(239, 68, 68, 0.9)',
                  color: '#fff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)'
                }}
              >
                Tap to Stop
              </button>
            </div>
          )}
        </div>

        {showManualInput && (
          <form onSubmit={handleManualSubmit} style={{ marginTop: '16px' }}>
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="Enter barcode number..."
              style={{
                width: '100%',
                padding: '16px 18px',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: '#16161c',
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
                opacity: loading ? 0.7 : 1,
              }}
            >
              Look Up Product
            </button>
          </form>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px', paddingTop: '10px' }}>
        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            borderRadius: '14px', 
            padding: '16px', 
            color: '#EF4444', 
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div style={{ 
              width: '70px', 
              height: '70px', 
              border: '3px solid #222', 
              borderTopColor: '#667eea', 
              borderRadius: '50%', 
              margin: '0 auto 18px',
              animation: 'spin 1s linear infinite' 
            }} />
            <p style={{ color: '#888', fontSize: '15px' }}>Analyzing product...</p>
            <p style={{ color: '#555', fontSize: '12px', marginTop: '6px' }}>Checking ingredients & risks</p>
          </div>
        )}

        {result && (
          <div>
            {/* Main Score Card */}
            <div style={{ 
              background: '#16161c', 
              borderRadius: '24px', 
              padding: '28px',
              marginBottom: '20px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              {/* Score Circle */}
              <div style={{ 
                width: '160px', 
                height: '160px', 
                borderRadius: '50%', 
                background: getScoreBg(result.score),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: `0 0 50px ${getScoreColor(result.score)}30`,
                border: `5px solid ${getScoreColor(result.score)}`,
                position: 'relative'
              }}>
                <span style={{ fontSize: '52px', fontWeight: 700, color: getScoreColor(result.score), lineHeight: 1 }}>
                  {result.score}
                </span>
                <Heart size={22} fill={getScoreColor(result.score)} color={getScoreColor(result.score)} style={{ marginTop: '2px' }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-8px',
                  background: getScoreColor(result.score),
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 14px',
                  borderRadius: '12px',
                  whiteSpace: 'nowrap'
                }}>
                  {result.processingLevel}
                </div>
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#fff', marginBottom: '6px', lineHeight: 1.3 }}>
                {result.name}
              </h2>
              {result.brand && (
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>{result.brand}</p>
              )}

              {/* Country & Category with Flags */}
              {(result.origin?.country || result.origin?.categories) && (
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255,255,255,0.05)'
                }}>
                  {result.origin?.categories && (
                    <span style={{ 
                      background: 'rgba(102, 126, 234, 0.15)', 
                      color: '#8892eb',
                      padding: '6px 14px', 
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      📂 {result.origin.categories.split(',')[0]}
                    </span>
                  )}
                  {result.origin?.country && (
                    <span style={{ 
                      background: 'rgba(16, 185, 129, 0.15)', 
                      color: '#34d399',
                      padding: '6px 14px', 
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      {getCountryFlag(result.origin.country)} {result.origin.country}
                    </span>
                  )}
                  {result.origin?.manufacturing && (
                    <span style={{ 
                      background: 'rgba(245, 158, 11, 0.15)', 
                      color: '#fbbf24',
                      padding: '6px 14px', 
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      🏭 {result.origin.manufacturing.substring(0, 20)}
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  onClick={addToGrocery}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '14px',
                    borderRadius: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '14px'
                  }}
                >
                  <ShoppingBag size={18} /> Add to List
                </button>
                <button
                  onClick={() => { setResult(null); startScanning(); }}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '14px'
                  }}
                >
                  <Camera size={18} /> Scan Another
                </button>
              </div>
            </div>

            {/* Risk Categories */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#667eea' }}>🔬</span> Health Analysis
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
                title="⚗️ Additives & Preservatives" 
                items={[...(result.risks?.additives || []), ...(result.risks?.artificial || [])]} 
                color="#EC4899"
                riskLevel={((result.risks?.additives?.length || 0) + (result.risks?.artificial?.length || 0)) > 3 ? 'high' : 'low'}
              />
            </div>

            {/* Verdict */}
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', 
              borderRadius: '18px', 
              padding: '20px',
              border: '1px solid rgba(102, 126, 234, 0.2)'
            }}>
              <p style={{ fontWeight: 600, color: '#fff', marginBottom: '8px', fontSize: '16px' }}>💡 Verdict</p>
              <p style={{ fontSize: '14px', color: '#aaa', lineHeight: 1.6 }}>
                {result.scoreFactors?.overall || (result.score >= 70 ? 
                  '✅ Good choice. This product has minimal health concerns and uses clean ingredients.' : 
                  result.score >= 40 ? 
                  '⚠️ Moderate choice. Some ingredients may pose health risks. Review details above.' : 
                  '❌ Poor choice. Multiple health risks detected. Consider alternatives.')}
              </p>
            </div>
          </div>
        )}

        {!loading && !result && !scanning && (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              background: 'rgba(102, 126, 234, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <Camera size={40} color="#667eea" />
            </div>
            <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '8px', fontWeight: 600 }}>Ready to Scan</h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.5 }}>
              Scan any food product barcode to see its purity score, health risks, and detailed analysis.
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
