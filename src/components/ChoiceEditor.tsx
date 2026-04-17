"use client";

import { Choice } from "@/types";
import { Button } from "@/components/ui/Button";
import { v4 as uuidv4 } from "uuid";

interface ChoiceEditorProps {
  choices: Choice[];
  onChange: (choices: Choice[]) => void;
}

export function ChoiceEditor({ choices, onChange }: ChoiceEditorProps) {
  function addChoice() {
    onChange([...choices, { id: uuidv4(), text: "" }]);
  }

  function updateChoice(id: string, text: string) {
    onChange(choices.map((c) => (c.id === id ? { ...c, text } : c)));
  }

  function removeChoice(id: string) {
    onChange(choices.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-2">
      {choices.map((choice, i) => (
        <div key={choice.id} className="flex items-center gap-2">
          <span className="text-gray-400 text-sm w-5 shrink-0">{i + 1}.</span>
          <input
            type="text"
            value={choice.text}
            onChange={(e) => updateChoice(choice.id, e.target.value)}
            placeholder={`選択肢 ${i + 1}`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {choices.length > 2 && (
            <button
              type="button"
              onClick={() => removeChoice(choice.id)}
              className="text-red-400 hover:text-red-600 text-sm px-2"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={addChoice}>
        + 選択肢を追加
      </Button>
    </div>
  );
}
