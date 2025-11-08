'use client';

import { AdvancedZustandBoard } from '../AdvancedBoard';

export default function Step4Advanced() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Step 4 · 高级看板</h2>
      <p className="text-zinc-600">
        复用之前定义的多中间件 store，展示多切片、subscribeWithSelector、persist/devtools、Async 建模等全部能力。
      </p>
      <AdvancedZustandBoard />
    </div>
  );
}
