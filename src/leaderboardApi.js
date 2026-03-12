const API_URL = "/api/leaderboard";
const AUTH_URL = "/api/auth";

export async function fetchLeaderboard() {
  const res = await fetch(API_URL);
  const data = await res.json();
  return data.scores || [];
}

export async function submitScore(name, score) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, score }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save score");
  return data.scores || [];
}

export async function signup(password, data) {
  const res = await fetch(`${AUTH_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, data }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to signup");
  return result;
}

export async function login(password) {
  const res = await fetch(`${AUTH_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to login");
  return result;
}

export async function saveProgress(password, data) {
  const res = await fetch(`${AUTH_URL}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, data }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to save progress");
  return result;
}
