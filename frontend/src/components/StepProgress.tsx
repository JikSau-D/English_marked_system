import React from "react";

export type Step = {
  key: string;
  label: string;
};

export default function StepProgress({
  steps,
  currentKey,
  progress,
}: {
  steps: Step[];
  currentKey: string;
  progress?: number; // 0-100
}) {
  const currentIndex = Math.max(0, steps.findIndex((s) => s.key === currentKey));
  const pct = typeof progress === "number" ? Math.max(0, Math.min(100, progress)) : undefined;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-400">
        {steps.map((s, idx) => (
          <div key={s.key} className={`flex-1 ${idx === currentIndex ? "text-white" : ""}`}>
            {idx + 1}. {s.label}
          </div>
        ))}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-2 rounded-full bg-indigo-500 transition-all"
          style={{ width: `${pct ?? (currentIndex / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

