"use client";

import { atom, useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";

const countAtom = atom(0);
const incAtom = atom(null, (_get, set) => void set(countAtom, (c) => c + 1));
const decAtom = atom(null, (_get, set) => void set(countAtom, (c) => c - 1));

// selectAtom：精准订阅 countAtom 的投影值
const doubleAtom = selectAtom(countAtom, (c) => c * 2);
const parityAtom = selectAtom(countAtom, (c) =>
  c % 2 === 0 ? "偶数" : "奇数"
);

export default function Step2Derived() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Step 2 · 派生与精确订阅</h2>
      <p className="text-zinc-600">
        使用 selectAtom 从基础原子投影出派生值，仅在依赖变化时重算。
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <Control />
        <DerivedPanel />
      </div>
    </div>
  );
}

function Control() {
  const count = useAtomValue(countAtom);
  const inc = useAtomValue(incAtom) as unknown as () => void;
  const dec = useAtomValue(decAtom) as unknown as () => void;
  return (
    <section className="rounded-lg border bg-white p-4 space-y-3">
      <h3 className="font-medium">改变基础原子</h3>
      <div className="flex items-center gap-3">
        <button className="rounded border px-3 py-1" onClick={dec}>
          -1
        </button>
        <span className="text-xl font-semibold">{count}</span>
        <button className="rounded border px-3 py-1" onClick={inc}>
          +1
        </button>
      </div>
      <p className="text-xs text-zinc-500">
        左侧更新 countAtom，右侧派生面板仅在需要时更新。
      </p>
    </section>
  );
}

function DerivedPanel() {
  const double = useAtomValue(doubleAtom);
  const parity = useAtomValue(parityAtom);
  return (
    <section className="rounded-lg border bg-white p-4 space-y-2">
      <h3 className="font-medium">派生值</h3>
      <div>×2：{double}</div>
      <div>奇偶：{parity}</div>
      <p className="text-xs text-zinc-500">
        selectAtom 只订阅 countAtom 的投影值，避免无关渲染。
      </p>
    </section>
  );
}
