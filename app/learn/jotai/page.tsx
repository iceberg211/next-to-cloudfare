"use client";

// 高级 Jotai 学习页：
// - 展示两个并列的工作区（A：持久化；B：内存）
// - 每个工作区都使用自定义 store + 独立 Provider
// - 相同的 UI 通过“原子工厂”创建的不同原子集合来复用

import { Provider, createStore } from "jotai";
import { useMemo } from "react";
import { TodoApp, useTodoAtomsMemo } from "./AdvancedApp";

export default function JotaiAdvancedPage() {
  // 创建两个独立 store（互不影响）
  const storeA = useMemo(() => createStore(), []);
  const storeB = useMemo(() => createStore(), []);

  // 为不同工作区创建“原子集合”：
  // A 使用 namespace 以启用 localStorage 持久化；B 不传 namespace，仅内存保存
  const atomsA = useTodoAtomsMemo("workspace-A");
  const atomsB = useTodoAtomsMemo();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Jotai 复杂应用示例</h2>
      <p className="text-zinc-600">
        本页演示 Jotai 的
        Provider/Store、派生原子、精确订阅（selectAtom）、数组拆分（splitAtom）、
        异步原子 + Suspense、以及从 store 外部直接操作原子等特性。
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 工作区 A：持久化 + 自定义 Store */}
        <Provider store={storeA}>
          <TodoApp
            atoms={atomsA}
            storeLabel="工作区 A（本地持久化）"
            store={storeA}
          />
        </Provider>

        {/* 工作区 B：仅内存 + 自定义 Store */}
        <Provider store={storeB}>
          <TodoApp
            atoms={atomsB}
            storeLabel="工作区 B（仅内存）"
            store={storeB}
          />
        </Provider>
      </div>

      <div className="text-xs text-zinc-500">
        提示：两个工作区的状态相互隔离；A 的数据刷新后仍会保留（使用
        localStorage），B 则不会。
      </div>
    </div>
  );
}
