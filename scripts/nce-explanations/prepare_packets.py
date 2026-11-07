"""准备讲解生成的输入包：

1. 第一册教师用书 md（OCR 版）按 Teaching Unit 切分 → src/tb1/unit-NN.md（36 个单元，每单元 = 2 课）
2. 从已生成的课文页解析每课句子（en/zh）→ src/sentences/book{1,2,3}.json

运行: python -I prepare_packets.py
"""
import io
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, "src")
TB1 = os.path.join(
    SRC, "tb1-teacher.md"
)
NCE_DOCS = os.path.normpath(os.path.join(BASE, "..", "..", "docs", "nce"))

# ---------- 1. 教师用书按 Teaching Unit 切分 ----------
text = io.open(TB1, encoding="utf-8").read()
# 正文从目录之后开始（前面是封面/目录，TOC 里也会出现 Teaching Unit 字样）
body_start = text.find("General guidance")
if body_start < 0:
    body_start = 55000
matches = list(re.finditer(r"Teaching Unit (\d+)", text[body_start:]))
units = {}
for i, m in enumerate(matches):
    n = int(m.group(1))
    start = body_start + m.start()
    end = body_start + matches[i + 1].start() if i + 1 < len(matches) else len(text)
    # 同一单元标题可能因 OCR 分页重复出现，保留最长片段
    if n not in units or end - start > units[n][1] - units[n][0]:
        units[n] = (start, end)

os.makedirs(os.path.join(SRC, "tb1"), exist_ok=True)
for n, (s, e) in sorted(units.items()):
    seg = text[s:e].strip()
    io.open(os.path.join(SRC, "tb1", f"unit-{n:02d}.md"), "w", encoding="utf-8").write(seg)
print(f"教师用书切分: {len(units)} 个 Teaching Unit -> src/tb1/")

# ---------- 2. 句子清单 ----------
PAIR_RE = re.compile(r'<NcePair en="([^"]*)" zh="([^"]*)"(?: ex="[^"]*")? */>')
sent = {}
for book in ("1", "2", "3"):
    data = {}
    bdir = os.path.join(NCE_DOCS, book)
    for fn in sorted(os.listdir(bdir)):
        if not fn.endswith(".md"):
            continue
        key = fn[:-3].split("-", 1)[0] if book != "1" else fn[:-3][:7]
        if book == "1":
            m = re.match(r"^(\d{3}-\d{3})-", fn)
            key = m.group(1)
        pairs = PAIR_RE.findall(io.open(os.path.join(bdir, fn), encoding="utf-8").read())
        data[key] = [[en, zh] for en, zh in pairs]
    sent[book] = data
    out = os.path.join(SRC, "sentences")
    os.makedirs(out, exist_ok=True)
    io.open(os.path.join(out, f"book{book}.json"), "w", encoding="utf-8").write(
        json.dumps(data, ensure_ascii=False, indent=1)
    )
    total = sum(len(v) for v in data.values())
    print(f"book{book}: {len(data)} 课 / {total} 句 -> src/sentences/book{book}.json")
