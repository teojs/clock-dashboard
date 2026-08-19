<script setup lang="ts">
import { useIdle, useMagicKeys } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, ref, watch, watchEffect } from 'vue'
import NewYearEgg from './components/NewYearEgg.vue'
import SettingsDrawer from './components/SettingsDrawer.vue'
import WeatherEffects from './components/WeatherEffects.vue'
import { i18n } from './i18n'
import { useConfigStore } from './stores/config'
import { useWeatherStore } from './stores/weather'
import { isIpadIOS15OrLower } from './utils/device'
import CalendarView from './views/CalendarView.vue'
import ClockWeatherView from './views/ClockWeatherView.vue'
import ClockWeatherViewCompact from './views/ClockWeatherViewCompact.vue'
import SmartHomeView from './views/SmartHomeView.vue'

const configStore = useConfigStore()
const { showDrawer, layoutConfig } = storeToRefs(configStore)

const currentPage = ref(1)
const calendarRef = ref<any>(null)

const weatherStore = useWeatherStore()
const { weatherData, showRainEffect, showThunderEffect, showSnowEffect } = storeToRefs(weatherStore)

const isSwiping = ref(false)

// 判断是否需要渲染天气特效组件
const shouldShowWeatherEffects = computed(() => {
  if (!weatherData.value || layoutConfig.value.clockOnlyMode) return false

  const code = weatherData.value.current?.weather_code ?? -1

  if (showRainEffect.value) {
    const isRaining = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)
    if (isRaining) return true
  }

  if (showSnowEffect.value) {
    const isSnowing = (code >= 71 && code <= 77) || (code === 85 || code === 86)
    if (isSnowing) return true
  }

  if (showThunderEffect.value) {
    const isThundering = code === 95 || code === 96 || code === 99
    if (isThundering) return true
  }

  return false
})

let startX = 0

function goToPage(page: number) {
  currentPage.value = page

  // 切换到日历看板 (page 2) 时更新当前日期
  if (page === 2 && calendarRef.value) {
    calendarRef.value.refreshToday()
  }
}

function handleTouchStart(e: TouchEvent) {
  startX = e.touches[0].clientX
}

function handleTouchEnd(e: TouchEvent) {
  const endX = e.changedTouches[0].clientX
  const diff = startX - endX
  if (Math.abs(diff) > 50) {
    isSwiping.value = true
    setTimeout(() => {
      isSwiping.value = false
    }, 50)

    if (diff > 0 && currentPage.value < 2)
      goToPage(currentPage.value + 1)
    else if (diff < 0 && currentPage.value > 0)
      goToPage(currentPage.value - 1)
  }
}

function handleMouseDown(e: MouseEvent) {
  startX = e.clientX
}

function handleMouseUp(e: MouseEvent) {
  const diff = startX - e.clientX
  if (Math.abs(diff) > 50) {
    isSwiping.value = true
    setTimeout(() => {
      isSwiping.value = false
    }, 50)

    if (diff > 0 && currentPage.value < 2)
      goToPage(currentPage.value + 1)
    else if (diff < 0 && currentPage.value > 0)
      goToPage(currentPage.value - 1)
  }
}

function handleGlobalClick(e: MouseEvent) {
  if (isSwiping.value) {
    e.stopImmediatePropagation()
    e.preventDefault()
  }
}

/** 30 秒不操作自动返回首页 */
const { idle } = useIdle(30 * 1000)
watch(idle, (newIdle) => {
  if (newIdle) {
    goToPage(1)
  }
})

/** 键盘左右键切换页面 */
const { left, right } = useMagicKeys()
watchEffect(() => {
  if (showDrawer.value) return

  if (left.value && currentPage.value > 0) {
    goToPage(currentPage.value - 1)
  }
  if (right.value && currentPage.value < 2) {
    goToPage(currentPage.value + 1)
  }
})

const { language } = storeToRefs(configStore)
i18n.global.locale.value = language.value
watch(language, (nextLocale) => {
  i18n.global.locale.value = nextLocale
})
</script>

<template>
  <div
    class="viewport-container overflow-hidden relative w-screen h-screen bg-black"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @click.capture="handleGlobalClick"
  >
    <!-- Background Decoration -->
    <template v-if="!isIpadIOS15OrLower()">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />
    </template>

    <div
      class="main-slider flex h-full transition-transform duration-700 cubic-bezier"
      :style="{ transform: `translateX(-${currentPage * 100}vw)`, width: '300vw' }"
    >
      <div class="slide-page w-screen h-screen flex items-center justify-center flex-shrink-0">
        <SmartHomeView v-if="currentPage === 0" />
      </div>
      <div class="slide-page w-screen h-screen flex items-center justify-center flex-shrink-0">
        <ClockWeatherViewCompact v-if="layoutConfig.compactMode" />
        <ClockWeatherView v-else />
      </div>
      <div class="slide-page w-screen h-screen flex items-center justify-center flex-shrink-0">
        <CalendarView v-if="currentPage === 2" ref="calendarRef" />
      </div>
    </div>

    <SettingsDrawer />

    <NewYearEgg />

    <WeatherEffects v-if="shouldShowWeatherEffects" />
  </div>
</template>

<style scoped>
.cubic-bezier {
  transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
}
</style>
