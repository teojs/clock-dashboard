<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Settings, Lightbulb, LightbulbOff, Power, Fan, Tv, Zap, Loader2, RotateCw, Blinds, Snowflake, Thermometer, Droplets } from 'lucide-vue-next';
import type { HAConfig } from '../types';

const emit = defineEmits(['open-settings']);

const haConfig = ref<HAConfig>(JSON.parse(localStorage.getItem('ha_config') || '{"url":"","token":"","entities":[]}'));
const entitiesStates = ref<Record<string, any>>({});
const loadingStates = ref<Record<string, boolean>>({});
const isRefreshing = ref(false);

// 计算要在顶部标题显示的温湿度信息（取第一个空调设备的数据）
const headerClimateInfo = computed(() => {
  const climateEntity = haConfig.value.entities.find(e => e.id.startsWith('climate.'));
  if (!climateEntity) return null;
  
  const state = entitiesStates.value[climateEntity.id];
  if (!state || !state.attributes) return null;
  
  const { current_temperature, current_humidity } = state.attributes;
  if (current_temperature === undefined && current_humidity === undefined) return null;
  
  return {
    temp: current_temperature,
    humi: current_humidity
  };
});

function isEntityOn(entityId: string) {
  const state = entitiesStates.value[entityId]?.state;
  if (entityId.startsWith('cover.')) {
    return state === 'open';
  }
  if (entityId.startsWith('climate.')) {
    return state !== 'off' && state !== 'unavailable';
  }
  return state === 'on';
}

function getIcon(domain: string, isOn: boolean) {
  if (domain === 'light') return isOn ? Lightbulb : LightbulbOff;
  if (domain === 'switch') return Power;
  if (domain === 'fan') return Fan;
  if (domain === 'media_player') return Tv;
  if (domain === 'cover') return Blinds;
  if (domain === 'climate') return Snowflake;
  return Zap;
}

async function fetchEntityState(entityId: string) {
  if (!haConfig.value.url || !haConfig.value.token) return;
  try {
    const response = await fetch(`${haConfig.value.url}/api/states/${entityId}`, {
      headers: { 'Authorization': `Bearer ${haConfig.value.token}` }
    });
    const state = await response.json();
    entitiesStates.value[entityId] = state;
  } catch (e) {
    console.error('HA Fetch Error:', e);
  }
}

async function updateAllStates() {
  isRefreshing.value = true;
  // 重新从本地存储读取配置，确保获取最新添加的设备
  const savedConfig = localStorage.getItem('ha_config');
  if (savedConfig) {
    haConfig.value = JSON.parse(savedConfig);
  }

  if (!haConfig.value.url || !haConfig.value.token) {
    isRefreshing.value = false;
    return;
  }
  
  const promises = haConfig.value.entities.map(entity => fetchEntityState(entity.id));
  await Promise.all(promises);
  
  // 模拟一点延迟感，避免刷新过快没有视觉反馈
  setTimeout(() => {
    isRefreshing.value = false;
  }, 500);
}

async function toggleEntity(entityId: string) {
  const domain = entityId.split('.')[0];
  const isOn = isEntityOn(entityId);
  
  let service = '';
  if (domain === 'cover') {
    service = isOn ? 'close_cover' : 'open_cover';
  } else if (domain === 'climate') {
    service = isOn ? 'turn_off' : 'turn_on';
  } else {
    service = isOn ? 'turn_off' : 'turn_on';
  }
  
  loadingStates.value[entityId] = true;
  
  try {
    await fetch(`${haConfig.value.url}/api/services/${domain}/${service}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${haConfig.value.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ entity_id: entityId })
    });
    setTimeout(() => fetchEntityState(entityId).then(() => {
      loadingStates.value[entityId] = false;
    }), 500);
  } catch (e) {
    alert('操作失败，请检查网络和配置');
    loadingStates.value[entityId] = false;
  }
}

onMounted(() => {
  updateAllStates();
});

defineExpose({ updateAllStates, entitiesStates });
</script>

<template>
  <div class="glass-panel p-8 md:p-14 flex flex-col items-center text-white h-full justify-start overflow-y-auto w-full">
    <div class="flex items-center justify-between w-full mb-10">
      <div class="flex items-baseline gap-6">
        <h2 class="text-4xl font-bold tracking-widest text-nowrap">智能控制</h2>
        <div v-if="headerClimateInfo" class="flex items-center gap-6 opacity-60">
          <div v-if="headerClimateInfo.temp !== undefined" class="flex items-center gap-2">
            <Thermometer class="w-5 h-5 text-orange-400" />
            <span class="text-2xl font-medium tabular-nums">{{ headerClimateInfo.temp }}°</span>
          </div>
          <div v-if="headerClimateInfo.humi !== undefined" class="flex items-center gap-2">
            <Droplets class="w-5 h-5 text-blue-400" />
            <span class="text-2xl font-medium tabular-nums">{{ headerClimateInfo.humi }}%</span>
          </div>
        </div>
      </div>
      <div class="flex gap-4">
        <button 
          @click="updateAllStates" 
          class="p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all"
          :class="{ 'opacity-50 pointer-events-none': isRefreshing }"
        >
          <RotateCw class="w-8 h-8" :class="{ 'animate-spin': isRefreshing }" />
        </button>
        <button @click="emit('open-settings')" class="p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all">
          <Settings class="w-8 h-8" />
        </button>
      </div>
    </div>
    
    <div v-if="haConfig.url && haConfig.token" id="ha-entities" class="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
      <div 
        v-for="entity in haConfig.entities" 
        :key="entity.id"
        class="ha-card"
        :class="{ 'on': isEntityOn(entity.id), 'opacity-50 pointer-events-none': loadingStates[entity.id] }"
        @click="toggleEntity(entity.id)"
      >
        <div class="flex items-center justify-between w-full">
          <div class="w-12 h-12 flex items-center justify-center rounded-full transition-colors"
               :class="isEntityOn(entity.id) ? 'bg-white text-black' : 'bg-white/10 text-white'">
            <Loader2 v-if="loadingStates[entity.id]" class="w-6 h-6 animate-spin" />
            <component v-else :is="getIcon(entity.id.split('.')[0], isEntityOn(entity.id))" class="w-6 h-6" />
          </div>

          <!-- 右侧温湿度 (针对空调/climate) -->
          <div v-if="entity.id.startsWith('climate.') && entitiesStates[entity.id]?.attributes" class="flex gap-4 text-sm font-medium opacity-80">
            <div v-if="entitiesStates[entity.id].attributes.current_temperature !== undefined" class="flex items-center gap-1.5">
              <Thermometer class="w-4 h-4 text-orange-400" />
              <span class="text-base">{{ entitiesStates[entity.id].attributes.current_temperature }}°</span>
            </div>
            <div v-if="entitiesStates[entity.id].attributes.current_humidity !== undefined" class="flex items-center gap-1.5">
              <Droplets class="w-4 h-4 text-blue-400" />
              <span class="text-base">{{ entitiesStates[entity.id].attributes.current_humidity }}%</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col overflow-hidden w-full">
          <span class="font-bold text-lg truncate w-full">
            {{ entity.name || (entitiesStates[entity.id] && entitiesStates[entity.id].attributes && entitiesStates[entity.id].attributes.friendly_name) || entity.id }}
          </span>
          <span class="text-sm opacity-50 uppercase tracking-widest">
            <template v-if="entity.id.startsWith('climate.') && isEntityOn(entity.id)">
              {{ entitiesStates[entity.id]?.attributes?.temperature ? `${entitiesStates[entity.id].attributes.temperature}°C` : '已开启' }}
            </template>
            <template v-else>
              {{ isEntityOn(entity.id) ? '已开启' : '已关闭' }}
            </template>
          </span>
        </div>
      </div>
    </div>
    
    <div v-else class="col-span-full text-center py-20 opacity-50">
      <p>请点击右上角设置 Home Assistant 地址和令牌</p>
    </div>
  </div>
</template>

<style scoped>
.ha-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.ha-card.on {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.ha-card:active {
  transform: scale(0.95);
}

.glass-panel {
  max-width: 1200px;
}
</style>
