/**
 * 生成「图解 ARM 汇编」第 9 课（while 循环）所需的技术示意图 PNG。
 *
 * 输出目录：docs/public/assets/images/2026-08-arm-assembly/
 *
 * 图清单（全部宽度 640，竖向布局，适配手机阅读）：
 *   1. fig-loop-map.png      —— C while 循环与 ARM 汇编的逐行对照（兼作封面）
 *   2. fig-loop-flow.png     —— 循环流程图：loop 标签 → CMP → 退出? → 循环体 → 回 loop
 *   3. fig-loop-trace.png    —— 单步轨迹：r0 从 0 累加到 5 的每一步标志与动作
 *   4. fig-loop-patterns.png —— do-while 模式骨架 + 退出条件三选一（bge/bne/不写）
 *
 * 运行：node scripts/gen-arm-lesson9-figs.js
 * 依赖：sharp（npm install sharp --save-dev）
 *
 * 注意：改图后必须 node scripts/generate-wechat-html.js 重新生成；推送前务必 npm run build 验证。
 * 布局自检：容器顶部 y ≥ 上方元素底部 + 8px；SVG 文本 < > 需转义为 &lt; &gt;。
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
  const W = 640;
  const rows = [
    { c: 'int i = 0;', a: '    mov r0, #0', note: '初始化计数器', c2: GRAY },
    { c: 'while (i &lt; 5) {', a: 'loop:', note: '循环入口标签', c2: BLUE },
    { c: '    i++;', a: '    cmp r0, #5', note: '该退出吗？r0 ≥ 5 ?', c2: ORANGE },
    { c: '}', a: '    bge end', note: '≥5 则跳出', c2: RED },
    { c: '', a: '    add r0, #1', note: 'i++（循环体）', c2: GREEN },
    { c: '', a: '    b loop', note: '无条件跳回循环入口', c2: ORANGE },
    { c: '', a: 'end:', note: '循环结束，r0 = 5', c2: GRAY },
  ];
  const rowH = 56;
  const topY = 64;
  const noteY = topY + rows.length * rowH + 8;
  const H = noteY + 50;

  let s = '';
  s += `<defs>
    <marker id="arrD" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill="#57606a"/>
    </marker>
  </defs>`;
  s += `<text x="320" y="34" font-family="${CJK}" font-size="18" font-weight="bold" fill="#24292f" text-anchor="middle">C 的 while 循环 vs ARM 汇编：逐行对照</text>`;

  // 两列表头
  s += `<text x="150" y="${topY - 10}" font-family="${CJK}" font-size="14" font-weight="bold" fill="#57606a" text-anchor="middle">C 代码</text>`;
  s += `<text x="470" y="${topY - 10}" font-family="${CJK}" font-size="14" font-weight="bold" fill="#57606a" text-anchor="middle">ARM 汇编</text>`;

  rows.forEach((r, i) => {
    const y = topY + i * rowH;
    // C 列
    s += `<rect x="36" y="${y}" width="228" height="44" rx="6" fill="${r.c ? '#ffffff' : '#f6f8fa'}" stroke="#d0d7de" stroke-width="1"/>`;
    s += `<text x="52" y="${y + 29}" font-family="${MONO}" font-size="14" fill="${r.c ? '#24292f' : '#8c959f'}">${r.c || ' '}</text>`;
    // 箭头
    s += `<text x="288" y="${y + 29}" font-family="${MONO}" font-size="18" fill="#57606a" text-anchor="middle">→</text>`;
    // 汇编列
    s += `<rect x="320" y="${y}" width="284" height="44" rx="6" fill="${r.c2.bg}" stroke="${r.c2.border}" stroke-width="1.5"/>`;
    s += `<text x="336" y="${y + 29}" font-family="${MONO}" font-size="14" fill="${r.c2.text}">${r.a}</text>`;
    if (r.note) {
      s += `<text x="612" y="${y + 22}" font-family="${CJK}" font-size="11" fill="${r.c2.text}" text-anchor="end">${r.note}</text>`;
    }
  });

  s += `<rect x="16" y="${noteY}" width="608" height="38" rx="8" fill="#ddf4ff"/>`;
  s += `<text x="320" y="${noteY + 24}" font-family="${CJK}" font-size="13" fill="#0969da" text-anchor="middle">规律：先干活（add）再判断（cmp+bge），这正是 do-while 形态</text>`;

  return svgDoc(W, H, s);
}

/* -------------------------------------- 图 2：循环流程图 */
function fig2() {
  const W = 640;
  const H = 560;
  let s = '';
  s += `<defs>
    <marker id="arrD2" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill="#57606a"/>
    </marker>
    <marker id="arrR" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill="#e5484d"/>
    </marker>
  </defs>`;
  s += `<text x="320" y="34" font-family="${CJK}" font-size="18" font-weight="bold" fill="#24292f" text-anchor="middle">循环流程图：转一圈的四个动作</text>`;

  // 初始
  s += `<rect x="230" y="52" width="180" height="40" rx="8" fill="${GRAY.bg}" stroke="${GRAY.border}" stroke-width="1.5"/>`;
  s += `<text x="320" y="77" font-family="${MONO}" font-size="14" fill="#24292f" text-anchor="middle">mov r0, #0</text>`;
  s += `<line x1="320" y1="92" x2="320" y2="112" stroke="#57606a" stroke-width="2" marker-end="url(#arrD2)"/>`;

  // loop 菱形入口
  s += `<rect x="236" y="114" width="168" height="34" rx="6" fill="${BLUE.bg}" stroke="${BLUE.border}" stroke-width="2"/>`;
  s += `<text x="320" y="136" font-family="${MONO}" font-size="13" font-weight="bold" fill="${BLUE.text}" text-anchor="middle">loop:</text>`;
  s += `<line x1="320" y1="148" x2="320" y2="166" stroke="#57606a" stroke-width="2" marker-end="url(#arrD2)"/>`;

  // 菱形判断
  s += `<path d="M 320 170 L 440 224 L 320 278 L 200 224 Z" fill="${ORANGE.bg}" stroke="${ORANGE.border}" stroke-width="2"/>`;
  s += `<text x="320" y="220" font-family="${MONO}" font-size="13" font-weight="bold" fill="${ORANGE.text}" text-anchor="middle">cmp r0, #5</text>`;
  s += `<text x="320" y="240" font-family="${CJK}" font-size="12" fill="${ORANGE.text}" text-anchor="middle">r0 ≥ 5 ?</text>`;

  // 退支（红，向右下）
  s += `<path d="M 440 224 C 520 224, 540 300, 470 320" fill="none" stroke="#e5484d" stroke-width="2" marker-end="url(#arrR)"/>`;
  s += `<text x="540" y="262" font-family="${CJK}" font-size="12" font-weight="bold" fill="#e5484d" text-anchor="middle">是 → end</text>`;
  s += `<rect x="430" y="320" width="130" height="40" rx="8" fill="${RED.bg}" stroke="${RED.border}" stroke-width="1.5"/>`;
  s += `<text x="495" y="345" font-family="${MONO}" font-size="13" fill="#24292f" text-anchor="middle">bge end</text>`;

  // 循环体（绿，向左下）
  s += `<path d="M 200 224 C 120 224, 100 300, 170 320" fill="none" stroke="#2da44e" stroke-width="2" marker-end="url(#arrD2)"/>`;
  s += `<text x="100" y="262" font-family="${CJK}" font-size="12" font-weight="bold" fill="#2da44e" text-anchor="middle">否 → 循环体</text>`;
  s += `<rect x="80" y="320" width="150" height="40" rx="8" fill="${GREEN.bg}" stroke="${GREEN.border}" stroke-width="1.5"/>`;
  s += `<text x="155" y="345" font-family="${MONO}" font-size="13" fill="#24292f" text-anchor="middle">add r0, #1</text>`;

  // 回 loop（橙，从循环体底部回到入口）
  s += `<line x1="155" y1="360" x2="155" y2="400" stroke="#57606a" stroke-width="2"/>`;
  s += `<line x1="155" y1="400" x2="320" y2="400" stroke="#57606a" stroke-width="2"/>`;
  s += `<line x1="320" y1="400" x2="320" y2="148" stroke="#57606a" stroke-width="2" marker-end="url(#arrD2)"/>`;
  s += `<rect x="170" y="392" width="220" height="22" rx="6" fill="#ffffff" stroke="#9aa4b2" stroke-width="1"/>`;
  s += `<text x="280" y="407" font-family="${MONO}" font-size="12" fill="#57606a" text-anchor="middle">b loop（跳回循环入口）</text>`;

  s += `<text x="320" y="452" font-family="${CJK}" font-size="13" fill="#57606a" text-anchor="middle">判断成立跳 end，不成立就 add 再 b loop，周而复始</text>`;
  s += `<rect x="16" y="468" width="608" height="40" rx="8" fill="#fff1e5"/>`;
  s += `<text x="320" y="492" font-family="${CJK}" font-size="13" fill="#bc4c00" text-anchor="middle">退出条件写在循环「顶部」：先判断再进循环体，循环体至少可能 0 次不执行</text>`;

  return svgDoc(W, H, s);
}

/* -------------------------------------- 图 3：单步轨迹 */
function fig3() {
  const W = 640;
  const steps = [
    { r0: 0, flag: 'r0=0', act: '进入 loop，cmp 0,5 → N=1（0&lt;5）', c: ORANGE },
    { r0: 1, flag: 'r0=1', act: 'add → 1；b loop 跳回', c: GREEN },
    { r0: 2, flag: 'r0=2', act: 'add → 2；b loop 跳回', c: GREEN },
    { r0: 3, flag: 'r0=3', act: 'add → 3；b loop 跳回', c: GREEN },
    { r0: 4, flag: 'r0=4', act: 'add → 4；b loop 跳回', c: GREEN },
    { r0: 5, flag: 'r0=5', act: 'cmp 5,5 → Z=1；bge end 生效，跳出', c: RED },
  ];
  const rowH = 58;
  const topY = 60;
  const noteY = topY + steps.length * rowH + 8;
  const H = noteY + 46;

  let s = '';
  s += `<text x="320" y="34" font-family="${CJK}" font-size="18" font-weight="bold" fill="#24292f" text-anchor="middle">单步轨迹：r0 从 0 累加到 5</text>`;

  steps.forEach((st, i) => {
    const y = topY + i * rowH;
    s += `<rect x="16" y="${y}" width="608" height="48" rx="10" fill="#ffffff" stroke="${st.c.border}" stroke-width="i === 0 || i === steps.length - 1 ? 2 : 1"/>`;
    // 序号 + r0 值
    s += `<rect x="32" y="${y + 8}" width="80" height="32" rx="6" fill="${st.c.bg}" stroke="${st.c.border}" stroke-width="1.5"/>`;
    s += `<text x="72" y="${y + 30}" font-family="${MONO}" font-size="15" font-weight="bold" fill="${st.c.text}" text-anchor="middle">r0=${st.r0}</text>`;
    // 动作
    s += `<text x="130" y="${y + 31}" font-family="${CJK}" font-size="14" fill="#24292f">${st.act}</text>`;
    // 循环箭头（步骤间）
    if (i < steps.length - 1) {
      s += `<text x="612" y="${y + 60}" font-family="${MONO}" font-size="14" fill="#57606a" text-anchor="end">↓ 第 ${i + 1} 轮</text>`;
    }
  });

  s += `<rect x="16" y="${noteY}" width="608" height="38" rx="8" fill="#dcf5e3"/>`;
  s += `<text x="320" y="${noteY + 24}" font-family="${CJK}" font-size="13" fill="#2da44e" text-anchor="middle">循环体执行 5 次，最后 r0 = 5、R1 = 2（end 处写入），与 C 完全等价</text>`;

  return svgDoc(W, H, s);
}

/* -------------------------------------- 图 4：do-while 骨架与退出条件 */
function fig4() {
  const W = 640;
  const H = 470;
  let s = '';
  s += `<text x="320" y="34" font-family="${CJK}" font-size="18" font-weight="bold" fill="#24292f" text-anchor="middle">循环骨架：do-while 形态 + 退出条件三选一</text>`;

  // 骨架代码块
  const code = [
    '        mov r0, #0',
    'loop:',
    '        cmp r0, #5',
    '        bGE end      @ 退出条件',
    '        add r0, #1   @ 循环体',
    '        b loop       @ 回到入口',
    'end:',
  ];
  s += `<rect x="24" y="56" width="320" height="250" rx="10" fill="#1e1e1e"/>`;
  code.forEach((l, i) => {
    const y = 84 + i * 32;
    const c = l.includes('bGE') ? RED.text : l.includes('add') ? GREEN.text : l.includes('b loop') ? ORANGE.text : '#d4d4d4';
    s += `<text x="40" y="${y}" font-family="${MONO}" font-size="14" fill="${c}">${l}</text>`;
  });
  s += `<text x="184" y="324" font-family="${CJK}" font-size="12" fill="#9aa4b2" text-anchor="middle">先 add 再 cmp：本质是 do-while</text>`;

  // 右侧：退出条件三选一
  s += `<rect x="360" y="56" width="256" height="250" rx="10" fill="#ffffff" stroke="#d0d7de" stroke-width="1.5"/>`;
  s += `<text x="488" y="84" font-family="${CJK}" font-size="14" font-weight="bold" fill="#24292f" text-anchor="middle">退出条件怎么写</text>`;
  const opts = [
    { t: 'bGE end', d: 'r0 ≥ 5 退出（本例）', c: RED },
    { t: 'bNE end', d: '不相等就继续，相等退出', c: BLUE },
    { t: '（不写）', d: '死循环，靠别处 break', c: GRAY },
  ];
  opts.forEach((o, i) => {
    const y = 104 + i * 64;
    s += `<rect x="376" y="${y}" width="224" height="52" rx="6" fill="${o.c.bg}" stroke="${o.c.border}" stroke-width="1.5"/>`;
    s += `<text x="488" y="${y + 24}" font-family="${MONO}" font-size="15" font-weight="bold" fill="${o.c.text}" text-anchor="middle">${o.t}</text>`;
    s += `<text x="488" y="${y + 42}" font-family="${CJK}" font-size="12" fill="#57606a" text-anchor="middle">${o.d}</text>`;
  });

  s += `<rect x="16" y="322" width="608" height="44" rx="8" fill="#fff1e5"/>`;
  s += `<text x="320" y="344" font-family="${CJK}" font-size="13" fill="#bc4c00" text-anchor="middle">提示：循环体至少做 1 次（do-while）；要「可能 0 次」得把 cmp 挪到循环顶部前</text>`;
  s += `<text x="320" y="406" font-family="${CJK}" font-size="13" fill="#57606a" text-anchor="middle">下集预告：for 循环 = 初始化 + 条件 + 增量，是 while 的语法糖，骨架一模一样</text>`;

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
