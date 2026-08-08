/**
 * 微信公众号 HTML 生成脚本
 *
 * 从 Markdown 源文件读取内容，生成微信兼容的 HTML：
 * 1. 图片 → base64 内嵌
 * 2. LaTeX 公式（$...$ / $$...$$）→ MathJax SVG 内嵌
 *
 * 使用方式：node scripts/generate-wechat-html.js
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const sharp = require('sharp');

// MathJax（SVG 输出）
const { mathjax } = require('mathjax-full/js/mathjax.js');
const { TeX } = require('mathjax-full/js/input/tex.js');
const { SVG } = require('mathjax-full/js/output/svg.js');
const { liteAdaptor } = require('mathjax-full/js/adaptors/liteAdaptor.js');
const { RegisterHTMLHandler } = require('mathjax-full/js/handlers/html.js');
const { AllPackages } = require('mathjax-full/js/input/tex/AllPackages.js');

// 初始化 MathJax
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const tex = new TeX({ packages: AllPackages });
const svgOutput = new SVG({ fontCache: 'none' });
const htmlDoc = mathjax.document('', { InputJax: tex, OutputJax: svgOutput });

// ---------- 配置 ----------
const CHAPTERS_DIR = path.join(__dirname, '..', 'docs', 'chapters');
const ASSETS_DIR = path.join(__dirname, '..', 'docs', 'public', 'assets', 'images');
const WECHAT_DIR = path.join(__dirname, '..', 'docs', 'public', 'wechat');
const IMAGE_URL_PREFIX = 'https://kanglinchan.github.io/duoshuati-site/assets/images/';
const MAX_IMAGE_WIDTH = 800;

// 占位符 token：必须不含任何 markdown 特殊字符（* _ # > ! [ ] 等），
// 否则会被下面的加粗/斜体正则误伤吞掉（曾用 __INLINE_CODE_n__ 导致代码丢失 + 乱码）。
// @ 符号不参与任何 markdown 语法，最安全。
const INLINE_CODE_TOKEN = '@@INLINECODE';
const CODE_BLOCK_TOKEN = '@@CODEBLOCK';
const TOKEN_END = '@@';

// ---------- 工具函数 ----------

/** 读取、压缩并 base64 编码图片 */
async function imageToBase64(localPath) {
  if (!fs.existsSync(localPath)) {
    console.warn(`  ⚠ 图片不存在: ${localPath}`);
    return null;
  }
  const ext = path.extname(localPath).toLowerCase();
  const mimeTypes = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
  const mime = mimeTypes[ext] || 'image/png';

  try {
    if (ext === '.svg') {
      const buffer = fs.readFileSync(localPath);
      return `data:${mime};base64,${buffer.toString('base64')}`;
    }

    let pipeline = sharp(localPath);
    const metadata = await pipeline.metadata();
    const originalSize = fs.statSync(localPath).size;

    if (metadata.width > MAX_IMAGE_WIDTH) {
      pipeline = pipeline.resize(MAX_IMAGE_WIDTH);
    }

    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
    } else if (ext === '.png') {
      pipeline = pipeline.png({ quality: 80, compressionLevel: 9 });
    }

    const buffer = await pipeline.toBuffer();
    const ratio = (buffer.length / originalSize * 100).toFixed(0);
    if (buffer.length < originalSize) {
      console.log(`    → 压缩: ${path.basename(localPath)} ${(originalSize/1024).toFixed(0)}KB → ${(buffer.length/1024).toFixed(0)}KB (${ratio}%)`);
    }

    return `data:${mime};base64,${buffer.toString('base64')}`;
  } catch (e) {
    console.warn(`    ⚠ 图片压缩失败，使用原始文件: ${path.basename(localPath)} — ${e.message}`);
    const buffer = fs.readFileSync(localPath);
    return `data:${mime};base64,${buffer.toString('base64')}`;
  }
}

/** URL → 本地路径 */
function urlToLocalPath(url) {
  if (url.startsWith(IMAGE_URL_PREFIX)) {
    return path.join(ASSETS_DIR, url.slice(IMAGE_URL_PREFIX.length));
  }
  if (url.startsWith('/assets/images/')) {
    return path.join(ASSETS_DIR, url.slice('/assets/images/'.length));
  }
  return null;
}

/** 用 MathJax 渲染公式为 SVG */
function renderFormula(latex, displayMode = false) {
  try {
    const node = htmlDoc.convert(latex, { display: displayMode });
    const raw = adaptor.outerHTML(node);
    const $ = cheerio.load(raw);
    const svgEl = $('svg');

    if (svgEl.length) {
      const style = displayMode
        ? 'display:block;margin:12px auto;'
        : 'display:inline-block;vertical-align:middle;';
      svgEl.attr('style', style + 'max-width:100%;');
      svgEl.find('[stroke="currentColor"]').attr('stroke', '#000');
      svgEl.find('[fill="currentColor"]').attr('fill', '#000');
      return $.html(svgEl[0]);
    }
    throw new Error('No SVG output');
  } catch (e) {
    console.warn(`  ⚠ 公式渲染失败: "${latex}" — ${e.message}`);
    if (displayMode) {
      return `<p style="text-align:center;font-family:Menlo,Consolas,monospace;color:#222;margin:12px 0;">${latex}</p>`;
    }
    return `<code style="font-family:Menlo,Consolas,monospace;color:#c7254e;background:#f9f2f4;padding:1px 4px;border-radius:3px;">${latex}</code>`;
  }
}

/** 解析 Markdown，处理公式 */
function markdownToHtml(mdContent) {
  // 先提取并保护代码块
  const codeBlocks = [];
  let content = mdContent.replace(/```[\s\S]*?```/g, (match) => {
    const placeholder = `${CODE_BLOCK_TOKEN}${codeBlocks.length}${TOKEN_END}`;
    codeBlocks.push(match);
    return placeholder;
  });

  // 保护行内代码
  const inlineCodes = [];
  content = content.replace(/`[^`]+`/g, (match) => {
    const placeholder = `${INLINE_CODE_TOKEN}${inlineCodes.length}${TOKEN_END}`;
    inlineCodes.push(match);
    return placeholder;
  });

  // 处理块级公式 $$...$$
  content = content.replace(/\$\$\s*([\s\S]+?)\s*\$\$/g, (match, formula) => {
    return '\n<p style="text-align:center;margin:16px 0;">' + renderFormula(formula.trim(), true) + '</p>\n';
  });

  // 处理行内公式 $...$
  content = content.replace(/\$([^$\n]+?)\$/g, (match, formula) => {
    return renderFormula(formula.trim(), false);
  });

  // 简单的 Markdown 解析（标题、加粗、斜体、段落、列表、引用、图片、链接、分隔线）
  // 标题
  content = content.replace(/^###### (.+)$/gm, '<h6 style="font-size:14px;font-weight:bold;color:#222;margin:16px 0 8px;line-height:1.4;">$1</h6>');
  content = content.replace(/^##### (.+)$/gm, '<h5 style="font-size:15px;font-weight:bold;color:#222;margin:18px 0 10px;line-height:1.4;">$1</h5>');
  content = content.replace(/^#### (.+)$/gm, '<h4 style="font-size:16px;font-weight:bold;color:#222;margin:20px 0 12px;line-height:1.4;">$1</h4>');
  content = content.replace(/^### (.+)$/gm, '<h3 style="font-size:18px;font-weight:bold;color:#222;margin:24px 0 12px;line-height:1.4;">$1</h3>');
  content = content.replace(/^## (.+)$/gm, '<h2 style="font-size:20px;font-weight:bold;color:#222;margin:28px 0 14px;line-height:1.4;">$1</h2>');
  content = content.replace(/^# (.+)$/gm, '<h1 style="font-size:22px;font-weight:bold;color:#222;margin:32px 0 16px;line-height:1.4;">$1</h1>');

  // 引用块
  content = content.replace(/^>\s?(.+)$/gm, '<blockquote style="border-left:4px solid #ddd;padding-left:16px;margin:14px 0;color:#666;font-style:italic;">$1</blockquote>');

  // 图片 ![alt](url)
  content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
    return `<img src="${url}" alt="${alt}" style="max-width:100%;display:block;margin:14px auto;">`;
  });

  // 链接 [text](url)
  content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#0366d6;text-decoration:none;">$1</a>');

  // 加粗（仅匹配 **...**；下划线版 __...__ 极易与占位符/变量名误伤，不再启用）
  content = content.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight:bold;">$1</strong>');

  // 斜体（仅匹配 *...*；下划线版 _..._ 会误伤含下划线的单词，不再启用）
  content = content.replace(/\*([^*]+)\*/g, '<em style="font-style:italic;">$1</em>');

  // 分隔线
  content = content.replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid #eee;margin:24px 0;">');

  // 无序列表
  content = content.replace(/^[-*] (.+)$/gm, '<li style="font-size:16px;color:#3f3f3f;line-height:1.8;margin:4px 0;">$1</li>');
  // 有序列表
  content = content.replace(/^\d+\. (.+)$/gm, '<li style="font-size:16px;color:#3f3f3f;line-height:1.8;margin:4px 0;">$1</li>');

  // 段落（非标签行包裹为段落）
  const lines = content.split('\n');
  const result = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      continue;
    }

    // 已经是 HTML 标签的行，或占位符行（代码块占位符单独成行，不应被包进 <p>），直接输出
    if ((line.startsWith('<') && !line.startsWith('<li')) || line.startsWith(CODE_BLOCK_TOKEN)) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(line);
      continue;
    }

    // 列表项
    if (line.startsWith('<li')) {
      if (!inList) {
        result.push('<ul style="margin:14px 0;padding-left:24px;">');
        inList = true;
      }
      result.push(line);
      continue;
    }

    // 普通文本段落
    if (inList) {
      result.push('</ul>');
      inList = false;
    }
    result.push(`<p style="font-size:16px;color:#3f3f3f;line-height:1.8;margin:14px 0;letter-spacing:0.03em;">${line}</p>`);
  }

  if (inList) {
    result.push('</ul>');
  }

  content = result.join('\n');

  // 恢复代码块
  content = content.replace(new RegExp(`${CODE_BLOCK_TOKEN}(\\d+)${TOKEN_END}`, 'g'), (match, idx) => {
    const code = codeBlocks[parseInt(idx)];
    // 简单处理代码块：提取内容和语言
    const lines = code.split('\n');
    const lang = lines[0].replace('```', '').trim();
    const body = lines.slice(1, -1).join('\n');
    return `<pre style="background:#f6f8fa;padding:16px;border-radius:6px;overflow-x:auto;margin:14px 0;font-size:14px;line-height:1.6;"><code style="font-family:Menlo,Consolas,monospace;color:#24292e;">${body.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  });

  // 恢复行内代码
  content = content.replace(new RegExp(`${INLINE_CODE_TOKEN}(\\d+)${TOKEN_END}`, 'g'), (match, idx) => {
    const code = inlineCodes[parseInt(idx)];
    const body = code.slice(1, -1);
    return `<code style="font-family:Menlo,Consolas,monospace;color:#c7254e;background:#f9f2f4;padding:1px 4px;border-radius:3px;font-size:14px;">${body}</code>`;
  });

  return content;
}

// ---------- 主处理逻辑 ----------

async function processMarkdownFile(mdPath) {
  const basename = path.basename(mdPath, '.md');
  const outputPath = path.join(WECHAT_DIR, `${basename}.html`);
  console.log(`\n📄 处理: ${basename}.md`);

  const mdContent = fs.readFileSync(mdPath, 'utf-8');

  // 解析 Markdown 为 HTML
  let bodyHtml = markdownToHtml(mdContent);

  // 处理图片：外链 → base64
  const $ = cheerio.load(`<div>${bodyHtml}</div>`, { decodeEntities: false });
  const imgElements = [];
  $('img').each((i, el) => {
    const $img = $(el);
    const src = $img.attr('src');
    if (!src || src.startsWith('data:')) return;
    const localPath = urlToLocalPath(src);
    if (!localPath) {
      console.warn(`  ⚠ 无法映射本地路径: ${src}`);
      return;
    }
    imgElements.push({ el: $img, localPath });
  });

  for (const { el, localPath } of imgElements) {
    const base64 = await imageToBase64(localPath);
    if (base64) {
      el.attr('src', base64);
    }
  }

  bodyHtml = $('div').html();

  // 生成完整微信 HTML
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${basename}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 680px; margin: 0 auto; padding: 20px; background: #fff;">
  <section style="background: #fff; padding: 20px;">
    ${bodyHtml}
  </section>
</body>
</html>`;

  fs.writeFileSync(outputPath, html, 'utf-8');
  const size = (fs.statSync(outputPath).size / 1024).toFixed(0);
  console.log(`  ✅ 已生成: ${path.basename(outputPath)} (${size}KB)`);
}

// ---------- 入口 ----------

async function main() {
  console.log('🚀 开始从 Markdown 生成微信公众号 HTML...\n');

  const files = fs.readdirSync(CHAPTERS_DIR)
    .filter(f => f.endsWith('.md'))
    .sort();

  if (files.length === 0) {
    console.log('未找到 Markdown 文件');
    return;
  }

  // 确保 wechat 目录存在
  if (!fs.existsSync(WECHAT_DIR)) {
    fs.mkdirSync(WECHAT_DIR, { recursive: true });
  }

  for (const file of files) {
    await processMarkdownFile(path.join(CHAPTERS_DIR, file));
  }

  console.log('\n✨ 全部处理完成！');
  console.log('💡 提示：现在可以通过"复制文章"功能粘贴到公众号编辑器了。');
}

main().catch(err => {
  console.error('❌ 处理失败:', err);
  process.exit(1);
});
