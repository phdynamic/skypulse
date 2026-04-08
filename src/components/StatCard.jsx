import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getFollowerHistory } from "../utils/cache";

export default function StatCard({ profile, handle }) {
  const history = useMemo(() => getFollowerHistory(handle), [handle]);

  const chartData = useMemo(
    () =>
      history.map((entry) => ({
        date: new Date(entry.timestamp).toLocaleDateString(),
        followers: entry.followerCount,
      })),
    [history]
  );

  return (
    <div className="bg-[#16161e] border border-white/10 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4 text-white">
        Follower Growth
      </h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0f0f13] rounded-lg p-4">
          <div className="text-2xl font-bold text-sky-400">
            {profile?.followersCount?.toLocaleString() ?? "—"}
          </div>
          <div className="text-xs text-gray-500 mt-1">Followers</div>
        </div>
        <div className="bg-[#0f0f13] rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-400">
            {profile?.followsCount?.toLocaleString() ?? "—"}
          </div>
          <div className="text-xs text-gray-500 mt-1">Following</div>
        </div>
        <div className="bg-[#0f0f13] rounded-lg p-4">
          <div className="text-2xl font-bold text-emerald-400">
            {profile?.postsCount?.toLocaleString() ?? "—"}
          </div>
          <div className="text-xs text-gray-500 mt-1">Posts</div>
        </div>
      </div>

      {chartData.length > 1 ? (
        <>
          <p className="text-xs text-gray-500 mb-3">
            Follower count over time (recorded on each refresh)
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                tick={{ fill: "#888", fontSize: 10 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#888", fontSize: 10 }}
                tickLine={false}
                domain={["dataMin - 10", "dataMax + 10"]}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1a2e",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="followers"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ fill: "#38bdf8", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <p className="text-xs text-gray-500">
          Follower history builds over time — each data refresh records a
          snapshot. Check back after a few refreshes to see a growth chart.
        </p>
      )}
    </div>
  );
}
