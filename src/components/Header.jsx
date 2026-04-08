import React from "react";

export default function Header({
  profile,
  lastUpdated,
  onRefresh,
  loading,
  darkMode,
  onToggleTheme,
  handles,
  activeIndex,
  onSwitchAccount,
}) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b bg-white/80 border-gray-200 dark:bg-[#0f0f13]/80 dark:border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-sky-500 dark:text-sky-400">SkyPulse</h1>
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
                <span className="font-medium text-gray-900 dark:text-white">
                  {profile.displayName}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">@{profile.handle}</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Account switcher */}
          <div className="flex gap-1 bg-gray-100 dark:bg-white/10 rounded-lg p-0.5">
            {handles.map((h, i) => (
              <button
                key={h.handle}
                onClick={() => onSwitchAccount(i)}
                disabled={loading}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  i === activeIndex
                    ? "bg-sky-500/20 text-sky-500 dark:text-sky-400 font-medium"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                } disabled:opacity-50`}
              >
                {h.label}
              </button>
            ))}
          </div>
          {lastUpdated && (
            <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
              Updated {new Date(lastUpdated).toLocaleString()}
            </span>
          )}
          <button
            onClick={onToggleTheme}
            className="px-2 py-1.5 text-sm rounded-lg transition-colors
                       bg-gray-200 text-gray-600 hover:bg-gray-300
                       dark:bg-white/10 dark:text-gray-400 dark:hover:bg-white/20"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? "Light" : "Dark"}
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                       bg-sky-100 text-sky-600 hover:bg-sky-200
                       dark:bg-sky-500/20 dark:text-sky-400 dark:hover:bg-sky-500/30
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Fetching…" : "Refresh Data"}
          </button>
        </div>
      </div>
    </header>
  );
}
