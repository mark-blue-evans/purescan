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
      const data = await response.json();
      if (Array.isArray(data)) {
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to load grocery:', error);
      setItems([]);
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

  const getCartGrade = () => {
    const avg = getAverageScore();
    if (avg >= 70) return { grade: 'A', color: '#10B981' };
    if (avg >= 50) return { grade: 'B', color: '#34d399' };
    if (avg >= 40) return { grade: 'C', color: '#F59E0B' };
    if (avg >= 20) return { grade: 'D', color: '#F97316' };
    return { grade: 'F', color: '#EF4444' };
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', minHeight: '100vh', background: '#0d0d12', paddingTop: '100px', display: 'flex', justifyContent: 'center' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#667eea' }} />
      </div>
    );
  }

  const avgScore = getAverageScore();
  const { grade, color } = getCartGrade();

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d12', paddingBottom: '100px' }}>
      <div style={{ padding: '24px 20px', paddingTop: '60px', background: 'linear-gradient(180deg, #13131a 0%, #0d0d12 100%)' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
          Grocery List
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          {items.length} items
        </p>
      </div>

      <div style={{ padding: '20px', paddingTop: '10px' }}>
        {/* Summary Card */}
        {items.length > 0 && (
          <div style={{ 
            background: '#16161c', 
            borderRadius: '20px', 
            padding: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: `${color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              fontWeight: 700,
              color: color
            }}>
              {grade}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#888', fontSize: '13px', marginBottom: '4px' }}>Cart Grade</p>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>
                {avgScore}/100
              </p>
              <p style={{ color: '#666', fontSize: '12px' }}>
                Based on {items.length} items
              </p>
            </div>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '18px',
              color: '#fff'
            }}>
              {avgScore}
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(102, 126, 234, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <ShoppingBag size={32} color="#667eea" />
            </div>
            <p style={{ color: '#666', fontSize: '15px' }}>Your grocery list is empty</p>
            <p style={{ color: '#444', fontSize: '13px', marginTop: '6px' }}>Add products from scans</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map((item) => (
              <div
                key={item.id}
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
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: '#fff', marginBottom: '4px', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.product_name}
                  </p>
                  <p style={{ fontSize: '12px', color: '#555' }}>
                    Added {new Date(item.added_at).toLocaleDateString()}
                  </p>
                </div>
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: getScoreColor(item.purity_score),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '16px',
                    color: '#fff',
                    flexShrink: 0
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
                    color: '#444',
                    cursor: deleting === item.id ? 'default' : 'pointer',
                    padding: '8px'
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
