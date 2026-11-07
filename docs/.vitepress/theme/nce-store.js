/**
 * 新概念英语译文显示的共享状态（全篇开关 + 单句覆盖重置）
 * 模块级状态在 SPA 内跨页面保留：读者切到下一课，上次的显示偏好继续生效
 */
import { ref } from 'vue'

/** 全篇译文是否显示（默认隐藏，自测优先） */
export const nceAll = ref(false)

/** 全篇切换计数：每次全篇开关 +1，NcePair 监听它清空单句覆盖 */
export const nceEpoch = ref(0)
