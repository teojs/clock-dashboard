<script setup lang="ts">
import { Droplets, PersonStanding, Zap } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useWeatherStore } from '../stores/weather'
import WeatherSettingsModal from './WeatherSettingsModal.vue'

const weatherStore = useWeatherStore()
const { weatherData, loading, locationText, weatherInfo, refreshInterval } = storeToRefs(weatherStore)

const showSettings = ref(false)
let weatherTimer: number

function setupTimer() {
  if (weatherTimer) clearInterval(weatherTimer)
  weatherTimer = window.setInterval(weatherStore.updateWeather, refreshInterval.value * 60 * 1000)
}

watch(refreshInterval, () => {
  setupTimer()
})

onMounted(() => {
  weatherStore.updateWeather()
  setupTimer()
})

onUnmounted(() => {
  clearInterval(weatherTimer)
})
</script>

<template>
  <div
    id="weather-container"
    class="weather-clickable grid grid-cols-1 md:grid-cols-3 gap-3 w-full pt-10 transition-opacity duration-700"
    :class="{ 'opacity-30': loading, 'opacity-100': !loading }"
    @click="showSettings = true"
  >
    <!-- 状态与定位 -->
    <div class="flex items-center justify-center md:justify-start gap-0">
      <div id="weather-icon" class="w-28 h-28 drop-shadow-xl">
        <img :src="weatherInfo.icon" :alt="weatherInfo.text" class="w-full h-full object-contain">
      </div>
      <div>
        <p id="weather-text" class="text-4xl font-semibold tracking-wide">
          {{ weatherInfo.text }}
        </p>
        <p id="location-text" class="text-lg text-white/60 uppercase tracking-widest mt-1 whitespace-nowrap">
          {{ locationText }} ·
          降雨 <span class="text-blue-400 text-xl tabular-nums">{{ weatherData ? weatherData.hourly.precipitation_probability[weatherData.current_hour_index] : '--' }}%</span>
        </p>
      </div>
    </div>

    <!-- 温度显示 -->
    <div class="flex items-center justify-center px-4 gap-6">
      <div class="flex items-end">
        <div id="temp-val" class="text-8xl font-extralight mr-1">
          {{ weatherData ? Math.round(weatherData.current.temperature_2m) : '--' }}
        </div>
        <div class="text-3xl font-light opacity-70 mb-12">
          °C
        </div>
      </div>
      <div class="flex flex-col items-end justify-between gap-2">
        <span id="temp-max" class="text-3xl font-medium text-red-200">
          {{ weatherData ? Math.round(Math.max(...weatherData.hourly.temperature_2m)) : '--' }}°
        </span>
        <span id="temp-min" class="text-3xl font-medium text-blue-200">
          {{ weatherData ? Math.round(Math.min(...weatherData.hourly.temperature_2m)) : '--' }}°
        </span>
      </div>
    </div>

    <!-- 环境数据 -->
    <div class="flex flex-col justify-center items-center md:items-end gap-3 text-white text-3xl tabular-nums">
      <div class="flex items-center gap-3">
        <span id="humidity-val">
          {{ weatherData ? weatherData.current.relative_humidity_2m : '--' }}%
        </span>
        <Droplets class="w-8 h-8 text-blue-500/60" />
      </div>
      <div class="flex items-center gap-3">
        <span id="apparent-temp-val">
          {{ weatherData ? Math.round(weatherData.current.apparent_temperature) : '--' }}°C
        </span>
        <PersonStanding class="w-8 h-8 text-orange-500/60" />
        <span id="uv-val">
          {{ weatherData ? Math.round(weatherData.hourly.uv_index[weatherData.current_hour_index]) : '--' }}
        </span>
        <Zap class="w-8 h-8 text-yellow-500/60" />
      </div>
    </div>
  </div>

  <!-- 天气设置弹窗 -->
  <WeatherSettingsModal
    :show="showSettings"
    @close="showSettings = false"
  />
</template>

<style scoped>
.weather-clickable {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    opacity 0.5s ease;
  padding: 1rem;
}
.weather-clickable:active {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.03);
}
</style>
