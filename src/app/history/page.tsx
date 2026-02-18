'use client';

import { useState, useEffect } from 'react';
import { Trash2, Loader2 } from 'lucide-react';

interface Scan {
  id: number;
  barcode: string;
  product_name: string;
  purity_score: number;
  processing_level: string;
  image_url?: string;
  scanned_at: string;
}

export default function History() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        setScans(data);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteScan = async (id: number) => {
    setDeleting(id);
    try {
      await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
      setScans(scans.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setDeleting(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#10B981';
    if (score >= 40) return '#F59E0B';
    return '#EF4444';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', minHeight: '100vh', background: '#0d0d12', paddingTop: '100px', display: 'flex', justifyContent: 'center' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#667eea' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d12', paddingBottom: '100px' }}>
      <div style={{ padding: '24px 20px', paddingTop: '60px', background: 'linear-gradient(180deg, #13131a 0%, #0d0d12 100%)' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
          History
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          {scans.length} products scanned
        </p>
      </div>

      <div style={{ padding: '20px', paddingTop: '10px' }}>
        {scans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(102, 126, 234, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Loader2 size={32} color="#667eea" />
            </div>
            <p style={{ color: '#666', fontSize: '15px' }}>No scans yet</p>
            <p style={{ color: '#444', fontSize: '13px', marginTop: '6px' }}>Start scanning products to build your history</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {scans.map((scan) => (
              <div
                key={scan.id}
                style={{
                  background: '#16161c',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  border: '1px solid rgba(255,255,255,0.03)'
                }}
              >
                {scan.image_url && (
                  <img
                    src={scan.image_url}
                    alt={scan.product_name}
                    style={{
                      width: '56px',
                      height: '56px',
                      objectFit: 'contain',
                      borderRadius: '12px',
                      background: '#1a1a22'
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: '#fff', marginBottom: '4px', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {scan.product_name}
                  </p>
                  <p style={{ fontSize: '12px', color: '#555' }}>
                    {formatDate(scan.scanned_at)}
                  </p>
                </div>
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: getScoreColor(scan.purity_score),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '16px',
                    color: '#fff',
                    flexShrink: 0
                  }}
                >
                  {scan.purity_score}
                </div>
                <button
                  onClick={() => deleteScan(scan.id)}
                  disabled={deleting === scan.id}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#444',
                    cursor: deleting === scan.id ? 'default' : 'pointer',
                    padding: '8px'
                  }}
                >
                  {deleting === scan.id ? (
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>
            ))}
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
