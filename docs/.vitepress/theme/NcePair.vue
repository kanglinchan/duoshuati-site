<template>
  <p class="nce-pair">
    <span class="nce-en"
      >{{ en
      }}<button
        class="nce-eye"
        :class="{ on: visible }"
        :aria-pressed="visible ? 'true' : 'false'"
        :title="visible ? '隐藏本句译文' : '显示本句译文'"
        @click="toggle"
      >
        译
      </button></span>
    <span v-if="visible" class="nce-zh">{{ zh }}</span>
  </p>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { nceAll, nceEpoch } from './nce-store'

const props = defineProps({
  en: { type: String, required: true },
  zh: { type: String, required: true }
})

// null = 跟随全篇开关；true/false = 单句覆盖
const override = ref(null)
// 全篇开关每次切换后，单句覆盖回到跟随状态
watch(nceEpoch, () => {
  override.value = null
})

const visible = computed(() => (override.value === null ? nceAll.value : override.value))

function toggle() {
  override.value = !visible.value
}
</script>

<style scoped>
.nce-en {
  color: var(--vp-c-text-1);
}
.nce-eye {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-left: 6px;
  padding: 0;
  vertical-align: 3px;
  font-size: 11px;
  line-height: 1;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  user-select: none;
  transition: color 0.15s, border-color 0.15s, background-color 0.15s;
}
.nce-eye:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}
.nce-eye.on {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft, var(--vp-c-bg-soft));
}
.nce-zh {
  display: block;
  margin-top: 2px;
  color: var(--vp-c-text-2);
  font-size: 0.9em;
}
</style>
