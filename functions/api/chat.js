function stripMarkdown(text) {
  return text
    .replace(/\*{1,3}(.*?)\*{1,3}/gs, '$1')
    .replace(/_{1,2}(.*?)_{1,2}/gs, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function buildSearchText(entry) {
  return [
    entry.name ?? '',
    entry.title ?? '',
    entry.summary ?? '',
    entry.content ?? '',
    entry.category ?? '',
    entry.location ?? '',
  ]
    .join(' ')
    .toLowerCase();
}

function getTopMatches(index, question, topN = 3) {
  const words = question
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1);

  const scored = index.map((entry) => {
    const searchText = buildSearchText(entry);
    const score = words.reduce(
      (acc, word) => acc + (searchText.includes(word) ? 1 : 0),
      0
    );
    return { entry, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((s) => s.entry);
}

function formatEntry(entry) {
  if (entry.type === 'post') {
    return `제목: ${entry.title}\n요약: ${entry.summary}`;
  }
  return `이름: ${entry.name}\n요약: ${entry.summary}\n장소: ${entry.location ?? ''}\n기간: ${entry.startDate ?? ''} ~ ${entry.endDate ?? ''}`;
}

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
    // RAG: fetch search index and find top matches
    const origin = new URL(request.url).origin;
    const indexRes = await fetch(`${origin}/data/search-index.json`);
    const searchIndex = await indexRes.json();

    const matches = getTopMatches(searchIndex, question);
    const blogData =
      matches.length > 0
        ? matches.map(formatEntry).join('\n\n')
        : '관련 데이터 없음';

    const systemPrompt = `You are an AI assistant for a Korean local information blog.
Answer ONLY in Korean. Keep answers to 2-3 sentences maximum.
Do NOT use any markdown symbols (**, *, #, -). Plain text only.
Base your answer ONLY on the following blog data. If not relevant, reply: 해당 내용은 블로그에서 확인이 어렵습니다. 다른 질문을 해주세요.

[블로그 데이터]
${blogData}`;

    const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast', {
      max_tokens: 150,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
    });

    return Response.json({ answer: stripMarkdown(result.response) });
  } catch (error) {
    return Response.json({ error: 'AI 호출 실패', details: error.message }, { status: 500 });
  }
}
