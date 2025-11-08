'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useEffect, useMemo, useState } from 'react';

type Item = { id: string; title: string; done: boolean };

interface SelectorState {
  items: Item[];
  toggle: (id: string) => void;
  add: (title: string) => void;
}

const randomId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

const useSelectorStore = create<SelectorState>()(
  subscribeWithSelector((set, get) => ({
    items: [
      { id: 'a', title: '阅读官方文档', done: true },
      { id: 'b', title: '理解 selectors', done: false },
      { id: 'c', title: '练习 subscribeWithSelector', done: false },
    ],
    toggle: (id) =>
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
      })),
    add: (title) =>
      set((state) => ({
        items: [...state.items, { id: randomId(), title, done: false }],
      })),
  })),
);

export default function Step2Selectors() {
  const [log, setLog] = useState<string[]>([]);
  const total = useSelectorStore((state) => state.items.length);
  const completed = useSelectorStore((state) => state.items.filter((item) => item.done).length);
  const ratio = useMemo(() => (total === 0 ? '0%' : `${Math.round((completed / total) * 100)}%`), [total, completed]);

  useEffect(() => {
    const unsubscribe = useSelectorStore.subscribe<Item[]>(
      (state) => state.items,
      (items, prev) => {
        if (!prev) return;
        setLog((prevLog) => [`items 变化：${items.length} → ${prev.length}`, ...prevLog].slice(0, 4));
      },
    );
    return unsubscribe;
  }, []);

  const addItem = (title: string) => {
    useSelectorStore.getState().add(title);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Step 2 · 选择器与订阅</h2>
      <p className="text-zinc-600">通过 useStore 传入 selector 只订阅部分状态，并使用 subscribeWithSelector 监听特定字段。</p>
      <section className="rounded-lg border bg-white p-6 space-y-4">
        <div className="text-sm">总任务：{total} · 已完成：{completed} · 完成率：{ratio}</div>
        <div className="flex gap-2">
          <button className="rounded border px-3 py-1" onClick={() => useSelectorStore.getState().toggle('a')}>切换第一项</button>
          <button className="rounded border px-3 py-1" onClick={() => addItem('新任务 ' + Date.now())}>新增任务</button>
        </div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-600">
          {log.map((entry, index) => (
            <li key={index}>{entry}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
