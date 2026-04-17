import type { VoteCount } from "@/types";

interface ResultsChartProps {
  voteCounts: VoteCount[];
  totalVotes: number;
}

export function ResultsChart({ voteCounts, totalVotes }: ResultsChartProps) {
  const sorted = [...voteCounts].sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-4">
      {sorted.map((vc, i) => {
        const pct = totalVotes > 0 ? Math.round((vc.count / totalVotes) * 100) : 0;
        const isTop = i === 0 && vc.count > 0;
        return (
          <div key={vc.choiceId}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className={`font-medium truncate max-w-[70%] ${isTop ? "text-gray-900" : "text-gray-600"}`}>
                {vc.choiceText}
              </span>
              <span className="text-gray-400 shrink-0 ml-2 text-xs">
                {vc.count}票 · {pct}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${isTop ? "bg-gray-900" : "bg-gray-300"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-xs text-gray-400 text-right pt-1">合計 {totalVotes}票</p>
    </div>
  );
}
