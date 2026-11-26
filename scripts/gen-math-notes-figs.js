/**
 * 生成《数学笔记》配图
 * 输出 SVG → 用 sharp 转 PNG，落到 docs/public/assets/images/math-notes/
 * 风格与 gen-c-pointers-figs.js / gen-arm-lesson*-figs.js 保持一致
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT_DIR = path.join(__dirname, '..', 'docs', 'public', 'assets', 'images', 'math-notes');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const BG = '#FAFBFC';
const INK = '#1F2937';
const SUB = '#6B7280';
const BLUE = '#2563EB', BLUE_SOFT = '#DBEAFE';
const ORANGE = '#EA580C', ORANGE_SOFT = '#FFEDD5';
const GREEN = '#16A34A', GREEN_SOFT = '#DCFCE7';
const RED = '#DC2626', RED_SOFT = '#FEE2E2';
const GREY = '#9CA3AF', GREY_SOFT = '#F3F4F6', GREY_LINE = '#E5E7EB';
const MONO = 'Consolas,Menlo,monospace';

function svg(body, w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif">
  <rect width="${w}" height="${h}" fill="${BG}"/>
  ${body}
</svg>`;
}
function box(x, y, w, h, fill, stroke, rx = 4, dash = '') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke || GREY_LINE}" stroke-width="1.5" rx="${rx}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
}
function text(x, y, s, o = {}) {
  const { fill = INK, size = 14, weight = 'normal', anchor = 'start', mono = false, italic = false } = o;
  const esc = String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${mono ? ` font-family="${MONO}"` : ''}${italic ? ' font-style="italic"' : ''}>${esc}</text>`;
}
function line(x1, y1, x2, y2, stroke = GREY_LINE, width = 1.5, dash = '') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
}
function title(w, s, sub = '') {
  let t = text(w / 2, 36, s, { size: 20, weight: 'bold', anchor: 'middle' });
  if (sub) t += text(w / 2, 62, sub, { size: 13, anchor: 'middle', fill: SUB });
  return t;
}
function band(x, y, w, h, fill, stroke, msg, o = {}) {
  let s = box(x, y, w, h, fill, stroke, o.rx === undefined ? 6 : o.rx);
  if (msg) s += text(x + w / 2, y + (o.ty || h / 2 + 5), msg, { size: o.size || 14, weight: o.weight || 'bold', anchor: 'middle', fill: o.msgFill || INK, mono: !!o.mono });
  return s;
}

/* ============ 01 因式分解决策地图 ============ */
function fig01MethodMap() {
  const w = 900, h = 620;
  let b = title(w, '因式分解的决策地图', '顺序错了就变成瞎试：先提公因式，再数项数，最后才动拆添项');

  // ① 提公因式
  b += box(90, 92, 720, 64, BLUE_SOFT, BLUE, 6);
  b += text(450, 120, '① 先看公因式（首项为负，先提负号）', { size: 15, weight: 'bold', anchor: 'middle', fill: BLUE });
  b += text(450, 143, '系数取最大公约数，字母取最低次幂，一次提尽，括号里别丢 1', { size: 12.5, anchor: 'middle', fill: SUB });

  b += line(450, 156, 450, 180, GREY, 2);
  b += `<polygon points="450,182 445,172 455,172" fill="${GREY}"/>`;

  // ② 数项数
  b += box(90, 182, 720, 50, GREY_SOFT, '#D1D5DB', 6);
  b += text(450, 213, '② 数一数还剩几项：两项 / 三项 / 四项以上，走不同的路', { size: 14.5, weight: 'bold', anchor: 'middle' });

  b += line(450, 232, 450, 254, GREY, 2);
  b += `<polygon points="450,256 445,246 455,246" fill="${GREY}"/>`;

  // ③ 三条分支
  const cols = [
    {
      x: 80, color: BLUE, soft: BLUE_SOFT, head: '两项：套公式',
      items: [
        { t: '平方差', bold: true },
        { t: 'a² − b²' },
        { t: '= (a + b)(a − b)' },
        { gap: 14 },
        { t: '立方和 / 立方差', bold: true },
        { t: 'a³ ± b³' },
        { t: '套两条长公式' }
      ]
    },
    {
      x: 335, color: ORANGE, soft: ORANGE_SOFT, head: '三项：凑平方',
      items: [
        { t: '完全平方', bold: true },
        { t: 'a² ± 2ab + b²' },
        { t: '= (a ± b)²' },
        { gap: 14 },
        { t: '十字相乘', bold: true },
        { t: 'x² + px + q' },
        { t: '= (x + a)(x + b)' }
      ]
    },
    {
      x: 590, color: GREEN, soft: GREEN_SOFT, head: '四项：分组',
      items: [
        { t: '二二分组', bold: true },
        { t: '两组各提公因式' },
        { t: '组间再提一次' },
        { gap: 14 },
        { t: '三一分组', bold: true },
        { t: '三项凑完全平方' },
        { t: '再用平方差' }
      ]
    }
  ];

  for (const c of cols) {
    b += box(c.x, 256, 230, 38, c.soft, c.color, 6);
    b += text(c.x + 115, 281, c.head, { size: 14.5, weight: 'bold', anchor: 'middle', fill: c.color });
    b += box(c.x, 294, 230, 196, '#FFFFFF', GREY_LINE, 6);
    let y = 326;
    for (const it of c.items) {
      if (it.gap) { y += it.gap; continue; }
      b += text(c.x + 115, y, it.t, {
        size: it.bold ? 14 : 13.5,
        weight: it.bold ? 'bold' : 'normal',
        anchor: 'middle',
        fill: it.bold ? c.color : INK,
        italic: !it.bold
      });
      y += 27;
    }
  }

  // ④ 兜底
  b += box(90, 512, 720, 54, RED_SOFT, RED, 6);
  b += text(450, 536, '④ 都不行：拆项、添项、换元', { size: 14.5, weight: 'bold', anchor: 'middle', fill: RED });
  b += text(450, 557, '这些招没有固定套路，目的只有一个——凑成上面的公式', { size: 12.5, anchor: 'middle', fill: SUB });

  b += text(450, 600, '最后一关：每个括号都分解到底，再把结果乘回去检验', { size: 13, anchor: 'middle', fill: SUB });
  return svg(b, w, h);
}

/* ============ 01 十字相乘示意 ============ */
function fig01Cross() {
  const w = 780, h = 430;
  let b = title(w, '十字相乘：拆两头，凑中间', '以 6x² + 13x + 6 为例：左边拆二次项，右边拆常数项，交叉相乘求和');

  // 顶部：两列的乘积
  b += text(200, 118, '2x · 3x = 6x²', { size: 12.5, anchor: 'middle', fill: SUB, mono: true });
  b += text(370, 118, '3 · 2 = 6', { size: 12.5, anchor: 'middle', fill: SUB, mono: true });

  // 四个数
  b += text(200, 200, '2x', { size: 26, anchor: 'middle', weight: 'bold', mono: true, fill: INK });
  b += text(370, 200, '3', { size: 26, anchor: 'middle', weight: 'bold', mono: true, fill: INK });
  b += text(200, 310, '3x', { size: 26, anchor: 'middle', weight: 'bold', mono: true, fill: INK });
  b += text(370, 310, '2', { size: 26, anchor: 'middle', weight: 'bold', mono: true, fill: INK });

  // 十字交叉线
  b += line(228, 212, 342, 290, ORANGE, 2, '5 4');
  b += line(228, 296, 342, 210, BLUE, 2, '5 4');

  // 右侧说明面板
  b += box(450, 140, 300, 168, '#FFFFFF', GREY_LINE, 8);
  b += text(466, 170, '交叉相乘再相加：', { size: 13, weight: 'bold' });
  b += text(466, 202, '2x × 2 = 4x', { size: 14, mono: true, fill: ORANGE, weight: 'bold' });
  b += text(466, 228, '3x × 3 = 9x', { size: 14, mono: true, fill: BLUE, weight: 'bold' });
  b += line(466, 243, 734, 243, GREY_LINE, 1, '3 3');
  b += text(466, 268, '4x + 9x = 13x  ✓', { size: 14.5, mono: true, weight: 'bold', fill: GREEN });
  b += text(466, 292, '正好等于一次项系数', { size: 12.5, fill: SUB });

  // 结果
  b += text(340, 330, '把每行横向读成一个括号：', { size: 12.5, anchor: 'middle', fill: SUB });
  b += band(150, 346, 380, 54, GREEN_SOFT, GREEN, '= (2x + 3)(3x + 2)', { ty: 34, size: 18, mono: true, msgFill: GREEN });
  b += text(390, 418, '检验：两个括号乘开，(2x+3)(3x+2) = 6x² + 4x + 9x + 6 = 6x² + 13x + 6', { size: 12, anchor: 'middle', fill: SUB });
  return svg(b, w, h);
}

const figs = {
  'math-01-method-map': fig01MethodMap(),
  'math-01-cross': fig01Cross()
};

(async () => {
  for (const [name, svgStr] of Object.entries(figs)) {
    const pngPath = path.join(OUT_DIR, `${name}.png`);
    await sharp(Buffer.from(svgStr)).png().toFile(pngPath);
    const sz = (fs.statSync(pngPath).size / 1024).toFixed(1);
    console.log(`  OK ${name}.png  ${sz}KB`);
  }
  console.log('全部生成完成');
})();
