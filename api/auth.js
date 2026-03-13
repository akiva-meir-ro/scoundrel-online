import { Redis } from '@upstash/redis';

export const config = {
  runtime: 'edge',
};

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(request) {
  const method = request.method;
  const url = new URL(request.url);
  const path = url.pathname;

  if (method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { name, password, data } = body;

    if (!name || typeof name !== "string") {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }
    if (!password || typeof password !== "string") {
      return Response.json({ error: "Password is required" }, { status: 400 });
    }

    const userKey = `user:${name.trim().toLowerCase()}`;

    // Handle /api/auth/signup
    if (path.endsWith("/signup")) {
      const existing = await redis.get(userKey);
      if (existing) {
        return Response.json({ error: "Someone is already using that name" }, { status: 409 });
      }
      await redis.set(userKey, JSON.stringify({ password, data: data || {} }));
      return Response.json({ success: true });
    }

    // Handle /api/auth/login
    if (path.endsWith("/login")) {
      const account = await redis.get(userKey);
      if (!account || account.password !== password) {
        return Response.json({ error: "Invalid name or password" }, { status: 401 });
      }
      return Response.json({ success: true, data: account.data });
    }

    // Handle /api/auth/save
    if (path.endsWith("/save")) {
      const account = await redis.get(userKey);
      if (!account || account.password !== password) {
         return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      await redis.set(userKey, JSON.stringify({ password, data: data || {} }));
      return Response.json({ success: true });
    }

    return Response.json({ error: `Not found: ${path}` }, { status: 404 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
