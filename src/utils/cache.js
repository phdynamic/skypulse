function isLocalStorageAvailable() {
  try {
    const testKey = "__skypulse_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const storageAvailable = isLocalStorageAvailable();

export function getCachedData(key, ttlHours) {
  if (!storageAvailable) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { timestamp, data } = JSON.parse(raw);
    const ageMs = Date.now() - timestamp;
    if (ageMs > ttlHours * 60 * 60 * 1000) return null;
    return { data, timestamp };
  } catch {
    return null;
  }
}

export function setCachedData(key, data) {
  if (!storageAvailable) return;
  try {
    localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {
    // Storage full or unavailable — skip silently
  }
}

export function clearCachedData(key) {
  if (!storageAvailable) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // skip
  }
}

export function getFollowerHistory(handle) {
  if (!storageAvailable) return [];
  try {
    const key = `skypulse_follower_history_${handle}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function appendFollowerSnapshot(handle, followerCount) {
  if (!storageAvailable) return;
  try {
    const key = `skypulse_follower_history_${handle}`;
    const history = getFollowerHistory(handle);
    history.push({ timestamp: Date.now(), followerCount });
    localStorage.setItem(key, JSON.stringify(history));
  } catch {
    // skip
  }
}
