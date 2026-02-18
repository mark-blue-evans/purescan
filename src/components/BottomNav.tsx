'use client';

import { usePathname } from 'next/navigation';
import { ScanBarcode, Clock, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

const navItems = [
  { href: '/', icon: ScanBarcode, label: 'Scan' },
  { href: '/history', icon: Clock, label: 'History' },
  { href: '/grocery', icon: ShoppingCart, label: 'List' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(13, 13, 18, 0.95)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '10px 0',
      paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
      zIndex: 100,
      backdropFilter: 'blur(20px)'
    }}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: isActive ? '#667eea' : '#555',
              transition: 'all 0.2s',
              textDecoration: 'none',
              padding: '8px 20px'
            }}
          >
            <div style={{
              padding: isActive ? '10px' : '8px',
              borderRadius: '14px',
              background: isActive ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
              transition: 'all 0.2s'
            }}>
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
