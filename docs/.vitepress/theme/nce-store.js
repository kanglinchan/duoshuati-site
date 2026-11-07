/**
 * 新概念英语译文/讲解显示的共享状态（全篇开关 + 单句覆盖重置）
 * 模块级状态在 SPA 内跨页面保留：读者切到下一课，上次的显示偏好继续生效
 */
import { ref } from 'vue'

/** 译文：全篇是否显示（默认隐藏，自测优先） */
export const nceZhAll = ref(false)
/** 讲解：全篇是否显示（默认隐藏） */
export const nceExAll = ref(false)

/** 各自的全篇切换计数：NcePair 监听它清空对应的单句覆盖 */
export const nceZhEpoch = ref(0)
export const nceExEpoch = ref(0)
