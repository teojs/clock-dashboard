<script setup lang="ts">
import type { LunarInfo } from '../types'
import { X } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfigStore } from '../stores/config'

const props = defineProps<{
  show: boolean
  date: Date
  lunar: LunarInfo
}>()

defineEmits(['close'])

const { locale, t } = useI18n()
const { layoutConfig } = storeToRefs(useConfigStore())

const weekdayLabel = computed(() => {
  const formatter = new Intl.DateTimeFormat(locale.value, { weekday: 'long' })
  return formatter.format(props.date)
})

const dateLabel = computed(() => {
  const formatter = new Intl.DateTimeFormat(locale.value, { year: 'numeric', month: 'long', day: 'numeric' })
  return formatter.format(props.date)
})

const showLunar = computed(() => locale.value !== 'en-US' && layoutConfig.value.showLunar)
const showFestival = computed(() => locale.value !== 'en-US' && layoutConfig.value.showFestival)
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
    @touchstart.stop
    @touchend.stop
    @mousedown.stop
    @mouseup.stop
  >
    <!-- 背景遮罩 -->
    <div class="absolute inset-0 bg-black/80" @click="$emit('close')" />

    <!-- 弹窗内容 -->
    <div class="relative w-full max-w-xl bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden py-6">
      <button
        class="p-3 hover:bg-white/10 rounded-full transition-colors absolute top-2 right-2"
        @click="$emit('close')"
      >
        <X class="w-6 h-6" />
      </button>

      <div class="space-y-4 max-h-[80vh] overflow-y-auto px-6">
        <!-- 头部日期 -->
        <div class="text-2xl">
          {{ dateLabel }} · {{ weekdayLabel }}
        </div>

        <template v-if="showLunar">
          <!-- 农历信息 -->
          <div class="text-xl flex flex-wrap space-x-2">
            <span>
              {{ lunar.year }}({{ lunar.yearShengxiao }})年 {{ lunar.month }}({{ lunar.monthGanzhi }})月 {{ lunar.date }}({{ lunar.dayGanzhi }})日
            </span>
            <span v-if="showFestival && lunar.festival" class="text-blue-400">
              · {{ lunar.festival }}
            </span>
            <span v-if="lunar.holiday" :class="lunar.holiday === '休' ? 'text-red-400' : 'text-orange-400'">
              · {{ lunar.holiday }}
            </span>
          </div>

          <!-- 宜忌内容 -->
          <div class="grid grid-cols-2 border border-white/10 rounded-2xl">
            <div class="border-r border-white/10">
              <div class="text-center text-emerald-400 font-bold text-lg border-b border-white/10 bg-white/5 p-2 rounded-tl-2xl">
                {{ t('almanac.yi') }}
              </div>
              <div class="flex-1 flex flex-wrap p-2">
                <span v-for="item in lunar.yi" :key="item" class="text-md text-emerald-50/90 m-1">{{ item }}</span>
              </div>
            </div>

            <div class="border-l border-white/10">
              <div class="text-center text-red-400 font-bold text-lg border-b border-white/10 bg-white/5 p-2 rounded-tr-2xl">
                {{ t('almanac.ji') }}
              </div>
              <div class="flex-1 flex flex-wrap p-2">
                <span v-for="item in lunar.ji" :key="item" class="text-md text-red-50/90 m-1">{{ item }}</span>
              </div>
            </div>
          </div>

          <!-- 时辰吉凶 -->
          <div v-if="lunar.hours" class="border border-white/10 rounded-2xl">
            <div class="text-center text-white/80 text-lg border-b border-white/10 bg-white/5 rounded-t-2xl p-2">
              {{ t('almanac.hourlyLuck') }}
            </div>
            <div class="grid grid-cols-12 p-2 py-4">
              <div
                v-for="h in lunar.hours"
                :key="h.hour"
                class="flex items-center justify-center text-md text-emerald-50/90 tracking-widest"
                style="writing-mode: vertical-rl;"
              >
                <span>
                  {{ h.ganzhi }}
                </span>
                <span
                  class="font-bold mt-1"
                  :class="h.luck === '吉' ? 'text-emerald-400' : 'text-red-400'"
                >
                  {{ h.luck }}
                </span>
              </div>
            </div>
          </div>

          <!-- 彭祖百忌 -->
          <div v-if="lunar.pengzu" class="border border-white/10 rounded-2xl">
            <div class="text-center text-white/80 text-lg border-b border-white/10 bg-white/5 rounded-t-2xl p-2">
              {{ t('almanac.pengzu') }}
            </div>
            <div class="flex items-center justify-center text-center p-2 py-4 text-md text-emerald-50/90 tracking-widest space-x-3">
              <span v-for="item in lunar.pengzu" :key="item">
                {{ item }}
              </span>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
