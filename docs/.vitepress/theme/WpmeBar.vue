<template>
  <div>
    <div class="wpme-bar" role="group" aria-label="查词显示控制">
      <span class="wpme-bar-group">
        <span class="wpme-bar-state">
          查词：<strong>{{ dictOn ? '开' : '关' }}</strong>
        </span>
        <span class="wpme-bar-actions">
          <button :class="{ on: dictOn }" @click="setDict(true)">开</button>
          <button :class="{ on: !dictOn }" @click="setDict(false)">关</button>
        </span>
      </span>
      <span class="wpme-bar-tip">点单词查词（下划线提示），再点或长按看完整释义</span>
    </div>
    <NceDictPopup />
  </div>
</template>

<script setup>
// Word Power Made Easy 页面控制条：只保留查词开关（词典状态与新概念英语共用，跨页保留）
import { nceDictOn } from './nce-store'
import NceDictPopup from './NceDictPopup.vue'

const dictOn = nceDictOn

function setDict(v) {
  nceDictOn.value = v
}
</script>

<style scoped>
.wpme-bar {
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
.wpme-bar-group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.wpme-bar-state {
  color: var(--vp-c-text-2);
}
.wpme-bar-state strong {
  color: var(--vp-c-text-1);
  font-weight: 600;
}
.wpme-bar-actions {
  display: inline-flex;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  overflow: hidden;
  background: var(--vp-c-bg);
}
.wpme-bar-actions button {
  padding: 3px 12px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  background: transparent;
  border: none;
  cursor: pointer;
}
.wpme-bar-actions button + button {
  border-left: 1px solid var(--vp-c-divider);
}
.wpme-bar-actions button:hover {
  color: var(--vp-c-brand-1);
}
.wpme-bar-actions button.on {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft, var(--vp-c-bg-soft));
  font-weight: 600;
}
.wpme-bar-tip {
  color: var(--vp-c-text-3);
  font-size: 12px;
}
</style>
