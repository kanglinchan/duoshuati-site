<template>
  <div class="nce-bar" role="group" aria-label="译文与讲解显示控制">
    <span class="nce-bar-group">
      <span class="nce-bar-state">
        译文：<strong>{{ zhAll ? '全篇显示' : '全篇隐藏' }}</strong>
      </span>
      <span class="nce-bar-actions">
        <button :class="{ on: zhAll }" @click="setZh(true)">全篇显示</button>
        <button :class="{ on: !zhAll }" @click="setZh(false)">全篇隐藏</button>
      </span>
    </span>
    <span v-if="hasEx" class="nce-bar-group">
      <span class="nce-bar-state">
        讲解：<strong>{{ exAll ? '全篇显示' : '全篇隐藏' }}</strong>
      </span>
      <span class="nce-bar-actions">
        <button :class="{ on: exAll }" @click="setEx(true)">全篇显示</button>
        <button :class="{ on: !exAll }" @click="setEx(false)">全篇隐藏</button>
      </span>
    </span>
    <span class="nce-bar-group">
      <span class="nce-bar-state">
        查词：<strong>{{ dictOn ? '开' : '关' }}</strong>
      </span>
      <span class="nce-bar-actions">
        <button :class="{ on: dictOn }" @click="setDict(true)">开</button>
        <button :class="{ on: !dictOn }" @click="setDict(false)">关</button>
      </span>
    </span>
    <span class="nce-bar-tip">点单词查词（下划线提示），再点或长按看完整释义；点句末图标可单独切换本句译文{{ hasEx ? ' / 讲解' : '' }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { nceZhAll, nceExAll, nceZhEpoch, nceExEpoch, nceDictOn } from './nce-store'

const props = defineProps({
  hasEx: { type: Boolean, default: false }
})

const zhAll = computed(() => nceZhAll.value)
const exAll = computed(() => nceExAll.value)
const dictOn = computed(() => nceDictOn.value)

function setDict(v) {
  nceDictOn.value = v
}

function setZh(v) {
  if (nceZhAll.value === v) return
  nceZhAll.value = v
  nceZhEpoch.value++
}
function setEx(v) {
  if (nceExAll.value === v) return
  nceExAll.value = v
  nceExEpoch.value++
}
</script>

<style scoped>
.nce-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  margin: 16px 0 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  font-size: 13px;
}
.nce-bar-group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.nce-bar-state {
  color: var(--vp-c-text-2);
}
.nce-bar-state strong {
  color: var(--vp-c-text-1);
  font-weight: 600;
}
.nce-bar-actions {
  display: inline-flex;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  overflow: hidden;
  background: var(--vp-c-bg);
}
.nce-bar-actions button {
  padding: 3px 12px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  background: transparent;
  border: none;
  cursor: pointer;
}
.nce-bar-actions button + button {
  border-left: 1px solid var(--vp-c-divider);
}
.nce-bar-actions button:hover {
  color: var(--vp-c-brand-1);
}
.nce-bar-actions button.on {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft, var(--vp-c-bg-soft));
  font-weight: 600;
}
.nce-bar-tip {
  color: var(--vp-c-text-3);
  font-size: 12px;
}
</style>
