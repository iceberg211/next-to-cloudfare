'use client';

import Link from 'next/link';
import { Provider } from 'jotai';
import type { ReactNode } from 'react';

export default function JotaiLayout({ children }: { children: ReactNode }) {
  return (
    <Provider>
      <div className="min-h-screen bg-zinc-50 text-zinc-900">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Jotai 学习区</h1>
            <nav className="flex gap-4 text-sm">
              <Link href="/" className="hover:underline">首页</Link>
              <Link href="/learn" className="hover:underline">学习目录</Link>
              <Link href="/learn/jotai" className="hover:underline">Jotai 索引</Link>
            </nav>
          </div>
        </header>
        <div className="border-b bg-white">
          <div className="mx-auto max-w-5xl px-6 py-2 text-xs text-zinc-600 flex flex-wrap gap-3">
            <span className="text-zinc-400">分步导航：</span>
            <Link href="/learn/jotai/step-1-basics" className="hover:underline">Step 1 基础原子</Link>
            <Link href="/learn/jotai/step-2-derived" className="hover:underline">Step 2 派生/精确订阅</Link>
            <Link href="/learn/jotai/step-3-split" className="hover:underline">Step 3 splitAtom 列表</Link>
            <Link href="/learn/jotai/step-4-async" className="hover:underline">Step 4 异步 + Suspense</Link>
            <Link href="/learn/jotai/step-5-advanced" className="hover:underline">Step 5 高级工作区</Link>
          </div>
        </div>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </div>
    </Provider>
  );
}
