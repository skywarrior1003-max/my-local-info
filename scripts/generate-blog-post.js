const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');

// .env.local 파일 로드 함수 (로컬 실행 시 환경변수 불러오기용)
function loadEnvLocal() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fsSync.existsSync(envPath)) {
      const envContent = fsSync.readFileSync(envPath, 'utf8');
      envContent.split(/\r?\n/).forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
          if (key && !process.env[key]) {
            process.env[key] = value;
          }
        }
      });
    }
  } catch (e) {
    console.warn('.env.local 파일을 로드하는 데 실패했습니다:', e.message);
  }
}

// 환경변수 미리 로드
loadEnvLocal();

// Pexels API 호출 함수
async function fetchPexelsImage(keyword, apiKey) {
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=1`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.photos && data.photos.length > 0) {
        return {
          url: data.photos[0].src.large,
          photographer: data.photos[0].photographer
        };
      }
    }
  } catch (err) {
    console.error(`Pexels 이미지 검색 실패 (키워드: "${keyword}"):`, err.message);
  }
  return null;
}

// 최적의 이미지 검색 및 매칭 함수
async function getBlogImage(item, apiKey) {
  let name = (item.name || '').replace(/부산시|부산|남구/g, '').trim();

  // 1. 이름으로 검색 (예: "봄꽃 축제")
  let image = await fetchPexelsImage(name, apiKey);
  if (image) return image;

  // 2. 이름의 첫 두 단어로 축소 검색 (예: "청년 창업")
  const words = name.split(/\s+/).filter(w => w.length > 1);
  if (words.length > 1) {
    const query = words.slice(0, 2).join(' ');
    image = await fetchPexelsImage(query, apiKey);
    if (image) return image;
  }

  // 3. 카테고리 기반 영문 검색어 fallback
  const categoryFallback = item.category === '행사' ? 'festival' : 'welfare';
  image = await fetchPexelsImage(categoryFallback, apiKey);
  if (image) return image;

  // 4. 최종 기본값
  return fetchPexelsImage('korea', apiKey);
}

async function main() {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

    if (!GEMINI_API_KEY) {
      console.error('Error: GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
      process.exit(1);
    }

    // 1. 최신 데이터 확인
    const localInfoPath = path.join(process.cwd(), 'public/data/local-info.json');
    const localContent = await fs.readFile(localInfoPath, 'utf8');
    const localData = JSON.parse(localContent);

    const postsDir = path.join(process.cwd(), 'src/content/posts');
    const postFiles = await fs.readdir(postsDir);
    const existingPostsContent = [];

    for (const file of postFiles) {
      if (file.endsWith('.md')) {
        const content = await fs.readFile(path.join(postsDir, file), 'utf8');
        existingPostsContent.push(content);
      }
    }

    const lastEvent = localData.events[localData.events.length - 1];
    const lastBenefit = localData.benefits[localData.benefits.length - 1];

    let targetItem = null;
    // 이벤트나 혜택의 가장 마지막 항목 중 이미 블로그에 쓰이지 않은 것 선택
    if (lastBenefit && !existingPostsContent.some(c => c.includes(lastBenefit.name))) {
      targetItem = lastBenefit;
    } else if (lastEvent && !existingPostsContent.some(c => c.includes(lastEvent.name))) {
      targetItem = lastEvent;
    }

    if (!targetItem) {
      console.log('이미 모든 최신 항목에 대해 블로그 글이 작성되었습니다.');
      return;
    }

    console.log(`새로운 글 작성 대상 선별 완료: "${targetItem.name}". 블로그 글 생성 중...`);

    // 2. Gemini AI로 블로그 글 생성
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const prompt = `아래 공공서비스 정보를 바탕으로 블로그 글을 작성해줘.

정보: ${JSON.stringify(targetItem, null, 2)}

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (친근하고 흥미로운 제목)
date: ${todayStr}
summary: (한 줄 요약)
category: 정보
tags: [태그1, 태그2, 태그3]
---

(본문: 800자 이상, 친근한 블로그 톤, 추천 이유 3가지 포함, 신청 방법 안내)

마지막 줄에 FILENAME: YYYY-MM-DD-keyword 형식으로 파일명도 출력해줘. 키워드는 영문으로.`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API 호출 실패: ${geminiResponse.status} ${geminiResponse.statusText}`);
    }

    const geminiData = await geminiResponse.json();
    let generatedText = '';
    try {
      generatedText = geminiData.candidates[0].content.parts[0].text.trim();
    } catch (err) {
      throw new Error('Gemini 응답 형식이 올바르지 않습니다.');
    }

    // 파일명 추출
    const filenameMatch = generatedText.match(/FILENAME:\s*([^\r\n]+)/i);
    if (!filenameMatch) {
      throw new Error('파일명(FILENAME) 정보를 Gemini 응답에서 찾을 수 없습니다.');
    }

    let filename = filenameMatch[1].trim();
    // 확장자(.md)가 없으면 붙여줌
    if (!filename.endsWith('.md')) {
      filename += '.md';
    }

    // 본문에서 FILENAME 줄 제거 및 마크다운 코드블록 백틱 제거
    let blogContent = generatedText.replace(/FILENAME:.*$/i, '').trim();
    blogContent = blogContent.replace(/^```markdown\s*/i, '').replace(/```$/, '').trim();

    // 3. Pexels 이미지 검색 및 본문 삽입 (에러 발생 시에도 글은 작성될 수 있도록 예외처리)
    if (PEXELS_API_KEY) {
      console.log(`Pexels 이미지 매칭 시도 중...`);
      try {
        const image = await getBlogImage(targetItem, PEXELS_API_KEY);
        if (image) {
          const parts = blogContent.split('---');
          if (parts.length >= 3) {
            const frontmatter = parts[1];
            const body = parts.slice(2).join('---').trim();
            const imageMarkdown = `\n\n![${targetItem.name}](${image.url})\n*Photo by ${image.photographer} on Pexels*\n\n`;
            blogContent = `---${frontmatter}---\n${imageMarkdown}${body}`;
            console.log(`성공적으로 본문에 이미지를 삽입했습니다: ${image.url}`);
          } else {
            // 구조가 안 맞을 경우 글의 가장 맨 앞 부분에 강제 삽입
            blogContent = `![${targetItem.name}](${image.url})\n*Photo by ${image.photographer} on Pexels*\n\n${blogContent}`;
          }
        } else {
          console.warn('조건에 맞는 이미지를 찾지 못했습니다.');
        }
      } catch (imageError) {
        console.error('Pexels 이미지 처리 중 에러 발생:', imageError.message);
      }
    } else {
      console.log('PEXELS_API_KEY 환경변수가 설정되지 않아 이미지 매칭을 생략합니다.');
    }

    // 4. 파일 저장
    const targetFilePath = path.join(postsDir, filename);
    await fs.writeFile(targetFilePath, blogContent, 'utf8');

    console.log(`블로그 글 생성 및 저장 완료: ${filename}`);

  } catch (error) {
    console.error('실행 중 에러 발생 (기존 파일이 유지됩니다):', error);
  }
}

main();
