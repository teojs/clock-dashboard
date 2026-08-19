<script setup lang="ts">
import { useIdle } from '@vueuse/core'
import { Settings } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Digit from '../components/Digit.vue'
import Weather from '../components/Weather.vue'
import { useTime } from '../hooks/useTime'
import { useConfigStore } from '../stores/config'

const configStore = useConfigStore()
const { clockConfig, layoutConfig, showDrawer, activeTab } = storeToRefs(configStore)
const { locale } = useI18n()

const { h1, h2, m1, m2, s1, s2, lunar, now } = useTime({
  is24Hour: computed(() => clockConfig.value.is24Hour),
})

function openSettings() {
  activeTab.value = 'general'
  showDrawer.value = true
}

function toggleSeconds() {
  clockConfig.value.showSeconds = !clockConfig.value.showSeconds
}

const weekdayLabel = computed(() => {
  const formatter = new Intl.DateTimeFormat(locale.value, { weekday: 'long' })
  return formatter.format(now.value)
})

const yearMonthLabel = computed(() => {
  const date = now.value
  if (locale.value === 'en-US') {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${month}-${date.getFullYear()}`
  }
  const formatter = new Intl.DateTimeFormat(locale.value, { year: 'numeric', month: 'long' })
  return formatter.format(date)
})

const showLunar = computed(() => locale.value !== 'en-US' && layoutConfig.value.showLunar)
const showFestival = computed(() => locale.value !== 'en-US' && layoutConfig.value.showFestival)

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
    class="glass-panel relative h-full flex flex-col items-center justify-center text-white w-full overflow-y-auto overflow-x-hidden"
    :class="{ 'clock-only-mode': layoutConfig.clockOnlyMode }"
    @click.stop="showSettingsButton = !showSettingsButton"
  >
    <!-- 设置按钮 -->
    <button
      :class="{ 'opacity-0': !showSettingsButton }"
      class="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 hover:rotate-90" @click="openSettings"
    >
      <Settings class="w-6 h-6 text-white" />
    </button>

    <!-- 日期与农历 -->
    <div v-if="!layoutConfig.clockOnlyMode" class="flex flex-col sm:flex-row items-center md:items-start w-full justify-center">
      <div class="flex items-center">
        <div class="date-day-big">
          {{ now.getDate() }}
        </div>
        <div class="flex flex-col mr-[8vh]">
          <span class="weekday-label">
            {{ weekdayLabel }}
          </span>
          <span class="year-label">
            {{ yearMonthLabel }}
          </span>
        </div>
        <div v-if="showLunar || (showFestival && lunar.festival)" class="flex flex-col">
          <div v-if="showLunar" class="lunar-date-label">
            {{ lunar.date }}<span v-if="showFestival && lunar.festival">·{{ lunar.festival }}</span>
          </div>
          <div v-else class="lunar-date-label">
            {{ lunar.festival }}
          </div>
          <span v-if="showLunar" class="lunar-year-label">{{ lunar.year }}({{ lunar.yearShengxiao }})年{{ lunar.month }}月</span>
        </div>
      </div>
    </div>

    <!-- 时钟显示 -->
    <div
      class="clock-display tabular-nums cursor-pointer transition-all duration-500"
      :class="{ 'with-seconds': clockConfig.showSeconds }"
      :style="{
        'color': clockConfig.color,
        'fontWeight': clockConfig.fontWeight,
        'opacity': clockConfig.opacity,
        '--digit-spacing': `${clockConfig.digitSpacing ?? -0.18}em`,
      }"
      @click.stop.prevent="toggleSeconds"
    >
      <Digit
        v-if="clockConfig.is24Hour || h1 !== 0"
        :value="h1" :show-seconds="clockConfig.showSeconds" :enable-tilt="clockConfig.enableTilt"
        :trigger="clockConfig.showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)"
        :delay="(5 - baseDelay) * 100"
        class="opacity-95"
      />
      <Digit
        :value="h2" :show-seconds="clockConfig.showSeconds" :enable-tilt="clockConfig.enableTilt"
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

      <Digit
        :value="m1" :show-seconds="clockConfig.showSeconds" :enable-tilt="clockConfig.enableTilt"
        :trigger="clockConfig.showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)"
        :delay="(3 - baseDelay) * 100"
        class="opacity-95"
      />
      <Digit
        :value="m2" :show-seconds="clockConfig.showSeconds" :enable-tilt="clockConfig.enableTilt"
        :trigger="clockConfig.showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)"
        :delay="(2 - baseDelay) * 100"
        class="opacity-95 brightness"
      />

      <template v-if="clockConfig.showSeconds">
        <div
          class="clock-separator second-separator"
          :style="{ opacity: clockConfig.opacity * 0.7 }"
        >
          :
        </div>
        <Digit
          class="second-digit opacity-60" :value="s1" :show-seconds="clockConfig.showSeconds"
          :trigger="now.getTime()"
          :delay="100"
          :enable-tilt="clockConfig.enableTilt"
        />
        <Digit
          class="second-digit brightness opacity-60" :value="s2" :show-seconds="clockConfig.showSeconds"
          :trigger="now.getTime()"
          :delay="0"
          :enable-tilt="clockConfig.enableTilt"
        />
      </template>
    </div>

    <!-- 天气展示 -->
    <Weather v-if="!layoutConfig.clockOnlyMode" />
  </div>
</template>

<style scoped>
.glass-panel {
  max-width: 150vh;
  margin: 0 auto;
}

.glass-panel.clock-only-mode {
  max-width: 100vw;
}

.date-day-big {
  font-size: 16vh;
  line-height: 1.1;
  font-weight: 800;
  background: linear-gradient(to bottom, #ffffff, rgba(255, 255, 255, 0.7));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-right: 2vh;
}

.weekday-label {
  font-size: 6vh;
  letter-spacing: 0.2em;
  line-height: 1.1;
  opacity: 0.9;
}

.year-label {
  font-size: 4.6vh;
  letter-spacing: 0.2em;
  line-height: 1.1;
  opacity: 0.8;
  margin-top: 0.5vh;
}

.lunar-date-label {
  font-size: 6vh;
  letter-spacing: 0.2em;
  line-height: 1.1;
  opacity: 0.9;
}

.lunar-year-label {
  font-size: 4.6vh;
  letter-spacing: 0.2em;
  line-height: 1.1;
  opacity: 0.8;
  margin-top: 0.5vh;
}

.clock-display {
  display: flex;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: center;
  justify-content: center;
  font-family: 'SFCompactRounded', 'Huninn', sans-serif;
  font-size: 54vh;
  margin-top: 6vh;
  margin-bottom: 6vh;
}

.clock-display.with-seconds {
  font-size: 38vh;
}

.clock-only-mode .clock-display {
  font-size: 44vw;
  margin-top: 0;
  margin-bottom: 0;
}

.clock-only-mode .clock-display.with-seconds {
  font-size: 30vw;
  margin-top: 0;
  margin-bottom: 0;
}

.clock-separator {
  font-size: 95%;
  opacity: 0.98;
  text-align: center;
  margin: 0 -0.08em;
  display: flex;
  justify-content: center;
  line-height: 0.8em;
  position: relative;
  top: -0.05em;
  z-index: 10;
  filter: brightness(1.8);
}

.brightness {
  filter: brightness(1.25);
}
</style>
