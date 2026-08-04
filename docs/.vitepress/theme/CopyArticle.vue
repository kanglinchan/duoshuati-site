<template>
  <div class="copy-page" ref="root">
    <div class="split-btn">
      <button class="main" :disabled="state === 'loading'" @click="copyMarkdown">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        {{ mainLabel }}
      </button>
      <button class="chevron" :class="{ open: menuOpen }" @click="menuOpen = !menuOpen" aria-label="更多选项">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
    </div>
    <div v-if="menuOpen" class="menu">
      <button class="item" @click="act(copyMarkdown)">
        <span class="item-title">复制页面</span>
        <span class="item-desc">Markdown 格式，适合发给 AI</span>
      </button>
      <button class="item" @click="act(copyWechat)">
        <span class="item-title">复制文章</span>
        <span class="item-desc">内联排版，粘贴到公众号编辑器直接发布</span>
      </button>
      <button class="item" @click="act(openChatGPT)">
        <span class="item-title">在 ChatGPT 中打开</span>
        <span class="item-desc">携带本页链接向 ChatGPT 提问</span>
      </button>
    </div>
    <span v-if="state === 'error'" class="tip error">复制失败：{{ error }}</span>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'

const props = defineProps({
  html: { type: String, required: true },  // 公众号富文本片段
  md: { type: String, required: true }     // 页面 Markdown
})

const state = ref('idle')   // idle | loading | md-done | wx-done | error
const error = ref('')
const menuOpen = ref(false)
const root = ref(null)

const mainLabel = computed(() => ({
  loading: '复制中…',
  'md-done': '已复制 ✓',
  'wx-done': '已复制 ✓',
  error: '复制页面'
}[state.value] || '复制页面'))

async function fetchText(url) {
  const resp = await fetch(withBase(url))
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
  return resp.text()
}

/** 纯文本兜底复制：execCommand('copy') */
function copyTextFallback(text) {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.left = '-9999px'
  ta.style.top = '-9999px'
  document.body.appendChild(ta)
  ta.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(ta)
  if (!ok) throw new Error('execCommand 复制失败，请手动选中文字再 Ctrl+C')
}

/** 富文本兜底复制：借助 contenteditable */
function copyHtmlFallback(htmlText) {
  const div = document.createElement('div')
  div.contentEditable = 'true'
  div.style.position = 'fixed'
  div.style.left = '-9999px'
  div.style.top = '-9999px'
  div.innerHTML = htmlText
  document.body.appendChild(div)

  const sel = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(div)
  sel.removeAllRanges()
  sel.addRange(range)

  const ok = document.execCommand('copy')
  sel.removeAllRanges()
  document.body.removeChild(div)
  if (!ok) throw new Error('execCommand 复制失败，请手动选中文字再 Ctrl+C')
}

async function copyMarkdown() {
  state.value = 'loading'
  error.value = ''
  try {
    const text = await fetchText(props.md)
    try {
      await navigator.clipboard.writeText(text)
    } catch (_) {
      copyTextFallback(text)
    }
    state.value = 'md-done'
  } catch (e) { error.value = String(e); state.value = 'error' }
  resetLater()
}

async function copyWechat() {
  state.value = 'loading'
  error.value = ''
  try {
    const htmlText = await fetchText(props.html)
    // 先尝试 Clipboard API（支持 text/html）
    if (navigator.clipboard && window.ClipboardItem) {
      try {
        const plain = new DOMParser().parseFromString(htmlText, 'text/html').body.innerText
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([htmlText], { type: 'text/html' }),
            'text/plain': new Blob([plain], { type: 'text/plain' })
          })
        ])
        state.value = 'wx-done'
        resetLater()
        return
      } catch (_) { /* 降级到 execCommand */ }
    }
    // 兜底：execCommand 复制富文本
    copyHtmlFallback(htmlText)
    state.value = 'wx-done'
  } catch (e) { error.value = String(e); state.value = 'error' }
  resetLater()
}

function openChatGPT() {
  const q = encodeURIComponent(`请阅读这篇文章，之后我会向你提问：${location.href}`)
  window.open(`https://chatgpt.com/?q=${q}`, '_blank')
}

function act(fn) { menuOpen.value = false; fn() }

function resetLater() {
  setTimeout(() => { if (state.value !== 'error') state.value = 'idle' }, 2500)
}

function onClickOutside(e) {
  if (root.value && !root.value.contains(e.target)) menuOpen.value = false
}
onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.copy-page { position: relative; display: flex; justify-content: flex-end; margin: 4px 0 12px; }
.split-btn { display: inline-flex; align-items: stretch; border: 1px solid var(--vp-c-divider); border-radius: 6px; overflow: hidden; background: var(--vp-c-bg-soft); }
.split-btn .main {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; font-size: 12px; color: var(--vp-c-text-2);
  background: transparent; border: none; cursor: pointer;
}
.split-btn .main:hover { color: var(--vp-c-brand-1); }
.split-btn .chevron {
  padding: 4px 7px; font-size: 12px; color: var(--vp-c-text-2);
  background: transparent; border: none; border-left: 1px solid var(--vp-c-divider);
  cursor: pointer; transition: transform 0.15s;
}
.split-btn .chevron:hover { color: var(--vp-c-brand-1); }
.split-btn .chevron.open svg { transform: rotate(180deg); }
.menu {
  position: absolute; top: calc(100% + 4px); right: 0; z-index: 30;
  min-width: 240px; padding: 4px;
  background: var(--vp-c-bg); border: 1px solid var(--vp-c-divider);
  border-radius: 8px; box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
}
.item {
  display: flex; flex-direction: column; gap: 2px; width: 100%;
  padding: 8px 10px; text-align: left; background: transparent;
  border: none; border-radius: 6px; cursor: pointer;
}
.item:hover { background: var(--vp-c-bg-soft); }
.item-title { font-size: 13px; color: var(--vp-c-text-1); }
.item-desc { font-size: 12px; color: var(--vp-c-text-3); }
.tip.error { position: absolute; top: calc(100% + 4px); right: 0; font-size: 12px; color: #ef4444; }
</style>
