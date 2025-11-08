'use client';

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector, createJSONStorage, type PersistStorage, type PersistOptions } from 'zustand/middleware';
import { useEffect } from 'react';

interface MiddlewareState {
  active: boolean;
  count: number;
  logs: string[];
  toggleActive: () => void;
  increment: () => void;
  addLog: (text: string) => void;
}

type PersistedMiddleware = Pick<MiddlewareState, 'active' | 'count' | 'logs'>;

const storage: PersistStorage<PersistedMiddleware> | undefined =
  typeof window !== 'undefined'
    ? createJSONStorage<PersistedMiddleware>(() => window.localStorage)
    : undefined;

const middlewarePersistOptions: PersistOptions<MiddlewareState, PersistedMiddleware> = {
  name: 'zustand-step3',
  storage,
  partialize: (state) => ({
    active: state.active,
    count: state.count,
    logs: state.logs.slice(-5),
  }),
};

const useMiddlewareStore = create<MiddlewareState>()(
  subscribeWithSelector(
    devtools(
      persist(
        (set) => ({
          active: false,
          count: 0,
          logs: [],
          toggleActive: () =>
            set((state) => ({
              ...state,
              active: !state.active,
              logs: [...state.logs, `active → ${!state.active}`],
            })),
          increment: () =>
            set((state) => ({
              ...state,
              count: state.count + 1,
              logs: [...state.logs, `count ${state.count + 1}`],
            })),
          addLog: (text) => set((state) => ({ ...state, logs: [...state.logs, text] })),
        }),
        middlewarePersistOptions,
      ),
      { name: 'step3-middleware', enabled: true },
    ),
  ),
);

export default function Step3Middleware() {
  const active = useMiddlewareStore((state) => state.active);
  const count = useMiddlewareStore((state) => state.count);
  const logs = useMiddlewareStore((state) => state.logs);
  const toggleActive = useMiddlewareStore((state) => state.toggleActive);
  const increment = useMiddlewareStore((state) => state.increment);

  useEffect(() => {
    const unsub = useMiddlewareStore.subscribe(
      (state) => state.active,
      (next, prev) => {
        if (prev === undefined) return;
        useMiddlewareStore.getState().addLog(`active 由 ${prev} 变为 ${next}`);
      },
    );
    return () => unsub();
  }, []);

  const snapshot = useMiddlewareStore.getState();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Step 3 · 中间件 & 持久化</h2>
      <p className="text-zinc-600">show devtools/persist/subscriber</p>
      <section className="rounded-lg border bg-white p-6 space-y-4">
        <div className="flex gap-3">
          <button className="rounded border px-3 py-1" onClick={toggleActive}>
            toggle active
          </button>
          <button className="rounded border px-3 py-1" onClick={increment}>
            + count
          </button>
        </div>
        <div className="text-sm text-zinc-500">active: {String(active)} · count: {count}</div>
        <div>
          <p className="text-xs text-zinc-500">日志</p>
          <ul className="list-disc pl-5 text-xs text-zinc-600">
            {logs.map((entry, index) => (
              <li key={index}>{entry}</li>
            ))}
          </ul>
        </div>
        <pre className="rounded border bg-zinc-900/5 p-3 text-xs text-zinc-700">
          {JSON.stringify({ active: snapshot.active, count: snapshot.count }, null, 2)}
        </pre>
      </section>
    </div>
  );
}
