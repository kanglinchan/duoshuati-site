<script setup>
import { ref, onMounted } from 'vue'

// diagram 为 encodeURIComponent 后的 mermaid 源码（由 markdown fence 拦截器输出）
const props = defineProps({ diagram: { type: String, required: true } })

const svg = ref('')
const failed = ref(false)
let rendered = false

onMounted(async () => {
  if (rendered) return
  rendered = true
  try {
    const mermaid = (await import('mermaid')).default
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      // classDiagram 成员里出现 C++ 特殊字符时尽量宽松
      classDiagram: { useMaxWidth: true }
    })
    const id = 'mmd-' + Math.random().toString(36).slice(2, 9)
    const { svg: out } = await mermaid.render(id, decodeURIComponent(props.diagram))
    svg.value = out
  } catch (e) {
    console.error('[mermaid] render failed:', e)
    failed.value = true
  }
})
</script>

<template>
  <ClientOnly>
    <div v-if="svg" class="mermaid-block" v-html="svg"></div>
    <pre v-else-if="failed" class="mermaid-failed">图表渲染失败，源码如下：
{{ decodeURIComponent(diagram) }}</pre>
    <div v-else class="mermaid-loading">图表渲染中…</div>
  </ClientOnly>
</template>

<style scoped>
.mermaid-block {
  text-align: center;
  padding: 12px 0;
  overflow-x: auto;
}
.mermaid-block :deep(svg) {
  max-width: 100%;
  height: auto;
}
.mermaid-loading {
  color: var(--vp-c-text-3);
  font-size: 13px;
  text-align: center;
  padding: 16px 0;
}
.mermaid-failed {
  font-size: 12px;
  opacity: 0.75;
}
</style>
