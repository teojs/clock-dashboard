<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfigStore } from '../../stores/config'
import { clearWallpaper, compressImage, hasEnoughStorage, isVideoBlob, loadWallpaper, requestPersistentStorage, saveWallpaper } from '../../utils/wallpaper'

const configStore = useConfigStore()
const { language, layoutConfig, wallpaperConfig, wallpaperVersion } = storeToRefs(configStore)
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

const wallpaperDraft = ref({ ...wallpaperConfig.value })
/** 待保存的新图片；null 表示不变 */
const pendingBlob = ref<Blob | null>(null)
const pendingClear = ref(false)
const previewUrl = ref('')
const wallpaperError = ref<'' | 'read' | 'size'>('')
const previewIsVideo = ref(false)

function setPreview(blob: Blob | null) {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = blob ? URL.createObjectURL(blob) : ''
  previewIsVideo.value = blob ? isVideoBlob(blob) : false
}
onBeforeUnmount(() => setPreview(null))

async function loadPreview() {
  setPreview(await loadWallpaper())
}
loadPreview()

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  wallpaperError.value = ''
  try {
    if (file.type.startsWith('video/')) {
      if (!await hasEnoughStorage(file.size)) {
        wallpaperError.value = 'size'
        return
      }
      pendingBlob.value = file
    }
    else if (file.type.startsWith('image/')) {
      pendingBlob.value = await compressImage(file)
    }
    else {
      wallpaperError.value = 'read'
      return
    }
    pendingClear.value = false
    setPreview(pendingBlob.value)
    wallpaperDraft.value.enabled = true
  }
  catch {
    wallpaperError.value = 'read'
  }
}

function removeWallpaper() {
  pendingBlob.value = null
  pendingClear.value = true
  setPreview(null)
  wallpaperDraft.value.enabled = false
}

async function saveWallpaperDraft() {
  let changed = false
  try {
    if (pendingBlob.value) {
      requestPersistentStorage()
      await saveWallpaper(pendingBlob.value)
      changed = true
    }
    else if (pendingClear.value) {
      await clearWallpaper()
      changed = true
    }
  }
  catch (e) {
    console.error('Failed to save wallpaper', e)
  }
  pendingBlob.value = null
  pendingClear.value = false
  wallpaperConfig.value = { ...wallpaperDraft.value }
  if (changed) wallpaperVersion.value++
}

function save() {
  layoutConfig.value = { ...layoutDraft.value }
  saveWallpaperDraft()
}

function reset() {
  layoutDraft.value = { ...layoutConfig.value }
  wallpaperDraft.value = { ...wallpaperConfig.value }
  pendingBlob.value = null
  pendingClear.value = false
  wallpaperError.value = ''
  loadPreview()
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

    <section class="space-y-4">
      <h4 class="text-white/60 mb-4 uppercase tracking-widest text-sm font-medium">
        {{ t('generalSettings.wallpaper') }}
      </h4>
      <div
        class="settings-toggle-card"
        :class="{ active: wallpaperDraft.enabled }"
        @click="wallpaperDraft.enabled = !wallpaperDraft.enabled"
      >
        <span class="font-medium">{{ t('generalSettings.wallpaperEnabled') }}</span>
        <div class="toggle-switch">
          <div class="toggle-dot" />
        </div>
      </div>
      <video
        v-if="previewUrl && previewIsVideo"
        :src="previewUrl"
        class="h-32 w-full rounded-2xl border border-white/10 object-cover"
        autoplay
        muted
        loop
        playsinline
      />
      <div
        v-else-if="previewUrl"
        class="h-32 rounded-2xl border border-white/10 bg-cover bg-center"
        :style="{ backgroundImage: `url(${previewUrl})` }"
      />
      <div class="flex gap-3">
        <label class="settings-secondary-btn cursor-pointer">
          {{ t('generalSettings.wallpaperUpload') }}
          <input type="file" accept="image/*,video/*" class="hidden" @change="onFileChange">
        </label>
        <button v-if="previewUrl" class="settings-secondary-btn" @click="removeWallpaper">
          {{ t('generalSettings.wallpaperRemove') }}
        </button>
      </div>
      <p v-if="wallpaperError" class="text-red-400 text-sm">
        {{ wallpaperError === 'size' ? t('generalSettings.wallpaperTooLarge') : t('generalSettings.wallpaperError') }}
      </p>
      <div>
        <div class="text-white/60 text-sm mb-2">
          {{ t('generalSettings.wallpaperDim') }}
        </div>
        <input v-model.number="wallpaperDraft.dim" type="range" min="0" max="0.9" step="0.05" class="settings-range">
      </div>
      <div>
        <div class="text-white/60 text-sm mb-2">
          {{ t('generalSettings.wallpaperBlur') }}
        </div>
        <input v-model.number="wallpaperDraft.blur" type="range" min="0" max="20" step="1" class="settings-range">
      </div>
    </section>
  </div>
</template>
