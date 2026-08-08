/**
 * 生成「图解 ARM 汇编」第 8 课（B 指令与条件分支）所需的技术示意图 PNG。
 *
 * 输出目录：docs/public/assets/images/2026-08-arm-assembly/
 *
 * 图清单（全部宽度 640，竖向布局，适配手机阅读）：
 *   1. fig-branch-flow.png      —— 顺序流 vs 分支流：程序第一次有了岔路（兼作封面）
 *   2. fig-beq-demo.png         —— 完整实验的执行轨迹：BEQ 不跳、B 兜底跳
 *   3. fig-cond-suffix.png      —— 条件后缀速查表：EQ/NE/GT/LT/GE/LE/AL
 *   4. fig-if-else-pattern.png  —— if-else 的正确拼装：两条「胶水分支」缺一不可
 *
 * 运行：node scripts/gen-arm-lesson8-figs.js
 * 依赖：sharp（npm install sharp --save-dev）
 *
 * 注意：改图后必须重新运行 generate-wechat-html.js，否则公众号 HTML 内嵌的 base64 仍是旧图。
 * 布局自检：容器顶部 y 必须 ≥ 上方元素底部 + 8px；SVG 文本中的 < > 必须转义。
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'docs', 'public', 'assets', 'images', '2026-08-arm-assembly');

const CJK = 'Microsoft YaHei, PingFang SC, Hiragino Sans GB, sans-serif';
const MONO = 'DejaVu Sans Mono, Consolas, monospace';

const BLUE = { bg: '#ddf4ff', border: '#0969da', text: '#0969da' };
const RED = { bg: '#ffebe9', border: '#e5484d', text: '#e5484d' };
const GREEN = { bg: '#dcf5e3', border: '#2da44e', text: '#2da44e' };
const ORANGE = { bg: '#fff1e5', border: '#bc4c00', text: '#bc4c00' };
const GRAY = { bg: '#eff1f3', border: '#d0d7de', text: '#57606a' };

function svgDoc(w, h, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="#f8f9fb"/>
${inner}
</svg>`;
}

/* -------------------------------------- 图 1：顺序流 vs 分支流（封面） */
function fig1() {
  const W = 640;
  const H = 620;
  let s = '';
  s += `<defs>
    <marker id="arrD" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill="#57606a"/>
    </marker>
  </defs>`;
  s += `<text x="320" y="34" font-family="${CJK}" font-size="19" font-weight="bold" fill="#24292f" text-anchor="middle">顺序流 vs 分支流：程序第一次有了岔路</text>`;

  // 面板 A：顺序流（横向三盒）
  s += `<rect x="16" y="52" width="608" height="140" rx="10" fill="#ffffff" stroke="#d0d7de" stroke-width="1.5"/>`;
  s += `<text x="36" y="82" font-family="${CJK}" font-size="15" font-weight="bold" fill="#24292f">没有分支：一条道走到黑</text>`;
  const seq = ['mov r0, #4', 'cmp r0, r1', 'mov r2, #1'];
  seq.forEach((t, i) => {
    const bx = 52 + i * 190;
    s += `<rect x="${bx}" y="102" width="150" height="44" rx="8" fill="${GRAY.bg}" stroke="${GRAY.border}" stroke-width="1.5"/>`;
    s += `<text x="${bx + 75}" y="129" font-family="${MONO}" font-size="14" fill="#24292f" text-anchor="middle">${t}</text>`;
    if (i < 2) {
      s += `<text x="${bx + 170}" y="131" font-family="${MONO}" font-size="18" fill="#57606a" text-anchor="middle">→</text>`;
    }
  });
  s += `<text x="320" y="176" font-family="${CJK}" font-size="12" fill="#57606a" text-anchor="middle">PC 寄存器自顾自地 +4，谁也不拦它</text>`;

  // 面板 B：分支流
  s += `<rect x="16" y="212" width="608" height="392" rx="10" fill="#ffffff" stroke="#d0d7de" stroke-width="1.5"/>`;
  s += `<text x="36" y="242" font-family="${CJK}" font-size="15" font-weight="bold" fill="#24292f">有了分支：CMP 出题，BEQ 判卷</text>`;

  // CMP 盒
  s += `<rect x="230" y="258" width="180" height="40" rx="8" fill="#0969da"/>`;
  s += `<text x="320" y="283" font-family="${MONO}" font-size="15" font-weight="bold" fill="#ffffff" text-anchor="middle">cmp r0, r1</text>`;
  // 箭头到菱形
  s += `<line x1="320" y1="298" x2="320" y2="318" stroke="#57606a" stroke-width="2" marker-end="url(#arrD)"/>`;
  // 菱形
  s += `<path d="M 320 322 L 430 372 L 320 422 L 210 372 Z" fill="${ORANGE.bg}" stroke="${ORANGE.border}" stroke-width="2"/>`;
  s += `<text x="320" y="368" font-family="${MONO}" font-size="15" font-weight="bold" fill="${ORANGE.text}" text-anchor="middle">beq：Z = 1 ?</text>`;
  s += `<text x="320" y="390" font-family="${CJK}" font-size="11" fill="${ORANGE.text}" text-anchor="middle">（两数相等吗）</text>`;

  // 左支：是 → cond1
  s += `<line x1="210" y1="372" x2="150" y2="372" stroke="#2da44e" stroke-width="2"/>`;
  s += `<line x1="150" y1="372" x2="150" y2="438" stroke="#2da44e" stroke-width="2" marker-end="url(#arrD)"/>`;
  s += `<text x="176" y="364" font-family="${CJK}" font-size="13" font-weight="bold" fill="#2da44e" text-anchor="middle">是</text>`;
  s += `<rect x="40" y="442" width="220" height="56" rx="8" fill="${GREEN.bg}" stroke="${GREEN.border}" stroke-width="2"/>`;
  s += `<text x="150" y="466" font-family="${MONO}" font-size="13" font-weight="bold" fill="#24292f" text-anchor="middle">cond1:</text>`;
  s += `<text x="150" y="488" font-family="${MONO}" font-size="13" fill="#24292f" text-anchor="middle">mov r2, #1</text>`;

  // 右支：否 → cond2
  s += `<line x1="430" y1="372" x2="490" y2="372" stroke="#e5484d" stroke-width="2"/>`;
  s += `<line x1="490" y1="372" x2="490" y2="438" stroke="#e5484d" stroke-width="2" marker-end="url(#arrD)"/>`;
  s += `<text x="464" y="364" font-family="${CJK}" font-size="13" font-weight="bold" fill="#e5484d" text-anchor="middle">否</text>`;
  s += `<rect x="380" y="442" width="220" height="56" rx="8" fill="${RED.bg}" stroke="${RED.border}" stroke-width="2"/>`;
  s += `<text x="490" y="466" font-family="${MONO}" font-size="13" font-weight="bold" fill="#24292f" text-anchor="middle">cond2:</text>`;
  s += `<text x="490" y="488" font-family="${MONO}" font-size="13" fill="#24292f" text-anchor="middle">mov r3, #2</text>`;

  // 汇合
  s += `<line x1="150" y1="498" x2="150" y2="534" stroke="#57606a" stroke-width="2"/>`;
  s += `<line x1="490" y1="498" x2="490" y2="534" stroke="#57606a" stroke-width="2"/>`;
  s += `<line x1="150" y1="534" x2="230" y2="534" stroke="#57606a" stroke-width="2"/>`;
  s += `<line x1="490" y1="534" x2="410" y2="534" stroke="#57606a" stroke-width="2"/>`;
  s += `<rect x="230" y="520" width="180" height="30" rx="8" fill="#ffffff" stroke="#9aa4b2" stroke-width="1.5"/>`;
  s += `<text x="320" y="540" font-family="${CJK}" font-size="13" fill="#57606a" text-anchor="middle">汇合，继续往下走</text>`;

  s += `<text x="320" y="584" font-family="${CJK}" font-size="13" fill="#57606a" text-anchor="middle">分支的本质：按标志位决定 PC 的下一个值，而不是无脑 +4</text>`;

  return svgDoc(W, H, s);
}

/* ------------------------------------------------ 图 2：实验执行轨迹 */
function fig2() {
  const W = 640;
  const lines = [
    { t: 'mov r0, #4', st: 'run', note: '' },
    { t: 'mov r1, #5', st: 'run', note: '' },
    { t: 'cmp r0, r1', st: 'run', note: '4≠5，Z=0' },
    { t: 'beq cond1', st: 'run', note: 'Z=0，不跳' },
    { t: 'b cond2', st: 'run', note: '', noteIn: '← 无条件跳转' },
    { t: 'cond1:', st: 'skip', note: '' },
    { t: '    mov r2, #1', st: 'skip', note: '被跳过' },
    { t: 'cond2:', st: 'land', note: '' },
    { t: '    mov r3, #2', st: 'land', note: '跳到这里执行' },
  ];

  const rowH = 36;
  const topY = 64;
  const H = topY + lines.length * rowH + 56;

  let s = '';
  s += `<defs>
    <marker id="arrJ" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill="#2da44e"/>
    </marker>
  </defs>`;
  s += `<text x="320" y="34" font-family="${CJK}" font-size="19" font-weight="bold" fill="#24292f" text-anchor="middle">单步实验：BEQ 不跳，B 兜底跳（R0=4, R1=5）</text>`;

  lines.forEach((l, i) => {
    const y = topY + i * rowH;
    const c = l.st === 'run' ? GREEN : l.st === 'land' ? BLUE : GRAY;
    s += `<rect x="36" y="${y}" width="430" height="${rowH - 4}" fill="${c.bg}" stroke="${c.border}" stroke-width="1" rx="4"/>`;
    s += `<text x="52" y="${y + 22}" font-family="${MONO}" font-size="14" fill="${l.st === 'skip' ? '#8c959f' : '#24292f'}">${l.t}</text>`;
    if (l.noteIn) {
      s += `<text x="180" y="${y + 22}" font-family="${CJK}" font-size="12" fill="${c.text}">${l.noteIn}</text>`;
    }
    if (l.note) {
      s += `<text x="480" y="${y + 22}" font-family="${CJK}" font-size="12" fill="${c.text}">${l.note}</text>`;
    }
  });

  // 跳转弧线：b cond2 行 → cond2 着陆行
  const fromY = topY + 4 * rowH + 16;  // b cond2 行中
  const toY = topY + 7 * rowH + 16;    // cond2: 行中
  s += `<path d="M 466 ${fromY} C 560 ${fromY}, 560 ${toY}, 470 ${toY}" fill="none" stroke="#2da44e" stroke-width="2" marker-end="url(#arrJ)"/>`;

  s += `<text x="320" y="${H - 22}" font-family="${CJK}" font-size="13" fill="#57606a" text-anchor="middle">绿色 = 顺序执行，灰色 = 被跳过，蓝色 = 跳转着陆点</text>`;

  return svgDoc(W, H, s);
}

/* --------------------------------------------------- 图 3：条件后缀表 */
function fig3() {
  const W = 640;
  const cols = [
    { name: '后缀', w: 100 },
    { name: '含义', w: 168 },
    { name: '何时跳转（看 CPSR）', w: 308 },
  ];
  const rows = [
    ['EQ', '相等 equal', 'Z = 1'],
    ['NE', '不等 not equal', 'Z = 0'],
    ['GT', '大于 greater than', 'Z = 0 且 N = V'],
    ['LT', '小于 less than', 'N ≠ V'],
    ['GE', '大于等于 greater or equal', 'N = V'],
    ['LE', '小于等于 less or equal', 'Z = 1 或 N ≠ V'],
    ['AL', '总是 always', '无条件（通常省略不写）'],
  ];

  const tableX = 20;
  const headH = 42;
  const rowH = 42;
  const tableY = 56;
  const tableW = cols.reduce((a, c) => a + c.w, 0); // 576
  const noteY = tableY + headH + rows.length * rowH + 10;
  const H = noteY + 46;

  let s = '';
  s += `<text x="320" y="34" font-family="${CJK}" font-size="19" font-weight="bold" fill="#24292f" text-anchor="middle">条件后缀速查表：B 的七十二变</text>`;

  s += `<rect x="${tableX}" y="${tableY}" width="${tableW}" height="${headH}" rx="8" fill="#0969da"/>`;
  let cx = tableX;
  cols.forEach((c) => {
    s += `<text x="${cx + c.w / 2}" y="${tableY + 28}" font-family="${CJK}" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">${c.name}</text>`;
    cx += c.w;
  });

  rows.forEach((r, i) => {
    const y = tableY + headH + i * rowH;
    s += `<rect x="${tableX}" y="${y}" width="${tableW}" height="${rowH}" fill="${i % 2 ? '#f6f8fa' : '#ffffff'}" stroke="#d0d7de" stroke-width="1"/>`;
    let x = tableX;
    cols.forEach((c, j) => {
      const mono = j !== 1 ? MONO : CJK;
      const bold = j === 0 ? 'bold' : 'normal';
      const fill = j === 0 ? '#0969da' : '#24292f';
      s += `<text x="${x + c.w / 2}" y="${y + 28}" font-family="${mono}" font-size="14" font-weight="${bold}" fill="${fill}" text-anchor="middle">${r[j]}</text>`;
      x += c.w;
    });
  });

  s += `<rect x="${tableX}" y="${noteY}" width="${tableW}" height="36" rx="8" fill="#ddf4ff"/>`;
  s += `<text x="320" y="${noteY + 24}" font-family="${CJK}" font-size="13" fill="#0969da" text-anchor="middle">用法：直接拼在 B 后面——B + EQ = beq，B + NE = bne，B + LT = blt</text>`;

  return svgDoc(W, H, s);
}

/* ------------------------------------------- 图 4：if-else 正确拼装 */
function fig4() {
  const W = 640;
  const H = 560;
  let s = '';
  s += `<text x="320" y="34" font-family="${CJK}" font-size="19" font-weight="bold" fill="#24292f" text-anchor="middle">if-else 的正确拼装：两条「胶水分支」缺一不可</text>`;

  // C 代码盒
  s += `<rect x="16" y="52" width="608" height="120" rx="10" fill="#ffffff" stroke="#d0d7de" stroke-width="1.5"/>`;
  s += `<text x="36" y="80" font-family="${CJK}" font-size="14" font-weight="bold" fill="#57606a">C 语言的 if-else</text>`;
  const cl = ['if (r0 == r1) {', '    r2 = 1;', '} else {', '    r3 = 2;', '}'];
  cl.forEach((t, i) => {
    s += `<text x="60" y="${104 + i * 17}" font-family="${MONO}" font-size="13" fill="#24292f">${t}</text>`;
  });

  // 汇编盒
  s += `<rect x="16" y="188" width="608" height="316" rx="10" fill="#ffffff" stroke="#d0d7de" stroke-width="1.5"/>`;
  s += `<text x="36" y="216" font-family="${CJK}" font-size="14" font-weight="bold" fill="#57606a">对应的 ARM 汇编</text>`;

  const asm = [
    { t: '    cmp r0, r1', c: null, note: '侦察兵布置标志' },
    { t: '    beq cond1', c: BLUE, note: '胶水① 条件跳：相等才去 if 体' },
    { t: '    b cond2', c: ORANGE, note: '胶水② 兜底跳：不等就去 else 体' },
    { t: 'cond1:', c: null, note: '' },
    { t: '    mov r2, #1', c: GREEN, note: 'if 体' },
    { t: '    b end', c: ORANGE, note: '胶水③ 防穿透：干完就走，别进 else' },
    { t: 'cond2:', c: null, note: '' },
    { t: '    mov r3, #2', c: RED, note: 'else 体' },
    { t: 'end:', c: null, note: '汇合点' },
  ];
  asm.forEach((l, i) => {
    const y = 232 + i * 30;
    if (l.c) {
      s += `<rect x="36" y="${y}" width="300" height="26" rx="4" fill="${l.c.bg}" stroke="${l.c.border}" stroke-width="1"/>`;
    }
    s += `<text x="48" y="${y + 18}" font-family="${MONO}" font-size="13" fill="#24292f">${l.t}</text>`;
    if (l.note) {
      s += `<text x="352" y="${y + 18}" font-family="${CJK}" font-size="12" fill="${l.c ? l.c.text : '#57606a'}">${l.note}</text>`;
    }
  });

  s += `<rect x="16" y="516" width="608" height="36" rx="8" fill="#fff1e5"/>`;
  s += `<text x="320" y="539" font-family="${CJK}" font-size="13" fill="#bc4c00" text-anchor="middle">少了「防穿透跳」，if 体执行完会顺势滑进 else 体——两个分支都跑一遍</text>`;

  return svgDoc(W, H, s);
}

/* ------------------------------------------------------------------ 主函数 */
async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const figs = [
    ['fig-branch-flow.png', fig1],
    ['fig-beq-demo.png', fig2],
    ['fig-cond-suffix.png', fig3],
    ['fig-if-else-pattern.png', fig4],
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
