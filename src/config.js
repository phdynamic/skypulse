const CONFIG = {
  handles: [
    { label: "Professor Kiosk", handle: "professorkiosk.wtf" },
    { label: "Clover Kiss Cinema", handle: "cloverkisscinema.bsky.social" },
  ],
  cacheTTLHours: 6,
  maxPostsToFetch: 500,
  cacheKey: (handle) => `skypulse_posts_v3_${handle}`,
};

export default CONFIG;
