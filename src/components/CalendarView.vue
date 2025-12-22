<script setup lang="ts">
import { ref, computed } from 'vue';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-vue-next';
import { getLunarDate } from '../utils/lunar';

const currentMonthDate = ref(new Date());
const today = ref(new Date());

const year = computed(() => currentMonthDate.value.getFullYear());
const month = computed(() => currentMonthDate.value.getMonth());

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const isCurrentMonth = computed(() => {
  return year.value === today.value.getFullYear() && month.value === today.value.getMonth();
});

const calendarDays = computed(() => {
  const y = year.value;
  const m = month.value;
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevMonthDays = new Date(y, m, 0).getDate();
  
  const days = [];
  
  // Prev month
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = new Date(y, m - 1, prevMonthDays - i);
    days.push({ date: d, isOtherMonth: true, lunar: getLunarDate(d) });
  }
  
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(y, m, i);
    days.push({ 
      date: d, 
      isOtherMonth: false, 
      isToday: d.toDateString() === today.value.toDateString(),
      lunar: getLunarDate(d) 
    });
  }
  
  // Next month
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(y, m + 1, i);
    days.push({ date: d, isOtherMonth: true, lunar: getLunarDate(d) });
  }
  
  return days;
});

function changeMonth(delta: number) {
  const d = new Date(currentMonthDate.value);
  d.setMonth(d.getMonth() + delta);
  currentMonthDate.value = d;
}

function goToToday() {
  today.value = new Date();
  currentMonthDate.value = new Date();
}

function refreshToday() {
  today.value = new Date();
  // 如果当前正在看“今天”所在的月份，则确保视图也是最新的
  if (isCurrentMonth.value) {
    currentMonthDate.value = new Date();
  }
}

defineExpose({ refreshToday });
</script>

<template>
  <div class="full-screen-calendar text-white">
    <div class="flex items-center justify-between w-full mb-8 px-4 md:px-12">
      <div class="text-left">
        <h2 class="text-4xl md:text-5xl font-bold tracking-widest">{{ year }}年{{ month + 1 }}月</h2>
        <p class="text-lg opacity-50 tracking-[0.4em] uppercase mt-1">{{ monthNames[month] }}</p>
      </div>
      <div class="flex items-center gap-4">
        <button 
          @click="goToToday" 
          class="p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all duration-500"
          :class="{ 'opacity-0 pointer-events-none': isCurrentMonth, 'opacity-100': !isCurrentMonth }"
        >
          <RotateCcw class="w-8 h-8 md:w-10 md:h-10" />
        </button>
        <button @click="changeMonth(-1)" class="p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all duration-300">
          <ChevronLeft class="w-8 h-8 md:w-10 md:h-10" />
        </button>
        <button @click="changeMonth(1)" class="p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all duration-300">
          <ChevronRight class="w-8 h-8 md:w-10 md:h-10" />
        </button>
      </div>
    </div>

    <div class="flex-1 flex flex-col w-full">
      <div class="grid grid-cols-7 mb-2">
        <div v-for="d in ['日', '一', '二', '三', '四', '五', '六']" :key="d" class="calendar-header-day text-xl font-bold">
          {{ d }}
        </div>
      </div>
      <div class="calendar-grid">
        <div 
          v-for="(day, index) in calendarDays" 
          :key="index"
          class="calendar-day"
          :class="{ 'other-month': day.isOtherMonth, 'today': day.isToday }"
        >
          <div class="day-number-wrapper flex flex-col items-center justify-center transition-all duration-300">
            <span class="text-2xl md:text-3xl font-bold">{{ day.date.getDate() }}</span>
            <span class="lunar-text text-sm opacity-60 font-light mt-1">{{ day.lunar.date }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.full-screen-calendar {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  box-sizing: border-box;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr);
  grid-gap: 1px; /* iOS 12.1+ Fallback */
  gap: 1px;
  flex: 1;
  overflow: hidden;
}

.calendar-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  position: relative;
  min-height: 0;
}

.calendar-day.today .day-number-wrapper {
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 1);
}

.calendar-day.other-month {
  opacity: 0.2;
}

.calendar-header-day {
  text-align: center;
  padding: 10px 0;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .calendar-day.today .day-number-wrapper {
    width: 60px;
    height: 60px;
  }
}
</style>
