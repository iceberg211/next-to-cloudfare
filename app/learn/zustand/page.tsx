'use client';

import Link from 'next/link';

export default function ZustandIndex() {
  const steps = [
    {
      href: '/learn/zustand/step-1-basics',
      title: 'Step 1 · 基础 store',
      desc: '理解 create/createStore、useStore 以及 useStore.subscribe 的工作方式。',
    },
    {
      href: '/learn/zustand/step-2-selectors',
      title: 'Step 2 · 选择器与订阅',
      desc: '使用 selectors 返回部分状态，并通过 subscribeWithSelector 监听特定字段。',
    },
    {
      href: '/learn/zustand/step-3-middleware',
      title: 'Step 3 · 中间件（persist/devtools）',
      desc: '组合 persist、devtools 和 subscribeWithSelector，让 store 更成熟。',
    },
    {
      href: '/learn/zustand/step-4-advanced',
      title: 'Step 4 · 高级看板',
      desc: '复用多中间件、Immer、subscribeWithSelector 与 selectors 构建完整任务看板。',
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Zustand 学习索引</h2>
      <p className="text-zinc-600">按顺序浏览即可以从最基础的 store 概念一路进阶到高阶中间件和复杂看板。</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step) => (
          <Link key={step.href} href={step.href} className="rounded-lg border bg-white p-4 hover:shadow">
            <h3 className="font-medium">{step.title}</h3>
            <p className="text-sm text-zinc-600 mt-1">{step.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
