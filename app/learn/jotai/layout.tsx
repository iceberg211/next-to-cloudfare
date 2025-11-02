'use client';

import { Provider } from 'jotai';
import type { ReactNode } from 'react';

export default function JotaiLayout({ children }: { children: ReactNode }) {
  // Jotai 默认有全局 Provider，本示例显式包裹方便后续扩展多 store
  return <Provider>{children}</Provider>;
}

