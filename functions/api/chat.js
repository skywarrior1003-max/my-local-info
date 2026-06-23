export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.AI) {
    return Response.json({ error: 'AI binding not configured' }, { status: 500 });
  }

  let question;
  try {
    const body = await request.json();
    question = body.question;
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!question) {
    return Response.json({ error: 'question is required' }, { status: 400 });
  }

  try {
    const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast', {
      max_tokens: 300,
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant for a Korean local information blog. Answer in Korean.',
        },
        {
          role: 'user',
          content: question,
        },
      ],
    });

    return Response.json({ answer: result.response });
  } catch (error) {
    return Response.json({ error: 'AI 호출 실패', details: error.message }, { status: 500 });
  }
}
