"use client";

import { atom } from "jotai";
import { splitAtom } from "jotai/utils";
import { useAtom } from "jotai";

type Item = { id: string; title: string; done: boolean };

const listAtom = atom<Item[]>([
  { id: "a", title: "学习 Jotai 基础", done: true },
  { id: "b", title: "理解 selectAtom", done: false },
  { id: "c", title: "掌握 splitAtom 细粒度渲染", done: false },
]);

const itemAtomsAtom = splitAtom(listAtom);

export default function Step3Split() {
  const [items] = useAtom(itemAtomsAtom);
  const [list, setList] = useAtom(listAtom);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Step 3 · 列表拆分（splitAtom）</h2>
      <p className="text-zinc-600">
        把数组原子拆成“项原子”，仅渲染被操作的那一项，避免整表重绘。
      </p>

      <div className="rounded-lg border bg-white p-4 space-y-3">
        <div className="flex gap-2">
          <input
            placeholder="输入待办后回车"
            className="flex-1 rounded border px-3 py-2"
            onKeyDown={(e) => {
              const v = (e.target as HTMLInputElement).value.trim();
              if (e.key === "Enter" && v) {
                setList([
                  ...list,
                  { id: `${Date.now()}`, title: v, done: false },
                ]);
                (e.target as HTMLInputElement).value = "";
              }
            }}
          />
        </div>
        <ul className="space-y-2">
          {items.map((itemAtom) => (
            <ItemRow key={String(itemAtom)} atomRef={itemAtom} />
          ))}
        </ul>
      </div>
    </div>
  );
}

import type { PrimitiveAtom } from "jotai";

function ItemRow({ atomRef }: { atomRef: PrimitiveAtom<Item> }) {
  const [item, setItem] = useAtom(atomRef);
  return (
    <li className="rounded border p-3 flex items-center gap-3">
      <input
        type="checkbox"
        checked={item.done}
        onChange={() => setItem({ ...item, done: !item.done })}
      />
      <input
        className="flex-1 rounded border px-2 py-1"
        value={item.title}
        onChange={(e) => setItem({ ...item, title: e.target.value })}
      />
    </li>
  );
}
