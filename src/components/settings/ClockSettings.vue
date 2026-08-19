<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfigStore } from '../../stores/config'

const configStore = useConfigStore()
const { clockConfig } = storeToRefs(configStore)
const { t } = useI18n()

const clockDraft = ref({
  ...clockConfig.value,
  digitSpacing: clockConfig.value.digitSpacing ?? -0.18,
})
const presetColors = ['#ffffff', '#659FE8', '#EF7993', '#F2A666', '#8CDB92', '#68CDD7']

function save() {
  clockConfig.value = { ...clockDraft.value }
}

function reset() {
  clockDraft.value = { ...clockConfig.value }
}

defineExpose({ save, reset })
</script>

<template>
  <div class="space-y-10 animate-fade-in">
    <section>
      <h4 class="text-white/60 mb-4 uppercase tracking-widest text-sm font-medium">
        {{ t('clockSettings.color') }}
      </h4>
      <div class="grid grid-cols-7">
        <button
          v-for="color in presetColors" :key="color"
          class="w-10 h-10 rounded-full border-4 transition-all hover:scale-110 active:scale-90"
          :style="{ backgroundColor: color, borderColor: clockDraft.color === color ? 'white' : 'transparent' }"
          @click="clockDraft.color = color"
        />
        <div
          class="w-10 h-10 rounded-full border-2 transition-all overflow-hidden relative"
          :style="{
            background: 'linear-gradient(135deg, #07aeea 0%, #2bf598 100%)',
            borderColor: presetColors.includes(clockDraft.color) ? 'transparent' : 'white',
          }"
        >
          <input v-model="clockDraft.color" type="color" class="absolute inset-0 opacity-0 cursor-pointer">
        </div>
      </div>
    </section>

    <section>
      <div class="flex justify-between items-center mb-6">
        <h4 class="text-white/60 uppercase tracking-widest text-sm font-medium">
          {{ t('clockSettings.fontWeight') }}
        </h4>
        <span class="text-xs font-mono bg-white/10 px-2 py-1 rounded text-white/80">{{ clockDraft.fontWeight }}</span>
      </div>
      <input v-model.number="clockDraft.fontWeight" type="range" min="100" max="900" step="100" class="settings-range">
      <div class="flex justify-between mt-3 text-[10px] text-white/40 font-mono">
        <span v-for="w in [100, 200, 300, 400, 500, 600, 700, 800, 900]" :key="w">{{ w }}</span>
      </div>
    </section>

    <section>
      <div class="flex justify-between items-center mb-6">
        <h4 class="text-white/60 uppercase tracking-widest text-sm font-medium">
          {{ t('clockSettings.opacity') }}
        </h4>
        <span class="text-xs font-mono bg-white/10 px-2 py-1 rounded text-white/80">{{ clockDraft.opacity }}</span>
      </div>
      <input v-model.number="clockDraft.opacity" type="range" min="0.1" max="1" step="0.01" class="settings-range">
      <div class="flex justify-between mt-3 text-[10px] text-white/40 font-mono">
        <span>0.1</span>
        <span>0.5</span>
        <span>1.0</span>
      </div>
    </section>

    <section>
      <h4 class="text-white/60 uppercase tracking-widest text-sm font-medium mb-6">
        {{ t('clockSettings.digitSpacing') }}
      </h4>
      <input
        v-model.number="clockDraft.digitSpacing"
        type="range"
        min="-0.18"
        max="-0.08"
        step="0.01"
        class="settings-range"
      >
      <div class="flex justify-between mt-3 text-[10px] text-white/40 font-mono">
        <span>{{ t('clockSettings.digitSpacingSmall') }}</span>
        <span>{{ t('clockSettings.digitSpacingLarge') }}</span>
      </div>
    </section>

    <section class="space-y-4">
      <div
        class="settings-toggle-card"
        :class="{ active: clockDraft.showSeconds }"
        @click="clockDraft.showSeconds = !clockDraft.showSeconds"
      >
        <span class="font-medium">{{ t('clockSettings.showSeconds') }}</span>
        <div class="toggle-switch">
          <div class="toggle-dot" />
        </div>
      </div>
      <div
        class="settings-toggle-card"
        :class="{ active: clockDraft.is24Hour }"
        @click="clockDraft.is24Hour = !clockDraft.is24Hour"
      >
        <span class="font-medium">{{ t('clockSettings.twentyFourHour') }}</span>
        <div class="toggle-switch">
          <div class="toggle-dot" />
        </div>
      </div>
      <div
        class="settings-toggle-card"
        :class="{ active: clockDraft.enableTilt }"
        @click="clockDraft.enableTilt = !clockDraft.enableTilt"
      >
        <span class="font-medium">{{ t('clockSettings.tilt') }}</span>
        <div class="toggle-switch">
          <div class="toggle-dot" />
        </div>
      </div>
    </section>
  </div>
</template>
