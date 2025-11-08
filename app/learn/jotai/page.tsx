"use client";

import Link from "next/link";

export default function JotaiIndex() {
  const steps = [
    { href: "/learn/jotai/step-1-basics", title: "Step 1 基础原子", desc: "atom/useAtom：最小状态单元与多组件同步" },
    { href: "/learn/jotai/step-2-derived", title: "Step 2 派生与精确订阅", desc: "selectAtom：按需重算与优化渲染" },
    { href: "/learn/jotai/step-3-split", title: "Step 3 列表与 splitAtom", desc: "项级原子，细粒度渲染" },
    { href: "/learn/jotai/step-4-async", title: "Step 4 异步原子 + Suspense", desc: "Promise 原子、加载/错误与重试" },
    { href: "/learn/jotai/step-5-advanced", title: "Step 5 高级工作区", desc: "多 Store/Provider、持久化与批量更新" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Jotai 学习索引</h2>
      <p className="text-zinc-600">从基础到高级逐步掌握 Jotai，建议按顺序浏览：</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((s) => (
          <Link key={s.href} href={s.href} className="rounded-lg border bg-white p-4 hover:shadow">
            <h3 className="font-medium">{s.title}</h3>
            <p className="text-sm text-zinc-600 mt-1">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
