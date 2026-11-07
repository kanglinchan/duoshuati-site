/**
 * 新概念英语 1-4 册课文页生成脚本
 *
 * 从坚果云同步的源文件（nce1.md ~ nce4.md，每课英文 <big> 行 + 中文 <small> 行，
 * 经校验全部 1:1 配对）拆分为每课一页的 VitePress Markdown：
 *   docs/nce/{1,2,3,4}/NNN-slug.md   逐句对照课文页
 *   docs/nce/index.md                分类目录页
 *   docs/.vitepress/nce-sidebar.json 侧边栏配置（config.mjs 引入）
 *
 * 使用方式：node scripts/gen-nce-pages.js [源目录]
 * 默认源目录：C:/Users/60116/Nutstore/1/books/english/nce/output
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = process.argv[2] || 'C:/Users/60116/Nutstore/1/books/english/nce/output';
const DOCS_DIR = path.resolve(__dirname, '../docs');
const NCE_DIR = path.join(DOCS_DIR, 'nce');
const SIDEBAR_JSON = path.join(DOCS_DIR, '.vitepress/nce-sidebar.json');
const EX_DIR = path.join(__dirname, 'nce-explanations');

// 逐句讲解数据：scripts/nce-explanations/book{N}.json，按课文英文原句索引；
// 「_common」内的条目对所有课生效。没有数据文件的册次自动跳过（不显示讲解图标）。
function loadExplanations(bookDir) {
  const f = path.join(EX_DIR, `book${bookDir}.json`);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : {};
}

const BOOKS = [
  {
    src: 'nce1.md',
    dir: '1',
    volume: '第一册',
    subtitle: '英语初阶',
    enTitle: 'First Things First',
    pad: 3,
    intro: '生存英语对话，每课一个场景，零基础入门。'
  },
  {
    src: 'nce2.md',
    dir: '2',
    volume: '第二册',
    subtitle: '实践与进步',
    enTitle: 'Practice and Progress',
    pad: 2,
    intro: '96 篇幽默短文，系统梳理语法与句型，构建完整语法框架。'
  },
  {
    src: 'nce3.md',
    dir: '3',
    volume: '第三册',
    subtitle: '培养技能',
    enTitle: 'Developing Skills',
    pad: 2,
    intro: '60 篇叙事与说明文，着重句法精讲与篇章理解。'
  },
  {
    src: 'nce4.md',
    dir: '4',
    volume: '第四册',
    subtitle: '流利英语',
    enTitle: 'Fluency in English',
    pad: 2,
    intro: '48 篇原版文章，涵盖文化、哲学、科技等题材，进阶流利表达。'
  }
];

const HEADING_RE = /^(\d{1,3})(?:&(\d{1,3}))?－(.+)$/;
// 冗余对：英文 "Lesson 1" / 中文 "第1课"，与页面标题重复，剔除
const REDUNDANT_EN_RE = /^Lesson\s+\d+$/i;
const REDUNDANT_ZH_RE = /^第\s*\d+\s*课$/;

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// 组件属性值转义（双引号属性内）
const escapeAttr = (s) => escapeHtml(s).replace(/"/g, '&quot;');

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[''’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'lesson';

const pad = (n, w) => String(Number(n)).padStart(w, '0');

function parseBook(book) {
  const text = fs.readFileSync(path.join(SRC_DIR, book.src), 'utf-8');
  const lessons = [];
  const usedSlugs = new Set();

  for (const seg of text.split(/^## /m).slice(1)) {
    const lines = seg.split('\n');
    const m = HEADING_RE.exec(lines[0].trim());
    if (!m) throw new Error(`${book.src}: 无法解析课目标题 "${lines[0]}"`);

    const [, num1, num2, title] = m;
    const body = seg.split(/^---\s*$/m);
    const en = (body[0].match(/<big>([\s\S]*?)<\/big>/g) || []).map((s) =>
      s.replace(/<\/?big>/g, '').trim()
    );
    const zh = (body[1] ? body[1].match(/<small>([\s\S]*?)<\/small>/g) : []).map((s) =>
      s.replace(/<\/?small>/g, '').trim()
    );
    if (en.length !== zh.length) {
      throw new Error(`${book.src} 第 ${num1} 课：英文 ${en.length} 行 / 中文 ${zh.length} 行，配对失败`);
    }

    const pairs = [];
    for (let i = 0; i < en.length; i++) {
      if (REDUNDANT_EN_RE.test(en[i]) && REDUNDANT_ZH_RE.test(zh[i])) continue;
      pairs.push([en[i], zh[i]]);
    }

    // 文件名：nce1 用课号区间 001-002，其余用两位课号
    const fileNum = num2 ? `${pad(num1, book.pad)}-${pad(num2, book.pad)}` : pad(num1, book.pad);
    let slug = slugify(title);
    if (usedSlugs.has(slug)) slug = `${slug}-${num1}`;
    usedSlugs.add(slug);

    // 侧边栏序号：按本书最大宽度补零，保持对齐
    const listNum = num2 ? `${pad(num1, 2)}-${pad(num2, 2)}` : pad(num1, 2);

    lessons.push({
      title: title.trim(),
      num1,
      num2,
      key: fileNum,
      fileName: `${fileNum}-${slug}.md`,
      link: `/nce/${book.dir}/${fileNum}-${slug}`,
      listText: `${listNum}. ${title.trim()}`,
      pageHeading: `第 ${Number(num1)}${num2 ? `-${Number(num2)}` : ''} 课：${title.trim()}`,
      pairs
    });
  }
  return lessons;
}

// Windows 下目录可能被其他进程（IDE/资源管理器）占用导致 EBUSY，
// 清理失败时退化为逐项删除，仍失败则靠 writeFileSync 原地覆盖
function cleanBestEffort(dir) {
  if (!fs.existsSync(dir)) return;
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    return;
  } catch { /* 目录本身被锁 */ }
  for (const name of fs.readdirSync(dir)) {
    try {
      fs.rmSync(path.join(dir, name), { recursive: true, force: true });
    } catch { /* 单项被锁，保留旧文件（会被同名覆盖） */ }
  }
}

function writeBookPages(book, lessons) {
  const dir = path.join(NCE_DIR, book.dir);
  cleanBestEffort(dir);
  fs.mkdirSync(dir, { recursive: true });

  const exData = loadExplanations(book.dir);
  const commonEx = exData['_common'] || {};

  for (const les of lessons) {
    // 讲解索引：课文原句 → 讲解文本（课内条目优先于 _common）
    const exMap = { ...commonEx, ...(exData[les.key] || {}) };
    let hasEx = false;
    const pairLines = [];
    for (const [en, zh] of les.pairs) {
      const ex = exMap[en] || '';
      if (ex) hasEx = true;
      pairLines.push(
        `<NcePair en="${escapeAttr(en)}" zh="${escapeAttr(zh)}"${ex ? ` ex="${escapeAttr(ex)}"` : ''} />`
      );
    }

    const lines = [
      `# ${les.pageHeading}`,
      '',
      `> [新概念英语 · ${book.volume} ${book.subtitle}](/nce/ "返回目录")`,
      '',
      // 译文/讲解控制条（组件见 theme/NceTranslateBar.vue、theme/NcePair.vue）
      `<NceTranslateBar${hasEx ? ' :has-ex="true"' : ''} />`,
      '',
      ...pairLines.flatMap((l) => [l, ''])
    ];
    fs.writeFileSync(path.join(dir, les.fileName), lines.join('\n'), 'utf-8');
  }
}

function writeIndexPage(booksData) {
  const total = booksData.reduce((n, b) => n + b.lessons.length, 0);
  const lines = [
    '# 新概念英语 1-4 册',
    '',
    `> 逐句对照 · 全 ${total} 课`,
    '',
    '英文原句下方紧跟灰色中文译文，先读原文、再对照翻译，适合精读与背诵。',
    ''
  ];
  for (const { book, lessons } of booksData) {
    lines.push(
      `## ${book.volume} · ${book.subtitle}（${book.enTitle}，${lessons.length} 课）`,
      '',
      book.intro,
      ''
    );
    for (const les of lessons) lines.push(`- [${les.listText}](${les.link})`);
    lines.push('');
  }
  fs.writeFileSync(path.join(NCE_DIR, 'index.md'), lines.join('\n'), 'utf-8');
}

function writeSidebarJson(booksData) {
  const sidebar = booksData.map(({ book, lessons }) => ({
    text: `${book.volume} · ${book.subtitle}（${lessons.length} 课）`,
    collapsed: true,
    items: lessons.map((les) => ({ text: les.listText, link: les.link }))
  }));
  fs.writeFileSync(SIDEBAR_JSON, JSON.stringify(sidebar, null, 2), 'utf-8');
}

function main() {
  const booksData = BOOKS.map((book) => {
    const lessons = parseBook(book);
    console.log(`${book.src}：${lessons.length} 课解析完成`);
    return { book, lessons };
  });

  fs.mkdirSync(NCE_DIR, { recursive: true });
  for (const { book, lessons } of booksData) writeBookPages(book, lessons);
  writeIndexPage(booksData);
  writeSidebarJson(booksData);

  const total = booksData.reduce((n, b) => n + b.lessons.length, 0);
  console.log(`共生成 ${total} 个课文页 + /nce/ 目录页 + 侧边栏配置`);
}

main();
