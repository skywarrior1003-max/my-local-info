import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPostBySlug, getAllPosts } from '@/lib/posts';
import AdBanner from '@/components/AdBanner';
import CoupangBanner from '@/components/CoupangBanner';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: '포스트를 찾을 수 없습니다',
    };
  }

  return {
    title: `${post.title} | 성남시 생활 정보`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      url: `https://my-local-info-3pm.pages.dev/blog/${slug}`,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // E-E-A-T: 공공데이터 원문 출처 매칭
  let sourceLink = '';
  const jsonPath = path.join(process.cwd(), 'public/data/local-info.json');
  if (fs.existsSync(jsonPath)) {
    try {
      const rawData = fs.readFileSync(jsonPath, 'utf8');
      const localData = JSON.parse(rawData);
      const allItems = [...localData.events, ...localData.benefits];
      const match = allItems.find((item: any) => 
        post.title.includes(item.name) || 
        post.content.includes(item.name) || 
        (item.name && item.name.split(' ').some((word: string) => word.length > 1 && post.title.includes(word)))
      );
      if (match && match.link && match.link !== '#') {
        sourceLink = match.link;
      }
    } catch (e) {
      console.error('E-E-A-T 출처 매칭 오류:', e);
    }
  }

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "datePublished": post.date,
    "description": post.summary,
    "author": {
      "@type": "Organization",
      "name": "성남시 생활 정보",
      "url": "https://my-local-info-3pm.pages.dev"
    },
    "publisher": {
      "@type": "Organization",
      "name": "성남시 생활 정보",
      "logo": {
        "@type": "ImageObject",
        "url": "https://my-local-info-3pm.pages.dev/favicon.ico"
      }
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-gray-800">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      {/* ===== 헤더 ===== */}
      <header className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition">
            <h1 className="text-2xl font-extrabold tracking-tight">🏘️ 성남시 생활 정보</h1>
            <p className="text-orange-100 text-sm mt-0.5">우리 동네 행사·혜택을 한눈에!</p>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm hover:underline transition">
              홈
            </Link>
            <Link href="/about" className="text-sm hover:underline transition">
              소개 ℹ️
            </Link>
            <Link href="/blog" className="text-sm bg-white/20 backdrop-blur px-4 py-1.5 rounded-full font-semibold border border-white/30 hover:bg-white/30 transition">
              블로그 📝
            </Link>
          </div>
        </div>
      </header>

      {/* ===== 상세 콘텐츠 ===== */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* 뒤로 가기 */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-700 mb-8 transition group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          블로그 목록으로 돌아가기
        </Link>

        {/* 글 본문 영역 */}
        <article className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden p-8 sm:p-12">
          {/* 머리글 */}
          <div className="border-b border-gray-100 pb-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full">
                {post.category || '생활 정보'}
              </span>
              <div className="text-right">
                <span className="text-gray-400 text-xs block">작성일: {post.date}</span>
                <span className="text-orange-500 text-xs font-semibold block mt-0.5">최종 업데이트: {post.date}</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              {post.title}
            </h1>
            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span key={tag} className="bg-gray-50 text-gray-500 text-xs font-medium px-2.5 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 마크다운 본문 */}
          <div className="prose prose-orange max-w-none prose-headings:font-bold prose-a:text-orange-600 prose-img:rounded-2xl mb-10">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* 광고 배너 */}
          <AdBanner />
          <CoupangBanner />

          {/* ===== E-E-A-T 영역 ===== */}
          <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
            {/* 원문 출처 강화 */}
            {sourceLink && (
              <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">📌 공공서비스 원문 출처 안내</h4>
                  <p className="text-xs text-gray-500 mt-1">본 서비스의 상세 내용 및 실시간 신청 현황은 공식 포털에서 확인할 수 있습니다.</p>
                </div>
                <a
                  href={sourceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex justify-center items-center bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-full transition shadow-sm text-center"
                >
                  공식 홈페이지 바로가기 ↗
                </a>
              </div>
            )}

            {/* AI 생성 정보 공개 */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
              <p className="text-xs text-gray-600 leading-relaxed">
                🤖 <strong>AI 생성 정보 공지</strong><br />
                이 글은 공공데이터포털(<a href="https://data.go.kr" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">data.go.kr</a>)의 공개 자료를 바탕으로 AI 기술을 활용해 이해하기 쉽게 작성되었습니다. 공공서비스의 신청 자격, 지원 금액, 상세 조건 등은 소관 기관의 사정에 따라 변동될 수 있으므로, 정확한 최신 정보는 반드시 공식 원문 링크를 통해 다시 한 번 확인해 주시기 바랍니다.
              </p>
            </div>
          </div>
        </article>
      </main>

      {/* ===== 하단 푸터 ===== */}
      <footer className="bg-orange-100 border-t border-orange-200 mt-12 py-8 text-center text-sm text-orange-800">
        <div className="max-w-5xl mx-auto px-6 space-y-1.5">
          <p className="font-bold text-base">📊 데이터 출처: 공공데이터포털 (data.go.kr)</p>
          <p className="text-xs text-orange-400 mt-3">© 2024 성남시 생활 정보. 본 사이트는 공공데이터를 활용하여 제작되었습니다.</p>
        </div>
      </footer>
    </div>
  );
}
