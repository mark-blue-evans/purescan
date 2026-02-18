'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
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
  redFlags: string[];
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
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        async (decodedText) => {
          await scanner.stop();
          setScanning(false);
          await handleScan(decodedText);
        },
        () => {} // Ignore errors during scanning
      );
    } catch (err) { const error = err as Error; 
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
    } catch (err) { const error = err as Error; 
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

  const getProcessingLabel = (level: string) => {
    const labels: Record<string, string> = {
      minimal: 'Minimally Processed',
      low: 'Low Processed',
      medium: 'Medium Processed',
      ultra: 'Ultra Processed',
    };
    return labels[level] || level;
  };

  const addToGrocery = async () => {
    if (!result) return;
    
    await fetch('/api/grocery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        barcode: result.barcode,
        productName: result.name,
        purityScore: result.score,
      }),
    });
    
    alert('Added to grocery list!');
  };

  return (
    <div style={{ padding: '20px', paddingTop: '20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
        PureScan
      </h1>
      <p style={{ color: '#A1A1AA', marginBottom: '24px' }}>
        Scan to reveal what is in your food
      </p>

      {/* Scanner Area */}
      <div
        id="scanner-container"
        style={{
          width: '100%',
          height: '250px',
          background: '#18181B',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '16px',
          display: scanning ? 'block' : 'none',
        }}
      />

      {!scanning && (
        <div
          style={{
            width: '100%',
            height: '250px',
            background: '#18181B',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '16px',
            border: '2px dashed #27272A',
          }}
        >
          <Camera size={48} color="#A1A1AA" />
          <p style={{ color: '#A1A1AA' }}>Tap to start scanning</p>
          <button
            onClick={startScanning}
            style={{
              background: '#10B981',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Start Scanner
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
            padding: '12px',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '16px',
          }}
        >
          Stop Scanning
        </button>
      )}

      {/* Manual Input Toggle */}
      <button
        onClick={() => setShowManualInput(!showManualInput)}
        style={{
          width: '100%',
          background: 'transparent',
          color: '#A1A1AA',
          border: '1px solid #27272A',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '12px',
          cursor: 'pointer',
        }}
      >
        {showManualInput ? 'Hide' : 'Enter barcode manually'}
      </button>

      {showManualInput && (
        <form onSubmit={handleManualSubmit} style={{ marginBottom: '24px' }}>
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="Enter barcode..."
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #27272A',
              background: '#18181B',
              color: '#FAFAFA',
              fontSize: '16px',
              marginBottom: '8px',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#10B981',
              color: '#fff',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : 'Look Up'}
          </button>
        </form>
      )}

      {/* Error Message */}
      {error && (
        <div
          style={{
            background: '#EF444420',
            border: '1px solid #EF4444',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            color: '#EF4444',
          }}
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            gap: '12px',
          }}
        >
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#10B981' }} />
          <span>Looking up product...</span>
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          style={{
            background: '#18181B',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px',
          }}
        >
          {result.image && (
            <img
              src={result.image}
              alt={result.name}
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'contain',
                borderRadius: '8px',
                marginBottom: '16px',
                background: '#27272A',
              }}
            />
          )}
          
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
            {result.name}
          </h2>
          {result.brand && (
            <p style={{ color: '#A1A1AA', marginBottom: '16px' }}>{result.brand}</p>
          )}

          {/* Score */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: getScoreColor(result.score),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: 700,
                color: '#fff',
              }}
            >
              {result.score}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '18px' }}>Purity Score</p>
              <p
                style={{
                  color: getScoreColor(result.score),
                  fontWeight: 500,
                }}
              >
                {getProcessingLabel(result.processingLevel)}
              </p>
            </div>
          </div>

          {/* Red Flags */}
          {result.redFlags.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontWeight: 600, marginBottom: '8px', color: '#EF4444' }}>
                ⚠️ Concerns
              </p>
              {result.redFlags.map((flag, i) => (
                <p
                  key={i}
                  style={{
                    color: '#A1A1AA',
                    fontSize: '14px',
                    marginBottom: '4px',
                  }}
                >
                  • {flag}
                </p>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={addToGrocery}
              style={{
                flex: 1,
                background: '#27272A',
                color: '#FAFAFA',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Add to List
            </button>
            <button
              onClick={() => {
                setResult(null);
                startScanning();
              }}
              style={{
                flex: 1,
                background: '#10B981',
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Scan Another
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
