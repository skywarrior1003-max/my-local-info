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

async function main() {
  try {
    const PUBLIC_DATA_API_KEY = process.env.PUBLIC_DATA_API_KEY;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!PUBLIC_DATA_API_KEY) {
      console.error('Error: PUBLIC_DATA_API_KEY 환경변수가 설정되지 않았습니다.');
      process.exit(1);
    }
    if (!GEMINI_API_KEY) {
      console.error('Error: GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
      process.exit(1);
    }

    // 1. 공공데이터포털 API에서 데이터 가져오기
    console.log('공공데이터포털 API에서 데이터를 가져오는 중...');
    const url = new URL('https://api.odcloud.kr/api/gov24/v3/serviceList');
    url.searchParams.append('page', '1');
    url.searchParams.append('perPage', '20');
    url.searchParams.append('returnType', 'JSON');
    url.searchParams.append('serviceKey', PUBLIC_DATA_API_KEY);

    const apiResponse = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Infuser ${PUBLIC_DATA_API_KEY}`
      }
    });

    if (!apiResponse.ok) {
      throw new Error(`API 호출 실패: ${apiResponse.status} ${apiResponse.statusText}`);
    }

    const apiData = await apiResponse.json();
    const items = apiData.data || [];

    if (items.length === 0) {
      console.log('가져온 공공데이터가 없습니다.');
      return;
    }

    // 필터링 도우미 함수
    const checkContains = (item, term) => {
      const keys = ['서비스명', '서비스목적요약', '지원대상', '소관기관명', 'serviceNm', 'servicePurposeSummary', 'supportTarget', 'agencyNm'];
      for (const key of keys) {
        if (item[key] && String(item[key]).includes(term)) return true;
      }
      return Object.values(item).some(val => val && String(val).includes(term));
    };

    // 필터링 규칙 적용
    let filtered = items.filter(item => checkContains(item, '부산'));
    if (filtered.length === 0) {
      console.log('"부산" 포함 항목이 없어 전체 데이터를 사용합니다.');
      filtered = items;
    }

    // 2. 기존 데이터와 비교
    const localInfoPath = path.join(process.cwd(), 'public/data/local-info.json');
    let localData = { events: [], benefits: [], lastUpdated: '' };
    try {
      const fileContent = await fs.readFile(localInfoPath, 'utf8');
      localData = JSON.parse(fileContent);
    } catch (err) {
      console.warn('기존 local-info.json 파일을 읽을 수 없어 새로 생성합니다.', err.message);
    }

    const existingNames = new Set([
      ...localData.events.map(e => e.name),
      ...localData.benefits.map(b => b.name)
    ]);

    // 이미 존재하는 항목 제외
    const newItems = filtered.filter(item => {
      const name = item['서비스명'] || item['serviceNm'] || '';
      return name && !existingNames.has(name);
    });

    if (newItems.length === 0) {
      console.log('새로운 데이터가 없습니다');
      return;
    }

    // 새 항목 1개 선정
    const targetItem = newItems[0];
    const targetName = targetItem['서비스명'] || targetItem['serviceNm'] || '알 수 없는 서비스';
    console.log(`새로운 항목 발견: "${targetName}". Gemini AI 분석 중...`);

    // 3. Gemini AI로 새 항목 1개만 가공
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const prompt = `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식:
{id: 숫자, name: 서비스명, category: '행사' 또는 '혜택', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약, link: 상세URL}
category는 내용을 보고 행사/축제면 '행사', 지원금/서비스면 '혜택'으로 판단해.
startDate가 없으면 오늘 날짜 (${todayStr}), endDate가 없으면 '상시'로 넣어.
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

분석할 데이터:
${JSON.stringify(targetItem, null, 2)}`;

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
    let textResult = '';
    try {
      textResult = geminiData.candidates[0].content.parts[0].text.trim();
    } catch (err) {
      throw new Error('Gemini 응답 형식이 올바르지 않습니다.');
    }

    // 마크다운 코드 블록 제거 및 순수 JSON 추출
    const jsonMatch = textResult.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Gemini 응답에서 JSON 객체를 찾을 수 없습니다.');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // 4. 기존 데이터 구조에 맞게 ID 및 필드 가공 후 추가
    const isEvent = parsed.category === '행사';
    const listToPush = isEvent ? localData.events : localData.benefits;
    const prefix = isEvent ? 'e' : 'b';
    const newId = `${prefix}${listToPush.length + 1}`;

    const processedItem = {
      id: newId,
      name: parsed.name || targetName,
      category: isEvent ? '행사' : '혜택',
      startDate: parsed.startDate || todayStr,
      endDate: parsed.endDate || '상시',
      location: parsed.location || targetItem['소관기관명'] || targetItem['agencyNm'] || '상세 내용 참조',
      target: parsed.target || targetItem['지원대상'] || targetItem['supportTarget'] || '상세 내용 참조',
      summary: parsed.summary || targetItem['서비스목적요약'] || targetItem['servicePurposeSummary'] || '상세 내용 참조',
      link: parsed.link || '#'
    };

    listToPush.push(processedItem);
    localData.lastUpdated = todayStr;

    // 변경사항 저장
    await fs.writeFile(localInfoPath, JSON.stringify(localData, null, 2), 'utf8');
    console.log(`성공적으로 새 항목이 추가되었습니다: ${processedItem.name} (${processedItem.category})`);

  } catch (error) {
    console.error('실행 중 에러 발생 (기존 데이터가 유지됩니다):', error);
  }
}

main();
