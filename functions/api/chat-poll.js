export async function onRequestGet(context) {
  const { request, env } = context;

  if (!env.CHAT_KV) {
    return Response.json({ error: 'CHAT_KV binding not configured' }, { status: 500 });
  }

  const url = new URL(request.url);
  const senderFilter = url.searchParams.get('sender');
  const lastId = url.searchParams.get('lastId');

  const listed = await env.CHAT_KV.list({ prefix: 'msg_' });

  const keys = listed.keys
    .map((k) => k.name)
    .filter((name) => (lastId ? name > lastId : true))
    .sort();

  const messages = [];
  for (const key of keys) {
    const raw = await env.CHAT_KV.get(key);
    if (!raw) continue;

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      continue;
    }

    if (senderFilter && data.sender !== senderFilter) continue;

    messages.push({
      id: key,
      sessionId: data.sessionId ?? null,
      text: data.message,
      sender: data.sender,
      timestamp: data.timestamp,
    });
  }

  return Response.json({ messages });
}
