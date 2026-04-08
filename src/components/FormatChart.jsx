import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts";
import { getFormatStats } from "../utils/classify";

const COLORS = {
  "Text only": "#38bdf8",
  "Image post": "#a78bfa",
  "Link/card post": "#34d399",
  Reply: "#fbbf24",
  "Quote post": "#f472b6",
};

export default function FormatChart({ posts }) {
  const data = useMemo(() => getFormatStats(posts), [posts]);

  return (
    <div className="bg-[#16161e] border border-white/10 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-1 text-white">
        Format Performance
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Average engagement by post type
      </p>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 60)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 60, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis
            type="number"
            tick={{ fill: "#888", fontSize: 11 }}
            label={{
              value: "Avg Engagement",
              position: "insideBottom",
              fill: "#666",
              fontSize: 11,
              offset: -2,
            }}
          />
          <YAxis
            type="category"
            dataKey="type"
            width={110}
            tick={{ fill: "#ccc", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              background: "#1a1a2e",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => [Math.round(value * 10) / 10, "Avg Engagement"]}
          />
          <Bar dataKey="avgEngagement" radius={[0, 6, 6, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.type}
                fill={COLORS[entry.type] || "#38bdf8"}
              />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              fill="#888"
              fontSize={11}
              formatter={(v) => `${v} posts`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
