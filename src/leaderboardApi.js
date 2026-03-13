const API_URL = "/api/leaderboard";
const AUTH_URL = "/api/auth";

async function safeJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return { error: `Server error: ${res.status}. Body: ${text.substring(0, 100)}` };
  }
}

export async function fetchLeaderboard() {
  const res = await fetch(API_URL);
  const data = await safeJson(res);
  return data.scores || [];
}

export async function submitScore(name, score) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, score }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.error || "Failed to save score");
  return data.scores || [];
}

export async function signup(name, password, data) {
  const res = await fetch(`${AUTH_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, password, data }),
  });
  const result = await safeJson(res);
  if (!res.ok) throw new Error(result.error || "Failed to signup");
  return result;
}

export async function login(name, password) {
  const res = await fetch(`${AUTH_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, password }),
  });
  const result = await safeJson(res);
  if (!res.ok) throw new Error(result.error || "Failed to login");
  return result;
}

export async function saveProgress(name, password, data) {
  const res = await fetch(`${AUTH_URL}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, password, data }),
  });
  const result = await safeJson(res);
  if (!res.ok) throw new Error(result.error || "Failed to save progress");
  return result;
}
