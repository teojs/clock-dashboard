<script setup lang="ts">
import type { CitySearchResult, LocationMode } from '../stores/weather'
import { RefreshCw, Save, X } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { useWeatherStore } from '../stores/weather'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['close'])

const weatherStore = useWeatherStore()
const { loading } = storeToRefs(weatherStore)

const draft = ref({
  locationMode: weatherStore.locationMode,
  customLat: weatherStore.customLat,
  customLon: weatherStore.customLon,
  customCity: weatherStore.customCity,
  refreshInterval: weatherStore.refreshInterval,
  showRainEffect: weatherStore.showRainEffect,
  showThunderEffect: weatherStore.showThunderEffect,
  showSnowEffect: weatherStore.showSnowEffect,
})

const citySearchQuery = ref('')
const citySearchResults = ref<CitySearchResult[]>([])
const citySearchLoading = ref(false)
const showSearchResults = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null
let currentSearchId = 0

watch(() => props.show, (isShowing) => {
  if (isShowing) {
    draft.value = {
      locationMode: weatherStore.locationMode,
      customLat: weatherStore.customLat,
      customLon: weatherStore.customLon,
      customCity: weatherStore.customCity,
      refreshInterval: weatherStore.refreshInterval,
      showRainEffect: weatherStore.showRainEffect,
      showThunderEffect: weatherStore.showThunderEffect,
      showSnowEffect: weatherStore.showSnowEffect,
    }
    citySearchQuery.value = draft.value.customCity || ''
    citySearchResults.value = []
    showSearchResults.value = false
  }
})

watch(() => draft.value.locationMode, (newMode) => {
  if (newMode !== 'city') {
    citySearchQuery.value = ''
    citySearchResults.value = []
    showSearchResults.value = false
  }
})

async function handleCitySearch() {
  const query = citySearchQuery.value.trim()

  if (searchTimeout) {
    clearTimeout(searchTimeout)
    searchTimeout = null
  }

  if (!query) {
    citySearchResults.value = []
    showSearchResults.value = false
    citySearchLoading.value = false
    return
  }

  currentSearchId++
  const searchId = currentSearchId

  searchTimeout = setTimeout(async () => {
    if (searchId !== currentSearchId) {
      return
    }

    if (citySearchQuery.value.trim() !== query) {
      return
    }

    citySearchLoading.value = true
    showSearchResults.value = true
    try {
      const results = await weatherStore.searchCities(query)
      if (searchId === currentSearchId && citySearchQuery.value.trim() === query) {
        citySearchResults.value = results
      }
    }
    catch (e) {
      if (searchId === currentSearchId) {
        citySearchResults.value = []
      }
    }
    finally {
      if (searchId === currentSearchId) {
        citySearchLoading.value = false
      }
    }
  }, 500)
}

function selectCity(result: CitySearchResult) {
  draft.value.customCity = result.name
  citySearchQuery.value = result.name
  citySearchResults.value = []
  showSearchResults.value = false
  weatherStore.$patch({
    customLat: result.latitude,
    customLon: result.longitude,
  })
}

function handleSearchBlur() {
  setTimeout(() => {
    showSearchResults.value = false
  }, 200)
}

function handleSaveAndClose() {
  weatherStore.$patch({
    locationMode: draft.value.locationMode,
    customLat: draft.value.customLat,
    customLon: draft.value.customLon,
    customCity: draft.value.customCity,
    refreshInterval: draft.value.refreshInterval,
    showRainEffect: draft.value.showRainEffect,
    showThunderEffect: draft.value.showThunderEffect,
    showSnowEffect: draft.value.showSnowEffect,
  })

  emit('close')
  weatherStore.updateWeather()
}

async function handleManualRefresh() {
  weatherStore.$patch({
    locationMode: draft.value.locationMode,
    customLat: draft.value.customLat,
    customLon: draft.value.customLon,
    customCity: draft.value.customCity,
  })

  await weatherStore.updateWeather()
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[100] flex items-center justify-center p-4"
    @touchstart.stop
    @touchend.stop
    @mousedown.stop
    @mouseup.stop
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/80" @click="$emit('close')" />

    <!-- Modal Content -->
    <div class="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-3xl p-8 text-white overflow-y-auto max-h-[90vh]">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-3xl font-medium tracking-wide">
          天气设置
        </h2>
        <button class="p-2 hover:bg-white/10 rounded-full transition-colors" @click="$emit('close')">
          <X class="w-6 h-6" />
        </button>
      </div>

      <div class="space-y-8">
        <!-- Location Mode -->
        <section>
          <h3 class="text-white/50 mb-4 uppercase tracking-widest text-sm font-medium">
            位置获取方式
          </h3>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="mode in ['auto', 'coords', 'city']"
              :key="mode"
              class="p-2 rounded-xl border transition-all text-center"
              :class="draft.locationMode === mode ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 hover:bg-white/10'"
              @click="draft.locationMode = (mode as LocationMode)"
            >
              {{ mode === 'auto' ? '自动定位' : mode === 'coords' ? '经纬度' : '城市名' }}
            </button>
          </div>

          <!-- Conditional Inputs -->
          <div v-if="draft.locationMode === 'coords'" class="mt-4 grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-xs text-white/40 block ml-1">经度 (Longitude)</label>
              <input v-model.number="draft.customLon" type="number" step="0.0001" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30">
            </div>
            <div class="space-y-2">
              <label class="text-xs text-white/40 block ml-1">纬度 (Latitude)</label>
              <input v-model.number="draft.customLat" type="number" step="0.0001" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30">
            </div>
            <div class="space-y-2 text-xs text-white/40 flex items-center col-span-2">
              获取经纬度 :
              <a href="https://lbs.baidu.com/maptool/getpoint" target="_blank" class="text-blue-500 ml-1">https://lbs.baidu.com/maptool/getpoint</a>
            </div>
          </div>
          <div v-if="draft.locationMode === 'city'" class="mt-4 space-y-2 relative">
            <label class="text-xs text-white/40 block ml-1">城市名称 (例如: 北京、纽约、London、Tokyo)</label>
            <div class="relative">
              <input
                v-model="citySearchQuery"
                type="text"
                placeholder="输入城市名称（支持中英文）"
                class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30 placeholder:text-white/20"
                @input="handleCitySearch"
                @focus="showSearchResults = citySearchResults.length > 0"
                @blur="handleSearchBlur"
              >
              <div
                v-if="citySearchLoading"
                class="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <RefreshCw class="w-4 h-4 animate-spin text-white/40" />
              </div>
            </div>
            <div
              v-if="showSearchResults && citySearchResults.length > 0"
              class="absolute z-10 w-full mt-2 bg-neutral-800 border border-white/10 rounded-xl overflow-hidden shadow-lg"
            >
              <div
                v-for="(result, index) in citySearchResults"
                :key="index"
                class="px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 last:border-b-0"
                @mousedown.prevent="selectCity(result)"
              >
                <div class="text-white font-medium">
                  {{ result.name }}
                </div>
                <div class="text-xs text-white/50 mt-1 line-clamp-1">
                  {{ result.displayName }}
                </div>
              </div>
            </div>
            <div
              v-if="showSearchResults && !citySearchLoading && citySearchResults.length === 0 && citySearchQuery.trim()"
              class="absolute z-10 w-full mt-2 bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white/50 text-sm"
            >
              未找到相关城市
            </div>
          </div>
        </section>

        <!-- Refresh Interval -->
        <section>
          <h3 class="text-white/50 mb-4 uppercase tracking-widest text-sm font-medium">
            天气更新频率
          </h3>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="time in [5, 10, 20, 30]"
              :key="time"
              class="py-2 px-1 rounded-xl border transition-all text-center text-sm"
              :class="draft.refreshInterval === time ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 hover:bg-white/10'"
              @click="draft.refreshInterval = time"
            >
              {{ time }}分
            </button>
          </div>
        </section>

        <!-- Effects Toggles -->
        <section>
          <h3 class="text-white/50 mb-4 uppercase tracking-widest text-sm font-medium">
            天气特效显示
          </h3>
          <div class="grid grid-cols-3 gap-3">
            <div
              class="flex items-center justify-center p-2 rounded-xl cursor-pointer transition-all duration-300 text-center border"
              :class="draft.showRainEffect ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 hover:bg-white/10'"
              @click="draft.showRainEffect = !draft.showRainEffect"
            >
              <span class="text-base">下雨</span>
            </div>

            <div
              class="flex items-center justify-center p-2 rounded-xl cursor-pointer transition-all duration-300 text-center border"
              :class="draft.showThunderEffect ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 hover:bg-white/10'"
              @click="draft.showThunderEffect = !draft.showThunderEffect"
            >
              <span class="text-base">打雷</span>
            </div>

            <div
              class="flex items-center justify-center p-2 rounded-xl cursor-pointer transition-all duration-300 text-center border"
              :class="draft.showSnowEffect ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 hover:bg-white/10'"
              @click="draft.showSnowEffect = !draft.showSnowEffect"
            >
              <span class="text-base">下雪</span>
            </div>
          </div>
        </section>

        <!-- Action Buttons -->
        <div class="flex gap-4 pt-4">
          <button
            class="flex items-center justify-center gap-2 p-4 px-6 rounded-2xl bg-white/10 hover:bg-white/20 transition-all font-medium"
            :disabled="loading"
            @click="handleManualRefresh"
          >
            <RefreshCw class="w-5 h-5" :class="{ 'animate-spin': loading }" />
            立即刷新天气
          </button>
          <button
            class="flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl bg-white text-black font-bold hover:bg-opacity-90 transition-all"
            @click="handleSaveAndClose"
          >
            <Save class="w-5 h-5" />
            保存并关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
