import type { CitySearchResult } from '../api/types'
import type { WeatherInfo } from '../types'
import { defineStore, storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { searchCities as searchCitiesApi } from '../api/geocoding'
import { getCurrentPosition, reverseGeocode as reverseGeocodeApi } from '../api/location'
import { fetchQweatherAirQualityData, fetchQweatherWeatherData } from '../api/qweather'
import { fetchAirQualityData, fetchWeatherData } from '../api/weather'
import { i18n } from '../i18n'
import { mapWmoCode } from '../utils/weather'
import { useConfigStore } from './config'

export type LocationMode = 'auto' | 'coords' | 'city'
export type WeatherDataSource = 'open-meteo' | 'qweather'

export const useWeatherStore = defineStore('weather', () => {
  const configStore = useConfigStore()
  const { language } = storeToRefs(configStore)

  // --- Persistent State ---
  const locationMode = ref<LocationMode>('auto')
  const customLat = ref(39.9)
  const customLon = ref(116.4)
  const customCity = ref('北京市')
  const refreshInterval = ref(20)
  const showRainEffect = ref(true)
  const showThunderEffect = ref(true)
  const showSnowEffect = ref(true)
  const dataSource = ref<WeatherDataSource>('open-meteo')
  const qweatherKey = ref('')
  const qweatherHost = ref('')

  // --- Runtime State ---
  const weatherData = ref<any>(null)
  const airQualityData = ref<any>(null)
  const loading = ref(false)
  const locationText = ref(i18n.global.t('weather.status.locating'))
  const weatherInfo = ref<WeatherInfo>({ text: i18n.global.t('weather.status.loading'), icon: mapWmoCode(-1).icon })
  const cachedCoords = ref<{ lat: number, lon: number, city: string } | null>(null)

  async function fetchWeather(lat: number, lon: number) {
    try {
      const useQweather = dataSource.value === 'qweather'
      const qweatherOptions = {
        key: qweatherKey.value.trim(),
        host: qweatherHost.value.trim(),
        lang: language.value,
      }

      if (useQweather && (!qweatherOptions.key || !qweatherOptions.host)) {
        weatherData.value = null
        airQualityData.value = null
        weatherInfo.value.text = i18n.global.t('weather.status.missingKey')
        weatherInfo.value.icon = mapWmoCode(-1).icon
        return
      }

      const weatherPromise = (useQweather
        ? fetchQweatherWeatherData(lat, lon, qweatherOptions)
        : fetchWeatherData(lat, lon))
        .then((wData) => {
          weatherData.value = wData
          weatherInfo.value = mapWmoCode(wData.current.weather_code, wData.current.is_day === 1)
        })
        .catch((error) => {
          console.error('Weather API error:', error)
          weatherInfo.value.text = i18n.global.t('weather.status.apiError')
          weatherInfo.value.icon = mapWmoCode(-1).icon
        })

      const aqiPromise = (useQweather
        ? fetchQweatherAirQualityData(lat, lon, qweatherOptions)
        : fetchAirQualityData(lat, lon))
        .then((aData) => {
          airQualityData.value = aData
        })
        .catch((error) => {
          console.error('Air Quality API error:', error)
        })

      await Promise.all([weatherPromise, aqiPromise])
    }
    catch (error) {
      console.error('Update weather failed:', error)
    }
    finally {
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

      const results = await searchCitiesApi(trimmedQuery, 3, language.value)
      if (results.length > 0) {
        return results.map((r) => {
          const rawName = r.address?.city || ''
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

  async function getCurrentCoords(): Promise<{ lat: number, lon: number }> {
    if (locationMode.value === 'coords') {
      return { lat: customLat.value, lon: customLon.value }
    }

    if (locationMode.value === 'city') {
      const results = await searchCities(customCity.value)
      if (results.length > 0) {
        return { lat: results[0].latitude, lon: results[0].longitude }
      }
      return { lat: 39.9, lon: 116.4 }
    }

    if (cachedCoords.value) {
      return { lat: cachedCoords.value.lat, lon: cachedCoords.value.lon }
    }

    return { lat: 39.9, lon: 116.4 }
  }

  async function reverseGeocode(lat: number, lon: number) {
    try {
      const data = await reverseGeocodeApi(lat, lon, language.value)
      const city = data.city || data.locality || data.principalSubdivision || i18n.global.t('weather.status.unknownCity')
      return city
    }
    catch (e) {
      return `${lon.toFixed(2)}, ${lat.toFixed(2)}`
    }
  }

  async function updateWeather() {
    loading.value = true
    weatherInfo.value.text = i18n.global.t('weather.status.loading')
    locationText.value = i18n.global.t('weather.status.locating')

    if (locationMode.value === 'coords') {
      cachedCoords.value = null
      const city = await reverseGeocode(customLat.value, customLon.value)
      locationText.value = city
      await fetchWeather(customLat.value, customLon.value)
      return
    }

    if (locationMode.value === 'city') {
      cachedCoords.value = null
      locationText.value = i18n.global.t('weather.status.locating')
      const trimmedCity = customCity.value.trim()
      if (!trimmedCity) {
        locationText.value = i18n.global.t('weather.status.cityEmpty')
        throw new Error(i18n.global.t('weather.status.cityEmpty'))
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
      const coords = await getCurrentPosition(5000, language.value)
      const locationData = await reverseGeocodeApi(coords.latitude, coords.longitude, language.value)
      const cityName = locationData.locality || locationData.city || locationData.principalSubdivision || i18n.global.t('weather.status.unknownCity')
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
        locationText.value = i18n.global.t('weather.status.defaultCity')
        const defaultCity = i18n.global.t('weather.status.defaultCity')
        cachedCoords.value = {
          lat: 39.9,
          lon: 116.4,
          city: defaultCity,
        }
        await fetchWeather(39.9, 116.4)
      }
      catch (err) {
        weatherInfo.value.text = i18n.global.t('weather.status.updateTimeout')
        loading.value = false
      }
    }
  }

  // 模式切换同步清理
  watch(locationMode, (newMode) => {
    if (newMode === 'auto') {
      cachedCoords.value = null
      locationText.value = i18n.global.t('weather.status.locating')
    }
  }, { flush: 'sync' })

  watch(() => i18n.global.locale.value, () => {
    if (weatherData.value?.current) {
      weatherInfo.value = mapWmoCode(weatherData.value.current.weather_code, weatherData.value.current.is_day === 1)
    }
    if (loading.value) {
      weatherInfo.value.text = i18n.global.t('weather.status.loading')
      locationText.value = i18n.global.t('weather.status.locating')
    }
  })

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
    dataSource,
    qweatherKey,
    qweatherHost,
    // Runtime
    weatherData,
    loading,
    locationText,
    weatherInfo,
    airQualityData,
    // Actions
    updateWeather,
    searchCities,
    getCurrentCoords,
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
      'dataSource',
      'qweatherKey',
      'qweatherHost',
    ],
  },
})
