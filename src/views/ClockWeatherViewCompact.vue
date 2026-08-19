<script setup lang="ts">
import { useIdle } from '@vueuse/core'
import { Settings } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DigitCompact from '../components/DigitCompact.vue'
import WeatherCompact from '../components/WeatherCompact.vue'
import { useTime } from '../hooks/useTime'
import { useConfigStore } from '../stores/config'

const configStore = useConfigStore()
const { clockConfig, layoutConfig, showDrawer, activeTab } = storeToRefs(configStore)
const { locale } = useI18n()

const { h1, h2, m1, m2, lunar, now } = useTime({
  is24Hour: computed(() => clockConfig.value.is24Hour),
})

function openSettings() {
  activeTab.value = 'general'
  showDrawer.value = true
}

const showLunar = computed(() => locale.value !== 'en-US' && layoutConfig.value.showLunar)
const showFestival = computed(() => locale.value !== 'en-US' && layoutConfig.value.showFestival)

const weekdayLabel = computed(() => {
  const weekday = locale.value === 'en-US' ? 'short' : 'long'
  const formatter = new Intl.DateTimeFormat(locale.value, { weekday })
  return formatter.format(now.value)
})

const monthLabel = computed(() => {
  const formatter = new Intl.DateTimeFormat(locale.value, { month: 'long' })
  return formatter.format(now.value)
})

const baseDelay = computed(() => {
  return clockConfig.value.showSeconds ? 0 : -2
})

/** 闲置时隐藏设置按钮 */
const showSettingsButton = ref(true)
const { idle } = useIdle(5 * 1000)
watch(idle, (newIdle) => {
  showSettingsButton.value = !newIdle
})
</script>

<template>
  <div
    class="compact-clock-weather-view relative h-full w-full text-white overflow-hidden"
    @click.stop="showSettingsButton = !showSettingsButton"
  >
    <button
      :class="{ 'opacity-0': !showSettingsButton }"
      class="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 hover:rotate-90" @click="openSettings"
    >
      <Settings class="w-6 h-6 text-white" />
    </button>

    <div class="grid grid-cols-[3fr_2fr] h-full w-full">
      <div class="flex h-full items-center justify-center pl-[2vw]">
        <div
          class="clock-display tabular-nums cursor-pointer transition-all duration-500"
          :style="{
            color: clockConfig.color,
            opacity: clockConfig.opacity,
          }"
        >
          <DigitCompact
            v-if="clockConfig.is24Hour || h1 !== 0"
            :value="h1" :show-seconds="clockConfig.showSeconds" :enable-tilt="false"
            :trigger="clockConfig.showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)"
            :delay="(5 - baseDelay) * 100"
            class="opacity-95"
          />
          <DigitCompact
            :value="h2" :show-seconds="clockConfig.showSeconds" :enable-tilt="false"
            :trigger="clockConfig.showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)"
            :delay="(4 - baseDelay) * 100"
            class="opacity-95"
            :class="[{
              brightness: clockConfig.is24Hour || (!clockConfig.is24Hour && h1 !== 0),
            }]"
          />

          <div class="clock-separator">
            :
          </div>

          <DigitCompact
            :value="m1" :show-seconds="clockConfig.showSeconds" :enable-tilt="false"
            :trigger="clockConfig.showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)"
            :delay="(3 - baseDelay) * 100"
            class="opacity-95"
          />
          <DigitCompact
            :value="m2" :show-seconds="clockConfig.showSeconds" :enable-tilt="false"
            :trigger="clockConfig.showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)"
            :delay="(2 - baseDelay) * 100"
            class="opacity-95 brightness"
          />
        </div>
      </div>

      <div class="flex h-full flex-col items-center justify-center min-w-0 gap-[4vh] py-[2vh]">
        <div class="flex flex-col items-center justify-center gap-[3vh]">
          <div class="text-[26vh] leading-none">
            {{ now.getDate() }}
          </div>
          <div class="flex gap-[1vw]">
            <span class="text-[8vh] leading-none">
              {{ monthLabel }}
            </span>
            <span class="text-[8vh] leading-none">
              {{ weekdayLabel }}
            </span>
          </div>
          <div v-if="showLunar" class="text-[4vh] leading-none tracking-widest">
            {{ lunar.year }}({{ lunar.yearShengxiao }})年{{ lunar.month }}月{{ lunar.date }}
          </div>
          <div v-if="showFestival && lunar.festival" class="text-[4vh] leading-none tracking-widest">
            {{ lunar.festival }}
          </div>
        </div>
        <WeatherCompact />
      </div>
    </div>
  </div>
</template>

<style scoped>
.compact-clock-weather-view {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Open Sans',
    'Helvetica Neue',
    sans-serif;
}

.clock-display {
  display: flex;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: center;
  justify-content: center;
  font-family: 'Roboto Flex Variable', 'SFCompactRounded', 'Huninn', sans-serif;
  font-size: min(58vw, 100vh);
  font-weight: 500;
  font-style: normal;
  font-stretch: 25%;
  font-variation-settings:
    'slnt' 0,
    'GRAD' 0,
    'XOPQ' 96,
    'XTRA' 468,
    'YOPQ' 79,
    'YTAS' 750,
    'YTDE' -203,
    'YTFI' 788,
    'YTLC' 514,
    'YTUC' 712;
  font-optical-sizing: auto;
}

.clock-separator {
  height: 100vh;
  line-height: 100vh;
  font-size: min(58vw, 100vh);
  opacity: 0.98;
  text-align: center;
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 10;
  filter: brightness(1.8);
  transform: translateY(-6vh);
}

.brightness {
  filter: brightness(1.25);
}
</style>
