import React from "react";

export default function Header({ profile, lastUpdated, onRefresh, loading }) {
  return (
    <header className="sticky top-0 z-50 bg-[#0f0f13]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-sky-400">SkyPulse</h1>
          {profile && (
            <div className="flex items-center gap-2 ml-4">
              {profile.avatar && (
                <img
                  src={profile.avatar}
                  alt={profile.displayName}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div className="text-sm">
                <span className="font-medium text-white">
                  {profile.displayName}
                </span>
                <span className="text-gray-400 ml-2">@{profile.handle}</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Updated {new Date(lastUpdated).toLocaleString()}
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3 py-1.5 text-sm font-medium bg-sky-500/20 text-sky-400 rounded-lg
                       hover:bg-sky-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Fetching…" : "Refresh Data"}
          </button>
        </div>
      </div>
    </header>
  );
}
