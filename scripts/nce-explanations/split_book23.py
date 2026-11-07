"""把 book2/book3 的 OCR 全文按课锚点切分（容忍部分课头 OCR 损坏）。

策略：找到的 "## N" 课号锚点是单调的；每个锚点文件覆盖 [N, 下一锚点) 范围的课，
缺失课号的内容落在前一个文件里。产出：
- src/tbN/lesson-NN.md（跨度文件）
- src/tbN/_coverage.json { 覆盖课号: 文件名 }
运行: python -I split_book23.py [book2|book3|both]
"""
import io
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, "src")

BOUND_NUM = re.compile(r"^#{1,4}\s*(\d{1,3})\s*$")


def find_anchors(lines):
    bounds = []
    for i, ln in enumerate(lines):
        s = ln.strip()
        m = BOUND_NUM.match(s)
        if not m or len(s) > 6:
            continue
        nxt = next((lines[k].strip() for k in range(i + 1, min(i + 6, len(lines))) if lines[k].strip()), "")
        if nxt.startswith("## ") and not re.match(r"^##\s*\d+\s*$", nxt):
            bounds.append((i, int(m.group(1))))
    return bounds


def split_book(src_file, out_dir, max_lesson, label="", title_map=None):
    text = io.open(os.path.join(SRC, src_file), encoding="utf-8").read()
    lines = text.splitlines()
    if title_map is not None:
        # 全新全绎版式：课头为 "## Lesson"，下一非空行为 "## 标题"，用标题表对号
        norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
        bounds = []
        for i, ln in enumerate(lines):
            if re.match(r"^#{1,4}\s*Lesson\s*$", ln.strip()):
                nxt = next((lines[k].strip() for k in range(i + 1, min(i + 6, len(lines))) if lines[k].strip()), "")
                m = re.match(r"^#{1,4}\s*(.+)$", nxt)
                no = title_map.get(norm(m.group(1))) if m else None
                bounds.append((i, no))
        # 标题未命中的按相邻锚点顺序推断
        known = [no for _, no in bounds if no]
        for j, (i, no) in enumerate(bounds):
            if no is None:
                prev = max([b for _, b in bounds[:j] if b] + [0])
                nxt = min([b for _, b in bounds[j + 1:] if b] + [max_lesson + 1])
                no = prev + 1 if prev + 1 < nxt else prev
                bounds[j] = (i, no)
    else:
        bounds = [b for b in find_anchors(lines) if 1 <= b[1] <= max_lesson]
    # 单调过滤：只保留比上一个锚点大的
    mono = []
    for i, no in bounds:
        if no and (not mono or no > mono[-1][1]):
            mono.append((i, no))
    os.makedirs(out_dir, exist_ok=True)
    coverage = {}
    spans = []
    for j, (i, no) in enumerate(mono):
        end = mono[j + 1][0] if j + 1 < len(mono) else len(lines)
        spans.append((no, i, end))
    # 文件开头到第一个锚点 = 第 1 课（前有封面/前言时合并进去）
    if mono and mono[0][1] > 1:
        spans.insert(0, (1, 0, mono[0][0]))
    for k, (no, i, end) in enumerate(spans):
        nxt = spans[k + 1][0] if k + 1 < len(spans) else max_lesson + 1
        seg = "\n".join(lines[i:end]).strip()
        fn = f"lesson-{no:02d}.md"
        io.open(os.path.join(out_dir, fn), "w", encoding="utf-8").write(seg)
        for L in range(no, min(nxt, max_lesson + 1)):
            coverage[L] = fn
    missing = [L for L in range(1, max_lesson + 1) if L not in coverage]
    io.open(os.path.join(out_dir, "_coverage.json"), "w", encoding="utf-8").write(
        json.dumps({str(k): v for k, v in coverage.items()}, ensure_ascii=False, indent=1)
    )
    print(f"{label}: 锚点 {len(mono)} 个, 覆盖 {len(coverage)}/{max_lesson} 课, 未直接命中: {missing}")


def build_title_map(book, max_lesson):
    """从已生成页面提取 标题→课号 映射"""
    import glob
    m = {}
    pages = os.path.normpath(os.path.join(SRC, "..", "..", "docs", "nce", book))
    for fn in glob.glob(os.path.join(pages, "*.md")):
        first = io.open(fn, encoding="utf-8").readline().strip()
        mm = re.match(r"#\s*第\s*[\d-]+\s*课：(.+)$", first)
        if mm:
            no = int(os.path.basename(fn)[:2])
            m[re.sub(r"[^a-z0-9]", "", mm.group(1).lower())] = no
    return m


if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "both"
    if which in ("book2", "both"):
        split_book("book2-tquanjie.md", os.path.join(SRC, "tb2"), 96, "book2 教材全解")
    if which in ("book3", "both"):
        t1 = io.open(os.path.join(SRC, "book3-quanyi-part1.md"), encoding="utf-8").read()
        t2 = io.open(os.path.join(SRC, "book3-quanyi-part2.md"), encoding="utf-8").read()
        io.open(os.path.join(SRC, "book3-quanyi.md"), "w", encoding="utf-8").write(t1 + "\n\n" + t2)
        tm = build_title_map("3", 60)
        split_book("book3-quanyi.md", os.path.join(SRC, "tb3"), 60, "book3 全新全绎", title_map=tm)
