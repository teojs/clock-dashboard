<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import SmartHome from './components/SmartHome.vue';
import ClockWeather from './components/ClockWeather.vue';
import CalendarView from './components/CalendarView.vue';
import SettingsModal from './components/SettingsModal.vue';

const currentPage = ref(1);
const showSettings = ref(false);
const smartHomeRef = ref<any>(null);
const calendarRef = ref<any>(null);

let startX = 0;
let autoReturnTimer: number | null = null;

function resetAutoReturnTimer() {
  if (autoReturnTimer) {
    clearTimeout(autoReturnTimer);
    autoReturnTimer = null;
  }
  
  if (currentPage.value !== 1) {
    autoReturnTimer = window.setTimeout(() => {
      goToPage(1);
    }, 30000); // 30 seconds
  }
}

function goToPage(page: number) {
  currentPage.value = page;
  resetAutoReturnTimer();
  
  // 切换到智能首页 (page 0) 时更新状态
  if (page === 0 && smartHomeRef.value) {
    smartHomeRef.value.updateAllStates();
  }
  
  // 切换到日历看板 (page 2) 时更新当前日期
  if (page === 2 && calendarRef.value) {
    calendarRef.value.refreshToday();
  }
}

function handleTouchStart(e: TouchEvent) {
  startX = e.touches[0].clientX;
  resetAutoReturnTimer();
}

function handleTouchEnd(e: TouchEvent) {
  const endX = e.changedTouches[0].clientX;
  const diff = startX - endX;
  if (Math.abs(diff) > 50) {
    if (diff > 0 && currentPage.value < 2) goToPage(currentPage.value + 1);
    else if (diff < 0 && currentPage.value > 0) goToPage(currentPage.value - 1);
  }
}

function handleMouseDown(e: MouseEvent) {
  startX = e.clientX;
  resetAutoReturnTimer();
}

function handleMouseUp(e: MouseEvent) {
  const diff = startX - e.clientX;
  if (Math.abs(diff) > 50) {
    if (diff > 0 && currentPage.value < 2) goToPage(currentPage.value + 1);
    else if (diff < 0 && currentPage.value > 0) goToPage(currentPage.value - 1);
  }
}

function onSettingsSaved() {
  if (smartHomeRef.value) {
    smartHomeRef.value.updateAllStates();
  }
}

onMounted(() => {
  window.addEventListener('keydown', resetAutoReturnTimer);
  window.addEventListener('click', resetAutoReturnTimer);
});

onUnmounted(() => {
  window.removeEventListener('keydown', resetAutoReturnTimer);
  window.removeEventListener('click', resetAutoReturnTimer);
  if (autoReturnTimer) clearTimeout(autoReturnTimer);
});
</script>

<template>
  <div class="viewport-container overflow-hidden relative w-screen h-screen bg-black"
       @touchstart="handleTouchStart"
       @touchend="handleTouchEnd"
       @mousedown="handleMouseDown"
       @mouseup="handleMouseUp">
    
    <!-- Background Decoration -->
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl"></div>

    <!-- Main Slider -->
    <div 
      class="main-slider flex h-full transition-transform duration-700 cubic-bezier"
      :style="{ transform: `translateX(-${currentPage * 100}vw)`, width: '300vw' }"
    >
      <div class="slide-page w-[100vw] h-full flex items-center justify-center flex-shrink-0">
        <SmartHome ref="smartHomeRef" @open-settings="showSettings = true" />
      </div>
      <div class="slide-page w-[100vw] h-full flex items-center justify-center flex-shrink-0">
        <ClockWeather />
      </div>
      <div class="slide-page w-[100vw] h-full flex items-center justify-center flex-shrink-0">
        <CalendarView ref="calendarRef" />
      </div>
    </div>

    <!-- Navigation Dots -->
    <!-- <div class="nav-dots absolute bottom-10 left-0 right-0 flex justify-center gap-3 z-50">
      <div 
        v-for="i in [0, 1, 2]" 
        :key="i"
        class="nav-dot w-2 h-2 rounded-full cursor-pointer transition-all duration-300"
        :class="currentPage === i ? 'bg-white/80 scale-125' : 'bg-white/20'"
        @click="goToPage(i)"
      ></div>
    </div> -->

    <!-- Settings Modal -->
    <SettingsModal 
      :show="showSettings" 
      @close="showSettings = false" 
      @saved="onSettingsSaved"
    />
  </div>
</template>

<style scoped>
.cubic-bezier {
  transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
}
</style>
