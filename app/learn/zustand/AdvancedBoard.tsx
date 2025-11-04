'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Project,
  Task,
  TaskFilter,
  SortMode,
  TaskStatus,
  selectStats,
  selectVisibleTasks,
  taskStoreApi,
  useTaskStore,
} from './store';

const STATUS_OPTIONS: Array<{ value: TaskFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'todo', label: '待办' },
  { value: 'doing', label: '进行中' },
  { value: 'done', label: '已完成' },
];

const SORT_OPTIONS: Array<{ value: SortMode; label: string }> = [
  { value: 'priority', label: '按优先级(点数)' },
  { value: 'due', label: '按截止日期' },
  { value: 'alphabetical', label: '按标题' },
];

interface TaskDraft {
  title: string;
  points: number;
  due: string;
  tags: string;
  projectId: string;
  status: TaskStatus;
}

type LogEntry = { message: string; time: string };

export function AdvancedZustandBoard() {
  const projects = useTaskStore((state) => state.projects);
  const [activeProjectId, setActiveProjectId] = useTaskStore(
    (state) => [state.activeProjectId, state.setActiveProjectId] as const,
  );
  const [filter, setFilter] = useTaskStore((state) => [state.filter, state.setFilter] as const);
  const [keyword, setKeyword] = useTaskStore((state) => [state.keyword, state.setKeyword] as const);
  const [sortMode, setSortMode] = useTaskStore((state) => [state.sortMode, state.setSortMode] as const);
  const { addTask, updateTask, removeTask, markAllDone, archiveDone, importSuggestions } = useTaskStore(
    (state) => ({
      addTask: state.addTask,
      updateTask: state.updateTask,
      removeTask: state.removeTask,
      markAllDone: state.markAllDone,
      archiveDone: state.archiveDone,
      importSuggestions: state.importSuggestions,
    }),
  );
  const { autoSync, showStatsPanel } = useTaskStore((state) => state.settings);
  const toggleAutoSync = useTaskStore((state) => state.toggleAutoSync);
  const toggleStatsPanel = useTaskStore((state) => state.toggleStatsPanel);

  const stats = useTaskStore(selectStats);
  const visibleTasks = useTaskStore(selectVisibleTasks);

  const [draft, setDraft] = useState<TaskDraft>(() => ({
    title: '',
    points: 5,
    due: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    tags: '探索,高优先级',
    projectId: activeProjectId,
    status: 'todo',
  }));

  const [logs, setLogs] = useState<LogEntry[]>([]);

  // 监听可见任务数量变化，展示 subscribeWithSelector 的威力
  useEffect(() => {
    const unsubscribe = taskStoreApi.subscribe((state, previous) => {
      if (!previous) return;
      const nextTotal = selectVisibleTasks(state).length;
      const prevTotal = selectVisibleTasks(previous).length;
      if (nextTotal === prevTotal && state.filter === previous.filter) return;
      const time = new Date().toLocaleTimeString();
      const message = `可见任务从 ${prevTotal} 改为 ${nextTotal}（过滤: ${previous.filter} → ${state.filter}）`;
      setLogs((prev) => [{ message, time }, ...prev].slice(0, 6));
    });
    return () => unsubscribe();
  }, []);

  // 自动同步示例：开启后定时拉取建议任务
  useEffect(() => {
    if (!autoSync) return;
    const timer = setInterval(() => {
      void fetchSuggestionsAndImport(activeProjectId, importSuggestions);
    }, 15000);
    return () => clearInterval(timer);
  }, [autoSync, activeProjectId, importSuggestions]);

  useEffect(() => {
    setDraft((prev) => ({ ...prev, projectId: activeProjectId }));
  }, [activeProjectId]);

  const suggestionState = useSuggestions(activeProjectId);

  const projectLookup = useMemo(() => Object.fromEntries(projects.map((project) => [project.id, project])), [projects]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Zustand 项目看板</h2>
          <p className="text-sm text-zinc-600">演示多切片 Store、Immer 更新、持久化、中间件与订阅选择器等高级特性。</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <button className="rounded border px-3 py-1" onClick={toggleStatsPanel}>
            {showStatsPanel ? '隐藏统计' : '显示统计'}
          </button>
          <button className="rounded border px-3 py-1" onClick={toggleAutoSync}>
            {autoSync ? '关闭自动建议' : '开启自动建议'}
          </button>
        </div>
      </header>

      <section className="rounded-lg border bg-white p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {projects.map((project) => (
            <ProjectPill
              key={project.id}
              project={project}
              active={project.id === activeProjectId}
              onClick={() => setActiveProjectId(project.id)}
            />
          ))}
        </div>
        {showStatsPanel && <StatsPanel stats={stats} />}
      </section>

      <section className="rounded-lg border bg-white p-4 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={
                  'rounded-full px-3 py-1 text-sm border transition ' +
                  (filter === option.value ? 'bg-black text-white border-black' : 'hover:border-zinc-400')
                }
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <button className="rounded border px-2 py-1" onClick={() => markAllDone(activeProjectId)}>
              全部标记完成
            </button>
            <button className="rounded border px-2 py-1" onClick={() => archiveDone(activeProjectId)}>
              归档已完成
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索标题或标签"
            className="w-full md:w-80 rounded border px-3 py-2"
          />
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            className="rounded border px-3 py-2 text-sm"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="space-y-3">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-semibold">任务列表</h3>
          <span className="text-xs text-zinc-500">updateTask/removeTask 均通过 Immer/subscribeWithSelector 驱动</span>
        </header>
        <div className="grid grid-cols-1 gap-3">
          {visibleTasks.length === 0 ? (
            <div className="rounded border border-dashed p-6 text-center text-sm text-zinc-500">
              当前筛选下暂无任务，试试新增或调整过滤条件。
            </div>
          ) : (
            visibleTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                projectColor={projectLookup[task.projectId]?.color ?? '#0ea5e9'}
                onStatusChange={(status) => updateTask(task.id, { status })}
                onPointsChange={(points) => updateTask(task.id, { points })}
                onRemove={() => removeTask(task.id)}
              />
            ))
          )}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4 space-y-4">
        <h3 className="text-lg font-semibold">新增任务（Immer 批量写入 + 动态项目）</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            标题
            <input
              value={draft.title}
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="例如：设计新的设置面板"
              className="rounded border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            点数
            <input
              type="number"
              min={1}
              max={20}
              value={draft.points}
              onChange={(event) => setDraft((prev) => ({ ...prev, points: Number(event.target.value) }))}
              className="rounded border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            截止日期
            <input
              type="date"
              value={draft.due}
              onChange={(event) => setDraft((prev) => ({ ...prev, due: event.target.value }))}
              className="rounded border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            标签（逗号或空格分隔）
            <input
              value={draft.tags}
              onChange={(event) => setDraft((prev) => ({ ...prev, tags: event.target.value }))}
              className="rounded border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            归属项目
            <select
              value={draft.projectId}
              onChange={(event) => setDraft((prev) => ({ ...prev, projectId: event.target.value }))}
              className="rounded border px-3 py-2"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            初始状态
            <select
              value={draft.status}
              onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value as TaskStatus }))}
              className="rounded border px-3 py-2"
            >
              <option value="todo">待办</option>
              <option value="doing">进行中</option>
              <option value="done">已完成</option>
            </select>
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="rounded border px-3 py-1 text-sm"
            onClick={() => setDraft((prev) => ({
              ...prev,
              title: '',
              points: 5,
              due: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
              tags: '探索,高优先级',
              projectId: activeProjectId,
              status: 'todo',
            }))}
          >
            重置
          </button>
          <button
            className="rounded bg-black px-4 py-2 text-white text-sm hover:bg-zinc-800"
            onClick={() => {
              const tags = draft.tags.split(/[，,\s]+/).map((item) => item.trim()).filter(Boolean);
              const id = addTask({
                projectId: draft.projectId,
                title: draft.title,
                points: Math.max(1, draft.points),
                due: draft.due,
                tags,
                status: draft.status,
              });
              if (id) {
                setLogs((prev) => [{ message: `新建任务 ${id}`, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 6));
              }
              setDraft((prev) => ({ ...prev, title: '' }));
            }}
          >
            新增任务
          </button>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">建议任务（Fetch + importSuggestions）</h3>
          <button
            className="rounded border px-3 py-1 text-sm"
            onClick={() => void fetchSuggestionsAndImport(activeProjectId, importSuggestions)}
          >
            手动导入
          </button>
        </div>
        {suggestionState.status === 'loading' && <div className="text-sm text-zinc-500">加载中...</div>}
        {suggestionState.status === 'error' && (
          <div className="text-sm text-red-600">{suggestionState.error}</div>
        )}
        {suggestionState.status === 'success' && (
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-600">
            {suggestionState.data.map((item) => (
              <li key={item.id}>{item.title}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border bg-white p-4 space-y-2">
        <h3 className="text-sm font-medium text-zinc-600">订阅日志（subscribeWithSelector）</h3>
        {logs.length === 0 ? (
          <div className="text-xs text-zinc-400">暂无记录。</div>
        ) : (
          <ul className="space-y-1 text-xs text-zinc-500">
            {logs.map((entry, index) => (
              <li key={index}>{entry.time} — {entry.message}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ProjectPill({ project, active, onClick }: { project: Project; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        'rounded-full border px-4 py-1 text-sm transition ' +
        (active ? 'bg-black text-white border-black' : 'bg-white hover:border-zinc-400')
      }
    >
      {project.name}
    </button>
  );
}

function StatsPanel({ stats }: { stats: { total: number; todo: number; doing: number; done: number; points: number } }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <StatCard label="总任务" value={stats.total} />
      <StatCard label="待办" value={stats.todo} />
      <StatCard label="进行中" value={stats.doing} />
      <StatCard label="已完成" value={`${stats.done}（点数 ${stats.points}）`} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="text-sm text-zinc-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-zinc-900">{value}</div>
    </div>
  );
}

function TaskCard({
  task,
  projectColor,
  onStatusChange,
  onPointsChange,
  onRemove,
}: {
  task: Task;
  projectColor: string;
  onStatusChange: (status: TaskStatus) => void;
  onPointsChange: (points: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h4 className="text-lg font-semibold">{task.title}</h4>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <Tag color={projectColor}>项目 {task.projectId}</Tag>
            <Tag>点数 {task.points}</Tag>
            <Tag>截止 {task.due}</Tag>
            {task.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <select
            value={task.status}
            onChange={(event) => onStatusChange(event.target.value as TaskStatus)}
            className="rounded border px-2 py-1"
          >
            <option value="todo">待办</option>
            <option value="doing">进行中</option>
            <option value="done">已完成</option>
          </select>
          <button className="rounded border px-2 py-1" onClick={() => onPointsChange(Math.max(1, task.points - 1))}>
            - 点数
          </button>
          <button className="rounded border px-2 py-1" onClick={() => onPointsChange(task.points + 1)}>
            + 点数
          </button>
          <button className="rounded border px-2 py-1 text-red-600" onClick={onRemove}>
            删除
          </button>
        </div>
      </div>
    </div>
  );
}

function Tag({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2 py-0.5"
      style={{ borderColor: color ?? 'rgba(0,0,0,0.1)', color: color ? '#0f172a' : undefined }}
    >
      {children}
    </span>
  );
}

type SuggestionState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Task[] }
  | { status: 'error'; error: string };

function useSuggestions(projectId: string): SuggestionState {
  const [state, setState] = useState<SuggestionState>({ status: 'idle' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    fetchSuggestions(projectId)
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', error: error instanceof Error ? error.message : String(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return state;
}

async function fetchSuggestions(projectId: string): Promise<Task[]> {
  const res = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=4');
  if (!res.ok) throw new Error('获取建议任务失败');
  const data: Array<{ id: number; title: string }> = await res.json();
  return data.map((item, index) => ({
    id: `suggest-${projectId}-${item.id}`,
    projectId,
    title: item.title,
    status: (index % 2 === 0 ? 'todo' : 'doing') as TaskStatus,
    points: Math.max(1, (item.id % 8) + 1),
    due: new Date(Date.now() + (index + 2) * 86400000).toISOString().slice(0, 10),
    tags: ['建议'],
  }));
}

async function fetchSuggestionsAndImport(projectId: string, importSuggestions: (tasks: Task[]) => number) {
  try {
    const tasks = await fetchSuggestions(projectId);
    const added = importSuggestions(tasks);
    if (added === 0) {
      alert('没有新的建议任务');
    } else {
      alert(`已导入 ${added} 条建议任务`);
    }
  } catch (error) {
    alert(error instanceof Error ? error.message : '获取建议失败');
  }
}
