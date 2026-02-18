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
      background: '#18181B',
      borderTop: '1px solid #27272A',
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
              color: isActive ? '#10B981' : '#A1A1AA',
              transition: 'color 0.2s',
            }}
          >
            <item.icon size={24} />
            <span style={{ fontSize: '12px', fontWeight: 500 }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
