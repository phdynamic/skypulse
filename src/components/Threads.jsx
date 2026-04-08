import React, { useMemo, useState } from "react";
import CONFIG from "../config";

function getPostUrl(uri) {
  const parts = uri.split("/");
  const rkey = parts[parts.length - 1];
  return `https://bsky.app/profile/${CONFIG.handle}/post/${rkey}`;
}

export default function Threads({ posts }) {
  const [sortBy, setSortBy] = useState("engagement");

  const threads = useMemo(() => {
    // Group posts into threads by walking reply root references
    // A "thread" is a root post + all replies that share the same root URI
    const threadMap = {};

    for (const post of posts) {
      // Determine which thread this post belongs to
      const rootUri = post.replyRoot || post.uri;

      if (!threadMap[rootUri]) {
        threadMap[rootUri] = {
          rootUri,
          posts: [],
          totalLikes: 0,
          totalReposts: 0,
          totalReplies: 0,
          totalEngagement: 0,
          earliestDate: post.createdAt,
          latestDate: post.createdAt,
        };
      }

      const thread = threadMap[rootUri];
      thread.posts.push(post);
      thread.totalLikes += post.likeCount;
      thread.totalReposts += post.repostCount;
      thread.totalReplies += post.replyCount;
      thread.totalEngagement += post.totalEngagement;

      if (post.createdAt < thread.earliestDate) {
        thread.earliestDate = post.createdAt;
      }
      if (post.createdAt > thread.latestDate) {
        thread.latestDate = post.createdAt;
      }
    }

    // Only keep threads with 2+ posts (actual threads, not standalone posts)
    return Object.values(threadMap)
      .filter((t) => t.posts.length >= 2)
      .map((t) => {
        // Sort posts within thread chronologically
        t.posts.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        // Use the first post's text as the thread title
        t.title = t.posts[0].text;
        return t;
      });
  }, [posts]);

  const sorted = useMemo(() => {
    if (sortBy === "engagement") {
      return [...threads].sort(
        (a, b) => b.totalEngagement - a.totalEngagement
      );
    }
    if (sortBy === "length") {
      return [...threads].sort((a, b) => b.posts.length - a.posts.length);
    }
    return [...threads].sort(
      (a, b) => new Date(b.earliestDate) - new Date(a.earliestDate)
    );
  }, [threads, sortBy]);

  if (threads.length === 0) {
    return (
      <div className="bg-white border border-gray-200 dark:bg-[#16161e] dark:border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Threads
        </h2>
        <p className="text-sm text-gray-500">
          No threads detected — threads require 2+ posts from your account in
          the same reply chain.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 dark:bg-[#16161e] dark:border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Threads</h2>
          <p className="text-xs text-gray-500 mt-1">
            {threads.length} thread{threads.length !== 1 ? "s" : ""} detected
            — scored as a unit
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-[#0f0f13] rounded-lg p-0.5">
          {[
            { key: "engagement", label: "Engagement" },
            { key: "length", label: "Length" },
            { key: "recent", label: "Recent" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                sortBy === opt.key
                  ? "bg-sky-500/20 text-sky-400"
                  : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {sorted.slice(0, 15).map((thread) => (
          <div
            key={thread.rootUri}
            className="bg-gray-50 border border-gray-200 dark:bg-[#0f0f13] dark:border-white/5 rounded-lg p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <a
                  href={getPostUrl(thread.rootUri)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-700 dark:text-gray-200 hover:text-sky-400 transition-colors line-clamp-2"
                >
                  {thread.title || "(no text)"}
                </a>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="text-purple-400 font-medium">
                    {thread.posts.length} posts
                  </span>
                  <span>
                    {new Date(thread.earliestDate).toLocaleDateString()}
                  </span>
                  <span>{thread.totalLikes} likes</span>
                  <span>{thread.totalReposts} reposts</span>
                  <span>{thread.totalReplies} replies</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-sky-400">
                  {thread.totalEngagement}
                </div>
                <div className="text-[10px] text-gray-500">total</div>
              </div>
            </div>
            {/* Thread post previews */}
            <div className="mt-3 pl-3 border-l-2 border-gray-200 dark:border-white/10 space-y-1.5">
              {thread.posts.map((post, i) => (
                <a
                  key={post.uri}
                  href={getPostUrl(post.uri)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors truncate"
                >
                  <span className="text-gray-600 mr-1.5">{i + 1}.</span>
                  {post.text.slice(0, 100) || "(no text)"}
                  <span className="text-gray-600 ml-2">
                    ({post.totalEngagement})
                  </span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
