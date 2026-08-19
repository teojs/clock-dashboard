<script setup lang="ts">
import type { CitySearchResult } from '../../api/types'
import type { LocationMode, WeatherDataSource } from '../../stores/weather'
import {
  Droplets,
  Leaf,
  PersonStanding,
  RefreshCw,
  Sun,
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWeatherStore } from '../../stores/weather'

const weatherStore = useWeatherStore()
const { loading: weatherLoading } = storeToRefs(weatherStore)
const { t } = useI18n()

const weatherDraft = ref({
  locationMode: weatherStore.locationMode,
  customLat: weatherStore.customLat,
  customLon: weatherStore.customLon,
  customCity: weatherStore.customCity,
  refreshInterval: weatherStore.refreshInterval,
  showRainEffect: weatherStore.showRainEffect,
  showThunderEffect: weatherStore.showThunderEffect,
  showSnowEffect: weatherStore.showSnowEffect,
  dataSource: weatherStore.dataSource,
  qweatherKey: weatherStore.qweatherKey,
  qweatherHost: weatherStore.qweatherHost,
})

const citySearchQuery = ref('')
const citySearchResults = ref<CitySearchResult[]>([])
const citySearchLoading = ref(false)
const showSearchResults = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null
let currentSearchId = 0

async function handleCitySearch() {
  const query = citySearchQuery.value.trim()
  if (searchTimeout) clearTimeout(searchTimeout)
  if (!query) {
    citySearchResults.value = []
    showSearchResults.value = false
    citySearchLoading.value = false
    return
  }

  currentSearchId++
  const searchId = currentSearchId
  searchTimeout = setTimeout(async () => {
    if (searchId !== currentSearchId) return
    citySearchLoading.value = true
    showSearchResults.value = true
    try {
      const results = await weatherStore.searchCities(query)
      if (searchId === currentSearchId) citySearchResults.value = results
    }
    catch (e) {
      if (searchId === currentSearchId) citySearchResults.value = []
    }
    finally {
      if (searchId === currentSearchId) citySearchLoading.value = false
    }
  }, 500)
}

function selectCity(result: CitySearchResult) {
  weatherDraft.value.customCity = result.name
  citySearchQuery.value = result.name
  citySearchResults.value = []
  showSearchResults.value = false
  weatherStore.$patch({
    customLat: result.latitude,
    customLon: result.longitude,
  })
}

async function handleManualRefresh() {
  weatherStore.$patch({
    locationMode: weatherDraft.value.locationMode,
    customLat: weatherDraft.value.customLat,
    customLon: weatherDraft.value.customLon,
    customCity: weatherDraft.value.customCity,
    dataSource: weatherDraft.value.dataSource,
    qweatherKey: weatherDraft.value.qweatherKey,
    qweatherHost: weatherDraft.value.qweatherHost,
  })
  await weatherStore.updateWeather()
}

function handleSearchBlur() {
  setTimeout(() => {
    showSearchResults.value = false
  }, 200)
}

function save() {
  weatherStore.$patch({
    locationMode: weatherDraft.value.locationMode,
    customLat: weatherDraft.value.customLat,
    customLon: weatherDraft.value.customLon,
    customCity: weatherDraft.value.customCity,
    refreshInterval: weatherDraft.value.refreshInterval,
    showRainEffect: weatherDraft.value.showRainEffect,
    showThunderEffect: weatherDraft.value.showThunderEffect,
    showSnowEffect: weatherDraft.value.showSnowEffect,
    dataSource: weatherDraft.value.dataSource,
    qweatherKey: weatherDraft.value.qweatherKey,
    qweatherHost: weatherDraft.value.qweatherHost,
  })
  weatherStore.updateWeather()
}

function reset() {
  weatherDraft.value = {
    locationMode: weatherStore.locationMode,
    customLat: weatherStore.customLat,
    customLon: weatherStore.customLon,
    customCity: weatherStore.customCity,
    refreshInterval: weatherStore.refreshInterval,
    showRainEffect: weatherStore.showRainEffect,
    showThunderEffect: weatherStore.showThunderEffect,
    showSnowEffect: weatherStore.showSnowEffect,
    dataSource: weatherStore.dataSource,
    qweatherKey: weatherStore.qweatherKey,
    qweatherHost: weatherStore.qweatherHost,
  }
  citySearchQuery.value = weatherDraft.value.customCity || ''
}

defineExpose({ save, reset })
</script>

<template>
  <div class="space-y-10 animate-fade-in">
    <section>
      <h4 class="text-white/60 mb-4 uppercase tracking-widest text-sm font-medium">
        {{ t('weatherSettings.dataSource') }}
      </h4>
      <div class="flex flex-wrap space-x-3">
        <button
          v-for="source in (['open-meteo', 'qweather'] as WeatherDataSource[])"
          :key="source"
          class="settings-tab-btn flex-1 whitespace-nowrap"
          :class="{ active: weatherDraft.dataSource === source }"
          @click="weatherDraft.dataSource = source"
        >
          {{ source === 'open-meteo' ? t('weatherSettings.openMeteo') : t('weatherSettings.qweather') }}
        </button>
      </div>

      <div v-if="weatherDraft.dataSource === 'qweather'" class="mt-4 space-y-4">
        <div class="space-y-2">
          <label class="text-xs text-white/40 block ml-1">{{ t('weatherSettings.qweatherKey') }}</label>
          <input
            v-model="weatherDraft.qweatherKey"
            type="password"
            autocomplete="off"
            :placeholder="t('weatherSettings.qweatherKeyPlaceholder')"
            class="settings-input placeholder:text-white/20"
          >
        </div>
        <div class="space-y-2">
          <label class="text-xs text-white/40 block ml-1">{{ t('weatherSettings.qweatherHost') }}</label>
          <input
            v-model="weatherDraft.qweatherHost"
            type="text"
            autocomplete="off"
            :placeholder="t('weatherSettings.qweatherHostPlaceholder')"
            class="settings-input placeholder:text-white/20"
          >
        </div>
        <p class="text-xs text-white/40 ml-1">
          {{ t('weatherSettings.qweatherHint') }}
          <a href="https://dev.qweather.com/" target="_blank" class="text-blue-500">https://dev.qweather.com/</a>
        </p>
      </div>
    </section>

    <section>
      <h4 class="text-white/60 mb-4 uppercase tracking-widest text-sm font-medium">
        {{ t('weatherSettings.locationMode') }}
      </h4>
      <div class="flex flex-wrap space-x-3">
        <button
          v-for="mode in ['auto', 'coords', 'city']"
          :key="mode"
          class="settings-tab-btn flex-1 whitespace-nowrap"
          :class="{ active: weatherDraft.locationMode === mode }"
          @click="weatherDraft.locationMode = (mode as LocationMode)"
        >
          {{ mode === 'auto' ? t('weatherSettings.auto') : mode === 'coords' ? t('weatherSettings.coords') : t('weatherSettings.city') }}
        </button>
      </div>

      <div v-if="weatherDraft.locationMode === 'coords'" class="mt-4 grid grid-cols-2 space-x-4">
        <div class="space-y-2">
          <label class="text-xs text-white/40 block ml-1">{{ t('weatherSettings.longitude') }}</label>
          <input v-model.number="weatherDraft.customLon" type="number" step="0.0001" class="settings-input">
        </div>
        <div class="space-y-2">
          <label class="text-xs text-white/40 block ml-1">{{ t('weatherSettings.latitude') }}</label>
          <input v-model.number="weatherDraft.customLat" type="number" step="0.0001" class="settings-input">
        </div>
        <div class="space-y-2 text-xs text-white/40 flex items-center col-span-2 mt-2 !ml-0">
          {{ t('weatherSettings.getCoords') }} :
          <a href="https://lbs.baidu.com/maptool/getpoint" target="_blank" class="text-blue-500 ml-1">https://lbs.baidu.com/maptool/getpoint</a>
        </div>
      </div>

      <div v-if="weatherDraft.locationMode === 'city'" class="mt-4 space-y-2 relative">
        <label class="text-xs text-white/40 block ml-1">{{ t('weatherSettings.cityNameLabel') }}</label>
        <div class="relative">
          <input
            v-model="citySearchQuery"
            type="text"
            :placeholder="t('weatherSettings.cityPlaceholder')"
            class="settings-input pr-12 placeholder:text-white/20"
            @input="handleCitySearch"
            @focus="showSearchResults = citySearchResults.length > 0"
            @blur="handleSearchBlur"
          >
          <div v-if="citySearchLoading" class="absolute right-4 top-1/2 -translate-y-1/2">
            <RefreshCw class="w-4 h-4 animate-spin text-white/40" />
          </div>
        </div>
        <Transition name="fade">
          <div v-if="showSearchResults && citySearchResults.length > 0" class="absolute z-10 w-full mt-2 bg-neutral-800 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div
              v-for="(result, index) in citySearchResults"
              :key="index"
              class="px-5 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-b-0"
              @mousedown.prevent="selectCity(result)"
            >
              <div class="text-white font-medium text-sm">
                {{ result.name }}
              </div>
              <div class="text-[10px] text-white/40 mt-1 truncate">
                {{ result.displayName }}
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </section>

    <section>
      <h4 class="text-white/60 mb-4 uppercase tracking-widest text-sm font-medium">
        {{ t('weatherSettings.refreshRate') }}
      </h4>
      <div class="flex flex-wrap space-x-2">
        <button
          v-for="time in [5, 10, 20, 30]"
          :key="time"
          class="settings-tab-btn flex-1 whitespace-nowrap"
          :class="{ active: weatherDraft.refreshInterval === time }"
          @click="weatherDraft.refreshInterval = time"
        >
          {{ t('common.minutes', { count: time }) }}
        </button>
      </div>
    </section>

    <section>
      <h4 class="text-white/60 mb-4 uppercase tracking-widest text-sm font-medium">
        {{ t('weatherSettings.effects') }}
      </h4>
      <div class="space-y-4">
        <div
          class="settings-toggle-card"
          :class="{ active: weatherDraft.showRainEffect }"
          @click="weatherDraft.showRainEffect = !weatherDraft.showRainEffect"
        >
          <span class="font-medium">{{ t('weatherSettings.rainEffect') }}</span>
          <div class="toggle-switch">
            <div class="toggle-dot" />
          </div>
        </div>
        <div
          class="settings-toggle-card"
          :class="{ active: weatherDraft.showThunderEffect }"
          @click="weatherDraft.showThunderEffect = !weatherDraft.showThunderEffect"
        >
          <span class="font-medium">{{ t('weatherSettings.thunderEffect') }}</span>
          <div class="toggle-switch">
            <div class="toggle-dot" />
          </div>
        </div>
        <div
          class="settings-toggle-card"
          :class="{ active: weatherDraft.showSnowEffect }"
          @click="weatherDraft.showSnowEffect = !weatherDraft.showSnowEffect"
        >
          <span class="font-medium">{{ t('weatherSettings.snowEffect') }}</span>
          <div class="toggle-switch">
            <div class="toggle-dot" />
          </div>
        </div>
      </div>
    </section>

    <section>
      <h4 class="text-white/60 uppercase tracking-widest text-sm font-medium mb-4">
        {{ t('weatherSettings.iconLegend') }}
      </h4>
      <div class="grid grid-cols-2 bg-white/5 rounded-2xl p-4">
        <div class="flex items-center space-x-3 flex-1 whitespace-nowrap p-2">
          <Droplets class="w-5 h-5 text-blue-500/60 flex-shrink-0" />
          <span class="text-sm text-white/80">{{ t('weatherSettings.humidity') }}</span>
        </div>
        <div class="flex items-center space-x-3 flex-1 whitespace-nowrap p-2">
          <Leaf class="w-5 h-5 text-green-300/60 flex-shrink-0" />
          <span class="text-sm text-white/80">{{ weatherDraft.dataSource === 'qweather' ? t('weatherSettings.airQualityQweather') : t('weatherSettings.airQuality') }}</span>
        </div>
        <div class="flex items-center space-x-3 flex-1 whitespace-nowrap p-2">
          <PersonStanding class="w-5 h-5 text-orange-500/60 flex-shrink-0" />
          <span class="text-sm text-white/80">{{ t('weatherSettings.feelsLike') }}</span>
        </div>
        <div class="flex items-center space-x-3 flex-1 whitespace-nowrap p-2">
          <Sun class="w-5 h-5 text-purple-500/60 flex-shrink-0" />
          <span class="text-sm text-white/80">{{ t('weatherSettings.uv') }}</span>
        </div>
      </div>
    </section>

    <div class="pt-2">
      <button
        class="settings-secondary-btn w-full justify-center"
        :disabled="weatherLoading"
        @click="handleManualRefresh"
      >
        <div class="flex items-center space-x-2 justify-center">
          <RefreshCw class="w-4 h-4 mr-2" :class="{ 'animate-spin': weatherLoading }" /> {{ t('weatherSettings.refreshNow') }}
        </div>
      </button>
    </div>
  </div>
</template>
