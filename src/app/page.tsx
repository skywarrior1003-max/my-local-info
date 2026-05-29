import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import AdBanner from '@/components/AdBanner';

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

export default async function Home() {
  // 데이터 불러오기 (나중에 API로 교체할 부분입니다)
  const jsonDirectory = path.join(process.cwd(), 'public/data');
  const fileContents = await fs.readFile(jsonDirectory + '/local-info.json', 'utf8');
  const data: LocalInfoData = JSON.parse(fileContents);

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-gray-800">

      {/* ===== 1. 상단 헤더 ===== */}
      <header className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition text-left">
            <h1 className="text-2xl font-extrabold tracking-tight">🏘️ 성남시 생활 정보</h1>
            <p className="text-orange-100 text-sm mt-0.5">우리 동네 행사·혜택을 한눈에!</p>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-sm hover:underline transition">
              소개 ℹ️
            </Link>
            <Link href="/blog" className="text-sm bg-white/20 backdrop-blur px-4 py-1.5 rounded-full font-semibold border border-white/30 hover:bg-white/30 transition">
              블로그 📝
            </Link>
          </div>
        </div>
      </header>

      {/* ===== 메인 콘텐츠 ===== */}
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-14">

        {/* ===== 2. 이번 달 행사/축제 섹션 ===== */}
        <section>
          <div className="flex items-center gap-3 mb-7">
            <span className="text-3xl">🎉</span>
            <div>
              <h2 className="text-2xl font-extrabold text-orange-600">이번 달 행사/축제</h2>
              <p className="text-sm text-gray-500 mt-0.5">놓치지 말아야 할 우리 동네 행사</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.events.map((item) => {
              const cleanDate = (dateStr: string) => {
                if (!dateStr) return '2026-01-01';
                if (dateStr.includes('월')) {
                  const parts = dateStr.replace('일', '').split('월').map(v => v.trim().padStart(2, '0'));
                  return `2026-${parts[0]}-${parts[1]}`;
                }
                return dateStr;
              };
              const eventJsonLd = {
                "@context": "https://schema.org",
                "@type": "Event",
                "name": item.name,
                "startDate": cleanDate(item.startDate),
                "endDate": cleanDate(item.endDate),
                "location": {
                  "@type": "Place",
                  "name": item.location,
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "성남시"
                  }
                },
                "description": item.summary
              };
              return (
                <Link
                  key={item.id}
                  href="/blog"
                  className="group bg-white rounded-2xl p-5 shadow-sm border border-orange-100 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
                  />
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full">
                      {item.category}
                    </span>
                    <span className="text-gray-400 text-xs">{item.startDate} ~ {item.endDate}</span>
                  </div>
                  <h3 className="text-base font-bold mb-2 group-hover:text-orange-500 transition-colors leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed flex-grow line-clamp-3">
                    {item.summary}
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-xs text-gray-500 font-medium">
                    <p className="flex items-center gap-2">📍 {item.location}</p>
                    <p className="flex items-center gap-2">👥 {item.target}</p>
                  </div>
                  <div className="mt-4 text-orange-500 text-sm font-semibold group-hover:gap-2 flex items-center gap-1 transition-all">
                    자세히 보기 <span>→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 광고 배너 */}
        <AdBanner />

        {/* ===== 3. 지원금/혜택 섹션 ===== */}
        <section>
          <div className="flex items-center gap-3 mb-7">
            <span className="text-3xl">💰</span>
            <div>
              <h2 className="text-2xl font-extrabold text-amber-600">지원금/혜택 정보</h2>
              <p className="text-sm text-gray-500 mt-0.5">나에게 맞는 지원금을 찾아보세요</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.benefits.map((item) => {
              const serviceJsonLd = {
                "@context": "https://schema.org",
                "@type": "GovernmentService",
                "name": item.name,
                "description": item.summary,
                "provider": {
                  "@type": "GovernmentOrganization",
                  "name": item.location.includes('주민센터') || item.location.includes('시청') ? "성남시" : "대한민국 정부"
                }
              };
              return (
                <Link
                  key={item.id}
                  href="/blog"
                  className="group bg-white rounded-2xl p-5 shadow-sm border border-amber-100 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
                  />
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      {item.category}
                    </span>
                    <span className="text-gray-400 text-xs">{item.startDate}</span>
                  </div>
                  <h3 className="text-base font-bold mb-2 group-hover:text-amber-600 transition-colors leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed flex-grow line-clamp-3">
                    {item.summary}
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-xs text-gray-500 font-medium">
                    <p className="flex items-center gap-2">📍 {item.location}</p>
                    <p className="flex items-center gap-2">👥 {item.target}</p>
                  </div>
                  <div className="mt-4 text-amber-600 text-sm font-semibold group-hover:gap-2 flex items-center gap-1 transition-all">
                    자세히 보기 <span>→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

      </main>

      {/* ===== 4. 하단 푸터 ===== */}
      <footer className="bg-orange-100 border-t border-orange-200 mt-6 py-8 text-center text-sm text-orange-800">
        <div className="max-w-5xl mx-auto px-6 space-y-1.5">
          <p className="font-bold text-base">📊 데이터 출처: 공공데이터포털 (data.go.kr)</p>
          <p className="text-orange-600">마지막 업데이트: {data.lastUpdated}</p>
          <p className="text-xs text-orange-400 mt-3">© 2024 성남시 생활 정보. 본 사이트는 공공데이터를 활용하여 제작되었습니다.</p>
        </div>
      </footer>

    </div>
  );
}
