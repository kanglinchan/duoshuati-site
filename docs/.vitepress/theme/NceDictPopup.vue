<template>
  <Teleport to="body">
    <div v-if="card" class="nce-dict-mask" @click.self="close">
      <div class="nce-dict-card" role="dialog" aria-label="查词释义">
        <button class="nce-dict-close" aria-label="关闭" @click="close">✕</button>

        <template v-if="loading">
          <div v-if="loadState === 'downloading'" class="nce-dict-loading">
            词典首次加载中，已下载 {{ receivedMb }} MB…<br>
            <span class="nce-dict-sub">只需一次，之后完全离线可用</span>
          </div>
          <div v-else-if="loadState === 'opening' || loadState === 'checking'" class="nce-dict-loading">
            正在打开词典…
          </div>
          <div v-else class="nce-dict-loading">查询中…</div>
        </template>
        <template v-else-if="!entry">
          <div class="nce-dict-head"><span class="nce-dict-word">{{ card.word }}</span></div>
          <div class="nce-dict-none">词典中未收录该词形</div>
        </template>
        <template v-else>
          <div class="nce-dict-head">
            <span class="nce-dict-word">{{ entry.word }}</span>
            <span v-if="entry.phonetic" class="nce-dict-phon">/{{ entry.phonetic }}/</span>
            <button
              v-if="canSpeak"
              class="nce-dict-speak"
              aria-label="朗读单词"
              title="朗读单词"
              @click="speak"
            >🔊</button>
          </div>
          <div class="nce-dict-gloss">{{ brief }}</div>

          <div class="nce-dict-sec">
            <span class="nce-dict-tag">Original</span><span class="nce-dict-tagname">原文摘录</span>
            <p class="nce-dict-sen" v-html="senHtml"></p>
            <p v-if="card.zh" class="nce-dict-sen-zh">{{ card.zh }}</p>
          </div>

          <div class="nce-dict-sec">
            <span class="nce-dict-tag">Dictionary</span><span class="nce-dict-tagname">英汉词典</span>
            <p class="nce-dict-full">{{ entry.translation || '（无中文释义）' }}</p>
            <p v-if="entry.definition" class="nce-dict-def">{{ entry.definition }}</p>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { nceDictCard, closeDictCard } from './nce-store'
import { lookupWord, dictLoad } from './dict-worker'

const card = nceDictCard
const loading = ref(false)
const entry = ref(null)

const loadState = computed(() => dictLoad.value.state)
const receivedMb = computed(() => ((dictLoad.value.received || 0) / 1048576).toFixed(1))

const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

watch(card, async (c) => {
  entry.value = null
  if (!c) return
  loading.value = true
  try {
    entry.value = await lookupWord(c.word)
  } catch (e) {
    console.error('[nce-dict] 查询失败', e)
    entry.value = null
  } finally {
    loading.value = false
  }
})

function close() {
  closeDictCard()
}

function speak() {
  if (!canSpeak || !entry.value?.word) return
  const u = new SpeechSynthesisUtterance(entry.value.word)
  u.lang = 'en-US'
  u.rate = 0.9
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}

// 词典区短释义：第一条中文释义（去词性前缀）
const brief = computed(() => {
  const t = entry.value?.translation || ''
  const first = t.split('\n')[0].replace(/^[a-z]+\.\s*/, '').trim()
  return first || '（无中文释义）'
})

// 原文摘录：转义后高亮所点单词（大小写不敏感）
const senHtml = computed(() => {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const sen = esc(card.value?.en || '')
  const w = card.value?.word || ''
  if (!w) return sen
  const re = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
  return sen.replace(re, (m) => `<mark>${m}</mark>`)
})
</script>

<style scoped>
.nce-dict-mask {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
}
.nce-dict-card {
  position: relative;
  width: 100%;
  max-width: 560px;
  max-height: 72vh;
  overflow-y: auto;
  padding: 18px 20px 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px 14px 0 0;
  background: var(--vp-c-bg);
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.15);
}
@media (min-width: 640px) {
  .nce-dict-mask {
    align-items: center;
  }
  .nce-dict-card {
    border-radius: 12px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  }
}
.nce-dict-close {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
}
.nce-dict-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding-right: 32px;
}
.nce-dict-word {
  font-size: 20px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.nce-dict-phon {
  color: #c0392b;
  font-size: 14px;
}
.nce-dict-speak {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 15px;
}
.nce-dict-gloss {
  margin-top: 4px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
.nce-dict-none {
  margin-top: 8px;
  color: var(--vp-c-text-3);
  font-size: 13px;
}
.nce-dict-loading {
  margin-top: 10px;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.7;
}
.nce-dict-sub {
  color: var(--vp-c-text-3);
  font-size: 12px;
}
.nce-dict-sec {
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px solid var(--vp-c-divider);
}
.nce-dict-tag {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 4px;
  background: var(--vp-c-brand-soft, var(--vp-c-bg-soft));
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-style: italic;
  font-weight: 600;
}
.nce-dict-tagname {
  margin-left: 6px;
  color: var(--vp-c-text-3);
  font-size: 12px;
}
.nce-dict-sen {
  margin: 8px 0 0;
  color: var(--vp-c-text-1);
  font-size: 14px;
  line-height: 1.7;
}
.nce-dict-sen :deep(mark) {
  padding: 0 2px;
  border-radius: 3px;
  color: var(--vp-c-brand-1);
  font-weight: 600;
  background: var(--vp-c-brand-soft, rgba(0, 0, 0, 0.06));
}
.nce-dict-sen-zh {
  margin: 6px 0 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
}
.nce-dict-full {
  margin: 8px 0 0;
  color: var(--vp-c-text-1);
  font-size: 13.5px;
  line-height: 1.8;
  white-space: pre-wrap;
}
.nce-dict-def {
  margin: 8px 0 0;
  color: var(--vp-c-text-3);
  font-size: 12.5px;
  line-height: 1.7;
  white-space: pre-wrap;
}
</style>
