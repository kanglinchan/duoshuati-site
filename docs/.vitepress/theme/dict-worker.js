/**
 * 词典查询单例：SQLite + HTTP Range（sql.js-httpvfs）
 * 数据库文件 docs/public/dict/dict.sqlite 由 scripts/build_dict.py 生成（CI 构建步骤同款）
 * worker 首次点词才创建（懒加载 ~1.2MB wasm），SPA 内跨页面复用
 */
// sql.js-httpvfs 是 CJS 包：SSG 在 Node ESM 下执行，命名导入会报
// "Named export not found"，必须走默认导出解构
import sqlHttpvfs from 'sql.js-httpvfs'
import workerUrl from 'sql.js-httpvfs/dist/sqlite.worker.js?url'
import wasmUrl from 'sql.js-httpvfs/dist/sql-wasm.wasm?url'

const { createDbWorker } = sqlHttpvfs

let workerPromise = null

function getDb() {
  if (!workerPromise) {
    workerPromise = createDbWorker(
      [
        {
          from: 'inline',
          config: {
            serverMode: 'full',
            requestChunkSize: 1024, // 必须等于建库时 PRAGMA page_size
            url: import.meta.env.BASE_URL + 'dict/dict.sqlite'
          }
        }
      ],
      workerUrl,
      wasmUrl
    ).then((w) => w.db)
  }
  return workerPromise
}

// 注意：db.query 的绑定参数必须传数组，传字符串会静默返回空
const cache = new Map()

/**
 * 查词：原文精确 -> 小写 -> 词形还原（forms 表 JOIN）。
 * 返回 { word, phonetic, translation, definition } 或 null
 */
export async function lookupWord(raw) {
  const key = String(raw || '').trim()
  if (!key) return null
  if (cache.has(key)) return cache.get(key)
  const db = await getDb()
  const cols = 'word, phonetic, translation, definition'
  let rows = await db.query(`SELECT ${cols} FROM dict WHERE word = ?`, [key])
  if (!rows.length) {
    const lower = key.toLowerCase()
    if (lower !== key) rows = await db.query(`SELECT ${cols} FROM dict WHERE word = ?`, [lower])
    if (!rows.length) {
      rows = await db.query(
        `SELECT d.word AS word, d.phonetic AS phonetic, d.translation AS translation, d.definition AS definition
         FROM forms f JOIN dict d ON d.word = f.lemma WHERE f.form = ? LIMIT 1`,
        [lower]
      )
    }
  }
  const hit = rows[0] || null
  if (hit) {
    // ECDICT 换行是字面 "\n" 两字符，统一转成真换行
    hit.translation = String(hit.translation || '').replace(/\\n/g, '\n').trim()
    hit.definition = String(hit.definition || '').replace(/\\n/g, '\n').trim()
  }
  cache.set(key, hit)
  return hit
}

/** 释义第一行的短提示：去掉词性前缀，取第一个分句 */
export function shortGloss(translation) {
  if (!translation) return ''
  const firstLine = String(translation).split('\n')[0]
  const noPos = firstLine.replace(/^[a-z]+\.\s*/, '')
  const seg = noPos.split(/[,，;；]/)[0].trim()
  return seg.length > 12 ? seg.slice(0, 12) : seg
}
