'use client';

// 复杂示例的原子工厂：可创建“持久化版”或“内存版”的一组原子
// 通过传入 namespace 来区分不同工作区在 localStorage 中的键，避免相互干扰

import { atom } from 'jotai';
import {
  atomWithStorage,
  selectAtom,
  splitAtom,
} from 'jotai/utils';

export type Filter = 'all' | 'active' | 'completed';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

// 注意：不显式书写 TodoAtoms 中每个原子的复杂类型，
// 直接用 ReturnType<typeof createTodoAtoms> 作为导出类型，减少类型维护成本。

// 创建一组 Todo 原子：当提供 namespace 时使用本地持久化；未提供时仅内存保存
export function createTodoAtoms(namespace?: string) {
  // 1) 任务列表：支持本地持久化或内存
  const todosAtom = namespace
    ? atomWithStorage<Todo[]>(`jotai:${namespace}:todos`, [])
    : atom<Todo[]>([]);

  // 2) 过滤器（全部/未完成/已完成）
  const filterAtom = atom<Filter>('all');

  // 3) 统计信息（使用 selectAtom 精准订阅，避免无关重渲染）
  const statsAtom = selectAtom(
    todosAtom,
    (todos) => {
      const completed = todos.filter((t) => t.completed).length;
      const active = todos.length - completed;
      return { total: todos.length, active, completed };
    },
    (a, b) => a.total === b.total && a.active === b.active && a.completed === b.completed,
  );

  // 4) 将数组原子拆分成“项原子”列表，细粒度渲染
  const todoAtomsAtom = splitAtom(todosAtom);

  // 5) 写入原子：新增/删除/切换/重命名/清理/全选
  const addTodoAtom = atom(null, (get, set, title: string) => {
    const text = title.trim();
    if (!text) return;
    const newTodo: Todo = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: text,
      completed: false,
      createdAt: Date.now(),
    };
    set(todosAtom, [...get(todosAtom), newTodo]);
  });

  const removeTodoAtom = atom(null, (get, set, id: string) => {
    set(
      todosAtom,
      get(todosAtom).filter((t) => t.id !== id),
    );
  });

  const toggleTodoAtom = atom(null, (get, set, id: string) => {
    set(
      todosAtom,
      get(todosAtom).map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  });

  const renameTodoAtom = atom(null, (get, set, { id, title }: { id: string; title: string }) => {
    set(
      todosAtom,
      get(todosAtom).map((t) => (t.id === id ? { ...t, title } : t)),
    );
  });

  const clearCompletedAtom = atom(null, (get, set) => {
    set(
      todosAtom,
      get(todosAtom).filter((t) => !t.completed),
    );
  });

  const toggleAllAtom = atom(null, (get, set, completed: boolean) => {
    set(
      todosAtom,
      get(todosAtom).map((t) => ({ ...t, completed })),
    );
  });

  // 6) 异步原子：拉取建议任务（配合 <Suspense>）
  const suggestedTodosAtom = atom<Promise<Todo[]>>(async () => {
    const res = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');
    if (!res.ok) throw new Error('获取建议任务失败');
    const raw: Array<{ id: number; title: string; completed: boolean }> = await res.json();
    return raw.map((r) => ({
      id: `s-${r.id}`,
      title: r.title,
      completed: r.completed,
      createdAt: Date.now(),
    }));
  });

  return {
    todosAtom,
    filterAtom,
    statsAtom,
    todoAtomsAtom,
    addTodoAtom,
    removeTodoAtom,
    toggleTodoAtom,
    renameTodoAtom,
    clearCompletedAtom,
    toggleAllAtom,
    suggestedTodosAtom,
  } as const;
}

// 为外部引用提供更简洁的类型别名
export type TodoAtoms = ReturnType<typeof createTodoAtoms>;
