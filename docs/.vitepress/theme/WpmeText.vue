<template>
  <p class="wpme-text"
    ><template v-if="dictOn"><template
        v-for="(seg, i) in segments"
        :key="i"
      ><span
          v-if="seg.word"
          class="wpme-w"
          @click="onWordClick(seg.text)"
          @pointerdown="startLongPress(seg.text, $event)"
          @pointermove="cancelLongPress"
          @pointerup="cancelLongPress"
          @pointercancel="cancelLongPress"
          @contextmenu.prevent="openCard(seg.text)"
        >{{ seg.text }}<span
            v-if="glossOf(seg.text)"
            class="wpme-w-gloss"
          >{{ glossOf(seg.text) }}</span></span><template v-else>{{ seg.text }}</template></template></template><template v-else>{{ text }}</template></p>
</template>

<script setup>
// Word Power Made Easy 正文段落：查词开关打开时逐词可点，
// 行为与 NcePair 一致（首次点击出短释义，再点/长按/右键出完整卡片）。
import { computed, onUnmounted, ref } from 'vue'
import { nceDictOn, openDictCard } from './nce-store'
import { lookupWord, shortGloss } from './dict-worker'

const props = defineProps({
  text: { type: String, required: true }
})

const dictOn = nceDictOn

const WORD_RE = /[A-Za-z][A-Za-z'’-]*/g
const segments = computed(() => {
  const out = []
  let last = 0
  for (const m of props.text.matchAll(WORD_RE)) {
    if (m.index > last) out.push({ word: false, text: props.text.slice(last, m.index) })
    out.push({ word: true, text: m[0] })
    last = m.index + m[0].length
  }
  if (last < props.text.length) out.push({ word: false, text: props.text.slice(last) })
  return out
})

// 已查词的短释义：lower -> gloss（'' 表示词典未命中）
const lookups = ref(new Map())
const pending = ref(new Set())
const dictVersion = ref(0)

function glossOf(text) {
  void dictVersion.value
  const v = lookups.value.get(text.toLowerCase())
  return v || ''
}

async function ensureLookup(text) {
  const lower = text.toLowerCase()
  if (lookups.value.has(lower) || pending.value.has(lower)) return
  pending.value = new Set(pending.value).add(lower)
  try {
    const hit = await lookupWord(text)
    lookups.value = new Map(lookups.value).set(lower, hit ? shortGloss(hit.translation) : '')
  } catch (e) {
    console.error('[wpme-dict] 查询失败', e)
  } finally {
    const rest = new Set(pending.value)
    rest.delete(lower)
    pending.value = rest
    dictVersion.value++
  }
}

function openCard(text) {
  openDictCard({ word: text, en: props.text, zh: '' })
}

// 长按触发后抑制紧随而来的 click
let lpTimer = null
let lpFired = false

function onWordClick(text) {
  if (lpFired) {
    lpFired = false
    return
  }
  if (!nceDictOn.value) return
  const lower = text.toLowerCase()
  if (pending.value.has(lower)) return
  if (lookups.value.get(lower)) {
    openCard(text) // 已查过：再次点击看完整释义
    return
  }
  // 词典首次开库（拉 wasm 约 1-2 秒）期间先开卡，给"正在打开"反馈
  ensureLookup(text).then(() => {
    if (!lookups.value.get(lower)) openCard(text) // 词典未命中：直接给卡片兜底
  })
}

function startLongPress(text, e) {
  if (e.pointerType === 'mouse' && e.button !== 0) return
  cancelLongPress()
  lpTimer = setTimeout(() => {
    lpTimer = null
    lpFired = true
    openCard(text)
  }, 450)
}
function cancelLongPress() {
  if (lpTimer) {
    clearTimeout(lpTimer)
    lpTimer = null
  }
}
onUnmounted(cancelLongPress)
</script>

<style scoped>
.wpme-text {
  color: var(--vp-c-text-1);
  line-height: 1.85;
}
.wpme-w {
  position: relative;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  transition: border-color 0.15s, background-color 0.15s;
}
.wpme-w:hover {
  background: var(--vp-c-brand-soft, rgba(0, 0, 0, 0.05));
}
.wpme-w:has(.wpme-w-gloss) {
  border-bottom-color: var(--vp-c-brand-1);
}
.wpme-w-gloss {
  position: absolute;
  top: calc(100% + 1px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  padding: 0 4px;
  border-radius: 3px;
  background: var(--vp-c-bg);
  color: var(--vp-c-brand-1);
  font-size: 12px;
  line-height: 1.4;
  white-space: nowrap;
  pointer-events: none;
}
</style>
