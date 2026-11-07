"""生成子代理输入包。

book1: 每 6 个 Teaching Unit（=6 课对）一批 → b01..b12
book2/3: 每 6 课一批；教材文件按 _coverage.json 覆盖映射引用
用法: python -I make_packets.py book1|book2|book3
"""
import io
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, "src")
PACKETS = os.path.join(SRC, "packets")
FRAG = os.path.join(BASE, "frag")
BATCH = 6


def write_batch(book, name, keys, manifest_lines):
    sent = json.load(io.open(os.path.join(SRC, "sentences", f"{book}.json"), encoding="utf-8"))
    packet = {k: sent[k] for k in keys}
    os.makedirs(os.path.join(PACKETS, book), exist_ok=True)
    io.open(os.path.join(PACKETS, book, f"{name}.json"), "w", encoding="utf-8").write(
        json.dumps(packet, ensure_ascii=False, indent=1)
    )
    io.open(os.path.join(PACKETS, book, f"{name}.manifest.txt"), "w", encoding="utf-8").write(
        "\n".join(manifest_lines)
    )
    print(f"{book} {name}: {len(keys)} 课")


def batch_list(nums, size=BATCH):
    return [nums[i:i + size] for i in range(0, len(nums), size)]


def make_book1():
    sent = json.load(io.open(os.path.join(SRC, "sentences", "book1.json"), encoding="utf-8"))
    unit_of = {k: (int(k[:3]) + 1) // 2 for k in sent}
    units = sorted({u for u in unit_of.values() if u >= 4})
    for bi, batch in enumerate(batch_list(units), 1):
        name = f"b{bi:02d}"
        keys = [f"{2*u-1:03d}-{2*u:03d}" for u in batch]
        lines = [f"unit-{u:02d}.md -> {2*u-1:03d}-{2*u:03d}" for u in batch]
        write_batch("book1", name, keys, lines)


def make_book23(book, tbdir, max_lesson):
    cov_raw = json.load(io.open(os.path.join(SRC, tbdir, "_coverage.json"), encoding="utf-8"))
    # 归一化为句子包的键格式（两位数字）
    cov = {f"{int(k):02d}": v for k, v in cov_raw.items()}
    keys = sorted(cov)
    # 只处理还没有讲解的课（book1 已完成的模式）；book2/3 首次全做
    done = set()
    frag_file = os.path.join(BASE, f"{book}.json")
    if os.path.exists(frag_file):
        done = {str(k) for k in json.load(io.open(frag_file, encoding="utf-8")) if k != "_common"}
    todo = [k for k in keys if k not in done]
    for bi, batch in enumerate(batch_list(todo), 1):
        name = f"b{bi:02d}"
        files = sorted({cov[k] for k in batch})
        lines = [f"{f} (含第 {k} 课注释)" for f in files for k in [kk for kk, v in cov.items() if v == f and kk in batch]]
        write_batch(book, name, batch, lines)


if __name__ == "__main__":
    book = sys.argv[1]
    os.makedirs(FRAG, exist_ok=True)
    if book == "book1":
        make_book1()
    elif book == "book2":
        make_book23("book2", "tb2", 96)
    elif book == "book3":
        make_book23("book3", "tb3", 60)
