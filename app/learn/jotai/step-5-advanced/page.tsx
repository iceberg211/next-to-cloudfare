"use client";

import { createStore, Provider } from "jotai";
import { useMemo } from "react";
import { TodoApp, useTodoAtomsMemo } from "../..//jotai/AdvancedApp";

export default function Step5Advanced() {
  const storeA = useMemo(() => createStore(), []);
  const storeB = useMemo(() => createStore(), []);
  const atomsA = useTodoAtomsMemo("workspace-A");
  const atomsB = useTodoAtomsMemo();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">
        Step 5 · 高级工作区（多 Store / 持久化 / 异步）
      </h2>
      <p className="text-zinc-600">
        复用 Todo 原子工厂并在两个 Provider 中并列运行：A 启用 localStorage
        持久化，B 保持内存。内含 selectAtom、 splitAtom、异步原子与
        useAtomCallback 的组合示例，以及从 store 外部直接写入状态的操作区。
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <Provider store={storeA}>
          <TodoApp
            atoms={atomsA}
            storeLabel="工作区 A（持久化）"
            store={storeA}
          />
        </Provider>
        <Provider store={storeB}>
          <TodoApp
            atoms={atomsB}
            storeLabel="工作区 B（仅内存）"
            store={storeB}
          />
        </Provider>
      </div>
      <p className="text-xs text-zinc-500">
        你可以在操作区清空或生成示例数据，观察双工作区互不影响。
      </p>
    </div>
  );
}
