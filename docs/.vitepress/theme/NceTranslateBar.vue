<template>
  <div class="nce-bar" role="group" aria-label="译文显示控制">
    <span class="nce-bar-state">
      译文：<strong>{{ nceAll ? '全篇显示' : '全篇隐藏' }}</strong>
    </span>
    <span class="nce-bar-actions">
      <button :class="{ on: nceAll }" @click="setAll(true)">全篇显示</button>
      <button :class="{ on: !nceAll }" @click="setAll(false)">全篇隐藏</button>
    </span>
    <span class="nce-bar-tip">点句末「译」可单独切换本句译文</span>
  </div>
</template>

<script setup>
import { nceAll, nceEpoch } from './nce-store'

function setAll(v) {
  if (nceAll.value === v) return
  nceAll.value = v
  nceEpoch.value++
}
</script>

<style scoped>
.nce-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  margin: 16px 0 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  font-size: 13px;
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
