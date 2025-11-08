'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

export default function ZustandLayout({ children }: { children: ReactNode }) {
  const steps = [
    { href: '/learn/zustand/step-1-basics', label: 'Step 1 基础 store' },
    { href: '/learn/zustand/step-2-selectors', label: 'Step 2 选择器与订阅' },
    { href: '/learn/zustand/step-3-middleware', label: 'Step 3 中间件' },
    { href: '/learn/zustand/step-4-advanced', label: 'Step 4 高级看板' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Zustand 学习区</h1>
          <nav className="flex gap-4 text-sm">
            <Link href="/" className="hover:underline">首页</Link>
            <Link href="/learn" className="hover:underline">学习目录</Link>
            <Link href="/learn/zustand" className="font-medium text-black">Zustand 索引</Link>
          </nav>
        </div>
      </header>
      <div className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-2 text-xs text-zinc-600 flex flex-wrap gap-3">
          {steps.map((step) => (
            <Link key={step.href} href={step.href} className="hover:underline">
              {step.label}
            </Link>
          ))}
        </div>
      </div>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
