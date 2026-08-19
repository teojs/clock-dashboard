import type { HAConfig } from '../types'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { normalizeLocale } from '../i18n'

const defaultLanguage = normalizeLocale(typeof navigator !== 'undefined' ? navigator.language : undefined)

export const useConfigStore = defineStore('config', () => {
  const showDrawer = ref(false)
  const activeTab = ref<'general' | 'clock' | 'weather' | 'calendar' | 'smart'>('general')
  const language = ref(defaultLanguage)

  const haLayout = ref({
    /** 每行显示的设备数量：3、4 或 5 */
    columns: 3,
  })
  const haConfig = ref<HAConfig>({
    url: '',
    token: '',
    entities: [],
  })

  const clockConfig = ref({
    /** 时钟颜色 */
    color: '#ffffff',
    /** 字重 */
    fontWeight: 700,
    /** 数字随机倾斜 */
    enableTilt: true,
    /** 显示秒钟 */
    showSeconds: false,
    /** 透明度 */
    opacity: 0.9,
    /** 24小时制 */
    is24Hour: true,
    /** 数字水平间距（em，负值表示重叠） */
    digitSpacing: -0.18,
  })

  const calendarConfig = ref({
    /** 一周的开始：0 为周日，1 为周一 */
    weekStartDay: 0,
    /** 显示法定节假日 */
    showHolidays: true,
  })

  const layoutConfig = ref({
    /** 仅显示时钟 */
    clockOnlyMode: false,
    /** 紧凑模式：时钟在左，日历与天气在右 */
    compactMode: false,
    /** 显示农历 */
    showLunar: true,
    /** 显示节假日 */
    showFestival: true,
  })

  return {
    haLayout,
    haConfig,
    clockConfig,
    calendarConfig,
    layoutConfig,
    showDrawer,
    activeTab,
    language,
  }
}, {
  persist: {
    omit: ['showDrawer', 'activeTab'],
  },
})
