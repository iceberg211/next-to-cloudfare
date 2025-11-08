"use client";

import { atom, useAtom } from "jotai";

const counterAtom = atom(0);
const textAtom = atom("你好，Jotai");

export default function Step1Basics() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Step 1 · 基础原子</h2>
      <p className="text-zinc-600">
        原子就是最小状态源，组件通过 useAtom 订阅并更新。
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <CounterCard />
        <TextCard />
      </div>
      <p className="text-xs text-zinc-500">
        同时打开两个卡片，操作它们会在订阅同一 atom 的组件间同步生效。
      </p>
    </div>
  );
}

function CounterCard() {
  const [count, setCount] = useAtom(counterAtom);
  return (
    <section className="rounded-lg border bg-white p-4 space-y-3">
      <h3 className="font-medium">计数器（共享原子）</h3>
      <div className="flex items-center gap-3 text-xl">
        <button
          className="rounded border px-3 py-1"
          onClick={() => setCount((c) => c - 1)}
        >
          -1
        </button>
        <span>{count}</span>
        <button
          className="rounded border px-3 py-1"
          onClick={() => setCount((c) => c + 1)}
        >
          +1
        </button>
      </div>
    </section>
  );
}

function TextCard() {
  const [text, setText] = useAtom(textAtom);
  return (
    <section className="rounded-lg border bg-white p-4 space-y-3">
      <h3 className="font-medium">文本（共享原子）</h3>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full rounded border px-3 py-2"
      />
      <div className="text-sm text-zinc-600">实时：{text}</div>
    </section>
  );
}
