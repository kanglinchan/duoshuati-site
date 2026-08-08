/**
 * 生成「图解 ARM 汇编」第 7 课（CMP 比较指令）所需的技术示意图 PNG。
 *
 * 输出目录：docs/public/assets/images/2026-08-arm-assembly/
 *
 * 图清单（全部宽度 640，竖向布局，适配手机阅读）：
 *   1. fig-cmp-essence.png —— CMP 的本质：只算不收，结果丢弃，标志留下（兼作封面）
 *   2. fig-cpsr-nzcv.png   —— CPSR 高 4 位 NZCV：各自何时置 1
 *   3. fig-cmp-cases.png   —— 三组实验对照：4<5、5>4、5=5 各点亮哪个标志
 *   4. fig-cmp-vs-sub.png  —— CMP 与 SUB 的分工对照
 *
 * 运行：node scripts/gen-arm-lesson7-figs.js
 * 依赖：sharp（npm install sharp --save-dev）
 *
 * 注意：改图后必须重新运行 generate-wechat-html.js，否则公众号 HTML 内嵌的 base64 仍是旧图。
 * 布局自检：容器顶部 y 必须 ≥ 上方元素底部 + 8px；逐对数值核对，不只靠肉眼。
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

/** 单个标志位格子（大） */
function flagCell(label, x, y, w, c) {
  return `<rect x="${x}" y="${y}" width="${w}" height="44" rx="8" fill="${c.bg}" stroke="${c.border}" stroke-width="2"/>
  <text x="${x + w / 2}" y="${y + 30}" font-family="${MONO}" font-size="22" font-weight="bold" fill="${c.text}" text-anchor="middle">${label}</text>`;
}

/* ------------------------------------------------ 图 1：CMP 的本质（封面） */
function fig1() {
  const W = 640;
  const H = 470;
  let s = '';
  s += `<text x="320" y="34" font-family="${CJK}" font-size="19" font-weight="bold" fill="#24292f" text-anchor="middle">CMP 的本质：只留痕迹、不留结果的减法</text>`;

  // 指令 chip
  s += `<rect x="220" y="58" width="200" height="44" rx="8" fill="#0969da"/>`;
  s += `<text x="320" y="87" font-family="${MONO}" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">cmp r0, r1</text>`;

  // 向下箭头
  s += `<text x="320" y="134" font-family="${MONO}" font-size="22" fill="#57606a" text-anchor="middle">↓</text>`;

  // 暗中计算
  s += `<rect x="120" y="148" width="400" height="48" rx="8" fill="#ffffff" stroke="#9aa4b2" stroke-width="1.5"/>`;
  s += `<text x="320" y="178" font-family="${MONO}" font-size="17" fill="#24292f" text-anchor="middle">暗中计算 R0 - R1</text>`;

  // 分成两路
  s += `<text x="170" y="232" font-family="${MONO}" font-size="20" fill="#57606a" text-anchor="middle">↙</text>`;
  s += `<text x="470" y="232" font-family="${MONO}" font-size="20" fill="#57606a" text-anchor="middle">↘</text>`;

  // 左：结果丢弃
  s += `<rect x="40" y="246" width="256" height="120" rx="10" fill="#ffffff" stroke="#e5484d" stroke-width="1.5"/>`;
  s += `<text x="168" y="276" font-family="${CJK}" font-size="15" font-weight="bold" fill="#e5484d" text-anchor="middle">差值：直接丢弃</text>`;
  s += `<text x="168" y="304" font-family="${CJK}" font-size="13" fill="#57606a" text-anchor="middle">不写回任何寄存器</text>`;
  s += `<text x="168" y="330" font-family="${CJK}" font-size="13" fill="#57606a" text-anchor="middle">R0、R1 都原封不动</text>`;
  s += `<text x="168" y="356" font-family="${MONO}" font-size="13" fill="#e5484d" text-anchor="middle">（CMP 没有目标寄存器）</text>`;

  // 右：标志更新
  s += `<rect x="344" y="246" width="256" height="120" rx="10" fill="#ffffff" stroke="#2da44e" stroke-width="1.5"/>`;
  s += `<text x="472" y="276" font-family="${CJK}" font-size="15" font-weight="bold" fill="#2da44e" text-anchor="middle">标志：必然更新</text>`;
  s += `<text x="472" y="304" font-family="${CJK}" font-size="13" fill="#57606a" text-anchor="middle">按差值的正负零</text>`;
  s += `<text x="472" y="330" font-family="${CJK}" font-size="13" fill="#57606a" text-anchor="middle">刷新 CPSR 高 4 位</text>`;
  // NZCV 小格
  const fw = 44;
  const fx0 = 472 - (4 * fw + 3 * 8) / 2;
  ['N', 'Z', 'C', 'V'].forEach((f, i) => {
    s += `<rect x="${fx0 + i * (fw + 8)}" y="342" width="${fw}" height="18" rx="4" fill="${GREEN.bg}" stroke="${GREEN.border}" stroke-width="1"/>`;
    s += `<text x="${fx0 + i * (fw + 8) + fw / 2}" y="355" font-family="${MONO}" font-size="12" font-weight="bold" fill="${GREEN.text}" text-anchor="middle">${f}</text>`;
  });

  // 底部口诀
  s += `<rect x="16" y="398" width="608" height="52" rx="8" fill="#ddf4ff"/>`;
  s += `<text x="320" y="420" font-family="${CJK}" font-size="14" fill="#0969da" text-anchor="middle">一句话：CMP 就是「不存结果的 SUBS」</text>`;
  s += `<text x="320" y="440" font-family="${CJK}" font-size="14" fill="#0969da" text-anchor="middle">减法照算、标志照设，但谁也不惊动</text>`;

  return svgDoc(W, H, s);
}

/* --------------------------------------------------- 图 2：CPSR 高 4 位 */
function fig2() {
  const W = 640;
  const rows = [
    { f: 'N', bit: 'bit 31', name: 'Negative 负', when: '差值为负（R0 &lt; R1）时置 1', c: RED },
    { f: 'Z', bit: 'bit 30', name: 'Zero 零', when: '差值为零（R0 = R1）时置 1', c: BLUE },
    { f: 'C', bit: 'bit 29', name: 'Carry 进位', when: '减法无需借位（R0 ≥ R1）时置 1', c: ORANGE },
    { f: 'V', bit: 'bit 28', name: 'Overflow 溢出', when: '有符号运算溢出时置 1', c: GRAY },
  ];

  const rowH = 82;
  const topY = 64;
  const noteY = topY + rows.length * rowH + 4;
  const H = noteY + 56;

  let s = '';
  s += `<text x="320" y="34" font-family="${CJK}" font-size="19" font-weight="bold" fill="#24292f" text-anchor="middle">CPSR 高 4 位：CMP 的「记分牌」</text>`;

  rows.forEach((r, i) => {
    const y = topY + i * rowH;
    s += `<rect x="16" y="${y}" width="608" height="70" rx="10" fill="#ffffff" stroke="${r.c.border}" stroke-width="1.5"/>`;
    s += flagCell(r.f, 36, y + 13, 56, r.c);
    s += `<text x="112" y="${y + 30}" font-family="${MONO}" font-size="14" fill="#57606a">${r.bit}</text>`;
    s += `<text x="112" y="${y + 56}" font-family="${CJK}" font-size="15" font-weight="bold" fill="#24292f">${r.name}</text>`;
    s += `<text x="330" y="${y + 44}" font-family="${CJK}" font-size="13" fill="${r.c.text}">${r.when}</text>`;
  });

  s += `<rect x="16" y="${noteY}" width="608" height="44" rx="8" fill="#fff1e5"/>`;
  s += `<text x="320" y="${noteY + 19}" font-family="${CJK}" font-size="13" fill="#bc4c00" text-anchor="middle">注意 C 的反直觉规则：减法里 C=1 表示「没借位」，C=0 才是「借了位」</text>`;
  s += `<text x="320" y="${noteY + 37}" font-family="${CJK}" font-size="13" fill="#bc4c00" text-anchor="middle">所以无符号比较时，C=1 恰好说明 R0 ≥ R1</text>`;

  return svgDoc(W, H, s);
}

/* --------------------------------------------------- 图 3：三组实验对照 */
function fig3() {
  const W = 640;
  const cases = [
    { cmp: 'cmp 4, 5', expr: '4 - 5 = -1', verdict: '负数', flags: { N: 1, Z: 0, C: 0, V: 0 }, c: RED, note: 'R0 &lt; R1 → N 亮；有借位 → C 灭' },
    { cmp: 'cmp 5, 4', expr: '5 - 4 = 1', verdict: '正数', flags: { N: 0, Z: 0, C: 1, V: 0 }, c: ORANGE, note: 'R0 > R1 → 全灭，但无借位 → C 亮' },
    { cmp: 'cmp 5, 5', expr: '5 - 5 = 0', verdict: '零', flags: { N: 0, Z: 1, C: 1, V: 0 }, c: BLUE, note: 'R0 = R1 → Z 亮；无借位 → C 也亮' },
  ];

  const bandH = 108;
  const bandGap = 12;
  const topY = 58;
  const H = topY + cases.length * (bandH + bandGap) + 10;

  let s = '';
  s += `<text x="320" y="34" font-family="${CJK}" font-size="19" font-weight="bold" fill="#24292f" text-anchor="middle">三次单步实验：谁大谁小，标志位全写着</text>`;

  cases.forEach((k, i) => {
    const y = topY + i * (bandH + bandGap);
    s += `<rect x="16" y="${y}" width="608" height="${bandH}" rx="10" fill="#ffffff" stroke="#d0d7de" stroke-width="1.5"/>`;
    // 指令 + 算式
    s += `<rect x="32" y="${y + 16}" width="130" height="36" rx="6" fill="#0969da"/>`;
    s += `<text x="97" y="${y + 40}" font-family="${MONO}" font-size="15" font-weight="bold" fill="#ffffff" text-anchor="middle">${k.cmp}</text>`;
    s += `<text x="97" y="${y + 76}" font-family="${MONO}" font-size="14" fill="#24292f" text-anchor="middle">${k.expr}</text>`;
    s += `<text x="97" y="${y + 96}" font-family="${CJK}" font-size="12" fill="#57606a" text-anchor="middle">差值：${k.verdict}</text>`;
    // NZCV 四格（x=190 起，每格 54 宽 + 8 距）
    const fw = 54;
    const fx0 = 196;
    ['N', 'Z', 'C', 'V'].forEach((f, j) => {
      const on = k.flags[f] === 1;
      const c = on ? k.c : GRAY;
      const cx = fx0 + j * (fw + 8);
      s += `<rect x="${cx}" y="${y + 14}" width="${fw}" height="44" rx="6" fill="${c.bg}" stroke="${c.border}" stroke-width="${on ? 2 : 1}"/>`;
      s += `<text x="${cx + fw / 2}" y="${y + 34}" font-family="${MONO}" font-size="16" font-weight="bold" fill="${c.text}" text-anchor="middle">${f}</text>`;
      s += `<text x="${cx + fw / 2}" y="${y + 52}" font-family="${MONO}" font-size="13" fill="${c.text}" text-anchor="middle">${on ? 1 : 0}</text>`;
    });
    // 结论
    s += `<text x="196" y="${y + 84}" font-family="${CJK}" font-size="13" fill="${k.c.text}">${k.note}</text>`;
  });

  return svgDoc(W, H, s);
}

/* --------------------------------------------------- 图 4：CMP vs SUB */
function fig4() {
  const W = 640;
  const H = 430;
  let s = '';
  s += `<text x="320" y="34" font-family="${CJK}" font-size="19" font-weight="bold" fill="#24292f" text-anchor="middle">CMP 与 SUB：同一条减法，两种分工</text>`;

  const rows = [
    {
      ins: 'sub r2, r0, r1', color: BLUE,
      pts: ['差值写回目标寄存器 R2', '默认不动任何标志位', '想设标志要加 S 后缀：subs'],
    },
    {
      ins: 'cmp r0, r1', color: GREEN,
      pts: ['差值直接丢弃，没有目标寄存器', '必然刷新 CPSR 的 N/Z/C/V', '专为「只比较、不计算」而生'],
    },
  ];

  rows.forEach((r, i) => {
    const y = 58 + i * 158;
    s += `<rect x="16" y="${y}" width="608" height="142" rx="10" fill="#ffffff" stroke="${r.color.border}" stroke-width="1.5"/>`;
    s += `<rect x="36" y="${y + 16}" width="220" height="38" rx="6" fill="${r.color.border}"/>`;
    s += `<text x="146" y="${y + 41}" font-family="${MONO}" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">${r.ins}</text>`;
    r.pts.forEach((p, j) => {
      s += `<text x="52" y="${y + 82 + j * 24}" font-family="${CJK}" font-size="14" fill="#24292f">· ${p}</text>`;
    });
  });

  s += `<rect x="16" y="382" width="608" height="36" rx="8" fill="#dcf5e3"/>`;
  s += `<text x="320" y="405" font-family="${CJK}" font-size="13" fill="#2da44e" text-anchor="middle">记住这个等价关系：cmp r0, r1 ≡ subs（结果丢弃版），专为分支铺路</text>`;

  return svgDoc(W, H, s);
}

/* ------------------------------------------------------------------ 主函数 */
async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const figs = [
    ['fig-cmp-essence.png', fig1],
    ['fig-cpsr-nzcv.png', fig2],
    ['fig-cmp-cases.png', fig3],
    ['fig-cmp-vs-sub.png', fig4],
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
