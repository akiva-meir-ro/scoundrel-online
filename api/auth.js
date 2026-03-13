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
    const { password, data } = body;

    if (!password || typeof password !== "string") {
      return Response.json({ error: "Password is required" }, { status: 400 });
    }

    const userKey = `user:${password}`;

    // Handle /api/auth/signup
    if (path.endsWith("/signup")) {
      const existing = await redis.get(userKey);
      if (existing) {
        return Response.json({ error: "Someone is already using that password" }, { status: 409 });
      }
      await redis.set(userKey, JSON.stringify(data || {}));
      return Response.json({ success: true });
    }

    // Handle /api/auth/login
    if (path.endsWith("/login")) {
      const userData = await redis.get(userKey);
      if (!userData) {
        return Response.json({ error: "Invalid password" }, { status: 401 });
      }
      return Response.json({ success: true, data: userData });
    }

    // Handle /api/auth/save
    if (path.endsWith("/save")) {
      await redis.set(userKey, JSON.stringify(data || {}));
      return Response.json({ success: true });
    }

    return Response.json({ error: `Not found: ${path}` }, { status: 404 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
