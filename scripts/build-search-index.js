const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const rootDir = path.join(__dirname, '..');

function stripMarkdown(text) {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/(\*{1,2}|_{1,2})(.*?)\1/gs, '$2')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s*/gm, '')
    .replace(/^---+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const index = [];

// 1. local-info.json 항목 추가
const localInfoPath = path.join(rootDir, 'public', 'data', 'local-info.json');
const localInfo = JSON.parse(fs.readFileSync(localInfoPath, 'utf-8'));

for (const event of localInfo.events ?? []) {
  index.push({
    type: 'event',
    id: event.id,
    name: event.name,
    category: event.category,
    summary: event.summary,
    startDate: event.startDate,
    endDate: event.endDate,
    location: event.location,
  });
}

for (const benefit of localInfo.benefits ?? []) {
  index.push({
    type: 'benefit',
    id: benefit.id,
    name: benefit.name,
    category: benefit.category,
    summary: benefit.summary,
    startDate: benefit.startDate,
    endDate: benefit.endDate,
    location: benefit.location,
  });
}

// 2. 마크다운 포스트 추가
const postsDir = path.join(rootDir, 'src', 'content', 'posts');
const mdFiles = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'));

for (const file of mdFiles) {
  const raw = fs.readFileSync(path.join(postsDir, file), 'utf-8');
  const { data, content } = matter(raw);
  const plainContent = stripMarkdown(content).slice(0, 500);
  const slug = file.replace(/\.md$/, '');

  index.push({
    type: 'post',
    slug,
    title: data.title ?? '',
    summary: data.summary ?? '',
    content: plainContent,
  });
}

// 3. 저장
const outPath = path.join(rootDir, 'public', 'data', 'search-index.json');
fs.writeFileSync(outPath, JSON.stringify(index, null, 2), 'utf-8');

console.log(`Search index built: ${index.length} entries`);
