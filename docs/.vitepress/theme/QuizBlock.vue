<template>
  <div class="quiz-block">
    <h3 v-if="title">{{ title }}</h3>
    <p v-if="error" class="quiz-error">题目加载失败：{{ error }}</p>
    <div v-for="group in groups" :key="group.knowledgePoint" class="quiz-group">
      <h4>{{ group.knowledgePoint }}</h4>
      <div v-for="(q, qi) in group.questions" :key="q.id" class="quiz-question">
        <p class="stem"><strong>{{ qi + 1 }}. {{ q.stem }}</strong></p>
        <div class="options">
          <button
            v-for="(opt, oi) in q.options"
            :key="oi"
            class="option"
            :class="optionClass(group.knowledgePoint + q.id, q, oi)"
            :disabled="submitted[group.knowledgePoint + q.id]"
            @click="select(group.knowledgePoint + q.id, oi)"
          >
            <span class="letter">{{ String.fromCharCode(65 + oi) }}</span>
            <span v-html="renderInline(opt)"></span>
          </button>
        </div>
        <div class="actions">
          <button
            class="submit"
            :disabled="selected[group.knowledgePoint + q.id] === undefined || submitted[group.knowledgePoint + q.id]"
            @click="submit(group.knowledgePoint + q.id, q)"
          >
            {{ submitted[group.knowledgePoint + q.id] ? (results[group.knowledgePoint + q.id] ? '回答正确' : '回答错误') : '提交答案' }}
          </button>
        </div>
        <div v-if="submitted[group.knowledgePoint + q.id] && !results[group.knowledgePoint + q.id]" class="explanation wrong">
          <strong>解析：</strong><span v-html="renderInline(q.explanation)"></span>
        </div>
        <details v-else-if="submitted[group.knowledgePoint + q.id]" class="explanation correct">
          <summary>查看解析</summary>
          <span v-html="renderInline(q.explanation)"></span>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { withBase } from 'vitepress'

const props = defineProps({
  src: { type: String, required: true },
  title: { type: String, default: '本章自测' }
})

const groups = ref([])
const error = ref('')
const selected = reactive({})
const submitted = reactive({})
const results = reactive({})

onMounted(async () => {
  try {
    const resp = await fetch(withBase(props.src))
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const data = await resp.json()
    groups.value = data.groups || []
  } catch (e) {
    error.value = String(e)
  }
})

function select(key, oi) {
  if (!submitted[key]) selected[key] = oi
}

function submit(key, q) {
  if (selected[key] === undefined || submitted[key]) return
  submitted[key] = true
  results[key] = selected[key] === q.answer
}

function optionClass(key, q, oi) {
  if (!submitted[key]) {
    return { active: selected[key] === oi }
  }
  return {
    active: selected[key] === oi,
    right: oi === q.answer,
    wrong: selected[key] === oi && oi !== q.answer
  }
}

function renderInline(text) {
  return String(text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\$([^$]+)\$/g, '<code class="math">$1</code>')
}
</script>

<style scoped>
.quiz-block { margin: 24px 0; }
.quiz-group { margin-bottom: 16px; }
.quiz-question { padding: 12px 0; border-bottom: 1px dashed var(--vp-c-divider); }
.stem { margin-bottom: 8px; }
.options { display: flex; flex-direction: column; gap: 8px; }
.option {
  display: flex; align-items: flex-start; gap: 8px; text-align: left;
  padding: 10px 12px; border: 1px solid var(--vp-c-divider); border-radius: 8px;
  background: var(--vp-c-bg); cursor: pointer; font-size: 14px;
}
.option:hover:not(:disabled) { border-color: var(--vp-c-brand-1); }
.option.active { border-color: var(--vp-c-brand-1); }
.option.right { border-color: #22c55e; background: rgba(34, 197, 94, 0.08); }
.option.wrong { border-color: #ef4444; background: rgba(239, 68, 68, 0.08); }
.option:disabled { cursor: default; }
.letter { font-weight: 600; flex-shrink: 0; }
.actions { margin-top: 8px; }
.submit {
  padding: 6px 16px; border-radius: 6px; font-size: 14px;
  background: var(--vp-c-brand-1); color: var(--vp-c-bg); border: none; cursor: pointer;
}
.submit:disabled { opacity: 0.5; cursor: not-allowed; }
.explanation { margin-top: 8px; padding: 10px 12px; border-radius: 8px; font-size: 14px; }
.explanation.wrong { background: rgba(239, 68, 68, 0.08); }
.explanation.correct { background: var(--vp-c-bg-soft); }
.quiz-error { color: #ef4444; }
</style>
