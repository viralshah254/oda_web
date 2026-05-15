'use client';

import { ReactNode } from 'react';

export function ShopLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-oda-ivory">{children}</div>;
}
