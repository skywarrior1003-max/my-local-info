import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPostBySlug, getAllPosts } from '@/lib/posts';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-gray-800">
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
              <span className="text-gray-400 text-xs">{post.date}</span>
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
          <div className="prose prose-orange max-w-none prose-headings:font-bold prose-a:text-orange-600 prose-img:rounded-2xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
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
