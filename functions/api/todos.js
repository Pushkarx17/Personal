const MAX_ITEMS = 500;
const MAX_TEXT_LENGTH = 120;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequest({ request, env }) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!env.TODO_TOKEN || token !== env.TODO_TOKEN) {
    return json({ error: "unauthorized" }, 401);
  }

  if (request.method === "GET") {
    const raw = await env.TODOS.get("items");
    return json({ items: raw ? JSON.parse(raw) : [] });
  }

  if (request.method === "PUT" || request.method === "POST") {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "invalid json" }, 400);
    }
    if (!body || !Array.isArray(body.items)) {
      return json({ error: "expected { items: [...] }" }, 400);
    }
    const items = body.items
      .filter((it) => it && typeof it.text === "string" && it.text.trim())
      .slice(0, MAX_ITEMS)
      .map((it) => ({
        text: it.text.slice(0, MAX_TEXT_LENGTH),
        done: Boolean(it.done),
      }));
    await env.TODOS.put("items", JSON.stringify(items));
    return json({ ok: true, count: items.length });
  }

  return json({ error: "method not allowed" }, 405);
}
