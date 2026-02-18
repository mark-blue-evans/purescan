'use client';

import { usePathname } from 'next/navigation';
import { ScanBarcode, Clock, ShoppingCart, User } from 'lucide-react';
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
      background: '#16161f',
      borderTop: '1px solid #222',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '12px 0',
      paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      zIndex: 100,
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
              color: isActive ? '#667eea' : '#666',
              transition: 'all 0.2s',
              textDecoration: 'none'
            }}
          >
            <div style={{
              padding: '8px',
              borderRadius: '12px',
              background: isActive ? 'rgba(102, 126, 234, 0.15)' : 'transparent'
            }}>
              <item.icon size={22} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 500 }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
