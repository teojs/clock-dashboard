<script setup lang="ts">
import Digit from './Digit.vue';
import Weather from './Weather.vue';
import { useTime } from '../composables/useTime';

const { h1, h2, m1, m2, s1, s2, lunar, now, showSeconds } = useTime();

function toggleSeconds() {
  showSeconds.value = !showSeconds.value;
}
</script>

<template>
  <div class="glass-panel h-full p-4 md:p-8 flex flex-col items-center justify-evenly text-white w-full">
    <!-- 日期与农历 -->
    <div class="flex flex-col md:flex-row items-center md:items-start gap-6 w-full justify-center">
      <div class="flex items-center gap-4">
        <div class="date-day-big text-glow">{{ now.getDate() }}</div>
        <div class="flex flex-col mt-2">
          <span class="text-5xl tracking-[0.2em] opacity-90 uppercase">
            {{ now.toLocaleDateString('zh-CN', { weekday: 'long' }) }}
          </span>
          <span class="text-4xl tracking-[0.2em] font-light opacity-70 mt-1">
            {{ now.getFullYear() }}年{{ now.getMonth() + 1 }}月
          </span>
        </div>
      </div>
      <div class="hidden md:block w-px h-16 mx-16 self-center"></div>
      <div class="flex flex-col items-center md:items-start mt-5">
        <span class="text-5xl font-medium text-white/90 tracking-wider">{{ lunar.fullDate }}</span>
        <span class="text-4xl tracking-[0.2em] font-light opacity-70 mt-2">{{ lunar.year }}{{ lunar.month }}</span>
      </div>
    </div>

    <!-- 时钟显示 -->
    <div 
      class="clock-display text-glow tabular-nums mb-4 cursor-pointer transition-all duration-500" 
      :class="{ 'with-seconds': showSeconds }"
      @click="toggleSeconds"
    >
      <Digit :value="h1" :trigger="showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)" />
      <Digit :value="h2" :trigger="showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)" />
      
      <div class="clock-separator">:</div>
      
      <Digit :value="m1" :trigger="showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)" />
      <Digit :value="m2" :trigger="showSeconds ? now.getTime() : Math.floor(now.getTime() / 60000)" />
      
      <div v-if="showSeconds" class="clock-separator second-separator">:</div>
      
      <template v-if="showSeconds">
        <Digit class="second-digit" :value="s1" :trigger="now.getTime()" />
        <Digit class="second-digit" :value="s2" :trigger="now.getTime()" />
      </template>
    </div>

    <!-- 天气展示 -->
    <Weather />
  </div>
</template>

<style scoped>
.glass-panel {
  max-width: 1200px;
}

.date-day-big {
  font-size: 8rem; /* iOS 12 Fallback: 约 80px */
  line-height: 1;
  font-weight: 800;
  background: linear-gradient(to bottom, #ffffff, #666666);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.clock-display {
  display: flex;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: center;
  justify-content: center;
  font-family:  'Huninn', sans-serif;
  font-size: 35vw; /* iOS 12 Fallback 1: 响应式比例 */
  font-size: 22rem; /* iOS 12 Fallback 2: 强制大字号 */
  font-size: clamp(10rem, 35vw, 25rem);
  font-weight: 1000;
  line-height: 1.1;
  -webkit-text-stroke: 2px white; /* 恢复适中的描边加粗 */
}

.clock-display.with-seconds {
  font-size: 28vw; /* iOS 12 Fallback 1 */
}

.clock-separator {
  opacity: 1;
  text-align: center;
  margin: 0 -0.1em; /* 适当重叠，但比数字间距小 */
  font-weight: 700;
  display: flex;
  justify-content: center;
  line-height: 1;
  position: relative;
  top: -0.05em; /* 稍微上移一点，视觉上更垂直居中 */
}

.second-separator, .second-digit {
  opacity: 0.6;
}
</style>
