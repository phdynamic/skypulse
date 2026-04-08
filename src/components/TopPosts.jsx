import React, { useMemo, useState } from "react";
import CONFIG from "../config";

const RANGES = [
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "180d", days: 180 },
  { label: "All", days: null },
];

export default function TopPosts({ posts }) {
  const [sortKey, setSortKey] = useState("totalEngagement");
  const [sortAsc, setSortAsc] = useState(false);
  const [range, setRange] = useState(null); // null = all

  const filtered = useMemo(() => {
    let list = posts;
    if (range) {
      const cutoff = Date.now() - range * 24 * 60 * 60 * 1000;
      list = list.filter((p) => new Date(p.createdAt).getTime() >= cutoff);
    }
    return [...list].sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      return sortAsc ? av - bv : bv - av;
    });
  }, [posts, sortKey, sortAsc, range]);

  function handleSort(key) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  function getPostUrl(uri) {
    // uri format: at://did:plc:xxx/app.bsky.feed.post/rkey
    const parts = uri.split("/");
    const rkey = parts[parts.length - 1];
    return `https://bsky.app/profile/${CONFIG.handle}/post/${rkey}`;
  }

  const sortArrow = (key) => {
    if (sortKey !== key) return "";
    return sortAsc ? " ↑" : " ↓";
  };

  const columns = [
    { key: "createdAt", label: "Date", className: "w-28" },
    { key: "text", label: "Preview", className: "flex-1 min-w-[200px]" },
    { key: "likeCount", label: "Likes", className: "w-16 text-right" },
    { key: "repostCount", label: "Reposts", className: "w-18 text-right" },
    { key: "replyCount", label: "Replies", className: "w-18 text-right" },
    { key: "totalEngagement", label: "Total", className: "w-16 text-right" },
  ];

  return (
    <div className="bg-[#16161e] border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Top Posts</h2>
          <p className="text-xs text-gray-500 mt-1">
            {filtered.length} posts
          </p>
        </div>
        <div className="flex gap-1 bg-[#0f0f13] rounded-lg p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setRange(r.days)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                range === r.days
                  ? "bg-sky-500/20 text-sky-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`py-2 px-2 text-left text-xs font-medium text-gray-400 cursor-pointer
                              hover:text-white transition-colors select-none ${col.className}`}
                >
                  {col.label}
                  {sortArrow(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 25).map((post) => (
              <tr
                key={post.uri}
                onClick={() => window.open(getPostUrl(post.uri), "_blank")}
                className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
              >
                <td className="py-2 px-2 text-xs text-gray-400 whitespace-nowrap">
                  {new Date(post.createdAt).toLocaleDateString()}
                </td>
                <td className="py-2 px-2 text-gray-300">
                  <div>
                    <span className="truncate max-w-xs block">
                      {post.text.slice(0, 80)}
                      {post.text.length > 80 ? "…" : ""}
                    </span>
                    {post.imageAlt && (
                      <span className="text-xs text-purple-400 italic block mt-0.5 truncate max-w-xs">
                        Alt: {post.imageAlt}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2 px-2 text-right text-gray-300">
                  {post.likeCount}
                </td>
                <td className="py-2 px-2 text-right text-gray-300">
                  {post.repostCount}
                </td>
                <td className="py-2 px-2 text-right text-gray-300">
                  {post.replyCount}
                </td>
                <td className="py-2 px-2 text-right font-medium text-sky-400">
                  {post.totalEngagement}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
