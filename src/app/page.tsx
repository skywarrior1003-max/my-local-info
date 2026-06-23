import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import AdBanner from '@/components/AdBanner';
import SafeImage from '@/components/SafeImage';

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

const ITEM_IMAGES: Record<string, string> = {
  "e1": "https://images.pexels.com/photos/1119075/pexels-photo-1119075.jpeg?auto=compress&cs=tinysrgb&w=600", // 광안리어방축제 (전통 배/바다)
  "e2": "https://images.pexels.com/photos/7519262/pexels-photo-7519262.jpeg?auto=compress&cs=tinysrgb&w=600", // 부산항 축제 (부산항/선박)
  "e3": "https://images.pexels.com/photos/11926336/pexels-photo-11926336.jpeg?auto=compress&cs=tinysrgb&w=600", // UN 평화축제 (만국기/UN 평화공원)
  "b1": "https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=600", // 어린이집 무상보육 (아이들/놀이)
  "b2": "https://images.pexels.com/photos/97079/pexels-photo-97079.jpeg?auto=compress&cs=tinysrgb&w=600", // 고령 운전자 면허 반납 (자동차 열쇠 반납)
  "b3": "https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=600", // 부산형 통합돌봄 (돌봄 지원/간호)
};

const DEFAULT_EVENT_IMAGE = "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=600";
const DEFAULT_BENEFIT_IMAGE = "https://images.pexels.com/photos/101808/pexels-photo-101808.jpeg?auto=compress&cs=tinysrgb&w=600";

export default async function Home() {
  // 데이터 불러오기 (나중에 API로 교체할 부분입니다)
  const jsonDirectory = path.join(process.cwd(), 'public/data');
  const fileContents = await fs.readFile(jsonDirectory + '/local-info.json', 'utf8');
  const data: LocalInfoData = JSON.parse(fileContents);

  // 한국시간(KST) 기준 YYYY-MM-DD 구하기
  const kstFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = kstFormatter.formatToParts(new Date());
  const year = parts.find(p => p.type === 'year')?.value || '2026';
  const month = parts.find(p => p.type === 'month')?.value || '01';
  const day = parts.find(p => p.type === 'day')?.value || '01';
  const todayKst = `${year}-${month}-${day}`;

  const cleanDate = (dateStr: string) => {
    if (!dateStr) return '2026-01-01';
    if (dateStr.includes('월')) {
      const parts = dateStr.replace('일', '').split('월').map(v => v.trim().padStart(2, '0'));
      return `2026-${parts[0]}-${parts[1]}`;
    }
    return dateStr;
  };

  // 종료된 행사 제외 (KST 기준)
  const activeEvents = data.events.filter((item) => {
    const endFormatted = cleanDate(item.endDate || item.startDate);
    return endFormatted >= todayKst;
  });

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-gray-800">

      {/* ===== 1. 상단 헤더 ===== */}
      <header className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition text-left">
            <h1 className="text-2xl font-extrabold tracking-tight">🏘️ 부산시 생활 정보</h1>
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

        {/* ===== 1.5. 히어로 배너 (Hero Banner) ===== */}
        <div className="relative rounded-3xl overflow-hidden shadow-md bg-gradient-to-r from-orange-600/90 to-amber-500/90 text-white min-h-[300px] flex items-center p-8 md:p-12">
          {/* 배경 이미지 */}
          <div className="absolute inset-0 z-0">
            <SafeImage
              src="https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="부산시 전경"
              className="w-full h-full object-cover opacity-20 filter brightness-90 transition duration-700 ease-in-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/60 to-amber-500/50 backdrop-blur-[1px]"></div>
          </div>

          {/* 콘텐츠 */}
          <div className="relative z-10 max-w-2xl space-y-4 text-left">
            <span className="inline-block bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold tracking-wide border border-white/20">
              📅 매일 업데이트되는 부산 소식
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight drop-shadow-sm">
              우리 동네 행사와<br />
              나를 위한 혜택을 한눈에!
            </h2>
            <p className="text-orange-50 text-sm md:text-base font-medium opacity-90 leading-relaxed">
              공공데이터를 기반으로 신뢰할 수 있는 지역 축제, 행사 정보와 복지 혜택, 지원금 소식을 AI가 친절하게 요약해 드립니다.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-6 py-2.5 rounded-full text-sm shadow-md transition-all duration-300 transform hover:scale-[1.02]"
              >
                블로그 소식 읽기 📝
              </Link>
              <a
                href="#events"
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm font-semibold px-5 py-2.5 rounded-full text-sm transition-all duration-300"
              >
                이번 달 행사 보기 👇
              </a>
            </div>
          </div>
        </div>

        {/* ===== 2. 이번 달 행사/축제 섹션 ===== */}
        <section id="events">
          <div className="flex items-center gap-3 mb-7">
            <span className="text-3xl">🎉</span>
            <div>
              <h2 className="text-2xl font-extrabold text-orange-600">이번 달 행사/축제</h2>
              <p className="text-sm text-gray-500 mt-0.5">놓치지 말아야 할 우리 동네 행사</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeEvents.map((item) => {
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
                    "addressLocality": "부산시"
                  }
                },
                "description": item.summary
              };
              const imageUrl = ITEM_IMAGES[item.id] || DEFAULT_EVENT_IMAGE;
              return (
                <Link
                  key={item.id}
                  href="/blog"
                  className="group bg-white rounded-2xl shadow-sm border border-orange-100 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
                    suppressHydrationWarning
                  />
                  {/* 카드 이미지 */}
                  <div className="relative h-44 w-full overflow-hidden bg-orange-100">
                    <SafeImage
                      src={imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-orange-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  {/* 카드 내용 */}
                  <div className="p-5 flex flex-col flex-grow text-left">
                    <span className="text-gray-400 text-xs mb-2 block">{item.startDate} ~ {item.endDate}</span>
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
                  "name": item.location.includes('주민센터') || item.location.includes('시청') ? "부산시" : "대한민국 정부"
                }
              };
              const imageUrl = ITEM_IMAGES[item.id] || DEFAULT_BENEFIT_IMAGE;
              return (
                <Link
                  key={item.id}
                  href="/blog"
                  className="group bg-white rounded-2xl shadow-sm border border-amber-100 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
                    suppressHydrationWarning
                  />
                  {/* 카드 이미지 */}
                  <div className="relative h-44 w-full overflow-hidden bg-amber-50">
                    <SafeImage
                      src={imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-amber-600/90 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  {/* 카드 내용 */}
                  <div className="p-5 flex flex-col flex-grow text-left">
                    <span className="text-gray-400 text-xs mb-2 block">{item.startDate}</span>
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
          <p className="text-xs text-orange-400 mt-3">© 2024 부산시 생활 정보. 본 사이트는 공공데이터를 활용하여 제작되었습니다.</p>
        </div>
      </footer>

    </div>
  );
}
