"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import type { PollResults } from "@/types/api";

interface ResultsChartProps {
  results: PollResults;
}

const COLORS = [
  "#18181b",
  "#52525b",
  "#a1a1aa",
  "#d4d4d8",
  "#e4e4e7",
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { name: string; percentage: number } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const { value, payload: p } = payload[0];
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm px-3 py-2 text-sm">
      <p className="font-medium text-zinc-900 dark:text-white">{p.name}</p>
      <p className="text-zinc-500">
        {value} głosów · {p.percentage.toFixed(1)}%
      </p>
    </div>
  );
}

export function ResultsChart({ results }: ResultsChartProps) {
  if (!results.questions.length) {
    return (
      <p className="text-sm text-zinc-400 py-8 text-center">Brak wyników.</p>
    );
  }

  return (
    <div className="space-y-10">
      {results.questions.map((q) => {
        const chartData = q.options.map((o) => ({
          name: o.optionText,
          votes: o.votes,
          percentage: o.percentage,
        }));

        return (
          <div key={q.questionId} className="space-y-4">
            <div className="flex items-start gap-2">
              <p className="flex-1 text-sm font-medium text-zinc-900 dark:text-white leading-snug">
                {q.questionText}
              </p>
              <Badge variant="secondary" className="flex-shrink-0 text-xs">
                {q.type === "single" ? "jednokrotny" : "wielokrotny"}
              </Badge>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 8, left: -16, bottom: 4 }}
                barCategoryGap="30%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e4e4e7"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tickFormatter={(v: string) =>
                    v.length > 14 ? v.slice(0, 13) + "…" : v
                  }
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f4f4f5" }} />
                <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="space-y-1.5">
              {q.options
                .slice()
                .sort((a, b) => b.votes - a.votes)
                .map((opt, i) => (
                  <div key={opt.optionId} className="flex items-center gap-3 text-sm">
                    <div
                      className="flex-shrink-0 w-2.5 h-2.5 rounded-sm"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                    <span className="flex-1 text-zinc-600 dark:text-zinc-400 truncate">
                      {opt.optionText}
                    </span>
                    <span className="tabular-nums text-zinc-900 dark:text-white font-medium">
                      {opt.votes}
                    </span>
                    <span className="tabular-nums text-zinc-400 w-12 text-right">
                      {opt.percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
