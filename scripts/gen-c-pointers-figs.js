/**
 * 生成《征服 C 指针》课程配图
 * 输出 SVG → 用 sharp 转 PNG，落到 docs/public/assets/images/c-pointers/
 * 风格与 gen-arm-lesson*-figs.js 保持一致（浅底 + 深字 + 蓝/橙/绿/红强调）
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT_DIR = path.join(__dirname, '..', 'docs', 'public', 'assets', 'images', 'c-pointers');
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
// 箭头：从 (x1,y1) 到 (x2,y2)，箭头头部画在终点
function arrow(x1, y1, x2, y2, color = INK, width = 2, dash = '') {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hl = 11, hw = 5.5;
  const bx = x2 - hl * Math.cos(ang), by = y2 - hl * Math.sin(ang);
  const p1 = `${bx + hw * Math.sin(ang)},${by - hw * Math.cos(ang)}`;
  const p2 = `${bx - hw * Math.sin(ang)},${by + hw * Math.cos(ang)}`;
  return line(x1, y1, bx, by, color, width, dash) +
    `<polygon points="${x2},${y2} ${p1} ${p2}" fill="${color}"/>`;
}
// 内存格子：值在上，可选变量名（上）与地址（下）
function cell(x, y, w, h, val, o = {}) {
  const { name, addr, fill = '#FFFFFF', stroke = GREY, valFill = INK, mono = true, size = 13 } = o;
  let s = box(x, y, w, h, fill, stroke, 2);
  if (val !== null && val !== undefined && val !== '') s += text(x + w / 2, y + h / 2 + size * 0.36, val, { size, anchor: 'middle', mono, fill: valFill });
  if (name) s += text(x + w / 2, y - 7, name, { size: 12.5, anchor: 'middle', weight: 'bold', fill: SUB });
  if (addr) s += text(x + w / 2, y + h + 15, addr, { size: 11.5, anchor: 'middle', mono, fill: SUB });
  return s;
}
function title(w, s, sub = '') {
  let t = text(w / 2, 34, s, { size: 19, weight: 'bold', anchor: 'middle' });
  if (sub) t += text(w / 2, 58, sub, { size: 13, anchor: 'middle', fill: SUB });
  return t;
}
function band(x, y, w, h, fill, stroke, msg, o = {}) {
  let s = box(x, y, w, h, fill, stroke, 6);
  if (msg) s += text(x + w / 2, y + (o.ty || h / 2 + 5), msg, { size: o.size || 13.5, weight: o.weight || 'bold', anchor: 'middle', fill: o.msgFill || INK });
  return s;
}

/* ============ 01 指针是什么 ============ */
function fig01Pointer() {
  const w = 920, h = 470;
  let b = title(w, '指针变量保存的是地址：hoge_p 指向 hoge', '*hoge_p 完全等同于 hoge —— 既能读也能写');
  const cy = 300, ch = 56, cw = 150;
  b += cell(150, cy, cw, ch, '5', { name: 'int hoge', addr: '0x7ffe…e80', fill: BLUE_SOFT, stroke: BLUE });
  b += cell(360, cy, cw, ch, '10', { name: 'int piyo', addr: '0x7ffe…e84' });
  b += cell(620, cy, cw, ch, '0x7ffe…e80', { name: 'int *hoge_p', addr: '0x7ffe…e88', fill: ORANGE_SOFT, stroke: ORANGE, size: 12 });
  b += arrow(695, cy - 34, 240, cy - 34, ORANGE, 2.4);
  b += text(467, cy - 46, 'hoge_p 保存的值 = hoge 的地址', { size: 13, anchor: 'middle', fill: ORANGE, weight: 'bold' });
  b += text(695, cy + ch + 40, 'hoge_p 是一个普通变量，', { size: 13, anchor: 'middle', fill: SUB });
  b += text(695, cy + ch + 60, '它自己也住在内存里', { size: 13, anchor: 'middle', fill: SUB });
  // 底部注解
  b += band(110, 386, 700, 52, GREY_SOFT, GREY_LINE, '&hoge 取地址  →  hoge_p 存下它  →  *hoge_p 沿箭头取值（左值，可赋值）', { size: 14 });
  return svg(b, w, h);
}

function fig01CallByValue() {
  const w = 960, h = 560;
  let b = title(w, '值传递 vs 传指针：函数怎么改到调用方的变量', 'C 只有值传递 —— 传的永远是副本；想改外面的变量，只能把地址传进去');
  const P = [
    { x: 60, head: '传值（失败示范）', color: RED, ok: false },
    { x: 520, head: '传指针（正确做法）', color: GREEN, ok: true },
  ];
  for (const p of P) {
    b += text(p.x + 190, 96, p.head, { size: 16, weight: 'bold', anchor: 'middle', fill: p.color });
    // main 框
    b += box(p.x, 116, 380, 120, '#FFFFFF', GREY_LINE, 6);
    b += text(p.x + 14, 140, 'main() 的变量', { size: 12.5, weight: 'bold', fill: SUB });
    b += cell(p.x + 40, 168, 130, 44, '10.0', { name: 'double x', addr: '0x…f20', fill: BLUE_SOFT, stroke: BLUE });
    b += cell(p.x + 220, 168, 130, 44, '20.0', { name: 'double y', addr: '0x…f28' });
    // 副本框
    b += box(p.x, 330, 380, 150, '#FFFFFF', GREY_LINE, 6);
    b += text(p.x + 14, 354, 'get_xy() 的形参（函数返回后即销毁）', { size: 12.5, weight: 'bold', fill: SUB });
    if (p.ok) {
      b += cell(p.x + 40, 382, 130, 44, '0x…f20', { name: 'double *x_p', fill: ORANGE_SOFT, stroke: ORANGE, size: 12 });
      b += cell(p.x + 220, 382, 130, 44, '0x…f28', { name: 'double *y_p', size: 12 });
      b += arrow(p.x + 50, 378, p.x + 50, 222, GREEN, 2.2);
      b += text(p.x + 118, 300, '副本指向同一个格子', { size: 12, fill: GREEN, weight: 'bold' });
      b += text(p.x + 190, 452, '*x_p = 1.0  写的就是 main 的 x', { size: 12.5, anchor: 'middle', fill: GREEN, weight: 'bold', mono: true });
    } else {
      b += cell(p.x + 40, 382, 130, 44, '10.0', { name: 'double x（副本）' });
      b += cell(p.x + 220, 382, 130, 44, '20.0', { name: 'double y（副本）' });
      b += text(p.x + 190, 452, 'x = 1.0  改的只是副本', { size: 12.5, anchor: 'middle', fill: RED, weight: 'bold', mono: true });
    }
    b += arrow(p.x + 190, 242, p.x + 190, 324, GREY, 1.8, '6 4');
    b += text(p.x + 202, 290, '复制', { size: 12, fill: SUB });
    b += text(p.x + 190, 512, p.ok ? '✓ 调用方拿到 1.0 / 2.0' : '✗ 调用方仍是 10.0 / 20.0', { size: 14, anchor: 'middle', weight: 'bold', fill: p.ok ? GREEN : RED });
  }
  return svg(b, w, h);
}

/* ============ 02 指针运算与数组 ============ */
function fig02ArrayMemory() {
  const w = 900, h = 330;
  let b = title(w, '数组在内存中连续排列', '相邻元素地址差 sizeof(int) = 4 字节');
  const cw = 120, ch = 52, y = 160;
  const addrs = ['0x…160', '0x…164', '0x…168', '0x…16c', '0x…170'];
  for (let i = 0; i < 5; i++) {
    const x = 120 + i * (cw + 16);
    b += cell(x, y, cw, ch, String(i), { name: `array[${i}]`, addr: addrs[i], fill: BLUE_SOFT, stroke: BLUE });
  }
  b += text(680 + 40, y + ch / 2 + 5, '值', { size: 12, fill: SUB, anchor: 'middle' });
  const bx = 120, bw = 5 * (cw + 16) - 16;
  b += text(bx + bw / 2, y + ch + 52, '↑ 相邻地址恒差 4 字节 —— 连续分布是数组一切特性的基础', { size: 13.5, anchor: 'middle', fill: INK, weight: 'bold' });
  return svg(b, w, h);
}

function fig02PointerArith() {
  const w = 940, h = 540;
  let b = title(w, '指针 + 1 前进「所指类型的长度」，不是 1 字节', 'p + n 前进 sizeof(*p) × n 字节');
  const cw = 92, ch = 46;
  // 上：int*
  b += text(70, 118, 'int *p', { size: 15, weight: 'bold', mono: true, fill: BLUE });
  for (let i = 0; i < 6; i++) b += cell(230 + i * (cw + 10), 100, cw, ch, '', { name: `a[${i}]`, fill: BLUE_SOFT, stroke: BLUE });
  b += arrow(135, 123, 224, 123, BLUE, 2.2);
  b += arrow(230 + 1.5 * (cw + 10), 170, 230 + 1.5 * (cw + 10), 152, ORANGE, 2);
  b += text(230 + 1.5 * (cw + 10) + 12, 170, 'p + 1：前进 4 字节（sizeof(int)）', { size: 13, fill: ORANGE, weight: 'bold' });
  // 下：char*
  b += text(70, 318, 'char *q', { size: 15, weight: 'bold', mono: true, fill: GREEN });
  for (let i = 0; i < 6; i++) b += cell(230 + i * (cw + 10), 300, 46, ch, '', { name: i === 0 ? 'c[0]' : `c[${i}]`, fill: GREEN_SOFT, stroke: GREEN });
  b += arrow(140, 323, 224, 323, GREEN, 2.2);
  b += arrow(230 + 69, 370, 230 + 69, 352, ORANGE, 2);
  b += text(230 + 81, 370, 'q + 1：前进 1 字节（sizeof(char)）', { size: 13, fill: ORANGE, weight: 'bold' });
  b += band(140, 440, 660, 52, GREY_SOFT, GREY_LINE, '同样 +1，走多远取决于「指向的类型」—— 这就是指针不能当整数用的原因', { size: 14 });
  return svg(b, w, h);
}

/* ============ 03 内存布局 ============ */
function fig03MemoryLayout() {
  const w = 940, h = 620;
  let b = title(w, 'C 进程的虚拟地址空间布局', '一次实验把所有地址打出来，各归其位');
  const x = 260, bw = 420;
  // 地址标尺
  b += text(190, 116, '低地址 0x0', { size: 12.5, mono: true, anchor: 'end', fill: SUB });
  b += text(190, 566, '高地址 0xffff…', { size: 12.5, mono: true, anchor: 'end', fill: SUB });
  b += line(200, 110, 200, 572, GREY_LINE, 1.5);
  const rows = [
    { y: 110, hh: 74, fill: GREY_SOFT, stroke: GREY, label: '只读区：函数机器码 · 字符串字面量', sub: '0x400…，写它 = 未定义行为' },
    { y: 192, hh: 74, fill: BLUE_SOFT, stroke: BLUE, label: '静态区：全局变量 · static 变量', sub: '0x601…，地址全程固定' },
    { y: 274, hh: 74, fill: ORANGE_SOFT, stroke: ORANGE, label: '堆（heap）：malloc 分配的内存', sub: '0x1d1…，malloc → free 由你管理' },
    { y: 356, hh: 62, fill: '#FFFFFF', stroke: GREY_LINE, label: '空闲区域', sub: '虚拟内存的大片空隙', dim: true },
    { y: 426, hh: 138, fill: GREEN_SOFT, stroke: GREEN, label: '栈（stack）：自动变量 · 参数 · 返回地址', sub: '0x7fff…，函数调用压入 / 返回弹出，地址复用' },
  ];
  for (const r of rows) {
    b += box(x, r.y, bw, r.hh, r.fill, r.stroke, 6);
    b += text(x + bw / 2, r.y + r.hh / 2 - 6, r.label, { size: 14.5, weight: 'bold', anchor: 'middle' });
    b += text(x + bw / 2, r.y + r.hh / 2 + 16, r.sub, { size: 12, anchor: 'middle', fill: SUB });
  }
  // 生长方向：堆向高地址（图上向下），栈向低地址（图上向上）
  b += arrow(756, 320, 756, 416, ORANGE, 2.2);
  b += text(772, 372, '堆向高地址生长', { size: 12, fill: ORANGE, weight: 'bold' });
  b += arrow(756, 552, 756, 456, GREEN, 2.2);
  b += text(772, 508, '栈向低地址生长', { size: 12, fill: GREEN, weight: 'bold' });
  b += text(470, 592, '栈上的数组越界写入 → 冲垮返回地址 → 缓冲区溢出漏洞（第 3 课第 8 节）', { size: 13, anchor: 'middle', fill: RED, weight: 'bold' });
  return svg(b, w, h);
}

function fig03StackFrame() {
  const w = 940, h = 624;
  let b = title(w, '函数调用与栈帧：自动变量的生与死', '进入函数压入一帧，返回整帧回收 —— 内存被下一次调用复用');
  const x = 170, cw = 300;
  // main 帧
  b += box(x, 430, cw, 104, BLUE_SOFT, BLUE, 6);
  b += text(x + 16, 458, 'main() 的栈帧', { size: 13.5, weight: 'bold', fill: BLUE });
  b += text(x + 16, 486, '局部变量 a、b、buf[256]…', { size: 12.5, fill: INK });
  b += text(x + 16, 510, '地址较高（0x7fff…e78）', { size: 11.5, fill: SUB });
  // func 帧
  b += box(x, 200, cw, 216, GREEN_SOFT, GREEN, 6);
  b += text(x + 16, 228, 'func() 的栈帧（新压入）', { size: 13.5, weight: 'bold', fill: GREEN });
  const rows = [['实参副本  b=2, a=1（从后往前压栈）', 252], ['返回地址（回到 main 的下一句）', 292], ['局部变量 c、d（基指针 ± 偏移访问）', 332]];
  for (const [s, y] of rows) {
    b += box(x + 16, y - 20, cw - 32, 34, '#FFFFFF', GREEN, 4);
    b += text(x + 32, y + 2, s, { size: 12.5 });
  }
  b += text(x + 16, 392, '地址更低（0x7fff…e4c）', { size: 11.5, fill: SUB });
  // 压入 / 弹出 箭头
  b += arrow(530, 430, 530, 306, GREEN, 2.4);
  b += text(542, 362, '压入', { size: 12.5, weight: 'bold', fill: GREEN });
  b += arrow(604, 306, 604, 430, RED, 2.2, '7 5');
  b += text(616, 362, '弹出', { size: 12.5, weight: 'bold', fill: RED });
  // 右侧警示框
  b += box(640, 200, 240, 216, RED_SOFT, RED, 6);
  b += text(760, 232, '两个经典后果', { size: 14, weight: 'bold', anchor: 'middle', fill: RED });
  b += text(656, 264, '① 返回局部变量地址 = 交出', { size: 12 });
  b += text(656, 284, '    一张已作废的支票', { size: 12 });
  b += text(656, 316, '② 递归能成立：每层调用', { size: 12 });
  b += text(656, 336, '    的 i 都在各自的帧里', { size: 12 });
  b += text(656, 368, '实验：func1 与 func2 的', { size: 12, fill: SUB });
  b += text(656, 388, '自动变量地址完全相同', { size: 12, fill: SUB });
  b += band(120, 556, 700, 52, GREY_SOFT, GREY_LINE, '调用 = 压入一整帧；返回 = 整帧弹出、内存复用 —— 遗留值就是野指针的来源', { size: 14 });
  return svg(b, w, h);
}

/* ============ 04 对齐 ============ */
function fig04StructPadding() {
  const w = 960, h = 430;
  let b = title(w, '结构体对齐与填充：sizeof(Hoge) 为什么是 32', 'CPU 要求特定类型放在特定倍数的地址上，编译器自动插入 padding');
  const segs = [
    { t: 'char1', w: 1, c: BLUE_SOFT, s: BLUE },
    { t: 'pad', w: 3, c: GREY_SOFT, s: GREY },
    { t: 'int1', w: 4, c: ORANGE_SOFT, s: ORANGE },
    { t: 'char2', w: 1, c: BLUE_SOFT, s: BLUE },
    { t: 'pad', w: 7, c: GREY_SOFT, s: GREY },
    { t: 'double1', w: 8, c: GREEN_SOFT, s: GREEN },
    { t: 'char3', w: 1, c: BLUE_SOFT, s: BLUE },
    { t: 'pad', w: 7, c: GREY_SOFT, s: GREY },
  ];
  const unit = 26, x0 = 60, y = 196, hh = 64;
  let x = x0, off = 0;
  const bounds = [];
  for (const s of segs) {
    const sw = s.w * unit;
    b += box(x, y, sw, hh, s.c, s.s, 2);
    if (s.t.startsWith('pad')) {
      b += text(x + sw / 2, y + hh / 2 + 5, 'pad', { size: 11, anchor: 'middle', fill: GREY });
    } else if (s.w >= 4) {
      b += text(x + sw / 2, y + hh / 2 + 5, s.t, { size: 14, anchor: 'middle', weight: 'bold' });
    } else {
      b += text(x + sw / 2, y - 10, s.t, { size: 11, anchor: 'middle', weight: 'bold', fill: BLUE });
    }
    bounds.push([x, off]);
    x += sw; off += s.w;
  }
  bounds.push([x, off]);
  for (const [bx, offv] of bounds) {
    b += line(bx, y + hh, bx, y + hh + 8, GREY, 1);
    b += text(bx, y + hh + 24, `${offv}`, { size: 11, mono: true, anchor: 'middle', fill: SUB });
  }
  b += text(x0, y + hh + 46, '成员偏移量（字节）', { size: 11.5, fill: SUB });
  b += text(920, y + hh + 46, '共 32 字节', { size: 12, weight: 'bold', anchor: 'end', fill: INK });
  b += band(100, 330, 760, 56, GREY_SOFT, GREY_LINE, '末尾也填充（保证数组中每个元素的成员都对齐）· 不要手工加 pad —— 换平台就错', { size: 13.5 });
  return svg(b, w, h);
}

/* ============ 05 声明 ============ */
function fig05TypeChain() {
  const w = 960, h = 320;
  let b = title(w, '类型派生链：一切类型都是「基本类型 + 三种派生」', '链条最后一环决定类型归根结底是什么');
  const nodes = [
    { x: 60, t: 'int', sub: '基本类型', c: BLUE_SOFT, s: BLUE },
    { x: 280, t: '函数', sub: '参数 int', c: ORANGE_SOFT, s: ORANGE },
    { x: 480, t: '指针', sub: '', c: GREEN_SOFT, s: GREEN },
    { x: 680, t: '数组', sub: '元素 10 个', c: GREY_SOFT, s: GREY },
  ];
  for (const n of nodes) {
    b += box(n.x, 150, 140, 64, n.c, n.s, 8);
    b += text(n.x + 70, 178, n.t, { size: 16, weight: 'bold', anchor: 'middle' });
    if (n.sub) b += text(n.x + 70, 200, n.sub, { size: 11.5, anchor: 'middle', fill: SUB });
  }
  const links = [[200, 280, 'returning（返回）'], [420, 480, 'to（指向）'], [620, 680, 'of（的）']];
  for (const [x1, x2, lab] of links) {
    b += arrow(x1, 182, x2, 182, INK, 2.2);
    b += text((x1 + x2) / 2, 132, lab, { size: 11.5, anchor: 'middle', fill: SUB });
  }
  b += text(480, 262, 'int (*func_table[10])(int a)', { size: 14, anchor: 'middle', mono: true });
  b += text(480, 288, '＝「指向「返回 int、参数 int 的函数」的指针」的数组(10)', { size: 13, anchor: 'middle', weight: 'bold', fill: BLUE });
  return svg(b, w, h);
}

function fig05ArrayPointerStep() {
  const w = 940, h = 560;
  let b = title(w, '同一个地址，两种指针：步长不同', '&array 是指向数组的指针；array 是指向首元素的指针');
  const cw = 76, ch = 44;
  // 上：int*
  b += text(80, 138, 'int *p', { size: 14, weight: 'bold', mono: true, fill: BLUE });
  for (let i = 0; i < 6; i++) b += cell(230 + i * (cw + 8), 108, cw, ch, `a[${i}]`, { fill: BLUE_SOFT, stroke: BLUE });
  b += arrow(148, 130, 226, 130, BLUE, 2.2);
  b += arrow(230 + cw + 8 + cw / 2, 168, 230 + cw + 8 + cw / 2, 156, ORANGE, 2);
  b += text(560, 186, 'p + 1 → 前进 4 字节（一个元素）', { size: 13.5, fill: ORANGE, weight: 'bold' });
  // 下：int(*)[3]
  b += text(80, 330, 'int (*q)[3]', { size: 14, weight: 'bold', mono: true, fill: GREEN });
  const rows = [['a[0]', 'a[1]', 'a[2]'], ['a[3]', 'a[4]', 'a[5]']];
  for (let r = 0; r < 2; r++) for (let i = 0; i < 3; i++)
    b += cell(230 + i * (cw + 8), 296 + r * (ch + 10), cw, ch, rows[r][i], { fill: GREEN_SOFT, stroke: GREEN });
  b += arrow(188, 324, 226, 324, GREEN, 2.2);
  b += arrow(206, 318, 206, 374, ORANGE, 2);
  b += text(560, 408, 'q + 1 → 前进 12 字节（一整行 int[3]）', { size: 13.5, fill: ORANGE, weight: 'bold' });
  b += band(120, 466, 700, 52, GREY_SOFT, GREY_LINE, '地址值相同，类型不同，+1 的步长就不同 —— 二维数组传参用的正是 q 这种指针', { size: 13.5 });
  return svg(b, w, h);
}

function fig05ConstBoundary() {
  const w = 960, h = 540;
  let b = title(w, 'const 保护到哪一层？', 'read-only 修饰它紧跟其后的词 —— 指针本身，或指针指向的内容');
  // 面板1
  b += text(160, 106, 'const char *p', { size: 14, weight: 'bold', mono: true, anchor: 'middle', fill: INK });
  b += text(160, 128, '内容只读，指针可换', { size: 12, anchor: 'middle', fill: SUB });
  b += cell(90, 170, 140, 48, 'p', { fill: GREEN_SOFT, stroke: GREEN, mono: false, size: 14 });
  b += text(160, 240, '✓ p = 其它地址', { size: 12, anchor: 'middle', fill: GREEN, weight: 'bold' });
  b += box(300, 170, 190, 48, RED_SOFT, RED, 4);
  b += text(395, 199, '"hello" 🔒 内容只读', { size: 12.5, anchor: 'middle', fill: RED });
  b += arrow(232, 194, 296, 194, INK, 2);
  // 面板2
  b += text(700, 106, 'char *const p', { size: 14, weight: 'bold', mono: true, anchor: 'middle', fill: INK });
  b += text(700, 128, '指针只读，内容可改', { size: 12, anchor: 'middle', fill: SUB });
  b += cell(560, 170, 140, 48, 'p 🔒', { fill: RED_SOFT, stroke: RED, mono: false, size: 14 });
  b += text(630, 240, '✗ p = 其它地址', { size: 12, anchor: 'middle', fill: RED, weight: 'bold' });
  b += box(800, 170, 130, 48, GREEN_SOFT, GREEN, 4);
  b += text(865, 199, '"hello" 可写', { size: 12.5, anchor: 'middle', fill: GREEN });
  b += arrow(702, 194, 796, 194, INK, 2);
  // 面板3：BookData const *
  b += text(480, 306, 'BookData const *book —— const 只保护一层', { size: 14.5, weight: 'bold', anchor: 'middle', fill: INK });
  b += box(180, 336, 300, 130, BLUE_SOFT, BLUE, 6);
  b += text(330, 362, 'BookData（整体只读）', { size: 13, weight: 'bold', anchor: 'middle', fill: BLUE });
  b += text(210, 396, 'price  🔒 不可写', { size: 12.5 });
  b += text(210, 424, 'title  🔒 成员本身不可写', { size: 12.5 });
  b += box(620, 390, 220, 50, ORANGE_SOFT, ORANGE, 4);
  b += text(730, 420, 'title 指向的字符串', { size: 12.5, anchor: 'middle' });
  b += text(730, 462, '⚠ 不受保护，可写！', { size: 12.5, anchor: 'middle', fill: ORANGE, weight: 'bold' });
  b += arrow(482, 415, 616, 415, ORANGE, 2.2, '7 5');
  b += text(548, 400, '指针照常可达', { size: 11.5, anchor: 'middle', fill: ORANGE });
  return svg(b, w, h);
}

/* ============ 06 数组 vs 指针 ============ */
function fig06Decay() {
  const w = 960, h = 460;
  let b = title(w, '核心规则：表达式中数组 → 指向首元素的指针', '类型链末端「数组(N)」被替换成「指针」，元素个数属性被丢弃');
  b += box(80, 116, 340, 64, BLUE_SOFT, BLUE, 8);
  b += text(250, 142, 'int 的数组(5)的数组(3)', { size: 15, weight: 'bold', anchor: 'middle' });
  b += text(250, 164, '声明时的真身：一块 60 字节内存', { size: 11.5, anchor: 'middle', fill: SUB });
  b += arrow(436, 148, 520, 148, ORANGE, 2.4);
  b += text(478, 130, '出现在表达式中', { size: 11.5, anchor: 'middle', fill: ORANGE });
  b += box(536, 116, 344, 64, GREEN_SOFT, GREEN, 8);
  b += text(708, 142, '指向 int 的数组(5) 的指针', { size: 15, weight: 'bold', anchor: 'middle' });
  b += text(708, 164, '即 int(*)[5] —— 不是 int** ！', { size: 11.5, anchor: 'middle', fill: SUB });
  b += text(480, 214, '转换是编译期的「视角切换」，不产生机器码；转出的指针是右值（所以 a = p 非法）', { size: 12.5, anchor: 'middle', fill: SUB });
  b += text(480, 262, '三个例外：这些场合不转换', { size: 14.5, weight: 'bold', anchor: 'middle', fill: RED });
  const ex = [
    ['sizeof(a)', '整个数组的长度 60'],
    ['&a', 'int(*)[5] 指向数组的指针'],
    ['char s[] = "abc"', '初始化列表，与指针无关'],
  ];
  for (let i = 0; i < 3; i++) {
    const x = 80 + i * 276;
    b += box(x, 286, 250, 84, '#FFFFFF', GREY_LINE, 8);
    b += text(x + 125, 318, ex[i][0], { size: 13.5, weight: 'bold', anchor: 'middle', mono: true, fill: BLUE });
    b += text(x + 125, 348, ex[i][1], { size: 12, anchor: 'middle', fill: SUB });
  }
  b += band(120, 396, 720, 40, GREY_SOFT, GREY_LINE, 'a[i] ≡ *(a + i)：a 先转成指针，加 i 个元素，再解引用 —— [] 与数组无关', { size: 13.5 });
  return svg(b, w, h);
}

function fig06TwoDDeref() {
  const w = 960, h = 490;
  let b = title(w, 'hoge[i][j] ≡ *( *(hoge + i) + j )：两级寻址', '行步长 sizeof(int[5]) = 20 字节；元素步长 sizeof(int) = 4 字节');
  const cw = 74, ch = 44, x0 = 250, y0 = 130;
  for (let r = 0; r < 3; r++) {
    b += text(x0 - 16, y0 + r * (ch + 12) + ch / 2 + 5, `行${r}`, { size: 12, anchor: 'end', fill: SUB });
    for (let i = 0; i < 5; i++)
      b += cell(x0 + i * (cw + 8), y0 + r * (ch + 12), cw, ch, '', { fill: r === 0 ? BLUE_SOFT : '#FFFFFF', stroke: BLUE });
  }
  b += text(x0 + 2.5 * (cw + 8), y0 + 3 * (ch + 12) + 24, 'int hoge[3][5]：数组的数组，一整块连续内存', { size: 12.5, anchor: 'middle', fill: SUB });
  // hoge 指针
  b += cell(90, y0 - 8, 110, 44, 'hoge', { fill: GREEN_SOFT, stroke: GREEN, mono: false });
  b += text(145, 96, 'int(*)[5]', { size: 11.5, anchor: 'middle', mono: true, fill: GREEN });
  b += arrow(200, y0 + 14, 246, y0 + 14, GREEN, 2.2);
  // 行跳转
  b += arrow(x0 + 2.5 * (cw + 8), y0 + ch + 6, x0 + 2.5 * (cw + 8), y0 + 2 * (ch + 12) - 6, ORANGE, 2.2);
  b += text(668, y0 + 1.5 * (ch + 12) + 4, 'hoge + 1：跳 20 字节（一整行）', { size: 13, fill: ORANGE, weight: 'bold' });
  // 行内跳转
  b += arrow(x0 + cw + 4, y0 - 10, x0 + cw + 34, y0 - 10, INK, 2);
  b += text(x0 + cw + 40, y0 - 6, '*(hoge+i) 转成 int* 后：+ j 跳 4 字节', { size: 12.5, fill: INK });
  b += band(140, 400, 680, 56, GREY_SOFT, GREY_LINE, 'hoge[i][j] = 基址 + i×20 + j×4 —— 两个下标各触发一次「数组→指针」转换', { size: 13.5 });
  return svg(b, w, h);
}

function fig06StringVsArray() {
  const w = 940, h = 420;
  let b = title(w, 'char str[] = "abc" 与 char *p = "abc"', '一个在栈上开了可写拷贝，一个把指针指向只读区原件');
  // 左
  b += text(210, 116, 'char str[] = "abc";', { size: 14.5, weight: 'bold', anchor: 'middle', mono: true, fill: BLUE });
  const cw = 74, ch = 52;
  const cs = ['a', 'b', 'c', '\\0'];
  for (let i = 0; i < 4; i++)
    b += cell(60 + i * (cw + 8), 150, cw, ch, cs[i], { fill: GREEN_SOFT, stroke: GREEN });
  b += text(210, 240, '栈上一份 4 字节拷贝 ✓ str[0] = \'d\' 可以', { size: 12.5, anchor: 'middle', fill: GREEN, weight: 'bold' });
  // 右
  b += text(700, 116, 'char *p = "abc";', { size: 14.5, weight: 'bold', anchor: 'middle', mono: true, fill: INK });
  b += cell(580, 150, 80, ch, 'p', { fill: '#FFFFFF', stroke: GREY, mono: false, size: 14 });
  b += arrow(664, 176, 694, 176, ORANGE, 2.2);
  for (let i = 0; i < 4; i++)
    b += cell(700 + i * (52 + 6), 150, 52, ch, cs[i], { fill: RED_SOFT, stroke: RED });
  b += text(806, 128, '只读区（原字面量）', { size: 12, anchor: 'middle', fill: RED, weight: 'bold' });
  b += text(740, 240, 'p[0] = \'d\' → 运行时崩溃 ✗', { size: 12.5, anchor: 'middle', fill: RED, weight: 'bold' });
  b += band(140, 300, 660, 56, GREY_SOFT, GREY_LINE, 'sizeof("abc…") = 字符数 + 1 —— 它本来就是 char 的数组，表达式里才转成指针', { size: 13.5 });
  return svg(b, w, h);
}

/* ============ 07 实战 ============ */
function fig07StringArray() {
  const w = 960, h = 540;
  let b = title(w, 'char *slogan[7]：按需分配的字符串数组', '每条标语各自 malloc 合适的长度，而不是人人 16 字节的二维数组');
  const lens = [13, 16, 10, 22, 13, 16, 10];
  const words = ['日行一善', '要关心父母', '早睡早起', '千里之行始于足下', '温故知新', '三人行必有我师', '知行合一'];
  for (let i = 0; i < 7; i++) {
    const y = 110 + i * 54;
    b += cell(80, y, 90, 40, `slogan[${i}]`, { fill: BLUE_SOFT, stroke: BLUE, size: 11 });
    const bw = 40 + lens[i] * 9;
    b += box(280, y, bw, 40, i % 2 ? GREEN_SOFT : '#FFFFFF', GREEN, 4);
    b += text(292, y + 26, `"${words[i]}"`, { size: 12.5, mono: true });
    b += text(290 + bw, y + 26, `${lens[i]} 字节`, { size: 11, fill: SUB });
    b += arrow(172, y + 20, 276, y + 20, GREY, 1.6);
  }
  b += text(700, 130, '如果用二维数组：', { size: 13.5, weight: 'bold' });
  b += text(700, 154, 'char slogan[7][16]', { size: 13, mono: true });
  b += box(620, 172, 260, 200, '#FFFFFF', GREY_LINE, 6);
  for (let r = 0; r < 4; r++) {
    const used = [13, 16, 10, 22][r];
    for (let c = 0; c < 26; c++) {
      const unit = 8;
      const fill = c < used ? BLUE_SOFT : RED_SOFT;
      b += `<rect x="${640 + c * unit}" y="${188 + r * 34}" width="${unit - 1.5}" height="26" fill="${fill}" stroke="none" rx="1"/>`;
    }
  }
  b += text(750, 396, '蓝色 = 实际使用，红色 = 浪费', { size: 12, anchor: 'middle', fill: SUB });
  b += band(560, 430, 330, 60, GREY_SOFT, GREY_LINE, '短标语也要占满一行 → 内存浪费固定且巨大', { size: 12.5 });
  return svg(b, w, h);
}

function fig07Argv() {
  const w = 940, h = 380;
  let b = title(w, '命令行参数：argv 是 char **', 'argv[0] 是程序名；argv[argc] 保证是 NULL（哨兵）');
  const vals = ['&"cat"', '&"hoge.txt"', '&"piyo.txt"', 'NULL'];
  const strs = ['cat', 'hoge.txt', 'piyo.txt', ''];
  for (let i = 0; i < 4; i++) {
    const x = 90 + i * 210;
    b += cell(x, 140, 150, 48, vals[i], { name: `argv[${i}]`, fill: i === 3 ? RED_SOFT : BLUE_SOFT, stroke: i === 3 ? RED : BLUE, size: 12.5 });
    if (i < 3) {
      b += box(x + 10, 260, 190, 46, '#FFFFFF', GREY, 4);
      b += text(x + 105, 289, `"${strs[i]}"`, { size: 13, anchor: 'middle', mono: true });
      b += arrow(x + 75, 190, x + 100, 256, GREY, 1.8);
    }
  }
  b += text(470, 336, 'argc = 3（含 argv[0]）·  参数个数与每段长度都未知 → 只能「指针的数组」+ 计数器', { size: 13, anchor: 'middle', fill: SUB });
  b += band(170, 0, 0, 0, '', '', '');
  return svg(b, w, h);
}

function fig07TwoDDynamic() {
  const w = 960, h = 560;
  let b = title(w, '动态二维数组的两种布局', '一块连续内存 vs 指针的数组 —— 语法都写 board[i][j]，内存完全不同');
  // 左：连续
  b += text(230, 110, '方案①：一块连续内存（C99）', { size: 14, weight: 'bold', anchor: 'middle', fill: BLUE });
  b += text(230, 132, 'int (*board)[size] = malloc(…)', { size: 12, anchor: 'middle', mono: true, fill: SUB });
  const cw = 62, ch = 44;
  for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++)
    b += cell(90 + i * (cw + 8), 160 + r * (ch + 10), cw, ch, '', { fill: BLUE_SOFT, stroke: BLUE });
  b += text(230, 328, 'malloc × 1 · free × 1 · 缓存友好', { size: 12.5, anchor: 'middle', fill: BLUE, weight: 'bold' });
  // 右：指针数组
  b += text(720, 110, '方案②：指针的数组（ANSI C）', { size: 14, weight: 'bold', anchor: 'middle', fill: ORANGE });
  b += text(720, 132, 'int **board，每行单独 malloc', { size: 12, anchor: 'middle', mono: true, fill: SUB });
  for (let r = 0; r < 3; r++) {
    const y = 160 + r * 62;
    b += cell(560, y, 70, 40, `ptr[${r}]`, { fill: '#FFFFFF', stroke: ORANGE, size: 11 });
    b += box(680 + r * 46, y, 160, 40, ORANGE_SOFT, ORANGE, 4);
    b += arrow(632, y + 20, 676 + r * 46, y + 20, GREY, 1.6);
    b += text(760 + r * 46, y + 26, `第 ${r} 行（独立一块）`, { size: 11.5, anchor: 'middle' });
  }
  b += text(720, 368, 'malloc ×(N+1) · free 要循环 · 行内存不连续', { size: 12.5, anchor: 'middle', fill: ORANGE, weight: 'bold' });
  b += band(120, 420, 720, 52, GREY_SOFT, GREY_LINE, '方案④：int *board + board[i*width+j] —— 1 次 malloc、最朴素、缓存友好，只是没有 [i][j] 语法', { size: 13 });
  b += text(480, 510, '两种方案都能写 board[i][j] —— 语法撞车，内存布局截然不同', { size: 13.5, anchor: 'middle', weight: 'bold', fill: INK });
  return svg(b, w, h);
}

/* ============ 08 数据结构 ============ */
function fig08LinkedList() {
  const w = 960, h = 560;
  let b = title(w, '链表：节点 + 箭头，顺序完全靠指针维系', '插入 = 两行指针换接，一个已有节点都不用搬');
  const nw = 190, nh = 62;
  // 主链
  b += cell(60, 120, 110, 44, 'header', { fill: BLUE_SOFT, stroke: BLUE, mono: false, size: 13 });
  const nodeX = [240, 480, 720];
  const names = ['"cat"', '"dog"', '"elk"'];
  for (let i = 0; i < 3; i++) {
    const x = nodeX[i], y = 112;
    b += box(x, y, nw, nh, '#FFFFFF', GREY, 4);
    b += line(x + 66, y, x + 66, y + nh, GREY_LINE, 1.5); b += line(x + 120, y, x + 120, y + nh, GREY_LINE, 1.5);
    b += text(x + 33, y + 36, names[i], { size: 11.5, anchor: 'middle', mono: true });
    b += text(x + 93, y + 36, 'cnt', { size: 11.5, anchor: 'middle', fill: SUB });
    b += text(x + 155, y + 36, 'next', { size: 11.5, anchor: 'middle', fill: SUB, italic: true });
    b += text(x + nw / 2, y - 8, `节点${i + 1}`, { size: 11, anchor: 'middle', fill: SUB });
  }
  b += arrow(172, 142, 236, 142, BLUE, 2.2);
  b += arrow(432, 142, 476, 142, INK, 2.2);
  b += arrow(672, 142, 716, 142, INK, 2.2);
  b += arrow(850, 192, 902, 192, RED, 1.8);
  b += text(912, 197, 'NULL', { size: 12.5, mono: true, fill: RED, anchor: 'start' });
  // 插入演示
  b += text(480, 240, '在节点 1 和节点 2 之间插入 new_item：', { size: 13.5, weight: 'bold', anchor: 'middle' });
  const iy = 300;
  b += box(140, iy, 180, nh, '#FFFFFF', GREY, 4);
  b += text(230, iy + 36, 'pos', { size: 13, anchor: 'middle', weight: 'bold' });
  b += box(420, iy, 200, nh, GREEN_SOFT, GREEN, 4);
  b += text(520, iy + 36, 'new_item', { size: 13, anchor: 'middle', weight: 'bold', fill: GREEN });
  b += box(760, iy, 180, nh, '#FFFFFF', GREY, 4);
  b += text(850, iy + 36, 'X（原 next）', { size: 12.5, anchor: 'middle' });
  b += arrow(322, iy + 31, 416, iy + 31, INK, 2.2);
  b += arrow(622, iy + 31, 756, iy + 31, INK, 2.2);
  b += text(370, iy + 20, '② pos→next = new', { size: 11.5, anchor: 'middle', fill: BLUE });
  b += text(690, iy + 20, '① new→next = X', { size: 11.5, anchor: 'middle', fill: BLUE });
  b += band(140, 430, 680, 56, GREY_SOFT, GREY_LINE, '删除同理：pos→next 越过 X 直接指向 X 的下一个，再 free(X) —— O(1) 完成', { size: 13.5 });
  b += text(480, 526, '注意：free(pos) 之后还读 pos→next = use-after-free（先摘再 free）', { size: 12.5, anchor: 'middle', fill: RED });
  return svg(b, w, h);
}

function fig08FuncTable() {
  const w = 940, h = 440;
  let b = title(w, '函数指针数组：switch-case 塌缩成一次寻址', 'draw_shape_func_table[(int)shape->type](shape)');
  // Shape 对象
  b += box(70, 150, 220, 130, BLUE_SOFT, BLUE, 6);
  b += text(180, 180, 'Shape 对象', { size: 13.5, weight: 'bold', anchor: 'middle', fill: BLUE });
  b += text(90, 214, 'type = RECTANGLE (1)', { size: 12.5, mono: true });
  b += text(90, 242, '…其它数据成员…', { size: 12, fill: SUB });
  // 函数指针表
  const rows = ['[0] draw_polyline', '[1] draw_rectangle', '[2] draw_ellipse'];
  for (let i = 0; i < 3; i++) {
    const y = 150 + i * 56;
    b += box(420, y, 230, 44, i === 1 ? GREEN_SOFT : '#FFFFFF', i === 1 ? GREEN : GREY, 4);
    b += text(440, y + 28, rows[i], { size: 13, mono: true });
  }
  b += text(535, 130, '函数指针数组', { size: 13, weight: 'bold', anchor: 'middle', fill: SUB });
  b += arrow(292, 210, 416, 210 + 56, ORANGE, 2.4);
  b += text(352, 230, 'type=1 → 下标 1', { size: 12, fill: ORANGE, weight: 'bold', anchor: 'middle' });
  // 函数
  b += box(740, 256, 170, 56, GREEN_SOFT, GREEN, 4);
  b += text(825, 290, 'draw_rectangle()', { size: 12.5, anchor: 'middle', mono: true });
  b += arrow(652, 240, 736, 276, GREEN, 2.2);
  b += text(700, 240, '调用', { size: 12, anchor: 'middle', fill: GREEN });
  b += band(120, 360, 700, 52, GREY_SOFT, GREY_LINE, '枚举当下标 → 取出函数指针 → 直接调用：新增图形种类无须修改分发代码', { size: 13.5 });
  return svg(b, w, h);
}

function fig08ShallowCopy() {
  const w = 940, h = 480;
  let b = title(w, '结构体整体赋值 = 浅拷贝：指针成员只复制地址', '*new_shape = *shape 之后，两个对象共享同一份坐标群');
  // 两个 shape
  b += box(90, 120, 250, 120, BLUE_SOFT, BLUE, 6);
  b += text(215, 150, 'shape', { size: 13.5, weight: 'bold', anchor: 'middle', fill: BLUE });
  b += text(110, 184, 'type = POLYLINE', { size: 12, mono: true });
  b += text(110, 212, 'point ──────► 0x…a10', { size: 12, mono: true });
  b += box(90, 300, 250, 120, GREEN_SOFT, GREEN, 6);
  b += text(215, 330, 'new_shape', { size: 13.5, weight: 'bold', anchor: 'middle', fill: GREEN });
  b += text(110, 364, 'type = POLYLINE（复制的）', { size: 12, mono: true });
  b += text(110, 392, 'point ──────► 0x…a10', { size: 12, mono: true });
  b += text(215, 286, '↑ *new_shape = *shape（逐字节复制）', { size: 12, anchor: 'middle', fill: SUB });
  // 共享的坐标群
  b += box(560, 220, 290, 110, ORANGE_SOFT, ORANGE, 6);
  b += text(705, 252, 'Point 数组（同一块内存！）', { size: 13.5, weight: 'bold', anchor: 'middle', fill: ORANGE });
  b += text(705, 284, '(1.0,2.0) (3.0,4.0) (5.0,6.0) …', { size: 12, mono: true, anchor: 'middle' });
  b += text(705, 308, '只此一份，两个 Shape 都指向它', { size: 11.5, anchor: 'middle', fill: SUB });
  b += arrow(342, 208, 556, 258, ORANGE, 2.2);
  b += arrow(342, 388, 556, 292, ORANGE, 2.2);
  b += text(480, 456, '改一处，两处都变；free(shape) → new_shape 的坐标悬空 —— C 不会替你深拷贝，也没有 GC 兜底', { size: 13, anchor: 'middle', weight: 'bold', fill: RED });
  return svg(b, w, h);
}

/* ============ 生成 ============ */
const figs = {
  'cptr-01-pointer': fig01Pointer(),
  'cptr-01-call-by-value': fig01CallByValue(),
  'cptr-02-array-memory': fig02ArrayMemory(),
  'cptr-02-pointer-arith': fig02PointerArith(),
  'cptr-03-memory-layout': fig03MemoryLayout(),
  'cptr-03-stack-frame': fig03StackFrame(),
  'cptr-04-struct-padding': fig04StructPadding(),
  'cptr-05-type-chain': fig05TypeChain(),
  'cptr-05-array-pointer-step': fig05ArrayPointerStep(),
  'cptr-05-const-boundary': fig05ConstBoundary(),
  'cptr-06-decay': fig06Decay(),
  'cptr-06-2d-deref': fig06TwoDDeref(),
  'cptr-06-string-vs-array': fig06StringVsArray(),
  'cptr-07-string-array': fig07StringArray(),
  'cptr-07-argv': fig07Argv(),
  'cptr-07-2d-dynamic': fig07TwoDDynamic(),
  'cptr-08-linked-list': fig08LinkedList(),
  'cptr-08-func-table': fig08FuncTable(),
  'cptr-08-shallow-copy': fig08ShallowCopy(),
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
