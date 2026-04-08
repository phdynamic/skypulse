const STOPWORDS = new Set([
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her",
  "she", "or", "an", "will", "my", "one", "all", "would", "there",
  "their", "what", "so", "up", "out", "if", "about", "who", "get",
  "which", "go", "me", "when", "make", "can", "like", "time", "no",
  "just", "him", "know", "take", "people", "into", "year", "your",
  "good", "some", "could", "them", "see", "other", "than", "then",
  "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first",
  "well", "way", "even", "new", "want", "because", "any", "these",
  "give", "day", "most", "us", "is", "are", "was", "were", "been",
  "has", "had", "did", "does", "am", "being", "more", "very", "much",
  "too", "really", "don't", "didn't", "it's", "i'm", "that's",
  "don", "didn", "isn", "wasn", "aren", "won", "wouldn", "shouldn",
  "couldn", "can't", "won't", "isn't", "aren't", "im", "ive",
  "dont", "doesnt", "didnt", "thats", "youre", "youve", "theyre",
  "weve", "hes", "shes", "its", "theres", "whats", "whos",
]);

export function getWordFrequencies(posts) {
  const wordCounts = {};
  const wordEngagement = {};

  for (const post of posts) {
    const text = post.text
      .replace(/https?:\/\/\S+/g, "")       // strip URLs
      .replace(/@[\w.]+/g, "")               // strip mentions
      .replace(/[^\w\s'-]/g, " ")            // strip punctuation (keep apostrophes/hyphens)
      .toLowerCase();

    const words = new Set(
      text.split(/\s+/).filter((w) => w.length > 2 && !STOPWORDS.has(w))
    );

    for (const word of words) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
      if (!wordEngagement[word]) wordEngagement[word] = [];
      wordEngagement[word].push(post.totalEngagement);
    }
  }

  return Object.entries(wordCounts)
    .map(([word, count]) => {
      const engagements = wordEngagement[word];
      const avgEngagement =
        engagements.reduce((a, b) => a + b, 0) / engagements.length;
      return { word, count, avgEngagement: Math.round(avgEngagement * 10) / 10 };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);
}
