import Link from 'next/link';

export const metadata = {
  title: '소개 및 안내 | 부산시 생활 정보',
  description: '부산시 생활 정보 사이트의 운영 목적, 데이터 출처, 콘텐츠 생성 방식 및 신뢰성 공지를 확인하세요.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-orange-50 font-sans text-gray-800">
      {/* ===== 헤더 ===== */}
      <header className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition">
            <h1 className="text-2xl font-extrabold tracking-tight">🏘️ 부산시 생활 정보</h1>
            <p className="text-orange-100 text-sm mt-0.5">우리 동네 행사·혜택을 한눈에!</p>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm hover:underline transition">
              홈
            </Link>
            <Link href="/about" className="text-sm font-bold border-b-2 border-white pb-0.5 transition">
              소개 ℹ️
            </Link>
            <Link href="/blog" className="text-sm bg-white/20 backdrop-blur px-4 py-1.5 rounded-full font-semibold border border-white/30 hover:bg-white/30 transition">
              블로그 📝
            </Link>
          </div>
        </div>
      </header>

      {/* ===== 메인 콘텐츠 ===== */}
      <main className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        <div className="text-center">
          <span className="text-5xl block mb-4">ℹ️</span>
          <h2 className="text-3xl font-extrabold text-orange-600 mb-2">부산시 생활 정보 소개</h2>
          <p className="text-gray-500 text-sm">보다 투명하고 신뢰할 수 있는 지역 정보 생태계를 지향합니다.</p>
        </div>

        <div className="space-y-6">
          {/* 1. 운영 목적 */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-orange-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2.5">
              <span className="text-xl">🎯</span> 운영 목적
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              부산시 생활 정보 사이트는 지역 주민분들이 일상 속에서 누려야 할 다양한 <strong>축제, 문화 행사, 지원 정책 및 생활 혜택</strong> 정보를 한 곳에서 편리하게 확인하실 수 있도록 돕기 위해 구축되었습니다. 바쁜 일상 속에서 복잡한 기관 공지사항들을 일일이 찾아다니지 않고도, 나에게 꼭 필요한 혜택과 즐길 거리를 놓치지 않고 챙기실 수 있는 지역 정보 가이드가 되고자 합니다.
            </p>
          </section>

          {/* 2. 데이터 출처 */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-orange-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2.5">
              <span className="text-xl">📊</span> 공공데이터 출처 및 준수
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              본 사이트에 게재되는 축제 및 혜택 등의 기초 정보는 대한민국 정부 공식 플랫폼인 <strong>공공데이터포털(data.go.kr)</strong>의 오픈 API 데이터를 엄격하게 가공하고 필터링하여 제공됩니다. 데이터의 원천 출처는 보건복지부, 행정안전부, 해양수산부 및 부산시 소관 기관이며, 공공 정보의 왜곡 없는 전달을 위해 최선을 다하고 있습니다.
            </p>
          </section>

          {/* 3. 콘텐츠 생성 및 AI 활용 공지 */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-orange-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2.5">
              <span className="text-xl">🤖</span> 콘텐츠 작성 및 AI 기술 활용
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              우리 동네 소식 블로그 게시글은 수집된 건조하고 복잡한 공공 데이터 원문을 기반으로, <strong>최첨단 인공지능(AI) 기술(Google Gemini 2.5 Flash 모델)</strong>을 적용하여 주민분들께서 친근하게 읽으실 수 있는 구어체 형태의 블로그 글로 자동 다듬어 구성하고 있습니다. 
            </p>
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 mt-4 text-xs text-gray-500 leading-relaxed">
              ⚠️ <strong>신뢰성 및 법적 고지</strong><br />
              인공지능을 활용하는 특성상 각 서비스의 정확한 지원 자격, 제출 서류, 세부 조건 및 예산 상황 등은 실제 정부 부처나 지자체의 최종 집행 과정에서 실시간으로 변경될 수 있습니다. 본 사이트에서 제공되는 모든 콘텐츠는 단순 참조용이므로, 실제로 지원금을 신청하거나 행사에 참여하시기 전에는 <strong>각 글 하단에 명시된 원문 출처(정부24 및 소관부처 링크)</strong>를 통해 정확한 최신 조건을 직접 다시 확인해 주실 것을 강력하게 권장해 드립니다.
            </div>
          </section>
        </div>
      </main>

      {/* ===== 하단 푸터 ===== */}
      <footer className="bg-orange-100 border-t border-orange-200 mt-12 py-8 text-center text-sm text-orange-800">
        <div className="max-w-5xl mx-auto px-6 space-y-1.5">
          <p className="font-bold text-base">📊 데이터 출처: 공공데이터포털 (data.go.kr)</p>
          <p className="text-xs text-orange-400 mt-3">© 2024 부산시 생활 정보. 본 사이트는 공공데이터를 활용하여 제작되었습니다.</p>
        </div>
      </footer>
    </div>
  );
}
