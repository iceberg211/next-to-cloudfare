'use client';

import { useQuery } from '@tanstack/react-query';

type Todo = { id: number; title: string; completed: boolean };

async function fetchTodos(): Promise<Todo[]> {
  // 简单演示：请求公开 API（也可替换成你自己的 /api 路由）
  const res = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');
  if (!res.ok) throw new Error('请求失败');
  return res.json();
}

export default function ReactQueryDemo() {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    // 演示效果：进入页面立即请求
    staleTime: 1000 * 30,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">React Query 示例</h2>
      <p className="text-sm text-zinc-600">展示加载/错误/完成三态与缓存效果。</p>
      <div>
        <button
          className="rounded bg-black px-3 py-1 text-white hover:bg-zinc-800"
          onClick={() => refetch()}
        >
          手动重新请求
        </button>
      </div>
      {isPending && <p>加载中...</p>}
      {error && <p className="text-red-600">{String(error)}</p>}
      {data && (
        <ul className="space-y-2">
          {data.map((t) => (
            <li key={t.id} className="rounded border bg-white p-3">
              <div className="font-medium">{t.title}</div>
              <div className="text-xs text-zinc-600">完成状态：{t.completed ? '已完成' : '未完成'}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

