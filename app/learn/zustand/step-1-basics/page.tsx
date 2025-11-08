'use client';

import { create } from 'zustand';

interface BasicState {
  count: number;
  text: string;
  inc: () => void;
  dec: () => void;
  setText: (value: string) => void;
}

const useBasicStore = create<BasicState>()((set) => ({
  count: 0,
  text: 'Zustand 入门',
  inc: () => set((state) => ({ ...state, count: state.count + 1 })),
  dec: () => set((state) => ({ ...state, count: state.count - 1 })),
  setText: (value) => set((state) => ({ ...state, text: value })),
}));

export default function Step1Basics() {
  const count = useBasicStore((state) => state.count);
  const text = useBasicStore((state) => state.text);
  const inc = useBasicStore((state) => state.inc);
  const dec = useBasicStore((state) => state.dec);
  const setText = useBasicStore((state) => state.setText);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Step 1 · 简单 store</h2>
      <p className="text-zinc-600">通过 create 创建 store，组件用 useStore 订阅，并可直接调用内部方法。</p>
      <section className="rounded-lg border bg-white p-6 space-y-4">
        <div className="flex items-center gap-3 text-2xl">
          <button className="rounded border px-3 py-1" onClick={dec}>-</button>
          <span className="font-semibold">{count}</span>
          <button className="rounded border px-3 py-1" onClick={inc}>+</button>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">共享文本</label>
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="w-full rounded border px-3 py-2"
          />
          <p className="text-sm text-zinc-500">多个组件订阅相同 store，操作 count/text 会同步影响所有订阅者。</p>
        </div>
      </section>
    </div>
  );
}
