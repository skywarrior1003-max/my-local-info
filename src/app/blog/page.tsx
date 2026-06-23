import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';

export const metadata = {
  title: '동네 소식 블로그 - 부산시 생활 정보',
  description: 'AI가 작성하는 우리 동네 실시간 생활 정보 및 행사 혜택 분석 블로그입니다.',
};

export default function BlogListPage() {
  const posts = getAllPosts();

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
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        <div>
          <h2 className="text-3xl font-extrabold text-orange-600 mb-2">동네 소식 블로그</h2>
          <p className="text-gray-500 text-sm">우리 동네의 유익한 정보와 꿀팁을 AI가 전해드립니다.</p>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-orange-100 shadow-sm">
            <span className="text-4xl block mb-4">✍️</span>
            <h3 className="text-lg font-bold text-gray-700">작성된 글이 아직 없습니다.</h3>
            <p className="text-gray-400 text-sm mt-1">곧 유익한 생활 정보가 가득 채워질 예정입니다!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl p-6 shadow-sm border border-orange-100 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full">
                    {post.category || '생활 정보'}
                  </span>
                  <span className="text-gray-400 text-xs">{post.date}</span>
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-orange-500 transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed flex-grow line-clamp-3">
                  {post.summary}
                </p>
                {post.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span key={tag} className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-gray-100 text-orange-500 text-sm font-semibold group-hover:gap-2 flex items-center gap-1 transition-all">
                  자세히 읽기 <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
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
