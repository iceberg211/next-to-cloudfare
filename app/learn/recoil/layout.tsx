'use client';

import { RecoilRoot } from 'recoil';
import type { ReactNode } from 'react';

export default function RecoilLayout({ children }: { children: ReactNode }) {
  return <RecoilRoot>{children}</RecoilRoot>;
}

