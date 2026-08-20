<script setup lang="ts">
import { Droplets, Thermometer } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWeatherStore } from '../stores/weather'
import WeatherForecastModal from './WeatherForecastModal.vue'

defineProps<{
  compact?: boolean
}>()
const weatherStore = useWeatherStore()
const { weatherData, loading, locationText, weatherInfo, refreshInterval } = storeToRefs(weatherStore)
const { t } = useI18n()

const showForecastModal = ref(false)

function openForecast() {
  showForecastModal.value = true
}

function closeForecast() {
  showForecastModal.value = false
}

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
    class="weather-clickable flex flex-col items-center w-full transition-opacity duration-700 space-y-[3vh]"
    :class="{ 'opacity-30': loading, 'opacity-100': !loading, compact }"
    @click.stop.prevent="openForecast"
  >
    <!-- 状态与定位 -->
    <div class="flex items-center justify-center md:justify-start whitespace-nowrap">
      <div id="weather-icon" class="flex-shrink-0 mr-[1vh]">
        <img :src="weatherInfo.icon" :alt="weatherInfo.text" class="w-full h-full object-contain" draggable="false">
      </div>
      <div>
        <div class="text-[6vh] leading-none">
          {{ weatherInfo.text }}
        </div>
        <div class="text-[3vh] leading-none mt-[1vh] text-white/80 uppercase tracking-widest">
          {{ locationText }}
          · {{ t('weather.rainLabel') }}
          <span class="text-[4vh] leading-none text-blue-400 tabular-nums">
            {{ weatherData ? weatherData.hourly.precipitation_probability[weatherData.current_hour_index] : '--' }}%
          </span>
        </div>
      </div>
    </div>

    <!-- 温度显示 -->
    <div class="flex items-baseline justify-center space-x-[4vw]">
      <div class="flex items-center space-x-[1vh]">
        <div class="text-[10vh] leading-none font-extralight">
          {{ weatherData ? Math.round(weatherData.current.temperature_2m) : '--' }}
        </div>
        <div class="flex items-center flex-col">
          <div class="text-[3.5vh] leading-none font-light opacity-70">
            °C
          </div>
          <Thermometer class="w-[4.5vh] text-blue-500/60 flex-shrink-0 ml-[1vh]" />
        </div>
      </div>
      <!-- 湿度 -->
      <div class="flex items-center space-x-[1vh]">
        <div class="text-[10vh] leading-none font-extralight">
          {{ weatherData ? weatherData.current.relative_humidity_2m : '--' }}
        </div>
        <div class="flex items-center flex-col">
          <div class="text-[3.5vh] leading-none font-light opacity-70">
            %
          </div>
          <Droplets class="w-[4vh] text-blue-500/60 flex-shrink-0" />
        </div>
      </div>
    </div>
  </div>

  <WeatherForecastModal :show="showForecastModal" @close="closeForecast" />
</template>

<style scoped>
.weather-clickable {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    opacity 0.5s ease;
}
.weather-clickable:active {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.03);
}

#weather-icon {
  width: 15vh;
  height: 15vh;
}

.environment-data-icon {
  width: 7vh;
}

#humidity-val,
#aqi-val {
  margin-bottom: 2vh;
}

#aqi-label {
  font-size: 2vh;
  line-height: 1.1;
}

.weather-clickable.compact {
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1.2vh 2vh;
  padding: 1.2vh 1.6vh 2vh;
  width: 100%;
}

.compact #weather-icon {
  width: 7vh;
  height: 7vh;
}

.compact #weather-text {
  font-size: 2.6vh;
}

.compact #location-text {
  font-size: 1.4vh;
  margin-top: 0.4vh;
}

.compact #temp-val {
  font-size: 6.5vh;
}

.compact .environment-data {
  font-size: 2.2vh;
}

.compact .environment-data-icon {
  width: 2.4vh;
  height: 2.4vh;
}

.compact #humidity-val,
.compact #aqi-val {
  margin-bottom: 0.8vh;
}

.compact #aqi-label {
  font-size: 1.3vh;
}
</style>
