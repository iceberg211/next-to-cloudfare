'use client';

import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import { devtools, persist, subscribeWithSelector, createJSONStorage, type PersistOptions } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type TaskStatus = 'todo' | 'doing' | 'done';
export type TaskFilter = 'all' | TaskStatus;
export type SortMode = 'priority' | 'due' | 'alphabetical';

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  points: number;
  due: string;
  tags: string[];
}

type Settings = {
  autoSync: boolean;
  showStatsPanel: boolean;
};

interface ProjectSlice {
  projects: Project[];
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  addProject: (project: Project) => void;
}

interface TaskSlice {
  tasks: Record<string, Task>;
  taskIdsByProject: Record<string, string[]>;
  filter: TaskFilter;
  keyword: string;
  sortMode: SortMode;
  setFilter: (filter: TaskFilter) => void;
  setKeyword: (keyword: string) => void;
  setSortMode: (mode: SortMode) => void;
  addTask: (task: Omit<Task, 'id'> & { id?: string }) => string;
  updateTask: (id: string, patch: Partial<Omit<Task, 'id'>>) => void;
  removeTask: (id: string) => void;
  markAllDone: (projectId?: string) => void;
  archiveDone: (projectId?: string) => void;
  importSuggestions: (tasks: Task[]) => number;
}

interface PreferenceSlice {
  settings: Settings;
  toggleAutoSync: () => void;
  toggleStatsPanel: () => void;
}

export type TaskStore = ProjectSlice & TaskSlice & PreferenceSlice;

const initialProjects: Project[] = [
  { id: 'p-frontend', name: '前端重构', color: '#2563eb' },
  { id: 'p-marketing', name: '市场活动', color: '#f97316' },
  { id: 'p-infra', name: '基础设施', color: '#16a34a' },
];

const initialTasks: Task[] = [
  {
    id: 't-hero-landing',
    projectId: 'p-frontend',
    title: '重写 Hero 模块以适配深色模式',
    status: 'doing',
    points: 5,
    due: '2025-11-12',
    tags: ['UI', '可访问性'],
  },
  {
    id: 't-form-validate',
    projectId: 'p-frontend',
    title: '统一表单验证逻辑并补齐单元测试',
    status: 'todo',
    points: 8,
    due: '2025-11-18',
    tags: ['表单', '测试'],
  },
  {
    id: 't-campaign-assets',
    projectId: 'p-marketing',
    title: '设计黑五活动社媒素材',
    status: 'doing',
    points: 3,
    due: '2025-11-06',
    tags: ['设计'],
  },
  {
    id: 't-email-flow',
    projectId: 'p-marketing',
    title: '新的欢迎邮件自动化流程',
    status: 'todo',
    points: 5,
    due: '2025-11-15',
    tags: ['自动化'],
  },
  {
    id: 't-monitoring',
    projectId: 'p-infra',
    title: '为边缘节点接入新的可观测平台',
    status: 'doing',
    points: 13,
    due: '2025-11-20',
    tags: ['DevOps'],
  },
  {
    id: 't-bump-runtime',
    projectId: 'p-infra',
    title: '升级 runtime 并压测回归',
    status: 'todo',
    points: 8,
    due: '2025-11-25',
    tags: ['平台'],
  },
];

const initialTaskMap = initialTasks.reduce<Record<string, Task>>((acc, task) => {
  acc[task.id] = task;
  return acc;
}, {});

const initialTaskIdsByProject = initialProjects.reduce<Record<string, string[]>>((acc, project) => {
  acc[project.id] = initialTasks.filter((task) => task.projectId === project.id).map((task) => task.id);
  return acc;
}, {});

type PersistedState = Pick<
  TaskStore,
  'tasks' | 'taskIdsByProject' | 'activeProjectId' | 'filter' | 'keyword' | 'sortMode' | 'settings'
>;

const storage = typeof window !== 'undefined'
  ? createJSONStorage<PersistedState>(() => window.localStorage)
  : undefined;

const persistOptions: PersistOptions<TaskStore, PersistedState> = {
  name: 'zustand:task-board',
  version: 1,
  storage,
  partialize: (state) => ({
    tasks: state.tasks,
    taskIdsByProject: state.taskIdsByProject,
    activeProjectId: state.activeProjectId,
    filter: state.filter,
    keyword: state.keyword,
    sortMode: state.sortMode,
    settings: state.settings,
  }),
};

const taskStore = createStore<TaskStore>()(
  subscribeWithSelector(
    devtools(
      persist(
        immer<TaskStore>((set, get) => ({
          projects: initialProjects,
          activeProjectId: initialProjects[0]?.id ?? 'p-frontend',
          setActiveProjectId: (id) => set((state) => {
            state.activeProjectId = id;
          }),
          addProject: (project) =>
            set((state) => {
              if (state.projects.some((item: Project) => item.id === project.id)) return;
              state.projects.push(project);
              state.taskIdsByProject[project.id] = state.taskIdsByProject[project.id] ?? [];
            }),

          tasks: initialTaskMap,
          taskIdsByProject: initialTaskIdsByProject,
          filter: 'all',
          keyword: '',
          sortMode: 'priority',
          setFilter: (filter) => set((state) => {
            state.filter = filter;
          }),
          setKeyword: (keyword) => set((state) => {
            state.keyword = keyword;
          }),
          setSortMode: (mode) => set((state) => {
            state.sortMode = mode;
          }),
          addTask: (task) => {
            const id = task.id ?? `task-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 6)}`;
            const full: Task = { ...task, id };
            set((state) => {
              state.tasks[id] = full;
              const bucket = state.taskIdsByProject[full.projectId] ?? (state.taskIdsByProject[full.projectId] = []);
              bucket.push(id);
            });
            return id;
          },
          updateTask: (id, patch) =>
            set((state) => {
              const task = state.tasks[id];
              if (!task) return;
              Object.assign(task, patch);
            }),
          removeTask: (id) =>
            set((state) => {
              const task = state.tasks[id];
              if (!task) return;
              delete state.tasks[id];
              state.taskIdsByProject[task.projectId] = (state.taskIdsByProject[task.projectId] ?? []).filter(
                (taskId: string) => taskId !== id,
              );
            }),
          markAllDone: (projectId) =>
            set((state) => {
              const targetProject = projectId ?? state.activeProjectId;
              const ids = state.taskIdsByProject[targetProject] ?? [];
              ids.forEach((taskId: string) => {
                const task = state.tasks[taskId];
                if (task) {
                  task.status = 'done';
                }
              });
            }),
          archiveDone: (projectId) =>
            set((state) => {
              const targetProject = projectId ?? state.activeProjectId;
              const ids = state.taskIdsByProject[targetProject] ?? [];
              state.taskIdsByProject[targetProject] = ids.filter((taskId: string) => {
                const task = state.tasks[taskId];
                if (task?.status === 'done') {
                  delete state.tasks[taskId];
                  return false;
                }
                return true;
              });
            }),
          importSuggestions: (tasks) => {
            let added = 0;
            set((state) => {
              tasks.forEach((task: Task) => {
                if (state.tasks[task.id]) return;
                state.tasks[task.id] = task;
                const bucket = state.taskIdsByProject[task.projectId] ?? (state.taskIdsByProject[task.projectId] = []);
                bucket.push(task.id);
                added += 1;
              });
            });
            return added;
          },

          settings: {
            autoSync: false,
            showStatsPanel: true,
          },
          toggleAutoSync: () =>
            set((state) => {
              state.settings.autoSync = !state.settings.autoSync;
            }),
          toggleStatsPanel: () =>
            set((state) => {
              state.settings.showStatsPanel = !state.settings.showStatsPanel;
            }),
        })),
        persistOptions,
      ),
      { name: 'zustand-task-board' },
    ),
  ),
);

export const taskStoreApi = taskStore;

export const useTaskStore = <T>(selector: (state: TaskStore) => T) => useStore(taskStore, selector);

const normalizeText = (value: string) => value.trim().toLowerCase();

export const selectProjectById = (projectId: string) => (state: TaskStore) =>
  state.projects.find((project) => project.id === projectId);

export const selectProjectColor = (projectId: string) =>
  (state: TaskStore) => selectProjectById(projectId)(state)?.color ?? '#0ea5e9';

export const selectStats = (state: TaskStore) => {
  const projectId = state.activeProjectId;
  const ids = state.taskIdsByProject[projectId] ?? [];
  let total = 0;
  let todo = 0;
  let doing = 0;
  let done = 0;
  let points = 0;
  ids.forEach((id) => {
    const task = state.tasks[id];
    if (!task) return;
    total += 1;
    points += task.points;
    if (task.status === 'todo') todo += 1;
    else if (task.status === 'doing') doing += 1;
    else if (task.status === 'done') done += 1;
  });
  return { total, todo, doing, done, points };
};

export const selectVisibleTasks = (state: TaskStore) => {
  const projectId = state.activeProjectId;
  const ids = state.taskIdsByProject[projectId] ?? [];
  const keyword = normalizeText(state.keyword);
  const filtered = ids
    .map((id) => state.tasks[id])
    .filter((task): task is Task => Boolean(task))
    .filter((task) => {
      const matchFilter = state.filter === 'all' ? true : task.status === state.filter;
      const matchKeyword = keyword
        ? task.title.toLowerCase().includes(keyword) || task.tags.some((tag) => normalizeText(tag).includes(keyword))
        : true;
      return matchFilter && matchKeyword;
    });

  const sorted = [...filtered].sort((a, b) => {
    switch (state.sortMode) {
      case 'due':
        return a.due.localeCompare(b.due);
      case 'alphabetical':
        return a.title.localeCompare(b.title, 'zh-CN');
      case 'priority':
      default:
        return b.points - a.points;
    }
  });

  return sorted;
};

export const selectVisibleTaskIds = (state: TaskStore) => selectVisibleTasks(state).map((task) => task.id);
