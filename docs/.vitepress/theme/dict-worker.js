/**
 * 词典：整库下载一次 -> IndexedDB 缓存 -> sql.js 内存查询
 *
 * 为什么不用 HTTP Range 按页懒取：GitHub Pages 的 CDN 会对一切响应做 gzip
 * （浏览器必然携带 Accept-Encoding），Range 字节区间落在压缩流上，SQLite 页
 * 偏移全部错位（实测 206 的 Content-Range 总长是压缩后大小）。因此整库下载：
 * 首次约 29MB（gzip 传输，浏览器自动解压），之后 IndexedDB 秒开、完全离线；
 * ETag 变化时自动重新下载。
 */
import initSqlJs from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
import { ref } from 'vue'

/** 首次加载进度：state = idle|checking|downloading|opening|ready|error */
export const dictLoad = ref({ state: 'idle' })

const DB_URL = import.meta.env.BASE_URL + 'dict/dict.sqlite'
const IDB_NAME = 'nce-dict'
const IDB_STORE = 'files'

let dbPromise = null

// ===== IndexedDB 极简封装 =====
function withStore(mode) {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(IDB_NAME, 1)
    open.onupgradeneeded = () => open.result.createObjectStore(IDB_STORE)
    open.onsuccess = () => {
      const db = open.result
      const tx = db.transaction(IDB_STORE, mode)
      resolve({ store: tx.objectStore(IDB_STORE), tx, db })
    }
    open.onerror = () => reject(open.error)
  })
}
function idbGet(key) {
  return withStore('readonly').then(
    ({ store }) =>
      new Promise((resolve, reject) => {
        const r = store.get(key)
        r.onsuccess = () => resolve(r.result || null)
        r.onerror = () => reject(r.error)
      })
  )
}
function idbPut(key, val) {
  return withStore('readwrite').then(
    ({ store, tx }) =>
      new Promise((resolve, reject) => {
        store.put(val, key)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
  )
}

// ===== 数据库获取 =====
/**
 * 条件 GET（If-None-Match）：一个请求同时完成更新检查与下载。
 * 返回 null = 服务器 304，本地缓存仍有效；否则 { bytes: Uint8Array, etag }。
 * 不用 HEAD 探测 —— Chromium 会把 HEAD 响应缓存为同 URL GET 的条目，
 * 导致随后的 GET 拿到没有 body 的假响应（实测 decodedBodySize: 0）。
 */
async function fetchDbBytes(knownEtag) {
  dictLoad.value = { state: 'downloading', received: 0 }
  const headers = knownEtag ? { 'If-None-Match': knownEtag } : undefined
  let resp
  try {
    resp = await fetch(DB_URL, { headers })
  } catch (e) {
    // 断网：有缓存就当仍有效（词典完全离线可用）
    if (knownEtag) throw Object.assign(new Error('network unavailable'), { cacheStillValid: true })
    throw e
  }
  if (resp.status === 304) return null
  if (!resp.ok) throw new Error(`dict.sqlite 下载失败: HTTP ${resp.status}`)
  const etag = resp.headers.get('etag') || 'unknown'
  const reader = resp.body.getReader()
  const chunks = []
  let received = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    received += value.length
    dictLoad.value = { state: 'downloading', received }
  }
  const bytes = new Uint8Array(received)
  let off = 0
  for (const c of chunks) {
    bytes.set(c, off)
    off += c.length
  }
  return { bytes, etag }
}

function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      dictLoad.value = { state: 'opening' }
      const SQL = await initSqlJs({ locateFile: () => wasmUrl })
      const cached = await idbGet('db').catch(() => null)
      let record = null
      if (cached && cached.bytes) {
        try {
          const fresh = await fetchDbBytes(cached.etag) // 304 => null，用本地缓存
          if (fresh) {
            record = fresh
            idbPut('db', record).catch(() => {})
          }
        } catch (e) {
          if (!e.cacheStillValid) console.error('[nce-dict] 更新检查失败，使用本地缓存', e)
        }
      }
      if (!record) {
        if (cached && cached.bytes) {
          record = cached // 断网等场景：直接用本地缓存
        } else {
          record = await fetchDbBytes(null)
          idbPut('db', record).catch(() => {})
        }
      }
      const db = new SQL.Database(record.bytes)
      dictLoad.value = { state: 'ready' }
      return db
    })()
    dbPromise.catch((e) => {
      console.error('[nce-dict] 数据库加载失败', e)
      dbPromise = null
      dictLoad.value = { state: 'error' }
    })
  }
  return dbPromise
}

// ===== 查询 =====
function q(db, sql, params) {
  const stmt = db.prepare(sql)
  try {
    stmt.bind(params)
    const rows = []
    while (stmt.step()) rows.push(stmt.getAsObject())
    return rows
  } finally {
    stmt.free()
  }
}

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
  let rows = q(db, `SELECT ${cols} FROM dict WHERE word = ?`, [key])
  if (!rows.length) {
    const lower = key.toLowerCase()
    if (lower !== key) rows = q(db, `SELECT ${cols} FROM dict WHERE word = ?`, [lower])
    if (!rows.length) {
      rows = q(
        db,
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
