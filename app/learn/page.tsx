import Link from "next/link";

export default function LearnIndex() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">选择一个库开始学习</h2>
      <p className="text-zinc-600">以下页面彼此独立，分别展示 React Query、Jotai、Recoil 的最小可运行示例与关键概念。</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/learn/react-query" className="rounded-lg border bg-white p-4 hover:shadow">
          <h3 className="font-medium">React Query</h3>
          <p className="text-sm text-zinc-600 mt-1">请求状态、缓存与重复请求去重</p>
        </Link>
        <Link href="/learn/jotai" className="rounded-lg border bg-white p-4 hover:shadow">
          <h3 className="font-medium">Jotai</h3>
          <p className="text-sm text-zinc-600 mt-1">原子化状态、派生原子与简洁心智模型</p>
        </Link>
        <Link href="/learn/recoil" className="rounded-lg border bg-white p-4 hover:shadow">
          <h3 className="font-medium">Recoil</h3>
          <p className="text-sm text-zinc-600 mt-1">Atom/Selector 与依赖图</p>
        </Link>
      </div>
    </div>
  );
}

