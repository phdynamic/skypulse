import React, { useMemo, useState } from "react";
import CONFIG from "../config";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getDayIndex(date) {
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
}

function getPostUrl(uri) {
  const parts = uri.split("/");
  const rkey = parts[parts.length - 1];
  return `https://bsky.app/profile/${CONFIG.handle}/post/${rkey}`;
}

export default function HeatmapGrid({ posts }) {
  const [tooltip, setTooltip] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  const { grid, postsByCell, maxEngagement } = useMemo(() => {
    const grid = {};
    const postsByCell = {};
    for (const day of DAYS) {
      grid[day] = {};
      postsByCell[day] = {};
      for (const hour of HOURS) {
        grid[day][hour] = { posts: 0, totalEngagement: 0 };
        postsByCell[day][hour] = [];
      }
    }

    for (const post of posts) {
      const date = new Date(post.createdAt);
      const dayIdx = getDayIndex(date);
      const hour = date.getHours();
      const day = DAYS[dayIdx];
      const cell = grid[day][hour];
      cell.posts += 1;
      cell.totalEngagement += post.totalEngagement;
      postsByCell[day][hour].push(post);
    }

    let maxEng = 0;
    for (const day of DAYS) {
      for (const hour of HOURS) {
        const cell = grid[day][hour];
        if (cell.posts > 0) {
          const avg = cell.totalEngagement / cell.posts;
          if (avg > maxEng) maxEng = avg;
        }
      }
    }

    return { grid, postsByCell, maxEngagement: maxEng };
  }, [posts]);

  const cellSize = 28;
  const gap = 3;
  const labelW = 36;
  const labelH = 20;
  const svgW = labelW + HOURS.length * (cellSize + gap);
  const svgH = labelH + DAYS.length * (cellSize + gap);

  function getColor(cell) {
    if (cell.posts === 0) return "#1a1a2e";
    const avg = cell.totalEngagement / cell.posts;
    const intensity = Math.min(avg / (maxEngagement || 1), 1);
    const r = Math.round(20 + intensity * 36);
    const g = Math.round(20 + intensity * 169);
    const b = Math.round(46 + intensity * 202);
    return `rgb(${r}, ${g}, ${b})`;
  }

  const selectedPosts = selectedCell
    ? postsByCell[selectedCell.day][selectedCell.hour]
    : [];

  return (
    <div className="bg-[#16161e] border border-white/10 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4 text-white">
        Posting Heatmap
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Average engagement by hour and day of week — click a cell to see posts
      </p>
      <div className="overflow-x-auto">
        <svg
          width={svgW}
          height={svgH}
          className="block"
          onMouseLeave={() => setTooltip(null)}
        >
          {HOURS.map((h) => (
            <text
              key={`h-${h}`}
              x={labelW + h * (cellSize + gap) + cellSize / 2}
              y={12}
              textAnchor="middle"
              className="fill-gray-500"
              fontSize={10}
            >
              {h}
            </text>
          ))}
          {DAYS.map((day, di) => (
            <g key={day}>
              <text
                x={0}
                y={labelH + di * (cellSize + gap) + cellSize / 2 + 4}
                className="fill-gray-400"
                fontSize={11}
              >
                {day}
              </text>
              {HOURS.map((hour) => {
                const cell = grid[day][hour];
                const x = labelW + hour * (cellSize + gap);
                const y = labelH + di * (cellSize + gap);
                const isSelected =
                  selectedCell?.day === day && selectedCell?.hour === hour;
                return (
                  <rect
                    key={`${day}-${hour}`}
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    rx={4}
                    fill={getColor(cell)}
                    stroke={isSelected ? "#38bdf8" : "transparent"}
                    strokeWidth={2}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    onClick={() => {
                      if (cell.posts > 0) {
                        setSelectedCell(
                          isSelected ? null : { day, hour }
                        );
                      }
                    }}
                    onMouseEnter={(e) => {
                      const avg =
                        cell.posts > 0
                          ? Math.round(cell.totalEngagement / cell.posts)
                          : 0;
                      setTooltip({
                        x: e.clientX,
                        y: e.clientY,
                        text: `${day} ${hour}:00 — ${cell.posts} posts, avg ${avg} engagement`,
                      });
                    }}
                    onMouseMove={(e) => {
                      setTooltip((prev) =>
                        prev ? { ...prev, x: e.clientX, y: e.clientY } : null
                      );
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </g>
          ))}
        </svg>
      </div>

      {tooltip && (
        <div
          className="fixed z-50 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-none border border-white/10"
          style={{ left: tooltip.x + 12, top: tooltip.y - 30 }}
        >
          {tooltip.text}
        </div>
      )}

      {selectedCell && selectedPosts.length > 0 && (
        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-300">
              {selectedCell.day} at {selectedCell.hour}:00 — {selectedPosts.length} post{selectedPosts.length !== 1 ? "s" : ""}
            </h3>
            <button
              onClick={() => setSelectedCell(null)}
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {selectedPosts
              .sort((a, b) => b.totalEngagement - a.totalEngagement)
              .map((post) => (
                <a
                  key={post.uri}
                  href={getPostUrl(post.uri)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-[#0f0f13] rounded-lg p-3 hover:bg-white/5 transition-colors"
                >
                  <div className="flex gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {post.text || "(no text)"}
                      </p>
                      {post.imageAlt && (
                        <p className="text-xs text-purple-400 mt-1 italic line-clamp-1">
                          Alt: {post.imageAlt}
                        </p>
                      )}
                      <div className="flex gap-3 mt-1.5 text-xs text-gray-500">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span>{post.likeCount} likes</span>
                        <span>{post.repostCount} reposts</span>
                        <span>{post.replyCount} replies</span>
                      </div>
                    </div>
                    <div className="text-sky-400 text-sm font-medium flex-shrink-0">
                      {post.totalEngagement}
                    </div>
                  </div>
                </a>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
