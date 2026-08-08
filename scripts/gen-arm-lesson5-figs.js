/**
 * 生成第五课「有符号数与补码」配图
 * 输出 SVG → 用 sharp 转 PNG，落到 docs/public/assets/images/2026-08-arm-assembly/
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT_DIR = path.join(__dirname, '..', 'docs', 'public', 'assets', 'images', '2026-08-arm-assembly');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// 统一视觉风格：与现有配图保持一致的配色（浅底 + 深色文字 + 蓝/橙强调色）
const BG = '#FAFBFC';
const INK = '#1F2937';
const SUB = '#6B7280';
const BLUE = '#2563EB';
const BLUE_SOFT = '#DBEAFE';
const ORANGE = '#EA580C';
const ORANGE_SOFT = '#FFEDD5';
const GREEN = '#16A34A';
const GREEN_SOFT = '#DCFCE7';
const RED = '#DC2626';
const RED_SOFT = '#FEE2E2';
const GREY_LINE = '#E5E7EB';

function svg(body, w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif">
  <rect width="${w}" height="${h}" fill="${BG}"/>
  ${body}
</svg>`;
}

function box(x, y, w, h, fill, stroke) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke || GREY_LINE}" stroke-width="1.5" rx="4"/>`;
}
function text(x, y, s, opts = {}) {
  const { fill = INK, size = 14, weight = 'normal', anchor = 'start', family } = opts;
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${family ? ` font-family="${family}"` : ''}>${s}</text>`;
}

// ============ 图 1：4 位有符号 vs 无符号对照表（核心图，也作封面）============
function figSignedUnsigned() {
  const w = 820, h = 560;
  const rows = [
    ['0111', '+7', '7'],
    ['0110', '+6', '6'],
    ['0101', '+5', '5'],
    ['0100', '+4', '4'],
    ['0011', '+3', '3'],
    ['0010', '+2', '2'],
    ['0001', '+1', '1'],
    ['0000',  '0', '0'],
    ['1111', '-1','15'],
    ['1110', '-2','14'],
    ['1101', '-3','13'],
    ['1100', '-4','12'],
    ['1011', '-5','11'],
    ['1010', '-6','10'],
    ['1001', '-7', '9'],
    ['1000', '-8', '8'],
  ];
  let body = '';
  // 标题
  body += text(410, 40, '同一个 4 位二进制，两种解读', { size: 22, weight: 'bold', anchor: 'middle' });
  body += text(410, 66, '最高位 = 符号位：0 为正，1 为负', { size: 14, fill: SUB, anchor: 'middle' });

  // 表头
  const cols = [60, 270, 430, 590]; // 四列 x 起点
  const cw = [180, 140, 140, 180];
  const headerY = 100;
  const headers = ['二进制', '符号位', '有符号值', '无符号值'];
  headers.forEach((t, i) => {
    body += box(cols[i], headerY, cw[i], 36, '#F3F4F6', '#D1D5DB');
    body += text(cols[i] + cw[i]/2, headerY + 24, t, { size: 14, weight: 'bold', anchor: 'middle' });
  });

  const rowH = 24;
  rows.forEach((r, idx) => {
    const y = headerY + 36 + idx * rowH;
    const isNeg = r[1].startsWith('-');
    const isZero = r[1] === '0';
    const rowFill = isNeg ? RED_SOFT : (isZero ? '#F3F4F6' : GREEN_SOFT);
    // 整行底色（淡）
    body += `<rect x="${cols[0]}" y="${y}" width="${cols[3]+cw[3]-cols[0]}" height="${rowH}" fill="${rowFill}" opacity="0.35"/>`;
    // 二进制
    body += text(cols[0] + cw[0]/2, y + 16, r[0], { size: 15, weight: 'bold', anchor: 'middle', family: 'Consolas,monospace' });
    // 符号位高亮
    const signBit = r[0][0];
    const signFill = signBit === '1' ? RED : GREEN;
    body += `<circle cx="${cols[1] + cw[1]/2}" cy="${y+12}" r="9" fill="${signFill}"/>`;
    body += text(cols[1] + cw[1]/2, y + 16, signBit, { size: 12, weight: 'bold', anchor: 'middle', fill: '#fff', family: 'Consolas,monospace' });
    body += text(cols[1] + cw[1]/2, y + 30, signBit === '1' ? '负' : '正', { size: 11, fill: SUB, anchor: 'middle' });
    // 有符号值
    body += text(cols[2] + cw[2]/2, y + 16, r[1], { size: 15, weight: 'bold', anchor: 'middle', fill: isNeg ? RED : INK });
    // 无符号值
    body += text(cols[3] + cw[3]/2, y + 16, r[2], { size: 15, anchor: 'middle', fill: BLUE });
  });

  // 表格竖线
  cols.forEach((cx, i) => {
    body += `<line x1="${cx}" y1="${headerY}" x2="${cx}" y2="${headerY + 36 + rows.length*rowH}" stroke="${GREY_LINE}" stroke-width="1"/>`;
  });
  const rightX = cols[3] + cw[3];
  body += `<line x1="${rightX}" y1="${headerY}" x2="${rightX}" y2="${headerY + 36 + rows.length*rowH}" stroke="${GREY_LINE}" stroke-width="1"/>`;

  // 底部说明
  const noteY = headerY + 36 + rows.length*rowH + 30;
  body += text(60, noteY, '取值范围：', { size: 14, weight: 'bold' });
  body += text(160, noteY, '有符号  -8 ~ +7', { size: 14, fill: RED });
  body += text(310, noteY, '无符号  0 ~ 15', { size: 14, fill: BLUE });
  body += text(60, noteY + 24, '关键：1000 在有符号下是 -8（最小负数），在无符号下是 8 —— 同样的位，含义完全不同。', { size: 13, fill: SUB });

  return svg(body, w, h);
}

// ============ 图 2：取负数的三步——取反、加一（two's complement得名）============
function figNegateSteps() {
  const w = 760, h = 460;
  let body = '';
  body += text(380, 40, '把 +5 变成 -5：取反、加一', { size: 22, weight: 'bold', anchor: 'middle' });
  body += text(380, 66, '这就是 "two\'s complement"（二进制补码）名字的由来', { size: 13, fill: SUB, anchor: 'middle' });

  // 三列：原值 / 取反 / 加一
  const colX = [80, 320, 560];
  const colW = 160;
  const topY = 110;

  const labels = ['第 1 步 · 写出 +5', '第 2 步 · 全部取反', '第 3 步 · 再加 1'];
  labels.forEach((t, i) => {
    body += text(colX[i] + colW/2, topY, t, { size: 15, weight: 'bold', anchor: 'middle', fill: i === 2 ? ORANGE : BLUE });
  });

  // 8 位二进制演示
  const bits = ['0','0','0','0','0','1','0','1'];
  const flipped = bits.map(b => b === '0' ? '1' : '0');
  const result = [];
  let carry = 1;
  for (let i = flipped.length - 1; i >= 0; i--) {
    const sum = parseInt(flipped[i]) + carry;
    result[i] = sum % 2;
    carry = sum >= 2 ? 1 : 0;
  }

  function drawBits(x, y, arr, highlightAll) {
    const bw = 32, gap = 4;
    arr.forEach((b, i) => {
      const bx = x + i * (bw + gap);
      const fill = (i === 7 && highlightAll) ? BLUE_SOFT : '#fff';
      body += box(bx, y, bw, 40, fill, BLUE);
      body += text(bx + bw/2, y + 26, b, { size: 18, weight: 'bold', anchor: 'middle', family: 'Consolas,monospace' });
    });
  }

  const bitY = topY + 30;
  drawBits(colX[0], bitY, bits, false);
  drawBits(colX[1], bitY, flipped, false);
  drawBits(colX[2], bitY, result, true);

  // 每列下方十六进制/十进制标注
  const dec = (arr) => parseInt(arr.join(''), 2);
  const annotations = [
    `十六进制 0x05\n十进制 +5`,
    `十六进制 0xFA\n十进制 250（无符号）`,
    `十六进制 0xFB\n有符号解读 = -5`
  ];
  annotations.forEach((t, i) => {
    const lines = t.split('\n');
    lines.forEach((ln, j) => {
      body += text(colX[i] + colW/2, bitY + 70 + j*20, ln, { size: 13, anchor: 'middle', fill: j === 0 ? SUB : (i === 2 ? RED : INK), weight: j === 1 && i === 2 ? 'bold' : 'normal' });
    });
  });

  // 箭头：列间
  function arrow(x1, y1, x2, y2, label) {
    body += `<defs><marker id="arr-${label.replace(/\s/g,'')}" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${SUB}"/></marker></defs>`;
    body += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${SUB}" stroke-width="2" marker-end="url(#arr-${label.replace(/\s/g,'')})"/>`;
    body += text((x1+x2)/2, y1 - 8, label, { size: 12, fill: SUB, anchor: 'middle' });
  }
  arrow(colX[0] + colW + 10, bitY + 20, colX[1] - 6, bitY + 20, '取反');
  arrow(colX[1] + colW + 10, bitY + 20, colX[2] - 6, bitY + 20, '+ 1');

  // 底部：可逆性提示
  const footY = bitY + 150;
  body += box(80, footY, 600, 70, ORANGE_SOFT, ORANGE);
  body += text(380, footY + 28, '双向通用：从 -5 回到 +5，同样「取反、加一」', { size: 15, weight: 'bold', anchor: 'middle', fill: ORANGE });
  body += text(380, footY + 52, '因此补码下加法减法共用同一套电路，CPU 不需要专门的减法器', { size: 13, anchor: 'middle', fill: INK });

  return svg(body, w, h);
}

// ============ 图 3：符号扩展（8 位 → 32 位）============
function figSignExtension() {
  const w = 820, h = 380;
  let body = '';
  body += text(410, 40, '符号扩展：把 8 位的 -5 搬进 32 位寄存器', { size: 22, weight: 'bold', anchor: 'middle' });
  body += text(410, 66, '用符号位填充所有新增的高位 —— 正数补 0，负数补 1', { size: 13, fill: SUB, anchor: 'middle' });

  // 上：8 位 -5
  body += text(80, 110, '原值（8 位）', { size: 14, weight: 'bold', fill: RED });
  const bits8 = ['1','1','1','1','1','0','1','1'];
  const bw = 30, gap = 3;
  bits8.forEach((b, i) => {
    const bx = 80 + i * (bw + gap);
    const isSign = i === 0;
    body += box(bx, 120, bw, 36, isSign ? RED_SOFT : '#fff', isSign ? RED : BLUE);
    body += text(bx + bw/2, 144, b, { size: 16, weight: 'bold', anchor: 'middle', family: 'Consolas,monospace' });
  });
  body += text(80, 174, '符号位 = 1（负数）', { size: 12, fill: RED });

  // 中：错误做法（零扩展）
  body += text(80, 210, '错误：零扩展（补 0）', { size: 14, weight: 'bold', fill: RED });
  const wrongBits = [];
  for (let i = 0; i < 24; i++) wrongBits.push('0');
  wrongBits.push(...bits8);
  // 用紧凑表示：24 个 0 ... 11111011
  body += box(80, 220, 26*8, 36, '#fff', RED);
  body += text(80 + 26*8/2, 244, '0000 0000  0000 0000  0000 0000  1111 1011', { size: 14, anchor: 'middle', family: 'Consolas,monospace', fill: INK });
  body += text(80, 274, '解读成 +251 —— 符号丢了！', { size: 12, fill: RED });

  // 下：正确做法（符号扩展）
  body += text(80, 310, '正确：符号扩展（补 1）', { size: 14, weight: 'bold', fill: GREEN });
  body += box(80, 320, 26*8, 36, GREEN_SOFT, GREEN);
  body += text(80 + 26*8/2, 344, '1111 1111  1111 1111  1111 1111  1111 1011', { size: 14, anchor: 'middle', family: 'Consolas,monospace', fill: INK });
  body += text(80, 374, '解读成 -5 —— 数值保住了，这就是 0xFFFFFFFB', { size: 12, fill: GREEN });

  return svg(body, w, h);
}

// ============ 图 4：32 位有符号数的取值范围 ============
function figRange() {
  const w = 800, h = 360;
  let body = '';
  body += text(400, 40, '32 位有符号数：能装下多大、多小？', { size: 22, weight: 'bold', anchor: 'middle' });
  body += text(400, 66, '约 ±21 亿 —— int 在大多数语言里的家底', { size: 13, fill: SUB, anchor: 'middle' });

  // 数轴
  const axisY = 180;
  const x0 = 80, x1 = 720;
  body += `<line x1="${x0}" y1="${axisY}" x2="${x1}" y2="${axisY}" stroke="${INK}" stroke-width="2"/>`;
  // 箭头
  body += `<polygon points="${x1},${axisY-6} ${x1+10},${axisY} ${x1},${axisY+6}" fill="${INK}"/>`;
  body += `<polygon points="${x0},${axisY-6} ${x0-10},${axisY} ${x0},${axisY+6}" fill="${INK}"/>`;

  // 正数区（绿）
  body += `<line x1="${400}" y1="${axisY}" x2="${x1-20}" y2="${axisY}" stroke="${GREEN}" stroke-width="6"/>`;
  // 负数区（红）
  body += `<line x1="${x0+20}" y1="${axisY}" x2="${400}" y2="${axisY}" stroke="${RED}" stroke-width="6"/>`;
  // 0
  body += `<circle cx="400" cy="${axisY}" r="6" fill="${INK}"/>`;
  body += text(400, axisY + 28, '0', { size: 14, weight: 'bold', anchor: 'middle' });

  // 最大正数
  const maxX = x1 - 20;
  body += `<line x1="${maxX}" y1="${axisY-30}" x2="${maxX}" y2="${axisY+10}" stroke="${GREEN}" stroke-width="2"/>`;
  body += text(maxX, axisY - 38, '+2,147,483,647', { size: 14, weight: 'bold', anchor: 'middle', fill: GREEN });
  body += text(maxX, axisY - 56, '0x7FFFFFFF', { size: 12, anchor: 'middle', fill: SUB, family: 'Consolas,monospace' });
  body += text(maxX, axisY + 28, '上溢区', { size: 11, fill: SUB, anchor: 'middle' });

  // 最小负数
  const minX = x0 + 20;
  body += `<line x1="${minX}" y1="${axisY-30}" x2="${minX}" y2="${axisY+10}" stroke="${RED}" stroke-width="2"/>`;
  body += text(minX, axisY - 38, '-2,147,483,648', { size: 14, weight: 'bold', anchor: 'middle', fill: RED });
  body += text(minX, axisY - 56, '0x80000000', { size: 12, anchor: 'middle', fill: SUB, family: 'Consolas,monospace' });
  body += text(minX, axisY + 28, '下溢区', { size: 11, fill: SUB, anchor: 'middle' });

  // 不对称提示
  body += box(240, 250, 320, 70, ORANGE_SOFT, ORANGE);
  body += text(400, 278, '注意：负数比正数多一个', { size: 15, weight: 'bold', anchor: 'middle', fill: ORANGE });
  body += text(400, 302, '|最小负数| = 最大正数 + 1', { size: 13, anchor: 'middle', fill: INK });
  body += text(400, 318, '所以 0x80000000 取负会溢出，结果还是它自己', { size: 12, anchor: 'middle', fill: SUB });

  return svg(body, w, h);
}

// ============ 图 5：四步判定一个数是有符号还是无符号（综合图）============
function figHowToTell() {
  const w = 800, h = 480;
  let body = '';
  body += text(400, 40, '看到 0xFFFFFFFB，它到底是 -5 还是 4294967291？', { size: 20, weight: 'bold', anchor: 'middle' });
  body += text(400, 66, '答案：CPU 不知道 —— 取决于你用什么指令去解读它', { size: 13, fill: SUB, anchor: 'middle' });

  // 顶部：寄存器里的位
  const regY = 100;
  body += box(150, regY, 500, 44, '#fff', INK);
  body += text(400, regY + 28, '1111 ... 1111 1011   (0xFFFFFFFB)', { size: 16, weight: 'bold', anchor: 'middle', family: 'Consolas,monospace' });

  // 左：按有符号解读
  const lx = 80, ly = 180;
  body += box(lx, ly, 300, 200, GREEN_SOFT, GREEN);
  body += text(lx + 150, ly + 30, '按有符号解读', { size: 16, weight: 'bold', anchor: 'middle', fill: GREEN });
  body += text(lx + 150, ly + 60, '（看符号位 = 1 → 负数）', { size: 12, anchor: 'middle', fill: SUB });
  body += text(lx + 150, ly + 100, '取反加一 → 0000...0101', { size: 13, anchor: 'middle', family: 'Consolas,monospace' });
  body += text(lx + 150, ly + 124, '= 5', { size: 13, anchor: 'middle', family: 'Consolas,monospace' });
  body += text(lx + 150, ly + 160, '值 = -5', { size: 22, weight: 'bold', anchor: 'middle', fill: RED });
  body += text(lx + 150, ly + 186, '用 SDIV / LDRS 等带 S 的指令', { size: 11, anchor: 'middle', fill: SUB });

  // 右：按无符号解读
  const rx = 420, ry = 180;
  body += box(rx, ry, 300, 200, BLUE_SOFT, BLUE);
  body += text(rx + 150, ry + 30, '按无符号解读', { size: 16, weight: 'bold', anchor: 'middle', fill: BLUE });
  body += text(rx + 150, ry + 60, '（所有位都是数值位）', { size: 12, anchor: 'middle', fill: SUB });
  body += text(rx + 150, ry + 100, '直接读 32 位二进制', { size: 13, anchor: 'middle', family: 'Consolas,monospace' });
  body += text(rx + 150, ry + 124, '= 2³² - 5', { size: 13, anchor: 'middle', family: 'Consolas,monospace' });
  body += text(rx + 150, ry + 160, '值 = 4,294,967,291', { size: 18, weight: 'bold', anchor: 'middle', fill: BLUE });
  body += text(rx + 150, ry + 186, '用 UDIV / LDR 等不带 S 的指令', { size: 11, anchor: 'middle', fill: SUB });

  // 底部结论
  body += box(80, 410, 640, 50, ORANGE_SOFT, ORANGE);
  body += text(400, 442, '同一个二进制串，指令不同 → 解释不同。CPU 没有「类型」，类型是程序员脑子里的约定。', { size: 13, weight: 'bold', anchor: 'middle', fill: ORANGE });

  return svg(body, w, h);
}

const figs = {
  'fig-signed-unsigned': figSignedUnsigned(),
  'fig-negate-steps': figNegateSteps(),
  'fig-sign-extension': figSignExtension(),
  'fig-range': figRange(),
  'fig-how-to-tell': figHowToTell(),
};

(async () => {
  for (const [name, svgStr] of Object.entries(figs)) {
    const pngPath = path.join(OUT_DIR, `${name}.png`);
    await sharp(Buffer.from(svgStr)).png().toFile(pngPath);
    const sz = (fs.statSync(pngPath).size / 1024).toFixed(1);
    console.log(`  ✓ ${name}.png  ${sz}KB`);
  }
  console.log('全部生成完成');
})();
