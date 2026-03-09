const API_URL = "/api/leaderboard";

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
