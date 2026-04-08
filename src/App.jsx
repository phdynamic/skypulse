import React, { useState, useEffect, useCallback } from "react";
import CONFIG from "./config";
import { getProfile, getAuthorFeed } from "./api/bsky";
import {
  getCachedData,
  setCachedData,
  clearCachedData,
  appendFollowerSnapshot,
} from "./utils/cache";
import Header from "./components/Header";
import HeatmapGrid from "./components/HeatmapGrid";
import TopicChart from "./components/TopicChart";
import TopPosts from "./components/TopPosts";
import Threads from "./components/Threads";
import StatCard from "./components/StatCard";

function getInitialDarkMode() {
  try {
    const saved = localStorage.getItem("skypulse_theme");
    return saved !== "light";
  } catch {
    return true;
  }
}

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  const activeHandle = CONFIG.handles[activeIndex].handle;
  const cacheKey = CONFIG.cacheKey(activeHandle);

  function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("skypulse_theme", next ? "dark" : "light");
    } catch {
      // skip
    }
  }

  const fetchData = useCallback(
    async (handle, key, forceRefresh = false) => {
      setLoading(true);
      setError(null);
      setProgress(0);

      try {
        const profileData = await getProfile(handle);
        setProfile(profileData);

        if (profileData.followersCount != null) {
          appendFollowerSnapshot(handle, profileData.followersCount);
        }

        if (!forceRefresh) {
          const cached = getCachedData(key, CONFIG.cacheTTLHours);
          if (cached) {
            setPosts(cached.data);
            setLastUpdated(cached.timestamp);
            setLoading(false);
            return;
          }
        }

        const fetchedPosts = await getAuthorFeed(
          handle,
          CONFIG.maxPostsToFetch,
          (count) => setProgress(count)
        );

        setPosts(fetchedPosts);
        setCachedData(key, fetchedPosts);
        setLastUpdated(Date.now());
      } catch (err) {
        console.error("Fetch failed:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchData(activeHandle, cacheKey);
  }, [activeHandle, cacheKey, fetchData]);

  function handleRefresh() {
    clearCachedData(cacheKey);
    fetchData(activeHandle, cacheKey, true);
  }

  function handleSwitchAccount(index) {
    if (index === activeIndex) return;
    setActiveIndex(index);
    setPosts([]);
    setProfile(null);
    setLastUpdated(null);
    setError(null);
  }

  return (
    <div className="min-h-screen">
      <Header
        profile={profile}
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        loading={loading}
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        handles={CONFIG.handles}
        activeIndex={activeIndex}
        onSwitchAccount={handleSwitchAccount}
      />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/30 rounded-xl p-4 flex items-center justify-between">
            <span className="text-red-600 dark:text-red-400 text-sm">{error}</span>
            <button
              onClick={handleRefresh}
              className="px-3 py-1 text-sm bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {loading && (
          <div className="bg-white border border-gray-200 dark:bg-[#16161e] dark:border-white/10 rounded-xl p-8 text-center">
            <div className="text-sky-500 dark:text-sky-400 text-lg font-medium mb-2">
              Fetching posts…
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              {progress > 0
                ? `${progress} / ${CONFIG.maxPostsToFetch} posts`
                : "Starting…"}
            </div>
            <div className="mt-4 w-64 mx-auto bg-gray-200 dark:bg-[#0f0f13] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    (progress / CONFIG.maxPostsToFetch) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <>
            <HeatmapGrid posts={posts} handle={activeHandle} />
            <TopicChart posts={posts} darkMode={darkMode} />
            <Threads posts={posts} handle={activeHandle} />
            <TopPosts posts={posts} handle={activeHandle} />
            <StatCard profile={profile} handle={activeHandle} darkMode={darkMode} />
          </>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="bg-white border border-gray-200 dark:bg-[#16161e] dark:border-white/10 rounded-xl p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400 text-lg">No posts found</div>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Could not find any posts for @{activeHandle}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
