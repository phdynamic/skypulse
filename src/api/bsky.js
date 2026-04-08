const API_BASE = "https://public.api.bsky.app/xrpc";

export async function getProfile(handle) {
  const res = await fetch(
    `${API_BASE}/app.bsky.actor.getProfile?actor=${encodeURIComponent(handle)}`
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch profile: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getAuthorFeed(handle, maxPosts, onProgress) {
  const posts = [];
  let cursor = undefined;
  const limit = 100;

  while (posts.length < maxPosts) {
    const params = new URLSearchParams({
      actor: handle,
      limit: String(limit),
    });
    if (cursor) params.set("cursor", cursor);

    const res = await fetch(
      `${API_BASE}/app.bsky.feed.getAuthorFeed?${params}`
    );
    if (!res.ok) {
      throw new Error(
        `Failed to fetch feed: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();
    if (!data.feed || data.feed.length === 0) break;

    // Filter out reposts
    const ownPosts = data.feed.filter(
      (item) => item.reason?.$type !== "app.bsky.feed.defs#reasonRepost"
    );

    for (const item of ownPosts) {
      if (posts.length >= maxPosts) break;
      posts.push(extractPost(item.post));
    }

    if (onProgress) onProgress(posts.length);

    cursor = data.cursor;
    if (!cursor) break;
  }

  return posts;
}

function extractPost(post) {
  // Get alt text from the resolved embed view for image posts
  let imageAlt = null;
  const embedView = post.embed;
  if (embedView?.$type === "app.bsky.embed.images#view") {
    imageAlt = embedView.images?.[0]?.alt || null;
  } else if (embedView?.$type === "app.bsky.embed.recordWithMedia#view") {
    imageAlt = embedView.media?.images?.[0]?.alt || null;
  }

  return {
    uri: post.uri,
    cid: post.cid,
    text: post.record?.text || "",
    createdAt: post.record?.createdAt || "",
    embed: post.record?.embed || null,
    hasReply: !!post.record?.reply,
    likeCount: post.likeCount || 0,
    repostCount: post.repostCount || 0,
    replyCount: post.replyCount || 0,
    totalEngagement:
      (post.likeCount || 0) +
      (post.repostCount || 0) +
      (post.replyCount || 0),
    imageAlt,
  };
}
