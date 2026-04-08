import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getWordFrequencies } from "../utils/text";

export default function TopicChart({ posts, darkMode }) {
  const [sortBy, setSortBy] = useState("frequency");

  const data = useMemo(() => {
    const words = getWordFrequencies(posts);
    if (sortBy === "engagement") {
      return [...words].sort((a, b) => b.avgEngagement - a.avgEngagement);
    }
    return words;
  }, [posts, sortBy]);

  const tickColor = darkMode ? "#ccc" : "#444";
  const gridColor = darkMode ? "#222" : "#e5e7eb";
  const tooltipBg = darkMode ? "#1a1a2e" : "#fff";
  const tooltipBorder = darkMode
    ? "1px solid rgba(255,255,255,0.1)"
    : "1px solid #e5e7eb";

  return (
    <div className="bg-white border border-gray-200 dark:bg-[#16161e] dark:border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Topic Clusters</h2>
          <p className="text-xs text-gray-500 mt-1">
            Top 30 words by {sortBy === "frequency" ? "frequency" : "avg engagement"}
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-[#0f0f13] rounded-lg p-0.5">
          <button
            onClick={() => setSortBy("frequency")}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              sortBy === "frequency"
                ? "bg-sky-500/20 text-sky-400"
                : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Frequency
          </button>
          <button
            onClick={() => setSortBy("engagement")}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              sortBy === "engagement"
                ? "bg-purple-500/20 text-purple-400"
                : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Engagement
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="word"
              tick={{ fill: tickColor, fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              interval={0}
              height={60}
            />
            <YAxis tick={{ fill: tickColor, fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: tooltipBg,
                border: tooltipBorder,
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value, name) => {
                if (name === "count") return [value, "Posts"];
                if (name === "avgEngagement") return [value, "Avg Engagement"];
                return [value, name];
              }}
            />
            <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="avgEngagement" fill="#a78bfa" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
