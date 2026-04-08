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

export default function TopicChart({ posts }) {
  const [sortBy, setSortBy] = useState("frequency");

  const data = useMemo(() => {
    const words = getWordFrequencies(posts);
    if (sortBy === "engagement") {
      return [...words].sort((a, b) => b.avgEngagement - a.avgEngagement);
    }
    return words;
  }, [posts, sortBy]);

  return (
    <div className="bg-[#16161e] border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Topic Clusters</h2>
          <p className="text-xs text-gray-500 mt-1">
            Top 30 words by {sortBy === "frequency" ? "frequency" : "avg engagement"}
          </p>
        </div>
        <div className="flex gap-1 bg-[#0f0f13] rounded-lg p-0.5">
          <button
            onClick={() => setSortBy("frequency")}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              sortBy === "frequency"
                ? "bg-sky-500/20 text-sky-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Frequency
          </button>
          <button
            onClick={() => setSortBy("engagement")}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              sortBy === "engagement"
                ? "bg-purple-500/20 text-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Engagement
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis type="number" tick={{ fill: "#888", fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="word"
            width={80}
            tick={{ fill: "#ccc", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              background: "#1a1a2e",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value, name) => {
              if (name === "count") return [value, "Posts"];
              if (name === "avgEngagement") return [value, "Avg Engagement"];
              return [value, name];
            }}
          />
          <Bar dataKey="count" fill="#38bdf8" radius={[0, 4, 4, 0]} />
          <Bar dataKey="avgEngagement" fill="#a78bfa" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
