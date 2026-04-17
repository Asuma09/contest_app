"use client";

import { ScheduleItem } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface ScheduleEditorProps {
  items: ScheduleItem[];
  onChange: (items: ScheduleItem[]) => void;
}

export function ScheduleEditor({ items, onChange }: ScheduleEditorProps) {
  function addItem() {
    onChange([...items, { id: uuidv4(), time: "", description: "" }]);
  }

  function updateItem(id: string, field: "time" | "description", value: string) {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={item.id} className="flex items-center gap-2">
          <span className="text-gray-400 text-sm w-5 shrink-0">{i + 1}.</span>
          <input
            type="text"
            value={item.time}
            onChange={(e) => updateItem(item.id, "time", e.target.value)}
            placeholder="例: 10:00"
            className="w-24 shrink-0 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            value={item.description}
            onChange={(e) => updateItem(item.id, "description", e.target.value)}
            placeholder="例: 開会式"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="text-red-400 hover:text-red-600 text-sm px-2"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
      >
        + スケジュールを追加
      </button>
    </div>
  );
}
