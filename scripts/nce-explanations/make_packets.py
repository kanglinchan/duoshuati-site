"""生成子代理输入包：把句子清单按批切片，并生成批清单（指明每批要读的教材文本文件）。

book1: 每 6 个 Teaching Unit（=6 课对）一批 → b01..b06
用法: python -I make_packets.py book1
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


def make_book1(batch_size=6):
    sent = json.load(io.open(os.path.join(SRC, "sentences", "book1.json"), encoding="utf-8"))
    # key "007-008" -> unit 4；unit n 覆盖 lesson 2n-1/2n
    unit_of = {}
    for key in sent:
        first = int(key[:3])
        unit_of[key] = (first + 1) // 2
    units = sorted({u for u in unit_of.values() if u >= 4})  # 001-006 已完成
    batches = [units[i:i + batch_size] for i in range(0, len(units), batch_size)]
    manifest = []
    os.makedirs(os.path.join(PACKETS, "book1"), exist_ok=True)
    for bi, batch in enumerate(batches, 1):
        name = f"b{bi:02d}"
        keys = [f"{2*u-1:03d}-{2*u:03d}" for u in batch]
        packet = {k: sent[k] for k in keys}
        io.open(os.path.join(PACKETS, "book1", f"{name}.json"), "w", encoding="utf-8").write(
            json.dumps(packet, ensure_ascii=False, indent=1)
        )
        io.open(os.path.join(PACKETS, "book1", f"{name}.manifest.txt"), "w", encoding="utf-8").write(
            "\n".join(f"unit-{u:02d}.md -> {2*u-1:03d}-{2*u:03d}" for u in batch)
        )
        manifest.append(f"book1 {name}: units {batch[0]}-{batch[-1]} ({len(keys)} 课)")
    os.makedirs(os.path.join(FRAG, "book1"), exist_ok=True)
    return manifest


if __name__ == "__main__":
    book = sys.argv[1]
    os.makedirs(PACKETS, exist_ok=True)
    os.makedirs(FRAG, exist_ok=True)
    if book == "book1":
        for line in make_book1():
            print(line)
