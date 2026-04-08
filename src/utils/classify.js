export function classifyPost(post) {
  if (post.hasReply) return "Reply";

  const embedType = post.embed?.$type;

  if (embedType === "app.bsky.embed.images") return "Image post";
  if (embedType === "app.bsky.embed.external") return "Link/card post";
  if (embedType === "app.bsky.embed.record") return "Quote post";
  if (embedType === "app.bsky.embed.recordWithMedia") return "Quote post";

  if (!post.embed) return "Text only";

  // Fallback for unknown embed types
  return "Text only";
}

export function getFormatStats(posts) {
  const groups = {};

  for (const post of posts) {
    const type = classifyPost(post);
    if (!groups[type]) {
      groups[type] = { type, totalEngagement: 0, count: 0 };
    }
    groups[type].totalEngagement += post.totalEngagement;
    groups[type].count += 1;
  }

  return Object.values(groups)
    .map((g) => ({
      type: g.type,
      avgEngagement: g.count > 0 ? g.totalEngagement / g.count : 0,
      count: g.count,
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement);
}
