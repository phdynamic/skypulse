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
import StatCard from "./components/StatCard";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      setError(null);
      setProgress(0);

      try {
        // Fetch profile
        const profileData = await getProfile(CONFIG.handle);
        setProfile(profileData);

        // Snapshot follower count (V2 feature)
        if (profileData.followersCount != null) {
          appendFollowerSnapshot(CONFIG.handle, profileData.followersCount);
        }

        // Check cache
        if (!forceRefresh) {
          const cached = getCachedData(CONFIG.cacheKey, CONFIG.cacheTTLHours);
          if (cached) {
            setPosts(cached.data);
            setLastUpdated(cached.timestamp);
            setLoading(false);
            return;
          }
        }

        // Fetch posts with pagination
        const fetchedPosts = await getAuthorFeed(
          CONFIG.handle,
          CONFIG.maxPostsToFetch,
          (count) => setProgress(count)
        );

        setPosts(fetchedPosts);
        setCachedData(CONFIG.cacheKey, fetchedPosts);
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
    fetchData();
  }, [fetchData]);

  function handleRefresh() {
    clearCachedData(CONFIG.cacheKey);
    fetchData(true);
  }

  return (
    <div className="min-h-screen">
      <Header
        profile={profile}
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        loading={loading}
      />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Error banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
            <span className="text-red-400 text-sm">{error}</span>
            <button
              onClick={handleRefresh}
              className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="bg-[#16161e] border border-white/10 rounded-xl p-8 text-center">
            <div className="text-sky-400 text-lg font-medium mb-2">
              Fetching posts…
            </div>
            <div className="text-gray-400 text-sm">
              {progress > 0
                ? `${progress} / ${CONFIG.maxPostsToFetch} posts`
                : "Starting…"}
            </div>
            <div className="mt-4 w-64 mx-auto bg-[#0f0f13] rounded-full h-2 overflow-hidden">
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

        {/* Dashboard sections */}
        {!loading && posts.length > 0 && (
          <>
            <HeatmapGrid posts={posts} />
            <TopicChart posts={posts} />
            <TopPosts posts={posts} />
            <StatCard profile={profile} handle={CONFIG.handle} />
          </>
        )}

        {/* Empty state */}
        {!loading && !error && posts.length === 0 && (
          <div className="bg-[#16161e] border border-white/10 rounded-xl p-8 text-center">
            <div className="text-gray-400 text-lg">No posts found</div>
            <p className="text-gray-500 text-sm mt-2">
              Could not find any posts for @{CONFIG.handle}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
