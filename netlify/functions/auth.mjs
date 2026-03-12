import { getStore } from "@netlify/blobs";

const STORE_NAME = "scoundrel-users";

export default async (request, context) => {
  const store = getStore(STORE_NAME);
  const method = request.method;
  const url = new URL(request.url);
  // Support both /api/auth/signup and /.netlify/functions/auth/signup
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

    const userKey = `user_${password}`;

    if (path.endsWith("/signup")) {
      const existing = await store.get(userKey);
      if (existing) {
        return Response.json({ error: "Someone is already using that password" }, { status: 409 });
      }
      await store.setJSON(userKey, data || {});
      return Response.json({ success: true });
    }

    if (path.endsWith("/login")) {
      const userData = await store.get(userKey, { type: "json" });
      if (!userData) {
        return Response.json({ error: "Invalid password" }, { status: 401 });
      }
      return Response.json({ success: true, data: userData });
    }

    if (path.endsWith("/save")) {
      await store.setJSON(userKey, data || {});
      return Response.json({ success: true });
    }

    return Response.json({ error: `Not found: ${path}` }, { status: 404 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};

export const config = {
  path: "/api/auth/*",
};
