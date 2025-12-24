<script setup lang="ts">
import type { WeatherInfo } from '../types'
import { Droplets, PersonStanding, Zap } from 'lucide-vue-next'
import { onMounted, onUnmounted, ref } from 'vue'
import { mapWmoCode } from '../utils/weather'

const weatherData = ref<any>(null)
const loading = ref(true)
const locationText = ref('定位中...')
const weatherInfo = ref<WeatherInfo>({ text: '点击刷新', icon: mapWmoCode(-1).icon })

// 存储位置缓存，避免重复请求定位接口
const cachedCoords = ref<{ lat: number, lon: number, city: string } | null>(null)

async function fetchWeather(lat: number, lon: number, locationName?: string, isRealLocation: boolean = false) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,rain,wind_speed_10m,is_day,apparent_temperature,showers,relative_humidity_2m,precipitation,weather_code&hourly=precipitation_probability,uv_index,temperature_2m&timezone=auto&forecast_days=1`
  try {
    const response = await fetch(url)
    const data = await response.json()

    // 获取当前小时对应的索引
    const currentHour = new Date().getHours()
    data.current_hour_index = currentHour

    weatherData.value = data
    weatherInfo.value = mapWmoCode(data.current.weather_code, data.current.is_day === 1)
    loading.value = false

    if (locationName) {
      locationText.value = locationName
      // 只有真实获取到的位置才进行缓存
      if (isRealLocation) {
        cachedCoords.value = { lat, lon, city: locationName }
      }
    }
    else if (locationText.value.includes('定位中')) {
      locationText.value = `${lon.toFixed(2)}, ${lat.toFixed(2)}`
    }
  }
  catch (error) {
    weatherInfo.value.text = '接口错误'
    weatherInfo.value.icon = mapWmoCode(-1).icon
  }
}

async function reverseGeocode(lat: number, lon: number) {
  try {
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`)
    const data = await response.json()
    // 优先取城市名，如果没有则取行政区名或省级名
    const city = data.city || data.locality || data.principalSubdivision || '未知城市'
    return city
  }
  catch (e) {
    return `${lon.toFixed(2)}, ${lat.toFixed(2)}`
  }
}

async function fetchByIp() {
  try {
    const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=zh')
    const data = await res.json()
    if (data.latitude && data.longitude) {
      const city = data.city || data.locality || data.principalSubdivision || '未知城市'
      // 标记为真实位置，可以缓存
      await fetchWeather(data.latitude, data.longitude, city, true)
    }
    else {
      throw new Error('定位失败')
    }
  }
  catch (e) {
    // 失败时不传真实位置标记，不缓存
    await fetchWeather(39.9, 116.4, '北京市 (默认)')
  }
}

async function getLocationAndWeather() {
  loading.value = true

  // 如果已有缓存的坐标，直接使用缓存获取天气，不再请求定位接口
  if (cachedCoords.value) {
    const { lat, lon, city } = cachedCoords.value
    await fetchWeather(lat, lon, city, true)
    return
  }

  try {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (p) => {
          const lat = p.coords.latitude
          const lon = p.coords.longitude
          const city = await reverseGeocode(lat, lon)
          // 标记为真实位置，可以缓存
          await fetchWeather(lat, lon, city, true)
        },
        async () => await fetchByIp(),
        { timeout: 5000 },
      )
    }
    else {
      await fetchByIp()
    }
  }
  catch (err) {
    weatherInfo.value.text = '更新超时'
    loading.value = false
  }
}

let weatherTimer: number

onMounted(() => {
  getLocationAndWeather()
  weatherTimer = window.setInterval(getLocationAndWeather, 20 * 60 * 1000)
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
    @click="getLocationAndWeather"
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
        <p id="location-text" class="text-md text-white/60 uppercase tracking-widest mt-1 whitespace-nowrap">
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
