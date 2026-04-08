import React, { useMemo, useState } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getDayIndex(date) {
  // JS getDay(): 0=Sun, convert to 0=Mon
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
}

export default function HeatmapGrid({ posts }) {
  const [tooltip, setTooltip] = useState(null);

  const { grid, maxEngagement } = useMemo(() => {
    const grid = {};
    for (const day of DAYS) {
      grid[day] = {};
      for (const hour of HOURS) {
        grid[day][hour] = { posts: 0, totalEngagement: 0 };
      }
    }

    for (const post of posts) {
      const date = new Date(post.createdAt);
      const dayIdx = getDayIndex(date);
      const hour = date.getHours();
      const cell = grid[DAYS[dayIdx]][hour];
      cell.posts += 1;
      cell.totalEngagement += post.totalEngagement;
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

    return { grid, maxEngagement: maxEng };
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
    // Interpolate from dark blue to sky blue
    const r = Math.round(20 + intensity * 36);
    const g = Math.round(20 + intensity * 169);
    const b = Math.round(46 + intensity * 202);
    return `rgb(${r}, ${g}, ${b})`;
  }

  return (
    <div className="bg-[#16161e] border border-white/10 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4 text-white">
        Posting Heatmap
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Average engagement by hour and day of week
      </p>
      <div className="overflow-x-auto">
        <svg
          width={svgW}
          height={svgH}
          className="block"
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Hour labels */}
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
          {/* Day labels + cells */}
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
                return (
                  <rect
                    key={`${day}-${hour}`}
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    rx={4}
                    fill={getColor(cell)}
                    className="cursor-pointer transition-opacity hover:opacity-80"
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
    </div>
  );
}
