export async function onRequest(context) {
  const { request, env } = context;
  
  // 1. 브라우저에서 보낸 검색어(query) 파라미터를 가져옵니다.
  const url = new URL(request.url);
  const query = url.searchParams.get('query') || 'korea';

  // 2. Cloudflare Pages 환경변수에서 API 키를 가져옵니다.
  const apiKey = env.PEXELS_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Pexels API key is not configured in Cloudflare environment' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }

  try {
    // 3. 펙셀스(Pexels) API 대리 호출
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=12`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch images from Pexels' }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        }
      );
    }

    const data = await response.json();
    
    // 4. 결과를 브라우저에 반환
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // 브라우저 캐싱 1시간 적용
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error occurred', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
}
