'use client';

import { atom, useAtom } from 'jotai';

// 计数器原子
const countAtom = atom(0);
// 派生原子
const doubleAtom = atom((get) => get(countAtom) * 2);

export default function JotaiDemo() {
  const [count, setCount] = useAtom(countAtom);
  const [double] = useAtom(doubleAtom);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Jotai 示例</h2>
      <p className="text-sm text-zinc-600">最小心智模型：每个原子即状态源，组件按需订阅。</p>
      <div className="flex items-center gap-3">
        <button
          className="rounded bg-black px-3 py-1 text-white hover:bg-zinc-800"
          onClick={() => setCount((c) => c - 1)}
        >
          -1
        </button>
        <span className="min-w-24 text-center">计数：{count}</span>
        <button
          className="rounded bg-black px-3 py-1 text-white hover:bg-zinc-800"
          onClick={() => setCount((c) => c + 1)}
        >
          +1
        </button>
      </div>
      <div className="text-sm text-zinc-700">派生值（×2）：{double}</div>
    </div>
  );
}

