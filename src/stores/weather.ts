import type { CitySearchResult } from '../api/types'
import type { WeatherInfo } from '../types'
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { searchCities as searchCitiesApi } from '../api/geocoding'
import { getCurrentPosition, reverseGeocode as reverseGeocodeApi } from '../api/location'
import { fetchWeatherData } from '../api/weather'
import { mapWmoCode } from '../utils/weather'

export type LocationMode = 'auto' | 'coords' | 'city'

export const useWeatherStore = defineStore('weather', () => {
  // --- Persistent State ---
  const locationMode = ref<LocationMode>('auto')
  const customLat = ref(39.9)
  const customLon = ref(116.4)
  const customCity = ref('北京市')
  const refreshInterval = ref(20)
  const showRainEffect = ref(true)
  const showThunderEffect = ref(true)
  const showSnowEffect = ref(true)

  // --- Runtime State ---
  const weatherData = ref<any>(null)
  const loading = ref(false)
  const locationText = ref('定位中...')
  const weatherInfo = ref<WeatherInfo>({ text: '正在获取', icon: mapWmoCode(-1).icon })
  const cachedCoords = ref<{ lat: number, lon: number, city: string } | null>(null)

  async function fetchWeather(lat: number, lon: number) {
    try {
      const data = await fetchWeatherData(lat, lon)
      weatherData.value = data
      weatherInfo.value = mapWmoCode(data.current.weather_code, data.current.is_day === 1)
      loading.value = false
    }
    catch (error) {
      weatherInfo.value.text = '接口错误'
      weatherInfo.value.icon = mapWmoCode(-1).icon
      loading.value = false
    }
  }

  function extractSimplifiedChinese(text: string): string {
    if (!text) return text
    const parts = text.split(';')
    if (parts.length > 1) {
      return parts[0].trim()
    }
    return text
  }

  function cleanDisplayName(displayName: string): string {
    if (!displayName) return displayName
    return displayName
      .split(',')
      .map(part => extractSimplifiedChinese(part))
      .join(', ')
  }

  async function searchCities(query: string): Promise<CitySearchResult[]> {
    try {
      const trimmedQuery = query.trim()
      if (!trimmedQuery) {
        return []
      }

      const results = await searchCitiesApi(trimmedQuery)
      if (results.length > 0) {
        return results.map((r) => {
          const rawName = r.name || ''
          const rawDisplayName = r.display_name || ''
          const cityName = extractSimplifiedChinese(rawName.split(',')[0] || rawName)
          const displayName = cleanDisplayName(rawDisplayName)

          return {
            name: cityName || trimmedQuery,
            displayName: displayName || cityName || trimmedQuery,
            latitude: Number.parseFloat(r.lat),
            longitude: Number.parseFloat(r.lon),
          }
        })
      }
      return []
    }
    catch (e) {
      return []
    }
  }

  async function reverseGeocode(lat: number, lon: number) {
    try {
      const data = await reverseGeocodeApi(lat, lon)
      const city = data.city || data.locality || data.principalSubdivision || '未知城市'
      return city
    }
    catch (e) {
      return `${lon.toFixed(2)}, ${lat.toFixed(2)}`
    }
  }

  async function updateWeather() {
    loading.value = true
    weatherInfo.value.text = '正在获取'
    locationText.value = '定位中...'

    if (locationMode.value === 'coords') {
      cachedCoords.value = null
      const city = await reverseGeocode(customLat.value, customLon.value)
      locationText.value = city
      await fetchWeather(customLat.value, customLon.value)
      return
    }

    if (locationMode.value === 'city') {
      cachedCoords.value = null
      locationText.value = '定位中...'
      const trimmedCity = customCity.value.trim()
      if (!trimmedCity) {
        locationText.value = '城市名称为空'
        throw new Error('城市名称不能为空')
      }
      const results = await searchCities(customCity.value)
      if (results.length > 0) {
        const result = results[0]
        locationText.value = result.name
        await fetchWeather(result.latitude, result.longitude)
      }
      return
    }

    // Auto mode
    if (locationMode.value === 'auto' && cachedCoords.value) {
      const { lat, lon } = cachedCoords.value
      locationText.value = cachedCoords.value.city
      await fetchWeather(lat, lon)
      return
    }
    try {
      const coords = await getCurrentPosition(5000)
      const locationData = await reverseGeocodeApi(coords.latitude, coords.longitude)
      const cityName = locationData.city || locationData.locality || locationData.principalSubdivision || '未知城市'
      locationText.value = cityName
      cachedCoords.value = {
        lat: coords.latitude,
        lon: coords.longitude,
        city: cityName,
      }
      await fetchWeather(coords.latitude, coords.longitude)
    }
    catch (error) {
      try {
        locationText.value = '北京市 (默认)'
        const defaultCity = '北京市 (默认)'
        cachedCoords.value = {
          lat: 39.9,
          lon: 116.4,
          city: defaultCity,
        }
        await fetchWeather(39.9, 116.4)
      }
      catch (err) {
        weatherInfo.value.text = '更新超时'
        loading.value = false
      }
    }
  }

  // 模式切换同步清理
  watch(locationMode, (newMode) => {
    if (newMode === 'auto') {
      cachedCoords.value = null
      locationText.value = '定位中...'
    }
  }, { flush: 'sync' })

  return {
    // Persistent
    locationMode,
    customLat,
    customLon,
    customCity,
    refreshInterval,
    showRainEffect,
    showThunderEffect,
    showSnowEffect,
    // Runtime
    weatherData,
    loading,
    locationText,
    weatherInfo,
    // Actions
    updateWeather,
    searchCities,
  }
}, {
  persist: {
    pick: [
      'locationMode',
      'customLat',
      'customLon',
      'customCity',
      'refreshInterval',
      'showRainEffect',
      'showThunderEffect',
      'showSnowEffect',
    ],
  },
})
