export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.CHAT_KV) {
    return Response.json({ error: 'CHAT_KV binding not configured' }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { message, sender, sessionId } = body;

  if (!message || !sender) {
    return Response.json({ error: 'message and sender are required' }, { status: 400 });
  }

  const timestamp = Date.now();
  const key = `msg_${timestamp}`;
  const value = JSON.stringify({ message, sender, sessionId: sessionId ?? null, timestamp });

  await env.CHAT_KV.put(key, value);

  return Response.json({ ok: true, id: key });
}
