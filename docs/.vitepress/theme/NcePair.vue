<template>
  <p class="nce-pair">
    <span class="nce-en"
      >{{ en
      }}<button
        v-if="zh"
        class="nce-icon"
        :class="{ on: zhVisible }"
        :aria-pressed="zhVisible ? 'true' : 'false'"
        :title="zhVisible ? '隐藏本句译文' : '显示本句译文'"
        @click="toggleZh"
      >
        <!-- 译文：文A -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3.5 5h9" />
          <path d="M8 3v10" />
          <path d="M8 6.5 4 11.5" />
          <path d="M8 6.5l4 5" />
          <path d="M13 21l3.5-8.5L20 21" />
          <path d="M14.6 17.5h3.8" />
        </svg>
      </button><button
        v-if="ex"
        class="nce-icon nce-icon-ex"
        :class="{ on: exVisible }"
        :aria-pressed="exVisible ? 'true' : 'false'"
        :title="exVisible ? '隐藏本句讲解' : '显示本句讲解'"
        @click="toggleEx"
      >
        <!-- 讲解：批注气泡 -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 14.5a2 2 0 0 1-2 2H8.5L4.5 20.5V5a2 2 0 0 1 2-2H18a2 2 0 0 1 2 2z" />
          <path d="M8.5 7.5h7" />
          <path d="M8.5 11h4.5" />
        </svg>
      </button></span>
    <span v-if="zhVisible && zh" class="nce-zh">{{ zh }}</span>
    <span v-if="exVisible && ex" class="nce-ex" v-html="exHtml"></span>
  </p>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { nceZhAll, nceExAll, nceZhEpoch, nceExEpoch } from './nce-store'

const props = defineProps({
  en: { type: String, required: true },
  zh: { type: String, default: '' },
  ex: { type: String, default: '' }
})

// null = 跟随全篇开关；true/false = 单句覆盖
const zhOverride = ref(null)
const exOverride = ref(null)
// 全篇开关每次切换后，单句覆盖回到跟随状态
watch(nceZhEpoch, () => {
  zhOverride.value = null
})
watch(nceExEpoch, () => {
  exOverride.value = null
})

const zhVisible = computed(() => (zhOverride.value === null ? nceZhAll.value : zhOverride.value))
const exVisible = computed(() => (exOverride.value === null ? nceExAll.value : exOverride.value))

function toggleZh() {
  zhOverride.value = !zhVisible.value
}
function toggleEx() {
  exOverride.value = !exVisible.value
}

// 讲解支持 **加粗** 与换行：先转义再还原受控标签
const exHtml = computed(() => {
  if (!props.ex) return ''
  return props.ex
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
})
</script>

<style scoped>
.nce-en {
  color: var(--vp-c-text-1);
}
.nce-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-left: 5px;
  padding: 0;
  vertical-align: 3px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  user-select: none;
  transition: color 0.15s, border-color 0.15s, background-color 0.15s;
}
.nce-icon svg {
  width: 12px;
  height: 12px;
}
.nce-icon:hover,
.nce-icon.on {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}
.nce-icon.on {
  background: var(--vp-c-brand-soft, var(--vp-c-bg-soft));
}
.nce-zh {
  display: block;
  margin-top: 2px;
  color: var(--vp-c-text-2);
  font-size: 0.9em;
}
.nce-ex {
  display: block;
  margin-top: 4px;
  padding: 6px 10px;
  border-left: 2px solid var(--vp-c-brand-1);
  border-radius: 0 6px 6px 0;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 0.86em;
  line-height: 1.7;
}
.nce-ex :deep(strong) {
  color: var(--vp-c-text-1);
  font-weight: 600;
}
</style>
