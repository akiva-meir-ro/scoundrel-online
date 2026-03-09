import { getStore } from "@netlify/blobs";

const STORE_NAME = "scoundrel";
const BLOB_KEY = "leaderboard";
const MAX_ENTRIES = 50;
const MAX_NAME_LENGTH = 15;

async function getLeaderboard(store) {
  const data = await store.get(BLOB_KEY, { type: "json" });
  return data || [];
}

async function handleGet(store) {
  const scores = await getLeaderboard(store);
  return Response.json({ scores });
}

async function handlePost(store, request) {
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim().slice(0, MAX_NAME_LENGTH) : "";
  const score = body.score;

  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }
  if (typeof score !== "number" || !Number.isFinite(score)) {
    return Response.json({ error: "Score must be a finite number" }, { status: 400 });
  }

  const scores = await getLeaderboard(store);
  scores.push({
    id: crypto.randomUUID(),
    name,
    score,
    date: new Date().toISOString(),
  });
  scores.sort((a, b) => b.score - a.score);
  const trimmed = scores.slice(0, MAX_ENTRIES);

  await store.setJSON(BLOB_KEY, trimmed);
  return Response.json({ success: true, scores: trimmed });
}

export default async (request, context) => {
  const store = getStore(STORE_NAME);

  if (request.method === "GET") {
    return handleGet(store);
  }
  if (request.method === "POST") {
    return handlePost(store, request);
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
};

export const config = {
  path: "/api/leaderboard",
};
