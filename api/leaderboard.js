import { Redis } from '@upstash/redis';

export const config = {
  runtime: 'edge',
};

const redis = Redis.fromEnv();
const LEADERBOARD_KEY = "scoundrel:leaderboard";
const MAX_ENTRIES = 50;
const MAX_NAME_LENGTH = 15;

async function getLeaderboard() {
  const data = await redis.get(LEADERBOARD_KEY);
  return data || [];
}

async function handleGet() {
  const scores = await getLeaderboard();
  return Response.json({ scores });
}

async function handlePost(request) {
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim().slice(0, MAX_NAME_LENGTH) : "";
  const score = body.score;

  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }
  if (typeof score !== "number" || !Number.isFinite(score)) {
    return Response.json({ error: "Score must be a finite number" }, { status: 400 });
  }

  const scores = await getLeaderboard();
  scores.push({
    id: crypto.randomUUID(),
    name,
    score,
    date: new Date().toISOString(),
  });
  scores.sort((a, b) => b.score - a.score);
  const trimmed = scores.slice(0, MAX_ENTRIES);

  await redis.set(LEADERBOARD_KEY, JSON.stringify(trimmed));
  return Response.json({ success: true, scores: trimmed });
}

export default async function handler(request) {
  if (request.method === "GET") {
    return handleGet();
  }
  if (request.method === "POST") {
    return handlePost(request);
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
