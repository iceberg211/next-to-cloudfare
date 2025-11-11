"use client";

import React, { Suspense } from "react";
import { atom, useAtom } from "jotai";

type Suggestion = { id: string; title: string };

// 异步原子返回 Promise，配合 Suspense 呈现加载态
const suggestionsAtom = atom<Promise<Suggestion[]>>(async () => {
  const res = await fetch(
    "https://jsonplaceholder.typicode.com/todos?_limit=5"
  );
  if (!res.ok) throw new Error("获取建议失败");
  const data: Array<{ id: number; title: string }> = await res.json();
  return data.map((d) => ({ id: String(d.id), title: d.title }));
});

export default function Step4Async() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Step 4 · 异步原子 + Suspense</h2>
      <p className="text-zinc-600">
        原子可直接返回 Promise。结合 Suspense 与错误边界表现加载/错误与重试。
      </p>
      <ErrorBoundary>
        <Suspense
          fallback={<div className="text-sm text-zinc-500">加载中...</div>}
        >
          <SuggestionList />
        </Suspense>
      </ErrorBoundary>
      <p className="text-xs text-zinc-500">
        刷新页面即可看到重新加载；也可扩展按钮触发刷新（set 同一异步 atom）。
      </p>
    </div>
  );
}

function SuggestionList() {
  const [list] = useAtom(suggestionsAtom);
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
      {list.map((s) => (
        <li key={s.id}>{s.title}</li>
      ))}
    </ul>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = {};
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="text-sm text-red-600">{this.state.error.message}</div>
      );
    }
    return this.props.children;
  }
}
