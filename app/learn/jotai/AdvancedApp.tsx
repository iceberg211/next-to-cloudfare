"use client";
// 一个可复用的高级 Jotai 应用组件，展示：
// - 多 store（通过 Provider 的 store 属性传入）
// - 原子工厂（createTodoAtoms）
// - 拆分原子（splitAtom）与细粒度渲染
// - selectAtom 精准订阅
// - 异步原子 + Suspense
// - useAtomCallback 进行事务式读写

import { Suspense, useCallback, useMemo, useState } from "react";
import { PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import type { Store } from "jotai/vanilla/store";
import {
  createTodoAtoms,
  type Todo,
  type Filter,
  type TodoAtoms,
} from "./todoAtoms";

// 顶层应用：接收一组原子（由工厂创建）与可选的 store（用于演示从外部直接操作 store）
export function TodoApp({
  atoms,
  storeLabel,
  store,
}: {
  atoms: TodoAtoms;
  storeLabel: string;
  store?: Store;
}) {
  const stats = useAtomValue(atoms.statsAtom);
  const [filter, setFilter] = useAtom(atoms.filterAtom);
  const add = useSetAtom(atoms.addTodoAtom);
  const clearCompleted = useSetAtom(atoms.clearCompletedAtom);
  const toggleAll = useSetAtom(atoms.toggleAllAtom);

  // useAtomCallback：将“建议任务”导入为正式任务（去重）
  const importSuggestions = useAtomCallback(
    useCallback(
      async (get, set) => {
        const current = get(atoms.todosAtom);
        const suggestions = await get(atoms.suggestedTodosAtom);
        const existingIds = new Set(current.map((t) => t.id));
        const merged = [
          ...current,
          ...suggestions.filter((s) => !existingIds.has(s.id)),
        ];
        set(atoms.todosAtom, merged);
        return merged.length - current.length; // 返回导入数量
      },
      [atoms]
    )
  );

  const [text, setText] = useState("");

  return (
    <div className="rounded-lg border bg-white p-4 space-y-4">
      <header className="flex items-center justify-between">
        <div className="font-medium">{storeLabel}</div>
        <div className="text-sm text-zinc-600">
          共 {stats.total} 项 · 未完成 {stats.active} · 已完成 {stats.completed}
        </div>
      </header>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              add(text);
              setText("");
            }
          }}
          placeholder="输入待办事项后回车"
          className="flex-1 rounded border px-3 py-2"
        />
        <button
          onClick={() => {
            add(text);
            setText("");
          }}
          className="rounded bg-black px-3 py-2 text-white hover:bg-zinc-800"
        >
          新增
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2 text-sm">
          <FilterBtn
            current={filter}
            value="all"
            onClick={() => setFilter("all")}
          >
            全部
          </FilterBtn>
          <FilterBtn
            current={filter}
            value="active"
            onClick={() => setFilter("active")}
          >
            未完成
          </FilterBtn>
          <FilterBtn
            current={filter}
            value="completed"
            onClick={() => setFilter("completed")}
          >
            已完成
          </FilterBtn>
        </div>
        <div className="flex gap-2 text-sm">
          <button
            className="rounded border px-2 py-1"
            onClick={() => toggleAll(true)}
          >
            全部完成
          </button>
          <button
            className="rounded border px-2 py-1"
            onClick={() => toggleAll(false)}
          >
            取消全选
          </button>
          <button
            className="rounded border px-2 py-1"
            onClick={() => clearCompleted()}
          >
            清除已完成
          </button>
        </div>
      </div>

      <TodoList atoms={atoms} filter={filter} />

      <section className="space-y-2">
        <h3 className="font-medium">建议任务（异步原子 + Suspense）</h3>
        <Suspense
          fallback={<div className="text-sm text-zinc-600">建议加载中...</div>}
        >
          <Suggestions
            atoms={atoms}
            onImport={async () => {
              const n = await importSuggestions();
              alert(`已导入 ${n} 条建议`);
            }}
          />
        </Suspense>
      </section>

      {store && (
        <section className="space-y-2 border-t pt-3">
          <h3 className="font-medium">Store 直接操作（示例）</h3>
          <div className="flex gap-2 text-sm">
            <button
              className="rounded border px-2 py-1"
              onClick={() => store.set(atoms.todosAtom, [])}
            >
              清空（store.set）
            </button>
            <button
              className="rounded border px-2 py-1"
              onClick={() => {
                const sample: Todo[] = Array.from({ length: 3 }).map(
                  (_, i) => ({
                    id: `seed-${i}-${Date.now()}`,
                    title: `示例任务 ${i + 1}`,
                    completed: i % 2 === 0,
                    createdAt: Date.now(),
                  })
                );
                store.set(atoms.todosAtom, sample);
              }}
            >
              生成示例数据
            </button>
          </div>
          <p className="text-xs text-zinc-600">
            以上按钮直接通过 store 操作原子，不依赖 React 组件生命周期。
          </p>
        </section>
      )}
    </div>
  );
}

function FilterBtn({
  current,
  value,
  onClick,
  children,
}: {
  current: Filter;
  value: Filter;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const active = current === value;
  return (
    <button
      onClick={onClick}
      className={
        "rounded px-2 py-1 border " +
        (active ? "bg-black text-white border-black" : "bg-white")
      }
    >
      {children}
    </button>
  );
}

function TodoList({ atoms, filter }: { atoms: TodoAtoms; filter: Filter }) {
  const [itemAtoms] = useAtom(atoms.todoAtomsAtom);
  return (
    <ul className="space-y-2">
      {itemAtoms.map((a, i) => (
        <TodoItem key={i} atom={a} filter={filter} atoms={atoms} />
      ))}
    </ul>
  );
}

function TodoItem({
  atom: itemAtom,
  filter,
  atoms,
}: {
  atom: PrimitiveAtom<Todo>;
  filter: Filter;
  atoms: TodoAtoms;
}) {
  const [todo, setTodo] = useAtom(itemAtom);
  const remove = useSetAtom(atoms.removeTodoAtom);

  // 基于 filter 的显示控制
  const visible =
    filter === "all" ||
    (filter === "active" && !todo.completed) ||
    (filter === "completed" && todo.completed);
  if (!visible) return null;

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);

  return (
    <li className="rounded border p-3 flex items-center gap-3">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => setTodo((t) => ({ ...t, completed: !t.completed }))}
      />
      {editing ? (
        <input
          className="flex-1 rounded border px-2 py-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setTodo((t) => ({ ...t, title: title.trim() || t.title }));
              setEditing(false);
            }
            if (e.key === "Escape") {
              setTitle(todo.title);
              setEditing(false);
            }
          }}
        />
      ) : (
        <div className="flex-1">
          <div className={todo.completed ? "line-through text-zinc-500" : ""}>
            {todo.title}
          </div>
          <div className="text-xs text-zinc-500">
            {new Date(todo.createdAt).toLocaleString()}
          </div>
        </div>
      )}
      <div className="flex gap-2 text-sm">
        <button
          className="rounded border px-2 py-1"
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? "保存" : "编辑"}
        </button>
        <button
          className="rounded border px-2 py-1"
          onClick={() => remove(todo.id)}
        >
          删除
        </button>
      </div>
    </li>
  );
}

function Suggestions({
  atoms,
  onImport,
}: {
  atoms: TodoAtoms;
  onImport: () => Promise<void>;
}) {
  const [list] = useAtom(atoms.suggestedTodosAtom);
  return (
    <div className="rounded border p-3 space-y-2">
      <div className="text-sm text-zinc-600">
        来自远端接口的建议任务（只读）：
      </div>
      <ul className="space-y-1">
        {list.map((s) => (
          <li key={s.id} className="text-sm text-zinc-700">
            • {s.title}
          </li>
        ))}
      </ul>
      <button
        className="rounded bg-black px-3 py-1 text-white hover:bg-zinc-800"
        onClick={onImport}
      >
        导入到当前列表
      </button>
    </div>
  );
}

// 小型帮助函数：在页面中快速创建“稳定的原子集合”
export function useTodoAtomsMemo(namespace?: string) {
  return useMemo(() => createTodoAtoms(namespace), [namespace]);
}
