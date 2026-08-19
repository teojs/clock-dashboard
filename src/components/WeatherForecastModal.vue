<script setup lang="ts">
import { useIdle } from '@vueuse/core'
import { RefreshCw, Settings } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfigStore } from '../stores/config'
import { useWeatherStore } from '../stores/weather'
import { isIpadIOS15OrLower } from '../utils/device'
import { mapWmoCode } from '../utils/weather'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const weatherStore = useWeatherStore()
const configStore = useConfigStore()
const { locationText, weatherData, loading } = storeToRefs(weatherStore)
const { showDrawer, activeTab } = storeToRefs(configStore)
const { t, locale } = useI18n()

interface ForecastDay {
  dayName: string
  dateText: string
  weatherInfo: ReturnType<typeof mapWmoCode>
  tempMax: number
  tempMin: number
  precipitationProbability: number
  isToday: boolean
}

const forecastDays = computed<ForecastDay[]>(() => {
  if (!weatherData.value?.daily?.time?.length) return []

  const { daily, current, hourly, current_hour_index } = weatherData.value
  const hourIndex = current_hour_index ?? new Date().getHours()
  const currentTemp = current?.temperature_2m

  return daily.time
    .slice(0, 5)
    .map((time: string, index: number) => {
      const date = new Date(`${time}T00:00:00`)
      const isToday = index === 0
      const isTomorrow = index === 1

      const dayName = isToday
        ? t('common.today')
        : isTomorrow
          ? t('common.tomorrow')
          : t(`weekdays.short.${date.getDay()}`)

      const dateText = new Intl.DateTimeFormat(locale.value, { month: 'numeric', day: 'numeric' }).format(date)
      const weatherInfo = isToday && current
        ? mapWmoCode(current.weather_code, current.is_day === 1)
        : mapWmoCode(daily.weather_code[index], true)

      let tempMax = Math.round(daily.temperature_2m_max[index])
      let tempMin = Math.round(daily.temperature_2m_min[index])
      if (isToday && currentTemp !== undefined) {
        const roundedCurrent = Math.round(currentTemp)
        tempMax = Math.max(tempMax, roundedCurrent)
        tempMin = Math.min(tempMin, roundedCurrent)
      }

      const precipitationProbability = isToday
        ? (hourly?.precipitation_probability?.[hourIndex] ?? daily.precipitation_probability_max[index] ?? 0)
        : (daily.precipitation_probability_max[index] || 0)

      return {
        dayName,
        dateText,
        weatherInfo,
        tempMax,
        tempMin,
        precipitationProbability,
        isToday,
      }
    })
})

const isLoading = computed(() => loading.value || forecastDays.value.length === 0)

const tempRange = computed(() => {
  if (forecastDays.value.length === 0) return { min: 0, max: 0, range: 0 }

  const allTemps = forecastDays.value.flatMap((day: ForecastDay) => [day.tempMin, day.tempMax])
  const min = Math.min(...allTemps)
  const max = Math.max(...allTemps)
  const range = max - min

  return { min, max, range }
})

function getTempBarPosition(tempMin: number, tempMax: number) {
  const { min, range } = tempRange.value
  if (range === 0) return { left: 0, width: 100 }

  const left = ((tempMin - min) / range) * 100
  const width = ((tempMax - tempMin) / range) * 100

  return { left, width }
}

function getTempDotPosition(temp: number) {
  const { min, range } = tempRange.value
  if (range === 0) return 50

  const position = ((temp - min) / range) * 100
  return Math.min(100, Math.max(0, position))
}

watch(() => props.show, (newValue) => {
  if (newValue && !weatherData.value) {
    weatherStore.updateWeather()
  }
})

onMounted(() => {
  if (props.show && !weatherData.value) {
    weatherStore.updateWeather()
  }
})

function refreshForecast() {
  weatherStore.updateWeather()
}

function openSettings() {
  activeTab.value = 'weather'
  showDrawer.value = true
}

function handleClose() {
  emit('close')
}

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    handleClose()
  }
}

const { idle } = useIdle(30 * 1000)
watch(idle, (newIdle) => {
  if (newIdle) {
    handleClose()
  }
})
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
    @click.stop.prevent="handleOverlayClick"
    @mousedown.stop
    @mouseup.stop
    @touchstart.stop
    @touchend.stop
  >
    <div
      class="max-h-[80vh] flex flex-col relative bg-neutral-950 rounded-3xl max-w-2xl w-full mx-4 border border-white/20"
    >
      <div v-if="!isIpadIOS15OrLower()" class="absolute inset-20 bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />

      <!-- 标题 -->
      <div class="px-8 pt-8 pb-6 flex items-center justify-between space-x-4">
        <h2 class="text-3xl font-bold text-white flex items-center space-x-2">
          <span>{{ t('weather.fiveDayForecast') }}</span>
          <span class="text-white/40">·</span>
          <span class="text-white/60 text-2xl">{{ locationText }}</span>
        </h2>
        <div class="flex items-center space-x-2">
          <button
            class="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
            @click="openSettings"
          >
            <Settings class="w-5 h-5 text-white" />
          </button>
          <button
            class="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
            :class="{ 'opacity-60 pointer-events-none': loading }"
            :disabled="loading"
            @click="refreshForecast"
          >
            <RefreshCw class="w-5 h-5 text-white" :class="{ 'animate-spin': loading }" />
          </button>
        </div>
      </div>

      <!-- 天气列表 -->
      <div class="px-8 pb-8 overflow-y-auto">
        <!-- 骨架屏 -->
        <div v-if="isLoading" class="space-y-3">
          <div
            v-for="i in 5"
            :key="`skeleton-${i}`"
            class="flex items-center justify-between space-x-6 py-2 px-6 rounded-2xl bg-white/5"
          >
            <!-- 左侧骨架 -->
            <div class="flex items-center space-x-4 flex-1">
              <!-- 日期骨架 -->
              <div class="flex flex-col space-y-2 w-[100px]">
                <div class="h-6 w-16 bg-white/10 rounded animate-pulse" />
                <div class="h-4 w-12 bg-white/10 rounded animate-pulse" />
              </div>

              <!-- 天气图标和描述骨架 -->
              <div class="flex flex-col space-y-2 flex-1">
                <div class="flex items-center space-x-3">
                  <div class="w-16 h-16 bg-white/10 rounded-full animate-pulse flex-shrink-0" />
                  <div class="flex flex-col space-y-2 flex-1">
                    <div class="h-5 w-20 bg-white/10 rounded animate-pulse" />
                    <div class="h-4 w-24 bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧温度骨架 -->
            <div class="flex items-center space-x-3 min-w-[240px]">
              <div class="h-5 w-10 bg-white/10 rounded animate-pulse" />
              <div class="flex-1 h-2 bg-white/10 rounded-full animate-pulse" />
              <div class="h-5 w-10 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        </div>

        <!-- 实际数据 -->
        <div v-else class="space-y-3">
          <div
            v-for="(day, index) in forecastDays"
            :key="index"
            class="flex items-center justify-between space-x-6 py-2 px-6 rounded-2xl bg-white/5"
          >
            <!-- 左侧：日期、天气、降雨 -->
            <div class="flex items-center space-x-4 flex-1">
              <!-- 日期 -->
              <div class="flex flex-col items-start w-[100px]">
                <span class="text-xl font-semibold text-white">{{ day.dayName }}</span>
                <span class="text-sm text-white/60">{{ day.dateText }}</span>
              </div>

              <!-- 天气图标和描述 -->
              <div class="flex flex-col space-y-2 flex-1">
                <div class="flex items-center space-x-3">
                  <img
                    :src="day.weatherInfo.icon"
                    :alt="day.weatherInfo.text"
                    class="w-16 h-16 object-contain flex-shrink-0"
                    draggable="false"
                  >
                  <div class="flex flex-col">
                    <span class="text-lg text-white/90">{{ day.weatherInfo.text }}</span>
                    <!-- 降雨概率 -->
                    <span class="text-sm text-blue-400 tabular-nums">{{ t('weather.rainLabel') }} {{ day.precipitationProbability }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧：温度区间条 -->
            <div class="flex items-center space-x-3 min-w-[240px]">
              <span class="text-lg font-medium text-blue-300 tabular-nums w-10 text-right">{{ day.tempMin }}°</span>

              <!-- 温度区间条 -->
              <div class="relative flex-1 h-2 bg-white/10 rounded-full">
                <div
                  class="absolute h-full bg-gradient-to-r from-blue-400 to-orange-400 rounded-full transition-all duration-500"
                  :style="{
                    left: `${getTempBarPosition(day.tempMin, day.tempMax).left}%`,
                    width: `${getTempBarPosition(day.tempMin, day.tempMax).width}%`,
                  }"
                />
                <div
                  v-if="day.isToday && weatherData?.current?.temperature_2m !== undefined"
                  class="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                  :style="{ left: `${getTempDotPosition(weatherData.current.temperature_2m)}%` }"
                />
              </div>

              <span class="text-lg font-medium text-orange-400 tabular-nums w-10 text-left">{{ day.tempMax }}°</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
