'use client';

import { atom, selector, useRecoilState, useRecoilValue } from 'recoil';

// Atom：最小状态单元
const countState = atom<number>({ key: 'countState', default: 0 });

// Selector：可缓存的派生计算
const doubleState = selector<number>({
  key: 'doubleState',
  get: ({ get }) => get(countState) * 2,
});

export default function RecoilDemo() {
  const [count, setCount] = useRecoilState(countState);
  const doubled = useRecoilValue(doubleState);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Recoil 示例</h2>
      <p className="text-sm text-zinc-600">Atom + Selector 组成依赖图，自动追踪订阅。</p>
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
      <div className="text-sm text-zinc-700">派生值（×2）：{doubled}</div>
    </div>
  );
}

