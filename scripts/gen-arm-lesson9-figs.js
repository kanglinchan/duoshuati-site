/**
 * 生成「图解 ARM 汇编」第 9 课（循环 / do-while）所需的技术示意图 PNG。
 *
 * 输出目录：docs/public/assets/images/2026-08-arm-assembly/
 *
 * 图清单（竖向布局，适配手机阅读）：
 *   1. fig-loop-map.png      —— C do-while 循环与 ARM 汇编的逐行对照（兼作封面）W=720
 *   2. fig-loop-flow.png     —— 循环流程图：循环体 → CMP 判断 → 退出? / 回 loop（do-while 顺序）
 *   3. fig-loop-trace.png    —— 单步轨迹：r0 从 0 累加到 5 的每一步标志与动作
 *   4. fig-loop-patterns.png —— do-while 骨架 + 退出条件三选一（bge/beq/不写）
 *
 * 运行：node scripts/gen-arm-lesson9-figs.js
 * 依赖：sharp（npm install sharp --save-dev）
 *
 * 注意：改图后必须 node scripts/generate-wechat-html.js 重新生成；推送前务必 npm run build 验证。
 * 布局自检（踩坑记录）：
 *   - 横向多列要先算总宽，列间互不重叠；text-anchor=end 的文字必须核算【左边缘】是否侵入左侧相邻元素。
 *   - 容器顶部 y ≥ 上方元素底部 + 8px；SVG 文本 < > 需转义为 &lt; &gt;。
 *   - 等宽字符宽约 0.6×fontSize，CJK 字符宽约 1.0×fontSize，按此估算文本框宽度并留 ≥10% 余量。
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

/* -------------------------------------- 图 1：C 与汇编逐行对照（封面） */
function fig1() {
  const W = 720;
  const rows = [
    { c: 'int i = 0;', a: '    mov r0, #0', note: '初始化计数器', c2: GRAY },
    { c: 'do {', a: 'loop:', note: '循环入口标签', c2: BLUE },
    { c: '    i++;', a: '    add r0, #1', note: '循环体·先执行', c2: GREEN },
    { c: '} while (i &lt; 5);', a: '    cmp r0, #5', note: '判断：r0≥5 ?', c2: ORANGE },
    { c: '', a: '    bge end', note: '≥5 则跳出', c2: RED },
    { c: '', a: '    b loop', note: '否则跳回入口', c2: ORANGE },
    { c: '', a: 'end:', note: '结束 r0=5', c2: GRAY },
  ];
  const rowH = 60;
  const topY = 70;
  const noteY = topY + rows.length * rowH + 10;
  const H = noteY + 52;

  // 三列完全分离（各自独立矩形，互不侵犯，杜绝文字压框/越界）
  const cX = 24, cW = 212;   // C 列   24~236
  const aX = 266, aW = 250;  // 汇编列 266~516
  const nX = 532, nW = 164;  // 说明列 532~696

  let s = '';
  s += `<defs>
    <marker id="arrD" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill="#57606a"/>
    </marker>
  </defs>`;
  s += `<text x="${W / 2}" y="34" font-family="${CJK}" font-size="18" font-weight="bold" fill="#24292f" text-anchor="middle">C 的 do-while 循环 vs ARM 汇编：逐行对照</text>`;

  // 三列表头
  s += `<text x="${cX + cW / 2}" y="${topY - 12}" font-family="${CJK}" font-size="14" font-weight="bold" fill="#57606a" text-anchor="middle">C 代码</text>`;
  s += `<text x="${aX + aW / 2}" y="${topY - 12}" font-family="${CJK}" font-size="14" font-weight="bold" fill="#57606a" text-anchor="middle">ARM 汇编</text>`;
  s += `<text x="${nX + nW / 2}" y="${topY - 12}" font-family="${CJK}" font-size="14" font-weight="bold" fill="#57606a" text-anchor="middle">说明</text>`;

  rows.forEach((r, i) => {
    const y = topY + i * rowH;
    // C 列
    s += `<rect x="${cX}" y="${y}" width="${cW}" height="48" rx="6" fill="${r.c ? '#ffffff' : '#f6f8fa'}" stroke="#d0d7de" stroke-width="1"/>`;
    s += `<text x="${cX + 16}" y="${y + 31}" font-family="${MONO}" font-size="14" fill="${r.c ? '#24292f' : '#8c959f'}">${r.c || ' '}</text>`;
    // 箭头（C 列与汇编列之间）
    s += `<text x="251" y="${y + 31}" font-family="${MONO}" font-size="18" fill="#57606a" text-anchor="middle">→</text>`;
    // 汇编列
    s += `<rect x="${aX}" y="${y}" width="${aW}" height="48" rx="6" fill="${r.c2.bg}" stroke="${r.c2.border}" stroke-width="1.5"/>`;
    s += `<text x="${aX + 16}" y="${y + 31}" font-family="${MONO}" font-size="14" fill="${r.c2.text}">${r.a}</text>`;
    // 说明列（独立背景框，文字居中，绝不越界压到汇编列）
    s += `<rect x="${nX}" y="${y}" width="${nW}" height="48" rx="6" fill="#ffffff" stroke="#eaeef2" stroke-width="1"/>`;
    s += `<text x="${nX + nW / 2}" y="${y + 31}" font-family="${CJK}" font-size="12" fill="${r.c2.text}" text-anchor="middle">${r.note}</text>`;
  });

  s += `<rect x="16" y="${noteY}" width="${W - 32}" height="38" rx="8" fill="#ddf4ff"/>`;
  s += `<text x="${W / 2}" y="${noteY + 24}" font-family="${CJK}" font-size="13" fill="#0969da" text-anchor="middle">规律：先干活（add）再判断（cmp+bge），至少执行 1 次——这就是 do-while</text>`;

  return svgDoc(W, H, s);
}

/* -------------------------------------- 图 2：循环流程图 */
function fig2() {
  const W = 640;
  const H = 490;
  let s = '';
  s += `<defs>
    <marker id="arrD2" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill="#57606a"/>
    </marker>
    <marker id="arrR" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill="#e5484d"/>
    </marker>
    <marker id="arrG" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill="#2da44e"/>
    </marker>
  </defs>`;
  s += `<text x="320" y="34" font-family="${CJK}" font-size="18" font-weight="bold" fill="#24292f" text-anchor="middle">循环流程图：do-while 转一圈</text>`;

  // 初始
  s += `<rect x="230" y="56" width="180" height="40" rx="8" fill="${GRAY.bg}" stroke="${GRAY.border}" stroke-width="1.5"/>`;
  s += `<text x="320" y="81" font-family="${MONO}" font-size="14" fill="#24292f" text-anchor="middle">mov r0, #0</text>`;
  s += `<line x1="320" y1="96" x2="320" y2="116" stroke="#57606a" stroke-width="2" marker-end="url(#arrD2)"/>`;

  // loop 标签入口
  s += `<rect x="236" y="116" width="168" height="32" rx="6" fill="${BLUE.bg}" stroke="${BLUE.border}" stroke-width="2"/>`;
  s += `<text x="320" y="137" font-family="${MONO}" font-size="13" font-weight="bold" fill="${BLUE.text}" text-anchor="middle">loop:</text>`;
  s += `<line x1="320" y1="148" x2="320" y2="168" stroke="#57606a" stroke-width="2" marker-end="url(#arrD2)"/>`;

  // 循环体（先执行，do-while 核心）
  s += `<rect x="220" y="168" width="200" height="40" rx="8" fill="${GREEN.bg}" stroke="${GREEN.border}" stroke-width="2"/>`;
  s += `<text x="320" y="193" font-family="${MONO}" font-size="14" fill="#24292f" text-anchor="middle">add r0, #1</text>`;
  s += `<text x="426" y="193" font-family="${CJK}" font-size="12" font-weight="bold" fill="${GREEN.text}" text-anchor="start">循环体·先执行</text>`;
  s += `<line x1="320" y1="208" x2="320" y2="232" stroke="#57606a" stroke-width="2" marker-end="url(#arrD2)"/>`;

  // 菱形判断
  s += `<path d="M 320 236 L 444 280 L 320 324 L 196 280 Z" fill="${ORANGE.bg}" stroke="${ORANGE.border}" stroke-width="2"/>`;
  s += `<text x="320" y="276" font-family="${MONO}" font-size="13" font-weight="bold" fill="${ORANGE.text}" text-anchor="middle">cmp r0, #5</text>`;
  s += `<text x="320" y="294" font-family="${CJK}" font-size="12" fill="${ORANGE.text}" text-anchor="middle">r0 ≥ 5 ?</text>`;

  // 退支（是 → end）
  s += `<line x1="444" y1="280" x2="505" y2="280" stroke="#e5484d" stroke-width="2"/>`;
  s += `<line x1="505" y1="280" x2="505" y2="348" stroke="#e5484d" stroke-width="2" marker-end="url(#arrR)"/>`;
  s += `<text x="500" y="270" font-family="${CJK}" font-size="12" font-weight="bold" fill="#e5484d" text-anchor="middle">是·r0≥5</text>`;
  s += `<rect x="430" y="348" width="150" height="40" rx="8" fill="${RED.bg}" stroke="${RED.border}" stroke-width="1.5"/>`;
  s += `<text x="505" y="373" font-family="${MONO}" font-size="13" fill="#24292f" text-anchor="middle">bge end → end:</text>`;

  // 否支（否 → b loop 回循环体）
  s += `<line x1="196" y1="280" x2="120" y2="280" stroke="#2da44e" stroke-width="2"/>`;
  s += `<line x1="120" y1="280" x2="120" y2="188" stroke="#2da44e" stroke-width="2"/>`;
  s += `<line x1="120" y1="188" x2="220" y2="188" stroke="#2da44e" stroke-width="2" marker-end="url(#arrG)"/>`;
  s += `<text x="135" y="270" font-family="${CJK}" font-size="12" font-weight="bold" fill="#2da44e" text-anchor="middle">否·r0&lt;5</text>`;
  s += `<rect x="74" y="224" width="92" height="22" rx="6" fill="#ffffff" stroke="#9aa4b2" stroke-width="1"/>`;
  s += `<text x="120" y="240" font-family="${MONO}" font-size="12" fill="#57606a" text-anchor="middle">b loop</text>`;

  s += `<text x="320" y="408" font-family="${CJK}" font-size="13" fill="#57606a" text-anchor="middle">先执行循环体，再判断退出：do-while 至少跑 1 次</text>`;
  s += `<rect x="16" y="424" width="608" height="44" rx="8" fill="#fff1e5"/>`;
  s += `<text x="320" y="451" font-family="${CJK}" font-size="13" fill="#bc4c00" text-anchor="middle">do-while 特征：第一次必先进循环体；要「可能 0 次」得把 cmp 挪到 add 之前</text>`;

  return svgDoc(W, H, s);
}

/* -------------------------------------- 图 3：单步轨迹 */
function fig3() {
  const W = 700;
  const steps = [
    { r0: 0, flag: 'r0=0', act: '初始值；do-while 先干活，进入 loop 直接执行 add', c: GRAY },
    { r0: 1, flag: 'r0=1', act: 'add → 1；cmp 1,5 → 1&lt;5 不退出，b loop', c: GREEN },
    { r0: 2, flag: 'r0=2', act: 'add → 2；cmp 2,5 → b loop 跳回', c: GREEN },
    { r0: 3, flag: 'r0=3', act: 'add → 3；cmp 3,5 → b loop 跳回', c: GREEN },
    { r0: 4, flag: 'r0=4', act: 'add → 4；cmp 4,5 → b loop 跳回', c: GREEN },
    { r0: 5, flag: 'r0=5', act: 'add → 5；cmp 5,5 → 5≥5，bge end 跳出', c: RED },
  ];
  const rowH = 58;
  const topY = 60;
  const noteY = topY + steps.length * rowH + 8;
  const H = noteY + 46;

  let s = '';
  s += `<text x="${W / 2}" y="34" font-family="${CJK}" font-size="18" font-weight="bold" fill="#24292f" text-anchor="middle">单步轨迹：r0 从 0 累加到 5</text>`;

  steps.forEach((st, i) => {
    const y = topY + i * rowH;
    s += `<rect x="16" y="${y}" width="${W - 32}" height="48" rx="10" fill="#ffffff" stroke="${st.c.border}" stroke-width="${i === 0 || i === steps.length - 1 ? 2 : 1}"/>`;
    // 序号 + r0 值
    s += `<rect x="32" y="${y + 8}" width="80" height="32" rx="6" fill="${st.c.bg}" stroke="${st.c.border}" stroke-width="1.5"/>`;
    s += `<text x="72" y="${y + 30}" font-family="${MONO}" font-size="15" font-weight="bold" fill="${st.c.text}" text-anchor="middle">r0=${st.r0}</text>`;
    // 动作
    s += `<text x="130" y="${y + 31}" font-family="${CJK}" font-size="14" fill="#24292f">${st.act}</text>`;
    // 循环箭头（步骤间）
    if (i < steps.length - 1) {
      s += `<text x="${W - 20}" y="${y + 50}" font-family="${MONO}" font-size="13" fill="#57606a" text-anchor="end">↓ 第 ${i + 1} 轮</text>`;
    }
  });

  s += `<rect x="16" y="${noteY}" width="${W - 32}" height="38" rx="8" fill="#dcf5e3"/>`;
  s += `<text x="${W / 2}" y="${noteY + 24}" font-family="${CJK}" font-size="13" fill="#2da44e" text-anchor="middle">循环体（add）执行 5 次，r0 从 0 涨到 5；判断紧跟在 add 之后——do-while 至少跑 1 次</text>`;

  return svgDoc(W, H, s);
}

/* -------------------------------------- 图 4：do-while 骨架与退出条件 */
function fig4() {
  const W = 640;
  const H = 460;
  let s = '';
  s += `<text x="320" y="34" font-family="${CJK}" font-size="18" font-weight="bold" fill="#24292f" text-anchor="middle">循环骨架：do-while 形态 + 退出条件三选一</text>`;

  // 骨架代码块
  const code = [
    '        mov r0, #0',
    'loop:',
    '        add r0, #1   @ 循环体（先执行）',
    '        cmp r0, #5',
    '        bGE end      @ r0 ≥ 5 退出',
    '        b loop       @ 否则回到入口',
    'end:',
  ];
  s += `<rect x="24" y="56" width="320" height="264" rx="10" fill="#1e1e1e"/>`;
  code.forEach((l, i) => {
    const y = 84 + i * 32;
    const c = l.includes('bGE') ? RED.text : l.includes('add') ? GREEN.text : l.includes('b loop') ? ORANGE.text : '#d4d4d4';
    s += `<text x="40" y="${y}" font-family="${MONO}" font-size="14" fill="${c}">${l}</text>`;
  });
  s += `<text x="184" y="340" font-family="${CJK}" font-size="12" fill="#9aa4b2" text-anchor="middle">先 add 再 cmp：循环体至少做 1 次，这就是 do-while</text>`;

  // 右侧：退出条件三选一
  s += `<rect x="360" y="56" width="256" height="264" rx="10" fill="#ffffff" stroke="#d0d7de" stroke-width="1.5"/>`;
  s += `<text x="488" y="84" font-family="${CJK}" font-size="14" font-weight="bold" fill="#24292f" text-anchor="middle">退出条件怎么写</text>`;
  const opts = [
    { t: 'bGE end', d: 'r0 ≥ 5 退出（对应 while(i &lt; 5)）', c: RED },
    { t: 'bEQ end', d: 'i == 目标 退出（对应 while(i != 目标)）', c: BLUE },
    { t: '（不写）', d: '死循环，靠别处 break', c: GRAY },
  ];
  opts.forEach((o, i) => {
    const y = 104 + i * 64;
    s += `<rect x="376" y="${y}" width="224" height="56" rx="6" fill="${o.c.bg}" stroke="${o.c.border}" stroke-width="1.5"/>`;
    s += `<text x="488" y="${y + 26}" font-family="${MONO}" font-size="15" font-weight="bold" fill="${o.c.text}" text-anchor="middle">${o.t}</text>`;
    s += `<text x="488" y="${y + 46}" font-family="${CJK}" font-size="12" fill="#57606a" text-anchor="middle">${o.d}</text>`;
  });

  s += `<rect x="16" y="356" width="608" height="44" rx="8" fill="#fff1e5"/>`;
  s += `<text x="320" y="383" font-family="${CJK}" font-size="13" fill="#bc4c00" text-anchor="middle">提示：循环体至少做 1 次（do-while）；要「可能 0 次」得把 cmp 挪到循环体之前</text>`;
  s += `<rect x="16" y="404" width="608" height="40" rx="8" fill="#dcf5e3"/>`;
  s += `<text x="320" y="429" font-family="${CJK}" font-size="13" fill="#2da44e" text-anchor="middle">记住这个骨架，for / while 都是它的变体</text>`;

  return svgDoc(W, H, s);
}

/* ------------------------------------------------------------------ 主函数 */
async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const figs = [
    ['fig-loop-map.png', fig1],
    ['fig-loop-flow.png', fig2],
    ['fig-loop-trace.png', fig3],
    ['fig-loop-patterns.png', fig4],
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
