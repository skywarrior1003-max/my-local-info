import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';

interface Item {
  id: string;
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  target: string;
  summary: string;
  link: string;
}

interface LocalInfoData {
  events: Item[];
  benefits: Item[];
  lastUpdated: string;
}

// 정적 사이트 생성용: 미리 만들 페이지 목록
export async function generateStaticParams() {
  const jsonDirectory = path.join(process.cwd(), 'public/data');
  const fileContents = await fs.readFile(jsonDirectory + '/local-info.json', 'utf8');
  const data: LocalInfoData = JSON.parse(fileContents);

  return [
    ...data.events.map((item) => ({ id: item.id })),
    ...data.benefits.map((item) => ({ id: item.id })),
  ];
}

export default async function InfoDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const jsonDirectory = path.join(process.cwd(), 'public/data');
  const fileContents = await fs.readFile(jsonDirectory + '/local-info.json', 'utf8');
  const data: LocalInfoData = JSON.parse(fileContents);

  // id에 해당하는 항목 찾기 (행사 → 혜택 순서로 탐색)
  const item = data.events.find((e) => e.id === id) || data.benefits.find((b) => b.id === id);

  const isEvent = item?.category === '행사';

  // 해당 항목이 없을 때
  if (!item) {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-2xl">😢</p>
        <h1 className="text-xl font-bold text-gray-700">정보를 찾을 수 없어요.</h1>
        <Link
          href="/"
          className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition"
        >
          ← 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-gray-800">

      {/* ===== 헤더 (메인과 동일한 스타일) ===== */}
      <header className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition">
            <h1 className="text-2xl font-extrabold tracking-tight">🏘️ 성남시 생활 정보</h1>
            <p className="text-orange-100 text-sm mt-0.5">우리 동네 행사·혜택을 한눈에!</p>
          </Link>
          <span className="hidden sm:block text-sm bg-white/20 backdrop-blur px-4 py-1.5 rounded-full font-semibold border border-white/30">
            상세 정보 📋
          </span>
        </div>
      </header>

      {/* ===== 상세 콘텐츠 ===== */}
      <main className="max-w-3xl mx-auto px-6 py-10">

        {/* 뒤로 가기 버튼 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-700 mb-8 transition group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          목록으로 돌아가기
        </Link>

        {/* 카드 영역 */}
        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden">

          {/* 카드 상단 컬러 배너 */}
          <div className={`px-8 pt-8 pb-6 ${isEvent ? 'bg-orange-50 border-b border-orange-100' : 'bg-amber-50 border-b border-amber-100'}`}>
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 ${isEvent ? 'bg-orange-100 text-orange-600' : 'bg-amber-100 text-amber-700'}`}>
              {item.category}
            </span>
            {/* 행사/혜택 이름 (크게) */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              {item.name}
            </h1>
          </div>

          {/* 핵심 정보 (기간, 장소, 대상) */}
          <div className="px-8 py-6 space-y-4 border-b border-gray-100 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
              <span className="text-gray-400 text-sm font-semibold w-12 shrink-0">기간</span>
              <span className="text-gray-800 font-bold">
                {item.startDate}
                {item.endDate && item.endDate !== item.startDate ? ` ~ ${item.endDate}` : ''}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
              <span className="text-gray-400 text-sm font-semibold w-12 shrink-0">장소</span>
              <span className="text-gray-800 font-bold flex items-center gap-1.5">
                📍 {item.location}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
              <span className="text-gray-400 text-sm font-semibold w-12 shrink-0">대상</span>
              <span className="text-gray-800 font-bold flex items-center gap-1.5">
                👥 {item.target}
              </span>
            </div>
          </div>

          {/* 상세 설명 전문 */}
          <div className="px-8 py-8">
            <h2 className="text-lg font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100">
              📝 상세 안내
            </h2>
            <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line">
              {item.summary}
            </p>
          </div>

          {/* 원본 사이트 링크 버튼 */}
          <div className="px-8 pb-8">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white text-lg font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${isEvent ? 'bg-orange-500 hover:bg-orange-600' : 'bg-amber-500 hover:bg-amber-600'}`}
            >
              자세히 보기 →
            </a>
          </div>

        </div>
      </main>

    </div>
  );
}
