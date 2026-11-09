# 用法: python -I scripts/build_dict.py <ecdict.csv> <输出.sqlite>
# 读取 ECDICT 全量 CSV -> 瘦身词典库（WITHOUT ROWID + 1024 页 + 词形还原表）-> VACUUM
# 本地开发: 先手动跑一次输出 docs/public/dict/dict.sqlite（该目录不入 git）
# CI: deploy.yml 会在 npm run build 前执行本脚本，产物随 dist 部署
import csv, sqlite3, sys, os

SRC, DST = sys.argv[1], sys.argv[2]
os.makedirs(os.path.dirname(DST) or '.', exist_ok=True)  # CI 里目标目录不存在（gitignored）
if os.path.exists(DST):
    os.remove(DST)

# ECDICT exchange 代码: p过去式 d过去分词 i现在分词 3三单 r比较级 t最高级 s复数
EXCHANGE_CODES = set('pdi3rts')

con = sqlite3.connect(DST)
con.execute("PRAGMA page_size = 1024")        # 页大小=HTTP Range 请求粒度
con.execute("PRAGMA journal_mode = OFF")      # 一次性构建，最后 VACUUM
con.execute("PRAGMA synchronous = OFF")
con.execute("""CREATE TABLE dict(
    word TEXT PRIMARY KEY, phonetic TEXT,
    translation TEXT, definition TEXT,
    tag TEXT, exchange TEXT) WITHOUT ROWID""")
con.execute("CREATE TABLE forms(form TEXT PRIMARY KEY, lemma TEXT) WITHOUT ROWID")

batch_d, batch_f, BATCH = [], [], 50000
n_words = n_forms = 0

def flush():
    global n_words, n_forms, batch_d, batch_f
    con.executemany("INSERT OR IGNORE INTO dict VALUES(?,?,?,?,?,?)", batch_d)
    con.executemany("INSERT OR IGNORE INTO forms VALUES(?,?)", batch_f)
    n_words += len(batch_d); n_forms += len(batch_f)
    batch_d, batch_f = [], []

with open(SRC, newline='', encoding='utf-8-sig') as f:
    for row in csv.DictReader(f):
        w = (row.get('word') or '').strip()
        if not w or len(w) > 40:
            continue
        ex = row.get('exchange') or ''
        batch_d.append((w, row.get('phonetic'), row.get('translation'),
                        row.get('definition'), row.get('tag'), ex))
        for part in ex.split('/'):
            if len(part) >= 3 and part[1] == ':' and part[0] in EXCHANGE_CODES:
                v = part[2:].strip()
                if v and v.lower() != w.lower():
                    batch_f.append((v, w))
        if len(batch_d) >= BATCH:
            flush()
flush()
con.commit()

print('VACUUM 中（重写为紧凑有序文件，需几十秒）...')
con.execute("VACUUM")
con.commit()

con.close()  # Windows 下未关闭会锁文件
size = os.path.getsize(DST)
print(f"词条: {n_words:,}  词形映射: {n_forms:,}")
print(f"文件: {DST}  {size/1e6:.1f} MB  页数: {size // 1024:,}  页大小: 1024B")
# 架构说明：站点侧不做 HTTP Range 懒取（GitHub Pages 对所有响应 gzip，
# Range 字节区间会落在压缩流上错位），而是前端整库下载一次存 IndexedDB。
