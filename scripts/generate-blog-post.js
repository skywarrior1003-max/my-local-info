const fs = require('fs/promises');
const path = require('path');

async function main() {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
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
      console.log('이미 작성된 글입니다');
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

    // 본문에서 FILENAME 줄 제거
    let blogContent = generatedText.replace(/FILENAME:.*$/i, '').trim();

    // 3. 파일 저장
    const targetFilePath = path.join(postsDir, filename);
    await fs.writeFile(targetFilePath, blogContent, 'utf8');

    console.log(`블로그 글 생성 및 저장 완료: ${filename}`);

  } catch (error) {
    console.error('실행 중 에러 발생 (기존 파일이 유지됩니다):', error);
  }
}

main();
