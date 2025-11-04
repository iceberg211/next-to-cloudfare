'use client';

import { AdvancedZustandBoard } from './AdvancedBoard';

export default function ZustandAdvancedPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Zustand 复杂应用示例</h2>
        <p className="text-zinc-600">
          本页聚焦 Zustand 的多切片 store、Immer 更新、持久化、订阅选择器与中间件组合，帮助你理解如何在大型项目中组织业务状态。
        </p>
      </div>
      <AdvancedZustandBoard />
    </div>
  );
}

