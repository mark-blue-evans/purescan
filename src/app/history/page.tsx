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
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#10B981' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', paddingTop: '20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
        History
      </h1>
      <p style={{ color: '#A1A1AA', marginBottom: '24px' }}>
        {scans.length} scans
      </p>

      {scans.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            color: '#A1A1AA',
          }}
        >
          <p>No scans yet</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            Start scanning products to see them here
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {scans.map((scan) => (
            <div
              key={scan.id}
              style={{
                background: '#18181B',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              {scan.image_url && (
                <img
                  src={scan.image_url}
                  alt={scan.product_name}
                  style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    background: '#27272A',
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontWeight: 600,
                    marginBottom: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {scan.product_name}
                </p>
                <p style={{ fontSize: '12px', color: '#A1A1AA' }}>
                  {formatDate(scan.scanned_at)}
                </p>
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: getScoreColor(scan.purity_score),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                  color: '#fff',
                  flexShrink: 0,
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
                  color: '#A1A1AA',
                  cursor: deleting === scan.id ? 'default' : 'pointer',
                  padding: '8px',
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

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
