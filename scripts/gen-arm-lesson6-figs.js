/**
 * 生成「图解 ARM 汇编」第 6 课（移位与旋转）所需的技术示意图 PNG。
 *
 * 输出目录：docs/public/assets/images/2026-08-arm-assembly/
 *
 * 图清单（全部宽度 640，竖向布局，适配手机阅读）：
 *   1. fig-shift-ops.png    —— 四种移位操作总览：同一个 40 的四种命运（兼作封面）
 *   2. fig-lsl-multiply.png —— LSL 逻辑左移：每移一位 ×2（40→80→160）
 *   3. fig-asr-vs-lsr.png   —— LSR 与 ASR 的分水岭：负数右移，一个变垃圾一个保符号
 *   4. fig-ror-rrx.png      —— ROR 循环右移与 RRX：比特的轮回与 33 位旋转
 *   5. fig-shift-table.png  —— 五条指令速查表
 *
 * 运行：node scripts/gen-arm-lesson6-figs.js
 * 依赖：sharp（npm install sharp --save-dev）
 *
 * 注意：改图后必须重新运行 generate-wechat-html.js，否则公众号 HTML 内嵌的 base64 仍是旧图。
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'docs', 'public', 'assets', 'images', '2026-08-arm-assembly');

// 每个比特格子的尺寸
const BIT_W = 34;
const BIT_H = 38;
const BIT_GAP = 4;
const BIT_STEP = BIT_W + BIT_GAP; // 38

const CJK = 'Microsoft YaHei, PingFang SC, Hiragino Sans GB, sans-serif';
const MONO = 'DejaVu Sans Mono, Consolas, monospace';

const BLUE = { bg: '#ddf4ff', border: '#0969da', text: '#0969da' };   // 补 0
const RED = { bg: '#ffebe9', border: '#e5484d', text: '#e5484d' };    // 补符号位 1 / 错误
const GREEN = { bg: '#dcf5e3', border: '#2da44e', text: '#2da44e' };  // 循环回来的比特 / 正确
const PURPLE = { bg: '#fbefff', border: '#8250df', text: '#8250df' }; // C 标志

/** 生成一排比特格子，x 起始、y 起始、8 位字符串、可选高亮集合 { index: 配色 } */
function bitRow(bits, x, y, hl = {}) {
  let s = '';
  for (let i = 0; i < bits.length; i++) {
    const c = hl[i] || { bg: '#ffffff', border: '#9aa4b2', text: '#24292f' };
    const bx = x + i * BIT_STEP;
    s += `<rect x="${bx}" y="${y}" width="${BIT_W}" height="${BIT_H}" rx="5"
      fill="${c.bg}" stroke="${c.border}" stroke-width="1.5"/>`;
    s += `<text x="${bx + BIT_W / 2}" y="${y + 26}" font-family="${MONO}" font-size="18"
      font-weight="bold" fill="${c.text}" text-anchor="middle">${bits[i]}</text>`;
  }
  return s;
}

/** 8 位比特排总宽 */
const ROW8 = 8 * BIT_STEP - BIT_GAP; // 300

function svgDoc(w, h, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="#f8f9fb"/>
${inner}
</svg>`;
}

/* ---------------------------------------------------------------- 图 1：总览 */
function fig1() {
  const W = 640;
  const rows = [
    { op: 'LSL #1', out: '01010000', hl: { 7: BLUE }, res: '= 80', note: '右边补 0 → ×2' },
    { op: 'LSR #1', out: '00010100', hl: { 0: BLUE }, res: '= 20', note: '左边补 0 → ÷2' },
    { op: 'ASR #1', out: '00010100', hl: { 0: RED }, res: '= 20', note: '补符号位（正数同 LSR）' },
    { op: 'ROR #1', out: '00010100', hl: { 0: GREEN }, res: '= 20', note: '转出的比特回另一端' },
  ];

  const bandH = 86;
  const bandGap = 10;
  const topY = 126; // 输入比特排底部 114 + 12px 空隙
  const H = topY + rows.length * (bandH + bandGap) + 14;

  let s = '';
  s += `<text x="320" y="32" font-family="${CJK}" font-size="19" font-weight="bold" fill="#24292f" text-anchor="middle">四种移位操作：同一个起点的四种命运</text>`;

  // 输入行
  const inX = (W - ROW8) / 2;
  s += `<text x="320" y="66" font-family="${CJK}" font-size="15" fill="#57606a" text-anchor="middle">输入 R0 = 0010 1000（十进制 40）</text>`;
  s += bitRow('00101000', inX, 76);

  rows.forEach((r, i) => {
    const y = topY + i * (bandH + bandGap);
    s += `<rect x="16" y="${y}" width="608" height="${bandH}" rx="10" fill="#ffffff" stroke="#d0d7de" stroke-width="1.5"/>`;
    // 操作名 chip
    s += `<rect x="30" y="${y + 23}" width="96" height="40" rx="8" fill="#0969da"/>`;
    s += `<text x="78" y="${y + 49}" font-family="${MONO}" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">${r.op}</text>`;
    // 箭头
    s += `<text x="148" y="${y + 53}" font-family="${MONO}" font-size="22" fill="#57606a" text-anchor="middle">→</text>`;
    // 输出比特（8 位，x=176 起，占 300，至 476）
    s += bitRow(r.out, 176, y + 24, r.hl);
    // 结果与说明（x=494 起）
    s += `<text x="494" y="${y + 40}" font-family="${MONO}" font-size="16" font-weight="bold" fill="#24292f">${r.res}</text>`;
    s += `<text x="494" y="${y + 62}" font-family="${CJK}" font-size="12" fill="#57606a">${r.note}</text>`;
  });

  return svgDoc(W, H, s);
}

/* ------------------------------------------------------- 图 2：LSL ×2 链条 */
function fig2() {
  const W = 640;
  const steps = [
    { bits: '00101000', val: '40', hl: {} },
    { bits: '01010000', val: '80', hl: { 7: BLUE } },
    { bits: '10100000', val: '160', hl: { 7: BLUE } },
  ];

  const rowH = 78;
  const topY = 64;
  const noteY = topY + steps.length * rowH + 8;
  const H = noteY + 48;

  let s = '';
  s += `<text x="320" y="34" font-family="${CJK}" font-size="19" font-weight="bold" fill="#24292f" text-anchor="middle">LSL 逻辑左移：每移一位，数值 ×2</text>`;

  steps.forEach((st, i) => {
    const y = topY + i * rowH;
    const x = 150; // 比特排 300 宽，右侧留位给数值
    s += bitRow(st.bits, x, y, st.hl);
    s += `<text x="490" y="${y + 26}" font-family="${MONO}" font-size="18" font-weight="bold" fill="#24292f">= ${st.val}</text>`;
    if (i < steps.length - 1) {
      const ay = y + BIT_H + 6;
      s += `<text x="320" y="${ay + 20}" font-family="${CJK}" font-size="14" fill="#0969da" text-anchor="middle">↓ LSL #1（左边移出的 0 丢弃，右边补 0）→ ×2</text>`;
    }
  });

  s += `<rect x="16" y="${noteY}" width="608" height="38" rx="8" fill="#ddf4ff"/>`;
  s += `<text x="320" y="${noteY + 25}" font-family="${CJK}" font-size="14" fill="#0969da" text-anchor="middle">规律：左移 n 位 = 乘以 2^n（前提是高位没有被移出去）</text>`;

  return svgDoc(W, H, s);
}

/* --------------------------------------------- 图 3：LSR 与 ASR 的分水岭 */
function fig3() {
  const W = 640;
  const H = 660;
  let s = '';
  s += `<text x="320" y="34" font-family="${CJK}" font-size="19" font-weight="bold" fill="#24292f" text-anchor="middle">LSR 与 ASR 的分水岭：负数右移</text>`;

  // 面板 A：正数 +40，两者相同
  s += `<rect x="16" y="56" width="608" height="212" rx="10" fill="#ffffff" stroke="#d0d7de" stroke-width="1.5"/>`;
  s += `<text x="36" y="86" font-family="${CJK}" font-size="15" font-weight="bold" fill="#24292f">正数 +40：两条指令结果相同</text>`;
  s += `<text x="36" y="112" font-family="${CJK}" font-size="13" fill="#57606a">输入 R0 = 0010 1000（+40）</text>`;
  s += bitRow('00101000', 170, 120);
  s += `<text x="36" y="196" font-family="${MONO}" font-size="14" fill="#57606a">LSR #1 →</text>`;
  s += bitRow('00010100', 170, 172, { 0: BLUE });
  s += `<text x="490" y="196" font-family="${MONO}" font-size="15" fill="#24292f">= 20</text>`;
  s += `<text x="36" y="248" font-family="${MONO}" font-size="14" fill="#57606a">ASR #1 →</text>`;
  s += bitRow('00010100', 170, 224, { 0: RED });
  s += `<text x="490" y="248" font-family="${MONO}" font-size="15" fill="#24292f">= 20</text>`;

  // 面板 B：负数 -40，分道扬镳
  s += `<rect x="16" y="288" width="608" height="292" rx="10" fill="#ffffff" stroke="#d0d7de" stroke-width="1.5"/>`;
  s += `<text x="36" y="318" font-family="${CJK}" font-size="15" font-weight="bold" fill="#24292f">负数 -40：一个变垃圾，一个保符号</text>`;
  s += `<text x="36" y="344" font-family="${CJK}" font-size="13" fill="#57606a">输入 R0 = 1101 1000（-40，符号位为 1）</text>`;
  s += bitRow('11011000', 170, 352, { 0: RED });

  s += `<text x="36" y="430" font-family="${MONO}" font-size="14" fill="#57606a">LSR #1 →</text>`;
  s += bitRow('01101100', 170, 404, { 0: BLUE });
  s += `<text x="490" y="422" font-family="${MONO}" font-size="15" fill="#e5484d">= 108</text>`;
  s += `<text x="490" y="442" font-family="${CJK}" font-size="12" fill="#e5484d">✗ 符号丢失</text>`;

  s += `<text x="36" y="494" font-family="${MONO}" font-size="14" fill="#57606a">ASR #1 →</text>`;
  s += bitRow('11101100', 170, 468, { 0: RED });
  s += `<text x="490" y="486" font-family="${MONO}" font-size="15" fill="#2da44e">= -20</text>`;
  s += `<text x="490" y="506" font-family="${CJK}" font-size="12" fill="#2da44e">✓ 符号位填充</text>`;

  s += `<rect x="36" y="528" width="568" height="36" rx="8" fill="#ffebe9"/>`;
  s += `<text x="320" y="551" font-family="${CJK}" font-size="13" fill="#e5484d" text-anchor="middle">ASR 用最高位（符号位）填充左端空位：正数补 0，负数补 1</text>`;

  s += `<text x="320" y="626" font-family="${CJK}" font-size="13" fill="#57606a" text-anchor="middle">结论：无符号数右移用 LSR，有符号数右移用 ASR——又是「类型在你脑子里」</text>`;

  return svgDoc(W, H, s);
}

/* ----------------------------------------------------- 图 4：ROR 与 RRX */
function fig4() {
  const W = 640;
  const H = 750;
  let s = '';
  s += `<defs>
    <marker id="arrG" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill="#2da44e"/>
    </marker>
    <marker id="arrP" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill="#8250df"/>
    </marker>
  </defs>`;
  s += `<text x="320" y="34" font-family="${CJK}" font-size="19" font-weight="bold" fill="#24292f" text-anchor="middle">ROR 与 RRX：比特的轮回</text>`;

  // ---------- 面板 A：ROR ----------
  s += `<rect x="16" y="56" width="608" height="312" rx="10" fill="#ffffff" stroke="#d0d7de" stroke-width="1.5"/>`;
  s += `<text x="36" y="88" font-family="${CJK}" font-size="15" font-weight="bold" fill="#24292f">ROR 循环右移：转出去的比特从另一端回来</text>`;

  // 输入 0101 0001（81），bit0=1 高亮
  s += `<text x="36" y="122" font-family="${CJK}" font-size="13" fill="#57606a">输入 R0 = 0101 0001（81）</text>`;
  s += bitRow('01010001', 170, 134, { 7: GREEN });

  // 轮回箭头：画在比特排下方，从最右格（bit0）底部绕到最左格（bit7）底部
  const inX = 170;
  const rightCx = inX + 7 * BIT_STEP + BIT_W / 2; // bit0 中心
  const leftCx = inX + BIT_W / 2;                 // bit7 中心
  s += `<path d="M ${rightCx} 176 C ${rightCx} 204, ${leftCx} 204, ${leftCx} 176" fill="none" stroke="#2da44e" stroke-width="2" marker-end="url(#arrG)"/>`;
  s += `<text x="${(leftCx + rightCx) / 2}" y="222" font-family="${CJK}" font-size="12" fill="#2da44e" text-anchor="middle">最右边的 1 绕回最左边</text>`;

  s += `<text x="36" y="270" font-family="${MONO}" font-size="14" fill="#57606a">ROR #1 →</text>`;
  s += bitRow('10101000', 170, 244, { 0: GREEN });
  s += `<text x="490" y="268" font-family="${MONO}" font-size="15" fill="#24292f">= 168</text>`;

  s += `<rect x="36" y="298" width="568" height="52" rx="8" fill="#dcf5e3"/>`;
  s += `<text x="320" y="319" font-family="${CJK}" font-size="13" fill="#2da44e" text-anchor="middle">整条比特队列右移一位，掉出右端的比特不从左边「补 0」，</text>`;
  s += `<text x="320" y="339" font-family="${CJK}" font-size="13" fill="#2da44e" text-anchor="middle">而是亲自绕回左端——没有任何信息丢失</text>`;

  // ---------- 面板 B：RRX ----------
  s += `<rect x="16" y="388" width="608" height="290" rx="10" fill="#ffffff" stroke="#d0d7de" stroke-width="1.5"/>`;
  s += `<text x="36" y="420" font-family="${CJK}" font-size="15" font-weight="bold" fill="#24292f">RRX 扩展循环右移：C 标志加入，变成 33 位的环</text>`;

  // 输入：C=1 + R0 = 0101 0000（80）
  s += `<text x="36" y="454" font-family="${CJK}" font-size="13" fill="#57606a">输入 C = 1，R0 = 0101 0000（80）</text>`;
  // C 格子（紫色）+ 8 比特
  s += `<rect x="114" y="462" width="${BIT_W}" height="${BIT_H}" rx="5" fill="${PURPLE.bg}" stroke="${PURPLE.border}" stroke-width="1.5"/>`;
  s += `<text x="${114 + BIT_W / 2}" y="488" font-family="${MONO}" font-size="18" font-weight="bold" fill="${PURPLE.text}" text-anchor="middle">1</text>`;
  s += `<text x="${114 + BIT_W / 2}" y="516" font-family="${MONO}" font-size="11" fill="${PURPLE.text}" text-anchor="middle">C</text>`;
  s += bitRow('01010000', 170, 462);
  // C→左端 箭头
  s += `<path d="M 148 481 L 166 481" fill="none" stroke="#8250df" stroke-width="2" marker-end="url(#arrP)"/>`;

  s += `<text x="36" y="580" font-family="${MONO}" font-size="14" fill="#57606a">RRX →</text>`;
  // 输出：新 C=0（旧 bit0），结果 1010 1000
  s += `<rect x="114" y="554" width="${BIT_W}" height="${BIT_H}" rx="5" fill="${PURPLE.bg}" stroke="${PURPLE.border}" stroke-width="1.5"/>`;
  s += `<text x="${114 + BIT_W / 2}" y="580" font-family="${MONO}" font-size="18" font-weight="bold" fill="${PURPLE.text}" text-anchor="middle">0</text>`;
  s += `<text x="${114 + BIT_W / 2}" y="608" font-family="${MONO}" font-size="11" fill="${PURPLE.text}" text-anchor="middle">C'</text>`;
  s += bitRow('10101000', 170, 554, { 0: PURPLE });
  s += `<text x="490" y="578" font-family="${MONO}" font-size="15" fill="#24292f">= 168</text>`;

  s += `<rect x="36" y="624" width="568" height="40" rx="8" fill="#fbefff"/>`;
  s += `<text x="320" y="648" font-family="${CJK}" font-size="13" fill="#8250df" text-anchor="middle">旧 C 进入最高位，bit0 进入新 C——C 与 32 位寄存器拼成 33 位的环</text>`;

  s += `<text x="320" y="722" font-family="${CJK}" font-size="13" fill="#57606a" text-anchor="middle">循环移位不丢信息、可逆——这正是加密 / 解密算法钟爱它的原因</text>`;

  return svgDoc(W, H, s);
}

/* ----------------------------------------------------- 图 5：速查表 */
function fig5() {
  const W = 640;
  const cols = [
    { name: '指令', w: 96 },
    { name: '空位怎么填', w: 160 },
    { name: '数学效果', w: 168 },
    { name: '一句话记忆', w: 152 },
  ];
  const rows = [
    ['LSL', '右端补 0', '× 2^n', '左移乘 2'],
    ['LSR', '左端补 0', '÷ 2^n（无符号）', '右移除 2'],
    ['ASR', '左端补符号位', '÷ 2^n（有符号）', '负数也能除'],
    ['ROR', '不补，首尾相接', '比特轮回', '一个都不丢'],
    ['RRX', '经过 C 标志', '33 位旋转', '带上进位一起玩'],
  ];

  const tableX = 20;
  const headH = 44;
  const rowH = 48;
  const tableY = 58;
  const tableW = cols.reduce((a, c) => a + c.w, 0); // 576
  const H = tableY + headH + rows.length * rowH + 20;

  let s = '';
  s += `<text x="320" y="34" font-family="${CJK}" font-size="19" font-weight="bold" fill="#24292f" text-anchor="middle">五条移位指令速查表</text>`;

  // 表头
  s += `<rect x="${tableX}" y="${tableY}" width="${tableW}" height="${headH}" rx="8" fill="#0969da"/>`;
  let cx = tableX;
  cols.forEach((c) => {
    s += `<text x="${cx + c.w / 2}" y="${tableY + 29}" font-family="${CJK}" font-size="15" font-weight="bold" fill="#ffffff" text-anchor="middle">${c.name}</text>`;
    cx += c.w;
  });

  // 表体
  rows.forEach((r, i) => {
    const y = tableY + headH + i * rowH;
    s += `<rect x="${tableX}" y="${y}" width="${tableW}" height="${rowH}" fill="${i % 2 ? '#f6f8fa' : '#ffffff'}" stroke="#d0d7de" stroke-width="1"/>`;
    let x = tableX;
    cols.forEach((c, j) => {
      const mono = j === 0 ? MONO : CJK;
      const bold = j === 0 ? 'bold' : 'normal';
      s += `<text x="${x + c.w / 2}" y="${y + 31}" font-family="${mono}" font-size="14" font-weight="${bold}" fill="#24292f" text-anchor="middle">${r[j]}</text>`;
      x += c.w;
    });
  });

  return svgDoc(W, H, s);
}

/* ------------------------------------------------------------------ 主函数 */
async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const figs = [
    ['fig-shift-ops.png', fig1],
    ['fig-lsl-multiply.png', fig2],
    ['fig-asr-vs-lsr.png', fig3],
    ['fig-ror-rrx.png', fig4],
    ['fig-shift-table.png', fig5],
  ];

  for (const [name, fn] of figs) {
    const svg = fn();
    const out = path.join(OUT_DIR, name);
    await sharp(Buffer.from(svg)).png().toFile(out);
    const meta = await sharp(out).metadata();
    console.log(`${name}: ${meta.width}x${meta.height}`);
  }
  console.log('完成。');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
