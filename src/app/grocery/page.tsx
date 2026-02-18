'use client';

import { useState, useEffect } from 'react';
import { Trash2, Loader2, ShoppingBag } from 'lucide-react';

interface GroceryItem {
  id: number;
  barcode: string;
  product_name: string;
  purity_score: number;
  added_at: string;
}

export default function Grocery() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const response = await fetch('/api/grocery');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to load grocery:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: number) => {
    setDeleting(id);
    try {
      await fetch(`/api/grocery?id=${id}`, { method: 'DELETE' });
      setItems(items.filter((i) => i.id !== id));
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

  const getAverageScore = () => {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, item) => acc + item.purity_score, 0);
    return Math.round(sum / items.length);
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#10B981' }} />
      </div>
    );
  }

  const avgScore = getAverageScore();

  return (
    <div style={{ padding: '20px', paddingTop: '20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
        Grocery List
      </h1>
      <p style={{ color: '#A1A1AA', marginBottom: '24px' }}>
        {items.length} items
      </p>

      {/* Summary Card */}
      {items.length > 0 && (
        <div
          style={{
            background: '#18181B',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <ShoppingBag size={32} color="#A1A1AA" />
          <div style={{ flex: 1 }}>
            <p style={{ color: '#A1A1AA', fontSize: '14px' }}>Cart Purity Score</p>
            <p style={{ fontSize: '24px', fontWeight: 700 }}>
              {avgScore}/100
            </p>
          </div>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: getScoreColor(avgScore),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '18px',
              color: '#fff',
            }}
          >
            {avgScore}
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            color: '#A1A1AA',
          }}
        >
          <ShoppingBag size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>Your grocery list is empty</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            Add products from scans to build your list
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#18181B',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
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
                  {item.product_name}
                </p>
                <p style={{ fontSize: '12px', color: '#A1A1AA' }}>
                  Added {new Date(item.added_at).toLocaleDateString()}
                </p>
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: getScoreColor(item.purity_score),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                {item.purity_score}
              </div>
              <button
                onClick={() => deleteItem(item.id)}
                disabled={deleting === item.id}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#A1A1AA',
                  cursor: deleting === item.id ? 'default' : 'pointer',
                  padding: '8px',
                }}
              >
                {deleting === item.id ? (
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
