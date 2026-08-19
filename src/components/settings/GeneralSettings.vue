<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfigStore } from '../../stores/config'

const configStore = useConfigStore()
const { language, layoutConfig } = storeToRefs(configStore)
const { t } = useI18n()

const layoutDraft = ref({
  ...layoutConfig.value,
  compactMode: layoutConfig.value.compactMode ?? false,
  showLunar: layoutConfig.value.showLunar ?? true,
  showFestival: layoutConfig.value.showFestival ?? true,
})

function toggleClockOnlyMode() {
  layoutDraft.value.clockOnlyMode = !layoutDraft.value.clockOnlyMode
  if (layoutDraft.value.clockOnlyMode)
    layoutDraft.value.compactMode = false
}

function toggleCompactMode() {
  layoutDraft.value.compactMode = !layoutDraft.value.compactMode
  if (layoutDraft.value.compactMode)
    layoutDraft.value.clockOnlyMode = false
}

function save() {
  layoutConfig.value = { ...layoutDraft.value }
}

function reset() {
  layoutDraft.value = { ...layoutConfig.value }
}

defineExpose({ save, reset })
</script>

<template>
  <div class="space-y-10 animate-fade-in">
    <section>
      <h4 class="text-white/60 mb-4 uppercase tracking-widest text-sm font-medium">
        {{ t('language.label') }} (beta)
      </h4>
      <div class="grid grid-cols-3 space-x-3">
        <button
          class="settings-tab-btn"
          :class="{ active: language === 'zh-CN' }"
          @click="language = 'zh-CN'"
        >
          {{ t('language.zhCN') }}
        </button>
        <button
          class="settings-tab-btn"
          :class="{ active: language === 'zh-TW' }"
          @click="language = 'zh-TW'"
        >
          {{ t('language.zhTW') }}
        </button>
        <button
          class="settings-tab-btn"
          :class="{ active: language === 'en-US' }"
          @click="language = 'en-US'"
        >
          {{ t('language.enUS') }}
        </button>
      </div>
    </section>

    <section class="space-y-4">
      <h4 class="text-white/60 mb-4 uppercase tracking-widest text-sm font-medium">
        {{ t('generalSettings.layout') }}
      </h4>
      <div
        class="settings-toggle-card"
        :class="{ active: layoutDraft.clockOnlyMode }"
        @click="toggleClockOnlyMode"
      >
        <span class="font-medium">{{ t('generalSettings.clockOnlyMode') }}</span>
        <div class="toggle-switch">
          <div class="toggle-dot" />
        </div>
      </div>
      <div
        class="settings-toggle-card"
        :class="{ active: layoutDraft.compactMode }"
        @click="toggleCompactMode"
      >
        <span class="font-medium">{{ t('generalSettings.compactMode') }}</span>
        <div class="toggle-switch">
          <div class="toggle-dot" />
        </div>
      </div>
      <div
        class="settings-toggle-card"
        :class="{ active: layoutDraft.showLunar }"
        @click="layoutDraft.showLunar = !layoutDraft.showLunar"
      >
        <span class="font-medium">{{ t('generalSettings.showLunar') }}</span>
        <div class="toggle-switch">
          <div class="toggle-dot" />
        </div>
      </div>
      <div
        class="settings-toggle-card"
        :class="{ active: layoutDraft.showFestival }"
        @click="layoutDraft.showFestival = !layoutDraft.showFestival"
      >
        <span class="font-medium">{{ t('generalSettings.showFestival') }}</span>
        <div class="toggle-switch">
          <div class="toggle-dot" />
        </div>
      </div>
    </section>
  </div>
</template>
